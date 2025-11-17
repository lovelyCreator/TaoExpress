import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ExploreScreen component
const LazyExploreScreen = lazy(() => import('../main/ExploreScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ExploreScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading explore..." />}>
    <LazyExploreScreen {...props} />
  </Suspense>
);

export default ExploreScreenWithSuspense;