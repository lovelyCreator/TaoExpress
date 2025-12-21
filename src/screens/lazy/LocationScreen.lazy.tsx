import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the LocationScreen component
const LazyLocationScreen = lazy(() => import('../main/profileScreen/LocationScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const LocationScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading location..." />}>
    <LazyLocationScreen {...props} />
  </Suspense>
);

export default LocationScreenWithSuspense;
