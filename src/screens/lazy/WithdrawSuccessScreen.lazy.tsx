import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the WithdrawSuccessScreen component
const LazyWithdrawSuccessScreen = lazy(() => import('../main/WIthDrawSuccessScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const WithdrawSuccessScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading withdraw success..." />}>
    <LazyWithdrawSuccessScreen {...props} />
  </Suspense>
);

export default WithdrawSuccessScreenWithSuspense;
