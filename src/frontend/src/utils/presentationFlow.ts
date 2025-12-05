import type { CustomerContext, Slide } from '../types';
import type { SlideContent } from './slideOCR';

interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

const getAzureOpenAIConfig = (): AzureOpenAIConfig => {
  return {
    endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
    apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
    deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4'
  };
};

export interface PresentationFlow {
  orderedSlideIds: number[];
  reasoning: string;
}

export interface SlideTalkingPoints {
  slideId: number;
  slideTitle: string;
  keyMessage1: string;
  keyMessage2: string;
}

/**
 * Generate an optimized presentation flow based on customer context and slide content
 */
export const generatePresentationFlow = async (
  customerContext: CustomerContext,
  allSlides: Slide[],
  slideContents: SlideContent[]
): Promise<PresentationFlow> => {
  const config = getAzureOpenAIConfig();
  
  if (!config.endpoint || !config.apiKey) {
    console.warn('Azure OpenAI not configured. Using default slide order.');
    return {
      orderedSlideIds: allSlides.map(s => s.id),
      reasoning: 'Default order (Azure OpenAI not configured)'
    };
  }

  try {
    console.log('=== Generating Presentation Flow ===');
    console.log('Customer Context:', customerContext);
    console.log('- Audience:', customerContext.audienceType);
    console.log('- Urgency:', customerContext.urgency);
    console.log('- Timeline:', customerContext.timeline);
    console.log('- Modernization Appetite:', customerContext.modernizationAppetite);
    console.log('- Pain Points:', customerContext.painPoints.join(', '));
    console.log('- Budget Sensitivity:', customerContext.budgetSensitivity);

    // Build the prompt with customer context and all slide content
    const slidesSummary = slideContents.map(sc => 
      `Slide ${sc.slideNumber} (${sc.title}):\n${sc.extractedText}\n---`
    ).join('\n\n');

    const systemPrompt = `You are an expert presentation strategist for cloud migration sales. Your task is to analyze the customer's situation and reorder presentation slides to maximize impact and relevance.

Customer Profile:
- Audience Type: ${customerContext.audienceType}
- Urgency: ${customerContext.urgency}
- Timeline: ${customerContext.timeline}
- Modernization Appetite: ${customerContext.modernizationAppetite}
- Pain Points: ${customerContext.painPoints.join(', ')}
- Budget Sensitivity: ${customerContext.budgetSensitivity}

Available Slides (with OCR-extracted content):
${slidesSummary}

Your task:
1. Analyze the customer's needs, urgency, audience type, and pain points
2. Review all slide content to understand what each slide covers
3. Create an optimized presentation flow that:
   - Starts with slides that address their immediate pain points
   - Matches their urgency level (urgent = cost/timeline focus first, exploring = vision/strategy first)
   - Aligns with their modernization appetite (conservative = low-risk approach, aggressive = innovation focus)
   - Suits their audience (technical = architecture details, business = ROI/business value, executive = strategic vision)
   - Builds a logical narrative that leads to the solution

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "orderedSlideIds": [8, 9, 10, ...],
  "reasoning": "Brief explanation of the flow strategy for this customer"
}

The orderedSlideIds array must contain ALL slide IDs (numbers) from 8 through 43 in the optimized order.`;

    console.log('\n=== System Prompt for Flow Generation ===');
    console.log(systemPrompt);
    console.log('=== End System Prompt ===\n');

    const apiUrl = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    console.log('Requesting presentation flow from GPT...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the optimized presentation flow for this customer.' }
        ],
        max_completion_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GPT API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }

    const flow: PresentationFlow = JSON.parse(content);
    
    console.log('\n=== Generated Presentation Flow ===');
    console.log('Flow Reasoning:', flow.reasoning);
    console.log('\nSlide Order (first 10):');
    flow.orderedSlideIds.slice(0, 10).forEach((slideId, idx) => {
      const slide = allSlides.find(s => s.id === slideId);
      console.log(`  ${idx + 1}. Slide ${slideId}: ${slide?.title || 'Unknown'}`);
    });
    console.log('  ...');
    console.log(`\nComplete order: [${flow.orderedSlideIds.join(', ')}]`);
    console.log('=== End Presentation Flow ===\n');
    
    return flow;

  } catch (error) {
    console.error('Error generating presentation flow:', error);
    // Fallback to default order
    return {
      orderedSlideIds: allSlides.map(s => s.id),
      reasoning: 'Error generating flow, using default order'
    };
  }
};

/**
 * Reorder slides based on the generated flow
 */
export const reorderSlides = (slides: Slide[], flow: PresentationFlow): Slide[] => {
  console.log('\n=== Reordering Slides ===');
  console.log('Original order:', slides.map(s => s.id).join(', '));
  
  const slideMap = new Map(slides.map(s => [s.id, s]));
  const reordered: Slide[] = [];
  
  for (const slideId of flow.orderedSlideIds) {
    const slide = slideMap.get(slideId);
    if (slide) {
      reordered.push(slide);
    }
  }
  
  // Add any missing slides at the end (safety check)
  const missingSlides: Slide[] = [];
  for (const slide of slides) {
    if (!reordered.find(s => s.id === slide.id)) {
      reordered.push(slide);
      missingSlides.push(slide);
    }
  }
  
  if (missingSlides.length > 0) {
    console.warn('⚠️ Missing slides added at end:', missingSlides.map(s => `${s.id}: ${s.title}`).join(', '));
  }
  
  console.log('New order:', reordered.map(s => s.id).join(', '));
  console.log(`✓ Successfully reordered ${reordered.length} slides`);
  console.log('=== End Reordering ===\n');
  
  return reordered;
};

/**
 * Generate key talking points for each slide in the presentation
 */
export const generateTalkingPoints = async (
  customerContext: CustomerContext,
  orderedSlides: Slide[],
  slideContents: SlideContent[]
): Promise<SlideTalkingPoints[]> => {
  const config = getAzureOpenAIConfig();
  
  try {
    console.log('\n🎤 === Generating Talking Points ===');
    
    // Build content summary
    const slidesSummary = orderedSlides.map((slide, idx) => {
      const content = slideContents.find(sc => sc.slideNumber === slide.id);
      return `${idx + 1}. Slide ${slide.id} - ${slide.title}:\n${content?.extractedText || 'No content'}\n---`;
    }).join('\n\n');

    const systemPrompt = `You are an expert sales coach for cloud migration presentations. Generate the 1-2 most important talking points for each slide in this customized presentation.

Customer Profile:
- Audience Type: ${customerContext.audienceType}
- Urgency: ${customerContext.urgency}
- Timeline: ${customerContext.timeline}
- Modernization Appetite: ${customerContext.modernizationAppetite}
- Pain Points: ${customerContext.painPoints.join(', ')}
- Budget Sensitivity: ${customerContext.budgetSensitivity}

Presentation Flow (in the customized order for this customer):
${slidesSummary}

For each slide, provide:
1. The ONE most critical message to convey (keyMessage1)
2. A powerful supporting point or call-to-action (keyMessage2)

These should be:
- Concise (1-2 sentences each)
- Tailored to this specific customer's context
- Focused on value and outcomes
- Actionable and memorable

Return ONLY a valid JSON object with this structure (no markdown, no code blocks):
{
  "talkingPoints": [
    {
      "slideId": 8,
      "slideTitle": "Slide Title",
      "keyMessage1": "Primary message",
      "keyMessage2": "Supporting point"
    },
    ...
  ]
}`;

    console.log('Requesting talking points from GPT...');
    
    const apiUrl = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate the key talking points for each slide in this presentation.' }
        ],
        max_completion_tokens: 4000,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GPT API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in response');
    }

    const result = JSON.parse(content);
    const talkingPoints: SlideTalkingPoints[] = result.talkingPoints || [];
    
    console.log(`✓ Generated talking points for ${talkingPoints.length} slides`);
    console.log('=== End Talking Points ===\n');
    
    return talkingPoints;

  } catch (error) {
    console.error('Error generating talking points:', error);
    // Fallback to empty array
    return [];
  }
};
