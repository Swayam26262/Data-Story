# Design Document

## Overview

This design document outlines the comprehensive redesign of the DataStory AI dashboard to create a modern, cohesive SaaS experience that matches the visual quality and branding of the landing page. The redesign focuses on five key areas: theme consistency, modern aesthetic, profile management, upload functionality, and branding consistency.

The design follows modern SaaS best practices inspired by products like Notion, Linear, Vercel, and Superhuman, emphasizing clean layouts, generous whitespace, smooth interactions, and a dark theme aesthetic with neon accent colors.

## Architecture

### Component Hierarchy

```
Dashboard (app/dashboard/page.tsx)
├── DashboardLayout (new component)
│   ├── DashboardHeader (new component)
│   │   ├── Logo
│   │   ├── Navigation Links
│   │   └── ProfileDropdown (new component)
│   ├── DashboardSidebar (new component)
│   │   ├── Logo
│   │   ├── NavigationMenu
│   │   └── UpgradeButton
│   └── DashboardContent
│       ├── UsageIndicator (redesigned)
│       ├── StatsCards (redesigned)
│       ├── StoryList (redesigned)
│       │   └── StoryCard (redesigned)
│       └── FileUpload (fixed & redesigned)
└── ProfileModal (new component)
    ├── ProfileHeader
    ├── AccountSettings
    └── LogoutButton
```

### Theme System

The design will leverage Tailwind CSS with custom theme extensions defined in `globals.css`:

- **Colors**: Primary (#39FF14 - neon green), Secondary (#BF00FF - purple), Background Dark (#000000), Card Background (#0A0A0A)
- **Typography**: Poppins font family for all text
- **Spacing**: Consistent spacing scale (4, 6, 8, 12, 16, 24, 32, 48, 64px)
- **Shadows**: Layered shadow system for depth (shadow-sm, shadow-md, shadow-lg, shadow-xl)
- **Borders**: Rounded corners (rounded-lg, rounded-xl) with subtle borders (border-secondary/50)

## Components and Interfaces

### 1. DashboardLayout Component

**Purpose**: Provides the main layout structure for all dashboard pages with consistent header, sidebar, and content area.

**Props**:
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: 'dashboard' | 'stories' | 'settings' | 'profile';
}
```

**Styling**:
- Dark background (#000000)
- Max width: 1400px centered
- Horizontal padding: px-6 or px-8
- Responsive: Collapsible sidebar on mobile

### 2. DashboardHeader Component

**Purpose**: Top navigation bar with logo, navigation links, and profile access.

**Features**:
- Sticky positioning (sticky top-0 z-50)
- Backdrop blur effect (backdrop-blur-md)
- Logo from Cloudinary (h-14 w-auto)
- Profile dropdown in top-right
- Mobile hamburger menu

**Styling**:
- Background: bg-background-dark/80 with border-b border-white/10
- Height: h-16
- Flex layout with space-between

### 3. DashboardSidebar Component

**Purpose**: Left sidebar navigation with icons and labels.

**Features**:
- Fixed positioning on desktop
- Slide-in drawer on mobile
- Active state indicators
- Hover effects with smooth transitions
- Upgrade button at bottom (for free tier)

**Navigation Items**:
```typescript
interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}
```

**Styling**:
- Width: w-64 on desktop
- Background: bg-[#0A0A0A] with border-r border-secondary/50
- Active state: bg-primary/20 text-primary
- Hover state: bg-white/5
- Icons: w-5 h-5 with mr-3 spacing

### 4. ProfileDropdown Component

**Purpose**: Dropdown menu in header for quick profile access.

**Features**:
- User avatar (initials fallback)
- User name and email display
- Quick links to profile and settings
- Logout button

**Styling**:
- Dropdown: bg-[#0A0A0A] rounded-xl shadow-xl border border-secondary/50
- Avatar: w-10 h-10 rounded-full bg-primary text-background-dark
- Menu items: hover:bg-white/5 transition-colors

### 5. ProfileModal Component

**Purpose**: Full profile management interface.

**Features**:
- Profile picture upload (with initials fallback)
- Display name and email
- Account tier information
- Theme preferences (optional for future)
- Account settings
- Logout button

**Styling**:
- Modal overlay: bg-black/80 backdrop-blur-sm
- Modal content: bg-[#0A0A0A] rounded-xl shadow-2xl border border-secondary/50
- Max width: max-w-2xl
- Padding: p-8
- Sections separated with border-t border-white/10

### 6. Redesigned StoryCard Component

**Purpose**: Display individual story with modern card design.

**Changes from Current**:
- Dark theme: bg-[#0A0A0A] instead of bg-white
- Neon accents: border-secondary/50
- Hover effects: shadow-lg to shadow-2xl transition
- Rounded corners: rounded-xl
- Typography: text-white for headings, text-[#D4D4D4] for body
- Action buttons: Primary button with bg-primary, secondary with border-secondary

**Styling**:
```css
.story-card {
  background: #0A0A0A;
  border: 1px solid rgba(191, 0, 255, 0.5);
  border-radius: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.story-card:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border-color: rgba(191, 0, 255, 0.8);
}
```

### 7. Redesigned UsageIndicator Component

**Purpose**: Display usage statistics with modern styling.

**Changes from Current**:
- Dark theme: bg-[#0A0A0A]
- Neon progress bar: bg-primary for progress
- Typography: Poppins font
- Rounded corners: rounded-xl
- Shadow: shadow-lg

### 8. Fixed FileUpload Component

**Purpose**: File upload with drag-and-drop, properly wired to UI.

**Fixes Required**:
1. Ensure file input ref is correctly connected
2. Add proper event handlers for click and drag-and-drop
3. Add visual feedback for drag-over state
4. Add loading state with progress indicator
5. Add success state after upload

**New Features**:
- Drag-and-drop zone with visual feedback
- File type validation with clear error messages
- Upload progress bar
- Success confirmation
- Redesigned with dark theme

**Styling**:
- Drop zone: border-2 border-dashed border-secondary/50 rounded-xl
- Drag active: border-primary bg-primary/10
- Upload button: bg-primary text-background-dark hover:bg-opacity-80

### 9. StatsCards Component (New)

**Purpose**: Display key metrics in dashboard overview.

**Features**:
- Total stories count
- Stories this month
- Current tier
- Additional metrics (processing time, etc.)

**Styling**:
- Grid layout: grid-cols-1 md:grid-cols-3 gap-6
- Card: bg-[#0A0A0A] rounded-xl p-6 border border-secondary/50
- Icon container: bg-primary/20 rounded-lg p-3
- Icon: text-primary w-6 h-6
- Value: text-2xl font-bold text-white
- Label: text-sm text-[#A0A0A0]

## Data Models

### User Profile Data

```typescript
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  profilePicture?: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  preferences?: {
    theme?: 'dark' | 'light';
    notifications?: boolean;
  };
}
```

### Dashboard State

```typescript
interface DashboardState {
  activeSection: 'dashboard' | 'stories' | 'settings' | 'profile';
  isSidebarOpen: boolean;
  isProfileModalOpen: boolean;
  isUploadModalOpen: boolean;
}
```

### Upload State

```typescript
interface UploadState {
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  uploadSuccess: boolean;
}
```

## Error Handling

### Upload Errors

1. **File Type Validation**: Display clear error message for unsupported file types
2. **File Size Validation**: Show error if file exceeds 10MB limit
3. **Network Errors**: Retry mechanism with user feedback
4. **Server Errors**: Display error message with support contact

**Error Display**:
- Toast notifications for transient errors
- Inline error messages for form validation
- Error boundary for critical failures

### Profile Errors

1. **Load Failure**: Retry button with error message
2. **Update Failure**: Inline error with retry option
3. **Logout Failure**: Force logout with local state clear

## Testing Strategy

### Unit Tests

1. **Component Rendering**:
   - Test each component renders with correct props
   - Test conditional rendering based on state
   - Test responsive behavior

2. **User Interactions**:
   - Test button clicks trigger correct handlers
   - Test form submissions
   - Test file upload flow

3. **State Management**:
   - Test state updates correctly
   - Test side effects (API calls)
   - Test error states

### Integration Tests

1. **Upload Flow**:
   - Test complete file upload from selection to success
   - Test drag-and-drop functionality
   - Test error handling

2. **Navigation**:
   - Test sidebar navigation updates active section
   - Test mobile menu toggle
   - Test profile dropdown

3. **Profile Management**:
   - Test profile modal open/close
   - Test profile data display
   - Test logout flow

### Visual Regression Tests

1. **Theme Consistency**:
   - Compare dashboard screenshots with landing page
   - Verify color palette matches
   - Verify typography matches

2. **Responsive Design**:
   - Test layouts at mobile, tablet, and desktop breakpoints
   - Verify sidebar behavior on mobile
   - Verify card grid layouts

### Accessibility Tests

1. **Keyboard Navigation**:
   - Test tab order through interactive elements
   - Test escape key closes modals
   - Test enter key activates buttons

2. **Screen Reader**:
   - Test ARIA labels on interactive elements
   - Test semantic HTML structure
   - Test focus management

3. **Color Contrast**:
   - Verify text meets WCAG AA standards
   - Test with color blindness simulators

## Design Specifications

### Color Palette

```css
/* Primary Colors */
--color-primary: #39FF14;        /* Neon Green */
--color-secondary: #BF00FF;      /* Purple */

/* Background Colors */
--color-background-dark: #000000;
--color-card-bg: #0A0A0A;
--color-card-hover: #111111;

/* Text Colors */
--color-text-primary: #FFFFFF;
--color-text-secondary: #D4D4D4;
--color-text-tertiary: #A0A0A0;

/* Border Colors */
--color-border-primary: rgba(191, 0, 255, 0.5);
--color-border-secondary: rgba(255, 255, 255, 0.1);
```

### Typography Scale

```css
/* Font Family */
font-family: 'Poppins', system-ui, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;
```

### Spacing Scale

```css
--spacing-1: 0.25rem;    /* 4px */
--spacing-2: 0.5rem;     /* 8px */
--spacing-3: 0.75rem;    /* 12px */
--spacing-4: 1rem;       /* 16px */
--spacing-6: 1.5rem;     /* 24px */
--spacing-8: 2rem;       /* 32px */
--spacing-12: 3rem;      /* 48px */
--spacing-16: 4rem;      /* 64px */
```

### Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
```

### Border Radius

```css
--radius-sm: 0.375rem;   /* 6px */
--radius-md: 0.5rem;     /* 8px */
--radius-lg: 0.75rem;    /* 12px */
--radius-xl: 1rem;       /* 16px */
--radius-full: 9999px;   /* Full circle */
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

## Implementation Notes

### Phase 1: Theme Foundation
1. Update `globals.css` with new theme variables
2. Create theme utility classes
3. Test theme consistency across components

### Phase 2: Layout Components
1. Create `DashboardLayout` component
2. Create `DashboardHeader` component
3. Create `DashboardSidebar` component
4. Implement responsive behavior

### Phase 3: Profile Components
1. Create `ProfileDropdown` component
2. Create `ProfileModal` component
3. Implement profile data fetching
4. Add logout functionality

### Phase 4: Redesign Existing Components
1. Update `StoryCard` with new theme
2. Update `StoryList` with new theme
3. Update `UsageIndicator` with new theme
4. Create `StatsCards` component

### Phase 5: Fix Upload Component
1. Fix file input wiring
2. Add drag-and-drop support
3. Add loading states
4. Add success states
5. Apply new theme styling

### Phase 6: Polish & Testing
1. Add smooth transitions
2. Test responsive behavior
3. Test accessibility
4. Visual regression testing
5. Performance optimization

## Accessibility Considerations

1. **Keyboard Navigation**: All interactive elements must be keyboard accessible
2. **Focus Indicators**: Clear focus states for all interactive elements
3. **ARIA Labels**: Proper ARIA labels for screen readers
4. **Color Contrast**: Minimum 4.5:1 contrast ratio for text
5. **Semantic HTML**: Use proper HTML5 semantic elements
6. **Skip Links**: Add skip to main content link
7. **Focus Management**: Proper focus management in modals

## Performance Considerations

1. **Code Splitting**: Lazy load profile modal and upload components
2. **Image Optimization**: Use Next.js Image component for logo and avatars
3. **CSS Optimization**: Use Tailwind's purge feature to remove unused styles
4. **Animation Performance**: Use CSS transforms for animations (GPU accelerated)
5. **Bundle Size**: Monitor and optimize JavaScript bundle size
6. **Caching**: Implement proper caching strategies for API calls
