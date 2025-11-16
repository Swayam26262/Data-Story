# Analysis Data Structures Reference

This document describes the data structures returned by the analyzer and used by the narrative generator.

## Analysis Result Structure

```python
{
    'summary': {...},
    'trends': [...],
    'correlations': [...],
    'distributions': [...],
    'frequencies': [...],
    'outliers': [...],
    'correlation_matrix': {...},
    'partial_correlations': [...],
    'insights': [...]
}
```

## Summary

```python
{
    'total_rows': int,
    'total_columns': int,
    'numeric_columns': int,
    'categorical_columns': int,
    'datetime_columns': int
}
```

## Trends

```python
[
    {
        'column': str,
        'time_column': str,
        'direction': str,  # 'increasing', 'decreasing', 'stable'
        'slope': float,
        'r_squared': float,
        'strength': str,  # 'strong', 'moderate', 'weak'
        'intercept': float,
        'confidence_interval': {...},
        'polynomial': {...} | None,
        'moving_averages': {...},
        'change_points': [...],
        'seasonal': {...} | None,  # Optional
        'yoy_growth': {...} | None  # Optional
    }
]
```

## Correlations

```python
[
    {
        'column1': str,
        'column2': str,
        'coefficient': float,
        'p_value': float,
        'method': str,  # 'pearson' or 'spearman'
        'significance': str,  # 'strong', 'moderate', 'weak'
        'direction': str,  # 'positive' or 'negative'
        'pearson': {
            'coefficient': float,
            'p_value': float
        },
        'spearman': {
            'coefficient': float,
            'p_value': float
        },
        'is_significant': bool
    }
]
```

## Distributions

```python
[
    {
        'column': str,
        'mean': float,
        'median': float,
        'std_dev': float,
        'min': float,
        'max': float,
        'skewness': float,
        'kurtosis': float,
        'q1': float,
        'q2': float,
        'q3': float,
        'iqr': float,
        'histogram': {
            'counts': [int],
            'bin_edges': [float],
            'n_bins': int
        },
        'kde': {  # Optional
            'x': [float],
            'y': [float]
        },
        'normality': {
            'shapiro_wilk': {...},
            'anderson_darling': {...},
            'jarque_bera': {...}
        }
    }
]
```

## Frequencies (Categorical Data)

```python
[
    {
        'column': str,
        'unique_count': int,  # ⚠️ NOT 'count'!
        'top_categories': [
            {
                'value': str,
                'count': int,
                'percentage': float
            }
        ],
        'total_count': int
    }
]
```

## Outliers

```python
[
    {
        'column': str,
        'methods': {
            'iqr': {
                'method': 'iqr',
                'count': int,
                'percentage': float,
                'lower_bound': float,
                'upper_bound': float,
                'indices': [int],
                'values': [float]
            },
            'zscore': {
                'method': 'zscore',
                'count': int,
                'percentage': float,
                'threshold': float,
                'indices': [int],
                'values': [float],
                'zscores': [float]
            },
            'isolation_forest': {  # Optional
                'method': 'isolation_forest',
                'count': int,
                'percentage': float,
                'contamination': float,
                'indices': [int],
                'values': [float],
                'anomaly_scores': [float]
            }
        },
        'consensus': {  # ⚠️ Nested structure!
            'count': int,
            'percentage': float,
            'indices': [int]
        }
    }
]
```

## Key Points for Developers

### ⚠️ Common Pitfalls

1. **Frequencies**: Use `unique_count`, NOT `count`
2. **Outliers**: Count is nested in `consensus.count` or `methods.iqr.count`, NOT at top level
3. **Optional Fields**: Many fields are optional (seasonal, yoy_growth, kde, etc.)

### ✅ Best Practices

1. **Always use `.get()` with defaults**:

   ```python
   count = freq.get('unique_count', 0)  # ✅ Safe
   count = freq['unique_count']  # ❌ Can raise KeyError
   ```

2. **Check for nested structures**:

   ```python
   if 'consensus' in outlier:
       count = outlier['consensus'].get('count', 0)  # ✅ Safe
   ```

3. **Handle optional fields**:

   ```python
   if 'seasonal' in trend and trend['seasonal']:
       # Use seasonal data
   ```

4. **Provide sensible defaults**:
   ```python
   column = trend.get('column', 'Unknown')
   direction = trend.get('direction', 'stable')
   ```

## Source Files

- Data structures defined in: `python-service/services/analyzer.py`
- Used by: `python-service/services/narrative_generator.py`
- Also used by: `python-service/services/visualizer.py`
