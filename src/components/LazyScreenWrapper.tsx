import React, { lazy, Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LazyScreenWrapperProps {
  component: React.ComponentType<any>;
  loadingMessage?: string;
}

const LazyScreenWrapper: React.FC<LazyScreenWrapperProps> = ({ 
  component: Component, 
  loadingMessage = "Loading..." 
}) => (
  <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
    <Component />
  </Suspense>
);

export default LazyScreenWrapper;