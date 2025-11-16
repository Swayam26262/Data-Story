# Bug Fix: Narrative Generation Issues

## Issues Fixed

### 1. KeyError 'count'

The narrative generation was failing with error: `"Failed to generate narrative: 'count'"`

This was a KeyError occurring when the narrative generator tried to access dictionary keys that didn't exist in the analysis data structure.

### 2. Response Parsing Issues

The narrative generation was also failing with:

- `"Missing section: recommendations"`
- `"Empty response text from Gemini API"`

The response parser was too strict and couldn't handle various response formats from the Gemini API.

## Root Cause

The `NarrativeGenerator._build_prompt()` method was accessing dictionary keys directly using bracket notation (e.g., `freq['count']`, `outlier['count']`) instead of using the safer `.get()` method.

The actual data structures from the analyzer had different key names:

- **Frequencies**: Used `unique_count` not `count`
- **Outliers**: Had nested structure with `consensus.count` and `methods.iqr.count`, not direct `count` key

## Changes Made

### 1. Fixed Frequency Section (Line ~157)

**Before:**

```python
f"{i}. {freq['column']}: {freq['unique_count']} unique values. "
```

**After:**

```python
if top_cats:
    cats_str = ", ".join([f"{cat['value']} ({cat['percentage']:.1f}%)" for cat in top_cats])
    prompt_parts.append(
        f"{i}. {freq['column']}: {freq.get('unique_count', 0)} unique values. "
        f"Top categories: {cats_str}"
    )
else:
    prompt_parts.append(
        f"{i}. {freq['column']}: {freq.get('unique_count', 0)} unique values."
    )
```

### 2. Fixed Outlier Section (Line ~172)

**Before:**

```python
f"{i}. {outlier['column']}: {outlier['count']} outliers ({outlier['percentage']:.1f}% of data) "
f"outside range [{outlier['lower_bound']:.2f}, {outlier['upper_bound']:.2f}]"
```

**After:**

```python
# Get consensus outlier info if available, otherwise use IQR method
if 'consensus' in outlier and outlier['consensus'].get('count', 0) > 0:
    count = outlier['consensus']['count']
    iqr_method = outlier.get('methods', {}).get('iqr', {})
    lower_bound = iqr_method.get('lower_bound', 0)
    upper_bound = iqr_method.get('upper_bound', 0)
    percentage = iqr_method.get('percentage', 0)
    # ... build prompt
elif 'methods' in outlier and 'iqr' in outlier['methods']:
    iqr_method = outlier['methods']['iqr']
    # ... use IQR method data
```

### 3. Made All Dictionary Access Safer

Updated all sections (trends, correlations, distributions) to use `.get()` with default values:

```python
# Example for trends
column = trend.get('column', 'Unknown')
direction = trend.get('direction', 'stable')
r_squared = trend.get('r_squared', 0)
```

### 4. Enhanced Error Logging in main.py

Added detailed logging when narrative generation fails:

```python
logger.error(f"Narrative generation failed: {str(e)}", exc_info=True)
logger.error(f"Analysis keys: {list(analysis.keys())}")
logger.error(f"Metadata keys: {list(metadata.keys())}")
```

## Testing

Created `test_narrative_fix.py` to verify the fix works with realistic data structures. Test passes successfully.

## Impact

- ✅ Narrative generation no longer crashes with KeyError
- ✅ More robust error handling for missing or malformed data
- ✅ Better debugging information when errors occur
- ✅ Graceful degradation when optional data is missing

### 5. Improved Response Parsing

Made the parser more flexible to handle various Gemini API response formats:

**Before:**

```python
if '## summary' in line_lower or line_lower.startswith('summary'):
    # Only matched specific formats
```

**After:**

```python
if any(marker in line_lower for marker in ['## summary', '# summary', 'summary:', '**summary**']):
    # Matches multiple formats
```

### 6. Better Gemini API Error Handling

Added checks for:

- Safety filter blocks
- Empty candidates
- Finish reasons (SAFETY, STOP, etc.)
- Better fallback for response text extraction

### 7. More Lenient Validation

Reduced minimum character requirements from 50 to 30 characters per section to allow for concise responses.

## Files Modified

1. `python-service/services/narrative_generator.py` - Fixed dictionary access, improved parsing, better error handling
2. `python-service/main.py` - Enhanced error logging
3. `python-service/test_narrative_fix.py` - Added comprehensive tests (new file)
