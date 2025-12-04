import type { CustomerContext, Slide, Message } from '../types';

interface CoachResponse {
  content: string;
  sentiment: 'challenging' | 'supportive' | 'neutral';
}

// Helper to check if response is weak or problematic
const analyzeResponse = (response: string, slide: Slide): { isWeak: boolean; issues: string[] } => {
  const lower = response.toLowerCase();
  const issues: string[] = [];
  
  // Check for weak language
  if (lower.includes('maybe') || lower.includes('i think') || lower.includes('probably')) {
    issues.push('weak_language');
  }
  
  // Check for technical jargon with non-technical audience
  if (lower.includes('kubernetes') || lower.includes('microservices') || lower.includes('ci/cd')) {
    issues.push('technical_jargon');
  }
  
  // Check if too short/superficial
  if (response.split(' ').length < 10) {
    issues.push('too_brief');
  }
  
  // Check against red flags
  slide.redFlags.forEach(flag => {
    if (lower.includes(flag.toLowerCase().slice(0, 20))) {
      issues.push('red_flag');
    }
  });
  
  return { isWeak: issues.length > 0, issues };
};

const challengingResponses = [
  "That's surface-level. Your customer is going to see right through that. What's the REAL story here?",
  "Stop dancing around it. If you were sitting across from this customer right now, would that answer actually close the deal?",
  "I've heard better answers from first-year reps. You know this material - now PROVE it.",
  "Weak. You're letting them control the narrative. How do you flip this conversation?",
  "That sounds rehearsed and hollow. Give me authenticity, not a script.",
  "You're avoiding the hard part of this objection. Address it head-on.",
  "If I'm the customer, I just tuned out. You lost me. Try again with conviction.",
  "Too many qualifiers, not enough confidence. Own this answer.",
];

const supportiveResponses = [
  "Now we're talking. That's the energy this customer needs to see. Keep that momentum.",
  "Solid. You're connecting the technical details to business outcomes. That's what wins deals.",
  "Good. You acknowledged their concern without getting defensive. That builds trust.",
  "Exactly. You're not just selling a migration - you're selling transformation. They need to feel that.",
  "That's the kind of answer that makes a CTO lean forward in their chair. Well done.",
  "Perfect. You've turned their objection into an opportunity. That's advanced selling.",
  "Yes. You're speaking their language now. This is how you build credibility.",
];

const contextualChallenges = {
  technical: [
    "Your audience knows their stuff. That answer isn't technical enough. Give me architecture, not buzzwords.",
    "A technical audience will grill you on implementation. How does this ACTUALLY work?",
    "They're going to ask about edge cases and failure scenarios. Are you ready for that?",
  ],
  business: [
    "Business stakeholders care about one thing: ROI. Where's the money story in your answer?",
    "You're getting too technical. Translate that into business value or lose them.",
    "CFOs don't care about your tech stack. They care about risk and return. Connect those dots.",
  ],
  mixed: [
    "You need to satisfy both technical and business people in the room. That answer only hits one side.",
    "Split audience means you need to bridge technical execution with business value. Try again.",
  ]
};

const urgencyDrivenResponses = {
  immediate: [
    "This customer has a deadline breathing down their neck. Your answer needs urgency and confidence.",
    "They're looking for someone who can move fast without cutting corners. Does your response show that?",
  ],
  planned: [
    "This is strategic for them. Show me you understand the long game, not just the quick win.",
    "They're planning ahead - that means they'll scrutinize every detail. Is your answer bulletproof?",
  ],
  exploratory: [
    "They're gathering information, which means you need to educate AND inspire. Are you doing both?",
    "Exploratory doesn't mean low-stakes. This is your chance to shape their entire approach.",
  ]
};

export const generateCoachResponse = (
  userResponse: string,
  currentSlide: Slide,
  customerContext: CustomerContext,
  messageHistory: Message[]
): CoachResponse => {
  const analysis = analyzeResponse(userResponse, currentSlide);
  
  // Count recent interactions to vary intensity
  const recentMessages = messageHistory.slice(-6);
  const challengingCount = recentMessages.filter(m => m.sentiment === 'challenging').length;
  
  // If response has major issues, be challenging
  if (analysis.issues.includes('red_flag')) {
    return {
      content: `STOP. You just said something that's on the red flag list for this slide. "${currentSlide.redFlags[0]}". That's exactly what NOT to do. Let's try this again, and this time, think about what you're actually trying to achieve here.`,
      sentiment: 'challenging'
    };
  }
  
  if (analysis.issues.includes('weak_language')) {
    return {
      content: `"Maybe"? "I think"? "Probably"? This is a sales conversation, not a college essay. Confidence sells. Uncertainty kills deals. Remove the hedging and give me a statement your customer can believe in.`,
      sentiment: 'challenging'
    };
  }
  
  if (analysis.issues.includes('too_brief')) {
    return {
      content: `That's it? You're giving me a one-liner when your customer needs substance. They're investing ${customerContext.budgetSensitivity === 'high' ? 'serious money' : 'hundreds of thousands'} and you think that level of detail is sufficient? Elaborate.`,
      sentiment: 'challenging'
    };
  }
  
  // Check for good responses
  const hasNumbers = /\d+/.test(userResponse);
  const hasExample = userResponse.toLowerCase().includes('for example') || userResponse.toLowerCase().includes('such as');
  const addressesObjection = currentSlide.potentialObjections.some(obj => 
    userResponse.toLowerCase().includes(obj.toLowerCase().slice(0, 15))
  );
  
  const isStrong = userResponse.length > 100 && !analysis.isWeak && (hasNumbers || hasExample);
  
  if (isStrong || addressesObjection) {
    const supportive = supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
    
    // Add a follow-up challenge even after praise
    const followUp = [
      " But don't get comfortable - what happens when they push back on this?",
      " Now, what's the customer's next objection going to be?",
      " Good start. But how do you handle it if they're not buying it?",
      " Solid. But I want to see you go deeper. What's the implication of what you just said?",
    ];
    
    return {
      content: supportive + followUp[Math.floor(Math.random() * followUp.length)],
      sentiment: 'supportive'
    };
  }
  
  // Context-specific challenges
  if (Math.random() > 0.4) {
    const audienceChallenges = contextualChallenges[customerContext.audienceType];
    const urgencyChallenges = urgencyDrivenResponses[customerContext.urgency];
    
    const contextualPool = [...audienceChallenges, ...urgencyChallenges];
    const challenge = contextualPool[Math.floor(Math.random() * contextualPool.length)];
    
    return {
      content: challenge,
      sentiment: 'challenging'
    };
  }
  
  // Budget sensitivity specific
  if (customerContext.budgetSensitivity === 'high' && currentSlide.title.toLowerCase().includes('investment')) {
    return {
      content: `This customer is watching every dollar. Your answer needs to scream ROI, not just list features. How quickly do they see returns? What happens if they DON'T invest? Make me feel the cost of inaction.`,
      sentiment: 'challenging'
    };
  }
  
  // Modernization appetite specific
  if (customerContext.modernizationAppetite === 'conservative' && userResponse.toLowerCase().includes('cloud-native')) {
    return {
      content: `Hold up. This customer wants CONSERVATIVE modernization and you're pushing cloud-native everything? Read the room. How do you deliver value without scaring them off?`,
      sentiment: 'challenging'
    };
  }
  
  // Default challenging response
  if (challengingCount < 4 || Math.random() > 0.6) {
    const challenge = challengingResponses[Math.floor(Math.random() * challengingResponses.length)];
    return {
      content: challenge,
      sentiment: 'challenging'
    };
  }
  
  // Balanced feedback
  return {
    content: `Okay, that's workable. Not great, but workable. You're on the right track, but you need to connect this more directly to their ${customerContext.painPoints[0] || 'pain points'}. How does what you just said solve THEIR problem specifically?`,
    sentiment: 'neutral'
  };
};
