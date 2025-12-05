import type { Slide } from '../types';

// Generate slides from actual presentation images (Slide08 through Slide43)
const generateSlides = (): Slide[] => {
  const slides: Slide[] = [];
  
  // Generic coaching data that applies to most slides
  const defaultKeyPoints = [
    'Focus on customer value and business outcomes',
    'Connect technical details to their specific pain points',
    'Use concrete examples and real-world scenarios',
    'Address concerns proactively before they become objections'
  ];
  
  const defaultObjections = [
    'How does this specifically apply to our situation?',
    'What are the risks involved?',
    'Can you provide concrete examples or case studies?',
    'How long will this take and what resources are needed?'
  ];
  
  const defaultTalkingPoints = [
    'Based on the assessment, we\'ve identified specific areas where this applies to your environment',
    'We\'ve built in risk mitigation strategies at every phase',
    'I can share similar successful projects with comparable complexity',
    'The timeline is based on similar engagements, with built-in flexibility'
  ];
  
  const defaultRedFlags = [
    'Don\'t make promises you can\'t keep',
    'Avoid dismissing their concerns',
    'Don\'t oversimplify complex technical challenges',
    'Never criticize their current setup without offering solutions'
  ];
  
  // Generate slides 8-43 (36 slides total) with leading zeros for single digits
  for (let i = 1; i <= 4; i++) {
    const slideNumber = i.toString().padStart(2, '0');
    slides.push({
      id: i,
      title: `Slide ${i}`,
      imageUrl: `/slides/Slide${slideNumber}.JPG`,
      keyPoints: defaultKeyPoints,
      potentialObjections: defaultObjections,
      talkingPoints: defaultTalkingPoints,
      redFlags: defaultRedFlags
    });
  }
  
  return slides;
};

export const SAMPLE_SLIDES: Slide[] = generateSlides();
