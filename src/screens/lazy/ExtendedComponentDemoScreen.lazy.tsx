import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ExtendedComponentDemoScreen component
const LazyExtendedComponentDemoScreen = lazy(() => import('../main/ExtendedComponentDemoScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ExtendedComponentDemoScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading extended demo..." />}>
    <LazyExtendedComponentDemoScreen {...props} />
  </Suspense>
);

export default ExtendedComponentDemoScreenWithSuspense;
