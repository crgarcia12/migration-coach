import type { Slide } from '../types';

export interface SlideContent {
  slideNumber: number;
  title: string;
  extractedText: string;
}

interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

const CACHE_KEY = 'migration-coach-slide-ocr-cache';
const CACHE_VERSION = 'v1'; // Increment this to invalidate old cache

interface CachedOCRData {
  version: string;
  timestamp: number;
  slides: SlideContent[];
}

const getAzureOpenAIConfig = (): AzureOpenAIConfig => {
  return {
    endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
    apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
    deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4'
  };
};

/**
 * Load OCR results from localStorage cache
 */
const loadFromCache = (): SlideContent[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedOCRData = JSON.parse(cached);
    
    // Check version
    if (data.version !== CACHE_VERSION) {
      console.log('OCR cache version mismatch, will re-extract');
      return null;
    }

    // Cache is valid for 7 days
    const cacheAge = Date.now() - data.timestamp;
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    
    if (cacheAge > maxAge) {
      console.log('OCR cache expired, will re-extract');
      return null;
    }

    console.log(`Loaded ${data.slides.length} slides from OCR cache (${Math.round(cacheAge / (60 * 60 * 1000))} hours old)`);
    return data.slides;
  } catch (error) {
    console.error('Error loading OCR cache:', error);
    return null;
  }
};

/**
 * Save OCR results to localStorage cache
 */
const saveToCache = (slides: SlideContent[]): void => {
  try {
    const data: CachedOCRData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      slides
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    console.log(`Saved ${slides.length} slides to OCR cache`);
  } catch (error) {
    console.error('Error saving OCR cache:', error);
  }
};

/**
 * Clear OCR cache (useful for debugging or forcing re-extraction)
 */
export const clearOCRCache = (): void => {
  localStorage.removeItem(CACHE_KEY);
  console.log('OCR cache cleared');
};

/**
 * Convert image URL to base64 data URL
 */
const imageUrlToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

/**
 * Extract text from a single slide image using GPT-5.1 Vision API
 */
export const extractTextFromSlide = async (imageUrl: string): Promise<string> => {
  const config = getAzureOpenAIConfig();
  
  if (!config.endpoint || !config.apiKey) {
    console.warn('Azure OpenAI not configured. Skipping OCR.');
    return '';
  }

  try {
    // Convert image to base64 for inline transmission
    console.log(`Converting image to base64: ${imageUrl}`);
    const base64Image = await imageUrlToBase64(imageUrl);
    
    const apiUrl = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    console.log(`Extracting text from slide using GPT-5.1 Vision`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract ALL text content from this presentation slide. Include all headings, bullet points, numbers, labels, and any other text visible on the slide. Preserve the structure and hierarchy. Return only the extracted text, no additional commentary.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_completion_tokens: 1000,
        temperature: 0.0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GPT Vision API error:', errorText);
      return '';
    }

    const data = await response.json();
    const extractedText = data.choices[0]?.message?.content || '';
    
    console.log(`Extracted ${extractedText.length} characters from slide`);
    return extractedText;

  } catch (error) {
    console.error('Error extracting text from slide:', error);
    return '';
  }
};

/**
 * Extract text from all slides in the presentation
 * Returns an array of SlideContent objects
 * Uses localStorage cache to avoid re-extraction
 */
export const extractTextFromAllSlides = async (slides: Slide[]): Promise<SlideContent[]> => {
  // Try to load from cache first
  const cached = loadFromCache();
  if (cached && cached.length === slides.length) {
    console.log('Using cached OCR results!');
    return cached;
  }

  console.log(`Starting GPT Vision OCR extraction for ${slides.length} slides...`);
  const results: SlideContent[] = [];
  
  // Process slides in batches to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < slides.length; i += batchSize) {
    const batch = slides.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (slide, batchIndex) => {
        const slideNumber = i + batchIndex + 1;
        console.log(`[${slideNumber}/${slides.length}] Extracting text from ${slide.title}...`);
        const text = await extractTextFromSlide(slide.imageUrl);
        return {
          slideNumber,
          title: slide.title,
          extractedText: text
        };
      })
    );
    
    results.push(...batchResults);
    
    console.log(`Completed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(slides.length / batchSize)}`);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < slides.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('OCR extraction complete!');
  
  // Save to cache
  saveToCache(results);
  
  return results;
};

/**
 * Format all OCR results for inclusion in the coaching prompt
 */
export const formatOCRForPrompt = (
  slideContents: SlideContent[],
  currentSlideIndex: number
): string => {
  const lines: string[] = [];
  
  lines.push('=== PRESENTATION SLIDES CONTENT (OCR Extracted via GPT Vision) ===');
  lines.push(`Current slide: Slide ${currentSlideIndex + 1}`);
  lines.push('');
  
  slideContents.forEach((content) => {
    const isCurrent = content.slideNumber === currentSlideIndex + 1;
    const marker = isCurrent ? '>>> CURRENT SLIDE >>> ' : '';
    
    lines.push(`${marker}Slide ${content.slideNumber}: ${content.title}`);
    if (content.extractedText) {
      lines.push(content.extractedText);
    } else {
      lines.push('[No text extracted]');
    }
    lines.push('---');
  });
  
  lines.push('=== END SLIDES CONTENT ===');
  
  return lines.join('\n');
};
