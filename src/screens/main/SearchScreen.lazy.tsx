import React, { lazy, Suspense } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants';

const SearchScreen = lazy(() => import('./SearchScreen'));

const SearchScreenWithSuspense = (props: any) => (
  <Suspense
    fallback={
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    }
  >
    <SearchScreen {...props} />
  </Suspense>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default SearchScreenWithSuspense;