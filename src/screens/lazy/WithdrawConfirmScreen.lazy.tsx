import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the WithdrawConfirmScreen component
const LazyWithdrawConfirmScreen = lazy(() => import('../main/WithdrawConfirmScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const WithdrawConfirmScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading withdraw confirmation..." />}>
    <LazyWithdrawConfirmScreen {...props} />
  </Suspense>
);

export default WithdrawConfirmScreenWithSuspense;
