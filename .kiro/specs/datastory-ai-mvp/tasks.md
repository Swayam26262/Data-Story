# Implementation Plan

This implementation plan breaks down the DataStory AI MVP into discrete, actionable coding tasks. Each task builds incrementally on previous work, ensuring no orphaned code. Tasks are organized to deliver core functionality first, with optional testing tasks marked with *.

## Task List

- [x] 1. Initialize project structure and development environment





  - Set up Next.js 15 project with TypeScript and TailwindCSS configuration
  - Configure ESLint, Prettier, and Git hooks for code quality
  - Create folder structure: `/app`, `/components`, `/lib`, `/types`, `/api`
  - Set up environment variables template (`.env.example`)
  - Initialize Git repository with `.gitignore` for Node.js and Next.js
  - _Requirements: Foundation for all subsequent development_

- [x] 2. Set up database and storage infrastructure





  - Configure MongoDB Atlas connection with Mongoose ODM
  - Create database schema files for User, Story, Job, and Session models
  - Implement database connection utility with connection pooling and error handling
  - Configure AWS S3 bucket with appropriate CORS and lifecycle policies
  - Create S3 utility functions for file upload, download, and presigned URL generation
  - _Requirements: 2.1, 7.2, 12.2_

- [x] 3. Implement authentication system





  - [x] 3.1 Create user registration functionality


    - Build User model with password hashing using bcrypt
    - Implement `/api/auth/register` endpoint with email validation and password complexity checks
    - Create JWT token generation utility with 7-day expiration
    - Add duplicate email detection and appropriate error responses
    - _Requirements: 1.1, 1.4_
  
  - [x] 3.2 Create user login functionality


    - Implement `/api/auth/login` endpoint with credential verification
    - Create session management with httpOnly cookies
    - Add "remember me" functionality for 30-day sessions
    - Implement rate limiting to prevent brute force attacks (5 attempts per 15 minutes)
    - _Requirements: 1.2, 1.3_
  
  - [x] 3.3 Build password reset flow


    - Implement `/api/auth/reset-password` endpoint to generate reset tokens
    - Create password reset token storage with 1-hour expiration
    - Build password update endpoint that validates reset tokens
    - Add email notification placeholder (console log for MVP)
    - _Requirements: 1.5_
  
  - [x] 3.4 Create authentication middleware


    - Build middleware to verify JWT tokens on protected routes
    - Implement user session validation and refresh logic
    - Add authorization helper to check resource ownership
    - Create logout endpoint that invalidates sessions
    - _Requirements: 1.2, 1.3, 12.3_
  
  - [x] 3.5 Write authentication tests


    - Create unit tests for registration with valid and invalid inputs
    - Test login flow including session creation and token validation
    - Test password reset token generation and expiration
    - Test authentication middleware with valid, expired, and missing tokens
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. Build frontend authentication UI





  - [x] 4.1 Create authentication page layouts


    - Build responsive login page with email and password inputs
    - Create registration page with password confirmation and strength indicator
    - Implement password reset request page
    - Add form validation with real-time error messages
    - Style with TailwindCSS following modern design patterns
    - _Requirements: 1.1, 1.4_
  
  - [x] 4.2 Implement authentication state management


    - Create React context for authentication state (user, token, tier)
    - Build custom hooks: `useAuth`, `useUser`, `useRequireAuth`
    - Implement client-side route protection for authenticated pages
    - Add automatic token refresh logic before expiration
    - _Requirements: 1.2, 1.3_
  
  - [x] 4.3 Connect authentication UI to API


    - Implement form submission handlers with loading states
    - Add error handling and user-friendly error message display
    - Create success redirects after login/registration
    - Implement logout functionality with state cleanup
    - _Requirements: 1.1, 1.2_

- [x] 5. Implement tier management and usage tracking





  - [x] 5.1 Create tier configuration system


    - Define tier limits in configuration file (stories/month, max rows, features)
    - Add tier field to User model with default "free" value
    - Create utility functions to check tier limits and permissions
    - Implement monthly usage counter reset logic (runs on 1st of month)
    - _Requirements: 9.1, 9.3, 9.4_
  
  - [x] 5.2 Build usage tracking functionality


    - Create middleware to increment story count on successful generation
    - Implement usage check before allowing story creation
    - Add endpoint `/api/usage` to return current usage and limits
    - Build usage reset scheduled job (cron or serverless function)
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [x] 5.3 Create upgrade prompts and UI


    - Build upgrade modal component with tier comparison table
    - Implement trigger logic when users hit limits
    - Create upgrade CTA buttons in dashboard and story viewer
    - Add "Powered by DataStory AI" badge component for free tier
    - _Requirements: 9.2, 9.6_

- [x] 6. Build dashboard and story management UI





  - [x] 6.1 Create dashboard layout


    - Build responsive dashboard layout with navigation sidebar
    - Implement top navigation bar with user menu and logout
    - Create main content area with grid layout for story cards
    - Add usage indicator showing remaining stories for current month
    - Style with TailwindCSS for professional appearance
    - _Requirements: 7.3, 9.5_
  
  - [x] 6.2 Implement story list and card components


    - Create StoryCard component displaying thumbnail, title, date, metadata
    - Build story list view with grid layout (responsive: 1-3 columns)
    - Implement empty state when user has no stories
    - Add loading skeleton components for async data fetching
    - _Requirements: 7.3_
  
  - [x] 6.3 Connect dashboard to story API


    - Implement `/api/stories` endpoint to fetch user's stories with pagination
    - Create React hook to fetch and cache story list
    - Add pull-to-refresh or auto-refresh functionality
    - Implement error handling for failed story fetches
    - _Requirements: 7.3_

- [x] 7. Implement file upload functionality





  - [x] 7.1 Create upload UI component


    - Build drag-and-drop upload zone with visual feedback
    - Add file input with "Browse" button as alternative
    - Implement file type validation (CSV, .xlsx, .xls only)
    - Create upload progress bar with percentage display
    - Add file size and row count limit indicators
    - _Requirements: 2.1, 2.2, 2.5_
  
  - [x] 7.2 Build file upload API endpoint


    - Implement `/api/upload` endpoint accepting multipart form data
    - Add authentication check and tier limit validation
    - Create file validation logic (type, size, row count)
    - Upload validated file to S3 with unique key (userId/timestamp/filename)
    - Create Job record in database with "queued" status
    - Return jobId to client for status polling
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 9.1, 9.4_
  
  - [x] 7.3 Implement client-side upload flow


    - Create upload form submission handler with FormData
    - Add file validation before upload (client-side checks)
    - Implement upload progress tracking using XHR or fetch with progress events
    - Handle upload errors with retry option
    - Redirect to processing status page after successful upload
    - _Requirements: 2.1, 2.2, 10.1_
  
  - [x] 7.4 Write upload validation tests


    - Test file type validation (accept CSV/Excel, reject others)
    - Test file size limits for different tiers
    - Test row count validation
    - Test tier limit enforcement (3 stories for free tier)
    - _Requirements: 2.2, 2.5, 9.1, 9.4_


- [x] 8. Set up Python analysis service




  - [x] 8.1 Initialize FastAPI project


    - Create Python project structure with virtual environment
    - Set up FastAPI application with CORS middleware
    - Configure environment variables for OpenAI API key, MongoDB, S3
    - Create Dockerfile for containerization
    - Add health check endpoint `/health`
    - _Requirements: Foundation for analysis functionality_
  
  - [x] 8.2 Implement data preprocessing module


    - Create DataPreprocessor class to read CSV and Excel files
    - Implement automatic data type detection (numeric, categorical, datetime, text)
    - Build missing value handler with mean/mode imputation
    - Add data validation (minimum 2 columns, 10 rows)
    - Create function to return cleaned pandas DataFrame with metadata
    - _Requirements: 2.3, 2.4, 2.6_
  
  - [x] 8.3 Build statistical analysis engine


    - Create TrendDetector to identify temporal patterns using linear regression
    - Implement CorrelationCalculator for Pearson correlation matrix (filter |r| > 0.5)
    - Build DistributionAnalyzer for mean, median, std dev, skewness
    - Create OutlierDetector using IQR method
    - Implement FrequencyAnalyzer for categorical value counts
    - Return structured analysis results as JSON
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  
  - [x] 8.4 Create visualization selector


    - Build rule-based chart type selection algorithm
    - Implement decision logic: datetime → line, categorical → bar, correlation → scatter, proportional → pie
    - Create function to select 3-4 most informative visualizations
    - Generate chart configuration objects with data and styling parameters
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 8.5 Write analysis engine tests


    - Test data preprocessing with various CSV/Excel formats
    - Test statistical calculations with known datasets
    - Test chart selection logic with different data characteristics
    - Test edge cases (missing values, outliers, small datasets)
    - _Requirements: 2.3, 3.1, 3.2, 5.1_

- [x] 9. Implement Gemini AI narrative generation




  - [x] 9.1 Create narrative generation module


    - Build NarrativeGenerator class with Google Gemini API client (google-generativeai library)
    - Create structured prompt template with placeholders for statistical results
    - Implement prompt construction from analysis results
    - Add system instruction defining output format (3 sections, word counts)
    - Configure Gemini parameters (temperature, max_output_tokens, model: gemini-1.5-flash for free tier)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 9.2 Implement retry logic and validation

    - Add exponential backoff retry mechanism (3 attempts: 1s, 2s, 4s delays)
    - Implement response parsing to extract three narrative sections
    - Create validation function to check numerical claims against source data
    - Add error handling for API timeouts and rate limits
    - Log all Gemini API interactions for debugging and usage tracking
    - _Requirements: 4.5, 4.6_
  
  - [x] 9.3 Build analysis API endpoint


    - Create POST `/analyze` endpoint in FastAPI
    - Implement request handler: download file from S3, preprocess, analyze, generate narrative
    - Coordinate all analysis steps and aggregate results
    - Return complete story payload (narratives + chart configs + statistics)
    - Add error handling for each processing stage
    - Update Job status in MongoDB throughout processing
    - _Requirements: 3.6, 4.6, 10.4_
  
  - [x] 9.4 Write narrative generation tests


    - Mock Gemini API responses for testing
    - Test prompt construction with various analysis results
    - Test retry logic with simulated API failures
    - Test narrative validation against statistical data
    - _Requirements: 4.1, 4.5, 4.6_

- [x] 10. Create job processing and status tracking





  - [x] 10.1 Build job status API

    - Implement GET `/api/jobs/:jobId` endpoint
    - Return job status, progress percentage, current stage
    - Add authorization check (user owns job)
    - Include storyId when job completes successfully
    - Return error details if job failed
    - _Requirements: 10.2_
  

  - [x] 10.2 Create job orchestration logic

    - Build function to trigger Python analysis service from upload endpoint
    - Implement async job processing (don't block upload response)
    - Add job status update callbacks from Python service
    - Create job completion handler that creates Story record
    - Implement job failure handler with error logging
    - _Requirements: 3.6, 7.2, 10.4_
  
  - [x] 10.3 Build processing status UI

    - Create ProcessingStatus component with multi-stage progress indicator
    - Implement polling mechanism to check job status every 2 seconds
    - Display current stage: Uploading → Analyzing → Generating → Visualizing
    - Add estimated time remaining calculation
    - Show error message with retry button if job fails
    - Redirect to story viewer when job completes
    - _Requirements: 10.2, 10.3, 10.4_

- [x] 11. Implement story viewer with scrollytelling





  - [x] 11.1 Create chart components


    - Build LineChart component using D3.js or Recharts for time series
    - Create BarChart component with horizontal/vertical orientation
    - Implement ScatterPlot component with optional trend line
    - Build PieChart component with percentage labels
    - Make all charts responsive with SVG viewBox scaling
    - Add tooltips showing exact values on hover
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_
  
  - [x] 11.2 Build scrollytelling interface


    - Create StoryViewer component with scroll-snap container
    - Implement narrative sections with typography hierarchy
    - Add scroll-triggered fade-in animations for charts (Intersection Observer API)
    - Position charts adjacent to narrative text with proper spacing
    - Create scroll progress indicator
    - Add "Powered by DataStory AI" badge for free tier users
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.6_
  
  - [x] 11.3 Connect story viewer to API


    - Implement GET `/api/stories/:storyId` endpoint
    - Return complete story data (narratives, charts, metadata)
    - Add authorization check (user owns story or story is public)
    - Create React hook to fetch story data
    - Implement loading state with skeleton UI
    - Add error handling for missing or unauthorized stories
    - _Requirements: 7.4_
  
  - [x] 11.4 Implement responsive design


    - Test story viewer on mobile (320px-767px), tablet (768px-1023px), desktop (1024px+)
    - Stack narrative and charts vertically on mobile
    - Adjust chart sizes for different screen widths
    - Ensure touch-friendly interactions (44px minimum tap targets)
    - Test on Chrome, Firefox, Safari, Edge browsers
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 12. Implement story management features






  - [x] 12.1 Add story deletion functionality

    - Create DELETE `/api/stories/:storyId` endpoint
    - Add authorization check (user owns story)
    - Delete story from MongoDB and associated S3 files
    - Decrement user's story count for current month
    - Return success response
    - _Requirements: 7.5_
  
  - [x] 12.2 Build delete UI


    - Add delete button to StoryCard component
    - Implement confirmation dialog before deletion
    - Show loading state during deletion
    - Remove story from list after successful deletion
    - Display error message if deletion fails
    - _Requirements: 7.5_
  
  - [x] 12.3 Implement story metadata display


    - Show creation date in human-readable format (e.g., "2 days ago")
    - Display dataset statistics (row count, column count)
    - Show processing time and chart count
    - Add story title editing functionality (optional for MVP)
    - _Requirements: 7.3, 7.4_

- [x] 13. Build PDF export functionality





  - [x] 13.1 Create PDF generation service


    - Install and configure PDF library (e.g., Puppeteer, jsPDF, or PDFKit)
    - Create PDF template with consistent formatting (16pt headings, 11pt body)
    - Implement function to convert story HTML to PDF
    - Embed chart images at 300 DPI resolution
    - Add DataStory AI branding in footer for free tier
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_
  
  - [x] 13.2 Build export API endpoint


    - Implement POST `/api/stories/:storyId/export` endpoint
    - Add authorization check (user owns story)
    - Generate PDF and return as file stream
    - Set appropriate headers for file download
    - Add error handling for PDF generation failures
    - _Requirements: 8.1, 8.5_
  
  - [x] 13.3 Create export UI


    - Add "Export PDF" button to story viewer
    - Show loading state during PDF generation
    - Trigger file download when PDF ready
    - Display error message if export fails
    - Log export events for analytics
    - _Requirements: 8.1_

- [x] 14. Implement error handling and user feedback





  - [x] 14.1 Create error handling utilities


    - Build centralized error handler for API routes
    - Create error response formatter with consistent structure
    - Implement error logging to console/file (CloudWatch for production)
    - Add error categorization (user error, system error, external service error)
    - _Requirements: 10.1, 10.3, 10.4, 10.5_
  
  - [x] 14.2 Build user-facing error components


    - Create ErrorMessage component with icon and message
    - Build ErrorBoundary component to catch React errors
    - Implement toast notification system for transient errors
    - Add retry buttons for retryable errors
    - Create 404 and 500 error pages
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [x] 14.3 Add progress indicators


    - Implement loading spinners for async operations
    - Create skeleton loaders for dashboard and story viewer
    - Add progress bars for file upload and story generation
    - Show estimated time remaining during processing
    - _Requirements: 10.2_

- [x] 15. Implement security measures





  - [x] 15.1 Add input validation and sanitization


    - Validate all user inputs (email format, password complexity, file types)
    - Sanitize inputs to prevent XSS and injection attacks
    - Implement file type validation using magic numbers
    - Add file size limits (10 MB for MVP)
    - _Requirements: 1.4, 2.5, 12.1, 12.6_
  

  - [x] 15.2 Configure security headers and CORS

    - Add Helmet.js for security headers (CSP, X-Frame-Options, etc.)
    - Configure CORS to whitelist only Vercel domain
    - Implement CSRF protection with SameSite cookies
    - Add rate limiting middleware (100 requests/hour per user)
    - _Requirements: 12.1, 12.6_
  
  - [x] 15.3 Implement data encryption


    - Configure TLS 1.3 for all connections (Vercel default)
    - Ensure S3 bucket has server-side encryption enabled (AES-256)
    - Verify MongoDB Atlas encryption at rest is enabled
    - Create S3 presigned URLs with 1-hour expiration
    - Never log sensitive data (passwords, tokens, dataset contents)
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

- [-] 16. Set up deployment and CI/CD


  - [x] 16.1 Configure Vercel deployment for Next.js frontend


    - Connect GitHub repository to Vercel
    - Configure environment variables in Vercel dashboard
    - Set up automatic deployments on push to main branch
    - Configure custom domain (optional for MVP)
    - Test deployment with sample data
    - _Requirements: Deployment infrastructure_
  
  - [x] 16.2 Deploy Python service to Vercel







    - Create vercel.json configuration for Python FastAPI service
    - Set up Python service as Vercel serverless function
    - Configure environment variables for Python service in Vercel
    - Set up CORS to allow requests from Next.js frontend
    - Test Python service endpoint from Next.js app
    - Verify Cloudinary integration for file storage
    - _Requirements: Deployment infrastructure_
  
  - [x] 16.3 Set up CI/CD pipeline





    - Create GitHub Actions workflow for automated testing
    - Add linting step (ESLint, Prettier, Black for Python) to CI pipeline
    - Run unit tests on every pull request
    - Configure automatic deployment to staging on merge to develop branch
    - Set up production deployment on merge to main branch
    - _Requirements: Development workflow_
  
  - [x] 16.4 Configure monitoring and logging









    - Set up Vercel Analytics for frontend performance monitoring
    - Configure Vercel logs for Python service monitoring
    - Set up MongoDB Atlas monitoring and alerts
    - Integrate error tracking (Vercel built-in or Sentry)
    - Monitor Cloudinary usage and storage metrics
    - _Requirements: Observability_

- [x] 17. Final integration and testing





  - [x] 17.1 Perform end-to-end testing


    - Test complete user journey: register → login → upload → view story → export PDF → logout
    - Verify tier limits enforcement (3 stories for free tier, 1000 row limit)
    - Test error scenarios (invalid file, API failures, network issues)
    - Verify responsive design on mobile, tablet, desktop
    - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
    - _Requirements: All requirements_
  
  - [x] 17.2 Optimize performance


    - Run Lighthouse audit and address performance issues
    - Optimize images and assets for faster loading
    - Implement code splitting for faster initial page load
    - Add caching headers for static assets
    - Optimize database queries with proper indexes
    - _Requirements: 3.6, 6.5, 10.6, 11.5_
  
  - [x] 17.3 Prepare for launch


    - Create sample datasets for demo purposes
    - Write user documentation (README, getting started guide)
    - Set up analytics tracking (user signups, story generations, exports)
    - Create landing page with product description and signup CTA
    - Prepare Product Hunt launch materials (screenshots, demo video)
    - _Requirements: Go-to-market preparation_

## Implementation Notes

- **Task Dependencies**: Tasks should be completed in order as each builds on previous work
- **Optional Tasks**: Tasks marked with * are optional testing tasks that can be skipped to focus on core functionality
- **Estimated Timeline**: 12-16 weeks for complete MVP with 1-2 developers
- **Testing Strategy**: Focus on manual testing during MVP; expand automated testing post-launch
- **Deployment**: Deploy early and often to catch integration issues
- **User Feedback**: Launch to beta users after Task 11 to gather feedback before PDF export and polish

## Success Criteria

- User can register, login, and manage account
- User can upload CSV/Excel file up to 1000 rows
- System generates story with 3 narrative sections and 3-4 charts in under 60 seconds
- Story displays in scrollytelling format with smooth animations
- User can export story as PDF
- Free tier limits enforced (3 stories/month, 1000 rows)
- Application works on mobile, tablet, and desktop
- All critical user flows have error handling
- Application deployed to production with monitoring
