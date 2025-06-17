# Component Mockups & Visual Examples

## Navigation Components

### Main Navigation Bar
```
┌─────────────────────────────────────────────────────────────────┐
│ Logo  │ Projects │ Test Cases │ Reports │ Settings │ Profile ▼ │
└─────────────────────────────────────────────────────────────────┘
```
- Fixed position at top
- Responsive collapse to hamburger menu on mobile
- Active state highlighted with primary color
- Dropdown menus for complex sections

### Sidebar Navigation
```
┌─────┐
│ Logo│
├─────┤
│ 📊  │ Dashboard
│ 📋  │ Projects
│ ✅  │ Test Cases
│ 📈  │ Reports
│ ⚙️  │ Settings
└─────┘
```
- Collapsible on mobile
- Icons with labels
- Active state with left border accent
- Nested items with indentation

## Dashboard Components

### Status Card
```
┌─────────────────────────┐
│ Test Suite Status       │
├─────────────────────────┤
│ Total Tests: 150        │
│ Passed: 142  ⚪         │
│ Failed: 5   🔴         │
│ Pending: 3   🟡         │
└─────────────────────────┘
```
- Color-coded status indicators
- Progress bars for visual representation
- Interactive hover states
- Click to expand details

### Test Execution Progress
```
┌─────────────────────────┐
│ Current Test Run        │
├─────────────────────────┤
│ [==================] 85%│
│ Running: Login Tests    │
│ Time: 2m 30s           │
└─────────────────────────┘
```
- Real-time progress updates
- Animated progress bar
- Estimated time remaining
- Cancel/Pause controls

## Test Case Components

### Test Case List
```
┌─────────────────────────────────────────┐
│ ID  │ Name        │ Status  │ Last Run  │
├─────────────────────────────────────────┤
│ TC1 │ Login      │ ✅ Pass │ 2h ago    │
│ TC2 │ Register   │ ❌ Fail │ 1h ago    │
│ TC3 │ Reset Pass │ ⏳ Pending│ Never   │
└─────────────────────────────────────────┘
```
- Sortable columns
- Filterable rows
- Bulk actions
- Quick status indicators

### Test Case Editor
```
┌─────────────────────────────────────────┐
│ Test Case Details                       │
├─────────────────────────────────────────┤
│ Title: [Login with Valid Credentials   ]│
│ Description:                           │
│ [Enter test case description...       ]│
│                                        │
│ Steps:                                 │
│ 1. [Enter username                    ]│
│ 2. [Enter password                    ]│
│ 3. [Click login button                ]│
└─────────────────────────────────────────┘
```
- Rich text editor
- Step-by-step builder
- Validation feedback
- Auto-save functionality

## Form Components

### Search Bar
```
┌─────────────────────────┐
│ 🔍 Search tests...      │
└─────────────────────────┘
```
- Instant search results
- Search history
- Filter suggestions
- Clear button

### Filter Panel
```
┌─────────────────────────┐
│ Filters                 │
├─────────────────────────┤
│ Status:                 │
│ ☑️ Passed               │
│ ☑️ Failed               │
│ ☑️ Pending              │
│                        │
│ Date Range:            │
│ [Start Date] - [End]   │
└─────────────────────────┘
```
- Collapsible sections
- Multiple selection
- Date range picker
- Apply/Reset buttons

## Feedback Components

### Toast Notifications
```
┌─────────────────────────┐
│ ✅ Test case saved      │
└─────────────────────────┘
```
- Auto-dismiss after 3s
- Different styles for success/error
- Action buttons when needed
- Stack multiple notifications

### Modal Dialogs
```
┌─────────────────────────┐
│ Delete Test Case        │
├─────────────────────────┤
│ Are you sure you want   │
│ to delete this test     │
│ case?                   │
│                        │
│ [Cancel]  [Delete]     │
└─────────────────────────┘
```
- Backdrop blur
- Focus trap
- Keyboard navigation
- Responsive sizing

## Data Visualization

### Test Results Chart
```
    │
100%│     ⚪
80% │  ⚪  ⚪
60% │  ⚪  ⚪  🔴
40% │  ⚪  ⚪  🔴  🟡
20% │  ⚪  ⚪  🔴  🟡  ⚪
0%  └─────────────────────
    M  T  W  T  F  S  S
```
- Interactive tooltips
- Zoom capabilities
- Export options
- Custom date ranges

### Progress Dashboard
```
┌─────────────────────────┐
│ Project Progress         │
├─────────────────────────┤
│ Overall: 75%           │
│ [==========----]        │
│                        │
│ By Category:           │
│ UI Tests:    [===---]  │
│ API Tests:   [====--]  │
│ E2E Tests:   [==----]  │
└─────────────────────────┘
```
- Animated progress bars
- Category breakdown
- Trend indicators
- Click to drill down

## Mobile Responsive Examples

### Mobile Navigation
```
┌─────────────────┐
│ ☰ Logo    🔔 👤 │
├─────────────────┤
│ Dashboard       │
│ Projects        │
│ Test Cases      │
│ Reports         │
│ Settings        │
└─────────────────┘
```
- Hamburger menu
- Bottom navigation
- Touch-friendly targets
- Swipe gestures

### Mobile Card View
```
┌─────────────────┐
│ Test Case #123  │
├─────────────────┤
│ Login Test      │
│ Status: ✅ Pass │
│ Last Run: 2h ago│
│ [View Details]  │
└─────────────────┘
```
- Stack layout
- Touch-friendly buttons
- Swipe actions
- Pull to refresh 