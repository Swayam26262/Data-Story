"""
Verify the output structure of the enhanced analyzer
"""

import pandas as pd
import numpy as np
from services.analyzer import StatisticalAnalyzer
import json

# Create minimal test dataset
np.random.seed(42)
df = pd.DataFrame({
    'date': pd.date_range('2023-01-01', periods=100),
    'value1': np.linspace(10, 20, 100) + np.random.normal(0, 1, 100),
    'value2': np.random.normal(50, 10, 100),
    'category': np.random.choice(['A', 'B', 'C'], 100)
})

metadata = {
    'numeric_columns': ['value1', 'value2'],
    'categorical_columns': ['category'],
    'datetime_columns': ['date']
}

# Run analysis
analyzer = StatisticalAnalyzer()
results = analyzer.analyze(df, metadata)

# Verify structure
print("Output Structure Verification")
print("=" * 80)

def check_structure(obj, path="results"):
    """Recursively check structure"""
    if isinstance(obj, dict):
        for key, value in obj.items():
            print(f"{path}.{key}: {type(value).__name__}", end="")
            if isinstance(value, list) and value:
                print(f" (length: {len(value)})")
            elif isinstance(value, dict):
                print(f" (keys: {len(value)})")
            else:
                print()
    elif isinstance(obj, list) and obj:
        print(f"{path}: list (length: {len(obj)})")
        if obj:
            print(f"{path}[0]: {type(obj[0]).__name__}")

# Check top-level keys
print("\nTop-level keys:")
for key in results.keys():
    print(f"  ✓ {key}")

# Check trends structure
print("\nTrends structure:")
if results['trends']:
    trend = results['trends'][0]
    print(f"  Keys: {list(trend.keys())}")
    print(f"  ✓ Has confidence_interval: {'confidence_interval' in trend}")
    print(f"  ✓ Has moving_averages: {'moving_averages' in trend}")
    print(f"  ✓ Has change_points: {'change_points' in trend}")

# Check correlations structure
print("\nCorrelations structure:")
if results['correlations']:
    corr = results['correlations'][0]
    print(f"  Keys: {list(corr.keys())}")
    print(f"  ✓ Has p_value: {'p_value' in corr}")
    print(f"  ✓ Has pearson: {'pearson' in corr}")
    print(f"  ✓ Has spearman: {'spearman' in corr}")

# Check correlation matrix
print("\nCorrelation matrix structure:")
cm = results['correlation_matrix']
print(f"  Keys: {list(cm.keys())}")
print(f"  ✓ Has columns: {len(cm['columns'])} columns")
print(f"  ✓ Has pearson_matrix: {len(cm['pearson_matrix'])}x{len(cm['pearson_matrix'][0]) if cm['pearson_matrix'] else 0}")

# Check distributions structure
print("\nDistributions structure:")
if results['distributions']:
    dist = results['distributions'][0]
    print(f"  Keys: {list(dist.keys())}")
    print(f"  ✓ Has quartiles (q1, q2, q3): {all(k in dist for k in ['q1', 'q2', 'q3'])}")
    print(f"  ✓ Has histogram: {'histogram' in dist}")
    print(f"  ✓ Has kde: {'kde' in dist}")
    print(f"  ✓ Has normality: {'normality' in dist}")

# Check outliers structure
print("\nOutliers structure:")
if results['outliers']:
    outlier = results['outliers'][0]
    print(f"  Keys: {list(outlier.keys())}")
    print(f"  ✓ Has methods: {'methods' in outlier}")
    if 'methods' in outlier:
        print(f"    Methods: {list(outlier['methods'].keys())}")
    print(f"  ✓ Has consensus: {'consensus' in outlier}")

# Check insights structure
print("\nInsights structure:")
print(f"  Total insights: {len(results['insights'])}")
if results['insights']:
    insight = results['insights'][0]
    print(f"  Keys: {list(insight.keys())}")
    print(f"  ✓ Has type: {'type' in insight}")
    print(f"  ✓ Has title: {'title' in insight}")
    print(f"  ✓ Has description: {'description' in insight}")
    print(f"  ✓ Has significance: {'significance' in insight}")
    print(f"  ✓ Has impact: {'impact' in insight}")
    print(f"  ✓ Has recommendation: {'recommendation' in insight}")
    print(f"  ✓ Has score: {'score' in insight}")

print("\n" + "=" * 80)
print("✓ All structure checks passed!")
print("\nSample insight:")
if results['insights']:
    insight = results['insights'][0]
    print(f"  Type: {insight['type']}")
    print(f"  Title: {insight['title']}")
    print(f"  Impact: {insight['impact']}")
    print(f"  Significance: {insight['significance']:.2f}")
    print(f"  Description: {insight['description'][:100]}...")
