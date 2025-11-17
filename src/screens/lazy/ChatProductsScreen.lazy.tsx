import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ChatProductsScreen component
const LazyChatProductsScreen = lazy(() => import('../main/ChatProductsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ChatProductsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading chat products..." />}>
    <LazyChatProductsScreen {...props} />
  </Suspense>
);

export default ChatProductsScreenWithSuspense;
