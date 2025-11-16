# Implementation Plan

- [x] 1. Update theme foundation and global styles





  - Update `app/globals.css` with new CSS custom properties for colors, typography, spacing, shadows, and borders
  - Add Tailwind theme extensions for primary, secondary, background-dark, and card-bg colors
  - Ensure Poppins font is properly loaded and set as default font family
  - Test theme variables are accessible throughout the application
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 5.3, 5.4, 5.5_
-

- [x] 2. Create core layout components





  - [x] 2.1 Create DashboardLayout component

    - Create `components/dashboard/DashboardLayout.tsx` with max-w-[1400px] container
    - Implement responsive layout with sidebar and main content area
    - Add dark background (#000000) and proper padding (px-6 or px-8)
    - Support activeSection prop for navigation state
    - _Requirements: 1.5, 2.1, 2.6_
  

  - [x] 2.2 Create DashboardHeader component

    - Create `components/dashboard/DashboardHeader.tsx` with sticky positioning
    - Add logo from Cloudinary URL with h-14 sizing
    - Implement backdrop blur effect (backdrop-blur-md)
    - Add border-b with border-white/10
    - Include mobile hamburger menu button
    - _Requirements: 1.7, 2.6, 5.1, 5.2_
  

  - [x] 2.3 Create DashboardSidebar component

    - Create `components/dashboard/DashboardSidebar.tsx` with w-64 width
    - Implement navigation items with Lucide icons
    - Add active state styling (bg-primary/20 text-primary)
    - Add hover states with smooth transitions (hover:bg-white/5)
    - Implement mobile slide-in drawer behavior
    - Add logo at top of sidebar
    - _Requirements: 1.6, 1.7, 2.6, 2.7, 5.1_

- [x] 3. Create profile management components






  - [x] 3.1 Create ProfileDropdown component

    - Create `components/dashboard/ProfileDropdown.tsx` for header
    - Display user avatar with initials fallback (w-10 h-10 rounded-full)
    - Show user name and email in dropdown
    - Add quick links to profile and settings
    - Style dropdown with bg-[#0A0A0A] rounded-xl shadow-xl
    - Implement click-outside-to-close behavior
    - _Requirements: 3.1, 3.2, 3.3, 3.6, 3.7_
  

  - [x] 3.2 Create ProfileModal component

    - Create `components/dashboard/ProfileModal.tsx` as full modal
    - Display profile picture or initials fallback
    - Show user name, email, and account tier
    - Add account settings section
    - Include logout button with proper styling
    - Style modal with bg-[#0A0A0A] rounded-xl shadow-2xl border border-secondary/50
    - Implement modal overlay with backdrop blur
    - Add close on escape key and overlay click
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Redesign existing dashboard components





  - [x] 4.1 Update StoryCard component styling


    - Update `components/StoryCard.tsx` with dark theme (bg-[#0A0A0A])
    - Apply border-secondary/50 and rounded-xl
    - Update text colors (text-white for headings, text-[#D4D4D4] for body)
    - Add hover effect (shadow-lg to shadow-2xl transition)
    - Update action buttons with primary (bg-primary) and secondary (border-secondary) styles
    - Ensure smooth transitions on all interactive elements
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.2, 2.8, 5.3, 5.4_
  

  - [x] 4.2 Update StoryList component styling

    - Update `components/StoryList.tsx` with dark theme
    - Update empty state with new styling
    - Update loading skeletons with dark theme
    - Ensure grid layout works with new card styling
    - _Requirements: 1.1, 1.2, 2.2, 2.4_
  
  - [x] 4.3 Update UsageIndicator component styling


    - Update `components/UsageIndicator.tsx` with dark theme (bg-[#0A0A0A])
    - Apply rounded-xl and shadow-lg
    - Update progress bar with bg-primary color
    - Update typography to use Poppins font
    - Update text colors for dark theme
    - _Requirements: 1.1, 1.2, 1.3, 2.2, 5.3, 5.4_
  
  - [x] 4.4 Create StatsCards component


    - Create `components/dashboard/StatsCards.tsx` for dashboard metrics
    - Implement grid layout (grid-cols-1 md:grid-cols-3 gap-6)
    - Style cards with bg-[#0A0A0A] rounded-xl p-6 border border-secondary/50
    - Add icon containers with bg-primary/20 rounded-lg p-3
    - Display total stories, stories this month, and current tier
    - Use Lucide icons with text-primary color
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 2.2, 2.3, 2.4_
-

- [x] 5. Fix and redesign FileUpload component



  - [x] 5.1 Fix file input wiring and event handlers

    - Update `components/FileUpload.tsx` to ensure file input ref is correctly connected
    - Fix click handler to properly trigger file picker
    - Verify file selection event is captured correctly
    - Test file input works on all browsers
    - _Requirements: 4.1, 4.2, 4.8_
  

  - [x] 5.2 Implement drag-and-drop functionality

    - Add drag-over visual feedback (border-primary bg-primary/10)
    - Implement onDragEnter, onDragOver, onDragLeave, onDrop handlers
    - Add visual indicator when file is dragged over drop zone
    - Test drag-and-drop works correctly
    - _Requirements: 4.3, 4.4_

  


  - [x] 5.3 Add upload progress and success states
    - Implement loading UI with progress bar during upload
    - Add success message/confirmation after upload completes
    - Style loading state with dark theme
    - Add smooth transitions between states

    - _Requirements: 4.5, 4.6_

  
  - [x] 5.4 Apply dark theme styling to FileUpload


    - Update drop zone with border-2 border-dashed border-secondary/50 rounded-xl
    - Update upload button with bg-primary text-background-dark hover:bg-opacity-80
    - Update text colors for dark theme
    - Apply consistent spacing and typography
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.7, 5.3, 5.4_

- [x] 6. Integrate components into dashboard page






  - [x] 6.1 Update dashboard page with new layout

    - Update `app/dashboard/page.tsx` to use DashboardLayout component
    - Replace existing header with DashboardHeader component
    - Replace existing sidebar with DashboardSidebar component
    - Add ProfileDropdown to header
    - Integrate ProfileModal with open/close state management
    - _Requirements: 1.5, 1.7, 2.1, 2.6, 3.1, 5.1, 5.2, 5.6_
  

  - [x] 6.2 Add StatsCards to dashboard overview

    - Add StatsCards component to dashboard section
    - Wire up stats data from user context
    - Position above StoryList component
    - Ensure responsive layout
    - _Requirements: 2.2, 2.3, 2.4_
  

  - [x] 6.3 Update dashboard content sections

    - Apply dark theme to all dashboard sections
    - Update section headings with proper typography
    - Ensure consistent spacing throughout
    - Update all buttons to use new button styles
    - _Requirements: 1.1, 1.2, 2.2, 2.3, 5.3, 5.4, 5.5_

- [x] 7. Implement responsive behavior





  - [x] 7.1 Test and fix mobile layout


    - Test sidebar drawer behavior on mobile
    - Ensure hamburger menu works correctly
    - Test touch interactions for drag-and-drop
    - Verify card grid collapses to single column on mobile
    - Test profile dropdown on mobile
    - _Requirements: 2.7_
  

  - [x] 7.2 Test and fix tablet layout

    - Test sidebar behavior at tablet breakpoint
    - Verify card grid shows 2 columns on tablet
    - Test navigation interactions
    - Ensure proper spacing at tablet sizes
    - _Requirements: 2.7_
  

  - [x] 7.3 Test desktop layout

    - Verify max-w-[1400px] container works correctly
    - Test sidebar is always visible on desktop
    - Verify all hover states work properly
    - Test profile dropdown positioning
    - _Requirements: 2.1, 2.6, 2.7_

- [x] 8. Add polish and interactions





  - [x] 8.1 Add smooth transitions and animations


    - Add transition-all duration-300 to interactive elements
    - Implement smooth hover effects on cards and buttons
    - Add fade-in animations for modals
    - Add slide-in animation for mobile sidebar
    - Ensure all animations are GPU-accelerated (use transform)
    - _Requirements: 2.8_
  
  - [x] 8.2 Implement focus states and keyboard navigation


    - Add visible focus indicators to all interactive elements
    - Test tab order through dashboard
    - Ensure escape key closes modals
    - Test enter key activates buttons
    - Add skip-to-content link
    - _Requirements: 2.8_
  
  - [x] 8.3 Add loading states and error handling


    - Ensure all async operations show loading states
    - Add error messages with retry options
    - Test error states for profile loading
    - Test error states for file upload
    - Style error messages with dark theme
    - _Requirements: 2.8_

- [ ]* 9. Testing and quality assurance
  - [ ]* 9.1 Write unit tests for new components
    - Write tests for DashboardLayout component
    - Write tests for DashboardHeader component
    - Write tests for DashboardSidebar component
    - Write tests for ProfileDropdown component
    - Write tests for ProfileModal component
    - Write tests for StatsCards component
    - _Requirements: All_
  
  - [ ]* 9.2 Write integration tests
    - Test complete upload flow from file selection to success
    - Test navigation between dashboard sections
    - Test profile modal open/close flow
    - Test logout flow
    - Test responsive behavior at different breakpoints
    - _Requirements: All_
  
  - [ ]* 9.3 Perform visual regression testing
    - Compare dashboard screenshots with landing page for theme consistency
    - Verify color palette matches across all components
    - Verify typography consistency
    - Test at mobile, tablet, and desktop breakpoints
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.3, 5.4, 5.5, 5.6_
  
  - [ ]* 9.4 Perform accessibility testing
    - Test keyboard navigation through all interactive elements
    - Test with screen reader (NVDA or JAWS)
    - Verify ARIA labels are present and correct
    - Test color contrast meets WCAG AA standards
    - Test with color blindness simulators
    - _Requirements: 2.8_

- [ ] 10. Documentation and cleanup
  - [ ] 10.1 Update component documentation
    - Add JSDoc comments to all new components
    - Document props and interfaces
    - Add usage examples
    - Document accessibility features
    - _Requirements: All_
  
  - [ ] 10.2 Clean up old code
    - Remove unused styles from old dashboard
    - Remove commented-out code
    - Update imports to use new components
    - Verify no console errors or warnings
    - _Requirements: All_
