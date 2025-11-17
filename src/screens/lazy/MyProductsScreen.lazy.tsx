import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the MyProductsScreen component
const LazyMyProductsScreen = lazy(() => import('../main/MyProductsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const MyProductsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading my products..." />}>
    <LazyMyProductsScreen {...props} />
  </Suspense>
);

export default MyProductsScreenWithSuspense;
