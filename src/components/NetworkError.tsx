import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
  showRetry?: boolean;
}

const NetworkError: React.FC<NetworkErrorProps> = ({
  onRetry,
  message = 'No internet connection',
  showRetry = true,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name="wifi-outline" size={60} color={COLORS.text.secondary} />
      <Text style={styles.title}>Connection Error</Text>
      <Text style={styles.message}>{message}</Text>
      {showRetry && onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh" size={20} color={COLORS.white} />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  retryButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: SPACING.sm,
  },
});

export default NetworkError;
