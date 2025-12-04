import React, { useState } from 'react';
import type { CustomerContext } from '../types';

interface Props {
  onComplete: (context: CustomerContext) => void;
}

export const CustomerDiscovery: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState<Partial<CustomerContext>>({
    painPoints: []
  });

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete(context as CustomerContext);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addPainPoint = (point: string) => {
    setContext({
      ...context,
      painPoints: [...(context.painPoints || []), point]
    });
  };

  const removePainPoint = (index: number) => {
    const newPainPoints = [...(context.painPoints || [])];
    newPainPoints.splice(index, 1);
    setContext({ ...context, painPoints: newPainPoints });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Customer Discovery</h1>
            <span className="text-sm font-medium text-gray-500">Step {step} of 5</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  What's driving this migration conversation?
                </h2>
                <div className="space-y-3">
                  {(['immediate', 'planned', 'exploratory'] as const).map((urgency) => (
                    <button
                      key={urgency}
                      onClick={() => setContext({ ...context, urgency })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        context.urgency === urgency
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold capitalize">{urgency}</div>
                      <div className="text-sm text-gray-600">
                        {urgency === 'immediate' && 'Critical deadline or blocker'}
                        {urgency === 'planned' && 'Strategic initiative with timeline'}
                        {urgency === 'exploratory' && 'Gathering information'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {context.urgency && context.urgency !== 'exploratory' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeline or deadline (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Q2 2026, 6 months, December"
                    value={context.timeline || ''}
                    onChange={(e) => setContext({ ...context, timeline: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  What's their appetite for modernization?
                </h2>
                <div className="space-y-3">
                  {(['conservative', 'balanced', 'aggressive'] as const).map((appetite) => (
                    <button
                      key={appetite}
                      onClick={() => setContext({ ...context, modernizationAppetite: appetite })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        context.modernizationAppetite === appetite
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold capitalize">{appetite}</div>
                      <div className="text-sm text-gray-600">
                        {appetite === 'conservative' && 'Lift-and-shift, minimal changes'}
                        {appetite === 'balanced' && 'Selective refactoring where it adds value'}
                        {appetite === 'aggressive' && 'Full re-architecture, cloud-native'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Who's your primary audience?
                </h2>
                <div className="space-y-3">
                  {(['technical', 'business', 'mixed'] as const).map((audience) => (
                    <button
                      key={audience}
                      onClick={() => setContext({ ...context, audienceType: audience })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        context.audienceType === audience
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold capitalize">{audience}</div>
                      <div className="text-sm text-gray-600">
                        {audience === 'technical' && 'CTO, Architects, DevOps teams'}
                        {audience === 'business' && 'CFO, Business stakeholders'}
                        {audience === 'mixed' && 'Cross-functional decision makers'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  What are their main pain points?
                </h2>
                <p className="text-sm text-gray-600 mb-4">Select all that apply or add custom ones</p>
                <div className="space-y-2 mb-4">
                  {[
                    'Legacy technology reaching end of life',
                    'Scalability limitations',
                    'High infrastructure costs',
                    'Slow deployment cycles',
                    'Security concerns',
                    'Difficulty hiring talent'
                  ].map((point) => (
                    <button
                      key={point}
                      onClick={() => {
                        if (context.painPoints?.includes(point)) {
                          removePainPoint(context.painPoints.indexOf(point));
                        } else {
                          addPainPoint(point);
                        }
                      }}
                      className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${
                        context.painPoints?.includes(point)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {point}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom pain point..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        addPainPoint(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                {context.painPoints && context.painPoints.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {context.painPoints.map((point, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {point}
                          <button
                            onClick={() => removePainPoint(index)}
                            className="hover:text-blue-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  How budget-sensitive is this customer?
                </h2>
                <div className="space-y-3">
                  {(['high', 'medium', 'low'] as const).map((sensitivity) => (
                    <button
                      key={sensitivity}
                      onClick={() => setContext({ ...context, budgetSensitivity: sensitivity })}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        context.budgetSensitivity === sensitivity
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold capitalize">{sensitivity} Sensitivity</div>
                      <div className="text-sm text-gray-600">
                        {sensitivity === 'high' && 'Every dollar scrutinized, need strong ROI case'}
                        {sensitivity === 'medium' && 'Balanced view of cost vs. value'}
                        {sensitivity === 'low' && 'Focus on outcomes, budget is available'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={
              (step === 1 && !context.urgency) ||
              (step === 2 && !context.modernizationAppetite) ||
              (step === 3 && !context.audienceType) ||
              (step === 4 && (!context.painPoints || context.painPoints.length === 0)) ||
              (step === 5 && !context.budgetSensitivity)
            }
            className="px-6 py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {step === 5 ? 'Start Coaching' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};
