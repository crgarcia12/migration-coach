import { useState, useEffect } from 'react';
import { CustomerDiscovery } from './components/CustomerDiscovery';
import { CoachingInterface } from './components/CoachingInterface';
import type { CustomerContext } from './types';

const STORAGE_KEY = 'migration-coach-customer-context';

function App() {
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [savedContext, setSavedContext] = useState<CustomerContext | null>(null);
  const [customerContext, setCustomerContext] = useState<CustomerContext | null>(null);

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
    return <CustomerDiscovery onComplete={setCustomerContext} />;
  }

  return <CoachingInterface customerContext={customerContext} onReset={handleReset} />;
}

export default App;
