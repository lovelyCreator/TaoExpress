import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the FollowingScreen component
const LazyFollowingScreen = lazy(() => import('../main/FollowingScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const FollowingScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading following..." />}>
    <LazyFollowingScreen {...props} />
  </Suspense>
);

export default FollowingScreenWithSuspense;
