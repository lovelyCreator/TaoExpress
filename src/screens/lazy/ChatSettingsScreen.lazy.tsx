import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';

// Lazy load the ChatSettingsScreen component
const LazyChatSettingsScreen = lazy(() => import('../main/ChatSettingsScreen'));

// Export a component that wraps the lazy-loaded component with Suspense
const ChatSettingsScreenWithSuspense = (props: any) => (
  <Suspense fallback={<LoadingSpinner message="Loading chat settings..." />}>
    <LazyChatSettingsScreen {...props} />
  </Suspense>
);

export default ChatSettingsScreenWithSuspense;
