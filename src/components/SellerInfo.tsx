import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';
import { RootStackParamList, Seller } from '../types';

type SellerInfoNavigationProp = StackNavigationProp<RootStackParamList>;

interface SellerInfoProps {
  seller: Seller;
  showFollowButton?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  isFollowing?: boolean; // Add this prop to receive follow status from parent
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  seller,
  showFollowButton = true,
  onFollowChange,
  isFollowing: externalIsFollowing, // Receive follow status from parent
}) => {
  const navigation = useNavigation<SellerInfoNavigationProp>();
  const [isFollowing, setIsFollowing] = useState(false);

  // Sync internal state with external prop
  useEffect(() => {
    if (externalIsFollowing !== undefined) {
      setIsFollowing(externalIsFollowing);
    }
  }, [externalIsFollowing]);

  const handleFollowToggle = () => {
    const newFollowingState = !isFollowing;
    // Only update internal state if no external prop is provided
    if (externalIsFollowing === undefined) {
      setIsFollowing(newFollowingState);
    }
    if (onFollowChange) {
      onFollowChange(newFollowingState);
    }
  };

  const handleSellerPress = () => {
    navigation.navigate('SellerProfile', { sellerId: seller.id });
  };

  const formatCount = (n?: number) => {
    if (!n && n !== 0) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${n}`;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.sellerRow}>
        <TouchableOpacity onPress={handleSellerPress}>
          <Image
            source={
              seller?.avatar
                ? { uri: seller.avatar }
                : require('../assets/images/sneakers.png')
            }
            style={styles.sellerAvatar}
          />
        </TouchableOpacity>
        <View style={styles.sellerInfo}>
          <TouchableOpacity onPress={handleSellerPress}>
            <Text style={styles.sellerName}>{seller?.name || 'Official Store'}</Text>
          </TouchableOpacity>
          <View style={styles.sellerMetaRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.sellerMetaText}>{(seller?.rating || 0).toFixed(1)} ({seller?.reviewCount || 0})</Text>
            <Text style={styles.dotDivider}>|</Text>
            <Text style={styles.sellerMetaText}>{formatCount(seller?.orderCount)} sold</Text>
          </View>
        </View>
      </View>
      
      {showFollowButton && (
        <View style={styles.sellerActionsRow}>
          <TouchableOpacity
            style={styles.sellerActionBtn}
            onPress={handleSellerPress}
          >
            <Image source={require('../assets/icons/viewshop.png')} />
            <Text style={styles.sellerActionText}>View Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sellerActionBtn}
            onPress={handleFollowToggle}
          >
            <Ionicons 
              name={isFollowing ? 'checkmark' : 'add'} 
              size={16} 
              color={COLORS.text.primary} 
            />
            <Text style={styles.sellerActionText}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: SPACING.md,
    backgroundColor: COLORS.gray[100],
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sellerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  sellerMetaText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  dotDivider: {
    color: COLORS.gray[200],
    marginHorizontal: 2,
  },
  sellerActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sellerActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
  },
  sellerActionText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
});

export default SellerInfo;