import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  onPress?: () => void;
  style?: object;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{icon}</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    minWidth: 100,
    ...SHADOWS.small,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text.primary,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
});

export default StatCard;