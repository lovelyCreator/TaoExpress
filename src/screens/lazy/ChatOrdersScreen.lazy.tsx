import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ChatOrdersScreen component
const LazyChatOrdersScreen = lazy(() => import('../main/ChatOrdersScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ChatOrdersScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading chat orders..." />}>
    <LazyChatOrdersScreen {...props} />
  </Suspense>
);

export default ChatOrdersScreenWithSuspense;
