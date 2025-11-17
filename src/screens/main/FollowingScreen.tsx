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
import { useGetFollowedStoresMutation, useFollowStoreMutation, useUnfollowStoreMutation } from '../../hooks/useFollowsMutations';
import { Follow } from '../../types';

const FollowingScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State for followed stores
  const [followedStores, setFollowedStores] = useState<Follow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for tracking follow status changes (storeId: newFollowStatus)
  const [followStatusChanges, setFollowStatusChanges] = useState<Record<number, boolean>>({});
  
  // Hooks for API calls
  const { 
    mutate: fetchFollowedStores, 
    data: followedStoresData, 
    isLoading: isFetchingStores,
    error: fetchError 
  } = useGetFollowedStoresMutation({
    onSuccess: (data) => {
      setFollowedStores(data);
      setLoading(false);
      console.log("Following Datas: ", followedStores);
    },
    onError: (error) => {
      setError(error);
      setLoading(false);
      console.log("Following Datas: ", followedStores);
    }
  });
  
  const { 
    mutate: followStore,
    isLoading: isFollowing
  } = useFollowStoreMutation({
    onSuccess: () => {
      // We don't need to do anything here since we're handling state locally
      console.log("Following Datas: ", followedStores);
    },
    onError: (error) => {
      console.error('Failed to follow store:', error);
      console.log("Following Datas: ", followedStores);
    }
  });
  
  const { 
    mutate: unfollowStore,
    isLoading: isUnfollowing
  } = useUnfollowStoreMutation({
    onSuccess: () => {
      // We don't need to do anything here since we're handling state locally
    },
    onError: (error) => {
      console.error('Failed to unfollow store:', error);
    }
  });

  // Fetch followed stores when component mounts
  useEffect(() => {
    fetchFollowedStores();
  }, []);

  // Send follow/unfollow requests when leaving the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // If there are follow status changes, send the requests
      if (Object.keys(followStatusChanges).length > 0) {
        Object.entries(followStatusChanges).forEach(([storeIdStr, shouldFollow]) => {
          const storeId = parseInt(storeIdStr, 10);
          // Check if the store's original state matches the intended state
          const isOriginallyFollowed = followedStores.some(follow => follow.store_id === storeId);
          
          // Only send API request if there's an actual change
          if (isOriginallyFollowed && !shouldFollow) {
            // Originally followed, now unfollowing
            unfollowStore(storeId);
          } else if (!isOriginallyFollowed && shouldFollow) {
            // Originally not followed, now following
            followStore(storeId);
          }
          // If isOriginallyFollowed && shouldFollow OR !isOriginallyFollowed && !shouldFollow,
          // there's no actual change, so we don't send any request
        });
        // Clear the follow status changes
        setFollowStatusChanges({});
      }
    });

    return unsubscribe;
  }, [navigation, followStatusChanges, followStore, unfollowStore, followedStores]);

  const toggleFollowStatus = (storeId: number) => {
    // Check if there's already a pending change for this store
    const pendingChange = followStatusChanges[storeId];
    
    if (pendingChange !== undefined) {
      // If there's a pending change, toggle it back
      if (pendingChange === true) {
        // Was marked for following, now mark for unfollowing
        setFollowStatusChanges(prev => ({ ...prev, [storeId]: false }));
      } else {
        // Was marked for unfollowing, now mark for following
        setFollowStatusChanges(prev => ({ ...prev, [storeId]: true }));
      }
    } else {
      // No pending change, check current state
      const isCurrentlyFollowed = followedStores.some(follow => follow.store_id === storeId);
      
      if (isCurrentlyFollowed) {
        // Currently followed, mark for unfollowing
        setFollowStatusChanges(prev => ({ ...prev, [storeId]: false }));
      } else {
        // Currently not followed, mark for following
        setFollowStatusChanges(prev => ({ ...prev, [storeId]: true }));
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Following</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderFollowingItem = ({ item }: { item: Follow }) => {
    // Check if there's a pending change for this store
    const pendingChange = followStatusChanges[item.store_id];
    // All items in this list are followed stores by default
    // If there's a pending change to unfollow (false), show "Follow"
    // If there's a pending change to follow (true) or no pending change, show "Following"
    const isFollowed = pendingChange === false ? false : true;
    
    return (
      <View style={styles.followingItem}>
        <Image 
          source={{ uri: item?.store?.logo_full_url || item?.store?.logo || 'https://via.placeholder.com/60' }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{item?.store?.name}</Text>
          </View>
          {/* <Text style={styles.username}>{item.store.address || 'No address provided'}</Text> */}
        </View>
        <TouchableOpacity 
          style={[
            styles.unfollowButton,
            isFollowed && styles.followingButton
          ]}
          onPress={() => toggleFollowStatus(item.store_id)}
          disabled={isFollowing || isUnfollowing}
        >
          {(isFollowing || isUnfollowing) ? (
            <ActivityIndicator size="small" color={COLORS.text.primary} />
          ) : (
            <>
              <Ionicons 
                name={isFollowed ? 'checkmark' : 'add'} 
                size={16} 
                color={COLORS.text.primary} 
              />
              <Text style={[
                styles.unfollowText,
                isFollowed && styles.followingText
              ]}>
                {isFollowed ? 'Following' : 'Follow'}
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
          <Text style={styles.loadingText}>Loading followed stores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load followed stores</Text>
          <Text style={styles.errorSubText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              setError(null);
              fetchFollowedStores();
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
      {followedStores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You're not following any stores yet</Text>
          <Text style={styles.emptySubText}>Follow stores to see their updates here</Text>
        </View>
      ) : (
        <FlatList
          data={followedStores}
          renderItem={renderFollowingItem}
          keyExtractor={(item) => item?.store?.id.toString()}
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
  followingItem: {
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

export default FollowingScreen;