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
                column = trend.get('column', 'Unknown')
                direction = trend.get('direction', 'stable')
                time_column = trend.get('time_column', 'time')
                r_squared = trend.get('r_squared', 0)
                strength = trend.get('strength', 'unknown')
                
                prompt_parts.append(
                    f"{i}. {column} shows a {direction} trend over {time_column} "
                    f"(R² = {r_squared:.3f}, strength: {strength})"
                )
        
        # Correlations
        if correlations:
            prompt_parts.append(f"\n\n### CORRELATIONS FOUND")
            for i, corr in enumerate(correlations[:5], 1):
                column1 = corr.get('column1', 'Unknown')
                column2 = corr.get('column2', 'Unknown')
                significance = corr.get('significance', 'moderate')
                direction = corr.get('direction', 'positive')
                coefficient = corr.get('coefficient', 0)
                
                prompt_parts.append(
                    f"{i}. {column1} and {column2}: {significance} {direction} "
                    f"correlation (r = {coefficient:.3f})"
                )
        
        # Distributions
        if distributions:
            prompt_parts.append(f"\n\n### DISTRIBUTION STATISTICS")
            for i, dist in enumerate(distributions[:5], 1):
                column = dist.get('column', 'Unknown')
                mean = dist.get('mean', 0)
                median = dist.get('median', 0)
                std_dev = dist.get('std_dev', 0)
                min_val = dist.get('min', 0)
                max_val = dist.get('max', 0)
                
                prompt_parts.append(
                    f"{i}. {column}: mean = {mean:.2f}, median = {median:.2f}, "
                    f"std dev = {std_dev:.2f}, range = [{min_val:.2f}, {max_val:.2f}]"
                )
        
        # Frequencies
        if frequencies:
            prompt_parts.append(f"\n\n### CATEGORICAL DISTRIBUTIONS")
            for i, freq in enumerate(frequencies[:3], 1):
                top_cats = freq.get('top_categories', [])[:3]
                if top_cats:
                    cats_str = ", ".join([f"{cat['value']} ({cat['percentage']:.1f}%)" for cat in top_cats])
                    prompt_parts.append(
                        f"{i}. {freq['column']}: {freq.get('unique_count', 0)} unique values. "
                        f"Top categories: {cats_str}"
                    )
                else:
                    prompt_parts.append(
                        f"{i}. {freq['column']}: {freq.get('unique_count', 0)} unique values."
                    )
        
        # Outliers
        if outliers:
            prompt_parts.append(f"\n\n### OUTLIERS DETECTED")
            for i, outlier in enumerate(outliers[:3], 1):
                # Get consensus outlier info if available, otherwise use IQR method
                if 'consensus' in outlier and outlier['consensus'].get('count', 0) > 0:
                    count = outlier['consensus']['count']
                    # Get IQR bounds for context
                    iqr_method = outlier.get('methods', {}).get('iqr', {})
                    lower_bound = iqr_method.get('lower_bound', 0)
                    upper_bound = iqr_method.get('upper_bound', 0)
                    percentage = iqr_method.get('percentage', 0)
                    
                    prompt_parts.append(
                        f"{i}. {outlier['column']}: {count} outliers ({percentage:.1f}% of data) "
                        f"outside range [{lower_bound:.2f}, {upper_bound:.2f}]"
                    )
                elif 'methods' in outlier and 'iqr' in outlier['methods']:
                    iqr_method = outlier['methods']['iqr']
                    count = iqr_method.get('count', 0)
                    percentage = iqr_method.get('percentage', 0)
                    lower_bound = iqr_method.get('lower_bound', 0)
                    upper_bound = iqr_method.get('upper_bound', 0)
                    
                    prompt_parts.append(
                        f"{i}. {outlier['column']}: {count} outliers ({percentage:.1f}% of data) "
                        f"outside range [{lower_bound:.2f}, {upper_bound:.2f}]"
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
            
            # Detect section headers - be more flexible with matching
            if any(marker in line_lower for marker in ['## summary', '# summary', 'summary:', '**summary**']):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'summary'
                current_content = []
                # Skip the header line itself
                continue
            elif any(marker in line_lower for marker in ['## key findings', '# key findings', 'key findings:', '**key findings**', '## findings', '# findings']):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'keyFindings'
                current_content = []
                continue
            elif any(marker in line_lower for marker in ['## recommendations', '# recommendations', 'recommendations:', '**recommendations**', '## recommendation', '# recommendation']):
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                current_section = 'recommendations'
                current_content = []
                continue
            elif current_section and line.strip():
                # Include all non-empty lines (including those starting with #)
                current_content.append(line)
        
        # Add last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
        # Log what we found for debugging
        logger.info(f"Parsed sections - Summary: {len(sections['summary'])} chars, "
                   f"Key Findings: {len(sections['keyFindings'])} chars, "
                   f"Recommendations: {len(sections['recommendations'])} chars")
        
        # Validate all sections are present
        missing_sections = [key for key, value in sections.items() if not value]
        if missing_sections:
            # Log the full response for debugging
            logger.error(f"Missing sections: {missing_sections}")
            logger.error(f"Full response text:\n{response_text}")
            raise ValueError(f"Missing section(s): {', '.join(missing_sections)}")
        
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
                
                # Extract text from response - handle both simple and complex responses
                if not response:
                    raise ValueError("Empty response from Gemini API")
                
                # Check for safety filter blocks
                if hasattr(response, 'prompt_feedback'):
                    if hasattr(response.prompt_feedback, 'block_reason'):
                        block_reason = response.prompt_feedback.block_reason
                        if block_reason:
                            raise ValueError(f"Gemini API blocked the prompt: {block_reason}")
                
                # Check if response was blocked
                if not response.candidates or len(response.candidates) == 0:
                    raise ValueError("No candidates in Gemini API response - possibly blocked by safety filters")
                
                candidate = response.candidates[0]
                
                # Check finish reason
                if hasattr(candidate, 'finish_reason'):
                    finish_reason = str(candidate.finish_reason)
                    if 'SAFETY' in finish_reason:
                        raise ValueError(f"Response blocked by safety filters: {finish_reason}")
                    elif finish_reason not in ['STOP', '1', 'FinishReason.STOP']:
                        logger.warning(f"Unusual finish reason: {finish_reason}")
                
                try:
                    # Try simple text accessor first
                    response_text = response.text
                except Exception as e:
                    # Fall back to parts accessor for complex responses
                    logger.debug(f"Failed to get response.text: {e}, trying parts accessor")
                    if candidate.content and candidate.content.parts:
                        parts = candidate.content.parts
                        response_text = ''.join(part.text for part in parts if hasattr(part, 'text'))
                    else:
                        raise ValueError(f"No valid response content from Gemini API: {str(e)}")
                
                if not response_text or not response_text.strip():
                    raise ValueError("Empty response text from Gemini API")
                
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
        
        if summary_words < 50 or summary_words > 400:
            logger.warning(f"Summary word count ({summary_words}) outside target range (150-250)")
        
        if findings_words < 100 or findings_words > 500:
            logger.warning(f"Key findings word count ({findings_words}) outside target range (200-300)")
        
        if recommendations_words < 50 or recommendations_words > 400:
            logger.warning(f"Recommendations word count ({recommendations_words}) outside target range (150-250)")
        
        # Basic content validation - be more lenient
        if len(narratives['summary']) < 30:
            raise ValueError(f"Summary section is too short ({len(narratives['summary'])} chars)")
        
        if len(narratives['keyFindings']) < 30:
            raise ValueError(f"Key findings section is too short ({len(narratives['keyFindings'])} chars)")
        
        if len(narratives['recommendations']) < 30:
            raise ValueError(f"Recommendations section is too short ({len(narratives['recommendations'])} chars)")
        
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
