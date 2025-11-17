import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the SellerNotificationSettingsScreen component
const LazySellerNotificationSettingsScreen = lazy(() => import('../main/SellerNotificationSettingsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const SellerNotificationSettingsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading seller notification settings..." />}>
    <LazySellerNotificationSettingsScreen {...props} />
  </Suspense>
);

export default SellerNotificationSettingsScreenWithSuspense;
