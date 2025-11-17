import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the FollowersScreen component
const LazyFollowersScreen = lazy(() => import('../main/FollowersScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const FollowersScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading followers..." />}>
    <LazyFollowersScreen {...props} />
  </Suspense>
);

export default FollowersScreenWithSuspense;
