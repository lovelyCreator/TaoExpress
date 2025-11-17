import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

interface ShareContact {
  id: string;
  name: string;
  avatar: any;
}

interface ShareApp {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ShareAction {
  id: string;
  title: string;
  icon: string;
  color?: string;
}

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  item?: {
    title: string;
    price?: string;
    image: any;
  };
}

const ShareModal: React.FC<ShareModalProps> = ({ visible, onClose, item }) => {
  const contacts: ShareContact[] = [
    { id: '1', name: 'Sandy Wilder Cheng', avatar: require('../assets/images/sneakers.png') },
    { id: '2', name: 'Kevin Leong', avatar: require('../assets/images/sports_shoes.png') },
    { id: '3', name: 'Sandy and Kevin', avatar: require('../assets/images/hand_bags.png') },
    { id: '4', name: 'Juliana Mejia', avatar: require('../assets/images/dress.png') },
    { id: '5', name: 'Greg Ap', avatar: require('../assets/images/sneakers.png') },
  ];

  const apps: ShareApp[] = [
    { id: 'airdrop', name: 'AirDrop', icon: 'wifi', color: '#007AFF' },
    { id: 'messages', name: 'Messages', icon: 'chatbubble', color: '#34C759' },
    { id: 'mail', name: 'Mail', icon: 'mail', color: '#007AFF' },
    { id: 'notes', name: 'Notes', icon: 'document-text', color: '#FFD60A' },
    { id: 'reminders', name: 'Reminders', icon: 'list', color: '#FF3B30' },
  ];

  const actions: ShareAction[] = [
    { id: 'copy', title: 'Copy', icon: 'copy-outline' },
    { id: 'reading-list', title: 'Add to Reading List', icon: 'glasses-outline' },
    { id: 'bookmark', title: 'Add Bookmark', icon: 'bookmark-outline' },
    { id: 'favorites', title: 'Add to Favorites', icon: 'star-outline' },
    { id: 'find-page', title: 'Find on Page', icon: 'search-outline' },
    { id: 'home-screen', title: 'Add to Home Screen', icon: 'add-circle-outline' },
    { id: 'markup', title: 'Markup', icon: 'pencil-outline' },
    { id: 'print', title: 'Print', icon: 'print-outline' },
  ];

  const handleContactPress = (contact: ShareContact) => {
    console.log(`Share to ${contact.name}`);
    onClose();
  };

  const handleAppPress = (app: ShareApp) => {
    console.log(`Share via ${app.name}`);
    onClose();
  };

  const handleActionPress = (action: ShareAction) => {
    console.log(`Action: ${action.title}`);
    onClose();
  };

  const renderProductHeader = () => {
    if (!item) return null;

    return (
      <View style={styles.productHeader}>
        <Image source={item.image} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.price && (
            <Text style={styles.productPrice}>{item.price}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color={COLORS.gray[500]} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderContacts = () => (
    <View style={styles.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactsContainer}>
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactItem}
            onPress={() => handleContactPress(contact)}
          >
            <View style={styles.contactAvatarContainer}>
              <Image source={contact.avatar} style={styles.contactAvatar} />
              <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.contactName} numberOfLines={2}>
              {contact.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderApps = () => (
    <View style={styles.section}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.appsContainer}>
        {apps.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={styles.appItem}
            onPress={() => handleAppPress(app)}
          >
            <View style={[styles.appIcon, { backgroundColor: app.color }]}>
              <Ionicons name={app.icon as any} size={28} color={COLORS.white} />
            </View>
            <Text style={styles.appName}>{app.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsSection}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={action.id}
          style={[
            styles.actionItem,
            index < actions.length - 1 && styles.actionItemBorder
          ]}
          onPress={() => handleActionPress(action)}
        >
          <Text style={[styles.actionTitle, action.id === 'edit-actions' && { color: COLORS.accentPink }]}>
            {action.title}
          </Text>
          <Ionicons 
            name={action.icon as any} 
            size={20} 
            color={action.color || COLORS.gray[600]} 
          />
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity style={styles.actionItem} onPress={onClose}>
        <Text style={[styles.actionTitle, { color: COLORS.accentPink }]}>
          Edit Actions...
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.container}>
          {renderProductHeader()}
          {renderContacts()}
          {renderApps()}
          {renderActions()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  productPrice: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
  },
  closeButton: {
    padding: SPACING.sm,
  },
  section: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  contactsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  contactItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 70,
  },
  contactAvatarContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  contactName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 14,
  },
  appsContainer: {
    paddingHorizontal: SPACING.lg,
  },
  appItem: {
    alignItems: 'center',
    marginRight: SPACING.lg,
    width: 70,
  },
  appIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  appName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  actionsSection: {
    paddingVertical: SPACING.sm,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  actionTitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
});

export default ShareModal;