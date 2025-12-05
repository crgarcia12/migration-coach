# Azure Document Intelligence OCR Integration

## Overview

The Migration Coach app now uses **Azure Document Intelligence** (part of Azure AI Foundry) to extract text from presentation slides using the **prebuilt-read** model. This enables the AI coach to have full context of all slide content when providing coaching feedback.

## How It Works

1. **On Application Load**: When the coaching interface loads, it automatically extracts text from all 36 presentation slides using Azure Document Intelligence's Read model
2. **OCR Processing**: Slides are processed in batches of 3 to avoid rate limiting, with progress logged to the console
3. **Context Enhancement**: The extracted text from all slides is included in every coaching prompt, giving the AI complete visibility into the presentation content
4. **Real-time Coaching**: The AI coach uses the OCR'd content to provide specific, contextual feedback based on actual slide content

## Azure Document Intelligence Read Model

The Read model is specifically designed for:
- **High-resolution OCR** for documents and presentations
- **Multi-language support** for global presentations
- **Paragraph and structure detection** for better context understanding
- **High accuracy** on dense text and complex layouts

API Documentation: https://learn.microsoft.com/en-us/azure/ai-services/document-intelligence/prebuilt/read

## Configuration

### Required Environment Variables

```env
# Azure Document Intelligence
VITE_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com
VITE_AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key
```

### Setup Steps

1. **Create Azure Document Intelligence Resource**:
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a "Document Intelligence" resource
   - Copy the endpoint and API key

2. **Update `.env` file**:
   ```bash
   cp .env.example .env
   # Edit .env and add your Document Intelligence credentials
   ```

3. **Restart Dev Server**:
   ```bash
   npm run dev
   ```

## Implementation Details

### File Structure

```
src/utils/slideOCR.ts          # OCR extraction utilities
src/components/CoachingInterface.tsx  # Initiates OCR on mount
src/utils/azureAICoach.ts      # Includes OCR context in prompts
```

### Key Functions

#### `extractTextFromSlide(imageUrl: string): Promise<string>`
Extracts text from a single slide image using Document Intelligence Read model.

#### `extractTextFromAllSlides(slides: Slide[]): Promise<SlideContent[]>`
Processes all slides in batches, returning an array of slide content objects.

#### `formatOCRForPrompt(slideContents: SlideContent[], currentSlideIndex: number): string`
Formats OCR results for inclusion in the AI coaching prompt, highlighting the current slide.

### API Flow

1. **Initiate Analysis**:
   ```
   POST /documentintelligence/documentModels/prebuilt-read:analyze
   Body: { "urlSource": "https://..." }
   ```

2. **Poll for Results**:
   ```
   GET /documentModels/prebuilt-read/analyzeResults/{resultId}
   ```

3. **Extract Content**:
   ```javascript
   const text = result.analyzeResult.content;
   ```

## Performance Considerations

- **Batch Processing**: Slides are processed 3 at a time to avoid rate limits
- **Caching**: OCR results are stored in state for the session duration
- **Loading State**: UI shows loading indicator while OCR is in progress
- **Error Handling**: Graceful fallback if OCR fails - coaching continues without OCR context

## Cost Optimization

- **Free Tier**: Document Intelligence offers 500 free pages/month
- **Pricing**: After free tier, ~$1.50 per 1,000 pages
- **For this app**: 36 slides = 36 pages per session

Learn more: https://azure.microsoft.com/en-us/pricing/details/ai-document-intelligence/

## Troubleshooting

### OCR Not Working

Check browser console for errors:
```javascript
// Look for these logs:
"Starting Document Intelligence analysis for: ..."
"Extracted X characters from slide"
"OCR extraction complete!"
```

### Common Issues

1. **CORS Errors**: Ensure slide images are publicly accessible or served from same origin
2. **Rate Limiting**: Reduce batch size in `slideOCR.ts` if hitting rate limits
3. **Timeout**: Increase `maxAttempts` if slides take longer to process

### Debug Mode

Enable verbose logging by checking browser console. All OCR operations log detailed progress:
- Configuration status
- Each slide being processed
- Extraction results
- Completion status

## Future Enhancements

- [ ] Cache OCR results in localStorage to avoid re-processing
- [ ] Support for custom slide uploads with OCR
- [ ] Table and structure extraction for complex slides
- [ ] Multi-language OCR with language detection
- [ ] Parallel processing with connection pooling
