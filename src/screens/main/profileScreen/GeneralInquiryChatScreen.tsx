import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING, BORDER_RADIUS } from '../../../constants';
import { RootStackParamList } from '../../../types';
import { useGeneralInquiry } from '../../../hooks/useGeneralInquiry';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { SocketMessage } from '../../../services/socketService';

type GeneralInquiryChatRouteProp = RouteProp<RootStackParamList, 'GeneralInquiryChat'>;
type GeneralInquiryChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GeneralInquiryChat'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  senderName?: string;
  senderId?: string;
  readBy?: string[];
  attachments?: Array<{
    type: 'image' | 'file' | 'video';
    url: string;
    name?: string;
  }>;
}

const GeneralInquiryChatScreen: React.FC = () => {
  const route = useRoute<GeneralInquiryChatRouteProp>();
  const navigation = useNavigation<GeneralInquiryChatScreenNavigationProp>();
  const { t } = useTranslation();
  const { isConnected } = useSocket();
  const { showToast } = useToast();
  const { user } = useAuth();
  const inquiryId = route.params?.inquiryId;

  const {
    inquiry,
    isLoading,
    sendMessage: sendInquiryMessage,
    markAsRead,
    getInquiry,
  } = useGeneralInquiry({ inquiryId, autoFetch: true });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasMarkedReadRef = useRef(false);

  // Convert socket messages to local message format
  const convertSocketMessage = (socketMsg: SocketMessage): Message => {
    return {
      id: socketMsg._id,
      text: socketMsg.message,
      isUser: socketMsg.senderType === 'user',
      timestamp: new Date(socketMsg.timestamp),
      senderName: socketMsg.senderName,
      senderId: socketMsg.senderId,
      readBy: socketMsg.readBy,
      attachments: socketMsg.attachments,
    };
  };

  // Load inquiry and messages
  useEffect(() => {
    if (inquiryId && isConnected) {
      getInquiry(inquiryId);
    }
  }, [inquiryId, isConnected, getInquiry]);

  // Update messages when inquiry changes - this is the single source of truth
  useEffect(() => {
    if (inquiry?.messages) {
      const sortedMessages = [...inquiry.messages].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeA - timeB;
      });
      const convertedMessages = sortedMessages.map(convertSocketMessage);
      
      // Deduplicate messages by ID to prevent duplicates
      const uniqueMessages = convertedMessages.reduce((acc, msg) => {
        if (!acc.find(m => m.id === msg.id)) {
          acc.push(msg);
        }
        return acc;
      }, [] as Message[]);
      
      setMessages(uniqueMessages);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [inquiry]);

  // Mark as read when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (inquiryId && !hasMarkedReadRef.current) {
        markAsRead(inquiryId).then(() => {
          hasMarkedReadRef.current = true;
        }).catch(err => console.error('Failed to mark as read:', err));
      }
      return () => {
        hasMarkedReadRef.current = false;
      };
    }, [inquiryId, markAsRead])
  );

  // Send message
  const handleSendMessage = async () => {
    if (!inputText.trim() || !inquiryId || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await sendInquiryMessage(inquiryId, messageText);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputText(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // Render message
  const renderMessage = (message: Message, index: number) => {
    const isUser = message.isUser;
    const showAvatar = index === 0 || messages[index - 1].isUser !== isUser;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.adminMessageContainer,
        ]}
      >
        {!isUser && showAvatar && (
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={COLORS.white} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userMessageBubble : styles.adminMessageBubble,
          ]}
        >
          {message.attachments && message.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {message.attachments.map((attachment, idx) => (
                <View key={idx} style={styles.attachmentItem}>
                  {attachment.type === 'image' && (
                    <Image
                      source={{ uri: attachment.url }}
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                  )}
                  {attachment.type !== 'image' && (
                    <View style={styles.attachmentFile}>
                      <Ionicons name="document" size={24} color={COLORS.primary} />
                      <Text style={styles.attachmentFileName} numberOfLines={1}>
                        {attachment.name || 'File'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
          <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.adminMessageText]}>
            {message.text}
          </Text>
          <Text style={[styles.messageTime, isUser ? styles.userMessageTime : styles.adminMessageTime]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
        {isUser && showAvatar && (
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={20} color={COLORS.white} />
          </View>
        )}
      </View>
    );
  };

  if (!inquiryId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('inquiry.chat') || 'Chat'}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('inquiry.invalidInquiry') || 'Invalid inquiry ID'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {inquiry?.subject || t('inquiry.generalInquiry') || 'General Inquiry'}
          </Text>
          {inquiry?.assignedAdmin && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {t('inquiry.assignedTo') || 'Assigned to'} {inquiry.assignedAdmin.name}
            </Text>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {t('inquiry.noMessages') || 'No messages yet. Start the conversation!'}
                </Text>
              </View>
            ) : (
              messages.map((message, index) => renderMessage(message, index))
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('inquiry.typeMessage') || 'Type a message...'}
              placeholderTextColor={COLORS.gray[400]}
              multiline
              maxLength={5000}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Ionicons name="send" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  headerSubtitle: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[600],
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  adminMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.xs,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  userMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  adminMessageBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    ...SHADOWS.small,
  },
  messageText: {
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  adminMessageText: {
    color: COLORS.text.primary,
  },
  messageTime: {
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.xs,
  },
  userMessageTime: {
    color: COLORS.white + 'CC',
  },
  adminMessageTime: {
    color: COLORS.gray[500],
  },
  attachmentsContainer: {
    marginBottom: SPACING.xs,
  },
  attachmentItem: {
    marginBottom: SPACING.xs,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: BORDER_RADIUS.sm,
  },
  attachmentFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.sm,
  },
  attachmentFileName: {
    marginLeft: SPACING.xs,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.full,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.error,
  },
});

export default GeneralInquiryChatScreen;

