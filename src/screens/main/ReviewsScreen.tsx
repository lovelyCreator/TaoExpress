import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList } from '../../types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetProductRatingMutation, useGetProductReviewsMutation } from '../../hooks/useReviewsMutations';
import { ApiReview } from '../../services/reviewsApi';

const maskName = (firstName: string, lastName: string) => {
  const fullName = `${firstName} ${lastName}`;
  if (!fullName) return 'User';
  if (fullName.length <= 2) return fullName[0] + '*';
  return fullName.slice(0, 2) + '**' + fullName.slice(-1);
};

const ReviewsScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Reviews'>>();
  const { productId } = route.params;
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [rating, setRating] = useState<number>(0);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Hooks for API calls
  const { 
    getProductRating, 
    data: ratingData, 
    isLoading: isRatingLoading, 
    isError: isRatingError 
  } = useGetProductRatingMutation({
    onSuccess: (data) => {
      setRating(data);
      console.log("Rating: ", rating);
    },
    onError: (error) => {
      console.error('Error fetching product rating:', error);
    }
  });

  const { 
    getProductReviews, 
    data: reviewsData, 
    totalSize,
    isLoading: isReviewsLoading, 
    isError: isReviewsError 
  } = useGetProductReviewsMutation({
    onSuccess: (data) => {
      setReviews(data.reviews);
    },
    onError: (error) => {
      console.error('Error fetching product reviews:', error);
    }
  });

  useEffect(() => {
    const productIdNum = parseInt(productId, 10);
    if (!isNaN(productIdNum)) {
      getProductRating(productIdNum);
      getProductReviews(productIdNum);
    }
  }, [productId]);

  const topStars = Math.round(rating);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{`Review (${totalSize})`}</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.accentPink} />
      <Text style={styles.loadingText}>Loading reviews...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.errorText}>Failed to load reviews</Text>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={() => {
          const productIdNum = parseInt(productId, 10);
          if (!isNaN(productIdNum)) {
            getProductRating(productIdNum);
            getProductReviews(productIdNum);
          }
        }}
      >
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isRatingLoading || isReviewsLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderLoading()}
      </View>
    );
  }

  if (isRatingError || isReviewsError) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderError()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={{flexDirection: 'row'}}>
            <Text style={styles.scoreText}>{rating.toFixed(1)} </Text>
            <Text style={styles.outOf}>/{totalSize}</Text>
          </View>
          <View style={styles.starRow}>
            {[1,2,3,4,5].map(i => (
              <Ionicons key={i} name={i <= topStars ? 'star' : 'star-outline'} size={16} color="#FFD700" />
            ))}
          </View>
        </View>

        {reviews && reviews.map((rev) => (
          <View key={rev.id} style={styles.cardRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row'}}>
                <Image 
                  source={{ uri: rev.customer.image_full_url || rev.customer.image || 'https://via.placeholder.com/60' }} 
                  style={styles.avatar} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{maskName(rev.customer.f_name, rev.customer.l_name)}</Text>
                  <View style={styles.starRow}>
                    {[1,2,3,4,5].map(i => (
                      <Ionicons key={i} name={i <= rev.rating ? 'star' : 'star-outline'} size={14} color="#FFD700" />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.comment}>{rev.comment}</Text>
            </View>
          </View>
        ))}

        {(!reviews || reviews.length === 0) && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No reviews yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  content: { padding: SPACING.md },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: SPACING.xl 
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  errorText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingTop: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  retryButton: {
    backgroundColor: COLORS.accentPink,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  scoreText: { fontSize: FONTS.sizes.base, color: COLORS.text.primary, fontWeight: '700' },
  outOf: { fontSize: FONTS.sizes.base, color: COLORS.text.secondary },
  starRow: { flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.md },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  name: { fontSize: FONTS.sizes.sm, color: COLORS.text.primary, fontWeight: '600' },
  comment: { fontSize: FONTS.sizes.sm, color: COLORS.text.secondary, marginTop: 4, lineHeight: 20 },
  emptyBox: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: COLORS.text.secondary },
});

export default ReviewsScreen;