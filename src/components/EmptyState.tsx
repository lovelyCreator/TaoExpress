import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface EmptyStateProps {
  title: string;
  subtitle: string;
  imageSource?: any;
  buttonTitle?: string;
  onButtonPress?: () => void;
  style?: object;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  imageSource,
  buttonTitle,
  onButtonPress,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderIcon} />
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      {buttonTitle && onButtonPress && (
        <TouchableOpacity
          style={styles.button}
          onPress={onButtonPress}
        >
          <Text style={styles.buttonText}>{buttonTitle}</Text>
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
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
  },
  placeholderIcon: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.gray[200],
    borderRadius: 50,
  },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    minWidth: 200,
  },
  buttonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default EmptyState;