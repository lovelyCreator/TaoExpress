import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { RootStackParamList } from '../../types';

type NoteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Note'>;

interface Note {
  id: string;
  title: string;
  preview: string;
  date: string;
  isRead: boolean;
  avatar?: string;
  userId?: string;
  storeId?: string;
}

const NoteScreen: React.FC = () => {
  const navigation = useNavigation<NoteScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'all' | 'written' | 'unread' | 'answered'>('answered');

  // Sample notes data
  const notes: Note[] = [
    {
      id: '1',
      title: 'Answered',
      preview: 'hello',
      date: '2025-11-19 17:00:261',
      isRead: false,
      avatar: 'https://ui-avatars.com/api/?name=Store&background=FFD700&color=fff',
      userId: 'user123',
      storeId: 'store456',
    },
    {
      id: '2',
      title: 'Order Inquiry',
      preview: 'When will my order be shipped?',
      date: '2025-11-18 14:30:15',
      isRead: true,
      avatar: 'https://ui-avatars.com/api/?name=Shop&background=4A90E2&color=fff',
      userId: 'user456',
      storeId: 'store789',
    },
    {
      id: '3',
      title: 'Product Question',
      preview: 'Is this item available in blue color?',
      date: '2025-11-17 09:15:42',
      isRead: true,
      avatar: 'https://ui-avatars.com/api/?name=Market&background=26D0CE&color=fff',
      userId: 'user789',
      storeId: 'store123',
    },
  ];

  const handleNotePress = (note: Note) => {
    // Navigate to chat screen with the note's user/store info
    navigation.navigate('Chat', {
      userId: note.userId,
      storeId: note.storeId,
    });
  };

  const handleAddNote = () => {
    navigation.navigate('LeaveNote' as never);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>In-site Message</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddNote}>
        <Ionicons name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'written' && styles.activeTab]}
          onPress={() => setActiveTab('written')}
        >
          <Text style={[styles.tabText, activeTab === 'written' && styles.activeTabText]}>
            Written
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
          onPress={() => setActiveTab('unread')}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'answered' && styles.activeTab]}
          onPress={() => setActiveTab('answered')}
        >
          <Text style={[styles.tabText, activeTab === 'answered' && styles.activeTabText]}>
            Answered
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderNoteItem = (note: Note) => (
    <TouchableOpacity
      key={note.id}
      style={styles.noteCard}
      onPress={() => handleNotePress(note)}
      activeOpacity={0.7}
    >
      <View style={styles.noteContent}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: note.avatar }} style={styles.avatar} />
          {!note.isRead && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.noteInfo}>
          <View style={styles.noteHeader}>
            <Text style={[styles.noteTitle, !note.isRead && styles.unreadTitle]}>
              {note.title}
            </Text>
            <Text style={styles.notePreview}>{note.preview}</Text>
          </View>
          <Text style={styles.noteDate}>{note.date}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="mail-outline" size={80} color={COLORS.gray[300]} />
      </View>
      <Text style={styles.emptyText}>No messages yet~</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {notes.length > 0 ? (
            notes.map((note) => renderNoteItem(note))
          ) : (
            renderEmptyState()
          )}
        </View>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingTop: SPACING['2xl'],
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[50],
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  noteCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray[200],
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  noteInfo: {
    flex: 1,
  },
  noteHeader: {
    marginBottom: SPACING.xs,
  },
  noteTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  unreadTitle: {
    fontWeight: '700',
    color: COLORS.error,
  },
  notePreview: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingTop: SPACING['3xl'] * 2,
  },
  emptyIconContainer: {
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[400],
  },
});

export default NoteScreen;
