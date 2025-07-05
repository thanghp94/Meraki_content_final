
# Figma Design System Documentation

This document explains how to use the Figma design system CSS file for consistent styling across the application.

## Overview

The `src/styles/figma-design-system.css` file contains:
- Original Figma CSS specifications
- Tailwind CSS equivalents
- Design tokens (CSS variables)
- Component-specific styles
- Responsive breakpoints
- Usage examples

## Quick Start

### 1. Import the CSS file

```typescript
// In your component file
import '@/styles/figma-design-system.css';
```

### 2. Use CSS classes

```jsx
// Main container using Figma specifications
<div className="figma-main-frame">
  {/* Your content */}
</div>

// Topic cards
<div className="figma-topic-card">
  {/* Topic content */}
</div>

// Content cards
<div className="figma-content-card">
  {/* Content */}
</div>
```

### 3. Use CSS variables

```jsx
// Using design tokens
<div style={{ 
  borderColor: 'var(--figma-border-gray)',
  borderRadius: 'var(--figma-border-radius)'
}}>
  Content
</div>
```

### 4. Use Tailwind equivalents

```jsx
// Tailwind classes that match Figma design
<div className="box-border flex flex-col items-start p-6 relative w-full max-w-[1440px] min-h-[600px] bg-white border-2 border-gray-300 rounded-lg space-y-4 mx-auto">
  Content
</div>
```

## Design Tokens

Available CSS variables:

```css
--figma-white: #FFFFFF
--figma-border-gray: #CED4DA
--figma-max-width: 1440px
--figma-min-height: 600px
--figma-border-width: 2px
--figma-border-radius: 8px
--figma-padding: 24px
--figma-gap: 16px
```

## Component Examples

### TopicsByUnit Component

Current implementation using Figma design:

```jsx
<div className="box-border flex flex-col items-start p-6 relative w-full max-w-[1440px] min-h-[600px] bg-white border-2 border-gray-300 rounded-lg space-y-4 mx-auto">
  {/* Unit groups and topics */}
</div>
```

### Future Components

For new components, you can:

1. **Use the CSS class**: `className="figma-main-frame"`
2. **Use Tailwind equivalent**: Copy the Tailwind classes from the CSS file
3. **Mix and match**: Use design tokens for specific properties

## Adding New Figma Designs

When you have new Figma CSS to add:

1. **Copy the original CSS** from Figma
2. **Add it to the CSS file** under a new section
3. **Create Tailwind equivalents**
4. **Update design tokens** if needed
5. **Document usage** in this file

### Example of adding new design:

```css
/* =============================================================================
   NEW COMPONENT FROM FIGMA
   ============================================================================= */

/**
 * Button Component
 * Original Figma CSS:
 * - background: #3B82F6
 * - border-radius: 6px
 * - padding: 12px 24px
 */
.figma-button {
  background: #3B82F6;
  border-radius: 6px;
  padding: 12px 24px;
  color: white;
  border: none;
  cursor: pointer;
}

/**
 * Tailwind equivalent:
 * className="bg-blue-500 rounded-md px-6 py-3 text-white border-none cursor-pointer"
 */
```

## Best Practices

1. **Always document** the original Figma CSS
2. **Provide Tailwind equivalents** for consistency
3. **Use design tokens** when possible
4. **Test responsive behavior**
5. **Update this documentation** when adding new styles

## Responsive Design

The design system includes responsive breakpoints:

- **Desktop**: Full Figma specifications (1440px max-width)
- **Tablet**: Adjusted padding and margins
- **Mobile**: Compact spacing and full-width containers

## Integration with Existing Code

The design system works alongside:
- Tailwind CSS classes
- Component-specific styles
- shadcn/ui components
- Custom CSS modules

Choose the approach that best fits each component's needs.
