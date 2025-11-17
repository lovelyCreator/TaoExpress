import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING } from '../constants';

interface RatingDisplayProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showReviewCount?: boolean;
  style?: object;
  textStyle?: object;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  size = 16,
  showReviewCount = true,
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name="star"
            size={size}
            color={star <= rating ? COLORS.warning : COLORS.gray[300]}
          />
        ))}
      </View>
      {showReviewCount && (
        <Text style={[styles.text, textStyle]}>
          {rating.toFixed(1)}{reviewCount ? ` (${reviewCount})` : ''}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  text: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[600],
  },
});

export default RatingDisplay;