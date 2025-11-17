import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the SellerCategoryScreen component
const LazySellerCategoryScreen = lazy(() => import('../main/SellerCategoryScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const SellerCategoryScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading seller category..." />}>
    <LazySellerCategoryScreen {...props} />
  </Suspense>
);

export default SellerCategoryScreenWithSuspense;
