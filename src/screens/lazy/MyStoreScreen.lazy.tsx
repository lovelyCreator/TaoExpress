import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the MyStoreScreen component
const LazyMyStoreScreen = lazy(() => import('../main/MyStoreScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const MyStoreScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading my store..." />}>
    <LazyMyStoreScreen {...props} />
  </Suspense>
);

export default MyStoreScreenWithSuspense;
