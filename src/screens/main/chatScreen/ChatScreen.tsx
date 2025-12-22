import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../../constants';
import { RootStackParamList } from '../../../types';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useAppSelector } from '../../../store/hooks';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSocket } from '../../../context/SocketContext';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
import { SocketMessage, socketService } from '../../../services/socketService';
import { inquiryApi } from '../../../services/inquiryApi';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

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

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { t } = useTranslation();
  const { 
    isConnected, 
    isConnecting,
    connect,
    subscribeToInquiry, 
    unsubscribeFromInquiry,
    onMessageReceived,
  } = useSocket();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  // console.log('ChatScreen rendered with params:', route.params);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listeningText, setListeningText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inquiryId, setInquiryId] = useState<string | null>(route.params?.inquiryId || null);
  const [orderNumber, setOrderNumber] = useState<string | null>(route.params?.orderNumber || null); // Store order number from route params or inquiry
  const scrollViewRef = useRef<ScrollView>(null);
  const hasFetchedInquiryRef = useRef(false); // Track if inquiry has been fetched

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

  // Note: Messages are now loaded via REST API, not from currentInquiry

  // Fetch chat history via REST API on mount
  useEffect(() => {
    const fetchChatHistory = async () => {
      // If we have an inquiryId in route params, fetch that inquiry details (only once)
      if (route.params?.inquiryId && !hasFetchedInquiryRef.current) {
        hasFetchedInquiryRef.current = true;
        setIsLoading(true);
        try {
          const response = await inquiryApi.getInquiry(route.params.inquiryId);
          if (response.success && response.data?.inquiry) {
            const inquiry = response.data.inquiry;
            setInquiryId(inquiry._id);
            
            // Store order number from inquiry (prioritize route params, but use inquiry if route params don't have it)
            if (inquiry.order?.orderNumber) {
              setOrderNumber(inquiry.order.orderNumber);
            }
            
            // Convert and set messages
            if (inquiry.messages && inquiry.messages.length > 0) {
              // Sort messages by timestamp (oldest first) and convert
              const sortedMessages = [...inquiry.messages].sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                return timeA - timeB;
              });
              const convertedMessages = sortedMessages.map(convertSocketMessage);
              setMessages(convertedMessages);
              
              // Scroll to bottom after messages are loaded
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: false });
              }, 100);
            }
            
            // Subscribe to socket for new messages
            if (isConnected) {
              subscribeToInquiry(inquiry._id);
              // Mark as read via REST API
              await inquiryApi.markAsRead(inquiry._id);
            }
          } else {
            showToast(response.error || 'Failed to load chat history', 'error');
          }
        } catch (error) {
          // console.error('Error fetching inquiry:', error);
          showToast('Failed to load chat history', 'error');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchChatHistory();
  }, [route.params?.inquiryId, isConnected, inquiryId, subscribeToInquiry, showToast]);

  // Ensure socket is connected for real-time updates
  useEffect(() => {
    const ensureSocketConnected = async () => {
      if (!isConnected && !isConnecting) {
        // console.log('Socket not connected, attempting to connect...');
        try {
          await connect();
          // console.log('Socket connected successfully');
          
          // If we have an inquiryId, subscribe to it after connection
          if (inquiryId) {
            subscribeToInquiry(inquiryId);
            // Mark as read via REST API
            inquiryApi.markAsRead(inquiryId).catch(
              err => {}
              // console.error('Failed to mark as read:', err)
            );
          }
        } catch (error) {
          // console.error('Failed to connect socket:', error);
          // Don't show error toast here, just log it
        }
      }
    };

    ensureSocketConnected();
  }, [isConnected, isConnecting, connect, inquiryId, subscribeToInquiry]);

  // Set up socket listeners for new messages
  useEffect(() => {
    getPermission();

    // Set up message received listener for new messages via socket
    const handleMessageReceived = (data: { 
      message: SocketMessage; 
      inquiryId: string; 
      unreadCount?: number; 
      totalUnreadCount?: number;
    }) => {
      // Only handle messages for the current inquiry
      if (data.inquiryId === inquiryId) {
        const newMessage = convertSocketMessage(data.message);
        // Check if message already exists to avoid duplicates
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === newMessage.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, newMessage];
        });
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    };

    onMessageReceived(handleMessageReceived);

    // Note: Inquiry updates and creation are now handled via REST API, not socket

    // Cleanup
    return () => {
      if (inquiryId) {
        unsubscribeFromInquiry(inquiryId);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [
    route.params?.inquiryId, 
    isConnected,
    isConnecting,
    inquiryId,
    subscribeToInquiry,
    unsubscribeFromInquiry,
    onMessageReceived,
    showToast,
  ]);

  const getPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      // console.error('Error requesting audio permission:', error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    try {
      if (hasPermission !== true) {
        Alert.alert('Permission Required', 'Microphone permission is required for voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setIsListening(true);
      setListeningText(t('chat.listening'));
    } catch (error) {
      // console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        // TODO: Integrate with a real speech-to-text service like:
        // - Google Cloud Speech-to-Text
        // - Azure Cognitive Services Speech
        // - AWS Transcribe
        // - Or use a React Native library like @react-native-voice/voice
        
        // For now, we'll simulate the transcription
        // console.log('Audio recorded at:', uri);
        setTimeout(() => {
          setListeningText("I need buy some shoes but im confuse which one is fit for me, could you help me?");
        }, 1000);
      }
    } catch (error) {
      // console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // Only send message if inquiryId exists
    if (inquiryId) {
      // Ensure socket is connected
      if (!isConnected) {
        try {
          await connect();
        } catch (error) {
          // console.error('Failed to connect socket:', error);
          showToast('Failed to connect. Please try again.', 'error');
          return;
        }
      }

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
        senderName: (user as any)?.user_id || user?.email || 'You',
        senderId: (user as any)?._id || (user as any)?.id,
        readBy: [],
      };

      // Add optimistic message to UI immediately
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const messageExists = prev.some(msg => msg.id === optimisticMessage.id);
        if (messageExists) {
          return prev;
        }
        return [...prev, optimisticMessage];
      });

      const messageText = inputText.trim();
      setInputText('');

      // Send message via socket
      try {
        socketService.sendMessage(inquiryId, messageText);
        showToast('Message sent', 'success');
      } catch (error) {
        // console.error('Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        showToast('Failed to send message. Please try again.', 'error');
      }
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } else {
      showToast('Inquiry not found. Please try again.', 'error');
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleConfirmListening = () => {
    setInputText(listeningText);
    setIsListening(false);
    setListeningText('');
  };

  const handleCancelListening = async () => {
    if (isRecording) {
      await stopRecording();
    }
    setIsListening(false);
    setListeningText('');
  };

  const handleMoreOptions = () => {
    setShowMoreModal(true);
  };

  const handleCloseMoreModal = () => {
    setShowMoreModal(false);
  };

  const handleMoreOptionPress = async (option: string) => {
    // console.log(`${option} option pressed`);
    setShowMoreModal(false);
    
    if (option === 'Gallery') {
      await openGallery();
    } else if (option === 'Camera') {
      await openCamera();
    }
  };

  const openGallery = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera roll permissions to access your gallery.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        // console.log('Selected image:', imageUri);
        
        // TODO: Send image as message
        // For now, we'll add it as a text message indicating image was selected
        const imageMessage: Message = {
          id: Date.now().toString(),
          text: `📷 Image selected: ${result.assets[0].fileName || 'image.jpg'}`,
          isUser: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, imageMessage]);
        
        // Simulate response
        setTimeout(() => {
          const response: Message = {
            id: (Date.now() + 1).toString(),
            text: "Nice image! How can I help you with that?",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response]);
        }, 1000);
      }
    } catch (error) {
      // console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const openCamera = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Sorry, we need camera permissions to take photos.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        // console.log('Captured image:', imageUri);
        
        // TODO: Send image as message
        // For now, we'll add it as a text message indicating photo was taken
        const imageMessage: Message = {
          id: Date.now().toString(),
          text: `📸 Photo taken: ${result.assets[0].fileName || 'photo.jpg'}`,
          isUser: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, imageMessage]);
        
        // Simulate response
        setTimeout(() => {
          const response: Message = {
            id: (Date.now() + 1).toString(),
            text: "Great photo! What would you like to know about it?",
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, response]);
        }, 1000);
      }
    } catch (error) {
      // console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  // Format date for grouping (YYYY-MM-DD)
  const formatDateForGrouping = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Format date for display (e.g., "Today", "Yesterday", "Dec 15, 2024")
  const formatDateForDisplay = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (dateStr === todayStr) {
      return 'Today';
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Format time for display (e.g., "10:30 AM")
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Check if message is read (for user messages, check if admin has read it)
  const isMessageRead = (message: Message): boolean => {
    if (!message.isUser || !message.readBy || !user) {
      return false;
    }
    // For user messages, check if any admin has read it (readBy contains admin IDs, not user ID)
    // If readBy array has items and user's ID is not in it, it means admin has read it
    const userId = (user as any)?._id || (user as any)?.id;
    return message.readBy.length > 0 && userId && !message.readBy.includes(userId);
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]): Array<{ date: string; messages: Message[] }> => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const dateKey = formatDateForGrouping(message.timestamp);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    // Convert to array and sort by date (oldest first)
    return Object.keys(groups)
      .sort()
      .map((dateKey) => ({
        date: dateKey,
        messages: groups[dateKey],
      }));
  };

  const renderDateHeader = (date: string) => {
    const dateObj = new Date(date);
    return (
      <View key={`date-${date}`} style={styles.dateHeaderContainer}>
        <View style={styles.dateHeaderLine} />
        <Text style={styles.dateHeaderText}>{formatDateForDisplay(dateObj)}</Text>
        <View style={styles.dateHeaderLine} />
      </View>
    );
  };

  const renderMessage = (message: Message, showName: boolean = false) => (
    <View key={message.id} style={message.isUser ? styles.userMessageContainer : styles.sellerMessageContainer}>
      {!message.isUser && showName && message.senderName && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <View style={message.isUser ? styles.userMessage : styles.sellerMessage}>
        <Text style={message.isUser ? styles.userMessageText : styles.sellerMessageText}>
          {message.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
          {message.isUser && isMessageRead(message) && (
            <Ionicons name="checkmark-done" size={14} color={COLORS.primary} style={styles.readIcon} />
          )}
          {message.isUser && !isMessageRead(message) && (
            <Ionicons name="checkmark" size={14} color={COLORS.gray[400]} style={styles.readIcon} />
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
        </TouchableOpacity>
        
        <View style={styles.sellerInfo}>
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>
              {orderNumber ? `Order: ${orderNumber}` : 
               (route.params?.userId ? `${t('chat.seller')} ${route.params.userId}` : t('chat.rolandOfficialShop'))}
            </Text>
          </View>
        </View>
        
        <View style={styles.backButton} />
      </View>

      {/* Messages */}
      {isLoading || (!isConnected && isConnecting) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {isConnecting ? 'Connecting to server...' : 'Connecting to support...'}
          </Text>
        </View>
      ) : !isConnected ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Not connected. Please wait...</Text>
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesList} 
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && inquiryId ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No messages yet. Start the conversation...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Inquiry not found</Text>
            </View>
          ) : (
            (() => {
              const groupedMessages = groupMessagesByDate(messages);
              return groupedMessages.flatMap((group) => [
                renderDateHeader(group.date),
                ...group.messages.map((message, index) => {
                  // Show name if it's the first message from this sender in a group, or if previous message is from different sender
                  const prevMessage = index > 0 ? group.messages[index - 1] : null;
                  const showName = !message.isUser && (
                    !prevMessage || 
                    prevMessage.senderId !== message.senderId ||
                    new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 5 * 60 * 1000 // 5 minutes gap
                  );
                  return renderMessage(message, showName);
                }),
              ]);
            })()
          )}
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={[styles.inputBar, isListening && styles.listeningBar]}>
          {!isListening ? (
            <>
              <TouchableOpacity style={styles.attachButton} onPress={handleMoreOptions}>
                <Ionicons name="add" size={20} color={COLORS.black} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.textInput}
                placeholder={t('chat.typeMessage')}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                placeholderTextColor={COLORS.gray[400]}
              />
              
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  { 
                    backgroundColor: inputText.trim() ? COLORS.red : COLORS.gray[200],
                  }
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={18} 
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.listeningText}>
                {isRecording ? t('chat.recording') : (listeningText || t('chat.listening'))}
              </Text>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmListening}
              >
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* More Options Modal */}
      <Modal
        visible={showMoreModal}
        statusBarTranslucent={true}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseMoreModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={handleCloseMoreModal}
          >
            <View style={styles.stickbar} />
          </TouchableOpacity>
          <View style={styles.modalContainer}>
            {/* <View style={styles.modalHandle} /> */}
            <Text style={styles.modalTitle}>{t('chat.more')}</Text>
            
            <View style={styles.optionsGrid}>
              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => handleMoreOptionPress('Gallery')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="images-outline" size={24} color={COLORS.text.primary} />
                </View>
                <Text style={styles.optionText}>{t('chat.gallery')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => handleMoreOptionPress('Camera')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="camera-outline" size={24} color={COLORS.text.primary} />
                </View>
                <Text style={styles.optionText}>{t('chat.camera')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: 50, // Space from top screen
    paddingBottom: SPACING.md,
    backgroundColor: 'transparent',
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
  sellerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.red,
    marginRight: SPACING.sm,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  sellerStatus: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messagesList: {
    flex: 1,
    marginTop: 100, // Space for fixed header
    marginBottom: 100, // Space for fixed bottom input
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.sm,
  },
  sellerMessageContainer: {
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  userMessage: {
    backgroundColor: '#FFDCEC', // User chat message background color
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '95%',
  },
  sellerMessage: {
    backgroundColor: COLORS.gray[100], // Original seller message color
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  userMessageText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary, // Dark text on light pink background
  },
  sellerMessageText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary, // Dark text on gray background
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 50, // Space from bottom screen
    backgroundColor: 'transparent',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
  },
  listeningBar: {
    borderColor: COLORS.red,
  },
  listeningText: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.red,
    marginHorizontal: 8,
  },
  confirmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: COLORS.error, // Red when recording
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 34, // Space for home indicator
    paddingHorizontal: SPACING.lg,
    maxHeight: '50%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '24%',
    aspectRatio: 1,
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
  },
  optionIcon: {
    marginBottom: SPACING.sm,
  },
  optionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  attachButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F9FAFB', // Light grey circle
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.primary,
    padding: 0,
    marginHorizontal: 8,
    maxHeight: 80,
    marginBottom: SPACING.xs,
    // height: 32,
  },
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.red, // Pink circle
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[200], // Light grey circle (will change to pink when text is present)
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickbar: {
    width: '10%',
    height: 15,
    borderTopColor: COLORS.white,
    borderTopWidth: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyStateText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  // Date header styles
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  dateHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dateHeaderText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginHorizontal: SPACING.sm,
    fontWeight: '500',
  },
  // Sender name styles
  senderName: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[600],
    marginBottom: SPACING.xs,
    marginLeft: SPACING.sm,
    fontWeight: '500',
  },
  // Message footer styles
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  messageFooterUser: {
    justifyContent: 'flex-end',
  },
  messageFooterSeller: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
    marginRight: SPACING.xs,
  },
  readIcon: {
    marginLeft: SPACING.xs,
  },
});

export default ChatScreen;