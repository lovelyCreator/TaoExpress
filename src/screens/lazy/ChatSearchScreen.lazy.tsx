import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ChatSearchScreen component
const LazyChatSearchScreen = lazy(() => import('../main/chatScreen/ChatSearchScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ChatSearchScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading chat search..." />}>
    <LazyChatSearchScreen {...props} />
  </Suspense>
);

export default ChatSearchScreenWithSuspense;