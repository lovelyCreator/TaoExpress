import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { CustomSwitchProps, RootStackParamList } from '../../types';

type ChatSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ChatSettings'>;

interface ChatSettings {
  auto_reply: boolean;
}

const ChatSettingsScreen: React.FC = () => {
  const navigation = useNavigation<ChatSettingsScreenNavigationProp>();
  
  const [settings, setSettings] = useState<ChatSettings>({
    auto_reply: true,
  });
  const [message, setMessage] = useState("");

  const handleInputChange = (value: string) => {
      setMessage(value);
  };

  const handleSettingChange = (key: keyof ChatSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save to the API
    Alert.alert('Success', 'Your chat settings have been saved.');
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all chat settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
                auto_reply: true,
            });
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chat Settings</Text>
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetSettings}
      >
        {/* <Text style={styles.resetButtonText}>Reset</Text> */}
      </TouchableOpacity>
    </View>
  );


  const CustomSwitch: React.FC<CustomSwitchProps> = ({
    value,
    onChange,
    activeColor = "#ff007f",
    inactiveColor = "#ccc",
    style,
  }) => {
    const [animation] = useState(new Animated.Value(value ? 1 : 0));

    useEffect(() => {
      Animated.timing(animation, {
        toValue: value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [value]);

    const interpolateBackground = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [inactiveColor, activeColor],
    });

    const translateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [2, 22],
    });

    const toggleSwitch = () => {
      onChange(!value);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleSwitch}
        style={style}
      >
        <Animated.View
          style={[
            styles.switchBackground,
            { backgroundColor: interpolateBackground },
          ]}
        >
          <Animated.View
            style={[
              styles.circle,
              { transform: [{ translateX }] },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  };


  const renderToggleItem = (
    title: string,
    // description: string,
    key: keyof ChatSettings
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {/* <Text style={styles.settingDescription}>{description}</Text> */}
      </View>
      {/* <Switch
        trackColor={{ false: COLORS.gray[300], true: COLORS.primary }}
        thumbColor={settings[key] ? COLORS.white : COLORS.white}
        ios_backgroundColor={COLORS.gray[300]}
        onValueChange={(value) => handleSettingChange(key, value)}
        value={settings[key]}
      /> */}
      <CustomSwitch
        value={settings[key]}
        onChange={() => handleSettingChange(key, !settings[key])}
        activeColor={COLORS.accentPink}
        inactiveColor={COLORS.gray[300]}
      />
    </View>
  );


  const renderMessage = () => (
    <View style={styles.sections}>
      <Text style={styles.sectionTitle}>Message</Text>
      
      <View style={styles.inputGroup}>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Enter your auto-reply chat"
          value={message}
          onChangeText={(value) => handleInputChange(value)}
          multiline
          numberOfLines={4}
        />
      </View>
    </View>
  );

  const renderSaveButton = () => (
    <View style={styles.saveButtonContainer}>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            {renderToggleItem(
              'Send auto-reply in chat',
              'auto_reply'
            )}
          </View>
        </View>
        {renderMessage()}
        {renderSaveButton()}
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
    padding: SPACING.md,
    paddingTop: SPACING.xl,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    // marginLeft: 'auto',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: SPACING.xs,
  },
  resetButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: SPACING.md,
  },
  sectionContent: {
    // paddingHorizontal: SPACING.md,
    // paddingVertical: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.smmd,
    backgroundColor: COLORS.gray[50],
    marginBottom: SPACING.smmd,
    borderRadius: BORDER_RADIUS.md,
  },
  sections: {
    marginHorizontal: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  settingDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  saveButtonContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    // borderTopWidth: 1,
    // borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.black,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  inputGroup: {
    // marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray[50],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchBackground: {
    width: SPACING['2xl'],
    height: SPACING.lg,
    borderRadius: 20,
    justifyContent: "center",
    padding: 2,
  },
  circle: {
    width: SPACING.mdlg,
    height: SPACING.mdlg,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
  },
});

export default ChatSettingsScreen;