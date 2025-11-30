import React, { useRef, useEffect } from 'react';
import { Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants';

interface NotificationBadgeProps {
  icon: string;
  iconSize?: number;
  iconColor?: string;
  count: number;
  onPress: () => void;
  badgeColor?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  icon,
  iconSize = 36,
  iconColor = COLORS.text.primary,
  count,
  onPress,
  badgeColor = COLORS.primary,
}) => {
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation and reset
      badgePulse.setValue(1);
    }
  }, [count]);

  // Format count display
  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name={icon as any} size={iconSize} color={iconColor} />
      {count > 0 && (
        <Animated.View
          style={[styles.badge, { backgroundColor: badgeColor }, { transform: [{ scale: badgePulse }] }]}
        >
          <Text style={styles.badgeText} numberOfLines={1}>{displayCount}</Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    flexDirection: 'row',
  },
  badgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default NotificationBadge;
