"""
Test script for the enhanced VisualizationSelector
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from services.visualizer import VisualizationSelector
from services.analyzer import StatisticalAnalyzer

# Create sample data
np.random.seed(42)
n_rows = 100

# Create datetime column
dates = [datetime(2023, 1, 1) + timedelta(days=i) for i in range(n_rows)]

# Create sample DataFrame with various data types
df = pd.DataFrame({
    'date': dates,
    'revenue': np.cumsum(np.random.randn(n_rows) * 10 + 50),  # Trending data
    'cost': np.cumsum(np.random.randn(n_rows) * 5 + 20),  # Trending data
    'profit': np.random.randn(n_rows) * 20 + 100,  # Random with outliers
    'customers': np.random.randint(50, 200, n_rows),
    'category': np.random.choice(['A', 'B', 'C', 'D'], n_rows),
    'stage': np.random.choice(['Lead', 'Qualified', 'Proposal', 'Closed'], n_rows),
    'region': np.random.choice(['North', 'South', 'East', 'West'], n_rows)
})

# Add some outliers
df.loc[10, 'profit'] = 500
df.loc[50, 'profit'] = -200

# Create metadata
metadata = {
    'numeric_columns': ['revenue', 'cost', 'profit', 'customers'],
    'categorical_columns': ['category', 'stage', 'region'],
    'datetime_columns': ['date']
}

# Run statistical analysis
print("Running statistical analysis...")
analyzer = StatisticalAnalyzer()
analysis = analyzer.analyze(df, metadata)

print(f"\nAnalysis results:")
print(f"  - Trends found: {len(analysis.get('trends', []))}")
print(f"  - Correlations found: {len(analysis.get('correlations', []))}")
print(f"  - Distributions analyzed: {len(analysis.get('distributions', []))}")
print(f"  - Outliers detected: {len(analysis.get('outliers', []))}")
print(f"  - Insights generated: {len(analysis.get('insights', []))}")

# Test visualization selector
print("\n" + "="*60)
print("Testing VisualizationSelector with expanded chart types")
print("="*60)

selector = VisualizationSelector(max_charts=6)
charts = selector.select_visualizations(df, metadata, analysis)

print(f"\nSelected {len(charts)} charts:")
for i, chart in enumerate(charts, 1):
    print(f"\n{i}. {chart['type'].upper()}: {chart['title']}")
    print(f"   Score: {chart.get('composite_score', chart.get('score', 0)):.2f}")
    print(f"   Insight: {chart.get('insight', 'N/A')}")
    if 'data_characteristics' in chart:
        print(f"   Characteristics: {chart['data_characteristics']}")

# Check chart type diversity
chart_types = [c['type'] for c in charts]
print(f"\nChart type distribution:")
for chart_type in set(chart_types):
    count = chart_types.count(chart_type)
    print(f"  - {chart_type}: {count}")

# Verify advanced chart types are being selected
advanced_types = ['heatmap', 'boxplot', 'combination', 'waterfall', 'funnel', 'radar', 'area']
selected_advanced = [t for t in chart_types if t in advanced_types]
print(f"\nAdvanced chart types selected: {len(selected_advanced)}")
print(f"  Types: {', '.join(selected_advanced) if selected_advanced else 'None'}")

# Test with correlation matrix
if 'correlation_matrix' in analysis:
    corr_matrix = analysis['correlation_matrix']
    print(f"\nCorrelation matrix available: {len(corr_matrix.get('columns', []))} columns")
    
# Check if heatmap was created
heatmap_charts = [c for c in charts if c['type'] == 'heatmap']
if heatmap_charts:
    print(f"✓ Heatmap chart created successfully")
else:
    print(f"✗ No heatmap chart created")

# Check if boxplot was created
boxplot_charts = [c for c in charts if c['type'] == 'boxplot']
if boxplot_charts:
    print(f"✓ Box plot chart created successfully")
else:
    print(f"✗ No box plot chart created")

# Check if combination chart was created
combination_charts = [c for c in charts if c['type'] == 'combination']
if combination_charts:
    print(f"✓ Combination chart created successfully")
else:
    print(f"✗ No combination chart created (may require specific data conditions)")

print("\n" + "="*60)
print("Test completed successfully!")
print("="*60)
