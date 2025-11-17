import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the MyStoreSettingsScreen component
const LazyMyStoreSettingsScreen = lazy(() => import('../main/MyStoreSettingsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const MyStoreSettingsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading store settings..." />}>
    <LazyMyStoreSettingsScreen {...props} />
  </Suspense>
);

export default MyStoreSettingsScreenWithSuspense;
