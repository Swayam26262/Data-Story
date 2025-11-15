# Tier Management and Usage Tracking Implementation

## Overview

This document describes the tier management and usage tracking system implemented for DataStory AI. The system enforces usage limits, tracks story creation, and provides upgrade prompts for users.

## Components Implemented

### 1. Tier Configuration System (`lib/tier-config.ts`)

Centralized configuration for all tier limits and features:

- **Tiers**: Free, Professional, Business, Enterprise
- **Limits**: Stories per month, max dataset rows, team members
- **Features**: PDF export, custom branding, API access, priority support, advanced analytics
- **Utility Functions**: 
  - `getTierConfig()` - Get complete tier configuration
  - `canCreateStory()` - Check if user can create more stories
  - `isDatasetSizeAllowed()` - Validate dataset size against tier limits
  - `getRemainingStories()` - Calculate remaining stories
  - `shouldResetUsage()` - Check if monthly reset is needed

### 2. User Model Updates (`lib/models/User.ts`)

Enhanced User model with tier management:

- **New Methods**:
  - `checkAndResetUsage()` - Automatically reset usage if reset date has passed
  - `incrementStoryCount()` - Increment story counters after successful generation
  - `canCreateStory()` - Check if user can create more stories
  - `resetMonthlyUsage()` - Reset monthly counters and set next reset date

- **Pre-save Hook**: Automatically updates user limits when tier changes

### 3. Usage Tracking Middleware (`lib/middleware/usage-tracking.ts`)

Middleware functions for usage management:

- `checkUsageLimit(userId)` - Verify if user can create a story
- `incrementStoryCount(userId)` - Increment count after successful generation
- `decrementStoryCount(userId)` - Decrement count when story is deleted
- `usageCheckMiddleware(request, userId)` - Express-style middleware for API routes

### 4. Usage API Endpoint (`app/api/usage/route.ts`)

GET endpoint that returns:
- Current tier and display name
- Stories used/limit/remaining
- Total stories created
- Reset date
- Tier limits (stories, rows, team members)
- Tier features

**Usage**: `GET /api/usage`

### 5. Cron Job for Monthly Reset (`app/api/cron/reset-usage/route.ts`)

Scheduled job that runs on the 1st of each month:
- Finds all users whose reset date has passed
- Resets `storiesThisMonth` to 0
- Sets next reset date
- Returns statistics on reset operation

**Configuration**: Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reset-usage",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

**Security**: Requires `CRON_SECRET` environment variable in production

### 6. UI Components

#### UpgradeModal (`components/UpgradeModal.tsx`)
Full-featured upgrade modal with:
- Tier comparison table
- Monthly/annual billing toggle
- Feature comparison
- Contextual messaging based on reason (story limit, row limit, feature, general)
- Reset date display for story limit scenarios

#### PoweredByBadge (`components/PoweredByBadge.tsx`)
Badge component for free tier users:
- Light and dark variants
- Shows "Powered by DataStory AI"
- Can be placed in story viewer, PDF exports, etc.

#### UpgradeButton (`components/UpgradeButton.tsx`)
Reusable upgrade CTA button:
- Multiple variants (primary, secondary, outline)
- Multiple sizes (sm, md, lg)
- Accepts upgrade reason parameter

#### UsageIndicator (`components/UsageIndicator.tsx`)
Dashboard widget showing:
- Current tier
- Stories used/remaining
- Progress bar with color coding (green/yellow/red)
- Reset date
- Upgrade CTA when near/at limit

### 7. Custom Hook (`lib/hooks/useUpgrade.ts`)

React hook for managing upgrade modal state:
```typescript
const { 
  isUpgradeModalOpen, 
  upgradeReason, 
  resetDate, 
  openUpgradeModal, 
  closeUpgradeModal 
} = useUpgrade();
```

## Usage Examples

### Check Usage Before Story Creation

```typescript
import { checkUsageLimit } from '@/lib/middleware/usage-tracking';

// In API route
const usageCheck = await checkUsageLimit(userId);
if (!usageCheck.allowed) {
  return NextResponse.json(
    { error: { message: usageCheck.reason } },
    { status: 403 }
  );
}
```

### Increment Story Count After Generation

```typescript
import { incrementStoryCount } from '@/lib/middleware/usage-tracking';

// After successful story generation
await incrementStoryCount(userId);
```

### Show Upgrade Modal in Component

```typescript
import { useUpgrade } from '@/lib/hooks/useUpgrade';
import UpgradeModal from '@/components/UpgradeModal';

function MyComponent() {
  const { isUpgradeModalOpen, openUpgradeModal, closeUpgradeModal } = useUpgrade();
  
  return (
    <>
      <button onClick={() => openUpgradeModal('story_limit', resetDate)}>
        Upgrade
      </button>
      
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentTier="free"
        reason="story_limit"
      />
    </>
  );
}
```

### Display Usage Indicator

```typescript
import UsageIndicator from '@/components/UsageIndicator';

function Dashboard() {
  return (
    <UsageIndicator 
      onUpgradeClick={() => openUpgradeModal('general')} 
    />
  );
}
```

### Add Powered By Badge (Free Tier Only)

```typescript
import PoweredByBadge from '@/components/PoweredByBadge';
import { useUser } from '@/lib/hooks/useUser';

function StoryViewer() {
  const { tier } = useUser();
  
  return (
    <div>
      {tier === 'free' && <PoweredByBadge variant="light" />}
      {/* Story content */}
    </div>
  );
}
```

## Environment Variables

Add to `.env.local`:

```bash
# Cron Job Secret (for Vercel Cron authentication)
CRON_SECRET=your-cron-secret-key-change-this-in-production
```

## Integration Points

### Story Upload Endpoint
Before accepting upload:
1. Call `checkUsageLimit(userId)`
2. If not allowed, return 403 with upgrade prompt
3. If allowed, proceed with upload

### Story Generation Completion
After successful generation:
1. Call `incrementStoryCount(userId)`
2. Update user's `totalStoriesCreated`

### Story Deletion
When user deletes a story:
1. Call `decrementStoryCount(userId)`
2. Update story count in current month

### Dashboard
Display:
1. `UsageIndicator` component
2. `UpgradeButton` in navigation (free tier only)
3. `UpgradeModal` when triggered

### Story Viewer
For free tier users:
1. Display `PoweredByBadge` in header or footer
2. Show `UpgradeButton` in action bar

## Testing

### Manual Testing Checklist

- [ ] Create account and verify default tier is "free"
- [ ] Check usage indicator shows 0/3 stories
- [ ] Create 3 stories and verify count increments
- [ ] Try to create 4th story and verify upgrade prompt appears
- [ ] Delete a story and verify count decrements
- [ ] Click upgrade button and verify modal displays all tiers
- [ ] Toggle monthly/annual billing in upgrade modal
- [ ] Verify reset date is set to 1st of next month
- [ ] Manually trigger cron job: `curl -X POST http://localhost:3000/api/cron/reset-usage -H "Authorization: Bearer YOUR_CRON_SECRET"`
- [ ] Verify usage resets after cron job runs

### Automated Testing

Create tests for:
- Tier configuration functions
- User model methods (canCreateStory, resetMonthlyUsage)
- Usage tracking middleware
- API endpoints (/api/usage, /api/cron/reset-usage)

## Future Enhancements

1. **Payment Integration**: Connect upgrade buttons to Stripe/payment processor
2. **Usage Analytics**: Track upgrade conversion rates
3. **Email Notifications**: Send emails when users hit limits or usage resets
4. **Team Management**: Implement team member limits for higher tiers
5. **API Access**: Implement API key generation for Business/Enterprise tiers
6. **Custom Branding**: Allow Professional+ users to remove "Powered by" badge

## Requirements Satisfied

This implementation satisfies the following requirements:

- **9.1**: Free tier limited to 3 stories/month, 1000 rows
- **9.2**: Upgrade prompt when limit reached
- **9.3**: Monthly reset on 1st of month at 00:00 UTC
- **9.4**: Tier limits enforced (stories and rows)
- **9.5**: Usage display in dashboard
- **9.6**: "Powered by DataStory AI" badge for free tier
