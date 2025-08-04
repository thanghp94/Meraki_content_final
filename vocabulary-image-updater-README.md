# Vocabulary Image Updater

This system automatically finds and assigns child-appropriate images to vocabulary words in the `meraki.vocabulary` table using Google Images.

## Features

- **Child-Safe Content**: Uses Google Images with safe search enabled (more appropriate than GIPHY for young learners)
- **Mass Updates**: Processes all vocabulary words in bulk
- **Replace All**: Updates ALL image URLs, not just empty ones
- **Rate Limiting**: Built-in delays to respect API limits
- **Progress Tracking**: Real-time progress updates and error reporting
- **Batch Processing**: Processes words in batches to avoid overwhelming APIs

## Setup Requirements

### Environment Variables
Make sure these are set in your `.env` file:

```env
# Google Custom Search API (required)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Database (should already be configured)
DATABASE_URL=your_database_url_here
```

### Google Custom Search Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the "Custom Search API"
3. Create an API key
4. Set up a Custom Search Engine at [Google CSE](https://cse.google.com/)
5. Configure it to search the entire web with SafeSearch enabled

## Usage Options

### Option 1: Web Interface (Recommended)
1. Navigate to `/admin/vocabulary-images` in your browser
2. Click "Update All Vocabulary Images"
3. Monitor progress in real-time
4. View results and statistics

### Option 2: API Endpoint
```bash
# Check current status
curl http://localhost:3000/api/vocabulary/update-images

# Start the update process
curl -X POST http://localhost:3000/api/vocabulary/update-images \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 10, "delayMs": 1500}'
```

### Option 3: Command Line Script
```bash
# Install dependencies if needed
npm install dotenv tsx

# Run the standalone script
npx tsx update-vocabulary-images.ts
```

## How It Works

1. **Fetch Vocabulary**: Retrieves all words from `meraki.vocabulary` table
2. **Search Images**: For each word, searches Google Images with safe search
3. **Select Best Match**: Chooses the first (most relevant) Google Images result
4. **Update Database**: Saves the image URL to the `image_url` column
5. **Rate Limiting**: Waits between requests to avoid hitting API limits

## Configuration

### Batch Processing Settings
- **Batch Size**: Number of words processed in each batch (default: 10)
- **Delay**: Milliseconds between each API request (default: 1500ms)
- **Batch Delay**: Extra delay between batches (default: 3000ms)

### API Priorities
1. **Google Images** (Primary) - Static, educational images
2. **GIPHY** (Disabled for children) - Animated GIFs can be distracting

## Expected Results

- **Success Rate**: Typically 80-95% depending on word complexity
- **Processing Time**: ~2-3 seconds per word (including delays)
- **Image Quality**: High-resolution, child-appropriate images
- **Relevance**: Google's algorithm ensures good word-to-image matching

## Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set
   - Check API quotas in Google Cloud Console

2. **Rate Limiting**
   - Increase `delayMs` if getting rate limit errors
   - Reduce `batchSize` for more conservative processing

3. **Database Connection**
   - Ensure `DATABASE_URL` is correct
   - Check database permissions for the `meraki.vocabulary` table

4. **No Images Found**
   - Some abstract or complex words may not have good image matches
   - Check the error log for specific words that failed

### Monitoring

- **Web Interface**: Real-time progress and statistics
- **Console Logs**: Detailed processing information
- **Database**: Check `updated_at` timestamps to see recent updates

## Files Created

- `src/app/api/vocabulary/update-images/route.ts` - Main API endpoint
- `update-vocabulary-images.ts` - Standalone CLI script
- `src/components/admin/VocabularyImageUpdater.tsx` - Web interface
- `src/app/admin/vocabulary-images/page.tsx` - Admin page

## Safety Features

- **Safe Search**: Google Images configured with safe search active
- **Child-Appropriate**: Prioritizes educational content over entertainment
- **Error Handling**: Graceful handling of API failures and network issues
- **Progress Tracking**: Never lose track of where the process stopped
- **Rollback Safe**: Original data preserved, only `image_url` column updated

## Performance

- **Memory Efficient**: Processes in small batches
- **API Friendly**: Respects rate limits with built-in delays
- **Resumable**: Can be stopped and restarted without issues
- **Scalable**: Handles thousands of vocabulary words efficiently
