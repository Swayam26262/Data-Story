# Design Document

## Overview

This design addresses five critical bugs affecting the Data Story application. The fixes target Next.js route handler parameter handling, API error responses, file upload flow, Mongoose schema index duplication, Python date parsing warnings, and source map errors. Each fix is designed to be minimal, focused, and non-breaking.

## Architecture

### System Components Affected

1. **Story API Route Handler** (`app/api/stories/[storyId]/route.ts`)
   - Issue: Synchronous access to async params Promise
   - Impact: 404 errors for all story retrieval requests

2. **File Upload System** (`components/FileUpload.tsx`, `lib/hooks/useFileUpload.ts`, `app/api/upload/route.ts`)
   - Issue: Already working correctly with FormData
   - Verification needed: Ensure no regressions

3. **Mongoose Schema Definitions** (`lib/models/*.ts`)
   - Issue: Duplicate index declarations causing warnings
   - Impact: Development console noise, potential index conflicts

4. **Python Preprocessor** (`python-service/services/preprocessor.py`)
   - Issue: Deprecated pandas parameter causing warnings
   - Impact: Log noise during data processing

5. **Next.js Development Environment**
   - Issue: Invalid source maps in node_modules
   - Impact: Development console noise

## Components and Interfaces

### 1. Story Retrieval Fix

**Problem Analysis:**
The route handler at `app/api/stories/[storyId]/route.ts` currently has:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  const { storyId } = params; // Direct access
```

However, Next.js 15+ requires params to be awaited when it's a Promise. Looking at other routes in the codebase, we see the correct pattern in `app/api/jobs/[jobId]/route.ts`:
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params; // Awaited access
```

**Solution:**
Update the type signature and await the params Promise before accessing properties.

**Changes Required:**
- Update GET function signature to declare params as Promise
- Update DELETE function signature similarly
- Await params before destructuring
- Add error handling for invalid ObjectId format

**Error Response Enhancement:**
- Ensure 404 responses include descriptive error messages
- Add logging for debugging
- Validate ObjectId format before database query

### 2. File Upload Verification

**Current Implementation Analysis:**
The file upload flow is already correctly implemented:

1. **Client Side** (`components/FileUpload.tsx`):
   - Uses hidden `<input type="file">` with ref
   - Constructs FormData with file
   - Sends via XMLHttpRequest in `useFileUpload` hook

2. **Hook** (`lib/hooks/useFileUpload.ts`):
   - Creates FormData: `formData.append('file', file)`
   - POSTs to `/api/upload` with FormData body
   - Tracks progress via XHR

3. **Server** (`app/api/upload/route.ts`):
   - Correctly extracts: `const file = formData.get('file') as File`
   - Validates and processes file

**Verification Strategy:**
- Test the upload flow end-to-end
- Check browser network tab for proper multipart/form-data
- Verify file reaches server correctly
- If issues found, add detailed logging

**No Changes Required** unless testing reveals issues.

### 3. Mongoose Index Deduplication

**Problem Analysis:**
Multiple models declare indexes twice:
1. Field-level: `index: true` in schema field definition
2. Schema-level: `schema.index({ field: 1 })`

This causes Mongoose warnings for:
- User.email
- Session.token, userId, expiresAt
- Story.userId, shareToken
- Job.jobId, userId, status

**Solution Strategy:**
Remove field-level `index: true` declarations and keep only schema-level `schema.index()` calls. This provides:
- Single source of truth for indexes
- Better control over index options (unique, sparse, etc.)
- Cleaner schema definitions

**Changes Required:**

**User.ts:**
- Remove `index: true` from email field (line 51)
- Keep `UserSchema.index({ email: 1 })` (line 123)
- Keep `UserSchema.index({ tier: 1 })` (line 124)

**Session.ts:**
- Remove `index: true` from userId field (line 28)
- Remove `index: true` from token field (line 34)
- Remove `index: true` from expiresAt field (line 43)
- Keep all schema-level indexes (lines 73-75)

**Story.ts:**
- Remove `index: true` from userId field (line 89)
- Keep `StorySchema.index({ userId: 1, createdAt: -1 })` (line 186)
- Keep `StorySchema.index({ shareToken: 1 })` (line 187)

**Job.ts:**
- Remove `index: true` from jobId field (line 56)
- Remove `index: true` from userId field (line 62)
- Remove `index: true` from status field (line 68)
- Keep all schema-level indexes (lines 143-145)

### 4. Python Date Parsing Warning Fix

**Problem Analysis:**
The preprocessor uses deprecated `infer_datetime_format` parameter:
```python
pd.to_datetime(series.dropna().head(100), errors='raise', infer_datetime_format=True)
```

This parameter was deprecated in pandas 2.0 and will be removed. The warning indicates pandas is falling back to dateutil parsing.

**Solution:**
Remove the deprecated parameter. Pandas 2.0+ automatically infers formats efficiently without this parameter.

**Changes Required:**
In `python-service/services/preprocessor.py` line 113:
```python
# Before
pd.to_datetime(series.dropna().head(100), errors='raise', infer_datetime_format=True)

# After
pd.to_datetime(series.dropna().head(100), errors='raise')
```

**Rationale:**
- Pandas 2.0+ has improved automatic format inference
- Removing deprecated parameter eliminates warning
- No functional change in behavior
- If specific format needed, can add `format='%Y-%m-%d'` parameter later

### 5. Source Map Warnings Suppression

**Problem Analysis:**
Invalid source map warnings from Next.js node_modules files:
- `next/dist/server/dev/next-dev-server.js`
- `next/dist/trace/trace.js`
- `next/dist/server/lib/router-server.js`
- `next/dist/server/lib/start-server.js`

These are third-party dependency issues, not application code issues.

**Solution Options:**

**Option A: Suppress Warnings (Recommended)**
Add Node.js flag to suppress source map warnings for node_modules:
```json
// package.json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--no-warnings' next dev"
  }
}
```

**Option B: Ignore Source Map Errors**
Configure Next.js to ignore source map errors:
```javascript
// next.config.ts
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.ignoreWarnings = [
        /Failed to parse source map/,
        /Invalid source map/,
      ];
    }
    return config;
  },
};
```

**Option C: Clear and Rebuild**
Sometimes source maps get corrupted:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**Recommended Approach:**
Use Option B (webpack config) as it's most targeted and doesn't suppress other useful warnings.

## Data Models

No data model changes required. All fixes are implementation-level only.

## Error Handling

### Story Retrieval Error Handling

Enhanced error responses for story retrieval:

```typescript
// Invalid ObjectId format
if (!mongoose.Types.ObjectId.isValid(storyId)) {
  return NextResponse.json(
    { error: { code: 'INVALID_ID', message: 'Invalid story ID format' } },
    { status: 400 }
  );
}

// Story not found
if (!story) {
  console.log(`Story not found: ${storyId} for user: ${userId}`);
  return NextResponse.json(
    { error: { code: 'NOT_FOUND', message: 'Story not found' } },
    { status: 404 }
  );
}

// Database errors
catch (error) {
  console.error('Error fetching story:', error);
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch story', retryable: true } },
    { status: 500 }
  );
}
```

### File Upload Error Handling

Current error handling is comprehensive. Verify:
- Network errors are caught and reported
- Server validation errors are displayed
- User-friendly messages for common issues

## Testing Strategy

### Manual Testing Checklist

**Story Retrieval:**
1. Navigate to existing story URL
2. Verify story loads without 404 error
3. Check browser console for no params errors
4. Test with invalid story ID
5. Test with story belonging to different user

**File Upload:**
1. Click dropzone to open file picker
2. Select CSV file
3. Verify upload progress shows
4. Verify redirect to processing page
5. Check network tab for FormData request

**Mongoose Indexes:**
1. Restart development server
2. Check console for no duplicate index warnings
3. Verify application starts normally
4. Test database queries work correctly

**Python Date Parsing:**
1. Upload CSV with date columns
2. Check Python service logs
3. Verify no UserWarning about date format inference
4. Verify dates are parsed correctly

**Source Maps:**
1. Start development server
2. Check console for reduced warnings
3. Verify application debugging still works

### Automated Testing

No new automated tests required. Existing tests should pass:
- `__tests__/upload.test.ts` - Verify upload flow
- `__tests__/auth.test.ts` - Verify auth still works
- `__tests__/e2e.test.ts` - Verify end-to-end flow

## Implementation Order

1. **Story Retrieval Fix** (Highest Priority)
   - Blocks users from viewing stories
   - Quick fix, low risk

2. **Mongoose Index Deduplication** (High Priority)
   - Clean up development environment
   - Prevent potential index conflicts

3. **Python Date Parsing** (Medium Priority)
   - Clean up logs
   - Remove deprecated code

4. **Source Map Warnings** (Low Priority)
   - Cosmetic issue
   - Doesn't affect functionality

5. **File Upload Verification** (As Needed)
   - Only if testing reveals issues
   - Currently appears to work correctly

## Rollback Strategy

All changes are isolated and can be reverted independently:

1. **Story Route**: Revert single file change
2. **Mongoose Models**: Revert index changes per model
3. **Python Preprocessor**: Revert single line change
4. **Source Maps**: Remove webpack config or revert package.json

No database migrations or data changes required.

## Performance Considerations

- **Index Changes**: No performance impact (same indexes, just declared once)
- **Params Await**: Negligible performance impact (microseconds)
- **Date Parsing**: Potential slight improvement (pandas 2.0 optimizations)
- **Source Maps**: No runtime performance impact (dev only)

## Security Considerations

- **Story Retrieval**: Maintains existing authorization checks
- **File Upload**: No changes to validation or security
- **Indexes**: No security implications
- **All fixes**: No new attack vectors introduced
