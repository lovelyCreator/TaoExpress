import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS, SPACING } from '../../constants';
import { RootStackParamList } from '../../types';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatScreen: React.FC = () => {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  
  console.log('ChatScreen rendered with params:', route.params);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello and welcome to Roland Official Shop! We're thrilled to have you here. If you have any questions or need assistance, feel free to ask. Happy shopping!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listeningText, setListeningText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showMoreModal, setShowMoreModal] = useState(false);

  useEffect(() => {
    getPermission();

    
    // Check if we have a storeId from navigation
    if (route.params?.storeId) {
      console.log('Chat with store ID:', route.params.storeId);
      // You can use this storeId to fetch store information or customize the chat
    }
    
    // Check if we have a userId from navigation
    if (route.params?.userId) {
      console.log('Chat with user ID:', route.params.userId);
      // You can use this userId to fetch user information or customize the chat
    }
    
    // Check if we have a productId from navigation (when user selected a product)
    if (route.params?.productId) {
      // Add an automatic message about the selected product
      const productMessage: Message = {
        id: Date.now().toString(),
        text: `I'm interested in this product (ID: ${route.params.productId}). Can you tell me more about it?`,
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, productMessage]);
      
      // Simulate seller response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: "Great choice! I'd be happy to help you with information about this product. What would you like to know?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
    
    // Check if we have an orderId from navigation (when user selected an order)
    if (route.params?.orderId) {
      // Add an automatic message about the selected order
      const orderMessage: Message = {
        id: Date.now().toString(),
        text: `I have a question about my order (ID: ${route.params.orderId}). Can you help me with the status?`,
        isUser: true,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, orderMessage]);
      
      // Simulate seller response
      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          text: "Of course! Let me check your order details. Your order has been sent and should arrive within 2-3 business days. Is there anything specific you'd like to know?",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, response]);
      }, 1000);
    }
    
    // Cleanup recording on unmount
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [route.params?.storeId, route.params?.userId, route.params?.productId, route.params?.orderId]);

  const getPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (error) {
      console.error('Error requesting audio permission:', error);
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
      setListeningText('Listening...');
    } catch (error) {
      console.error('Failed to start recording:', error);
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
        console.log('Audio recorded at:', uri);
        setTimeout(() => {
          setListeningText("I need buy some shoes but im confuse which one is fit for me, could you help me?");
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Simulate response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sure! Got it",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
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
    console.log(`${option} option pressed`);
    setShowMoreModal(false);
    
    if (option === 'Gallery') {
      await openGallery();
    } else if (option === 'Camera') {
      await openCamera();
    } else if (option === 'Products') {
      // Navigate to ChatProducts screen with sellerId
      navigation.navigate('ChatProducts', { 
        sellerId: route.params?.storeId
      });
    } else if (option === 'Order') {
      // Navigate to ChatOrders screen
      navigation.navigate('ChatOrders');
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
        console.log('Selected image:', imageUri);
        
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
      console.error('Error opening gallery:', error);
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
        console.log('Captured image:', imageUri);
        
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
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const renderMessage = (message: Message) => (
    <View key={message.id} style={message.isUser ? styles.userMessageContainer : styles.sellerMessageContainer}>
      <View style={message.isUser ? styles.userMessage : styles.sellerMessage}>
        <Text style={message.isUser ? styles.userMessageText : styles.sellerMessageText}>
          {message.text}
        </Text>
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
          <View style={styles.sellerAvatar} />
          <View style={styles.sellerDetails}>
            <Text style={styles.sellerName}>
              {route.params?.userId ? `Seller ${route.params.userId}` : 'Roland Official Shop'}
            </Text>
            <Text style={styles.sellerStatus}>Active 26 seconds ago</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.backButton} activeOpacity={0.85}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        style={styles.messagesList} 
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

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
                placeholder="Typing here..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                placeholderTextColor={COLORS.gray[400]}
              />
              
              <TouchableOpacity 
                style={[styles.voiceButton, isRecording && styles.recordingButton]} 
                onPress={handleVoiceInput}
              >
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={18} 
                  color={COLORS.white} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.sendButton, 
                  { 
                    backgroundColor: inputText.trim() ? COLORS.accentPink : COLORS.gray[200],
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
                {isRecording ? "Recording..." : (listeningText || "Listening...")}
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
            <Text style={styles.modalTitle}>More</Text>
            
            <View style={styles.optionsGrid}>
              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => handleMoreOptionPress('Gallery')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="images-outline" size={24} color={COLORS.text.primary} />
                </View>
                <Text style={styles.optionText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => handleMoreOptionPress('Camera')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="camera-outline" size={24} color={COLORS.text.primary} />
                </View>
                <Text style={styles.optionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => handleMoreOptionPress('Products')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="cube-outline" size={24} color={COLORS.text.primary} />
                </View>
                <Text style={styles.optionText}>Products</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.optionButton} 
                onPress={() => handleMoreOptionPress('Order')}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="document-text-outline" size={24} color={COLORS.text.primary} />
                </View>
                <Text style={styles.optionText}>Order</Text>
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
    backgroundColor: COLORS.accentPink,
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
    borderColor: COLORS.accentPink,
  },
  listeningText: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.accentPink,
    marginHorizontal: 8,
  },
  confirmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentPink,
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
    backgroundColor: COLORS.accentPink, // Pink circle
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
});

export default ChatScreen;