"""
Test script to verify numpy type conversion for JSON serialization
"""

import numpy as np
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from main import convert_numpy_types


def test_numpy_conversion():
    """Test that numpy types are converted correctly"""
    print("Testing numpy type conversion...")
    
    # Test data with various numpy types
    test_data = {
        'int_value': np.int64(42),
        'float_value': np.float64(3.14),
        'bool_value': np.bool_(True),
        'array_value': np.array([1, 2, 3]),
        'nested_dict': {
            'nested_int': np.int32(100),
            'nested_float': np.float32(2.5),
            'nested_bool': np.bool_(False)
        },
        'list_with_numpy': [
            np.int64(1),
            np.float64(2.5),
            np.bool_(True),
            {'key': np.int64(999)}
        ],
        'regular_values': {
            'string': 'hello',
            'int': 42,
            'float': 3.14,
            'bool': True,
            'list': [1, 2, 3]
        }
    }
    
    print("\nOriginal data types:")
    print(f"  int_value: {type(test_data['int_value'])}")
    print(f"  float_value: {type(test_data['float_value'])}")
    print(f"  bool_value: {type(test_data['bool_value'])}")
    print(f"  array_value: {type(test_data['array_value'])}")
    
    # Convert
    converted = convert_numpy_types(test_data)
    
    print("\nConverted data types:")
    print(f"  int_value: {type(converted['int_value'])}")
    print(f"  float_value: {type(converted['float_value'])}")
    print(f"  bool_value: {type(converted['bool_value'])}")
    print(f"  array_value: {type(converted['array_value'])}")
    
    # Verify conversions
    assert isinstance(converted['int_value'], int), "int64 should convert to int"
    assert isinstance(converted['float_value'], float), "float64 should convert to float"
    assert isinstance(converted['bool_value'], bool), "bool_ should convert to bool"
    assert isinstance(converted['array_value'], list), "ndarray should convert to list"
    
    # Verify nested conversions
    assert isinstance(converted['nested_dict']['nested_int'], int), "Nested int should convert"
    assert isinstance(converted['nested_dict']['nested_float'], float), "Nested float should convert"
    assert isinstance(converted['nested_dict']['nested_bool'], bool), "Nested bool should convert"
    
    # Verify list conversions
    assert isinstance(converted['list_with_numpy'][0], int), "List item int should convert"
    assert isinstance(converted['list_with_numpy'][1], float), "List item float should convert"
    assert isinstance(converted['list_with_numpy'][2], bool), "List item bool should convert"
    assert isinstance(converted['list_with_numpy'][3]['key'], int), "Nested dict in list should convert"
    
    # Verify regular values unchanged
    assert converted['regular_values']['string'] == 'hello'
    assert converted['regular_values']['int'] == 42
    assert converted['regular_values']['float'] == 3.14
    assert converted['regular_values']['bool'] == True
    assert converted['regular_values']['list'] == [1, 2, 3]
    
    print("\n✓ All numpy type conversions passed!")
    
    # Test JSON serialization
    import json
    try:
        json_str = json.dumps(converted)
        print(f"\n✓ JSON serialization successful ({len(json_str)} chars)")
        
        # Verify we can deserialize
        deserialized = json.loads(json_str)
        print("✓ JSON deserialization successful")
        
        return True
    except Exception as e:
        print(f"\n✗ JSON serialization failed: {e}")
        return False


def test_real_world_analysis_data():
    """Test with realistic analysis data structure"""
    print("\n\nTesting with realistic analysis data...")
    
    # Simulate real analysis output with numpy types
    analysis_data = {
        'summary': {
            'total_rows': np.int64(16534),
            'total_columns': np.int64(11),
            'numeric_columns': np.int64(5),
            'categorical_columns': np.int64(4),
            'datetime_columns': np.int64(1)
        },
        'correlations': [
            {
                'column1': 'experience',
                'column2': 'salary',
                'coefficient': np.float64(0.75),
                'p_value': np.float64(0.001),
                'is_significant': np.bool_(True)
            }
        ],
        'distributions': [
            {
                'column': 'salary',
                'mean': np.float64(75000.5),
                'median': np.float64(72000.0),
                'std_dev': np.float64(15000.25),
                'min': np.float64(40000.0),
                'max': np.float64(150000.0)
            }
        ]
    }
    
    converted = convert_numpy_types(analysis_data)
    
    # Verify all types are native Python
    assert isinstance(converted['summary']['total_rows'], int)
    assert isinstance(converted['correlations'][0]['coefficient'], float)
    assert isinstance(converted['correlations'][0]['is_significant'], bool)
    assert isinstance(converted['distributions'][0]['mean'], float)
    
    print("✓ Realistic analysis data conversion passed!")
    
    # Test JSON serialization
    import json
    try:
        json_str = json.dumps(converted)
        print(f"✓ JSON serialization successful ({len(json_str)} chars)")
        return True
    except Exception as e:
        print(f"✗ JSON serialization failed: {e}")
        return False


if __name__ == "__main__":
    success1 = test_numpy_conversion()
    success2 = test_real_world_analysis_data()
    
    if success1 and success2:
        print("\n" + "="*50)
        print("✓ All tests passed!")
        print("="*50)
        exit(0)
    else:
        print("\n" + "="*50)
        print("✗ Some tests failed")
        print("="*50)
        exit(1)
