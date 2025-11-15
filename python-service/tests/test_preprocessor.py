"""
Tests for data preprocessing module
"""

import pytest
import pandas as pd
import numpy as np
from io import BytesIO
from services.preprocessor import DataPreprocessor


class TestDataPreprocessor:
    """Test DataPreprocessor class"""
    
    def setup_method(self):
        """Setup test fixtures"""
        self.preprocessor = DataPreprocessor(min_columns=2, min_rows=10)
    
    def test_validate_data_success(self):
        """Test validation with valid data"""
        df = pd.DataFrame({
            'col1': range(10),
            'col2': range(10, 20)
        })
        
        # Should not raise
        self.preprocessor.validate_data(df)
    
    def test_validate_data_insufficient_columns(self):
        """Test validation fails with insufficient columns"""
        df = pd.DataFrame({'col1': range(10)})
        
        with pytest.raises(ValueError, match="at least 2 columns"):
            self.preprocessor.validate_data(df)
    
    def test_validate_data_insufficient_rows(self):
        """Test validation fails with insufficient rows"""
        df = pd.DataFrame({
            'col1': range(5),
            'col2': range(5, 10)
        })
        
        with pytest.raises(ValueError, match="at least 10 rows"):
            self.preprocessor.validate_data(df)
    
    def test_detect_column_types_numeric(self):
        """Test numeric column detection"""
        df = pd.DataFrame({
            'numeric_int': [1, 2, 3, 4, 5],
            'numeric_float': [1.1, 2.2, 3.3, 4.4, 5.5]
        })
        
        types = self.preprocessor.detect_column_types(df)
        
        assert types['numeric_int'] == 'numeric'
        assert types['numeric_float'] == 'numeric'
    
    def test_detect_column_types_categorical(self):
        """Test categorical column detection"""
        df = pd.DataFrame({
            'category': ['A', 'B', 'A', 'C', 'B'] * 20
        })
        
        types = self.preprocessor.detect_column_types(df)
        
        assert types['category'] == 'categorical'
    
    def test_detect_column_types_datetime(self):
        """Test datetime column detection"""
        df = pd.DataFrame({
            'date': pd.date_range('2024-01-01', periods=10)
        })
        
        types = self.preprocessor.detect_column_types(df)
        
        assert types['date'] == 'datetime'
    
    def test_detect_column_types_text(self):
        """Test text column detection"""
        df = pd.DataFrame({
            'text': ['unique text ' + str(i) for i in range(100)]
        })
        
        types = self.preprocessor.detect_column_types(df)
        
        assert types['text'] == 'text'
    
    def test_handle_missing_values_numeric(self):
        """Test missing value imputation for numeric columns"""
        df = pd.DataFrame({
            'numeric': [1.0, 2.0, np.nan, 4.0, 5.0]
        })
        column_types = {'numeric': 'numeric'}
        
        df_clean = self.preprocessor.handle_missing_values(df, column_types)
        
        assert not df_clean['numeric'].isna().any()
        assert df_clean['numeric'].iloc[2] == 3.0  # Mean of 1,2,4,5
    
    def test_handle_missing_values_categorical(self):
        """Test missing value imputation for categorical columns"""
        df = pd.DataFrame({
            'category': ['A', 'B', None, 'A', 'A']
        })
        column_types = {'category': 'categorical'}
        
        df_clean = self.preprocessor.handle_missing_values(df, column_types)
        
        assert not df_clean['category'].isna().any()
        assert df_clean['category'].iloc[2] == 'A'  # Mode
    
    def test_handle_missing_values_high_percentage(self):
        """Test that columns with >30% missing are skipped"""
        df = pd.DataFrame({
            'mostly_missing': [1.0] + [np.nan] * 9
        })
        column_types = {'mostly_missing': 'numeric'}
        
        df_clean = self.preprocessor.handle_missing_values(df, column_types)
        
        # Should still have missing values
        assert df_clean['mostly_missing'].isna().sum() > 0
    
    def test_convert_types(self):
        """Test type conversion"""
        df = pd.DataFrame({
            'numeric': ['1', '2', '3'],
            'category': ['A', 'B', 'C']
        })
        column_types = {
            'numeric': 'numeric',
            'category': 'categorical'
        }
        
        df_converted = self.preprocessor.convert_types(df, column_types)
        
        assert pd.api.types.is_numeric_dtype(df_converted['numeric'])
        assert pd.api.types.is_categorical_dtype(df_converted['category'])
    
    def test_preprocess_complete_pipeline(self):
        """Test complete preprocessing pipeline with mock data"""
        # Create a sample CSV in memory
        csv_data = """date,sales,category,price
2024-01-01,100,A,10.5
2024-01-02,150,B,12.0
2024-01-03,120,A,11.0
2024-01-04,180,C,13.5
2024-01-05,200,B,14.0
2024-01-06,160,A,12.5
2024-01-07,190,C,15.0
2024-01-08,210,B,16.0
2024-01-09,170,A,13.0
2024-01-10,220,C,17.0
"""
        
        # Mock the read_file method to return our test data
        original_read = self.preprocessor.read_file
        self.preprocessor.read_file = lambda url: pd.read_csv(BytesIO(csv_data.encode()))
        
        try:
            df, metadata = self.preprocessor.preprocess('mock_url')
            
            # Verify metadata
            assert metadata['row_count'] == 10
            assert metadata['column_count'] == 4
            assert 'sales' in metadata['numeric_columns']
            assert 'price' in metadata['numeric_columns']
            assert 'category' in metadata['categorical_columns']
            assert 'date' in metadata['datetime_columns']
            
            # Verify data types
            assert pd.api.types.is_numeric_dtype(df['sales'])
            assert pd.api.types.is_datetime64_any_dtype(df['date'])
            
        finally:
            # Restore original method
            self.preprocessor.read_file = original_read
