"""
Visualization selector for DataStory AI
Intelligently selects appropriate chart types based on data characteristics
"""

import pandas as pd
from typing import Dict, List, Any


class VisualizationSelector:
    """Selects appropriate visualizations based on data analysis"""
    
    def __init__(self, max_charts: int = 4):
        self.max_charts = max_charts
    
    def select_visualizations(self, df: pd.DataFrame, metadata: Dict[str, Any], 
                            analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Select 3-4 most informative visualizations
        
        Args:
            df: pandas DataFrame
            metadata: Preprocessing metadata
            analysis: Statistical analysis results
            
        Returns:
            List of chart configurations
        """
        charts = []
        
        # 1. Time series charts for trends
        trend_charts = self._create_trend_charts(df, analysis.get('trends', []))
        charts.extend(trend_charts)
        
        # 2. Scatter plots for correlations
        correlation_charts = self._create_correlation_charts(df, analysis.get('correlations', []))
        charts.extend(correlation_charts)
        
        # 3. Bar charts for categorical comparisons
        categorical_charts = self._create_categorical_charts(df, metadata, analysis)
        charts.extend(categorical_charts)
        
        # 4. Pie charts for proportional data
        pie_charts = self._create_pie_charts(df, analysis.get('frequencies', []))
        charts.extend(pie_charts)
        
        # Score and rank charts by informativeness
        scored_charts = self._score_charts(charts, analysis)
        
        # Select top charts (3-4)
        selected = scored_charts[:min(self.max_charts, len(scored_charts))]
        
        return selected
    
    def _create_trend_charts(self, df: pd.DataFrame, 
                           trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create line charts for temporal trends"""
        charts = []
        
        # Select strongest trends
        strong_trends = [t for t in trends if t.get('strength') in ['strong', 'moderate']]
        strong_trends.sort(key=lambda x: x.get('r_squared', 0), reverse=True)
        
        for trend in strong_trends[:2]:  # Max 2 trend charts
            time_col = trend['time_column']
            value_col = trend['column']
            
            # Prepare data
            df_sorted = df[[time_col, value_col]].dropna().sort_values(time_col)
            
            chart_data = {
                'x': df_sorted[time_col].dt.strftime('%Y-%m-%d').tolist(),
                'y': df_sorted[value_col].tolist(),
                'x_label': time_col,
                'y_label': value_col
            }
            
            charts.append({
                'type': 'line',
                'title': f'{value_col} Over Time',
                'data': chart_data,
                'config': {
                    'xAxis': time_col,
                    'yAxis': value_col,
                    'showTrendLine': True,
                    'colors': ['#3b82f6']
                },
                'insight': f'{value_col} shows a {trend["direction"]} trend over time',
                'score': trend.get('r_squared', 0) * 10
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
            
            chart_data = {
                'x': df_clean[col1].tolist(),
                'y': df_clean[col2].tolist(),
                'x_label': col1,
                'y_label': col2
            }
            
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
            
            chart_data = {
                'categories': grouped.index.astype(str).tolist(),
                'values': grouped.values.tolist(),
                'x_label': cat_col,
                'y_label': f'Average {num_col}'
            }
            
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
            
            chart_data = {
                'labels': [cat['value'] for cat in top_cats],
                'values': [cat['count'] for cat in top_cats],
                'percentages': [cat['percentage'] for cat in top_cats]
            }
            
            charts.append({
                'type': 'pie',
                'title': f'Distribution of {col}',
                'data': chart_data,
                'config': {
                    'colors': ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1']
                },
                'insight': f'Proportional breakdown of {col} categories',
                'score': 6.0
            })
        
        return charts
    
    def _score_charts(self, charts: List[Dict[str, Any]], 
                     analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Score charts by informativeness and rank them
        
        Args:
            charts: List of chart configurations
            analysis: Statistical analysis results
            
        Returns:
            Sorted list of charts by score
        """
        # Sort by score (already assigned in creation methods)
        charts.sort(key=lambda x: x.get('score', 0), reverse=True)
        
        # Ensure diversity - prefer different chart types
        selected = []
        type_counts = {}
        
        for chart in charts:
            chart_type = chart['type']
            
            # Limit each type to 2 charts
            if type_counts.get(chart_type, 0) >= 2:
                continue
            
            selected.append(chart)
            type_counts[chart_type] = type_counts.get(chart_type, 0) + 1
            
            # Stop if we have enough charts
            if len(selected) >= self.max_charts:
                break
        
        return selected
    
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
