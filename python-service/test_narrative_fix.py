"""
Test script to verify the narrative generator fix for KeyError: 'count'
"""

from services.narrative_generator import NarrativeGenerator

# Mock analysis data that matches the actual structure from analyzer
mock_analysis = {
    'summary': {
        'total_rows': 16534,
        'total_columns': 11,
        'numeric_columns': 5,
        'categorical_columns': 4,
        'datetime_columns': 1
    },
    'trends': [
        {
            'column': 'salary',
            'time_column': 'date',
            'direction': 'increasing',
            'slope': 0.5,
            'r_squared': 0.85,
            'strength': 'strong',
            'intercept': 50000
        }
    ],
    'correlations': [
        {
            'column1': 'experience',
            'column2': 'salary',
            'coefficient': 0.75,
            'p_value': 0.001,
            'method': 'pearson',
            'significance': 'strong',
            'direction': 'positive'
        }
    ],
    'distributions': [
        {
            'column': 'salary',
            'mean': 75000,
            'median': 72000,
            'std_dev': 15000,
            'min': 40000,
            'max': 150000,
            'skewness': 0.5,
            'kurtosis': 0.2
        }
    ],
    'frequencies': [
        {
            'column': 'department',
            'unique_count': 5,
            'top_categories': [
                {'value': 'Engineering', 'count': 5000, 'percentage': 30.2},
                {'value': 'Sales', 'count': 4000, 'percentage': 24.2},
                {'value': 'Marketing', 'count': 3000, 'percentage': 18.1}
            ],
            'total_count': 16534
        }
    ],
    'outliers': [
        {
            'column': 'salary',
            'methods': {
                'iqr': {
                    'method': 'iqr',
                    'count': 150,
                    'percentage': 0.9,
                    'lower_bound': 35000,
                    'upper_bound': 120000
                },
                'zscore': {
                    'method': 'zscore',
                    'count': 145,
                    'percentage': 0.88
                }
            },
            'consensus': {
                'count': 140,
                'percentage': 0.85
            }
        }
    ]
}

mock_metadata = {
    'filename': 'test_salary_data.csv',
    'total_rows': 16534,
    'total_columns': 11,
    'numeric_columns': ['salary', 'experience', 'age', 'bonus', 'rating'],
    'categorical_columns': ['department', 'position', 'location', 'gender'],
    'datetime_columns': ['hire_date']
}

def test_narrative_generation():
    """Test that narrative generation works without KeyError"""
    print("Testing narrative generation with fixed code...")
    
    try:
        # Initialize generator (will use mock API key from config)
        gen = NarrativeGenerator()
        
        # Build prompt (this is where the KeyError was happening)
        prompt = gen._build_prompt(mock_analysis, mock_metadata, 'general')
        
        print("✓ Prompt built successfully!")
        print(f"\nPrompt length: {len(prompt)} characters")
        print("\nFirst 500 characters of prompt:")
        print(prompt[:500])
        print("\n...")
        
        # Check that all sections are present
        assert "DATASET OVERVIEW" in prompt
        assert "TRENDS DETECTED" in prompt
        assert "CORRELATIONS FOUND" in prompt
        assert "DISTRIBUTION STATISTICS" in prompt
        assert "CATEGORICAL DISTRIBUTIONS" in prompt
        assert "OUTLIERS DETECTED" in prompt
        
        print("\n✓ All expected sections present in prompt")
        print("\n✓ Test passed! The KeyError: 'count' issue is fixed.")
        
        return True
        
    except KeyError as e:
        print(f"\n✗ KeyError still present: {e}")
        return False
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_response_parsing():
    """Test that response parsing handles various formats"""
    print("\n\nTesting response parsing flexibility...")
    
    gen = NarrativeGenerator()
    
    # Test various response formats
    test_cases = [
        # Format 1: Standard markdown headers
        """## Summary
This is the summary section with some content.

## Key Findings
These are the key findings with details.

## Recommendations
These are the recommendations.""",
        
        # Format 2: Bold headers
        """**Summary**
This is the summary section.

**Key Findings**
These are the findings.

**Recommendations**
These are the recommendations.""",
        
        # Format 3: Colon headers
        """Summary:
This is the summary.

Key Findings:
These are the findings.

Recommendations:
These are the recommendations."""
    ]
    
    for i, test_response in enumerate(test_cases, 1):
        try:
            result = gen._parse_response(test_response)
            assert 'summary' in result and result['summary']
            assert 'keyFindings' in result and result['keyFindings']
            assert 'recommendations' in result and result['recommendations']
            print(f"✓ Test case {i} passed")
        except Exception as e:
            print(f"✗ Test case {i} failed: {e}")
            return False
    
    print("✓ All response parsing tests passed!")
    return True

if __name__ == "__main__":
    success1 = test_narrative_generation()
    success2 = test_response_parsing()
    exit(0 if (success1 and success2) else 1)
