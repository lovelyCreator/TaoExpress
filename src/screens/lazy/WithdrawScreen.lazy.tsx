import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the WithdrawScreen component
const LazyWithdrawScreen = lazy(() => import('../main/WithdrawScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const WithdrawScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading withdraw..." />}>
    <LazyWithdrawScreen {...props} />
  </Suspense>
);

export default WithdrawScreenWithSuspense;
