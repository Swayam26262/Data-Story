"""
Test script to demonstrate enhanced statistical analysis features
"""

import pandas as pd
import numpy as np
from services.analyzer import StatisticalAnalyzer

# Create sample dataset with various patterns
np.random.seed(42)

# Generate time series data with trend and seasonality
dates = pd.date_range('2023-01-01', periods=365, freq='D')
trend = np.linspace(100, 200, 365)
seasonal = 20 * np.sin(np.linspace(0, 4 * np.pi, 365))
noise = np.random.normal(0, 5, 365)
sales = trend + seasonal + noise

# Generate correlated data
profit = sales * 0.3 + np.random.normal(0, 3, 365)

# Generate data with outliers
costs = np.random.normal(50, 10, 365)
costs[50] = 200  # Add outlier
costs[100] = 5   # Add outlier

# Create DataFrame
df = pd.DataFrame({
    'date': dates,
    'sales': sales,
    'profit': profit,
    'costs': costs,
    'region': np.random.choice(['North', 'South', 'East', 'West'], 365)
})

# Metadata
metadata = {
    'numeric_columns': ['sales', 'profit', 'costs'],
    'categorical_columns': ['region'],
    'datetime_columns': ['date']
}

# Run analysis
print("Running enhanced statistical analysis...")
print("=" * 80)

analyzer = StatisticalAnalyzer(correlation_threshold=0.5)
results = analyzer.analyze(df, metadata)

# Display results
print("\n1. TREND ANALYSIS")
print("-" * 80)
for trend in results['trends']:
    print(f"\nColumn: {trend['column']}")
    print(f"  Direction: {trend['direction']}")
    print(f"  Strength: {trend['strength']} (R²: {trend['r_squared']:.3f})")
    print(f"  Slope: {trend['slope']:.3f}")
    
    if 'seasonal' in trend:
        print(f"  Seasonal Pattern: Detected (strength: {trend['seasonal']['strength']:.3f})")
    
    if 'moving_averages' in trend and '7d' in trend['moving_averages']:
        print(f"  Moving Averages: 7-day, 30-day, 90-day calculated")
    
    if 'change_points' in trend and trend['change_points']:
        print(f"  Change Points: {len(trend['change_points'])} detected")

print("\n2. CORRELATION ANALYSIS")
print("-" * 80)
for corr in results['correlations'][:3]:
    print(f"\n{corr['column1']} vs {corr['column2']}")
    print(f"  Coefficient: {corr['coefficient']:.3f} ({corr['direction']})")
    print(f"  P-value: {corr['p_value']:.4f}")
    print(f"  Method: {corr['method']}")
    print(f"  Significance: {corr['significance']}")

print("\n3. CORRELATION MATRIX")
print("-" * 80)
if results['correlation_matrix']['columns']:
    print(f"Columns: {', '.join(results['correlation_matrix']['columns'])}")
    print("Matrix available for heatmap visualization")

print("\n4. DISTRIBUTION ANALYSIS")
print("-" * 80)
for dist in results['distributions']:
    print(f"\nColumn: {dist['column']}")
    print(f"  Mean: {dist['mean']:.2f}, Median: {dist['median']:.2f}")
    print(f"  Std Dev: {dist['std_dev']:.2f}")
    print(f"  Quartiles: Q1={dist['q1']:.2f}, Q2={dist['q2']:.2f}, Q3={dist['q3']:.2f}")
    print(f"  Skewness: {dist['skewness']:.3f}, Kurtosis: {dist['kurtosis']:.3f}")
    
    if 'histogram' in dist:
        print(f"  Histogram: {dist['histogram']['n_bins']} bins calculated")
    
    if 'kde' in dist:
        print(f"  KDE: Smooth density estimation available")
    
    if 'normality' in dist:
        normality_tests = []
        for test_name, test_result in dist['normality'].items():
            if isinstance(test_result, dict):
                is_normal = test_result.get('is_normal', False)
                normality_tests.append(f"{test_name}: {'Normal' if is_normal else 'Not Normal'}")
        if normality_tests:
            print(f"  Normality Tests: {', '.join(normality_tests)}")

print("\n5. OUTLIER DETECTION")
print("-" * 80)
for outlier in results['outliers']:
    print(f"\nColumn: {outlier['column']}")
    
    for method_name, method_result in outlier['methods'].items():
        print(f"  {method_name.upper()}: {method_result['count']} outliers ({method_result['percentage']:.1f}%)")
    
    if 'consensus' in outlier:
        print(f"  CONSENSUS: {outlier['consensus']['count']} outliers detected by multiple methods")

print("\n6. INSIGHTS")
print("-" * 80)
for i, insight in enumerate(results['insights'], 1):
    print(f"\n{i}. {insight['title']} [{insight['type'].upper()}]")
    print(f"   Impact: {insight['impact'].upper()}")
    print(f"   Significance: {insight['significance']:.2f}")
    print(f"   Description: {insight['description']}")
    print(f"   Recommendation: {insight['recommendation']}")

print("\n" + "=" * 80)
print("Analysis complete!")
print(f"Total insights generated: {len(results['insights'])}")
