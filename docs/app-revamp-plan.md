# App Revamp Plan - Figma Design System Implementation

This document outlines the step-by-step plan to revamp all pages using the Figma design guidelines.

## Phase 1: Foundation Setup

### 1. Global CSS Import
**File**: `src/app/layout.tsx`
**Action**: Add the design system import
```jsx
import '@/styles/figma-design-system.css';
```

### 2. Root Layout Update
**File**: `src/app/layout.tsx`
**Action**: Apply Figma container to main content area

## Phase 2: Page-by-Page Implementation

### Priority 1: Core Pages

#### 1. Library Page (`src/app/library/page.tsx`)
- **Status**: ✅ TopicsByUnit already updated
- **Next**: Apply Figma container to entire page
- **Components to update**: LibrarySidebar, LibraryGrid

#### 2. Admin Page (`src/app/admin/page.tsx`)
- **Action**: Wrap admin sections in `figma-main-frame`
- **Components to update**: ContentAdmin, TopicAdmin, QuestionAdmin

#### 3. Make Game Page (`src/app/make-game/page.tsx`)
- **Action**: Apply Figma styling to form containers
- **Components to update**: MakeGameForm

#### 4. Edit Game Page (`src/app/edit-game/[gameId]/page.tsx`)
- **Action**: Update game editing interface
- **Components to update**: QuestionBrowser, QuestionEditorForm

### Priority 2: Secondary Pages

#### 5. Game Session Page (`src/app/game/[sessionId]/page.tsx`)
- **Components**: GameGrid, Scoreboard, QuestionModal

#### 6. Setup Page (`src/app/setup/page.tsx`)
- **Components**: SetupForm

## Phase 3: Component Updates

### High Priority Components

1. **Header** (`src/components/Header.tsx`)
   - Apply Figma styling for consistent navigation

2. **Library Components**
   - `LibrarySidebar.tsx` - Use figma-topic-card styling
   - `GameCard.tsx` - Apply figma-content-card styling
   - `FolderCard.tsx` - Apply figma-topic-card styling

3. **Admin Components**
   - `ContentAdmin.tsx` - Use figma-main-frame for forms
   - `TopicAdmin.tsx` - Apply consistent card styling
   - `QuestionAdmin.tsx` - Use figma-content-card styling

4. **Form Components**
   - `MakeGameForm.tsx` - Apply figma-main-frame
   - `SetupForm.tsx` - Use consistent form styling

## Implementation Methods

### Method 1: CSS Classes (Recommended)
```jsx
// Main containers
<div className="figma-main-frame">
  {/* Content */}
</div>

// Topic-style cards
<div className="figma-topic-card">
  {/* Card content */}
</div>

// Content-style cards
<div className="figma-content-card">
  {/* Card content */}
</div>
```

### Method 2: Tailwind Classes
```jsx
<div className="box-border flex flex-col items-start p-6 relative w-full max-w-[1440px] min-h-[600px] bg-white border-2 border-gray-300 rounded-lg space-y-4 mx-auto">
  {/* Content */}
</div>
```

### Method 3: Design Tokens
```jsx
<div style={{
  borderColor: 'var(--figma-border-gray)',
  borderRadius: 'var(--figma-border-radius)',
  padding: 'var(--figma-padding)'
}}>
  {/* Content */}
</div>
```

## Quick Start Guide

### Step 1: Import Design System
Add to `src/app/layout.tsx`:
```jsx
import '@/styles/figma-design-system.css';
```

### Step 2: Update One Page First
Start with Library page (`src/app/library/page.tsx`):
```jsx
export default function LibraryPage() {
  return (
    <div className="figma-main-frame">
      <LibrarySidebar />
      <div className="flex-1">
        <TopicsByUnit /> {/* Already updated */}
      </div>
    </div>
  );
}
```

### Step 3: Test and Iterate
- Check responsive behavior
- Verify design consistency
- Adjust spacing if needed

## Benefits

- **Consistent Design**: Professional Figma-based appearance
- **Maintainable**: Centralized styling system
- **Scalable**: Easy to add new components
- **Responsive**: Built-in mobile support

## Next Steps

1. Choose starting point (recommended: Library page)
2. Apply Figma container classes
3. Update child components
4. Test across devices
5. Move to next page

## Files to Update (In Order)

1. `src/app/layout.tsx` - Add CSS import
2. `src/app/library/page.tsx` - Apply main container
3. `src/components/library/LibrarySidebar.tsx` - Update styling
4. `src/app/admin/page.tsx` - Apply main container
5. `src/components/admin/ContentAdmin.tsx` - Update forms
6. `src/components/Header.tsx` - Update navigation
7. Continue with remaining components...

## Testing Checklist

- [ ] Desktop layout (1440px max-width)
- [ ] Tablet responsiveness
- [ ] Mobile responsiveness
- [ ] Component interactions
- [ ] Color consistency
- [ ] Spacing consistency
- [ ] Border and radius consistency
