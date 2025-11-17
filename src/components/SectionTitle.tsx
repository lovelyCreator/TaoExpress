import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING } from '../constants';

interface SectionTitleProps {
  title: string;
  showViewAll?: boolean;
  onViewAllPress?: () => void;
  style?: object;
  titleStyle?: object;
  viewAllStyle?: object;
}

const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  showViewAll = false,
  onViewAllPress,
  style,
  titleStyle,
  viewAllStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>
        {title}
      </Text>
      {showViewAll && onViewAllPress && (
        <TouchableOpacity
          style={[styles.viewAllButton, viewAllStyle]}
          onPress={onViewAllPress}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={COLORS.gray[500]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginRight: SPACING.xs,
  },
});

export default SectionTitle;