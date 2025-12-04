import { useState } from 'react';
import { CustomerDiscovery } from './components/CustomerDiscovery';
import { CoachingInterface } from './components/CoachingInterface';
import type { CustomerContext } from './types';

function App() {
  const [customerContext, setCustomerContext] = useState<CustomerContext | null>(null);

  if (!customerContext) {
    return <CustomerDiscovery onComplete={setCustomerContext} />;
  }

  return <CoachingInterface customerContext={customerContext} />;
}

export default App;
