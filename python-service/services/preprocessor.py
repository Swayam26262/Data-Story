"""
Data preprocessing module for DataStory AI
Handles file reading, type detection, and data cleaning
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
import io
import requests
from datetime import datetime


class DataPreprocessor:
    """Preprocesses uploaded datasets for analysis"""
    
    def __init__(self, min_columns: int = 2, min_rows: int = 10):
        self.min_columns = min_columns
        self.min_rows = min_rows
    
    def read_file(self, file_url: str) -> pd.DataFrame:
        """
        Read CSV or Excel file from URL
        
        Args:
            file_url: URL to the file (S3 presigned URL)
            
        Returns:
            pandas DataFrame
        """
        response = requests.get(file_url, timeout=30)
        response.raise_for_status()
        
        content = response.content
        
        # Try to determine file type from content
        try:
            # Try CSV first
            df = pd.read_csv(io.BytesIO(content))
        except Exception:
            try:
                # Try Excel
                df = pd.read_excel(io.BytesIO(content), engine='openpyxl')
            except Exception:
                try:
                    # Try older Excel format
                    df = pd.read_excel(io.BytesIO(content), engine='xlrd')
                except Exception as e:
                    raise ValueError(f"Unable to parse file. Supported formats: CSV, Excel (.xlsx, .xls)") from e
        
        return df
    
    def validate_data(self, df: pd.DataFrame) -> None:
        """
        Validate that data meets minimum requirements
        
        Args:
            df: pandas DataFrame to validate
            
        Raises:
            ValueError: If data doesn't meet requirements
        """
        if df.shape[1] < self.min_columns:
            raise ValueError(f"Dataset must contain at least {self.min_columns} columns. Found {df.shape[1]}")
        
        if df.shape[0] < self.min_rows:
            raise ValueError(f"Dataset must contain at least {self.min_rows} rows. Found {df.shape[0]}")
    
    def detect_column_types(self, df: pd.DataFrame) -> Dict[str, str]:
        """
        Automatically detect data type for each column
        
        Args:
            df: pandas DataFrame
            
        Returns:
            Dictionary mapping column names to types: 'numeric', 'categorical', 'datetime', 'text'
        """
        column_types = {}
        
        for col in df.columns:
            # Skip if all null
            if df[col].isna().all():
                column_types[col] = 'text'
                continue
            
            # Try datetime
            if self._is_datetime(df[col]):
                column_types[col] = 'datetime'
            # Try numeric
            elif pd.api.types.is_numeric_dtype(df[col]):
                column_types[col] = 'numeric'
            # Check if categorical (limited unique values)
            elif self._is_categorical(df[col]):
                column_types[col] = 'categorical'
            # Default to text
            else:
                column_types[col] = 'text'
        
        return column_types
    
    def _is_datetime(self, series: pd.Series) -> bool:
        """Check if a series can be parsed as datetime"""
        if pd.api.types.is_datetime64_any_dtype(series):
            return True
        
        # Skip if numeric type
        if pd.api.types.is_numeric_dtype(series):
            return False
        
        # Try to parse as datetime
        try:
            pd.to_datetime(series.dropna().head(100), errors='raise')
            return True
        except (ValueError, TypeError):
            return False
    
    def _is_categorical(self, series: pd.Series, threshold: float = 0.05) -> bool:
        """
        Check if a series should be treated as categorical
        
        Args:
            series: pandas Series
            threshold: Maximum ratio of unique values to total values
        """
        if pd.api.types.is_object_dtype(series):
            unique_ratio = series.nunique() / len(series)
            return unique_ratio < threshold or series.nunique() <= 20
        return False
    
    def handle_missing_values(self, df: pd.DataFrame, column_types: Dict[str, str]) -> pd.DataFrame:
        """
        Handle missing values with appropriate imputation strategies
        
        Args:
            df: pandas DataFrame
            column_types: Dictionary of column types
            
        Returns:
            DataFrame with imputed values
        """
        df_clean = df.copy()
        
        for col in df_clean.columns:
            missing_ratio = df_clean[col].isna().sum() / len(df_clean)
            
            # Skip if more than 30% missing
            if missing_ratio > 0.3:
                continue
            
            col_type = column_types.get(col, 'text')
            
            if col_type == 'numeric':
                # Use mean for numeric columns
                df_clean[col].fillna(df_clean[col].mean(), inplace=True)
            elif col_type == 'categorical':
                # Use mode for categorical columns
                mode_value = df_clean[col].mode()
                if len(mode_value) > 0:
                    df_clean[col].fillna(mode_value[0], inplace=True)
            elif col_type == 'datetime':
                # Forward fill for datetime
                df_clean[col] = df_clean[col].ffill()
            else:
                # Fill text with empty string
                df_clean[col].fillna('', inplace=True)
        
        return df_clean
    
    def convert_types(self, df: pd.DataFrame, column_types: Dict[str, str]) -> pd.DataFrame:
        """
        Convert columns to appropriate data types
        
        Args:
            df: pandas DataFrame
            column_types: Dictionary of column types
            
        Returns:
            DataFrame with converted types
        """
        df_converted = df.copy()
        
        for col, col_type in column_types.items():
            try:
                if col_type == 'numeric':
                    df_converted[col] = pd.to_numeric(df_converted[col], errors='coerce')
                elif col_type == 'datetime':
                    df_converted[col] = pd.to_datetime(df_converted[col], errors='coerce')
                elif col_type == 'categorical':
                    df_converted[col] = df_converted[col].astype('category')
            except Exception:
                # Keep original type if conversion fails
                pass
        
        return df_converted
    
    def preprocess(self, file_url: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Complete preprocessing pipeline
        
        Args:
            file_url: URL to the data file
            
        Returns:
            Tuple of (cleaned DataFrame, metadata dictionary)
        """
        # Read file
        df = self.read_file(file_url)
        
        # Validate
        self.validate_data(df)
        
        # Detect types
        column_types = self.detect_column_types(df)
        
        # Handle missing values
        df_clean = self.handle_missing_values(df, column_types)
        
        # Convert types
        df_final = self.convert_types(df_clean, column_types)
        
        # Generate metadata
        metadata = {
            'row_count': len(df_final),
            'column_count': len(df_final.columns),
            'columns': list(df_final.columns),
            'column_types': column_types,
            'missing_values': {
                col: int(df_final[col].isna().sum()) 
                for col in df_final.columns
            },
            'numeric_columns': [col for col, t in column_types.items() if t == 'numeric'],
            'categorical_columns': [col for col, t in column_types.items() if t == 'categorical'],
            'datetime_columns': [col for col, t in column_types.items() if t == 'datetime'],
            'text_columns': [col for col, t in column_types.items() if t == 'text'],
        }
        
        return df_final, metadata
