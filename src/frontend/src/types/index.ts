export interface CustomerContext {
  urgency: 'immediate' | 'planned' | 'exploratory';
  timeline?: string;
  modernizationAppetite: 'conservative' | 'balanced' | 'aggressive';
  audienceType: 'technical' | 'business' | 'mixed';
  painPoints: string[];
  budgetSensitivity: 'high' | 'medium' | 'low';
}

export interface Slide {
  id: number;
  title: string;
  imageUrl: string;
  keyPoints: string[];
  potentialObjections: string[];
  talkingPoints: string[];
  redFlags: string[];
}

export interface Message {
  id: string;
  role: 'coach' | 'seller';
  content: string;
  timestamp: Date;
  sentiment?: 'challenging' | 'supportive' | 'neutral';
}

export interface CoachingSession {
  customerContext: CustomerContext;
  currentSlideIndex: number;
  messages: Message[];
  slideProgress: Record<number, boolean>;
}
