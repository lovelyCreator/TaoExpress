import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the Sub2CategoryScreen component
const LazySub2CategoryScreen = lazy(() => import('../main/Sub2CategoryScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const Sub2CategoryScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading subcategory..." />}>
    <LazySub2CategoryScreen {...props} />
  </Suspense>
);

export default Sub2CategoryScreenWithSuspense;
