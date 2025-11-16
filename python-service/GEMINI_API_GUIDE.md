# Gemini API Integration Guide

## Overview

The narrative generator uses Google's Gemini API to transform statistical analysis into business-focused narratives.

## Configuration

### Environment Variables

Set in `python-service/.env`:

```
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=models/gemini-2.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_MAX_OUTPUT_TOKENS=2048
GEMINI_MAX_RETRIES=3
```

### Getting an API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

## Common Issues and Solutions

### Issue 1: Empty Response

**Error:** `"Empty response text from Gemini API"`

**Possible Causes:**

- API key is invalid or expired
- Rate limit exceeded
- Safety filters blocking the response
- Network connectivity issues

**Solutions:**

1. Verify API key is valid
2. Check API quota/rate limits
3. Review prompt content for potential safety issues
4. Check network connectivity

### Issue 2: Safety Filter Blocks

**Error:** `"Response blocked by safety filters: SAFETY"`

**Possible Causes:**

- Prompt contains sensitive data
- Response would contain potentially harmful content

**Solutions:**

1. Review and sanitize input data
2. Adjust safety settings in the API configuration
3. Rephrase the prompt to be more neutral

### Issue 3: Missing Sections

**Error:** `"Missing section: recommendations"`

**Possible Causes:**

- Response format doesn't match expected structure
- Response was truncated
- Model didn't follow instructions

**Solutions:**

- ✅ Already fixed with flexible parsing
- Increase `max_output_tokens` if responses are truncated
- Adjust prompt to be more explicit about required sections

### Issue 4: Rate Limiting

**Error:** `429 Too Many Requests`

**Solutions:**

1. Implement exponential backoff (already included)
2. Reduce request frequency
3. Upgrade API quota
4. Use caching for repeated analyses

## Response Format

The Gemini API returns responses in this structure:

```python
response = model.generate_content(prompt)

# Access response text
text = response.text  # Simple accessor

# Or access via parts (for complex responses)
text = ''.join(part.text for part in response.candidates[0].content.parts)

# Check for blocks
if response.prompt_feedback.block_reason:
    # Prompt was blocked

# Check finish reason
finish_reason = response.candidates[0].finish_reason
# Possible values: STOP, MAX_TOKENS, SAFETY, RECITATION, OTHER
```

## Expected Response Format

The narrative generator expects responses in one of these formats:

### Format 1: Markdown Headers

```markdown
## Summary

Content here...

## Key Findings

Content here...

## Recommendations

Content here...
```

### Format 2: Bold Headers

```markdown
**Summary**
Content here...

**Key Findings**
Content here...

**Recommendations**
Content here...
```

### Format 3: Colon Headers

```markdown
Summary:
Content here...

Key Findings:
Content here...

Recommendations:
Content here...
```

## Retry Logic

The system automatically retries failed requests with exponential backoff:

1. **Attempt 1:** Immediate
2. **Attempt 2:** Wait 1 second
3. **Attempt 3:** Wait 2 seconds
4. **Attempt 4:** Wait 4 seconds (if max_retries > 3)

## Monitoring

### Logs to Watch

```
INFO:services.narrative_generator:Generating narrative (attempt 1/3)
INFO:services.narrative_generator:Parsed sections - Summary: X chars, Key Findings: Y chars, Recommendations: Z chars
INFO:services.narrative_generator:Narrative generation successful
```

### Error Logs

```
WARNING:services.narrative_generator:Narrative generation attempt 1 failed: [reason]
ERROR:services.narrative_generator:Narrative generation failed after 3 attempts
```

## Testing

### Test API Connection

```python
from services.narrative_generator import NarrativeGenerator

gen = NarrativeGenerator()
# If this succeeds, API key is valid
```

### Test with Mock Data

```bash
python python-service/test_narrative_fix.py
```

## Performance

### Typical Response Times

- **Fast:** 2-5 seconds
- **Normal:** 5-10 seconds
- **Slow:** 10-15 seconds

If responses consistently take >15 seconds, check:

- Network latency
- API region/endpoint
- Prompt complexity
- Token limits

## Cost Optimization

### Tips to Reduce API Costs

1. **Cache results:** Store narratives for identical analyses
2. **Batch requests:** Process multiple datasets together
3. **Optimize prompts:** Shorter prompts = lower costs
4. **Use appropriate model:** `gemini-2.5-flash` is faster and cheaper than `gemini-pro`

### Estimated Costs (as of 2024)

- Gemini 2.5 Flash: ~$0.00001 per request
- Typical narrative generation: ~2000 tokens
- Cost per narrative: ~$0.00002

## Troubleshooting Checklist

- [ ] API key is set in `.env`
- [ ] API key is valid and not expired
- [ ] Network connectivity is working
- [ ] API quota is not exceeded
- [ ] Prompt is not triggering safety filters
- [ ] Response format is being parsed correctly
- [ ] Logs show detailed error information

## Support

For Gemini API issues:

- [Google AI Documentation](https://ai.google.dev/docs)
- [API Status Page](https://status.cloud.google.com/)
- [Community Forum](https://discuss.ai.google.dev/)
