"""
Narrative generation module for DataStory AI
Uses Google Gemini API to generate business-focused narratives from statistical analysis
"""

import google.generativeai as genai
from typing import Dict, Any, Optional
import time
import logging
from config import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class NarrativeGenerator:
    """Generates AI-powered narratives from statistical analysis results"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize the narrative generator
        
        Args:
            api_key: Google Gemini API key (defaults to config)
            model: Model name (defaults to config)
        """
        self.api_key = api_key or config.GEMINI_API_KEY
        self.model_name = model or config.GEMINI_MODEL
        self.temperature = config.GEMINI_TEMPERATURE
        self.max_output_tokens = config.GEMINI_MAX_OUTPUT_TOKENS
        self.max_retries = config.GEMINI_MAX_RETRIES
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is required")
        
        # Configure Gemini
        genai.configure(api_key=self.api_key)
        
        # Initialize model with generation config
        self.generation_config = {
            "temperature": self.temperature,
            "max_output_tokens": self.max_output_tokens,
            "top_p": 0.95,
            "top_k": 40,
        }
        
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            generation_config=self.generation_config
        )
        
        logger.info(f"Initialized NarrativeGenerator with model: {self.model_name}")
    
    def _build_prompt(self, analysis: Dict[str, Any], metadata: Dict[str, Any],
                     audience_level: str = 'general') -> str:
        """
        Build structured prompt for narrative generation
        
        Args:
            analysis: Statistical analysis results
            metadata: Dataset metadata
            audience_level: Target audience ('executive', 'technical', 'general')
            
        Returns:
            Formatted prompt string
        """
        # Extract key statistics
        summary = analysis.get('summary', {})
        trends = analysis.get('trends', [])
        correlations = analysis.get('correlations', [])
        distributions = analysis.get('distributions', [])
        frequencies = analysis.get('frequencies', [])
        outliers = analysis.get('outliers', [])
        
        # Build prompt sections
        prompt_parts = []
        
        # System instruction
        system_instruction = f"""You are a data storytelling expert who transforms statistical analysis into clear, 
business-focused narratives. Your audience is {audience_level} level stakeholders who need actionable insights 
without technical jargon.

Generate a data story with exactly THREE sections:

1. SUMMARY (150-250 words): Provide an overview of the dataset and what it represents. Describe the overall 
characteristics, scope, and context of the data.

2. KEY FINDINGS (200-300 words): Highlight the 3-5 most significant insights discovered in the analysis. Focus on 
trends, patterns, correlations, and anomalies that matter for decision-making. Use specific numbers but explain 
them in business terms.

3. RECOMMENDATIONS (150-250 words): Provide actionable suggestions based on the findings. What should stakeholders 
do with these insights? Be specific and practical.

IMPORTANT RULES:
- Use clear, business-appropriate language
- Avoid technical statistical terms (no "p-value", "standard deviation" without explanation)
- All numerical claims must be accurate and based on the provided statistics
- Write in a professional but engaging tone
- Focus on "so what?" - why these insights matter
- Use specific numbers from the analysis to support claims

Format your response with clear section headers:
## Summary
[content]

## Key Findings
[content]

## Recommendations
[content]
"""
        
        prompt_parts.append(system_instruction)
        
        # Dataset overview
        prompt_parts.append(f"\n\n### DATASET OVERVIEW")
        prompt_parts.append(f"- Total rows: {summary.get('total_rows', 0)}")
        prompt_parts.append(f"- Total columns: {summary.get('total_columns', 0)}")
        prompt_parts.append(f"- Numeric columns: {summary.get('numeric_columns', 0)}")
        prompt_parts.append(f"- Categorical columns: {summary.get('categorical_columns', 0)}")
        prompt_parts.append(f"- Datetime columns: {summary.get('datetime_columns', 0)}")
        
        # Trends
        if trends:
            prompt_parts.append(f"\n\n### TRENDS DETECTED")
            for i, trend in enumerate(trends[:5], 1):
                prompt_parts.append(
                    f"{i}. {trend['column']} shows a {trend['direction']} trend over {trend['time_column']} "
                    f"(R² = {trend['r_squared']:.3f}, strength: {trend['strength']})"
                )
        
        # Correlations
        if correlations:
            prompt_parts.append(f"\n\n### CORRELATIONS FOUND")
            for i, corr in enumerate(correlations[:5], 1):
                prompt_parts.append(
                    f"{i}. {corr['column1']} and {corr['column2']}: {corr['significance']} {corr['direction']} "
                    f"correlation (r = {corr['coefficient']:.3f})"
                )
        
        # Distributions
        if distributions:
            prompt_parts.append(f"\n\n### DISTRIBUTION STATISTICS")
            for i, dist in enumerate(distributions[:5], 1):
                prompt_parts.append(
                    f"{i}. {dist['column']}: mean = {dist['mean']:.2f}, median = {dist['median']:.2f}, "
                    f"std dev = {dist['std_dev']:.2f}, range = [{dist['min']:.2f}, {dist['max']:.2f}]"
                )
        
        # Frequencies
        if frequencies:
            prompt_parts.append(f"\n\n### CATEGORICAL DISTRIBUTIONS")
            for i, freq in enumerate(frequencies[:3], 1):
                top_cats = freq.get('top_categories', [])[:3]
                cats_str = ", ".join([f"{cat['value']} ({cat['percentage']:.1f}%)" for cat in top_cats])
                prompt_parts.append(
                    f"{i}. {freq['column']}: {freq['unique_count']} unique values. "
                    f"Top categories: {cats_str}"
                )
        
        # Outliers
        if outliers:
            prompt_parts.append(f"\n\n### OUTLIERS DETECTED")
            for i, outlier in enumerate(outliers[:3], 1):
                prompt_parts.append(
                    f"{i}. {outlier['column']}: {outlier['count']} outliers ({outlier['percentage']:.1f}% of data) "
                    f"outside range [{outlier['lower_bound']:.2f}, {outlier['upper_bound']:.2f}]"
                )
        
        prompt_parts.append("\n\nNow generate the three-section narrative based on this analysis:")
        
        return "\n".join(prompt_parts)
    
    def _parse_response(self, response_text: str) -> Dict[str, str]:
        """
        Parse Gemini response into three narrative sections
        
        Args:
            response_text: Raw response from Gemini
            
        Returns:
            Dictionary with 'summary', 'keyFindings', 'recommendations' keys
        """
        sections = {
            'summary': '',
            'keyFindings': '',
            'recommendations': ''
        }
        
        # Split by section headers
        lines = response_text.split('\n')
        current_section = None
        current_content = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Detect section headers
            if '## summary' in line_lower or line_lower.startswith('summary'):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'summary'
                current_content = []
            elif '## key findings' in line_lower or line_lower.startswith('key findings'):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'keyFindings'
                current_content = []
            elif '## recommendations' in line_lower or line_lower.startswith('recommendations'):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'recommendations'
                current_content = []
            elif current_section and line.strip() and not line.startswith('#'):
                current_content.append(line)
        
        # Add last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
        # Validate all sections are present
        for key, value in sections.items():
            if not value:
                raise ValueError(f"Missing section: {key}")
        
        return sections
    
    def generate_narrative(self, analysis: Dict[str, Any], metadata: Dict[str, Any],
                          audience_level: str = 'general') -> Dict[str, str]:
        """
        Generate narrative from analysis results with retry logic
        
        Args:
            analysis: Statistical analysis results
            metadata: Dataset metadata
            audience_level: Target audience level
            
        Returns:
            Dictionary with narrative sections
            
        Raises:
            Exception: If generation fails after all retries
        """
        prompt = self._build_prompt(analysis, metadata, audience_level)
        
        last_error = None
        retry_delays = [1, 2, 4]  # Exponential backoff: 1s, 2s, 4s
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Generating narrative (attempt {attempt + 1}/{self.max_retries})")
                
                # Log prompt for debugging (truncated)
                logger.debug(f"Prompt (first 500 chars): {prompt[:500]}...")
                
                # Generate content
                response = self.model.generate_content(prompt)
                
                # Extract text from response
                if not response or not response.text:
                    raise ValueError("Empty response from Gemini API")
                
                response_text = response.text
                
                # Log response for debugging (truncated)
                logger.debug(f"Response (first 500 chars): {response_text[:500]}...")
                
                # Parse response into sections
                narratives = self._parse_response(response_text)
                
                # Validate narratives
                self._validate_narratives(narratives, analysis)
                
                logger.info("Narrative generation successful")
                
                # Log API interaction
                self._log_api_interaction(prompt, response_text, attempt + 1, success=True)
                
                return narratives
                
            except Exception as e:
                last_error = e
                logger.warning(f"Narrative generation attempt {attempt + 1} failed: {str(e)}")
                
                # Log failed interaction
                self._log_api_interaction(prompt, str(e), attempt + 1, success=False)
                
                # Wait before retry (except on last attempt)
                if attempt < self.max_retries - 1:
                    delay = retry_delays[attempt]
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
        
        # All retries failed
        error_msg = f"Narrative generation failed after {self.max_retries} attempts. Last error: {str(last_error)}"
        logger.error(error_msg)
        raise Exception(error_msg)
    
    def _validate_narratives(self, narratives: Dict[str, str], analysis: Dict[str, Any]) -> None:
        """
        Validate generated narratives against source data
        
        Args:
            narratives: Generated narrative sections
            analysis: Source statistical analysis
            
        Raises:
            ValueError: If validation fails
        """
        # Check word counts (approximate)
        summary_words = len(narratives['summary'].split())
        findings_words = len(narratives['keyFindings'].split())
        recommendations_words = len(narratives['recommendations'].split())
        
        if summary_words < 100 or summary_words > 300:
            logger.warning(f"Summary word count ({summary_words}) outside target range (150-250)")
        
        if findings_words < 150 or findings_words > 350:
            logger.warning(f"Key findings word count ({findings_words}) outside target range (200-300)")
        
        if recommendations_words < 100 or recommendations_words > 300:
            logger.warning(f"Recommendations word count ({recommendations_words}) outside target range (150-250)")
        
        # Basic content validation
        if len(narratives['summary']) < 50:
            raise ValueError("Summary section is too short")
        
        if len(narratives['keyFindings']) < 50:
            raise ValueError("Key findings section is too short")
        
        if len(narratives['recommendations']) < 50:
            raise ValueError("Recommendations section is too short")
        
        logger.info(f"Narrative validation passed (words: summary={summary_words}, "
                   f"findings={findings_words}, recommendations={recommendations_words})")
    
    def _log_api_interaction(self, prompt: str, response: str, attempt: int, 
                            success: bool) -> None:
        """
        Log Gemini API interactions for debugging and usage tracking
        
        Args:
            prompt: The prompt sent to API
            response: The response received (or error message)
            attempt: Attempt number
            success: Whether the call succeeded
        """
        log_entry = {
            'timestamp': time.time(),
            'model': self.model_name,
            'attempt': attempt,
            'success': success,
            'prompt_length': len(prompt),
            'response_length': len(response) if success else 0,
            'error': None if success else response
        }
        
        # In production, this would go to a proper logging/monitoring system
        logger.info(f"API Interaction: {log_entry}")
