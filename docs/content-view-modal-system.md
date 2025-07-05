# Content View Modal System Documentation

## Overview

The Content View Modal system provides a comprehensive popup interface for viewing educational content, similar to the Nostradamus example you provided. It features structured content display, media galleries, text-to-speech integration, and popup functionality for images and videos.

## Features

### 🎯 **Core Functionality**
- **Modal-based Content Display**: Full-screen popup for immersive content viewing
- **Structured Content Layout**: Left panel for text content, right panel for media gallery
- **Text-to-Speech Integration**: Speaker icons throughout for accessibility
- **Media Gallery**: Images and videos with popup viewing capability
- **Navigation Controls**: Previous/Next navigation between content items
- **Quiz Integration**: Easy/Hard Quiz buttons for immediate assessment

### 🎨 **UI Components**
- **ContentViewModal**: Main modal component matching your design
- **MediaModal**: Popup for full-size image/video viewing
- **Content Sections**: Structured display with TTS for each section
- **Media Gallery**: Clickable thumbnails with expand functionality

### 🔊 **TTS Integration**
- **Section-level TTS**: Individual speaker icons for each content section
- **Full Content TTS**: Complete content reading with one click
- **Customizable Speech**: Rate, pitch, and volume controls
- **Accessibility Compliant**: WCAG-compliant with keyboard navigation

## Implementation

### **File Structure**
```
src/
├── components/ui/
│   ├── content-view-modal.tsx     # Main modal component
│   └── text-to-speech-button.tsx  # TTS integration
├── app/
│   ├── content-demo/              # Demo page
│   │   └── page.tsx
│   └── api/admin/content/
│       └── nostradamus-sample/    # Sample API endpoint
│           └── route.ts
└── docs/
    └── content-view-modal-system.md
```

### **Component Usage**

#### **Basic Implementation**
```tsx
import ContentViewModal from '@/components/ui/content-view-modal';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  return (
    <>
      <Button onClick={() => {
        setSelectedContentId('content-id');
        setIsModalOpen(true);
      }}>
        View Content
      </Button>

      <ContentViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contentId={selectedContentId}
        onNavigate={handleNavigation}
        showNavigation={true}
      />
    </>
  );
}
```

#### **With Navigation**
```tsx
const handleContentNavigation = (direction: 'prev' | 'next') => {
  const currentIndex = contentList.findIndex(item => item.id === selectedContentId);
  if (currentIndex === -1) return;

  let newIndex;
  if (direction === 'prev') {
    newIndex = currentIndex > 0 ? currentIndex - 1 : contentList.length - 1;
  } else {
    newIndex = currentIndex < contentList.length - 1 ? currentIndex + 1 : 0;
  }

  setSelectedContentId(contentList[newIndex].id);
};
```

### **Content Data Structure**
```typescript
interface ContentData {
  id: string;
  title: string;
  content: string;        // Structured content with sections
  image?: string;         // Primary image URL
  image2?: string;        // Secondary image URL
  video?: string;         // Primary video URL
  video2?: string;        // Secondary video URL
  unit: string;
  topic: string;
}
```

### **Content Format**
The content string should be formatted with sections separated by double newlines:
```
Real name: Michel de Nostredame, French astrologer, physician.

Known for: Les Prophéties, 900+ quatrains predicting events.

Nostradamus: His real name was Michel de Nostredame, a French astrologer and physician.

Prophecies: He is known for his book Les Prophéties, containing over 900 quatrains predicting future events.
```

## Integration Points

### **1. Library View Integration** ✅
- **Location**: `src/components/library/ContentTable.tsx`
- **Feature**: "View" button added to each content row
- **Functionality**: Opens content modal with navigation between items

```tsx
// Already integrated in ContentTable.tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => handleViewContent(item.id)}
>
  <Eye className="h-4 w-4 mr-1" />
  View
</Button>
```

### **2. Setup Form Integration** (Ready to implement)
- **Location**: `src/components/quiz/SetupForm.tsx`
- **Purpose**: Preview content before creating quizzes
- **Implementation**: Add "Preview Content" button

### **3. Admin Interface Integration** (Ready to implement)
- **Location**: `src/components/admin/ContentAdmin.tsx`
- **Purpose**: Preview content during editing
- **Implementation**: Add preview functionality to content management

### **4. Quiz Game Integration** (Ready to implement)
- **Location**: Quiz game components
- **Purpose**: Reference material during gameplay
- **Implementation**: "Study Material" button in game interface

## Demo and Testing

### **Content Demo Page** 📍
- **URL**: `/content-demo`
- **Access**: Header navigation → "Content Demo"
- **Features**:
  - Live Nostradamus example matching your design
  - Multiple sample content cards
  - Integration instructions
  - Feature demonstrations

### **Sample Content**
The demo includes a fully functional Nostradamus example with:
- Structured content sections with TTS
- Multiple images and videos
- Popup media viewing
- Navigation controls
- Quiz integration buttons

## Media Handling

### **Image Support**
- **Formats**: JPG, PNG, WebP, SVG
- **Sources**: URLs, uploaded files, external links
- **Features**: Thumbnail view, popup expansion, alt text support

### **Video Support**
- **Formats**: MP4, WebM, OGV
- **Sources**: Direct URLs, YouTube embeds, Vimeo links
- **Features**: Thumbnail preview, popup player, autoplay controls

### **Media Modal Features**
- **Full-screen viewing**: Black background with centered media
- **Controls**: Close button, keyboard navigation (ESC)
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Proper focus management and ARIA labels

## Accessibility Features

### **WCAG Compliance**
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Logical tab order and focus trapping in modals
- **Color Contrast**: Meets WCAG AA standards

### **TTS Accessibility**
- **Section Reading**: Individual TTS for each content section
- **Full Content Reading**: Complete content audio with one click
- **Visual Indicators**: Clear visual feedback for TTS state
- **Keyboard Controls**: Space bar to play/pause, ESC to stop

## Performance Considerations

### **Optimization**
- **Lazy Loading**: Media loaded only when needed
- **Content Caching**: API responses cached for better performance
- **Modal Rendering**: Conditional rendering to avoid unnecessary DOM nodes
- **Image Optimization**: Responsive images with appropriate sizing

### **Best Practices**
- **Content Chunking**: Large content split into manageable sections
- **Media Compression**: Optimized images and videos for web delivery
- **API Efficiency**: Minimal data transfer with structured responses
- **Memory Management**: Proper cleanup of media elements and event listeners

## Browser Support

### **Compatibility**
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **TTS Support**: Web Speech API availability varies by browser
- **Media Support**: HTML5 video/audio support required
- **Modal Support**: CSS Grid and Flexbox support required

### **Fallbacks**
- **No TTS**: Graceful degradation when Web Speech API unavailable
- **No Video**: Image fallback for unsupported video formats
- **No JavaScript**: Basic content display without interactive features

## Future Enhancements

### **Planned Features**
- **Offline Support**: Content caching for offline viewing
- **Print Functionality**: Formatted printing of content
- **Bookmarking**: Save favorite content sections
- **Annotations**: User notes and highlights
- **Social Sharing**: Share content sections via social media

### **Advanced Features**
- **Content Search**: Full-text search within content
- **Related Content**: Suggestions based on current content
- **Progress Tracking**: Reading progress and completion status
- **Multi-language**: Content translation and localization
- **Interactive Elements**: Embedded quizzes and activities

## Troubleshooting

### **Common Issues**
1. **Modal not opening**: Check contentId is valid and API endpoint exists
2. **Media not loading**: Verify URLs are accessible and formats supported
3. **TTS not working**: Check browser support and user permissions
4. **Navigation not working**: Ensure content array has multiple items

### **Debug Tools**
- **Console Logging**: Detailed operation logs in browser console
- **Network Tab**: Monitor API calls and media loading
- **React DevTools**: Component state and props inspection
- **Accessibility Tools**: Screen reader and keyboard navigation testing

## API Requirements

### **Content Endpoint**
```typescript
GET /api/admin/content/[id]

Response:
{
  id: string;
  title: string;
  content: string;
  image?: string;
  image2?: string;
  video?: string;
  video2?: string;
  unit: string;
  topic: string;
  createdAt: string;
  updatedAt: string;
}
```

### **Error Handling**
- **404 Not Found**: Content doesn't exist
- **500 Server Error**: Database or server issues
- **Network Errors**: Connection problems
- **Timeout Errors**: Slow API responses

The Content View Modal system provides a comprehensive solution for displaying educational content with modern UI/UX patterns, accessibility features, and seamless integration with your existing quiz platform.
