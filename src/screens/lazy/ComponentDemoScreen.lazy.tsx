import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ComponentDemoScreen component
const LazyComponentDemoScreen = lazy(() => import('../main/ComponentDemoScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ComponentDemoScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading component demo..." />}>
    <LazyComponentDemoScreen {...props} />
  </Suspense>
);

export default ComponentDemoScreenWithSuspense;
