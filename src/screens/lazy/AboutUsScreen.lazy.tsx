import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the AboutUsScreen component
const LazyAboutUsScreen = lazy(() => import('../main/AboutUsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const AboutUsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading about us..." />}>
    <LazyAboutUsScreen {...props} />
  </Suspense>
);

export default AboutUsScreenWithSuspense;
