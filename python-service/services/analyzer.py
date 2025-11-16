"""
Statistical analysis engine for DataStory AI
Performs trend detection, correlation analysis, distribution analysis, etc.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from scipy import stats
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from sklearn.ensemble import IsolationForest
try:
    from statsmodels.tsa.seasonal import seasonal_decompose
    from statsmodels.stats.stattools import jarque_bera
    STATSMODELS_AVAILABLE = True
except ImportError:
    STATSMODELS_AVAILABLE = False
import warnings
warnings.filterwarnings('ignore')


class TrendDetector:
    """Identifies temporal patterns in data with advanced trend detection"""
    
    def detect_trends(self, df: pd.DataFrame, numeric_cols: List[str], 
                     datetime_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Identify trends in numeric columns over time with advanced analysis
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            datetime_cols: List of datetime column names
            
        Returns:
            List of trend analysis results with advanced metrics
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
            time_index = df_sorted[time_col][valid_mask]
            
            if len(X) < 3:
                continue
            
            # Linear trend analysis
            linear_result = self._fit_linear_trend(X, y)
            
            # Polynomial trend analysis
            polynomial_result = self._fit_polynomial_trend(X, y)
            
            # Moving averages
            moving_averages = self._calculate_moving_averages(y, time_index)
            
            # Seasonal decomposition (if enough data)
            seasonal_result = self._detect_seasonality(y, time_index)
            
            # Change point detection
            change_points = self._detect_change_points(X, y)
            
            # Year-over-year growth (if applicable)
            yoy_growth = self._calculate_yoy_growth(y, time_index)
            
            # Determine direction
            slope = linear_result['slope']
            y_std = np.std(y)
            if y_std == 0 or abs(slope) < 0.01 * max(y_std, 1):
                direction = 'stable'
            elif slope > 0:
                direction = 'increasing'
            else:
                direction = 'decreasing'
            
            trend_data = {
                'column': num_col,
                'time_column': time_col,
                'direction': direction,
                'slope': float(slope),
                'r_squared': float(linear_result['r_squared']),
                'strength': 'strong' if linear_result['r_squared'] > 0.7 else 'moderate' if linear_result['r_squared'] > 0.4 else 'weak',
                'intercept': float(linear_result['intercept']),
                'confidence_interval': linear_result['confidence_interval'],
                'polynomial': polynomial_result,
                'moving_averages': moving_averages,
                'change_points': change_points,
            }
            
            if seasonal_result:
                trend_data['seasonal'] = seasonal_result
            
            if yoy_growth:
                trend_data['yoy_growth'] = yoy_growth
            
            trends.append(trend_data)
        
        return trends
    
    def _fit_linear_trend(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Fit linear regression with confidence intervals"""
        model = LinearRegression()
        model.fit(X, y)
        
        # Predictions
        y_pred = model.predict(X)
        
        # Calculate residuals and standard error
        residuals = y - y_pred
        n = len(y)
        dof = n - 2  # degrees of freedom
        mse = np.sum(residuals ** 2) / dof
        
        # Calculate confidence intervals (95%)
        t_val = stats.t.ppf(0.975, dof)
        se = np.sqrt(mse)
        margin = t_val * se
        
        ci_lower = (y_pred - margin).tolist()
        ci_upper = (y_pred + margin).tolist()
        
        return {
            'slope': float(model.coef_[0]),
            'intercept': float(model.intercept_),
            'r_squared': float(model.score(X, y)),
            'confidence_interval': {
                'lower': ci_lower,
                'upper': ci_upper
            }
        }
    
    def _fit_polynomial_trend(self, X: np.ndarray, y: np.ndarray, degree: int = 2) -> Optional[Dict[str, Any]]:
        """Fit polynomial trend (degree 2 or 3)"""
        if len(X) < degree + 2:
            return None
        
        try:
            # Try degree 2 polynomial
            poly_features = PolynomialFeatures(degree=degree)
            X_poly = poly_features.fit_transform(X)
            
            model = LinearRegression()
            model.fit(X_poly, y)
            
            r_squared = model.score(X_poly, y)
            
            # Only return if polynomial fits significantly better than linear
            linear_model = LinearRegression()
            linear_model.fit(X, y)
            linear_r_squared = linear_model.score(X, y)
            
            if r_squared > linear_r_squared + 0.05:  # At least 5% improvement
                return {
                    'degree': degree,
                    'r_squared': float(r_squared),
                    'coefficients': model.coef_.tolist()
                }
        except Exception:
            pass
        
        return None
    
    def _calculate_moving_averages(self, y: np.ndarray, time_index: pd.Series) -> Dict[str, List[float]]:
        """Calculate moving averages for different periods"""
        moving_averages = {}
        
        # Convert to pandas Series for rolling calculations
        series = pd.Series(y, index=time_index)
        
        # Calculate for different windows (7, 30, 90 days)
        for window in [7, 30, 90]:
            if len(series) >= window:
                ma = series.rolling(window=window, min_periods=1).mean()
                moving_averages[f'{window}d'] = ma.tolist()
        
        return moving_averages
    
    def _detect_seasonality(self, y: np.ndarray, time_index: pd.Series) -> Optional[Dict[str, Any]]:
        """Detect seasonal patterns using seasonal decomposition"""
        if not STATSMODELS_AVAILABLE or len(y) < 14:  # Need at least 2 periods
            return None
        
        try:
            # Create time series
            series = pd.Series(y, index=time_index)
            
            # Infer frequency
            freq = pd.infer_freq(time_index)
            if freq is None:
                # Try to set a reasonable period based on data length
                if len(series) >= 365:
                    period = 365  # Yearly seasonality
                elif len(series) >= 30:
                    period = 30  # Monthly seasonality
                elif len(series) >= 7:
                    period = 7  # Weekly seasonality
                else:
                    return None
            else:
                # Determine period based on frequency
                if 'D' in freq:
                    period = 7  # Weekly for daily data
                elif 'W' in freq:
                    period = 4  # Monthly for weekly data
                elif 'M' in freq:
                    period = 12  # Yearly for monthly data
                else:
                    period = min(len(series) // 2, 12)
            
            # Perform seasonal decomposition
            if len(series) >= 2 * period:
                decomposition = seasonal_decompose(series, model='additive', period=period, extrapolate_trend='freq')
                
                # Calculate strength of seasonality
                seasonal_var = np.var(decomposition.seasonal.dropna())
                residual_var = np.var(decomposition.resid.dropna())
                
                if residual_var > 0:
                    seasonal_strength = seasonal_var / (seasonal_var + residual_var)
                else:
                    seasonal_strength = 0
                
                if seasonal_strength > 0.1:  # Significant seasonality
                    return {
                        'period': int(period),
                        'strength': float(seasonal_strength),
                        'pattern': decomposition.seasonal.head(period).tolist()
                    }
        except Exception:
            pass
        
        return None
    
    def _detect_change_points(self, X: np.ndarray, y: np.ndarray) -> List[Dict[str, Any]]:
        """Detect significant change points in the trend"""
        change_points = []
        
        if len(X) < 10:
            return change_points
        
        # Use sliding window to detect changes in slope
        window_size = max(5, len(X) // 10)
        
        for i in range(window_size, len(X) - window_size, window_size):
            # Fit before and after
            X_before = X[max(0, i - window_size):i]
            y_before = y[max(0, i - window_size):i]
            
            X_after = X[i:min(len(X), i + window_size)]
            y_after = y[i:min(len(y), i + window_size)]
            
            if len(X_before) < 3 or len(X_after) < 3:
                continue
            
            # Fit linear models
            model_before = LinearRegression()
            model_before.fit(X_before, y_before)
            slope_before = model_before.coef_[0]
            
            model_after = LinearRegression()
            model_after.fit(X_after, y_after)
            slope_after = model_after.coef_[0]
            
            # Check for significant change
            slope_change = abs(slope_after - slope_before)
            y_std = np.std(y)
            
            if y_std > 0 and slope_change > 0.1 * y_std:
                change_points.append({
                    'index': int(i),
                    'x_value': float(X[i][0]),
                    'y_value': float(y[i]),
                    'slope_before': float(slope_before),
                    'slope_after': float(slope_after),
                    'significance': float(slope_change / y_std)
                })
        
        # Sort by significance and return top 3
        change_points.sort(key=lambda x: x['significance'], reverse=True)
        return change_points[:3]
    
    def _calculate_yoy_growth(self, y: np.ndarray, time_index: pd.Series) -> Optional[Dict[str, Any]]:
        """Calculate year-over-year growth rates"""
        if len(y) < 365:  # Need at least a year of data
            return None
        
        try:
            series = pd.Series(y, index=time_index)
            
            # Calculate YoY growth
            yoy = series.pct_change(periods=365) * 100
            
            if yoy.notna().sum() > 0:
                return {
                    'average_growth': float(yoy.mean()),
                    'latest_growth': float(yoy.iloc[-1]) if not pd.isna(yoy.iloc[-1]) else None,
                    'max_growth': float(yoy.max()),
                    'min_growth': float(yoy.min())
                }
        except Exception:
            pass
        
        return None


class CorrelationCalculator:
    """Calculates correlations between numeric variables with statistical significance"""
    
    def __init__(self, threshold: float = 0.5, significance_level: float = 0.05):
        self.threshold = threshold
        self.significance_level = significance_level
    
    def calculate_correlations(self, df: pd.DataFrame, 
                              numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Calculate Pearson and Spearman correlation coefficients with p-values
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            List of significant correlations with statistical tests
        """
        if len(numeric_cols) < 2:
            return []
        
        correlations = []
        
        # Calculate correlation matrices
        pearson_matrix = df[numeric_cols].corr(method='pearson')
        spearman_matrix = df[numeric_cols].corr(method='spearman')
        
        # Calculate p-values for each pair
        for i, col1 in enumerate(numeric_cols):
            for j, col2 in enumerate(numeric_cols):
                if i >= j:  # Skip diagonal and duplicates
                    continue
                
                # Get valid data for this pair
                valid_data = df[[col1, col2]].dropna()
                
                if len(valid_data) < 3:
                    continue
                
                # Pearson correlation with p-value
                pearson_coef = pearson_matrix.loc[col1, col2]
                pearson_r, pearson_p = stats.pearsonr(valid_data[col1], valid_data[col2])
                
                # Spearman correlation with p-value
                spearman_coef = spearman_matrix.loc[col1, col2]
                spearman_r, spearman_p = stats.spearmanr(valid_data[col1], valid_data[col2])
                
                # Skip if both correlations are below threshold
                if abs(pearson_coef) < self.threshold and abs(spearman_coef) < self.threshold:
                    continue
                
                # Determine which correlation to use (prefer Pearson if significant)
                if pearson_p < self.significance_level:
                    primary_coef = pearson_coef
                    primary_p = pearson_p
                    primary_method = 'pearson'
                else:
                    primary_coef = spearman_coef
                    primary_p = spearman_p
                    primary_method = 'spearman'
                
                # Determine significance level
                if abs(primary_coef) > 0.7:
                    significance = 'strong'
                elif abs(primary_coef) > 0.5:
                    significance = 'moderate'
                else:
                    significance = 'weak'
                
                # Only include statistically significant correlations
                if primary_p < self.significance_level:
                    correlations.append({
                        'column1': col1,
                        'column2': col2,
                        'coefficient': float(primary_coef),
                        'p_value': float(primary_p),
                        'method': primary_method,
                        'significance': significance,
                        'direction': 'positive' if primary_coef > 0 else 'negative',
                        'pearson': {
                            'coefficient': float(pearson_coef),
                            'p_value': float(pearson_p)
                        },
                        'spearman': {
                            'coefficient': float(spearman_coef),
                            'p_value': float(spearman_p)
                        },
                        'is_significant': primary_p < self.significance_level
                    })
        
        # Sort by absolute correlation
        correlations.sort(key=lambda x: abs(x['coefficient']), reverse=True)
        
        return correlations
    
    def get_correlation_matrix(self, df: pd.DataFrame, 
                              numeric_cols: List[str]) -> Dict[str, Any]:
        """
        Generate full correlation matrix for heatmap visualization
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            Dictionary with correlation matrix and p-values
        """
        if len(numeric_cols) < 2:
            return {
                'columns': [],
                'pearson_matrix': [],
                'spearman_matrix': [],
                'p_value_matrix': []
            }
        
        # Calculate correlation matrices
        pearson_matrix = df[numeric_cols].corr(method='pearson')
        spearman_matrix = df[numeric_cols].corr(method='spearman')
        
        # Calculate p-value matrix
        n = len(numeric_cols)
        p_value_matrix = np.ones((n, n))
        
        for i, col1 in enumerate(numeric_cols):
            for j, col2 in enumerate(numeric_cols):
                if i != j:
                    valid_data = df[[col1, col2]].dropna()
                    if len(valid_data) >= 3:
                        _, p_val = stats.pearsonr(valid_data[col1], valid_data[col2])
                        p_value_matrix[i, j] = p_val
        
        return {
            'columns': numeric_cols,
            'pearson_matrix': pearson_matrix.values.tolist(),
            'spearman_matrix': spearman_matrix.values.tolist(),
            'p_value_matrix': p_value_matrix.tolist()
        }
    
    def calculate_partial_correlations(self, df: pd.DataFrame, 
                                      numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Calculate partial correlations (correlation between two variables controlling for others)
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            List of partial correlation results
        """
        if len(numeric_cols) < 3:
            return []
        
        partial_correlations = []
        
        # For each pair, calculate partial correlation controlling for all other variables
        for i, col1 in enumerate(numeric_cols):
            for j, col2 in enumerate(numeric_cols):
                if i >= j:
                    continue
                
                # Get control variables (all except col1 and col2)
                control_vars = [col for col in numeric_cols if col not in [col1, col2]]
                
                if not control_vars:
                    continue
                
                try:
                    # Calculate partial correlation
                    partial_r = self._partial_correlation(df, col1, col2, control_vars)
                    
                    if abs(partial_r) > self.threshold:
                        partial_correlations.append({
                            'column1': col1,
                            'column2': col2,
                            'partial_coefficient': float(partial_r),
                            'controlling_for': control_vars,
                            'significance': 'strong' if abs(partial_r) > 0.7 else 'moderate' if abs(partial_r) > 0.5 else 'weak'
                        })
                except Exception:
                    continue
        
        return partial_correlations
    
    def _partial_correlation(self, df: pd.DataFrame, x: str, y: str, 
                           control: List[str]) -> float:
        """Calculate partial correlation between x and y controlling for control variables"""
        # Get valid data
        cols = [x, y] + control
        valid_data = df[cols].dropna()
        
        if len(valid_data) < len(cols) + 2:
            return 0.0
        
        # Regress x on control variables
        X_control = valid_data[control].values
        x_vals = valid_data[x].values
        y_vals = valid_data[y].values
        
        model_x = LinearRegression()
        model_x.fit(X_control, x_vals)
        x_residuals = x_vals - model_x.predict(X_control)
        
        # Regress y on control variables
        model_y = LinearRegression()
        model_y.fit(X_control, y_vals)
        y_residuals = y_vals - model_y.predict(X_control)
        
        # Correlation of residuals is the partial correlation
        if len(x_residuals) > 0 and np.std(x_residuals) > 0 and np.std(y_residuals) > 0:
            partial_r, _ = stats.pearsonr(x_residuals, y_residuals)
            return partial_r
        
        return 0.0


class DistributionAnalyzer:
    """Analyzes distribution characteristics of numeric data with advanced metrics"""
    
    def analyze_distributions(self, df: pd.DataFrame, 
                            numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Calculate comprehensive distribution statistics
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            List of distribution statistics with advanced metrics
        """
        distributions = []
        
        for col in numeric_cols:
            # Skip if too many missing values
            if df[col].isna().sum() / len(df) > 0.3:
                continue
            
            data = df[col].dropna()
            
            if len(data) < 3:
                continue
            
            # Basic statistics
            basic_stats = {
                'column': col,
                'mean': float(data.mean()),
                'median': float(data.median()),
                'std_dev': float(data.std()),
                'min': float(data.min()),
                'max': float(data.max()),
                'skewness': float(stats.skew(data)),
                'kurtosis': float(stats.kurtosis(data)),
            }
            
            # Quartiles for box plots
            quartiles = self._calculate_quartiles(data)
            basic_stats.update(quartiles)
            
            # Histogram bins with optimal width
            histogram = self._calculate_histogram(data)
            basic_stats['histogram'] = histogram
            
            # Kernel density estimation
            kde = self._calculate_kde(data)
            if kde:
                basic_stats['kde'] = kde
            
            # Normality tests
            normality = self._test_normality(data)
            basic_stats['normality'] = normality
            
            distributions.append(basic_stats)
        
        return distributions
    
    def _calculate_quartiles(self, data: pd.Series) -> Dict[str, float]:
        """Calculate quartiles (Q1, Q2/median, Q3) for box plot"""
        return {
            'q1': float(data.quantile(0.25)),
            'q2': float(data.quantile(0.50)),  # median
            'q3': float(data.quantile(0.75)),
            'iqr': float(data.quantile(0.75) - data.quantile(0.25))
        }
    
    def _calculate_histogram(self, data: pd.Series, max_bins: int = 30) -> Dict[str, Any]:
        """Calculate histogram with optimal bin width"""
        # Use Freedman-Diaconis rule for bin width
        q75, q25 = np.percentile(data, [75, 25])
        iqr = q75 - q25
        
        if iqr > 0:
            bin_width = 2 * iqr / (len(data) ** (1/3))
            n_bins = int(np.ceil((data.max() - data.min()) / bin_width))
            n_bins = min(max(n_bins, 5), max_bins)  # Between 5 and max_bins
        else:
            n_bins = 10
        
        counts, bin_edges = np.histogram(data, bins=n_bins)
        
        return {
            'counts': counts.tolist(),
            'bin_edges': bin_edges.tolist(),
            'n_bins': n_bins
        }
    
    def _calculate_kde(self, data: pd.Series, n_points: int = 100) -> Optional[Dict[str, Any]]:
        """Calculate kernel density estimation for smooth distribution"""
        if len(data) < 3:
            return None
        
        try:
            from scipy.stats import gaussian_kde
            
            # Create KDE
            kde = gaussian_kde(data)
            
            # Evaluate KDE on a grid
            x_min, x_max = data.min(), data.max()
            x_range = x_max - x_min
            x_grid = np.linspace(x_min - 0.1 * x_range, x_max + 0.1 * x_range, n_points)
            y_grid = kde(x_grid)
            
            return {
                'x': x_grid.tolist(),
                'y': y_grid.tolist()
            }
        except Exception:
            return None
    
    def _test_normality(self, data: pd.Series) -> Dict[str, Any]:
        """Perform normality tests (Shapiro-Wilk, Anderson-Darling)"""
        normality_results = {}
        
        # Shapiro-Wilk test (works well for n < 5000)
        if len(data) <= 5000:
            try:
                statistic, p_value = stats.shapiro(data)
                normality_results['shapiro_wilk'] = {
                    'statistic': float(statistic),
                    'p_value': float(p_value),
                    'is_normal': p_value > 0.05
                }
            except Exception:
                pass
        
        # Anderson-Darling test
        try:
            result = stats.anderson(data, dist='norm')
            # Use 5% significance level (index 2)
            is_normal = result.statistic < result.critical_values[2]
            normality_results['anderson_darling'] = {
                'statistic': float(result.statistic),
                'critical_value_5pct': float(result.critical_values[2]),
                'is_normal': bool(is_normal)
            }
        except Exception:
            pass
        
        # Jarque-Bera test (if statsmodels available)
        if STATSMODELS_AVAILABLE:
            try:
                jb_stat, jb_pvalue, skew, kurtosis = jarque_bera(data)
                normality_results['jarque_bera'] = {
                    'statistic': float(jb_stat),
                    'p_value': float(jb_pvalue),
                    'is_normal': jb_pvalue > 0.05
                }
            except Exception:
                pass
        
        return normality_results


class OutlierDetector:
    """Detects outliers using multiple methods (IQR, Z-score, Isolation Forest)"""
    
    def detect_outliers(self, df: pd.DataFrame, 
                       numeric_cols: List[str]) -> List[Dict[str, Any]]:
        """
        Detect outliers using multiple methods
        
        Args:
            df: pandas DataFrame
            numeric_cols: List of numeric column names
            
        Returns:
            List of outlier detection results with multiple methods
        """
        outliers = []
        
        for col in numeric_cols:
            data = df[col].dropna()
            
            if len(data) < 4:
                continue
            
            # IQR method
            iqr_result = self._detect_outliers_iqr(data)
            
            # Z-score method
            zscore_result = self._detect_outliers_zscore(data)
            
            # Isolation Forest method (for larger datasets)
            isolation_result = None
            if len(data) >= 50:
                isolation_result = self._detect_outliers_isolation_forest(data)
            
            # Combine results
            outlier_result = {
                'column': col,
                'methods': {
                    'iqr': iqr_result,
                    'zscore': zscore_result
                }
            }
            
            if isolation_result:
                outlier_result['methods']['isolation_forest'] = isolation_result
            
            # Get consensus outliers (detected by at least 2 methods)
            consensus_outliers = self._get_consensus_outliers(
                iqr_result, zscore_result, isolation_result
            )
            
            if consensus_outliers['count'] > 0:
                outlier_result['consensus'] = consensus_outliers
                outliers.append(outlier_result)
        
        return outliers
    
    def _detect_outliers_iqr(self, data: pd.Series) -> Dict[str, Any]:
        """Detect outliers using Interquartile Range method"""
        q1 = data.quantile(0.25)
        q3 = data.quantile(0.75)
        iqr = q3 - q1
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outlier_mask = (data < lower_bound) | (data > upper_bound)
        outlier_indices = data[outlier_mask].index.tolist()
        outlier_values = data[outlier_mask].tolist()
        
        return {
            'method': 'iqr',
            'count': int(outlier_mask.sum()),
            'percentage': float(outlier_mask.sum() / len(data) * 100),
            'lower_bound': float(lower_bound),
            'upper_bound': float(upper_bound),
            'indices': outlier_indices[:20],  # Limit to 20
            'values': outlier_values[:20]
        }
    
    def _detect_outliers_zscore(self, data: pd.Series, threshold: float = 3.0) -> Dict[str, Any]:
        """Detect outliers using Z-score method"""
        mean = data.mean()
        std = data.std()
        
        if std == 0:
            return {
                'method': 'zscore',
                'count': 0,
                'percentage': 0.0,
                'threshold': threshold,
                'indices': [],
                'values': [],
                'zscores': []
            }
        
        zscores = np.abs((data - mean) / std)
        outlier_mask = zscores > threshold
        outlier_indices = data[outlier_mask].index.tolist()
        outlier_values = data[outlier_mask].tolist()
        outlier_zscores = zscores[outlier_mask].tolist()
        
        return {
            'method': 'zscore',
            'count': int(outlier_mask.sum()),
            'percentage': float(outlier_mask.sum() / len(data) * 100),
            'threshold': threshold,
            'indices': outlier_indices[:20],
            'values': outlier_values[:20],
            'zscores': outlier_zscores[:20]
        }
    
    def _detect_outliers_isolation_forest(self, data: pd.Series, 
                                         contamination: float = 0.1) -> Optional[Dict[str, Any]]:
        """Detect outliers using Isolation Forest algorithm"""
        try:
            # Reshape data for sklearn
            X = data.values.reshape(-1, 1)
            
            # Fit Isolation Forest
            iso_forest = IsolationForest(contamination=contamination, random_state=42)
            predictions = iso_forest.fit_predict(X)
            
            # -1 indicates outlier, 1 indicates inlier
            outlier_mask = predictions == -1
            outlier_indices = data[outlier_mask].index.tolist()
            outlier_values = data[outlier_mask].tolist()
            
            # Get anomaly scores
            scores = iso_forest.score_samples(X)
            outlier_scores = scores[outlier_mask].tolist()
            
            return {
                'method': 'isolation_forest',
                'count': int(outlier_mask.sum()),
                'percentage': float(outlier_mask.sum() / len(data) * 100),
                'contamination': contamination,
                'indices': outlier_indices[:20],
                'values': outlier_values[:20],
                'anomaly_scores': outlier_scores[:20]
            }
        except Exception:
            return None
    
    def _get_consensus_outliers(self, iqr_result: Dict, zscore_result: Dict, 
                               isolation_result: Optional[Dict]) -> Dict[str, Any]:
        """Get outliers detected by at least 2 methods"""
        # Get sets of outlier indices
        iqr_indices = set(iqr_result['indices'])
        zscore_indices = set(zscore_result['indices'])
        
        if isolation_result:
            isolation_indices = set(isolation_result['indices'])
            # Find indices detected by at least 2 methods
            consensus = (iqr_indices & zscore_indices) | \
                       (iqr_indices & isolation_indices) | \
                       (zscore_indices & isolation_indices)
        else:
            # Only have 2 methods, so consensus is intersection
            consensus = iqr_indices & zscore_indices
        
        return {
            'count': len(consensus),
            'percentage': float(len(consensus) / max(len(iqr_result['indices']) + len(zscore_result['indices']), 1) * 100),
            'indices': list(consensus)[:20]
        }


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


class InsightGenerator:
    """Generates intelligent insights from statistical analysis results"""
    
    def generate_insights(self, analysis_results: Dict[str, Any], 
                         df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Generate ranked insights from analysis results
        
        Args:
            analysis_results: Dictionary containing all analysis results
            df: Original DataFrame for additional context
            
        Returns:
            List of insights ranked by significance and impact
        """
        insights = []
        
        # Extract insights from trends
        trend_insights = self._extract_trend_insights(analysis_results.get('trends', []))
        insights.extend(trend_insights)
        
        # Extract insights from correlations
        correlation_insights = self._extract_correlation_insights(analysis_results.get('correlations', []))
        insights.extend(correlation_insights)
        
        # Extract insights from outliers
        outlier_insights = self._extract_outlier_insights(analysis_results.get('outliers', []))
        insights.extend(outlier_insights)
        
        # Extract insights from distributions
        distribution_insights = self._extract_distribution_insights(analysis_results.get('distributions', []))
        insights.extend(distribution_insights)
        
        # Rank insights by significance and impact
        ranked_insights = self._rank_insights(insights)
        
        # Return top 5 insights
        return ranked_insights[:5]
    
    def _extract_trend_insights(self, trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract insights from trend analysis"""
        insights = []
        
        for trend in trends:
            # Strong trends
            if trend.get('strength') == 'strong' and trend.get('r_squared', 0) > 0.7:
                direction = trend['direction']
                column = trend['column']
                r_squared = trend['r_squared']
                
                # Calculate significance score
                significance = r_squared
                
                # Generate description
                if direction == 'increasing':
                    description = f"{column} shows a strong upward trend with {r_squared:.1%} of variance explained by time."
                    recommendation = f"Monitor {column} for continued growth and plan for capacity accordingly."
                elif direction == 'decreasing':
                    description = f"{column} shows a strong downward trend with {r_squared:.1%} of variance explained by time."
                    recommendation = f"Investigate causes of decline in {column} and implement corrective measures."
                else:
                    continue
                
                # Check for seasonal patterns
                if 'seasonal' in trend and trend['seasonal']:
                    seasonal_strength = trend['seasonal'].get('strength', 0)
                    if seasonal_strength > 0.3:
                        description += f" Additionally, seasonal patterns detected with {seasonal_strength:.1%} strength."
                        recommendation += f" Consider seasonal adjustments in planning."
                
                # Check for change points
                if 'change_points' in trend and trend['change_points']:
                    change_point = trend['change_points'][0]
                    description += f" A significant inflection point was detected at index {change_point['index']}."
                
                insights.append({
                    'type': 'trend',
                    'title': f"Strong {direction} trend in {column}",
                    'description': description,
                    'significance': float(significance),
                    'impact': 'high' if r_squared > 0.85 else 'medium',
                    'recommendation': recommendation,
                    'related_column': column
                })
        
        return insights
    
    def _extract_correlation_insights(self, correlations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract insights from correlation analysis"""
        insights = []
        
        for corr in correlations[:3]:  # Top 3 correlations
            if abs(corr.get('coefficient', 0)) > 0.7:
                col1 = corr['column1']
                col2 = corr['column2']
                coef = corr['coefficient']
                direction = corr['direction']
                
                significance = abs(coef)
                
                if direction == 'positive':
                    description = f"{col1} and {col2} show a strong positive correlation ({coef:.2f}). When {col1} increases, {col2} tends to increase as well."
                    recommendation = f"Leverage the relationship between {col1} and {col2} for predictive modeling or joint optimization."
                else:
                    description = f"{col1} and {col2} show a strong negative correlation ({coef:.2f}). When {col1} increases, {col2} tends to decrease."
                    recommendation = f"Consider the trade-off between {col1} and {col2} in decision-making processes."
                
                insights.append({
                    'type': 'correlation',
                    'title': f"Strong {direction} correlation between {col1} and {col2}",
                    'description': description,
                    'significance': float(significance),
                    'impact': 'high' if abs(coef) > 0.85 else 'medium',
                    'recommendation': recommendation,
                    'related_columns': [col1, col2]
                })
        
        return insights
    
    def _extract_outlier_insights(self, outliers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract insights from outlier detection"""
        insights = []
        
        for outlier in outliers:
            column = outlier['column']
            
            # Check consensus outliers
            if 'consensus' in outlier and outlier['consensus']['count'] > 0:
                count = outlier['consensus']['count']
                
                # Calculate significance based on percentage
                iqr_pct = outlier['methods']['iqr'].get('percentage', 0)
                significance = min(iqr_pct / 10, 1.0)  # Normalize to 0-1
                
                if count > 2:  # Only report if multiple outliers
                    description = f"{column} contains {count} significant outliers detected by multiple methods. These values deviate substantially from the typical range."
                    recommendation = f"Investigate the {count} outlier values in {column} to determine if they represent data errors, special cases, or genuine anomalies requiring attention."
                    
                    insights.append({
                        'type': 'outlier',
                        'title': f"Anomalies detected in {column}",
                        'description': description,
                        'significance': float(significance),
                        'impact': 'high' if count > 5 else 'medium',
                        'recommendation': recommendation,
                        'related_column': column
                    })
        
        return insights
    
    def _extract_distribution_insights(self, distributions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Extract insights from distribution analysis"""
        insights = []
        
        for dist in distributions:
            column = dist['column']
            skewness = dist.get('skewness', 0)
            
            # Highly skewed distributions
            if abs(skewness) > 1.5:
                significance = min(abs(skewness) / 3, 1.0)
                
                if skewness > 0:
                    description = f"{column} has a highly right-skewed distribution (skewness: {skewness:.2f}), with most values concentrated at the lower end and a long tail of high values."
                    recommendation = f"Consider log transformation or other normalization techniques for {column} in statistical modeling."
                else:
                    description = f"{column} has a highly left-skewed distribution (skewness: {skewness:.2f}), with most values concentrated at the higher end and a long tail of low values."
                    recommendation = f"Investigate the lower tail of {column} for potential data quality issues or special cases."
                
                insights.append({
                    'type': 'distribution',
                    'title': f"Skewed distribution in {column}",
                    'description': description,
                    'significance': float(significance),
                    'impact': 'medium',
                    'recommendation': recommendation,
                    'related_column': column
                })
            
            # Check normality
            if 'normality' in dist:
                normality = dist['normality']
                is_normal = False
                
                # Check if any test indicates normality
                for test_name, test_result in normality.items():
                    if isinstance(test_result, dict) and test_result.get('is_normal'):
                        is_normal = True
                        break
                
                if not is_normal and len(insights) < 5:
                    description = f"{column} does not follow a normal distribution based on statistical tests. This may affect certain statistical analyses."
                    recommendation = f"Use non-parametric methods or appropriate transformations when analyzing {column}."
                    
                    insights.append({
                        'type': 'distribution',
                        'title': f"Non-normal distribution in {column}",
                        'description': description,
                        'significance': 0.5,
                        'impact': 'low',
                        'recommendation': recommendation,
                        'related_column': column
                    })
        
        return insights
    
    def _rank_insights(self, insights: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank insights by significance and impact"""
        # Define impact weights
        impact_weights = {
            'high': 1.0,
            'medium': 0.7,
            'low': 0.4
        }
        
        # Calculate composite score
        for insight in insights:
            significance = insight.get('significance', 0.5)
            impact = insight.get('impact', 'medium')
            impact_weight = impact_weights.get(impact, 0.5)
            
            # Composite score: 70% significance, 30% impact
            insight['score'] = 0.7 * significance + 0.3 * impact_weight
        
        # Sort by score
        insights.sort(key=lambda x: x['score'], reverse=True)
        
        return insights


class StatisticalAnalyzer:
    """Main statistical analysis engine with advanced analytics and insights"""
    
    def __init__(self, correlation_threshold: float = 0.5):
        self.trend_detector = TrendDetector()
        self.correlation_calculator = CorrelationCalculator(correlation_threshold)
        self.distribution_analyzer = DistributionAnalyzer()
        self.outlier_detector = OutlierDetector()
        self.frequency_analyzer = FrequencyAnalyzer()
        self.insight_generator = InsightGenerator()
    
    def analyze(self, df: pd.DataFrame, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform complete statistical analysis with insights
        
        Args:
            df: pandas DataFrame
            metadata: Metadata from preprocessing
            
        Returns:
            Dictionary containing all analysis results including insights
        """
        numeric_cols = metadata.get('numeric_columns', [])
        categorical_cols = metadata.get('categorical_columns', [])
        datetime_cols = metadata.get('datetime_columns', [])
        
        # Perform all analyses
        trends = self.trend_detector.detect_trends(df, numeric_cols, datetime_cols)
        correlations = self.correlation_calculator.calculate_correlations(df, numeric_cols)
        distributions = self.distribution_analyzer.analyze_distributions(df, numeric_cols)
        outliers = self.outlier_detector.detect_outliers(df, numeric_cols)
        frequencies = self.frequency_analyzer.analyze_frequencies(df, categorical_cols)
        
        # Get correlation matrix for heatmap
        correlation_matrix = self.correlation_calculator.get_correlation_matrix(df, numeric_cols)
        
        # Get partial correlations if enough variables
        partial_correlations = []
        if len(numeric_cols) >= 3:
            partial_correlations = self.correlation_calculator.calculate_partial_correlations(df, numeric_cols)
        
        results = {
            'trends': trends,
            'correlations': correlations,
            'correlation_matrix': correlation_matrix,
            'partial_correlations': partial_correlations,
            'distributions': distributions,
            'outliers': outliers,
            'frequencies': frequencies,
            'summary': {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'numeric_columns': len(numeric_cols),
                'categorical_columns': len(categorical_cols),
                'datetime_columns': len(datetime_cols)
            }
        }
        
        # Generate insights
        insights = self.insight_generator.generate_insights(results, df)
        results['insights'] = insights
        
        return results
