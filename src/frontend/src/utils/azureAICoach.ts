import type { CustomerContext, Slide, Message } from '../types';
import type { SlideContent } from './slideOCR';
import { formatOCRForPrompt } from './slideOCR';
import { getConfig } from './config';

interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

// Get configuration from centralized config (localStorage or environment)
const getAzureAIConfig = (): AzureAIConfig => {
  const config = getConfig();
  return config.openai;
};

export const generateAICoachResponse = async (
  userResponse: string,
  currentSlide: Slide,
  customerContext: CustomerContext,
  messageHistory: Message[],
  slideContents: SlideContent[] = [],
  currentSlideIndex: number = 0
): Promise<{ content: string; sentiment: 'challenging' | 'supportive' | 'neutral' }> => {
  const config = getAzureAIConfig();
  
  console.log('=== Azure AI Coach Configuration ===');
  console.log('Endpoint:', config.endpoint);
  console.log('Deployment:', config.deploymentName);
  console.log('API Key configured:', config.apiKey ? 'Yes (hidden)' : 'No');
  
  if (!config.endpoint || !config.apiKey) {
    console.warn('Azure OpenAI not configured. Using fallback coaching engine.');
    return generateFallbackResponse();
  }

  // Build the conversation history for context
  const conversationHistory = messageHistory.slice(-6).map(msg => ({
    role: msg.role === 'coach' ? 'assistant' : 'user',
    content: msg.content
  }));

  // Create the system prompt for the AI coach
  let systemPrompt = `You are an elite sales coach training a seller to present a migration assessment to a customer. Your coaching style is ASSERTIVE and CHALLENGING - you push sellers to excellence and don't accept mediocre answers.

CUSTOMER CONTEXT:
- Urgency: ${customerContext.urgency}
- Timeline: ${customerContext.timeline || 'Not specified'}
- Modernization Appetite: ${customerContext.modernizationAppetite}
- Audience Type: ${customerContext.audienceType}
- Budget Sensitivity: ${customerContext.budgetSensitivity}
- Pain Points: ${customerContext.painPoints.join(', ')}

CURRENT SLIDE: ${currentSlide.title}

KEY POINTS FOR THIS SLIDE:
${currentSlide.keyPoints.map(p => `- ${p}`).join('\n')}

POTENTIAL OBJECTIONS:
${currentSlide.potentialObjections.map(p => `- ${p}`).join('\n')}

RED FLAGS (what NOT to say):
${currentSlide.redFlags.map(p => `- ${p}`).join('\n')}`;

  // Add OCR extracted content if available
  if (slideContents.length > 0) {
    systemPrompt += `\n\n${formatOCRForPrompt(slideContents, currentSlideIndex)}`;
  }

  systemPrompt += `

YOUR COACHING APPROACH:
1. Be DIRECT and CHALLENGING - don't coddle the seller
2. Call out weak language ("maybe", "I think", "probably")
3. Demand specificity and confidence
4. Connect their answer to the customer's specific context
5. If they hit a red flag, call it out immediately
6. When they do well, acknowledge it but then push them further
7. Keep responses conversational and realistic (100-150 words)
8. Use tough love - you want them to succeed by being excellent

Respond to the seller's answer with coaching feedback. Be tough but fair.`;

  console.log('=== System Prompt ===');
  console.log(systemPrompt);
  console.log('\n=== User Response ===');
  console.log(userResponse);
  console.log('\n=== Conversation History (last 6) ===');
  console.log(JSON.stringify(conversationHistory, null, 2));

  try {
    const apiUrl = `${config.endpoint}/openai/deployments/${config.deploymentName}/chat/completions?api-version=2024-02-15-preview`;
    
    console.log('\n=== API Call ===');
    console.log('URL:', apiUrl);
    
    const requestBody = {
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userResponse }
      ],
      max_completion_tokens: 300,
      temperature: 0.8,
      top_p: 0.95
    };
    
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: userResponse }
        ],
        max_completion_tokens: 300,
        temperature: 0.8,
        top_p: 0.95
      })
    });

    console.log('Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== API ERROR ===');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Error Response Body:', errorText);
      console.error('=== END ERROR ===');
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    const content = data.choices[0]?.message?.content || generateFallbackResponse().content;
    
    console.log('Generated Content:', content);
    
    // Analyze sentiment from the response
    const sentiment = analyzeSentiment(content);
    
    console.log('Sentiment:', sentiment);
    console.log('=== End Azure AI Coach ===\n');
    
    return { content, sentiment };
  } catch (error) {
    console.error('Azure OpenAI API error:', error);
    console.log('Falling back to rule-based response');
    return generateFallbackResponse();
  }
};

const analyzeSentiment = (content: string): 'challenging' | 'supportive' | 'neutral' => {
  const lower = content.toLowerCase();
  
  // Challenging indicators
  const challengingWords = ['weak', 'stop', 'wrong', 'try again', 'not good enough', 'surface-level', 'mediocre'];
  const hasChallenging = challengingWords.some(word => lower.includes(word));
  
  // Supportive indicators
  const supportiveWords = ['good', 'excellent', 'solid', 'well done', 'exactly', 'perfect', 'great'];
  const hasSupportive = supportiveWords.some(word => lower.includes(word));
  
  if (hasChallenging && !hasSupportive) return 'challenging';
  if (hasSupportive && !hasChallenging) return 'supportive';
  return 'neutral';
};

const generateFallbackResponse = (): { content: string; sentiment: 'challenging' | 'supportive' | 'neutral' } => {
  const fallbackResponses = [
    "Let's dig deeper into that answer. What's the real value proposition for this customer?",
    "That's a start, but I need you to be more specific. Give me concrete examples.",
    "Think about the customer's perspective. How does what you just said solve THEIR problem?",
    "You're on the right track, but connect this to their business outcomes. Numbers matter."
  ];
  
  return {
    content: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
    sentiment: 'challenging'
  };
};
