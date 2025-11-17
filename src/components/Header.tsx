import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, SHADOWS } from '../constants';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightIcons?: Array<{
    icon: string;
    onPress: () => void;
    badgeCount?: number;
  }>;
  style?: object;
}

const Header: React.FC<HeaderProps> = ({
  title = '',
  showBackButton = true,
  onBackPress,
  rightIcons = [],
  style,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, style]}>
      {showBackButton && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      )}
      
      {title ? (
        <Text style={styles.headerTitle}>{title}</Text>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      
      <View style={styles.headerIcons}>
        {rightIcons.map((icon, index) => (
          <TouchableOpacity
            key={`header-icon-${index}`}
            style={styles.iconButton}
            onPress={icon.onPress}
          >
            <Ionicons name={icon.icon as any} size={24} color={COLORS.text.primary} />
            {icon.badgeCount && icon.badgeCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {icon.badgeCount > 99 ? '99+' : icon.badgeCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingTop: SPACING['2xl'],
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  headerSpacer: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconButton: {
    position: 'relative',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accentPink,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
});

export default Header;