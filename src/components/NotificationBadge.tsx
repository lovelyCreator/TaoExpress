import React, { ReactElement } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

interface NotificationBadgeProps {
  icon?: string;
  customIcon?: ReactElement;
  iconSize?: number;
  iconColor?: string;
  count: number;
  onPress: () => void;
  badgeColor?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  icon,
  customIcon,
  iconSize = 36,
  iconColor = COLORS.text.primary,
  count,
  onPress,
  badgeColor = '#FF0000', // Default red color for notification dot
}) => {
  const renderIcon = () => {
    if (customIcon) {
      return customIcon;
    }
    if (icon) {
      return <Ionicons name={icon as any} size={iconSize} color={iconColor} />;
    }
    return null;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {renderIcon()}
      {count > 0 && (
        <View style={[styles.dot, { backgroundColor: badgeColor }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  dot: {
    position: 'absolute',
    top: 1,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#FF0000',
  },
});

export default NotificationBadge;
