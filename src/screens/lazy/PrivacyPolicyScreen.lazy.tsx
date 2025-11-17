import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the PrivacyPolicyScreen component
const LazyPrivacyPolicyScreen = lazy(() => import('../main/PrivacyPolicyScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const PrivacyPolicyScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading privacy policy..." />}>
    <LazyPrivacyPolicyScreen {...props} />
  </Suspense>
);

export default PrivacyPolicyScreenWithSuspense;
