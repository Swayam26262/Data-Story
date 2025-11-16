"""
Test combination chart creation with appropriate data
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from services.visualizer import VisualizationSelector
from services.analyzer import StatisticalAnalyzer

# Create sample data with different scales (good for combination chart)
np.random.seed(42)
n_rows = 100

dates = [datetime(2023, 1, 1) + timedelta(days=i) for i in range(n_rows)]

# Create metrics with very different scales AND trends
df = pd.DataFrame({
    'date': dates,
    'revenue': np.cumsum(np.random.randn(n_rows) * 100 + 1000),  # Large scale (thousands) with trend
    'conversion_rate': np.cumsum(np.random.randn(n_rows) * 0.05 + 0.1) + 5,  # Small scale with trend
    'orders': np.random.randint(10, 50, n_rows),  # Medium scale
})

metadata = {
    'numeric_columns': ['revenue', 'conversion_rate', 'orders'],
    'categorical_columns': [],
    'datetime_columns': ['date']
}

print("Testing combination chart creation...")
print(f"Revenue scale: {df['revenue'].std():.2f}")
print(f"Conversion rate scale: {df['conversion_rate'].std():.2f}")
print(f"Scale ratio: {df['revenue'].std() / df['conversion_rate'].std():.2f}")

analyzer = StatisticalAnalyzer()
analysis = analyzer.analyze(df, metadata)

print(f"\nTrends found: {len(analysis.get('trends', []))}")
for trend in analysis.get('trends', []):
    print(f"  - {trend['column']}: {trend['strength']} {trend['direction']} (R²={trend['r_squared']:.3f})")

selector = VisualizationSelector(max_charts=6)
charts = selector.select_visualizations(df, metadata, analysis)

print(f"\nSelected {len(charts)} charts:")
for chart in charts:
    print(f"  - {chart['type']}: {chart['title']}")

combination_charts = [c for c in charts if c['type'] == 'combination']
if combination_charts:
    print(f"\n✓ Combination chart created!")
    for chart in combination_charts:
        print(f"  Title: {chart['title']}")
        print(f"  Score: {chart.get('composite_score', 0):.2f}")
        print(f"  Series: {chart['config']['series']}")
else:
    print(f"\n✗ No combination chart created")
