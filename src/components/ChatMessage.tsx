import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface ChatMessageProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
  style?: object;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  text,
  isUser,
  timestamp,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userMessageContainer : styles.otherMessageContainer,
        style,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.otherText,
          ]}
        >
          {text}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
  },
  otherBubble: {
    backgroundColor: COLORS.gray[100],
  },
  messageText: {
    fontSize: FONTS.sizes.md,
  },
  userText: {
    color: COLORS.white,
  },
  otherText: {
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
    alignSelf: 'flex-end',
  },
});

export default ChatMessage;