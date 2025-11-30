import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, SHADOWS } from '../../constants';
import { RootStackParamList } from '../../types';

// Conditional import for Pusher - only import if available
let Pusher: any;
let pusherImportError: Error | null = null;

try {
  Pusher = require('pusher-js/react-native').default;
  console.log("Pusher successfully imported:", !!Pusher);
} catch (error: any) {
  pusherImportError = error;
  console.warn('Pusher import failed:', error);
  Pusher = null;
}

type PusherTestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PusherTest'>;

const PusherTestScreen: React.FC = () => {
  const navigation = useNavigation<PusherTestScreenNavigationProp>();
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [events, setEvents] = useState<any[]>([]);
  const [channelName, setChannelName] = useState('chat'); // Channel is set to 'chat' by default
  const [receiverId, setReceiverId] = useState('10026');
  const [message, setMessage] = useState('Hello');
  const [isLoading, setIsLoading] = useState(false);
  const [pusherAvailable, setPusherAvailable] = useState(!!Pusher);
  
  const pusherRef = useRef<any>(null);
  const channelRef = useRef<any>(null);

  // Initialize Pusher
  useEffect(() => {
    console.log("Pusher availability check:", {
      pusherExists: !!Pusher,
      pusherImportError: pusherImportError?.message,
      pusherType: typeof Pusher
    });
    
    if (!Pusher) {
      setPusherAvailable(false);
      return;
    }
    
    initializePusher();
    
    return () => {
      disconnectPusher();
    };
  }, []);

  const initializePusher = () => {
    if (!Pusher) {
      Alert.alert('Error', 'Pusher library not available');
      return;
    }
    
    try {
      // Initialize Pusher client
      const pusher = new Pusher('6991c28155c07cda6297', {
        cluster: 'us2',
        forceTLS: true,
      });
      
      pusherRef.current = pusher;
      
      // Connection state changes
      pusher.connection.bind('state_change', (states: any) => {
        console.log('Pusher connection state changed:', states);
        setConnectionStatus(states.current);
      });
      
      // Connection error
      pusher.connection.bind('error', (error: any) => {
        console.error('Pusher connection error:', error);
        setConnectionStatus('error');
      });
      
      setConnectionStatus('initialized');
    } catch (error) {
      console.error('Error initializing Pusher:', error);
      setConnectionStatus('error');
      Alert.alert('Error', 'Failed to initialize Pusher');
    }
  };

  const connectToChannel = () => {
    if (!pusherRef.current) {
      Alert.alert('Error', 'Pusher not initialized');
      return;
    }
    
    try {
      // Disconnect from previous channel if connected
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      
      // Subscribe to channel
      const channel = pusherRef.current.subscribe(channelName);
      channelRef.current = channel;
      
      // Bind to all events on the channel
      channel.bind('message.sent', (data: any) => {
        console.log('Received message.sent event:', data);
        const newEvent = {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          event: 'message.sent',
          channel: channelName,
          data: data,
        };
        setEvents(prev => [newEvent, ...prev]);
        
        // Show alert for the received event
        Alert.alert(
          `New Message: ${data.message}`,
          `From: ${data.sender_id}\nTo: ${data.receiver_id}`,
          [{ text: 'OK' }]
        );
      });
      
      // Channel subscription succeeded
      channel.bind('pusher:subscription_succeeded', () => {
        console.log('Successfully subscribed to channel:', channelName);
        setConnectionStatus('subscribed');
        Alert.alert('Success', `Subscribed to channel: ${channelName}`);
      });
      
      // Channel subscription error
      channel.bind('pusher:subscription_error', (error: any) => {
        console.error('Channel subscription error:', error);
        setConnectionStatus('subscription_error');
        Alert.alert('Error', `Failed to subscribe to channel: ${channelName}`);
      });
      
    } catch (error) {
      console.error('Error subscribing to channel:', error);
      Alert.alert('Error', 'Failed to subscribe to channel');
    }
  };

  const disconnectPusher = () => {
    try {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
      
      setConnectionStatus('disconnected');
    } catch (error) {
      console.error('Error disconnecting Pusher:', error);
    }
  };

  const sendTestMessage = async () => {
    if (!receiverId.trim()) {
      Alert.alert('Error', 'Please enter a receiver ID');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
    
    setIsLoading(true);
    try {
      // Send test message to your Laravel backend
      const response = await fetch('http://221.138.36.200:5000/api/v1/customer/message/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth headers if needed
          // 'Authorization': 'Bearer YOUR_TOKEN',
        },
        body: JSON.stringify({
          receiver_id: parseInt(receiverId),
          message: message,
        }),
      });
      
      if (response.ok) {
        const responseData = await response.json();
        Alert.alert('Success', 'Message sent to backend successfully');
        console.log('Message sent response:', responseData);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `Failed to send message: ${errorData.message || response.statusText}`);
      }
    } catch (error: any) {
      console.error('Error sending test message:', error);
      Alert.alert('Error', `Failed to send test message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return COLORS.success;
      case 'disconnected': return COLORS.error;
      case 'error': return COLORS.error;
      case 'subscription_error': return COLORS.error;
      case 'subscribed': return COLORS.success;
      default: return COLORS.warning;
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Pusher Chat Test</Text>
      <View style={styles.headerSpacer} />
    </View>
  );

  if (!pusherAvailable) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Pusher Not Available</Text>
            <Text style={styles.errorText}>
              The Pusher library is not available in this environment.
            </Text>
            {pusherImportError && (
              <Text style={styles.errorText}>
                Import Error: {pusherImportError.message}
              </Text>
            )}
            <Text style={styles.errorText}>
              This could be due to:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Using Expo Go (which doesn't support all native modules)</Text>
              <Text style={styles.bulletPoint}>• Missing native dependencies</Text>
              <Text style={styles.bulletPoint}>• Incorrect installation</Text>
            </View>
            <Text style={styles.errorText}>
              Solutions:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>1. Run: npx expo prebuild</Text>
              <Text style={styles.bulletPoint}>2. Run: npx expo run:android (or run:ios)</Text>
              <Text style={styles.bulletPoint}>3. Or create a development build</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const renderStatus = () => (
    <View style={styles.statusContainer}>
      <View style={[styles.statusIndicator, { backgroundColor: getConnectionStatusColor() }]} />
      <Text style={styles.statusText}>
        Status: <Text style={{ fontWeight: 'bold' }}>{connectionStatus}</Text>
      </Text>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Channel Name</Text>
        <TextInput
          style={styles.input}
          value={channelName}
          onChangeText={setChannelName}
          placeholder="Enter channel name"
        />
      </View>
      
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={connectToChannel}
          disabled={connectionStatus === 'subscribed'}
        >
          <Text style={styles.buttonText}>Subscribe to Channel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={disconnectPusher}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSendMessage = () => (
    <View style={styles.testEventContainer}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Receiver ID</Text>
        <TextInput
          style={styles.input}
          value={receiverId}
          onChangeText={setReceiverId}
          placeholder="Enter receiver ID"
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter message"
          multiline
          numberOfLines={3}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton, styles.sendButton]}
        onPress={sendTestMessage}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Send Message</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderEvents = () => (
    <View style={styles.eventsContainer}>
      <View style={styles.eventsHeader}>
        <Text style={styles.eventsTitle}>Received Messages</Text>
        {events.length > 0 && (
          <TouchableOpacity onPress={clearEvents}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {events.length === 0 ? (
        <View style={styles.emptyEvents}>
          <Text style={styles.emptyEventsText}>No messages received yet</Text>
          <Text style={[styles.emptyEventsText, { fontSize: FONTS.sizes.sm, marginTop: SPACING.sm }]}>
            Subscribe to the 'chat' channel and send a message to see events here
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.eventsList}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventName}>{event.event}</Text>
                <Text style={styles.eventTime}>{event.timestamp}</Text>
              </View>
              <Text style={styles.eventChannel}>Channel: {event.channel}</Text>
              <Text style={styles.eventData}>{JSON.stringify(event.data, null, 2)}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatus()}
        {renderControls()}
        {renderSendMessage()}
        {renderEvents()}
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
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  bulletPoints: {
    alignSelf: 'flex-start',
    marginVertical: SPACING.sm,
  },
  bulletPoint: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  controlsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.accentPink,
    marginRight: SPACING.sm,
  },
  secondaryButton: {
    backgroundColor: COLORS.gray[200],
    marginLeft: SPACING.sm,
  },
  buttonText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  testEventContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  sendButton: {
    marginTop: SPACING.sm,
  },
  eventsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    ...SHADOWS.small,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200],
  },
  eventsTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  clearText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    fontWeight: '600',
  },
  emptyEvents: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyEventsText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray[500],
  },
  eventsList: {
    maxHeight: 300,
  },
  eventItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  eventName: {
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  eventTime: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
  eventChannel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.accentPink,
    marginBottom: SPACING.xs,
  },
  eventData: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
});

export default PusherTestScreen;