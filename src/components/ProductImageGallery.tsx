import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING, BORDER_RADIUS, FONTS } from '../constants';

const { width, height } = Dimensions.get('window');

interface ProductImageGalleryProps {
  images: string[];
  onImagePress?: (index: number) => void;
  showIndicators?: boolean;
  showLikeButton?: boolean;
  isLiked?: boolean;
  onLikePress?: () => void;
  wishlists_count?: number; // Add wishlists_count prop
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  onImagePress,
  showIndicators = true,
  showLikeButton = false,
  isLiked = false,
  onLikePress,
  wishlists_count = 0, // Use wishlists_count instead of likeCount
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setSelectedImageIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
      >
        {images.map((image, index) => (
          <TouchableOpacity 
            key={`image-${index}`} 
            activeOpacity={0.9}
            onPress={() => onImagePress && onImagePress(index)}
          >
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {showIndicators && (
        <View style={styles.indicators}>
          {images.map((_, index) => (
            <View
              key={`indicator-${index}`}
              style={[
                styles.indicator,
                selectedImageIndex === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
      )}

      {showLikeButton && (
        <TouchableOpacity 
          style={styles.likeButton}
          activeOpacity={0.9}
          onPress={onLikePress}
        >
          <Text style={styles.likeCountText}>{wishlists_count}</Text>
          <Ionicons 
            name={isLiked ? 'heart' : 'heart-outline'} 
            size={18} 
            color={isLiked ? COLORS.accentPink : COLORS.white} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: height * 0.5,
    marginLeft: '5%',
    width: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: SPACING.md,
  },
  image: {
    width: width * 0.9,
    height: '100%',
  },
  indicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
  },
  likeButton: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  likeCountText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    marginRight: 6,
  },
});

export default ProductImageGallery;