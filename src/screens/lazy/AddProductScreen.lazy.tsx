import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the AddProductScreen component
const LazyAddProductScreen = lazy(() => import('../main/AddProductScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const AddProductScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading product form..." />}>
    <LazyAddProductScreen {...props} />
  </Suspense>
);

export default AddProductScreenWithSuspense;
