import React, { useState, useRef, useEffect } from 'react';
import type { CustomerContext, Message, Slide } from '../types';
import { SAMPLE_SLIDES } from '../data/slides';
import { generateAICoachResponse } from '../utils/azureAICoach';
import { extractTextFromAllSlides, type SlideContent } from '../utils/slideOCR';
import { generatePresentationFlow, reorderSlides, generateTalkingPoints, type SlideTalkingPoints } from '../utils/presentationFlow';

interface Props {
  customerContext: CustomerContext;
  onReset?: () => void;
}

export const CoachingInterface: React.FC<Props> = ({ customerContext, onReset }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'keypoints' | 'objections' | 'redflags' | 'flow'>('chat');
  const [slideWidth, setSlideWidth] = useState(50); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const [slideContents, setSlideContents] = useState<SlideContent[]>([]);
  const [isLoadingOCR, setIsLoadingOCR] = useState(true);
  const [orderedSlides, setOrderedSlides] = useState<Slide[]>(SAMPLE_SLIDES);
  const [flowReasoning, setFlowReasoning] = useState<string>('');
  const [talkingPoints, setTalkingPoints] = useState<SlideTalkingPoints[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentSlide = orderedSlides[currentSlideIndex];

  // Extract OCR content from all slides on mount, then generate presentation flow
  useEffect(() => {
    const loadSlideContent = async () => {
      setIsLoadingOCR(true);
      try {
        console.log('\n🚀 === MIGRATION COACH INITIALIZATION === 🚀\n');
        
        // Step 1: Extract OCR from all slides
        console.log('📄 STEP 1: Extracting text from slides...');
        const contents = await extractTextFromAllSlides(SAMPLE_SLIDES);
        setSlideContents(contents);
        console.log(`✓ Extracted text from ${contents.length} slides\n`);

        // Step 2: Generate optimized presentation flow
        console.log('🎯 STEP 2: Generating presentation flow...');
        const flow = await generatePresentationFlow(customerContext, SAMPLE_SLIDES, contents);
        setFlowReasoning(flow.reasoning);
        console.log('✓ Presentation flow generated\n');
        
        // Step 3: Reorder slides based on flow
        console.log('🔄 STEP 3: Reordering slides...');
        const reordered = reorderSlides(SAMPLE_SLIDES, flow);
        setOrderedSlides(reordered);
        console.log('✓ Slides reordered\n');
        
        // Step 4: Generate talking points for each slide
        console.log('🎤 STEP 4: Generating talking points...');
        const points = await generateTalkingPoints(customerContext, reordered, contents);
        setTalkingPoints(points);
        console.log('✓ Talking points generated\n');
        
        console.log('✅ === INITIALIZATION COMPLETE === ✅\n');
        console.log('The presentation has been customized for:');
        console.log(`  → ${customerContext.audienceType} audience`);
        console.log(`  → ${customerContext.urgency} urgency`);
        console.log(`  → ${customerContext.modernizationAppetite} modernization appetite`);
        console.log(`  → Pain points: ${customerContext.painPoints.join(', ')}`);
        console.log('\nReady to coach! 🎓\n');
        
      } catch (error) {
        console.error('❌ Failed to initialize:', error);
      } finally {
        setIsLoadingOCR(false);
      }
    };
    
    loadSlideContent();
  }, []);

  useEffect(() => {
    // Welcome message when OCR loading completes
    if (!isLoadingOCR && slideContents.length > 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'coach',
        content: `Alright, let's get you ready for this presentation. I see you're dealing with a ${customerContext.audienceType} audience who's ${customerContext.urgency} about this migration.\n\nI've analyzed all ${orderedSlides.length} slides and customized the presentation flow specifically for your customer:\n\n"${flowReasoning}"\n\nWe're starting with the ${currentSlide.title} slide. Tell me, what's your opening line going to be?`,
        timestamp: new Date(),
        sentiment: 'challenging'
      };
      setMessages([welcomeMessage]);
    }
  }, [isLoadingOCR, slideContents, flowReasoning]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle mouse dragging for resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setSlideWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'seller',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate coach thinking and responding
    setTimeout(async () => {
      try {
        const { content, sentiment } = await generateAICoachResponse(
          inputValue, 
          currentSlide, 
          customerContext, 
          messages,
          slideContents,
          currentSlideIndex
        );
        
        const coachMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'coach',
          content: content,
          timestamp: new Date(),
          sentiment: sentiment
        };

        setMessages(prev => [...prev, coachMessage]);
      } catch (error) {
        console.error('Error getting coach response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'coach',
          content: "Let's refocus. Tell me more about how you'd address this slide.",
          timestamp: new Date(),
          sentiment: 'neutral'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < orderedSlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      const nextSlide = orderedSlides[currentSlideIndex + 1];
      
      const transitionMessage: Message = {
        id: Date.now().toString(),
        role: 'coach',
        content: `Good. Moving on to ${nextSlide.title}. This is where it gets interesting. Your customer's sitting across from you, and you flip to this slide. What's going through their mind right now? More importantly, what's coming out of YOUR mouth?`,
        timestamp: new Date(),
        sentiment: 'challenging'
      };
      
      setMessages([...messages, transitionMessage]);
      setActiveTab('chat');
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      
      const backMessage: Message = {
        id: Date.now().toString(),
        role: 'coach',
        content: `We're going back to review ${orderedSlides[currentSlideIndex - 1].title}. Let's make sure you've got this one locked down.`,
        timestamp: new Date(),
        sentiment: 'neutral'
      };
      
      setMessages([...messages, backMessage]);
    }
  };

  const jumpToSlide = (index: number) => {
    setCurrentSlideIndex(index);
    const targetSlide = orderedSlides[index];
    
    const jumpMessage: Message = {
      id: Date.now().toString(),
      role: 'coach',
      content: `Jumping to ${targetSlide.title}. Show me you're ready for this one.`,
      timestamp: new Date(),
      sentiment: 'neutral'
    };
    
    setMessages([...messages, jumpMessage]);
    setActiveTab('chat');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Loading OCR Overlay */}
      {isLoadingOCR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Analyzing Presentation Slides</h2>
            <p className="text-gray-600">Extracting content from slides using Azure AI Vision OCR...</p>
            <p className="text-sm text-gray-500 mt-2">This will be cached for future sessions</p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src="/icon/logo.png" 
            alt="Azure Migrate"
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Migration Coach</h1>
            <p className="text-sm text-gray-600">
              Customer: {customerContext.audienceType} · {customerContext.urgency} · {customerContext.modernizationAppetite} modernization
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Slide {currentSlideIndex + 1} of {orderedSlides.length}
          </div>
          {onReset && (
            <button
              onClick={onReset}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Slide Viewer */}
        <div className="bg-gray-900 flex flex-col" style={{ width: `${slideWidth}%` }}>
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative w-full max-w-3xl">
              <img 
                src={currentSlide.imageUrl} 
                alt={currentSlide.title}
                className="w-full rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
                <h2 className="text-lg font-semibold">{currentSlide.title}</h2>
              </div>
            </div>
          </div>

          {/* Slide Navigation */}
          <div className="bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handlePreviousSlide}
                disabled={currentSlideIndex === 0}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-white text-sm">
                {currentSlideIndex + 1} / {orderedSlides.length}
              </span>
              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === orderedSlides.length - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {orderedSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => jumpToSlide(index)}
                  className={`flex-shrink-0 w-24 h-16 rounded overflow-hidden border-2 transition-all ${
                    index === currentSlideIndex
                      ? 'border-blue-500 ring-2 ring-blue-300'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-12 bg-gray-400 group-hover:bg-blue-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>

        {/* Right Panel - Coaching */}
        <div className="flex flex-col bg-white" style={{ width: `${100 - slideWidth}%` }}>
          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex">
              {[
                { id: 'chat' as const, label: 'Coach Chat', icon: '💬' },
                { id: 'flow' as const, label: 'Presentation Flow', icon: '📊' },
                { id: 'keypoints' as const, label: 'Key Points', icon: '🎯' },
                { id: 'objections' as const, label: 'Objections', icon: '⚠️' },
                { id: 'redflags' as const, label: 'Red Flags', icon: '🚫' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'flow' && (
              <div className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Customized Presentation Flow</h3>
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm text-gray-700"><strong>Strategy:</strong> {flowReasoning}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {orderedSlides.map((slide, index) => {
                    const points = talkingPoints.find(tp => tp.slideId === slide.id);
                    const isCurrent = index === currentSlideIndex;
                    
                    return (
                      <div 
                        key={slide.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCurrent 
                            ? 'border-blue-500 bg-blue-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className={`font-semibold ${isCurrent ? 'text-blue-900' : 'text-gray-800'}`}>
                                {slide.title}
                              </h4>
                              {isCurrent && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            
                            {points ? (
                              <div className="space-y-2 mt-3">
                                <div className="pl-3 border-l-2 border-green-500">
                                  <p className="text-sm font-bold text-gray-900">{points.keyMessage1}</p>
                                </div>
                                <div className="pl-3 border-l-2 border-blue-400">
                                  <p className="text-sm font-bold text-gray-900">{points.keyMessage2}</p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic mt-2">Generating talking points...</p>
                            )}
                            
                            {!isCurrent && (
                              <button
                                onClick={() => jumpToSlide(index)}
                                className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Jump to this slide →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'seller' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === 'seller'
                          ? 'bg-blue-600 text-white'
                          : message.sentiment === 'challenging'
                          ? 'bg-orange-50 border border-orange-200 text-gray-800'
                          : message.sentiment === 'supportive'
                          ? 'bg-green-50 border border-green-200 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'coach' && (
                          <span className="text-lg">
                            {message.sentiment === 'challenging' ? '🔥' : 
                             message.sentiment === 'supportive' ? '✅' : '🎓'}
                          </span>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {activeTab === 'keypoints' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Points to Emphasize</h3>
                {currentSlide.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                    <p className="text-gray-800">{point}</p>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-sm text-gray-700">
                    <strong>Context:</strong> Your customer is {customerContext.budgetSensitivity === 'high' ? 'very budget-conscious' : customerContext.budgetSensitivity === 'medium' ? 'moderately budget-conscious' : 'less focused on cost'} and prefers {customerContext.modernizationAppetite} approaches to modernization.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'objections' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Potential Customer Objections</h3>
                {currentSlide.potentialObjections.map((objection, index) => (
                  <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
                    <p className="text-gray-800 font-medium mb-2">❓ "{objection}"</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Suggested response:</strong> {currentSlide.talkingPoints[index]}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'redflags' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Red Flags - What NOT to Say</h3>
                {currentSlide.redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <span className="text-red-600 text-xl">🚫</span>
                    <p className="text-gray-800">{flag}</p>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Remember:</strong> You're speaking to a {customerContext.audienceType} audience. Adjust your language and depth accordingly.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input (only visible in chat tab) */}
          {activeTab === 'chat' && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your response..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
