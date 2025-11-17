import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { useGetFollowersMutation, useCheckFollowingMutation, useFollowStoreMutation, useUnfollowStoreMutation } from '../../hooks/useFollowsMutations';
import { Follower } from '../../types';

const FollowersScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State for followers
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [followStatus, setFollowStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for tracking follow status changes (storeId: newFollowStatus)
  const [followStatusChanges, setFollowStatusChanges] = useState<Record<number, boolean>>({});
  
  // Hooks for API calls
  const { 
    mutate: fetchFollowers, 
    data: followersData, 
    isLoading: isFetchingFollowers,
    error: fetchError 
  } = useGetFollowersMutation({
    onSuccess: (data) => {
      setFollowers(data);
      setLoading(false);
      // Check follow status for each follower
      data.forEach(follower => {
        checkFollowStatusForStore(follower.store_id);
      });
    },
    onError: (error) => {
      setError(error);
      setLoading(false);
    }
  });
  
  const { 
    mutate: checkFollowStatus,
  } = useCheckFollowingMutation({
    onSuccess: (data) => {
      // We'll handle this in the checkFollowStatusForStore function
    },
    onError: (error) => {
      console.error('Failed to check follow status:', error);
    }
  });
  
  const { 
    mutate: followStore,
    isLoading: isFollowing
  } = useFollowStoreMutation({
    onSuccess: (data) => {
      // We don't need to do anything here since we're handling state locally
    },
    onError: (error) => {
      console.error('Failed to follow store:', error);
    }
  });
  
  const { 
    mutate: unfollowStore,
    isLoading: isUnfollowing
  } = useUnfollowStoreMutation({
    onSuccess: (data) => {
      // We don't need to do anything here since we're handling state locally
    },
    onError: (error) => {
      console.error('Failed to unfollow store:', error);
    }
  });

  // Fetch followers when component mounts
  useEffect(() => {
    fetchFollowers();
  }, []);

  // Send follow/unfollow requests when leaving the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If there are follow status changes, send the requests
      if (Object.keys(followStatusChanges).length > 0) {
        Object.entries(followStatusChanges).forEach(([storeIdStr, shouldFollow]) => {
          const storeId = parseInt(storeIdStr, 10);
          // Check if the store's original state matches the intended state
          const isOriginallyFollowing = followStatus[storeId] ?? false;
          
          // Only send API request if there's an actual change
          if (isOriginallyFollowing && !shouldFollow) {
            // Originally following, now unfollowing
            unfollowStore(storeId);
          } else if (!isOriginallyFollowing && shouldFollow) {
            // Originally not following, now following
            followStore(storeId);
          }
          // If isOriginallyFollowing && shouldFollow OR !isOriginallyFollowing && !shouldFollow,
          // there's no actual change, so we don't send any request
        });
        // Clear the follow status changes
        setFollowStatusChanges({});
      }
    });

    return unsubscribe;
  }, [navigation, followStatusChanges, followStore, unfollowStore, followStatus]);

  // Function to check follow status for a specific store
  const checkFollowStatusForStore = async (storeId: number) => {
    try {
      // Call the mutation with the storeId
      checkFollowStatus(storeId);
    } catch (error) {
      console.error('Failed to check follow status for store:', storeId, error);
    }
  };

  const toggleFollowStatus = (storeId: number, currentStatus: boolean) => {
    // Check if there's already a pending change for this store
    const pendingChange = followStatusChanges[storeId];
    
    if (pendingChange !== undefined) {
      // If there's a pending change, toggle it back
      setFollowStatusChanges(prev => ({ ...prev, [storeId]: !pendingChange }));
    } else {
      // No pending change, toggle the current status
      setFollowStatusChanges(prev => ({ ...prev, [storeId]: !currentStatus }));
    }
    
    // Update local state immediately for UI feedback
    setFollowStatus(prev => ({ ...prev, [storeId]: !currentStatus }));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Followers</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderFollowerItem = ({ item }: { item: Follower }) => {
    // Check if there's a pending change for this store
    const pendingChange = followStatusChanges[item.store_id];
    // Get the follow status from our local state or pending changes, fallback to false if not set
    const isFollowing = pendingChange !== undefined ? pendingChange : (followStatus[item.store_id] ?? false);
    
    return (
      <View style={styles.followerItem}>
        <Image 
          source={{ uri: item.user.image_full_url || item.user.image || 'https://via.placeholder.com/60' }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{item.user.f_name} {item.user.l_name}</Text>
            {/* {item.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            )} */}
          </View>
          <Text style={styles.username}>{item.user.email}</Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.unfollowButton,
            isFollowing && styles.followingButton
          ]}
          onPress={() => toggleFollowStatus(item.store_id, isFollowing)}
          disabled={isFollowing || isUnfollowing}
        >
          {(isFollowing || isUnfollowing) ? (
            <ActivityIndicator size="small" color={COLORS.text.primary} />
          ) : (
            <>
              <Ionicons 
                name={isFollowing ? 'checkmark' : 'add'} 
                size={16} 
                color={COLORS.text.primary} 
              />
              <Text style={[
                styles.unfollowText,
                isFollowing && styles.followingText
              ]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accentPink} />
          <Text style={styles.loadingText}>Loading followers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load followers</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchFollowers();
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {followers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You don't have any followers yet</Text>
          <Text style={styles.emptySubText}>When stores follow you, they'll appear here</Text>
        </View>
      ) : (
        <FlatList
          data={followers}
          renderItem={renderFollowerItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    marginTop: SPACING.xl,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  errorSubText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.accentPink,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptySubText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  listContent: {
    padding: SPACING.md,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginRight: SPACING.md,
    backgroundColor: COLORS.gray[200],
  },
  userInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: 4,
  },
  username: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  productCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
  },
  unfollowButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    backgroundColor: COLORS.gray[50],
    width: '32%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray[100],
  },
  unfollowText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginLeft: SPACING.xs,
  },
  followingText: {
    color: COLORS.text.primary,
  },
});

export default FollowersScreen;