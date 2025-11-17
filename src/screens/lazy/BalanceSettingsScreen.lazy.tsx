import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the BalanceSettingsScreen component
const LazyBalanceSettingsScreen = lazy(() => import('../main/BalanceSettingsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const BalanceSettingsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading balance settings..." />}>
    <LazyBalanceSettingsScreen {...props} />
  </Suspense>
);

export default BalanceSettingsScreenWithSuspense;
