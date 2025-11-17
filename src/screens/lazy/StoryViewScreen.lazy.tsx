import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the StoryViewScreen component
const LazyStoryViewScreen = lazy(() => import('../main/StoryViewScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const StoryViewScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading story..." />}>
    <LazyStoryViewScreen {...props} />
  </Suspense>
);

export default StoryViewScreenWithSuspense;
