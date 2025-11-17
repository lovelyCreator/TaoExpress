import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { RootStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';
import { userProfileApi } from '../services/userProfileApi';

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;
const { width, height } = Dimensions.get('window');

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '', // Add phone field
    birthday: user?.birthday || '',
    avatar: user?.avatar || null,
  });
  console.log("USER INFORMATION: ", user);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
        }
      }
      
      // Load user profile data
      loadUserProfile();
    })();
  }, []);

  const loadUserProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await userProfileApi.getUserProfile();
      if (response.success) {
        const profileData = response.data;
        setFormData({
          name: profileData.f_name + (profileData.l_name ? ` ${profileData.l_name}` : ''),
          email: profileData.email,
          phone: profileData.phone || '', // Set phone from profile data
          birthday: profileData.birthday || '',
          avatar: profileData.image || null,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to load profile data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';
      case 'phone':
        // Phone is optional, but if provided, validate basic format
        if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) return 'Please enter a valid phone number';
        return '';
      case 'birthday':
        // Basic date format validation (MM/DD/YYYY)
        if (value && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) return 'Please enter a valid date (MM/DD/YYYY)';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'avatar') {
        const fieldValue = formData[key as keyof typeof formData];
        const error = validateField(key, fieldValue !== null ? fieldValue : '');
        if (error) newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (name: string) => {
    setTouched({ ...touched, [name]: true });
    const fieldValue = formData[name as keyof typeof formData];
    const error = validateField(name, fieldValue !== null ? fieldValue : '');
    setErrors({ ...errors, [name]: error });
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSave = async () => {
    // Mark all fields as touched
    const newTouched = { name: true, email: true, phone: true, birthday: true };
    setTouched(newTouched);
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare data for update
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined, // Include phone in update data
        birthday: formData.birthday || undefined,
        image: formData.avatar || undefined,
      };

      const response = await userProfileApi.updateProfile(updateData);
      
      if (response.success) {
        // Update the auth context with new data
        await updateUser({
          name: formData.name,
          email: formData.email,
          birthday: formData.birthday,
          avatar: formData.avatar || undefined,
        });
        
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Upload the image to Cloudinary
        setUploadingImage(true);
        const uploadResult = await userProfileApi.uploadImage(result.assets[0].uri);
        
        if (uploadResult.success && uploadResult.url) {
          // Update the avatar with the Cloudinary URL
          setFormData({ ...formData, avatar: uploadResult.url });
          // Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          Alert.alert('Error', uploadResult.error || 'Failed to upload image. Please try again.');
        }
        setUploadingImage(false);
      }
    } catch (error) {
      setUploadingImage(false);
      Alert.alert('Error', 'Failed to change avatar. Please try again.');
    }
  };

  const handleRemoveAvatar = () => {
    setFormData({ ...formData, avatar: null });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>My Details</Text>
      <View style={{width: 40}} />
    </View>
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        <Image
          source={formData.avatar ? { uri: formData.avatar } : require('../assets/images/avatar.png')}
          style={styles.avatar}
        />
        <TouchableOpacity
          style={styles.changeAvatarButton}
          onPress={handleChangeAvatar}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="camera" size={20} color={COLORS.white} />
          )}
        </TouchableOpacity>
        {formData.avatar && (
          <TouchableOpacity
            style={styles.removeAvatarButton}
            onPress={handleRemoveAvatar}
            disabled={uploadingImage}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.avatarText}>
        {uploadingImage ? 'Uploading image...' : 'Tap to change photo'}
      </Text>
    </View>
  );

  const renderForm = () => (
    <View style={styles.form}>
      <View style={styles.inputContainer}>
        {/* <Text style={styles.label}>Phone Number</Text>
        <View style={[styles.inputWrapper, errors.phone && touched.phone && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
            onBlur={() => handleBlur('phone')}
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.text.secondary}
            editable={!loadingProfile && !loading && !uploadingImage}
          />
        </View>
        {errors.phone && touched.phone && <Text style={styles.errorText}>{errors.phone}</Text>} */}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputWrapper, errors.email && touched.email && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            onBlur={() => handleBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={COLORS.text.secondary}
            editable={!loadingProfile && !loading && !uploadingImage}
          />
        </View>
        {errors.email && touched.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name</Text>
        <View style={[styles.inputWrapper, errors.name && touched.name && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            onBlur={() => handleBlur('name')}
            placeholderTextColor={COLORS.text.secondary}
            editable={!loadingProfile && !loading && !uploadingImage}
          />
        </View>
        {errors.name && touched.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Birthday</Text>
        <View style={[styles.inputWrapper, errors.birthday && touched.birthday && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="MM/DD/YYYY"
            value={formData.birthday}
            onChangeText={(text) => handleChange('birthday', text)}
            onBlur={() => handleBlur('birthday')}
            keyboardType="numbers-and-punctuation"
            placeholderTextColor={COLORS.text.secondary}
            editable={!loadingProfile && !loading && !uploadingImage}
          />
        </View>
        {errors.birthday && touched.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}
      </View>

      
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading || loadingProfile || uploadingImage}
      >
        {loading || uploadingImage ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderAvatarSection()}
        {renderForm()}
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  saveButton: {
    backgroundColor: COLORS.black,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.white,
    fontWeight: '500',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: COLORS.gray['50'],
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  removeAvatarButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  avatarText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
  },
  form: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    paddingBottom: 0,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 45,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
  },
  errorText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginBottom: SPACING.sm,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  menuText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
});

export default EditProfileScreen;