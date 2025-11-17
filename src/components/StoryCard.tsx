import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList, Story } from '../types';
import { useCart } from '../context/CartContext';

type StoryCardNavigationProp = StackNavigationProp<RootStackParamList, 'ProductDetail'>;

interface StoryCardProps {
  story: Story;
  onPress?: (story: Story) => void;
  onAddToCart?: (productId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_WIDTH = SCREEN_WIDTH * 0.25;

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onPress,
  onAddToCart,
}) => {
  const navigation = useNavigation<StoryCardNavigationProp>();
  const { addToCart, isAddToCartLoading } = useCart(); // Use specific loading state for add to cart
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  const handlePress = () => {
    if (onPress) {
      onPress(story);
    } else {
      // Default behavior - navigate to product detail
      if (story.product) {
        navigation.navigate('ProductDetail', { productId: story.product.id });
      }
    }
  };

  const handleAddToCart = async () => {
    try {
      if (story.product) {
        // For story items, we'll use default values for variation and option
        await addToCart(story.product, 1, 0, 0);
        if (onAddToCart) {
          onAddToCart(story.product.id);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleLongPress = () => {
    setIsPlaying(true);
  };

  const handlePressOut = () => {
    setIsPlaying(false);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: story.media }} style={styles.image} />
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]} 
            />
          </View>
        </View>

        {/* Play indicator */}
        {!isPlaying && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color={COLORS.white} />
          </View>
        )}

        {/* Story type indicator */}
        <View style={styles.typeIndicator}>
          <Ionicons 
            name={story.type === 'video' ? 'videocam' : 'image'} 
            size={12} 
            color={COLORS.white} 
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sellerName} numberOfLines={1}>
          {story.user.name}
        </Text>
        
        {story.product && (
          <Text style={styles.productTitle} numberOfLines={1}>
            {story.product.name}
          </Text>
        )}

        {story.product && (
          <Text style={styles.productPrice}>
            ${story.product.price.toFixed(2)}
          </Text>
        )}

        {story.product && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={10} color={COLORS.warning} />
            <Text style={styles.ratingText}>
              {story.product.rating.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Quick add to cart button */}
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          disabled={isAddToCartLoading}
        >
          <LinearGradient
            colors={[COLORS.gradients.primary[0], COLORS.gradients.primary[1]]}
            style={styles.addToCartGradient}
          >
            {isAddToCartLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="add" size={14} color={COLORS.white} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: STORY_WIDTH,
    marginRight: SPACING.sm,
  },
  imageContainer: {
    position: 'relative',
    height: STORY_WIDTH * 1.2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    right: SPACING.xs,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 1,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    top: SPACING.xs,
    right: SPACING.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingTop: SPACING.xs,
    alignItems: 'center',
  },
  sellerName: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ratingText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    marginLeft: 2,
    fontWeight: '500',
  },
  addToCartButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  addToCartGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StoryCard;