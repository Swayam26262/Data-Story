# End-to-End Testing Checklist

This document provides a comprehensive manual testing checklist for the DataStory AI MVP.

## Complete User Journey Testing

### 1. User Registration
- [ ] Navigate to registration page
- [ ] Enter valid email and strong password (8+ chars, mixed case, number)
- [ ] Verify password confirmation matches
- [ ] Submit form and verify redirect to dashboard
- [ ] Verify welcome message or onboarding flow
- [ ] Check that user tier is set to "free"
- [ ] Verify 3 stories remaining indicator shows

**Error Cases:**
- [ ] Try registering with existing email - should show error
- [ ] Try weak password (e.g., "test") - should show validation error
- [ ] Try invalid email format - should show validation error
- [ ] Try mismatched password confirmation - should show error

### 2. User Login
- [ ] Navigate to login page
- [ ] Enter registered email and password
- [ ] Check "Remember me" option
- [ ] Submit and verify redirect to dashboard
- [ ] Verify user name/email displayed in header
- [ ] Verify session persists after page refresh

**Error Cases:**
- [ ] Try incorrect password - should show error
- [ ] Try non-existent email - should show error
- [ ] Verify rate limiting after 5 failed attempts

### 3. File Upload
- [ ] Navigate to upload page from dashboard
- [ ] Test drag-and-drop with valid CSV file
- [ ] Verify file preview shows (filename, size, row count estimate)
- [ ] Click "Upload" button
- [ ] Verify progress bar appears and updates
- [ ] Verify redirect to processing status page

**File Types to Test:**
- [ ] CSV file (.csv) - should accept
- [ ] Excel file (.xlsx) - should accept
- [ ] Excel file (.xls) - should accept
- [ ] Text file (.txt) - should reject with error
- [ ] PDF file (.pdf) - should reject with error
- [ ] Image file (.jpg) - should reject with error

**Data Validation:**
- [ ] Upload file with 10 rows - should accept
- [ ] Upload file with 1000 rows - should accept
- [ ] Upload file with 1001 rows - should reject (free tier limit)
- [ ] Upload file with missing values - should accept and handle
- [ ] Upload file with only 1 column - should reject
- [ ] Upload file with only 5 rows - should reject (minimum 10)

### 4. Tier Limits Enforcement
- [ ] Create 1st story - should succeed
- [ ] Create 2nd story - should succeed
- [ ] Create 3rd story - should succeed
- [ ] Attempt 4th story - should show upgrade prompt
- [ ] Verify upgrade modal displays tier comparison
- [ ] Verify "Powered by DataStory AI" badge on free tier stories
- [ ] Check usage indicator updates after each story

### 5. Processing Status
- [ ] Verify processing page shows after upload
- [ ] Check multi-stage progress indicator displays
- [ ] Verify stages: Uploading → Analyzing → Generating → Visualizing
- [ ] Check estimated time remaining updates
- [ ] Verify automatic redirect to story viewer when complete
- [ ] Test manual refresh during processing

**Error Cases:**
- [ ] Simulate processing failure - should show error with retry button
- [ ] Test cancel button - should abort processing

### 6. Story Viewer (Scrollytelling)
- [ ] Verify story loads and displays title
- [ ] Check all 3 narrative sections present (Summary, Findings, Recommendations)
- [ ] Scroll through story and verify charts fade in
- [ ] Verify charts positioned adjacent to narrative text
- [ ] Check scroll-snap behavior works smoothly
- [ ] Verify scroll progress indicator updates
- [ ] Test chart tooltips on hover
- [ ] Verify responsive chart sizing

**Chart Types to Verify:**
- [ ] Line chart for time series data
- [ ] Bar chart for categorical comparisons
- [ ] Scatter plot for correlations
- [ ] Pie chart for proportional data

### 7. Dashboard and Story Management
- [ ] Navigate to dashboard
- [ ] Verify all user stories displayed as cards
- [ ] Check story cards show: thumbnail, title, date, metadata
- [ ] Verify stories sorted by creation date (newest first)
- [ ] Test empty state when no stories exist
- [ ] Verify loading skeleton appears during fetch

### 8. PDF Export
- [ ] Open a story
- [ ] Click "Export PDF" button
- [ ] Verify loading state during generation
- [ ] Check PDF downloads automatically
- [ ] Open PDF and verify:
  - [ ] All narrative sections included
  - [ ] All charts embedded at high resolution
  - [ ] Consistent formatting (16pt headings, 11pt body)
  - [ ] DataStory AI branding in footer (free tier)
  - [ ] Filename format: datastory-{id}-{date}.pdf

**Error Cases:**
- [ ] Test export with very large story - should complete within 10 seconds
- [ ] Test export failure - should show error message

### 9. Story Deletion
- [ ] Click delete button on story card
- [ ] Verify confirmation dialog appears
- [ ] Cancel deletion - story should remain
- [ ] Confirm deletion - story should be removed
- [ ] Verify story removed from dashboard immediately
- [ ] Verify usage count decremented
- [ ] Try accessing deleted story URL - should show 404

### 10. User Logout
- [ ] Click logout button in user menu
- [ ] Verify redirect to login page
- [ ] Try accessing protected route - should redirect to login
- [ ] Verify session cleared (no auto-login on return)

## Responsive Design Testing

### Mobile (320px - 767px)
- [ ] Test on iPhone SE (375px)
- [ ] Test on iPhone 12 Pro (390px)
- [ ] Test on Samsung Galaxy S21 (360px)
- [ ] Verify navigation menu collapses to hamburger
- [ ] Check story cards stack vertically
- [ ] Verify charts scale to full width
- [ ] Test touch interactions (tap, swipe, scroll)
- [ ] Verify minimum 44px tap targets
- [ ] Check text remains readable (no horizontal scroll)

### Tablet (768px - 1023px)
- [ ] Test on iPad (768px)
- [ ] Test on iPad Pro (1024px)
- [ ] Verify 2-column grid for story cards
- [ ] Check navigation shows full menu
- [ ] Verify charts display side-by-side with narrative

### Desktop (1024px+)
- [ ] Test on 1920x1080 display
- [ ] Test on 2560x1440 display
- [ ] Verify 3-column grid for story cards
- [ ] Check maximum content width constraint
- [ ] Verify charts don't exceed optimal size

## Cross-Browser Compatibility

### Chrome (v120+)
- [ ] Test all core functionality
- [ ] Verify file upload works
- [ ] Check chart rendering
- [ ] Test PDF export

### Firefox (v120+)
- [ ] Test all core functionality
- [ ] Verify file upload works
- [ ] Check chart rendering
- [ ] Test PDF export

### Safari (v17+)
- [ ] Test all core functionality
- [ ] Verify file upload works
- [ ] Check chart rendering
- [ ] Test PDF export
- [ ] Test on iOS Safari

### Edge (v120+)
- [ ] Test all core functionality
- [ ] Verify file upload works
- [ ] Check chart rendering
- [ ] Test PDF export

## Error Handling Testing

### Network Errors
- [ ] Disconnect network during upload - should show retry option
- [ ] Disconnect during story generation - should handle gracefully
- [ ] Test slow 3G connection - should show appropriate loading states

### API Failures
- [ ] Simulate 500 error from backend - should show error message
- [ ] Simulate timeout - should retry and show error after 3 attempts
- [ ] Test rate limiting - should show appropriate message

### Invalid Data
- [ ] Upload corrupted CSV - should show specific error
- [ ] Upload CSV with no valid columns - should reject
- [ ] Upload CSV with all missing values - should reject

### Authentication Errors
- [ ] Try accessing protected route without login - should redirect
- [ ] Try accessing another user's story - should show 403
- [ ] Let session expire - should prompt re-login

## Performance Testing

### Load Times
- [ ] Measure initial page load - target < 3 seconds
- [ ] Measure dashboard load with 10 stories - target < 2 seconds
- [ ] Measure story viewer load - target < 2 seconds
- [ ] Test on 4G mobile connection

### Processing Times
- [ ] Upload 100-row dataset - should complete < 30 seconds
- [ ] Upload 500-row dataset - should complete < 45 seconds
- [ ] Upload 1000-row dataset - should complete < 60 seconds

### Lighthouse Audit
- [ ] Run Lighthouse on homepage - target score > 90
- [ ] Run Lighthouse on dashboard - target score > 85
- [ ] Run Lighthouse on story viewer - target score > 85
- [ ] Check Performance, Accessibility, Best Practices, SEO scores

## Security Testing

### Authentication
- [ ] Verify passwords are not visible in network requests
- [ ] Check JWT tokens are httpOnly cookies
- [ ] Verify session expires after 7 days
- [ ] Test CSRF protection

### Authorization
- [ ] Try accessing another user's story - should fail
- [ ] Try deleting another user's story - should fail
- [ ] Verify API endpoints check user ownership

### Data Protection
- [ ] Verify all connections use HTTPS
- [ ] Check uploaded files are encrypted in S3
- [ ] Verify deleted data is actually removed
- [ ] Test that user data is isolated

## Accessibility Testing

- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios (WCAG AA)
- [ ] Test with browser zoom at 200%
- [ ] Verify form labels and ARIA attributes

## Test Data Sets

### Sample CSV Files to Use

**1. Sales Data (Time Series)**
```csv
Date,Sales,Region
2024-01-01,1000,North
2024-01-02,1200,South
...
```

**2. Customer Data (Categorical)**
```csv
Customer,Age,Segment,Revenue
John,35,Premium,5000
Jane,28,Standard,2000
...
```

**3. Product Performance (Mixed)**
```csv
Product,Category,Units,Revenue,Rating
Widget A,Electronics,150,15000,4.5
Widget B,Home,200,8000,4.2
...
```

## Success Criteria

All tests should pass with:
- ✅ User can complete full journey without errors
- ✅ Tier limits enforced correctly
- ✅ All error scenarios handled gracefully
- ✅ Responsive design works on all screen sizes
- ✅ Compatible with all major browsers
- ✅ Performance meets targets (< 3s load, < 60s generation)
- ✅ Security measures in place
- ✅ Accessibility standards met

## Notes

- Document any bugs found with screenshots
- Record browser console errors
- Note any performance issues
- Capture network request failures
- Test with real user data when possible
