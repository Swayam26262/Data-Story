"""
Tests for visualization selector
"""

import pytest
import pandas as pd
import numpy as np
from services.visualizer import VisualizationSelector


class TestVisualizationSelector:
    """Test VisualizationSelector class"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.selector = VisualizationSelector(max_charts=4)
    
    def test_create_trend_charts(self):
        """Test creation of line charts for trends"""
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=20),
            'sales': range(100, 120)
        })
        
        trends = [{
            'column': 'sales',
            'time_column': 'date',
            'direction': 'increasing',
            'slope': 1.0,
            'r_squared': 0.95,
            'strength': 'strong'
        }]
        
        charts = self.selector._create_trend_charts(df, trends)
        
        assert len(charts) > 0
        assert charts[0]['type'] == 'line'
        assert charts[0]['title'] == 'sales Over Time'
        assert 'data' in charts[0]
        assert 'x' in charts[0]['data']
        assert 'y' in charts[0]['data']
    
    def test_create_correlation_charts(self):
        """Test creation of scatter plots for correlations"""
        df = pd.DataFrame({
            'x': range(50),
            'y': [i * 2 for i in range(50)]
        })
        
        correlations = [{
            'column1': 'x',
            'column2': 'y',
            'coefficient': 0.95,
            'significance': 'strong',
            'direction': 'positive'
        }]
        
        charts = self.selector._create_correlation_charts(df, correlations)
        
        assert len(charts) > 0
        assert charts[0]['type'] == 'scatter'
        assert 'x vs y' in charts[0]['title']
    
    def test_create_categorical_charts(self):
        """Test creation of bar charts for categorical data"""
        df = pd.DataFrame({
            'category': ['A', 'B', 'C'] * 10,
            'value': range(30)
        })
        
        metadata = {
            'categorical_columns': ['category'],
            'numeric_columns': ['value']
        }
        
        analysis = {}
        
        charts = self.selector._create_categorical_charts(df, metadata, analysis)
        
        assert len(charts) > 0
        assert charts[0]['type'] == 'bar'
        assert 'categories' in charts[0]['data']
        assert 'values' in charts[0]['data']
    
    def test_create_pie_charts(self):
        """Test creation of pie charts"""
        frequencies = [{
            'column': 'category',
            'unique_count': 4,
            'top_categories': [
                {'value': 'A', 'count': 40, 'percentage': 40.0},
                {'value': 'B', 'count': 30, 'percentage': 30.0},
                {'value': 'C', 'count': 20, 'percentage': 20.0},
                {'value': 'D', 'count': 10, 'percentage': 10.0}
            ]
        }]
        
        df = pd.DataFrame()  # Not used in this method
        
        charts = self.selector._create_pie_charts(df, frequencies)
        
        assert len(charts) > 0
        assert charts[0]['type'] == 'pie'
        assert 'labels' in charts[0]['data']
        assert 'values' in charts[0]['data']
        assert len(charts[0]['data']['labels']) == 4
    
    def test_select_visualizations_limits_charts(self):
        """Test that selector limits to max_charts"""
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=50),
            'sales': range(100, 150),
            'profit': range(50, 100),
            'category': ['A', 'B', 'C'] * 16 + ['A', 'B']
        })
        
        metadata = {
            'numeric_columns': ['sales', 'profit'],
            'categorical_columns': ['category'],
            'datetime_columns': ['date']
        }
        
        analysis = {
            'trends': [
                {
                    'column': 'sales',
                    'time_column': 'date',
                    'direction': 'increasing',
                    'slope': 1.0,
                    'r_squared': 0.95,
                    'strength': 'strong'
                },
                {
                    'column': 'profit',
                    'time_column': 'date',
                    'direction': 'increasing',
                    'slope': 1.0,
                    'r_squared': 0.93,
                    'strength': 'strong'
                }
            ],
            'correlations': [
                {
                    'column1': 'sales',
                    'column2': 'profit',
                    'coefficient': 0.98,
                    'significance': 'strong',
                    'direction': 'positive'
                }
            ],
            'frequencies': []
        }
        
        charts = self.selector.select_visualizations(df, metadata, analysis)
        
        # Should not exceed max_charts
        assert len(charts) <= self.selector.max_charts
        assert len(charts) >= 3  # Should have at least 3 charts
    
    def test_generate_chart_config(self):
        """Test chart configuration generation"""
        chart = {
            'type': 'line',
            'title': 'Sales Over Time',
            'data': {'x': [1, 2, 3], 'y': [10, 20, 30]},
            'config': {'xAxis': 'date', 'yAxis': 'sales'},
            'insight': 'Sales are increasing'
        }
        
        config = self.selector.generate_chart_config(chart)
        
        assert 'chartId' in config
        assert config['type'] == 'line'
        assert config['title'] == 'Sales Over Time'
        assert config['data'] == chart['data']
        assert config['insight'] == 'Sales are increasing'
    
    def test_score_charts_diversity(self):
        """Test that scoring ensures chart type diversity"""
        charts = [
            {'type': 'line', 'score': 10},
            {'type': 'line', 'score': 9},
            {'type': 'line', 'score': 8},
            {'type': 'bar', 'score': 7},
            {'type': 'scatter', 'score': 6}
        ]
        
        analysis = {}
        
        scored = self.selector._score_charts(charts, analysis)
        
        # Should limit line charts to 2
        line_count = sum(1 for c in scored if c['type'] == 'line')
        assert line_count <= 2
