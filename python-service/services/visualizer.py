"""
Visualization selector for DataStory AI
Intelligently selects appropriate chart types based on data characteristics
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any


class VisualizationSelector:
    """Selects appropriate visualizations based on data analysis with advanced chart types"""
    
    def __init__(self, max_charts: int = 6):
        self.max_charts = max_charts
        
        # Chart type weights for diversity
        self.chart_type_weights = {
            'line': 1.0,
            'bar': 0.9,
            'scatter': 0.95,
            'pie': 0.7,
            'heatmap': 1.1,
            'boxplot': 1.0,
            'combination': 1.15,
            'waterfall': 0.95,
            'funnel': 0.85,
            'radar': 0.9,
            'area': 0.95,
            'candlestick': 0.8
        }
    
    def select_visualizations(self, df: pd.DataFrame, metadata: Dict[str, Any], 
                            analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Select 4-6 most informative visualizations with advanced chart types
        
        Args:
            df: pandas DataFrame
            metadata: Preprocessing metadata
            analysis: Statistical analysis results
            
        Returns:
            List of chart configurations with diverse chart types
        """
        charts = []
        
        # 1. Correlation heatmap (if multiple numeric columns)
        heatmap_charts = self._create_heatmap_charts(df, metadata, analysis)
        charts.extend(heatmap_charts)
        
        # 2. Box plots for distribution analysis
        boxplot_charts = self._create_boxplot_charts(df, metadata, analysis)
        charts.extend(boxplot_charts)
        
        # 3. Combination charts for multi-metric time series
        combination_charts = self._create_combination_charts(df, metadata, analysis)
        charts.extend(combination_charts)
        
        # 4. Time series charts for trends (line or area)
        trend_charts = self._create_trend_charts(df, analysis.get('trends', []))
        charts.extend(trend_charts)
        
        # 5. Scatter plots for correlations
        correlation_charts = self._create_correlation_charts(df, analysis.get('correlations', []))
        charts.extend(correlation_charts)
        
        # 6. Waterfall charts for cumulative analysis
        waterfall_charts = self._create_waterfall_charts(df, metadata, analysis)
        charts.extend(waterfall_charts)
        
        # 7. Funnel charts for conversion/stage data
        funnel_charts = self._create_funnel_charts(df, metadata, analysis)
        charts.extend(funnel_charts)
        
        # 8. Radar charts for multi-dimensional comparison
        radar_charts = self._create_radar_charts(df, metadata, analysis)
        charts.extend(radar_charts)
        
        # 9. Bar charts for categorical comparisons
        categorical_charts = self._create_categorical_charts(df, metadata, analysis)
        charts.extend(categorical_charts)
        
        # 10. Pie charts for proportional data
        pie_charts = self._create_pie_charts(df, analysis.get('frequencies', []))
        charts.extend(pie_charts)
        
        # Score and rank charts by informativeness and diversity
        scored_charts = self._score_and_rank_charts(charts, analysis)
        
        # Select top charts (4-6) with diversity
        selected = self._select_diverse_charts(scored_charts)
        
        return selected
    
    def _create_heatmap_charts(self, df: pd.DataFrame, metadata: Dict[str, Any],
                              analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create heatmap for correlation matrices"""
        charts = []
        
        numeric_cols = metadata.get('numeric_columns', [])
        correlation_matrix = analysis.get('correlation_matrix', {})
        
        # Only create heatmap if we have 3+ numeric columns
        if len(numeric_cols) < 3:
            return charts
        
        matrix = correlation_matrix.get('pearson_matrix', [])
        columns = correlation_matrix.get('columns', [])
        
        if not matrix or not columns:
            return charts
        
        # Format data for heatmap
        chart_data = []
        for i, row_label in enumerate(columns):
            for j, col_label in enumerate(columns):
                if i < len(matrix) and j < len(matrix[i]):
                    chart_data.append({
                        'x': col_label,
                        'y': row_label,
                        'value': float(matrix[i][j])
                    })
        
        charts.append({
            'type': 'heatmap',
            'title': 'Correlation Matrix',
            'data': chart_data,
            'config': {
                'xLabels': columns,
                'yLabels': columns,
                'colorScale': 'diverging',
                'minValue': -1,
                'maxValue': 1,
                'colors': ['#ef4444', '#fbbf24', '#10b981']
            },
            'insight': 'Correlation heatmap showing relationships between all numeric variables',
            'score': 9.0,  # High score for comprehensive view
            'data_characteristics': {
                'num_variables': len(columns),
                'has_strong_correlations': any(
                    abs(matrix[i][j]) > 0.7 
                    for i in range(len(matrix)) 
                    for j in range(len(matrix[i])) 
                    if i != j
                )
            }
        })
        
        return charts
    
    def _create_boxplot_charts(self, df: pd.DataFrame, metadata: Dict[str, Any],
                              analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create box plots for distribution analysis"""
        charts = []
        
        distributions = analysis.get('distributions', [])
        outliers = analysis.get('outliers', [])
        categorical_cols = metadata.get('categorical_columns', [])
        
        # Create box plots for distributions with outliers
        outlier_cols = {o['column'] for o in outliers if o.get('consensus', {}).get('count', 0) > 0}
        
        for dist in distributions[:2]:  # Max 2 box plots
            col = dist['column']
            
            # Prioritize columns with outliers
            if col not in outlier_cols and len(charts) > 0:
                continue
            
            # Get data
            data = df[col].dropna()
            
            if len(data) < 5:
                continue
            
            # Calculate box plot statistics
            q1 = dist.get('q1', data.quantile(0.25))
            q2 = dist.get('q2', data.quantile(0.50))
            q3 = dist.get('q3', data.quantile(0.75))
            iqr = dist.get('iqr', q3 - q1)
            
            # Find outliers
            lower_bound = q1 - 1.5 * iqr
            upper_bound = q3 + 1.5 * iqr
            outlier_values = data[(data < lower_bound) | (data > upper_bound)].tolist()
            
            # Format data
            chart_data = [{
                'name': col,
                'min': float(max(data.min(), lower_bound)),
                'q1': float(q1),
                'median': float(q2),
                'q3': float(q3),
                'max': float(min(data.max(), upper_bound)),
                'outliers': [float(v) for v in outlier_values[:20]]  # Limit outliers
            }]
            
            # If we have categorical column, create grouped box plot
            if categorical_cols and len(categorical_cols) > 0:
                cat_col = categorical_cols[0]
                if df[cat_col].nunique() <= 6:  # Max 6 groups
                    chart_data = []
                    for category in df[cat_col].unique():
                        cat_data = df[df[cat_col] == category][col].dropna()
                        if len(cat_data) >= 5:
                            q1_cat = cat_data.quantile(0.25)
                            q2_cat = cat_data.quantile(0.50)
                            q3_cat = cat_data.quantile(0.75)
                            iqr_cat = q3_cat - q1_cat
                            lower_cat = q1_cat - 1.5 * iqr_cat
                            upper_cat = q3_cat + 1.5 * iqr_cat
                            outliers_cat = cat_data[(cat_data < lower_cat) | (cat_data > upper_cat)].tolist()
                            
                            chart_data.append({
                                'name': str(category),
                                'min': float(max(cat_data.min(), lower_cat)),
                                'q1': float(q1_cat),
                                'median': float(q2_cat),
                                'q3': float(q3_cat),
                                'max': float(min(cat_data.max(), upper_cat)),
                                'outliers': [float(v) for v in outliers_cat[:10]]
                            })
            
            score = 8.0
            if col in outlier_cols:
                score += 1.0  # Boost score if outliers present
            
            charts.append({
                'type': 'boxplot',
                'title': f'Distribution of {col}' + (f' by {cat_col}' if len(chart_data) > 1 else ''),
                'data': chart_data,
                'config': {
                    'orientation': 'vertical',
                    'showOutliers': True,
                    'colors': ['#3b82f6']
                },
                'insight': f'Box plot showing distribution and outliers in {col}',
                'score': score,
                'data_characteristics': {
                    'has_outliers': len(outlier_values) > 0,
                    'skewness': dist.get('skewness', 0)
                }
            })
        
        return charts
    
    def _create_combination_charts(self, df: pd.DataFrame, metadata: Dict[str, Any],
                                  analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create combination charts for multi-metric time series"""
        charts = []
        
        datetime_cols = metadata.get('datetime_columns', [])
        numeric_cols = metadata.get('numeric_columns', [])
        trends = analysis.get('trends', [])
        
        # Need time column and multiple numeric columns
        if not datetime_cols or len(numeric_cols) < 2:
            return charts
        
        time_col = datetime_cols[0]
        
        # Find metrics with different scales (good candidates for dual axis)
        metrics_with_trends = [t['column'] for t in trends if t.get('strength') in ['strong', 'moderate']]
        
        if len(metrics_with_trends) >= 2:
            # Select two metrics with different scales
            metric1 = metrics_with_trends[0]
            metric2 = metrics_with_trends[1]
            
            # Check if scales are significantly different
            scale1 = df[metric1].std()
            scale2 = df[metric2].std()
            
            if scale1 > 0 and scale2 > 0:
                scale_ratio = max(scale1, scale2) / min(scale1, scale2)
                
                if scale_ratio > 3:  # Different enough scales
                    # Prepare data
                    df_sorted = df[[time_col, metric1, metric2]].dropna().sort_values(time_col)
                    
                    chart_data = []
                    for _, row in df_sorted.iterrows():
                        chart_data.append({
                            time_col: row[time_col].strftime('%Y-%m-%d'),
                            metric1: float(row[metric1]),
                            metric2: float(row[metric2])
                        })
                    
                    charts.append({
                        'type': 'combination',
                        'title': f'{metric1} and {metric2} Over Time',
                        'data': chart_data,
                        'config': {
                            'xAxis': time_col,
                            'series': [
                                {
                                    'type': 'line',
                                    'dataKey': metric1,
                                    'yAxisId': 'left',
                                    'color': '#3b82f6'
                                },
                                {
                                    'type': 'bar',
                                    'dataKey': metric2,
                                    'yAxisId': 'right',
                                    'color': '#10b981'
                                }
                            ]
                        },
                        'insight': f'Combined view of {metric1} and {metric2} trends with dual axes',
                        'score': 9.5,  # High score for multi-metric insights
                        'data_characteristics': {
                            'num_metrics': 2,
                            'scale_ratio': float(scale_ratio)
                        }
                    })
        
        return charts
    
    def _create_waterfall_charts(self, df: pd.DataFrame, metadata: Dict[str, Any],
                                analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create waterfall charts for cumulative analysis"""
        charts = []
        
        numeric_cols = metadata.get('numeric_columns', [])
        categorical_cols = metadata.get('categorical_columns', [])
        
        # Waterfall works well for showing contributions to a total
        # Look for data with positive and negative values
        for num_col in numeric_cols[:1]:  # Max 1 waterfall
            data = df[num_col].dropna()
            
            # Check if we have both positive and negative values
            has_positive = (data > 0).any()
            has_negative = (data < 0).any()
            
            if not (has_positive and has_negative):
                continue
            
            # If we have a categorical column, use it for breakdown
            if categorical_cols:
                cat_col = categorical_cols[0]
                if df[cat_col].nunique() <= 8:  # Max 8 categories
                    grouped = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False)
                    
                    if len(grouped) >= 3:
                        chart_data = []
                        cumulative = 0
                        
                        for i, (category, value) in enumerate(grouped.items()):
                            chart_data.append({
                                'name': str(category),
                                'value': float(value),
                                'start': float(cumulative),
                                'end': float(cumulative + value),
                                'isTotal': False
                            })
                            cumulative += value
                        
                        # Add total
                        chart_data.append({
                            'name': 'Total',
                            'value': float(cumulative),
                            'start': 0,
                            'end': float(cumulative),
                            'isTotal': True
                        })
                        
                        charts.append({
                            'type': 'waterfall',
                            'title': f'Cumulative {num_col} by {cat_col}',
                            'data': chart_data,
                            'config': {
                                'showConnectors': True,
                                'positiveColor': '#10b981',
                                'negativeColor': '#ef4444',
                                'totalColor': '#3b82f6'
                            },
                            'insight': f'Waterfall showing cumulative contribution of each {cat_col} to total {num_col}',
                            'score': 7.5,
                            'data_characteristics': {
                                'num_categories': len(grouped),
                                'has_negatives': has_negative
                            }
                        })
        
        return charts
    
    def _create_funnel_charts(self, df: pd.DataFrame, metadata: Dict[str, Any],
                            analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create funnel charts for conversion/stage data"""
        charts = []
        
        # Funnel charts work well for sequential stages with decreasing values
        # Look for columns that suggest stages or conversion (e.g., "stage", "step", "phase")
        categorical_cols = metadata.get('categorical_columns', [])
        numeric_cols = metadata.get('numeric_columns', [])
        
        for cat_col in categorical_cols:
            col_lower = cat_col.lower()
            # Check if column name suggests stages
            if any(keyword in col_lower for keyword in ['stage', 'step', 'phase', 'funnel', 'level']):
                if df[cat_col].nunique() >= 3 and df[cat_col].nunique() <= 7:
                    # Count occurrences at each stage
                    stage_counts = df[cat_col].value_counts().sort_index()
                    
                    # Check if values are generally decreasing (funnel pattern)
                    values = stage_counts.values
                    is_decreasing = all(values[i] >= values[i+1] * 0.7 for i in range(len(values)-1))
                    
                    if is_decreasing or len(charts) == 0:
                        chart_data = []
                        for stage, count in stage_counts.items():
                            chart_data.append({
                                'name': str(stage),
                                'value': int(count)
                            })
                        
                        charts.append({
                            'type': 'funnel',
                            'title': f'Funnel Analysis: {cat_col}',
                            'data': chart_data,
                            'config': {
                                'showPercentages': True,
                                'colors': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
                            },
                            'insight': f'Funnel showing progression through {cat_col} stages',
                            'score': 7.0 if is_decreasing else 5.0,
                            'data_characteristics': {
                                'num_stages': len(stage_counts),
                                'is_decreasing': is_decreasing
                            }
                        })
                        break
        
        return charts
    
    def _create_radar_charts(self, df: pd.DataFrame, metadata: Dict[str, Any],
                           analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create radar charts for multi-dimensional comparison"""
        charts = []
        
        numeric_cols = metadata.get('numeric_columns', [])
        categorical_cols = metadata.get('categorical_columns', [])
        
        # Radar charts work well for comparing multiple metrics across categories
        # Need 3+ numeric columns and a categorical column with 2-5 categories
        if len(numeric_cols) < 3 or not categorical_cols:
            return charts
        
        cat_col = categorical_cols[0]
        num_categories = df[cat_col].nunique()
        
        if num_categories < 2 or num_categories > 5:
            return charts
        
        # Select up to 6 numeric columns for dimensions
        selected_metrics = numeric_cols[:6]
        
        # Calculate mean for each metric by category
        chart_data = []
        for category in df[cat_col].unique():
            cat_data = df[df[cat_col] == category][selected_metrics].mean()
            
            # Normalize to 0-100 scale for better visualization
            normalized_data = {}
            for metric in selected_metrics:
                col_min = df[metric].min()
                col_max = df[metric].max()
                if col_max > col_min:
                    normalized_value = (cat_data[metric] - col_min) / (col_max - col_min) * 100
                else:
                    normalized_value = 50
                normalized_data[metric] = float(normalized_value)
            
            chart_data.append({
                'category': str(category),
                **normalized_data
            })
        
        charts.append({
            'type': 'radar',
            'title': f'Multi-Metric Comparison by {cat_col}',
            'data': chart_data,
            'config': {
                'dimensions': selected_metrics,
                'categoryKey': 'category',
                'colors': ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
            },
            'insight': f'Radar chart comparing {len(selected_metrics)} metrics across {cat_col} categories',
            'score': 7.5,
            'data_characteristics': {
                'num_dimensions': len(selected_metrics),
                'num_categories': num_categories
            }
        })
        
        return charts
    
    def _create_trend_charts(self, df: pd.DataFrame, 
                           trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create line or area charts for temporal trends"""
        charts = []
        
        # Select strongest trends
        strong_trends = [t for t in trends if t.get('strength') in ['strong', 'moderate']]
        strong_trends.sort(key=lambda x: x.get('r_squared', 0), reverse=True)
        
        for i, trend in enumerate(strong_trends[:2]):  # Max 2 trend charts
            time_col = trend['time_column']
            value_col = trend['column']
            
            # Prepare data
            df_sorted = df[[time_col, value_col]].dropna().sort_values(time_col)
            
            # Format as array of objects for frontend
            chart_data = []
            for _, row in df_sorted.iterrows():
                chart_data.append({
                    time_col: row[time_col].strftime('%Y-%m-%d'),
                    value_col: float(row[value_col])
                })
            
            # Use area chart for first trend if it's positive, line for others
            chart_type = 'area' if i == 0 and trend['direction'] == 'increasing' else 'line'
            
            # Check for seasonal patterns
            has_seasonal = 'seasonal' in trend and trend['seasonal']
            
            charts.append({
                'type': chart_type,
                'title': f'{value_col} Over Time',
                'data': chart_data,
                'config': {
                    'xAxis': time_col,
                    'yAxis': value_col,
                    'showTrendLine': True,
                    'colors': ['#3b82f6'],
                    'fillOpacity': 0.3 if chart_type == 'area' else 0
                },
                'insight': f'{value_col} shows a {trend["direction"]} trend over time' + 
                          (' with seasonal patterns' if has_seasonal else ''),
                'score': trend.get('r_squared', 0) * 10,
                'data_characteristics': {
                    'r_squared': trend.get('r_squared', 0),
                    'has_seasonal': has_seasonal,
                    'direction': trend['direction']
                }
            })
        
        return charts
    
    def _create_correlation_charts(self, df: pd.DataFrame, 
                                  correlations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create scatter plots for correlations"""
        charts = []
        
        # Select strongest correlations
        strong_corr = [c for c in correlations if c.get('significance') in ['strong', 'moderate']]
        strong_corr.sort(key=lambda x: abs(x.get('coefficient', 0)), reverse=True)
        
        for corr in strong_corr[:2]:  # Max 2 correlation charts
            col1 = corr['column1']
            col2 = corr['column2']
            
            # Prepare data
            df_clean = df[[col1, col2]].dropna()
            
            # Format as array of objects for frontend
            chart_data = []
            for _, row in df_clean.iterrows():
                chart_data.append({
                    col1: float(row[col1]),
                    col2: float(row[col2])
                })
            
            charts.append({
                'type': 'scatter',
                'title': f'{col1} vs {col2}',
                'data': chart_data,
                'config': {
                    'xAxis': col1,
                    'yAxis': col2,
                    'showTrendLine': True,
                    'colors': ['#8b5cf6']
                },
                'insight': f'{col1} and {col2} show a {corr["significance"]} {corr["direction"]} correlation',
                'score': abs(corr.get('coefficient', 0)) * 10
            })
        
        return charts
    
    def _create_categorical_charts(self, df: pd.DataFrame, metadata: Dict[str, Any],
                                  analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create bar charts for categorical data"""
        charts = []
        
        categorical_cols = metadata.get('categorical_columns', [])
        numeric_cols = metadata.get('numeric_columns', [])
        
        if not categorical_cols or not numeric_cols:
            return charts
        
        # Find best categorical-numeric pairs
        for cat_col in categorical_cols[:2]:  # Max 2 categorical charts
            # Skip if too many categories
            if df[cat_col].nunique() > 10:
                continue
            
            # Use first numeric column for aggregation
            num_col = numeric_cols[0]
            
            # Calculate mean by category
            grouped = df.groupby(cat_col)[num_col].mean().sort_values(ascending=False)
            
            if len(grouped) < 2:
                continue
            
            # Format as array of objects for frontend
            chart_data = []
            for category, value in grouped.items():
                chart_data.append({
                    cat_col: str(category),
                    num_col: float(value)
                })
            
            charts.append({
                'type': 'bar',
                'title': f'Average {num_col} by {cat_col}',
                'data': chart_data,
                'config': {
                    'xAxis': cat_col,
                    'yAxis': num_col,
                    'orientation': 'vertical',
                    'colors': ['#10b981']
                },
                'insight': f'Comparison of {num_col} across different {cat_col} categories',
                'score': 7.0
            })
        
        return charts
    
    def _create_pie_charts(self, df: pd.DataFrame, 
                          frequencies: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create pie charts for proportional data"""
        charts = []
        
        for freq in frequencies[:1]:  # Max 1 pie chart
            col = freq['column']
            top_cats = freq.get('top_categories', [])
            
            # Only create pie chart if 3-7 categories
            if not (3 <= len(top_cats) <= 7):
                continue
            
            # Format as array of objects for frontend
            chart_data = []
            for cat in top_cats:
                chart_data.append({
                    'name': str(cat['value']),
                    'value': int(cat['count'])
                })
            
            charts.append({
                'type': 'pie',
                'title': f'Distribution of {col}',
                'data': chart_data,
                'config': {
                    'nameKey': 'name',
                    'valueKey': 'value',
                    'colors': ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1']
                },
                'insight': f'Proportional breakdown of {col} categories',
                'score': 6.0
            })
        
        return charts
    
    def _score_and_rank_charts(self, charts: List[Dict[str, Any]], 
                              analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Score charts by informativeness, insight quality, and data characteristics
        
        Args:
            charts: List of chart configurations
            analysis: Statistical analysis results
            
        Returns:
            Sorted list of charts by composite score
        """
        insights = analysis.get('insights', [])
        
        for chart in charts:
            base_score = chart.get('score', 5.0)
            
            # Apply chart type weight
            chart_type = chart['type']
            type_weight = self.chart_type_weights.get(chart_type, 1.0)
            
            # Boost score if chart relates to top insights
            insight_boost = 0
            chart_cols = self._get_chart_columns(chart)
            for insight in insights[:3]:  # Top 3 insights
                insight_cols = self._get_insight_columns(insight)
                if chart_cols & insight_cols:  # Intersection
                    insight_boost += insight.get('significance', 0) * 2
            
            # Boost score based on data characteristics
            data_char = chart.get('data_characteristics', {})
            char_boost = 0
            
            if data_char.get('has_outliers'):
                char_boost += 0.5
            if data_char.get('has_strong_correlations'):
                char_boost += 1.0
            if data_char.get('has_seasonal'):
                char_boost += 0.5
            if data_char.get('is_decreasing'):  # For funnels
                char_boost += 0.5
            
            # Calculate composite score
            composite_score = (base_score * type_weight) + insight_boost + char_boost
            chart['composite_score'] = composite_score
        
        # Sort by composite score
        charts.sort(key=lambda x: x.get('composite_score', 0), reverse=True)
        
        return charts
    
    def _select_diverse_charts(self, scored_charts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Select diverse set of charts ensuring variety in chart types
        
        Args:
            scored_charts: Charts sorted by score
            
        Returns:
            Selected charts (4-6) with diversity
        """
        selected = []
        type_counts = {}
        
        # Priority selection: ensure we have at least one of key chart types
        priority_types = ['heatmap', 'combination', 'boxplot']
        
        # First pass: select priority charts
        for chart in scored_charts:
            chart_type = chart['type']
            if chart_type in priority_types and chart_type not in type_counts:
                selected.append(chart)
                type_counts[chart_type] = 1
                priority_types.remove(chart_type)
        
        # Second pass: fill remaining slots with highest scoring charts
        for chart in scored_charts:
            if chart in selected:
                continue
            
            chart_type = chart['type']
            
            # Limit each type to 2 charts
            if type_counts.get(chart_type, 0) >= 2:
                continue
            
            selected.append(chart)
            type_counts[chart_type] = type_counts.get(chart_type, 0) + 1
            
            # Stop if we have enough charts
            if len(selected) >= self.max_charts:
                break
        
        # Sort selected charts by score for final ordering
        selected.sort(key=lambda x: x.get('composite_score', 0), reverse=True)
        
        # Ensure we have 4-6 charts
        return selected[:self.max_charts]
    
    def _get_chart_columns(self, chart: Dict[str, Any]) -> set:
        """Extract column names referenced in a chart"""
        columns = set()
        
        config = chart.get('config', {})
        columns.add(config.get('xAxis'))
        columns.add(config.get('yAxis'))
        
        # For combination charts
        series = config.get('series', [])
        for s in series:
            columns.add(s.get('dataKey'))
        
        # For radar charts
        dimensions = config.get('dimensions', [])
        columns.update(dimensions)
        
        # Remove None values
        columns.discard(None)
        
        return columns
    
    def _get_insight_columns(self, insight: Dict[str, Any]) -> set:
        """Extract column names referenced in an insight"""
        columns = set()
        
        columns.add(insight.get('related_column'))
        related_cols = insight.get('related_columns', [])
        columns.update(related_cols)
        
        # Remove None values
        columns.discard(None)
        
        return columns
    
    def generate_chart_config(self, chart: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate final chart configuration for frontend
        
        Args:
            chart: Chart specification
            
        Returns:
            Chart configuration object
        """
        return {
            'chartId': f"{chart['type']}_{hash(chart['title']) % 10000}",
            'type': chart['type'],
            'title': chart['title'],
            'data': chart['data'],
            'config': chart['config'],
            'insight': chart.get('insight', '')
        }
