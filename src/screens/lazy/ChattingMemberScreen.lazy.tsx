import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ChattingMemberScreen component
const LazyChattingMemberScreen = lazy(() => import('../main/ChattingMemberScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ChattingMemberScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading chatting member..." />}>
    <LazyChattingMemberScreen {...props} />
  </Suspense>
);

export default ChattingMemberScreenWithSuspense;