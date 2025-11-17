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

interface StoreCardProps {
  store: Seller;
  onPress: () => void;
  style?: object;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.storeCard, style]} onPress={onPress}>
      <Image source={{ uri: store.avatar }} style={styles.storeAvatar} />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{store.name}</Text>
        <View style={styles.storeStats}>
          <Text style={styles.followersText}>{store.followersCount} Followers</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>
              {store.rating} ({store.reviewCount}K)
            </Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    ...SHADOWS.sm,
  },
  storeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: SPACING.sm,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followersText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
    marginRight: SPACING.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
    marginLeft: 2,
  },
});

export default StoreCard;