import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomerOrderDetails } from '../types';

// Define ChatUser interface
export interface ChatUser { 
  id: number; 
  name: string; 
  image: string; 
  read?: boolean; 
  lastTime?: string; 
  lastMessage?: string; 
  fromClient?: boolean;
  store_id: number;
}

const CHAT_USERS_STORAGE_KEY = 'chat_users';

// Store chat users in local storage
export const storeChatUsers = async (users: ChatUser[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(users);
    await AsyncStorage.setItem(CHAT_USERS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error storing chat users:', error);
    throw error;
  }
};

// Get chat users from local storage
export const getChatUsers = async (): Promise<ChatUser[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CHAT_USERS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error getting chat users:', error);
    return [];
  }
};

// Add a new chat user
export const addChatUser = async (user: ChatUser): Promise<void> => {
  try {
    const users = await getChatUsers();
    // Check if user already exists
    const existingUserIndex = users.findIndex(u => u.id === user.id);
    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = user;
    } else {
      // Add new user
      users.push(user);
    }
    await storeChatUsers(users);
  } catch (error) {
    console.error('Error adding chat user:', error);
    throw error;
  }
};

// Update a chat user
export const updateChatUser = async (userId: number, updates: Partial<ChatUser>): Promise<void> => {
  try {
    const users = await getChatUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      users[userIndex] = { ...users[userIndex], ...updates };
      await storeChatUsers(users);
    }
  } catch (error) {
    console.error('Error updating chat user:', error);
    throw error;
  }
};

// Mark a chat user's messages as read
export const markChatUserAsRead = async (userId: number): Promise<void> => {
  try {
    await updateChatUser(userId, { read: true });
  } catch (error) {
    console.error('Error marking chat user as read:', error);
    throw error;
  }
};

// Remove a chat user
export const removeChatUser = async (userId: number): Promise<void> => {
  try {
    const users = await getChatUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    await storeChatUsers(filteredUsers);
  } catch (error) {
    console.error('Error removing chat user:', error);
    throw error;
  }
};

// Clear all chat users
export const clearChatUsers = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CHAT_USERS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chat users:', error);
    throw error;
  }
};