import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { Seller } from '../types';

interface StoreProfileProps {
  store: Seller;
  followersCount: number;
  followingCount: number;
  onPress: () => void;
  style?: object;
}

const StoreProfile: React.FC<StoreProfileProps> = ({
  store,
  followersCount,
  followingCount,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
    >
      <Image
        source={{ uri: store.avatar }}
        style={styles.avatar}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeUrl}>taoexpress.com/{store.name.toLowerCase().replace(/\s+/g, '')}</Text>
        
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>{followersCount} Followers</Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>{followingCount} Following</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  infoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  storeUrl: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  statDivider: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.xs,
  },
});

export default StoreProfile;