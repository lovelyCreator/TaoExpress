import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the SellingHistoryScreen component
const LazySellingHistoryScreen = lazy(() => import('../main/SellingHistoryScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const SellingHistoryScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading selling history..." />}>
    <LazySellingHistoryScreen {...props} />
  </Suspense>
);

export default SellingHistoryScreenWithSuspense;
