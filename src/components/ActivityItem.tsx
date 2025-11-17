import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING } from '../constants';

interface ActivityItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  style?: object;
}

const ActivityItem: React.FC<ActivityItemProps> = ({
  icon,
  title,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={20} color={COLORS.text.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
});

export default ActivityItem;