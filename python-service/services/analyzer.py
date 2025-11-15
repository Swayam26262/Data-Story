"""
Statistical analysis engine for DataStory AI
Performs trend detection, correlation analysis, distribution analysis, etc.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any
from scipy import stats
from sklearn.linear_model import LinearRegression


class TrendDetector:
    """Identifies temporal patterns in data"""
    
    def detect_trends(self, df: pd.DataFrame, numeric_cols: List[str], 
                     datetime_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Identify trends in numeric columns over time
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            datetime_cols: List of datetime column names
            
        Returns:
            List of trend analysis results
        """
        trends = []
        
        if not datetime_cols or not numeric_cols:
            return trends
        
        # Use first datetime column as time axis
        time_col = datetime_cols[0]
        
        # Convert datetime to numeric (days since first date)
        df_sorted = df.sort_values(time_col)
        time_numeric = (df_sorted[time_col] - df_sorted[time_col].min()).dt.total_seconds() / 86400
        
        for num_col in numeric_cols:
            # Skip if too many missing values
            if df_sorted[num_col].isna().sum() / len(df_sorted) > 0.3:
                continue
            
            # Prepare data
            valid_mask = ~(df_sorted[num_col].isna() | time_numeric.isna())
            X = time_numeric[valid_mask].values.reshape(-1, 1)
            y = df_sorted[num_col][valid_mask].values
            
            if len(X) < 3:
                continue
            
            # Fit linear regression
            model = LinearRegression()
            model.fit(X, y)
            
            # Calculate R-squared
            r_squared = model.score(X, y)
            slope = model.coef_[0]
            
            # Determine direction
            y_std = np.std(y)
            if y_std == 0 or abs(slope) < 0.01 * max(y_std, 1):
                direction = 'stable'
            elif slope > 0:
                direction = 'increasing'
            else:
                direction = 'decreasing'
            
            trends.append({
                'column': num_col,
                'time_column': time_col,
                'direction': direction,
                'slope': float(slope),
                'r_squared': float(r_squared),
                'strength': 'strong' if r_squared > 0.7 else 'moderate' if r_squared > 0.4 else 'weak'
            })
        
        return trends


class CorrelationCalculator:
    """Calculates correlations between numeric variables"""
    
    def __init__(self, threshold: float = 0.5):
        self.threshold = threshold
    
    def calculate_correlations(self, df: pd.DataFrame, 
                              numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Calculate Pearson correlation coefficients
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            List of significant correlations
        """
        if len(numeric_cols) < 2:
            return []
        
        correlations = []
        
        # Calculate correlation matrix
        corr_matrix = df[numeric_cols].corr(method='pearson')
        
        # Extract significant correlations
        for i, col1 in enumerate(numeric_cols):
            for j, col2 in enumerate(numeric_cols):
                if i >= j:  # Skip diagonal and duplicates
                    continue
                
                coef = corr_matrix.loc[col1, col2]
                
                # Skip if NaN or below threshold
                if pd.isna(coef) or abs(coef) < self.threshold:
                    continue
                
                # Determine significance
                if abs(coef) > 0.7:
                    significance = 'strong'
                elif abs(coef) > 0.5:
                    significance = 'moderate'
                else:
                    significance = 'weak'
                
                correlations.append({
                    'column1': col1,
                    'column2': col2,
                    'coefficient': float(coef),
                    'significance': significance,
                    'direction': 'positive' if coef > 0 else 'negative'
                })
        
        # Sort by absolute correlation
        correlations.sort(key=lambda x: abs(x['coefficient']), reverse=True)
        
        return correlations


class DistributionAnalyzer:
    """Analyzes distribution characteristics of numeric data"""
    
    def analyze_distributions(self, df: pd.DataFrame, 
                            numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Calculate distribution statistics
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            List of distribution statistics
        """
        distributions = []
        
        for col in numeric_cols:
            # Skip if too many missing values
            if df[col].isna().sum() / len(df) > 0.3:
                continue
            
            data = df[col].dropna()
            
            if len(data) < 3:
                continue
            
            distributions.append({
                'column': col,
                'mean': float(data.mean()),
                'median': float(data.median()),
                'std_dev': float(data.std()),
                'min': float(data.min()),
                'max': float(data.max()),
                'skewness': float(stats.skew(data)),
                'kurtosis': float(stats.kurtosis(data)),
                'q25': float(data.quantile(0.25)),
                'q75': float(data.quantile(0.75))
            })
        
        return distributions


class OutlierDetector:
    """Detects outliers using IQR method"""
    
    def detect_outliers(self, df: pd.DataFrame, 
                       numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Detect outliers using interquartile range method
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            List of outlier detection results
        """
        outliers = []
        
        for col in numeric_cols:
            data = df[col].dropna()
            
            if len(data) < 4:
                continue
            
            # Calculate IQR
            q1 = data.quantile(0.25)
            q3 = data.quantile(0.75)
            iqr = q3 - q1
            
            # Define outlier bounds
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            
            # Count outliers
            outlier_mask = (data < lower_bound) | (data > upper_bound)
            outlier_count = outlier_mask.sum()
            
            if outlier_count > 0:
                outliers.append({
                    'column': col,
                    'count': int(outlier_count),
                    'percentage': float(outlier_count / len(data) * 100),
                    'lower_bound': float(lower_bound),
                    'upper_bound': float(upper_bound),
                    'outlier_values': data[outlier_mask].head(10).tolist()
                })
        
        return outliers


class FrequencyAnalyzer:
    """Analyzes frequency distributions for categorical data"""
    
    def analyze_frequencies(self, df: pd.DataFrame, 
                          categorical_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Calculate frequency distributions for categorical columns
        
        Args:
            df: pandas DataFrame
            categorical_cols: List of categorical column names
            
        Returns:
            List of frequency analysis results
        """
        frequencies = []
        
        for col in categorical_cols:
            value_counts = df[col].value_counts()
            
            # Get top 5 categories
            top_5 = value_counts.head(5)
            
            frequencies.append({
                'column': col,
                'unique_count': int(df[col].nunique()),
                'top_categories': [
                    {
                        'value': str(val),
                        'count': int(count),
                        'percentage': float(count / len(df) * 100)
                    }
                    for val, count in top_5.items()
                ],
                'total_count': int(len(df[col].dropna()))
            })
        
        return frequencies


class StatisticalAnalyzer:
    """Main statistical analysis engine"""
    
    def __init__(self, correlation_threshold: float = 0.5):
        self.trend_detector = TrendDetector()
        self.correlation_calculator = CorrelationCalculator(correlation_threshold)
        self.distribution_analyzer = DistributionAnalyzer()
        self.outlier_detector = OutlierDetector()
        self.frequency_analyzer = FrequencyAnalyzer()
    
    def analyze(self, df: pd.DataFrame, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform complete statistical analysis
        
        Args:
            df: pandas DataFrame
            metadata: Metadata from preprocessing
            
        Returns:
            Dictionary containing all analysis results
        """
        numeric_cols = metadata.get('numeric_columns', [])
        categorical_cols = metadata.get('categorical_columns', [])
        datetime_cols = metadata.get('datetime_columns', [])
        
        results = {
            'trends': self.trend_detector.detect_trends(df, numeric_cols, datetime_cols),
            'correlations': self.correlation_calculator.calculate_correlations(df, numeric_cols),
            'distributions': self.distribution_analyzer.analyze_distributions(df, numeric_cols),
            'outliers': self.outlier_detector.detect_outliers(df, numeric_cols),
            'frequencies': self.frequency_analyzer.analyze_frequencies(df, categorical_cols),
            'summary': {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'numeric_columns': len(numeric_cols),
                'categorical_columns': len(categorical_cols),
                'datetime_columns': len(datetime_cols)
            }
        }
        
        return results
