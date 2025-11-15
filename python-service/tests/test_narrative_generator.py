"""
Tests for narrative generation module
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from services.narrative_generator import NarrativeGenerator


class TestNarrativeGenerator:
    """Test NarrativeGenerator class"""
    
    @pytest.fixture
    def sample_analysis(self):
        """Sample analysis results for testing"""
        return {
            'summary': {
                'total_rows': 100,
                'total_columns': 5,
                'numeric_columns': 3,
                'categorical_columns': 2,
                'datetime_columns': 1
            },
            'trends': [
                {
                    'column': 'sales',
                    'time_column': 'date',
                    'direction': 'increasing',
                    'slope': 2.5,
                    'r_squared': 0.85,
                    'strength': 'strong'
                }
            ],
            'correlations': [
                {
                    'column1': 'sales',
                    'column2': 'profit',
                    'coefficient': 0.92,
                    'significance': 'strong',
                    'direction': 'positive'
                }
            ],
            'distributions': [
                {
                    'column': 'sales',
                    'mean': 1500.50,
                    'median': 1450.00,
                    'std_dev': 250.75,
                    'min': 800.00,
                    'max': 2500.00
                }
            ],
            'frequencies': [
                {
                    'column': 'category',
                    'unique_count': 3,
                    'top_categories': [
                        {'value': 'A', 'count': 50, 'percentage': 50.0},
                        {'value': 'B', 'count': 30, 'percentage': 30.0},
                        {'value': 'C', 'count': 20, 'percentage': 20.0}
                    ]
                }
            ],
            'outliers': [
                {
                    'column': 'sales',
                    'count': 5,
                    'percentage': 5.0,
                    'lower_bound': 500.0,
                    'upper_bound': 3000.0
                }
            ]
        }
    
    @pytest.fixture
    def sample_metadata(self):
        """Sample metadata for testing"""
        return {
            'row_count': 100,
            'column_count': 5,
            'columns': ['date', 'sales', 'profit', 'category', 'region']
        }
    
    @pytest.fixture
    def mock_gemini_response(self):
        """Mock Gemini API response"""
        return """## Summary

This dataset contains 100 rows of sales data across 5 columns, including temporal, numeric, and categorical information. The data spans multiple categories and regions, providing a comprehensive view of business performance. The dataset includes sales figures, profit margins, and categorical breakdowns that enable detailed analysis of business trends and patterns.

## Key Findings

The analysis reveals several significant insights. First, sales show a strong increasing trend over time with an R-squared value of 0.85, indicating consistent growth. The average sales figure is $1,500.50 with a median of $1,450.00, suggesting a relatively symmetric distribution. Second, there is a strong positive correlation (0.92) between sales and profit, indicating that higher sales directly translate to higher profits. Third, category A dominates the dataset with 50% of all records, followed by category B at 30% and category C at 20%. Finally, the analysis detected 5 outliers (5% of data) in sales figures, which may represent exceptional performance periods or data anomalies worth investigating.

## Recommendations

Based on these findings, several actions are recommended. First, capitalize on the strong upward sales trend by maintaining current strategies and exploring opportunities to accelerate growth. Second, focus resources on category A which represents half of all business, while also investigating why categories B and C have lower representation. Third, investigate the 5 sales outliers to understand whether they represent exceptional opportunities that can be replicated or data quality issues that need correction. Fourth, leverage the strong sales-profit correlation to forecast future profitability based on sales projections. Finally, consider expanding data collection to include additional variables that might explain the remaining variance in the trends."""
    
    def test_initialization_with_api_key(self):
        """Test initialization with API key"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key', model='gemini-1.5-flash')
                assert generator.api_key == 'test-key'
                assert generator.model_name == 'gemini-1.5-flash'
    
    def test_initialization_without_api_key(self):
        """Test initialization fails without API key"""
        with patch('config.config.GEMINI_API_KEY', None):
            with pytest.raises(ValueError, match="GEMINI_API_KEY is required"):
                NarrativeGenerator(api_key=None)
    
    def test_build_prompt(self, sample_analysis, sample_metadata):
        """Test prompt construction from analysis results"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key')
                
                prompt = generator._build_prompt(sample_analysis, sample_metadata, 'general')
                
                # Verify prompt contains key elements
                assert 'DATASET OVERVIEW' in prompt
                assert 'Total rows: 100' in prompt
                assert 'TRENDS DETECTED' in prompt
                assert 'sales shows a increasing trend' in prompt
                assert 'CORRELATIONS FOUND' in prompt
                assert 'sales and profit' in prompt
                assert 'DISTRIBUTION STATISTICS' in prompt
                assert 'mean = 1500.50' in prompt
                assert 'CATEGORICAL DISTRIBUTIONS' in prompt
                assert 'category' in prompt
                assert 'OUTLIERS DETECTED' in prompt
    
    def test_build_prompt_with_different_audience_levels(self, sample_analysis, sample_metadata):
        """Test prompt construction for different audience levels"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key')
                
                # Test executive level
                prompt_exec = generator._build_prompt(sample_analysis, sample_metadata, 'executive')
                assert 'executive level' in prompt_exec.lower()
                
                # Test technical level
                prompt_tech = generator._build_prompt(sample_analysis, sample_metadata, 'technical')
                assert 'technical level' in prompt_tech.lower()
    
    def test_parse_response_success(self, mock_gemini_response):
        """Test successful parsing of Gemini response"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key')
                
                narratives = generator._parse_response(mock_gemini_response)
                
                # Verify all sections present
                assert 'summary' in narratives
                assert 'keyFindings' in narratives
                assert 'recommendations' in narratives
                
                # Verify content
                assert 'dataset contains 100 rows' in narratives['summary'].lower()
                assert 'sales show a strong increasing trend' in narratives['keyFindings'].lower()
                assert 'capitalize on the strong upward sales trend' in narratives['recommendations'].lower()
    
    def test_parse_response_missing_section(self):
        """Test parsing fails with missing section"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key')
                
                incomplete_response = """## Summary
This is a summary.

## Key Findings
These are findings."""
                
                with pytest.raises(ValueError, match="Missing section"):
                    generator._parse_response(incomplete_response)
    
    def test_validate_narratives_success(self, sample_analysis):
        """Test narrative validation with valid content"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key')
                
                valid_narratives = {
                    'summary': ' '.join(['word'] * 200),  # 200 words
                    'keyFindings': ' '.join(['word'] * 250),  # 250 words
                    'recommendations': ' '.join(['word'] * 200)  # 200 words
                }
                
                # Should not raise exception
                generator._validate_narratives(valid_narratives, sample_analysis)
    
    def test_validate_narratives_too_short(self, sample_analysis):
        """Test narrative validation fails with too short content"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key')
                
                short_narratives = {
                    'summary': 'Too short',
                    'keyFindings': 'Also too short',
                    'recommendations': 'Way too short'
                }
                
                with pytest.raises(ValueError, match="too short"):
                    generator._validate_narratives(short_narratives, sample_analysis)
    
    @patch('google.generativeai.GenerativeModel')
    @patch('google.generativeai.configure')
    def test_generate_narrative_success(self, mock_configure, mock_model_class, 
                                       sample_analysis, sample_metadata, mock_gemini_response):
        """Test successful narrative generation"""
        # Setup mock
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = mock_gemini_response
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model
        
        generator = NarrativeGenerator(api_key='test-key')
        
        narratives = generator.generate_narrative(sample_analysis, sample_metadata)
        
        # Verify result
        assert 'summary' in narratives
        assert 'keyFindings' in narratives
        assert 'recommendations' in narratives
        assert len(narratives['summary']) > 50
        assert len(narratives['keyFindings']) > 50
        assert len(narratives['recommendations']) > 50
    
    @patch('google.generativeai.GenerativeModel')
    @patch('google.generativeai.configure')
    @patch('time.sleep')  # Mock sleep to speed up test
    def test_generate_narrative_retry_logic(self, mock_sleep, mock_configure, mock_model_class,
                                           sample_analysis, sample_metadata, mock_gemini_response):
        """Test retry logic with simulated API failures"""
        # Setup mock to fail twice then succeed
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = mock_gemini_response
        
        mock_model.generate_content.side_effect = [
            Exception("API timeout"),
            Exception("Rate limit"),
            mock_response
        ]
        mock_model_class.return_value = mock_model
        
        generator = NarrativeGenerator(api_key='test-key')
        
        narratives = generator.generate_narrative(sample_analysis, sample_metadata)
        
        # Verify it succeeded after retries
        assert 'summary' in narratives
        assert mock_model.generate_content.call_count == 3
        assert mock_sleep.call_count == 2  # Should sleep between retries
    
    @patch('google.generativeai.GenerativeModel')
    @patch('google.generativeai.configure')
    @patch('time.sleep')
    def test_generate_narrative_all_retries_fail(self, mock_sleep, mock_configure, mock_model_class,
                                                 sample_analysis, sample_metadata):
        """Test failure after all retries exhausted"""
        # Setup mock to always fail
        mock_model = MagicMock()
        mock_model.generate_content.side_effect = Exception("API error")
        mock_model_class.return_value = mock_model
        
        generator = NarrativeGenerator(api_key='test-key')
        
        with pytest.raises(Exception, match="failed after 3 attempts"):
            generator.generate_narrative(sample_analysis, sample_metadata)
        
        # Verify all retries were attempted
        assert mock_model.generate_content.call_count == 3
    
    @patch('google.generativeai.GenerativeModel')
    @patch('google.generativeai.configure')
    def test_generate_narrative_empty_response(self, mock_configure, mock_model_class,
                                               sample_analysis, sample_metadata):
        """Test handling of empty API response"""
        # Setup mock to return empty response
        mock_model = MagicMock()
        mock_response = MagicMock()
        mock_response.text = None
        mock_model.generate_content.return_value = mock_response
        mock_model_class.return_value = mock_model
        
        generator = NarrativeGenerator(api_key='test-key')
        
        with pytest.raises(Exception):
            generator.generate_narrative(sample_analysis, sample_metadata)
    
    def test_log_api_interaction(self):
        """Test API interaction logging"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                generator = NarrativeGenerator(api_key='test-key')
                
                # Should not raise exception
                generator._log_api_interaction(
                    prompt="test prompt",
                    response="test response",
                    attempt=1,
                    success=True
                )
                
                generator._log_api_interaction(
                    prompt="test prompt",
                    response="error message",
                    attempt=2,
                    success=False
                )
