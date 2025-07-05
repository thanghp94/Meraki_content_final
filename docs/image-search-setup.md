# Image Search Setup Guide

This guide explains how to set up GIPHY and Google Images search functionality for the quiz application.

## API Keys Setup

### 1. GIPHY API Key

1. Go to [GIPHY Developers](https://developers.giphy.com/)
2. Create a free account or sign in
3. Create a new app to get your API key
4. Copy your API key

### 2. Google Custom Search API (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search API"
4. Create credentials (API Key)
5. Set up a Custom Search Engine at [Google CSE](https://cse.google.com/)
6. Configure it to search the entire web for images
7. Copy your Search Engine ID

## Environment Configuration

Add these keys to your `.env.local` file:

```env
# GIPHY API Key (Required for GIF search)
NEXT_PUBLIC_GIPHY_API_KEY=your_actual_giphy_api_key_here

# Google Custom Search API (Optional for image search)
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

## Features

### Current Implementation

- **GIPHY Search**: Search for animated GIFs
- **Google Images**: Search for static images (when configured)
- **Direct URL Input**: Paste any image URL directly
- **Image Preview**: See images before selecting
- **Mixed Content**: Support for text + image combinations

### Usage

1. **In Question Form**: Select "Image Only" or "Text + Image"
2. **Click Search Button**: Opens the image search modal
3. **Search Images**: Enter keywords and click "Search Images"
4. **Select Image**: Click on any result to use it
5. **Or Use Direct URL**: Paste any image URL in the direct input field

### Supported Content Types

- **Text Only**: Traditional text-based questions/answers
- **Image Only**: Image-based questions/answers (great for visual learning)
- **Text + Image**: Combined text and image content

## Testing

To test the image search functionality:

1. Make sure your API keys are properly set in `.env.local`
2. Restart the development server: `npm run dev`
3. Go to Admin Panel → Questions → Add Question
4. Select "Image Only" for question text
5. Click the "Search" button
6. Try searching for terms like "science", "math", "history"

## Troubleshooting

### GIPHY Search Not Working
- Check if `NEXT_PUBLIC_GIPHY_API_KEY` is set correctly
- Verify the API key is valid on GIPHY developers dashboard
- Check browser console for error messages

### Google Images Not Working
- Ensure both `NEXT_PUBLIC_GOOGLE_API_KEY` and `NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID` are set
- Verify the Custom Search Engine is configured for image search
- Check API quotas in Google Cloud Console

### Images Not Loading
- Verify the image URLs are accessible
- Check if images have CORS restrictions
- Try using different image sources

## API Endpoints

- `GET /api/search-images?q=query&source=all|giphy|google`
  - `q`: Search query
  - `source`: Search source (default: "all")

## Security Notes

- API keys are exposed to the client side (NEXT_PUBLIC_*)
- Consider implementing rate limiting
- Monitor API usage to avoid exceeding quotas
- For production, consider server-side API calls to hide keys
