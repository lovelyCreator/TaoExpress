import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ShippingSettingsScreen component
const LazyShippingSettingsScreen = lazy(() => import('../main/ShippingSettingsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ShippingSettingsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading shipping settings..." />}>
    <LazyShippingSettingsScreen {...props} />
  </Suspense>
);

export default ShippingSettingsScreenWithSuspense;
