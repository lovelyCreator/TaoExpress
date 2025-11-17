import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';
import { RootStackParamList, Review } from '../types';

type ReviewsBlockNavigationProp = StackNavigationProp<RootStackParamList>;

interface ReviewsBlockProps {
  productId: string;
  reviews: Review[];
  reviewCount: number;
  averageRating: number;
  showAllReviews?: boolean;
  onSeeAllPress?: () => void;
}

const maskName = (name: string) => {
  if (!name) return 'User';
  if (name.length <= 2) return name[0] + '*';
  return name.slice(0, 2) + '**' + name.slice(-1);
};

const ReviewsBlock: React.FC<ReviewsBlockProps> = ({
  productId,
  reviews,
  reviewCount,
  averageRating,
  showAllReviews = false,
  onSeeAllPress,
}) => {
  const navigation = useNavigation<ReviewsBlockNavigationProp>();
  
  const topStars = Math.round(averageRating);
  const list = showAllReviews ? reviews : reviews.slice(0, 3);
  console.log("List: ", list);

  const formatCount = (n?: number) => {
    if (!n && n !== 0) return '0';
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return `${n}`;
  };

  const handleSeeAll = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      navigation.navigate('Reviews', { productId });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.reviewsBlockHeader}>
        <Text style={styles.reviewsBlockTitle}>Reviews ({formatCount(reviewCount)})</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.reviewsSeeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.reviewsScoreRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.reviewsScoreText}>{formatCount(Number((averageRating).toFixed(1)))} </Text>
          <Text style={styles.reviewsOutOf}>/5</Text>
        </View>
        <View style={styles.reviewsStarRow}>
          {[1,2,3,4,5].map(i => (
            <Ionicons key={i} name={i <= topStars ? 'star' : 'star-outline'} size={16} color="#FFD700" />
          ))}
        </View>
      </View>
      {list.map((rev: any) => {
        const imgUrl = rev.images[0] || '';
        console.log("ImgUrl:", rev.images[0]);
        return(
        <View key={rev.id} style={styles.reviewCardRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={{ uri: imgUrl}} style={styles.reviewAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewUserName}>{maskName(rev.userId)}</Text>
                <View style={styles.reviewsStarRow}>
                  {[1,2,3,4,5].map(i => (
                    <Ionicons key={i} name={i <= rev.rating ? 'star' : 'star-outline'} size={14} color="#FFD700" />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment} numberOfLines={3}>{rev.comment}</Text>
          </View>
        </View>
      )})}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray[200],
  },
  reviewsBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsBlockTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  reviewsSeeAll: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  reviewsScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  reviewsScoreText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  reviewsOutOf: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  reviewsStarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  reviewCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  reviewUserName: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
});

export default ReviewsBlock;