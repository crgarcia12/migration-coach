import { useState, useEffect } from 'react';
import { CustomerDiscovery } from './components/CustomerDiscovery';
import { CoachingInterface } from './components/CoachingInterface';
import { ConfigPage } from './components/ConfigPage';
import type { CustomerContext } from './types';

const STORAGE_KEY = 'migration-coach-customer-context';

function App() {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedContext, setSavedContext] = useState<CustomerContext | null>(null);
  const [customerContext, setCustomerContext] = useState<CustomerContext | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  // Check for saved context on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedContext(parsed);
        setShowRestoreDialog(true);
      } catch (e) {
        console.error('Failed to parse saved customer context', e);
      }
    }
  }, []);

  // Save to localStorage whenever customerContext changes
  useEffect(() => {
    if (customerContext) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customerContext));
    }
  }, [customerContext]);

  const handleRestorePrevious = () => {
    setCustomerContext(savedContext);
    setShowRestoreDialog(false);
  };

  const handleStartFresh = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSavedContext(null);
    setShowRestoreDialog(false);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomerContext(null);
  };

  // Show config page
  if (showConfig) {
    return <ConfigPage onClose={() => setShowConfig(false)} />;
  }

  // Show restore dialog
  if (showRestoreDialog && savedContext) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
            <p className="text-gray-600">We found a previous session</p>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 mb-2"><strong>Previous Customer:</strong></p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {savedContext.audienceType} audience</li>
              <li>• {savedContext.urgency} urgency</li>
              <li>• {savedContext.modernizationAppetite} modernization</li>
              <li>• Pain points: {savedContext.painPoints.slice(0, 2).join(', ')}</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRestorePrevious}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Previous Session
            </button>
            <button
              onClick={handleStartFresh}
              className="w-full py-3 px-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!customerContext) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowConfig(true)}
          className="fixed top-4 right-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
          title="Settings"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <CustomerDiscovery onComplete={setCustomerContext} />
      </div>
    );
  }

  return (
    <CoachingInterface 
      customerContext={customerContext} 
      onReset={handleReset}
      onOpenConfig={() => setShowConfig(true)}
    />
  );
}

export default App;
