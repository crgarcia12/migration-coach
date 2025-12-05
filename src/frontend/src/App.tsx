import { useState, useEffect } from 'react';
import { CustomerDiscovery } from './components/CustomerDiscovery';
import { CoachingInterface } from './components/CoachingInterface';
import type { CustomerContext } from './types';

const STORAGE_KEY = 'migration-coach-customer-context';

function App() {
  const [customerContext, setCustomerContext] = useState<CustomerContext | null>(() => {
    // Load from localStorage on initial render
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved customer context', e);
        return null;
      }
    }
    return null;
  });

  // Save to localStorage whenever customerContext changes
  useEffect(() => {
    if (customerContext) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customerContext));
    }
  }, [customerContext]);

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCustomerContext(null);
  };

  if (!customerContext) {
    return <CustomerDiscovery onComplete={setCustomerContext} />;
  }

  return <CoachingInterface customerContext={customerContext} onReset={handleReset} />;
}

export default App;
