import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { Notification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/localDatabase';
import { ChatUser, getChatUsers } from '../../services/chatService';
import { RootStackParamList } from '../../types';

type ChattingMemberScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

const ChattingMemeberScreen: React.FC = () => {
  const navigation = useNavigation<ChattingMemberScreenNavigationProp>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');

  // Load chat users from database on component mount
  useEffect(() => {
    loadChatUsers();
  }, []);

  const loadChatUsers = async () => {
    try {
      setLoading(true);
      const users = await getChatUsers();
      if (users.length > 0) {
        setChatUsers(users);
      } else {
        // Load default users if none exist in database
        const defaultUsers: ChatUser[] = [
          { id: 1, name: 'John Doe', image: "", read: true, lastTime: 'Yesterday', lastMessage: 'Hi there!', fromClient: true, store_id: 101 },
          { id: 2, name: 'Jane Smith', image: "", read: false, lastTime: '10.30am', lastMessage: 'How are you?', fromClient: true, store_id: 102 },
          { id: 3, name: 'Jim Brown', image: "", read: true, lastTime: 'Yesterday', lastMessage: 'Hello!', fromClient: false, store_id: 103 },
          { id: 4, name: 'Alice Johnson', image: "", read: false, lastTime: '9.15am', lastMessage: 'Can you help me?', fromClient: false, store_id: 104 },
          { id: 5, name: 'Bob Wilson', image: "", read: true, lastTime: '2 days ago', lastMessage: 'Thanks for your help!', fromClient: true, store_id: 105 },
        ];
        setChatUsers(defaultUsers);
      }
    } catch (error) {
      console.error('Error loading chat users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter chat users based on active tab and search query
  const filteredChatUsers = useMemo(() => {
    let filtered = [...chatUsers];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply tab filter
    switch (activeTab) {
      case 'unread':
        // Filter for unread messages: fromClient is true and read is false
        filtered = filtered.filter(user => user.fromClient && !user.read);
        break;
      case 'read':
        // Filter for read messages: either fromClient is false OR read is true
        filtered = filtered.filter(user => !user.fromClient || user.read);
        break;
      case 'all':
      default:
        // No additional filtering for 'all' tab
        break;
    }
    
    return filtered;
  }, [chatUsers, activeTab, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChatUsers();
    setRefreshing(false);
  };

  const handleChatUserPress = async (chatUser: ChatUser) => {
    // Navigate to chat screen with user ID and store ID
    navigation.navigate('Chat', { userId: chatUser.id.toString(), storeId: chatUser.store_id.toString() });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chat</Text>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('ChatSearch')}
      >
        <Ionicons name="create-outline" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => {
    // if (chatUsers.length === 0) return null;
    
    return (
      <View>  
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} />
              <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search"
                  placeholderTextColor={COLORS.gray[400]}
                  returnKeyType="search"
                  // onSubmitEditing={loadProducts} // Trigger search when user presses Enter/Return
              />
              {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close" size={20} color={COLORS.black} />
                  </TouchableOpacity>
              ): (
                  // <TouchableOpacity onPress={loadProducts}>
                  <TouchableOpacity>
                      <Ionicons name="search" size={20} color={COLORS.gray[400]} />
                  </TouchableOpacity>
              )}
          </View>
        </View>      
        <View style={styles.tabsContainer}>
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'read', label: 'Read' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderChatUser = ({ item }: { item: ChatUser }) => {
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          // !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleChatUserPress(item)}
      >
        <View style={styles.notificationIcon}>
          <Image source={item.image !== "" ? { uri: item.image } : require('../../assets/images/avatar.png') } />
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}> 
              <Text style={styles.notificationTitle}>{item.name}</Text>
              <Text style={styles.notificationTime}>
                  {/* {formatNotificationTime(new Date(item.lastTime as unknown as string))} */}
                  {item.lastTime}
              </Text>
          </View>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationBody}>
              {!item.fromClient && <Ionicons name="checkmark-done-outline" size={16} color={item.read ? COLORS.accentPink : COLORS.gray[500]} />}
              <Text 
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.notificationMessage}
              >
                  {item.lastMessage}
              </Text>
            </View>
            {!item.read && item.fromClient && <View style={styles.unreadDot} />}   
          </View>
        </View>
        
      </TouchableOpacity>
    );
  };

  const formatNotificationTime = (createdAt: Date) => {
    const now = new Date();
    const notificationDate = new Date(createdAt);
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return notificationDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderGroupedNotifications = () => {
    
    return (
        <View>
            {filteredChatUsers.map((user) => (
            <View key={user.id}>
                {renderChatUser({ item: user })}
            </View>
            ))}
        </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <View style={styles.bellContainer}>
          {/* <View style={styles.bellIcon}>
            <Image source={require('../../assets/icons/notification.png')} />
          </View> */}
          {/* <View style={styles.exclamationBadge}>
            <Text style={styles.exclamationText}>!</Text>
          </View> */}
        </View>
      </View>
      {/* <Text style={styles.emptyTitle}>No Chat Users</Text> */}
      {/* <Text style={styles.emptySubtitle}>
        There are no chat users matching your current filters.
      </Text> */}
      {/* <TouchableOpacity
        style={styles.startExploringButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.startExploringButtonText}>Start Exploring</Text>
      </TouchableOpacity> */}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      <ScrollView
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredChatUsers.length === 0 ? (
          renderEmptyState()
        ) : (
          renderGroupedNotifications()
        )}
      </ScrollView>
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
    paddingTop:SPACING['2xl'],
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 1, height:1},
    shadowOpacity: 0.1,
    shadowRadius: 50
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 32, // Same width as back button for centering
  },
  markAllText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    backgroundColor: COLORS.gray[100],
    borderRadius: 40,
    paddingHorizontal: SPACING.md,
    marginHorizontal: SPACING.sm,
  },
  searchInput: {
    flexDirection: 'row',
    width: '80%',
    textAlign: 'left',
    marginLeft: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.xs,
  },
  tab: {
    flex: 1,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    borderBottomColor: COLORS.black,
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.black,
    fontWeight: '600',
  },
  notificationSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  notificationCount: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '400',
    color: COLORS.text.primary,
  },
  groupedContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  groupHeader: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    // borderWidth: 1,
    // borderColor: COLORS.gray[100],
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    // borderRadius: SPACING.md,

  },
  unreadNotification: {
    backgroundColor: COLORS.primary + '05',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    // borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    borderRadius: 50,
    overflow: 'hidden',
    // backgroundColor: COLORS.gray[100],
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationBody: {
    flexDirection: 'row',
  },
  notificationTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    marginHorizontal: SPACING.sm,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    // height: '100%',
  },
  emptyIconContainer: {
    // marginBottom: SPACING.lg,
    flexDirection: 'column',
    alignItems: 'center'
  },
  bellContainer: {
    // position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: 300,
    height: 300,
    marginTop: SPACING['3xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamationBadge: {
    position: 'absolute',
    top: 10,
    right: 25,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamationText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  startExploringButton: {
    backgroundColor: COLORS.black,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  startExploringButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: '400',
    color: COLORS.white,
  },
});

export default ChattingMemeberScreen;