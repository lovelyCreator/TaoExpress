import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the BankAccountScreen component
const LazyBankAccountScreen = lazy(() => import('../main/BankAccountScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const BankAccountScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading bank account..." />}>
    <LazyBankAccountScreen {...props} />
  </Suspense>
);

export default BankAccountScreenWithSuspense;
