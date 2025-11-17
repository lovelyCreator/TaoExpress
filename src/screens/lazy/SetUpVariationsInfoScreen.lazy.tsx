import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the SetUpVariationsInfoScreen component
const LazySetUpVariationsInfoScreen = lazy(() => import('../main/SetUpVariationsInfoScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const SetUpVariationsInfoScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading variation setup..." />}>
    <LazySetUpVariationsInfoScreen {...props} />
  </Suspense>
);

export default SetUpVariationsInfoScreenWithSuspense;
