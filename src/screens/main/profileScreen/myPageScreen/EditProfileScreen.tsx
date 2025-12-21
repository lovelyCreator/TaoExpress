import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, FONTS, SPACING } from '../../../../constants';
import { RootStackParamList } from '../../../../types';
import { useAuth } from '../../../../context/AuthContext';
import { useAppSelector } from '../../../../store/hooks';
import { translations } from '../../../../i18n/translations';
import { useUpdateProfileMutation } from '../../../../hooks/useUpdateProfileMutation';
import ImagePickerModal from '../../../../components/ImagePickerModal';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, updateUser } = useAuth();
  const locale = useAppSelector((state) => state.i18n.locale) as 'en' | 'ko' | 'zh';
  
  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };
  
  const [formData, setFormData] = useState({
    id: user?.name || '', // ID is the user's name
    email: user?.email || '',
  });
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedPictureUri, setSelectedPictureUri] = useState<string | null>(null);
  
  const { mutate: updateProfile, isLoading: loading } = useUpdateProfileMutation({
    onSuccess: async (data) => {
      // User context is already updated in the hook, so we just show success
      Alert.alert(t('shareApp.success'), t('profile.profileUpdated'), [
        { text: t('profile.ok'), onPress: () => navigation.goBack() }
      ]);
    },
    onError: (error) => {
      Alert.alert(t('common.error'), error || t('profile.failedToUpdateProfile'));
    },
  });
  
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      // Use existing user data from context
      if (user) {
        setFormData({
          id: user.name || '',
          email: user.email || '',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'id':
        return value.trim() ? '' : t('profile.idRequired');
      case 'email':
        if (!value.trim()) return t('profile.emailRequired');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t('profile.validEmailRequired');
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleImageSelected = async (uri: string) => {
    setSelectedPictureUri(uri);
    setShowImagePicker(false);
  };

  const handleTakePhoto = async () => {
    const ImagePicker = require('expo-image-picker');
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', t('profile.cameraPermissionRequired'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await handleImageSelected(result.assets[0].uri);
    } else {
      setShowImagePicker(false);
    }
  };

  const handleChooseFromGallery = async () => {
    const ImagePicker = require('expo-image-picker');
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', t('profile.galleryPermissionRequired'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await handleImageSelected(result.assets[0].uri);
    } else {
      setShowImagePicker(false);
    }
  };

  const handleSave = async () => {
    const newTouched = { id: true, email: true };
    setTouched(newTouched);
    
    if (!validateForm()) return;
    
    try {
      // Prepare update request
      const updateRequest: any = {
        user_id: formData.id,
      };
      
      // Add picture if selected
      if (selectedPictureUri) {
        updateRequest.picture = selectedPictureUri;
      }
      
      // Update profile via API
      updateProfile(updateRequest);
      
      // Also update email locally (since API doesn't support email updates)
      await updateUser({
        name: formData.id,
        email: formData.email,
      });
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.failedToUpdateProfile'));
    }
  };

  const renderHeader = () => (
    // <LinearGradient
    //   colors={['#FFE4E6', '#FFF0F1', '#FFFFFF']}
    <View
      style={styles.header}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t('profile.editProfileTitle')}</Text>
      <View style={styles.placeholder} />
    {/* </LinearGradient> */}
    </View>
  );

  const renderForm = () => (
    <View style={styles.formContainer}>
      <View style={styles.formCard}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={
                selectedPictureUri
                  ? { uri: selectedPictureUri }
                  : user?.avatar
                  ? { uri: user.avatar }
                  : require('../../../../assets/images/avatar.png')
              }
              style={styles.avatar}
            />
            <View style={styles.avatarBorder} />
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => setShowImagePicker(true)}
              disabled={loading || loadingProfile}
            >
              <Ionicons name="camera" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePictureText}>{t('profile.changePicture')}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('profile.id')}</Text>
          <View style={[styles.inputWrapper, errors.id && touched.id && styles.inputError]}>
            <RNTextInput
              style={styles.input}
              placeholder={t('profile.enterId')}
              value={formData.id}
              onChangeText={(text) => handleChange('id', text)}
              onBlur={() => handleBlur('id')}
              placeholderTextColor={COLORS.text.secondary}
              editable={!loadingProfile && !loading}
            />
          </View>
          {errors.id && touched.id && (
            <Text style={styles.errorText}>{errors.id}</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <View style={[styles.inputWrapper, errors.email && touched.email && styles.inputError]}>
            <RNTextInput
              style={styles.input}
              placeholder={t('profile.enterEmail')}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              onBlur={() => handleBlur('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.text.secondary}
              editable={!loadingProfile && !loading}
            />
          </View>
          {errors.email && touched.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading || loadingProfile}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>{t('profile.saveChanges')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B9D" />
          <Text style={styles.loadingText}>{t('profile.loadingProfile')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderForm()}
      </ScrollView>

      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onTakePhoto={handleTakePhoto}
        onChooseFromGallery={handleChooseFromGallery}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.text.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    paddingTop: SPACING['2xl'],
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
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formContainer: {
    marginTop: -20,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.md,
    padding: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray[200],
  },
  avatarBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 3,
    borderColor: '#FF9A9E',
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B9D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  changePictureText: {
    fontSize: FONTS.sizes.md,
    color: '#FF6B9D',
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    backgroundColor: COLORS.gray[50],
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    height: 50,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  input: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text.primary,
    padding: 0,
  },
  errorText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  saveButton: {
    backgroundColor: COLORS.error,
    borderRadius: 999,
    paddingVertical: SPACING.smmd,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveButtonText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default EditProfileScreen;
