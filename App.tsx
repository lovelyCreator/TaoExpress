import React, { useEffect } from 'react';
import { StatusBar, Platform, LogBox, View, ActivityIndicator, Text as RNText } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { SocketProvider } from './src/context/SocketContext';
import { ErrorBoundary } from './src/components';
import NoteBroadcastManager from './src/components/NoteBroadcastManager';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS, FONTS } from './src/constants';
import { Provider } from 'react-redux';
import { store } from './src/store';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

// Disable console.error alerts in development mode
// This prevents React Native from showing Alert dialogs for console.error
// We handle errors with Toast notifications instead
if (__DEV__) {
  LogBox.ignoreAllLogs(false); // Keep logs visible in console
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Still log to console for debugging
    originalConsoleError(...args);
    // But don't trigger React Native's Alert dialog
  };
}

// Component that renders the main app content
const AppContent = () => {
  // Set StatusBar to translucent globally
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setBarStyle('dark-content');
    }
  }, []);
  
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <AppNavigator />
      <NoteBroadcastManager />
    </>
  );
};

export default function App() {
  // Load fonts for iOS (Android uses system font)
  // Note: If font files don't exist, this will fail gracefully
  const [fontsLoaded, fontError] = useFonts(
    Platform.OS === 'ios'
      ? {
          'NotoSans-Regular': require('./assets/fonts/NotoSans-Regular.ttf'),
          'NotoSans-Medium': require('./assets/fonts/NotoSans-Medium.ttf'),
          'NotoSans-Bold': require('./assets/fonts/NotoSans-Bold.ttf'),
        }
      : {} // Empty object for Android (no fonts to load)
  );

  useEffect(() => {
    // On Android, fontsLoaded is always true (no fonts to load)
    // On iOS, wait for fonts to load or show error
    if (Platform.OS === 'android' || fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show loading screen while fonts are loading (iOS only)
  if (Platform.OS === 'ios' && !fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // If font loading failed on iOS, log warning but continue (will use system font)
  if (Platform.OS === 'ios' && fontError) {
    console.warn('Failed to load Noto Sans fonts:', fontError);
    console.warn('App will continue with system font as fallback.');
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider initialMetrics={{
          frame: { x: 0, y: 0, width: 0, height: 0 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}>
          <Provider store={store}>
            <ToastProvider>
              <AuthProvider>
                <SocketProvider>
                  <AppContent />
                </SocketProvider>
              </AuthProvider>
            </ToastProvider>
          </Provider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}