# Test Suite Documentation

## Overview

This directory contains comprehensive tests for the Professional Data Visualization feature, covering all aspects from data processing to chart rendering, interactions, and exports.

## Test Files

### 1. `e2e.test.ts` - End-to-End User Journey Tests
Tests complete user flows through the application:
- User registration and authentication
- File upload and validation
- Story generation and viewing
- Tier limits enforcement
- PDF export
- Story deletion

**Run with:** `npm run test:e2e`

### 2. `integration.test.ts` - Integration Tests
Tests the integration of multiple components and systems:
- Data upload and preprocessing
- Statistical analysis and aggregation
- Performance optimization
- Accessibility features
- Chart type variety
- Large dataset handling (10K, 100K rows)
- Export functionality
- Responsive design data handling
- Statistical overlay calculations
- Cross-browser compatibility

**Run with:** `npm test __tests__/integration.test.ts`

### 3. `comprehensive-e2e.test.ts` - Comprehensive Chart Tests
Tests all advanced chart types and features:
- **Advanced Chart Types:**
  - Combination charts
  - Heatmaps
  - Box plots
  - Waterfall charts
  - Funnel charts
  - Radar charts
  - Candlestick charts
  
- **Statistical Overlays:**
  - Trend lines with R-squared
  - Moving averages
  - Outlier detection (IQR method)
  - Confidence intervals
  
- **Interactive Features:**
  - Zoom and pan
  - Brush selection
  - Legend toggle
  - Cross-chart highlighting
  
- **Export Functionality:**
  - PNG export (high DPI)
  - SVG export
  - CSV export
  - JSON export with metadata
  
- **Performance:**
  - 10K row handling
  - 100K row handling
  - Canvas rendering decisions
  - Performance monitoring
  
- **Responsive Design:**
  - Mobile viewport adaptation
  - Tablet viewport adaptation
  - Touch interaction support
  
- **Accessibility:**
  - ARIA labels
  - WCAG AA contrast
  - Screen reader summaries
  - Keyboard navigation
  
- **Comparative Visualizations:**
  - Small multiples
  - Bullet charts
  - Sparklines
  - KPI cards
  
- **Aggregation:**
  - All time periods (daily, weekly, monthly, quarterly, yearly)
  - Time comparisons (YoY, MoM, QoQ)

**Run with:** `npm test __tests__/comprehensive-e2e.test.ts`

### 4. `accessibility.test.ts` - Accessibility Tests
Focused tests for accessibility features:
- Chart descriptions generation
- Chart summaries with statistics
- Data point labels
- Color contrast validation
- Contrast ratio calculations
- Keyboard navigation
- Screen reader announcements

**Run with:** `npm test __tests__/accessibility.test.ts`

### 5. `aggregation.test.ts` - Aggregation Tests
Tests for data aggregation functionality:
- Date field detection
- Value field detection
- Time period aggregation
- Aggregation functions (sum, avg)
- Time period comparisons

**Run with:** `npm test __tests__/aggregation.test.ts`

### 6. `upload.test.ts` - File Upload Tests
Tests for file upload and validation:
- File type validation
- File size limits
- CSV parsing
- Excel parsing
- Error handling

### 7. `auth.test.ts` - Authentication Tests
Tests for user authentication:
- Registration
- Login
- Token validation
- Password hashing
- Session management

### 8. `job-orchestration.test.ts` - Job Processing Tests
Tests for background job processing:
- Job creation
- Job status tracking
- Job completion
- Error handling
- Retry logic

## Test Coverage

### Requirements Coverage

All requirements from the Professional Data Visualization spec are covered:

#### Requirement 1: Advanced Chart Types ✅
- Combination charts
- Heatmaps
- Box plots
- Waterfall charts
- Funnel charts
- Radar charts
- Area charts
- Candlestick charts

#### Requirement 2: Statistical Analysis ✅
- Trend lines with R-squared
- Correlation calculations
- Outlier detection
- Moving averages
- Regression analysis
- Year-over-year growth
- Seasonal patterns
- Distribution statistics

#### Requirement 3: Interactive Features ✅
- Detailed tooltips
- Legend interactions
- Zoom controls
- Pan functionality
- Cross-chart highlighting
- Brush selection
- Export functionality
- Aggregation level switching

#### Requirement 4: Professional Visual Design ✅
- Color palettes
- Typography
- Gridlines
- Spacing
- Data-ink ratio
- Color schemes
- Axis labels
- Animations

#### Requirement 5: Tooltips and Annotations ✅
- Rich tooltips
- Custom annotations
- Reference lines
- Data labels
- Shaded regions
- Significance markers
- HTML content
- Intelligent positioning

#### Requirement 6: Comparative Visualizations ✅
- Small multiples
- Bullet charts
- Diverging bar charts
- Period comparisons
- Sparklines
- Performance indicators
- KPI cards
- Side-by-side comparisons

#### Requirement 7: Large Dataset Handling ✅
- Data sampling (>1000 points)
- Virtualization (>5000 points)
- Progressive loading
- Debouncing
- Canvas rendering (>2000 points)
- Data summaries
- 30+ FPS performance
- Async loading

#### Requirement 8: Intelligent Insights ✅
- Top trends identification
- Anomaly detection
- Correlation identification
- Seasonality detection
- Inflection points
- Natural language explanations
- Insight ranking
- Actionable recommendations

#### Requirement 9: Responsive Design ✅
- Viewport adaptation
- Mobile font sizes (<768px)
- Touch gestures
- Touch targets (44x44px)
- Mobile tooltips
- Vertical stacking
- Collapsible legends
- Aspect ratios

#### Requirement 10: Export and Sharing ✅
- PNG export (150-300 DPI)
- SVG export
- PDF export
- CSV export
- JSON export
- Shareable links
- Embed codes
- Style preservation

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test __tests__/integration.test.ts
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

### Run with Coverage
```bash
npm test -- --coverage
```

## Test Data

### Sample Datasets

Tests use various dataset shapes:

1. **Time Series Data**
   - Daily data points
   - Multiple metrics
   - Date fields

2. **Categorical Data**
   - Categories and values
   - Multiple series
   - Hierarchical data

3. **Statistical Data**
   - Quartiles and outliers
   - Distributions
   - Correlations

4. **Large Datasets**
   - 10K rows
   - 100K rows
   - Multiple columns

5. **Financial Data**
   - OHLC values
   - Volume data
   - Time series

## Performance Benchmarks

### Expected Performance

- **Small datasets (<1000 points):** <50ms render time
- **Medium datasets (1000-5000 points):** <200ms render time
- **Large datasets (5000-10000 points):** <500ms render time
- **Very large datasets (>10000 points):** <1000ms with sampling

### Sampling Thresholds

- **Line charts:** 5000 points
- **Bar charts:** 3000 points
- **Scatter plots:** 2000 points
- **Area charts:** 5000 points

### Canvas Rendering Triggers

- **Scatter plots:** >2000 points
- **Line charts:** >10000 points

## Accessibility Standards

All tests verify compliance with:

- **WCAG 2.1 Level AA**
  - Color contrast ratio ≥ 4.5:1 for normal text
  - Color contrast ratio ≥ 3:1 for large text
  - Keyboard navigation support
  - Screen reader compatibility

- **ARIA Standards**
  - Proper role attributes
  - Descriptive labels
  - State management
  - Live regions for updates

## Browser Compatibility

Tests are designed to work across:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-commit hooks (via Husky)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Ensure MongoDB is running
   - Check MONGODB_URI environment variable
   - Verify network connectivity

2. **Test Timeouts**
   - Increase timeout in jest.config.js
   - Check for async operations without await
   - Verify cleanup in afterEach/afterAll

3. **Flaky Tests**
   - Add proper wait conditions
   - Use deterministic test data
   - Avoid time-dependent assertions

### Debug Mode

Run tests with debug output:
```bash
DEBUG=* npm test
```

## Contributing

When adding new tests:

1. Follow existing test structure
2. Use descriptive test names
3. Include both positive and negative cases
4. Test edge cases
5. Add comments for complex logic
6. Update this README with new test coverage

## Test Metrics

Current test coverage:
- **Statements:** Target >80%
- **Branches:** Target >75%
- **Functions:** Target >80%
- **Lines:** Target >80%

## Future Enhancements

Planned test additions:
- Visual regression tests with Playwright
- Load testing with k6
- Security testing with OWASP ZAP
- Cross-browser testing with BrowserStack
- Mobile device testing
- API contract testing
