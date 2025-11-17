import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the VariationsScreen component
const LazyVariationsScreen = lazy(() => import('../main/VariationScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const VariationsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading variations..." />}>
    <LazyVariationsScreen {...props} />
  </Suspense>
);

export default VariationsScreenWithSuspense;
