import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the HomeScreen component
const LazyHomeScreen = lazy(() => import('./HomeScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const HomeScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading home..." />}>
    <LazyHomeScreen {...props} />
  </Suspense>
);

export default HomeScreenWithSuspense;