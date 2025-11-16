"""
DataStory AI - Python Analysis Service
FastAPI application for statistical analysis and narrative generation
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import logging
import traceback
from pymongo import MongoClient
import numpy as np

from config import config
from services.preprocessor import DataPreprocessor
from services.analyzer import StatisticalAnalyzer
from services.visualizer import VisualizationSelector
from services.narrative_generator import NarrativeGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def convert_numpy_types(obj: Any) -> Any:
    """
    Recursively convert numpy types to native Python types for JSON serialization
    
    Args:
        obj: Object that may contain numpy types
        
    Returns:
        Object with all numpy types converted to Python types
    """
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_numpy_types(item) for item in obj)
    else:
        return obj

# Initialize FastAPI app
app = FastAPI(
    title="DataStory AI Analysis Service",
    description="Statistical analysis and AI narrative generation service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MongoDB client
mongo_client = None
jobs_collection = None

try:
    if config.MONGODB_URI:
        mongo_client = MongoClient(config.MONGODB_URI)
        db = mongo_client.get_database()
        jobs_collection = db['jobs']
        logger.info("MongoDB connection established")
except Exception as e:
    logger.warning(f"MongoDB connection failed: {e}. Job status updates will be skipped.")


# Request/Response models
class AnalyzeRequest(BaseModel):
    fileUrl: str
    userId: str
    jobId: str
    options: Optional[Dict[str, Any]] = None


class AnalyzeResponse(BaseModel):
    narratives: Dict[str, str]
    charts: list
    statistics: Dict[str, Any]


def update_job_status(job_id: str, status: str, stage: str = None, 
                     progress: int = None, error: Dict[str, Any] = None) -> None:
    """
    Update job status in MongoDB
    
    Args:
        job_id: Job identifier
        status: Job status ('processing', 'completed', 'failed')
        stage: Current processing stage
        progress: Progress percentage (0-100)
        error: Error details if failed
    """
    if jobs_collection is None:
        logger.warning("MongoDB not available, skipping job status update")
        return
    
    try:
        update_data = {
            'status': status,
            'updatedAt': None  # MongoDB will use server time
        }
        
        if stage:
            update_data['currentStage'] = stage
        
        if progress is not None:
            update_data['progress'] = progress
        
        if error:
            update_data['error'] = error
        
        jobs_collection.update_one(
            {'jobId': job_id},
            {'$set': update_data}
        )
        
        logger.info(f"Updated job {job_id}: status={status}, stage={stage}, progress={progress}")
        
    except Exception as e:
        logger.error(f"Failed to update job status: {e}")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration"""
    return {
        "status": "healthy",
        "service": "datastory-analysis",
        "version": "1.0.0"
    }


# Main analysis endpoint
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_data(request: AnalyzeRequest):
    """
    Main endpoint for data analysis and narrative generation
    
    Process flow:
    1. Download file from S3
    2. Preprocess data (type detection, cleaning)
    3. Perform statistical analysis
    4. Generate AI narrative
    5. Select and configure visualizations
    6. Return complete story payload
    """
    job_id = request.jobId
    
    try:
        logger.info(f"Starting analysis for job {job_id}")
        
        # Extract options
        options = request.options or {}
        audience_level = options.get('audienceLevel', 'general')
        
        # Stage 1: Preprocessing
        update_job_status(job_id, 'processing', 'analyzing', 10)
        logger.info(f"Stage 1: Preprocessing data from {request.fileUrl}")
        
        preprocessor = DataPreprocessor(
            min_columns=config.MIN_COLUMNS,
            min_rows=config.MIN_ROWS
        )
        
        try:
            df, metadata = preprocessor.preprocess(request.fileUrl)
            logger.info(f"Preprocessing complete: {metadata['row_count']} rows, {metadata['column_count']} columns")
        except Exception as e:
            error_detail = {
                'code': 'PREPROCESSING_ERROR',
                'message': f"Failed to preprocess data: {str(e)}",
                'timestamp': None
            }
            update_job_status(job_id, 'failed', error=error_detail)
            raise HTTPException(status_code=400, detail=error_detail['message'])
        
        # Stage 2: Statistical Analysis
        update_job_status(job_id, 'processing', 'analyzing', 30)
        logger.info("Stage 2: Performing statistical analysis")
        
        try:
            analyzer = StatisticalAnalyzer(correlation_threshold=config.CORRELATION_THRESHOLD)
            analysis = analyzer.analyze(df, metadata)
            logger.info(f"Analysis complete: {len(analysis['trends'])} trends, "
                       f"{len(analysis['correlations'])} correlations found")
        except Exception as e:
            error_detail = {
                'code': 'ANALYSIS_ERROR',
                'message': f"Statistical analysis failed: {str(e)}",
                'timestamp': None
            }
            update_job_status(job_id, 'failed', error=error_detail)
            raise HTTPException(status_code=500, detail=error_detail['message'])
        
        # Stage 3: Narrative Generation
        update_job_status(job_id, 'processing', 'generating_narrative', 50)
        logger.info("Stage 3: Generating AI narrative")
        
        try:
            narrative_gen = NarrativeGenerator()
            narratives = narrative_gen.generate_narrative(analysis, metadata, audience_level)
            logger.info("Narrative generation complete")
        except Exception as e:
            # Log detailed error information for debugging
            logger.error(f"Narrative generation failed: {str(e)}", exc_info=True)
            logger.error(f"Analysis keys: {list(analysis.keys())}")
            logger.error(f"Metadata keys: {list(metadata.keys())}")
            
            error_detail = {
                'code': 'NARRATIVE_GENERATION_ERROR',
                'message': f"Failed to generate narrative: {str(e)}",
                'timestamp': None
            }
            update_job_status(job_id, 'failed', error=error_detail)
            raise HTTPException(status_code=500, detail=error_detail['message'])
        
        # Stage 4: Visualization Selection
        update_job_status(job_id, 'processing', 'creating_visualizations', 80)
        logger.info("Stage 4: Selecting visualizations with advanced chart types")
        
        try:
            visualizer = VisualizationSelector(max_charts=6)
            chart_specs = visualizer.select_visualizations(df, metadata, analysis)
            
            # Generate final chart configurations
            charts = [visualizer.generate_chart_config(chart) for chart in chart_specs]
            logger.info(f"Visualization selection complete: {len(charts)} charts created with types: {[c['type'] for c in charts]}")
        except Exception as e:
            error_detail = {
                'code': 'VISUALIZATION_ERROR',
                'message': f"Failed to create visualizations: {str(e)}",
                'timestamp': None
            }
            update_job_status(job_id, 'failed', error=error_detail)
            raise HTTPException(status_code=500, detail=error_detail['message'])
        
        # Stage 5: Complete
        update_job_status(job_id, 'completed', progress=100)
        logger.info(f"Analysis complete for job {job_id}")
        
        # Convert numpy types to native Python types for JSON serialization
        analysis_serializable = convert_numpy_types(analysis)
        charts_serializable = convert_numpy_types(charts)
        
        # Return complete story payload
        return AnalyzeResponse(
            narratives=narratives,
            charts=charts_serializable,
            statistics=analysis_serializable
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any unexpected errors
        logger.error(f"Unexpected error in analysis: {str(e)}")
        logger.error(traceback.format_exc())
        
        error_detail = {
            'code': 'INTERNAL_ERROR',
            'message': f"An unexpected error occurred: {str(e)}",
            'timestamp': None
        }
        update_job_status(job_id, 'failed', error=error_detail)
        
        raise HTTPException(status_code=500, detail=error_detail['message'])


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
