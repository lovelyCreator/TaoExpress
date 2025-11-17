import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the NotificationsSettingsScreen component
const LazyNotificationsSettingsScreen = lazy(() => import('../main/NotificationsSettingsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const NotificationsSettingsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading notification settings..." />}>
    <LazyNotificationsSettingsScreen {...props} />
  </Suspense>
);

export default NotificationsSettingsScreenWithSuspense;
