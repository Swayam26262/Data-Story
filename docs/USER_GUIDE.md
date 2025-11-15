# DataStory AI User Guide

Welcome to DataStory AI! This guide will help you get started with transforming your data into compelling narratives with interactive visualizations.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Story](#creating-your-first-story)
3. [Understanding Your Story](#understanding-your-story)
4. [Managing Stories](#managing-stories)
5. [Exporting Stories](#exporting-stories)
6. [Tier Limits](#tier-limits)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)

## Getting Started

### Creating an Account

1. Navigate to the DataStory AI homepage
2. Click "Sign Up" in the top right corner
3. Enter your email address and create a strong password
   - Password must be at least 8 characters
   - Include uppercase and lowercase letters
   - Include at least one number
4. Click "Create Account"
5. You'll be redirected to your dashboard

### Logging In

1. Click "Log In" on the homepage
2. Enter your email and password
3. Check "Remember me" to stay logged in for 30 days
4. Click "Log In"

## Creating Your First Story

### Step 1: Prepare Your Data

DataStory AI works best with structured data in CSV or Excel format. Your data should:

- Have at least 2 columns and 10 rows
- Include column headers in the first row
- Be under 1,000 rows (free tier)
- Be under 10 MB in file size

**Supported File Types:**
- CSV (.csv)
- Excel (.xlsx, .xls)

**Sample Data Types:**
- Time series data (sales over time, website traffic, etc.)
- Categorical data (sales by region, customer segments, etc.)
- Numerical data (revenue, units sold, ratings, etc.)

### Step 2: Upload Your Data

1. From your dashboard, click "Create New Story"
2. Drag and drop your file into the upload zone, or click "Browse" to select a file
3. Review the file preview showing:
   - Filename
   - File size
   - Estimated row count
4. Click "Upload and Generate Story"

### Step 3: Wait for Processing

Your story will go through several stages:

1. **Uploading** - Your file is being uploaded securely
2. **Analyzing** - Statistical analysis is being performed
3. **Generating** - AI is creating your narrative
4. **Visualizing** - Charts are being created

This typically takes 30-60 seconds depending on your data size.

### Step 4: View Your Story

Once processing is complete, you'll automatically be redirected to your story viewer where you can:

- Read the AI-generated narrative
- Explore interactive visualizations
- Scroll through the scrollytelling experience
- Export as PDF

## Understanding Your Story

### Story Structure

Every DataStory AI story contains three main sections:

#### 1. Summary
A high-level overview of your dataset, including:
- What the data represents
- Key characteristics
- Overall patterns

#### 2. Key Findings
The most significant insights discovered in your data:
- Trends and patterns
- Correlations between variables
- Notable outliers or anomalies
- Statistical highlights

#### 3. Recommendations
Actionable suggestions based on the findings:
- What actions to take
- Areas to investigate further
- Opportunities identified

### Visualizations

DataStory AI automatically selects the best chart types for your data:

**Line Charts**
- Used for time series data
- Show trends over time
- Display multiple series for comparison

**Bar Charts**
- Used for categorical comparisons
- Show values across different categories
- Can be horizontal or vertical

**Scatter Plots**
- Used for correlation analysis
- Show relationships between two variables
- Include trend lines when correlations are strong

**Pie Charts**
- Used for proportional data
- Show percentage distributions
- Best for 3-7 categories

### Interactive Features

- **Hover tooltips**: Hover over charts to see exact values
- **Scroll animations**: Charts fade in as you scroll
- **Responsive design**: Works on desktop, tablet, and mobile

## Managing Stories

### Viewing Your Stories

1. Navigate to your dashboard
2. All your stories are displayed as cards showing:
   - Story title
   - Creation date
   - Dataset information
   - Thumbnail preview

### Deleting Stories

1. Find the story you want to delete
2. Click the "Delete" button (trash icon)
3. Confirm deletion in the dialog
4. The story will be permanently removed

**Note:** Deleting a story frees up one slot in your monthly limit.

### Story Limits

Free tier users can:
- Create up to 3 stories per month
- Store up to 3 stories at a time
- Upload datasets up to 1,000 rows

Your monthly limit resets on the 1st of each month.

## Exporting Stories

### PDF Export

1. Open the story you want to export
2. Click the "Export PDF" button
3. Wait for the PDF to generate (typically 5-10 seconds)
4. The PDF will automatically download

**PDF Features:**
- All narrative sections included
- High-resolution charts (300 DPI)
- Professional formatting
- DataStory AI branding (free tier)

**PDF Naming:**
Files are named: `datastory-{story-id}-{date}.pdf`

### Sharing Stories

Currently, stories are private by default. Sharing features will be available in future updates.

## Tier Limits

### Free Tier

**Included:**
- 3 stories per month
- Up to 1,000 rows per dataset
- All chart types
- PDF export
- Email support

**Limitations:**
- "Powered by DataStory AI" badge on stories
- Monthly story limit resets on 1st of month
- Cannot delete individual stories to free up slots

### Upgrading

To create more stories or analyze larger datasets:

1. Click "Upgrade" in your dashboard
2. Choose a plan that fits your needs
3. Complete payment
4. Enjoy increased limits immediately

## Best Practices

### Data Preparation

1. **Clean your data first**
   - Remove duplicate rows
   - Handle missing values appropriately
   - Ensure consistent formatting

2. **Use descriptive column names**
   - "Sales_Revenue" instead of "Col1"
   - "Customer_Age" instead of "Age"
   - Avoid special characters

3. **Include relevant data only**
   - Remove unnecessary columns
   - Focus on data that tells a story
   - Keep datasets focused on one topic

### Getting Better Results

1. **Provide context in column names**
   - Include units: "Revenue_USD", "Weight_KG"
   - Be specific: "Monthly_Sales" vs "Sales"

2. **Use appropriate data types**
   - Dates in standard format (YYYY-MM-DD)
   - Numbers without currency symbols
   - Consistent categorical values

3. **Optimal dataset size**
   - Minimum: 10 rows for meaningful analysis
   - Sweet spot: 50-500 rows
   - Maximum (free tier): 1,000 rows

### Story Optimization

1. **Review the narrative**
   - Check that insights make sense
   - Verify numerical claims
   - Look for actionable recommendations

2. **Examine visualizations**
   - Ensure charts are relevant
   - Check that data is displayed correctly
   - Verify chart types are appropriate

3. **Export and share**
   - Use PDF for presentations
   - Include in reports
   - Share with stakeholders

## Troubleshooting

### Upload Issues

**Problem:** File upload fails
- **Solution:** Check file size (must be under 10 MB)
- **Solution:** Verify file format (CSV or Excel only)
- **Solution:** Check your internet connection

**Problem:** "Invalid file format" error
- **Solution:** Ensure file is .csv, .xlsx, or .xls
- **Solution:** Open file in Excel and re-save
- **Solution:** Check that file isn't corrupted

**Problem:** "Too many rows" error
- **Solution:** Reduce dataset to 1,000 rows or less
- **Solution:** Consider upgrading to a paid tier
- **Solution:** Sample your data to include most important rows

### Processing Issues

**Problem:** Processing takes too long
- **Solution:** Wait up to 2 minutes for completion
- **Solution:** Refresh the page if stuck
- **Solution:** Try uploading again if it fails

**Problem:** Processing fails
- **Solution:** Check that data has at least 2 columns
- **Solution:** Ensure at least 10 rows of data
- **Solution:** Verify data isn't all missing values

### Story Issues

**Problem:** Story doesn't load
- **Solution:** Refresh the page
- **Solution:** Check your internet connection
- **Solution:** Try logging out and back in

**Problem:** Charts don't display
- **Solution:** Enable JavaScript in your browser
- **Solution:** Try a different browser
- **Solution:** Clear browser cache

### Account Issues

**Problem:** Can't log in
- **Solution:** Verify email and password are correct
- **Solution:** Use "Forgot Password" to reset
- **Solution:** Check for typos in email address

**Problem:** Reached monthly limit
- **Solution:** Wait until the 1st of next month
- **Solution:** Delete old stories to free up space
- **Solution:** Upgrade to a paid tier

## FAQ

### General Questions

**Q: How does DataStory AI work?**
A: DataStory AI uses advanced statistical analysis and AI to automatically analyze your data, identify patterns, and generate narratives with visualizations.

**Q: Is my data secure?**
A: Yes! All data is encrypted in transit and at rest. We never use your data to train AI models. You can delete your data anytime.

**Q: What types of data work best?**
A: Time series data, categorical data, and numerical data all work well. The key is having structured data with clear column headers.

**Q: Can I edit the generated story?**
A: Currently, stories are generated automatically and cannot be edited. This feature may be added in future updates.

### Technical Questions

**Q: What AI model is used?**
A: We use Google's Gemini AI for narrative generation, combined with statistical analysis algorithms.

**Q: How long does story generation take?**
A: Typically 30-60 seconds for datasets under 1,000 rows.

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions).

**Q: Does it work on mobile?**
A: Yes! DataStory AI is fully responsive and works on mobile devices.

### Billing Questions

**Q: Is there a free trial?**
A: The free tier is available indefinitely with 3 stories per month.

**Q: How do I upgrade?**
A: Click "Upgrade" in your dashboard to see plan options.

**Q: When does my monthly limit reset?**
A: On the 1st day of each month at midnight UTC.

**Q: Can I cancel anytime?**
A: Yes, paid plans can be cancelled anytime with no penalties.

## Getting Help

### Support Channels

**Email Support:** support@datastory.ai
- Response time: 24-48 hours
- Available for all tiers

**Documentation:** docs.datastory.ai
- User guides
- API documentation
- Video tutorials

**Community Forum:** community.datastory.ai
- Ask questions
- Share tips
- Connect with other users

### Reporting Issues

When reporting issues, please include:
- Your account email
- Description of the problem
- Steps to reproduce
- Browser and OS information
- Screenshots if applicable

## Sample Datasets

Try DataStory AI with our sample datasets:

1. **Sales Data** - Monthly sales by region and product
2. **Customer Analytics** - Customer segments and satisfaction
3. **Marketing Campaign** - Campaign performance metrics

Download samples from: [Your Dashboard] → [Sample Datasets]

## What's Next?

Now that you know the basics:

1. Upload your first dataset
2. Explore the generated story
3. Export as PDF
4. Share insights with your team
5. Create more stories!

---

**Need more help?** Contact us at support@datastory.ai

**Want to learn more?** Visit our blog at blog.datastory.ai

**Ready to upgrade?** View plans at datastory.ai/pricing
