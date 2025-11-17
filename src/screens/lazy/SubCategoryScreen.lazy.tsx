import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the SubCategoryScreen component
const LazySubCategoryScreen = lazy(() => import('../main/SubCategoryScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const SubCategoryScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading subcategory..." />}>
    <LazySubCategoryScreen {...props} />
  </Suspense>
);

export default SubCategoryScreenWithSuspense;
