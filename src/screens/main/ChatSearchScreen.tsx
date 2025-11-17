import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList } from '../../types';
import { ChatUser } from '../../services/chatService';

type ChatSearchScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const ChatSearchScreen: React.FC = () => {
  const navigation = useNavigation<ChatSearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Sample user data - in a real app this would come from an API
  const [users, setUsers] = useState<ChatUser[]>([
    { id: 1, name: 'John Doe', image: '', store_id: 101, read: true, lastTime: '', lastMessage: '', fromClient: true },
    { id: 2, name: 'Jane Smith', image: '', store_id: 102, read: true, lastTime: '', lastMessage: '', fromClient: true },
    { id: 3, name: 'Bob Johnson', image: '', store_id: 103, read: true, lastTime: '', lastMessage: '', fromClient: true },
    { id: 4, name: 'Alice Brown', image: '', store_id: 104, read: true, lastTime: '', lastMessage: '', fromClient: true },
    { id: 5, name: 'Charlie Wilson', image: '', store_id: 105, read: true, lastTime: '', lastMessage: '', fromClient: true },
    { id: 6, name: 'Diana Davis', image: '', store_id: 106, read: true, lastTime: '', lastMessage: '', fromClient: true },
    { id: 7, name: 'Edward Miller', image: '', store_id: 107, read: true, lastTime: '', lastMessage: '', fromClient: true },
    { id: 8, name: 'Fiona Garcia', image: '', store_id: 108, read: true, lastTime: '', lastMessage: '', fromClient: true },
  ]);

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserPress = (user: ChatUser) => {
    // Navigate to chat with the selected user
    navigation.navigate('Chat', { 
      sellerId: user.id.toString(),
      storeId: user.store_id.toString() // Pass store_id as storeId
    });
  };

  const renderUserItem = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => handleUserPress(item)}>
      <View style={styles.userImageContainer}>
        <Image
          source={item.image ? { uri: item.image } : require('../../assets/images/avatar.png')}
          style={styles.userImage}
          resizeMode="cover"
        />
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.85}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Find User</Text>
      <View style={styles.placeholder} />
    </View>
  );

  const renderSearchBar = () => (
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
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close" size={20} color={COLORS.black} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="search" size={20} color={COLORS.gray[400]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderSearchBar()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.usersList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
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
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    shadowColor: COLORS.shadow,
    shadowOffset: {width: 1, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 50
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 32,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usersList: {
    padding: SPACING.md,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
  },
});

export default ChatSearchScreen;