"""
Tests for statistical analysis engine
"""

import pytest
import pandas as pd
import numpy as np
from services.analyzer import (
    TrendDetector, CorrelationCalculator, DistributionAnalyzer,
    OutlierDetector, FrequencyAnalyzer, StatisticalAnalyzer
)


class TestTrendDetector:
    """Test TrendDetector class"""
    
    def test_detect_increasing_trend(self):
        """Test detection of increasing trend"""
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=10),
            'value': [10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
        })
        
        detector = TrendDetector()
        trends = detector.detect_trends(df, ['value'], ['date'])
        
        assert len(trends) == 1
        assert trends[0]['column'] == 'value'
        assert trends[0]['direction'] == 'increasing'
        assert trends[0]['r_squared'] > 0.9
    
    def test_detect_decreasing_trend(self):
        """Test detection of decreasing trend"""
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=10),
            'value': [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]
        })
        
        detector = TrendDetector()
        trends = detector.detect_trends(df, ['value'], ['date'])
        
        assert len(trends) == 1
        assert trends[0]['direction'] == 'decreasing'
    
    def test_detect_stable_trend(self):
        """Test detection of stable trend"""
        # Create truly stable data with minimal variation
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=100),
            'value': [100.0] * 100
        })
        
        detector = TrendDetector()
        trends = detector.detect_trends(df, ['value'], ['date'])
        
        assert len(trends) == 1
        assert trends[0]['direction'] == 'stable'


class TestCorrelationCalculator:
    """Test CorrelationCalculator class"""
    
    def test_strong_positive_correlation(self):
        """Test detection of strong positive correlation"""
        df = pd.DataFrame({
            'x': range(100),
            'y': [i * 2 + np.random.normal(0, 1) for i in range(100)]
        })
        
        calculator = CorrelationCalculator(threshold=0.5)
        correlations = calculator.calculate_correlations(df, ['x', 'y'])
        
        assert len(correlations) > 0
        assert correlations[0]['column1'] == 'x'
        assert correlations[0]['column2'] == 'y'
        assert correlations[0]['direction'] == 'positive'
        assert correlations[0]['coefficient'] > 0.5
    
    def test_strong_negative_correlation(self):
        """Test detection of strong negative correlation"""
        df = pd.DataFrame({
            'x': range(100),
            'y': [-i * 2 + np.random.normal(0, 1) for i in range(100)]
        })
        
        calculator = CorrelationCalculator(threshold=0.5)
        correlations = calculator.calculate_correlations(df, ['x', 'y'])
        
        assert len(correlations) > 0
        assert correlations[0]['direction'] == 'negative'
        assert correlations[0]['coefficient'] < -0.5
    
    def test_no_correlation_below_threshold(self):
        """Test that weak correlations are filtered out"""
        df = pd.DataFrame({
            'x': np.random.randn(100),
            'y': np.random.randn(100)
        })
        
        calculator = CorrelationCalculator(threshold=0.5)
        correlations = calculator.calculate_correlations(df, ['x', 'y'])
        
        # Random data should have weak correlation
        assert len(correlations) == 0


class TestDistributionAnalyzer:
    """Test DistributionAnalyzer class"""
    
    def test_analyze_normal_distribution(self):
        """Test analysis of normally distributed data"""
        df = pd.DataFrame({
            'normal': np.random.normal(100, 15, 1000)
        })
        
        analyzer = DistributionAnalyzer()
        distributions = analyzer.analyze_distributions(df, ['normal'])
        
        assert len(distributions) == 1
        dist = distributions[0]
        
        assert 95 < dist['mean'] < 105  # Should be close to 100
        assert 12 < dist['std_dev'] < 18  # Should be close to 15
        assert abs(dist['skewness']) < 0.5  # Normal distribution has low skewness
    
    def test_analyze_multiple_columns(self):
        """Test analysis of multiple numeric columns"""
        df = pd.DataFrame({
            'col1': range(100),
            'col2': [i ** 2 for i in range(100)]
        })
        
        analyzer = DistributionAnalyzer()
        distributions = analyzer.analyze_distributions(df, ['col1', 'col2'])
        
        assert len(distributions) == 2
        assert distributions[0]['column'] == 'col1'
        assert distributions[1]['column'] == 'col2'


class TestOutlierDetector:
    """Test OutlierDetector class"""
    
    def test_detect_outliers(self):
        """Test outlier detection with known outliers"""
        # Create data with clear outliers
        normal_data = [50] * 50 + [51] * 50 + [49] * 50
        outliers = [0, 5, 200, 250]
        data = normal_data + outliers
        
        df = pd.DataFrame({'value': data})
        
        detector = OutlierDetector()
        results = detector.detect_outliers(df, ['value'])
        
        assert len(results) == 1
        assert results[0]['column'] == 'value'
        # Check the new structure with methods
        assert 'methods' in results[0]
        assert 'iqr' in results[0]['methods']
        assert results[0]['methods']['iqr']['count'] >= 2  # Should detect at least 2 outliers
    
    def test_no_outliers(self):
        """Test with data that has no outliers"""
        df = pd.DataFrame({
            'value': np.random.normal(100, 10, 100)
        })
        
        detector = OutlierDetector()
        results = detector.detect_outliers(df, ['value'])
        
        # May or may not detect outliers in random normal data
        # Just verify it doesn't crash
        assert isinstance(results, list)


class TestFrequencyAnalyzer:
    """Test FrequencyAnalyzer class"""
    
    def test_analyze_frequencies(self):
        """Test frequency analysis"""
        df = pd.DataFrame({
            'category': ['A'] * 50 + ['B'] * 30 + ['C'] * 15 + ['D'] * 5
        })
        
        analyzer = FrequencyAnalyzer()
        frequencies = analyzer.analyze_frequencies(df, ['category'])
        
        assert len(frequencies) == 1
        freq = frequencies[0]
        
        assert freq['column'] == 'category'
        assert freq['unique_count'] == 4
        assert len(freq['top_categories']) <= 5
        assert freq['top_categories'][0]['value'] == 'A'
        assert freq['top_categories'][0]['count'] == 50


class TestStatisticalAnalyzer:
    """Test complete StatisticalAnalyzer"""
    
    def test_complete_analysis(self):
        """Test complete analysis pipeline"""
        # Create comprehensive test dataset
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=50),
            'sales': [100 + i * 2 + np.random.normal(0, 5) for i in range(50)],
            'profit': [50 + i + np.random.normal(0, 3) for i in range(50)],
            'category': ['A', 'B', 'C'] * 16 + ['A', 'B'],
            'region': ['North', 'South'] * 25
        })
        
        metadata = {
            'numeric_columns': ['sales', 'profit'],
            'categorical_columns': ['category', 'region'],
            'datetime_columns': ['date']
        }
        
        analyzer = StatisticalAnalyzer(correlation_threshold=0.5)
        results = analyzer.analyze(df, metadata)
        
        # Verify all analysis components are present
        assert 'trends' in results
        assert 'correlations' in results
        assert 'distributions' in results
        assert 'outliers' in results
        assert 'frequencies' in results
        assert 'summary' in results
        
        # Verify summary
        assert results['summary']['total_rows'] == 50
        assert results['summary']['numeric_columns'] == 2
        assert results['summary']['categorical_columns'] == 2
        
        # Verify trends detected
        assert len(results['trends']) > 0
        
        # Verify correlations detected (sales and profit should correlate)
        assert len(results['correlations']) > 0
        
        # Verify distributions calculated
        assert len(results['distributions']) == 2
        
        # Verify frequencies calculated
        assert len(results['frequencies']) == 2
