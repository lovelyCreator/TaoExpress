import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the NotificationsScreen component
const LazyNotificationsScreen = lazy(() => import('../main/NotificationsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const NotificationsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading notifications..." />}>
    <LazyNotificationsScreen {...props} />
  </Suspense>
);

export default NotificationsScreenWithSuspense;
