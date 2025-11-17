import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the SettingsScreen component
const LazySettingsScreen = lazy(() => import('../SettingsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const SettingsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
    <LazySettingsScreen {...props} />
  </Suspense>
);

export default SettingsScreenWithSuspense;
