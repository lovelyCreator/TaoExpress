// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Image,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';

// import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
// import { RootStackParamList } from '../../types';

// type StoreInformationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StoreInformation'>;

// const StoreInformationScreen: React.FC = () => {
//   const navigation = useNavigation<StoreInformationScreenNavigationProp>();
  
//   const [storeData, setStoreData] = useState({
//     storeName: 'rolandstoreausie',
//     storeDescription: 'Premium athletic wear and lifestyle products',
//     storeLogo: 'https://via.placeholder.com/60x60/FF6B9D/FFFFFF?text=R',
//     storeBanner: 'https://via.placeholder.com/400x200',
//     contactEmail: 'store@example.com',
//     contactPhone: '+61 041 2345 678',
//     address: '123 Store Street, Sydney, NSW 2000, Australia',
//     website: 'www.rolandstoreausie.com',
//   });

//   const handleInputChange = (field: string, value: string) => {
//     setStoreData(prev => ({ ...prev, [field]: value }));
//   };

//   const handleSave = () => {
//     Alert.alert(
//       'Store Information Saved',
//       'Your store information has been successfully updated!',
//       [
//         { text: 'OK' }
//       ]
//     );
//   };

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <TouchableOpacity 
//         style={styles.backButton}
//         onPress={() => navigation.goBack()}
//       >
//         <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
//       </TouchableOpacity>
//       <Text style={styles.headerTitle}>Store Information</Text>
//       <View style={styles.placeholder} />
//     </View>
//   );

//   const renderStoreLogo = () => (
//     <View style={styles.section}>
//       {/* <Text style={styles.sectionTitle}>Store Logo</Text> */}
//       <View style={styles.logoContainer}>
//         <TouchableOpacity style={styles.changeLogoButton}>
//           <Image
//             source={{ uri: storeData.storeLogo }}
//             style={styles.storeLogo}
//           />
//           {/* <Text style={styles.changeLogoText}>Change Logo</Text> */}
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderStoreBanner = () => (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>Store Banner</Text>
//       <View style={styles.bannerContainer}>
//         <Image
//           source={{ uri: storeData.storeBanner }}
//           style={styles.storeBanner}
//         />
//         <TouchableOpacity style={styles.changeBannerButton}>
//           <Text style={styles.changeBannerText}>Change Banner</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderStoreName = () => (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>Store Name</Text>
      
//       <View style={styles.inputGroup}>
//         <TextInput
//           style={styles.textInput}
//           placeholder="Enter store name"
//           value={storeData.storeName}
//           onChangeText={(value) => handleInputChange('storeName', value)}
//         />
//       </View>
//     </View>
//   );

//   const renderDescription = () => (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>Description</Text>
      
//       <View style={styles.inputGroup}>
//         <TextInput
//           style={[styles.textInput, styles.textArea]}
//           placeholder="Enter store description"
//           value={storeData.storeDescription}
//           onChangeText={(value) => handleInputChange('storeDescription', value)}
//           multiline
//           numberOfLines={4}
//         />
//       </View>
//     </View>
//   );

//   const renderContactInfo = () => (
//     <View style={styles.section}>
//       <Text style={styles.sectionTitle}>Contact Information</Text>
      
//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Email</Text>
//         <TextInput
//           style={styles.textInput}
//           value={storeData.contactEmail}
//           onChangeText={(value) => handleInputChange('contactEmail', value)}
//           keyboardType="email-address"
//         />
//       </View>

//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Phone</Text>
//         <TextInput
//           style={styles.textInput}
//           value={storeData.contactPhone}
//           onChangeText={(value) => handleInputChange('contactPhone', value)}
//           keyboardType="phone-pad"
//         />
//       </View>

//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Address</Text>
//         <TextInput
//           style={[styles.textInput, styles.textArea]}
//           value={storeData.address}
//           onChangeText={(value) => handleInputChange('address', value)}
//           multiline
//           numberOfLines={3}
//         />
//       </View>

//       <View style={styles.inputGroup}>
//         <Text style={styles.inputLabel}>Website</Text>
//         <TextInput
//           style={styles.textInput}
//           value={storeData.website}
//           onChangeText={(value) => handleInputChange('website', value)}
//         />
//       </View>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {renderHeader()}
      
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
//         {renderStoreLogo()}
//         {renderStoreName()}
//         {renderDescription()}
//         {/* {renderContactInfo()} */}
//         <View style={styles.saveButtonContainer}>
//           <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
//             <Text style={styles.saveButtonText}>Save</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
      
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: SPACING.md,
//     paddingVertical: SPACING.sm,
//     backgroundColor: COLORS.white,
//   },
//   backButton: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: COLORS.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//     // marginLeft: 'auto',
//     ...SHADOWS.small,
//   },
//   headerTitle: {
//     fontSize: FONTS.sizes.lg,
//     fontWeight: '600',
//     color: COLORS.text.primary,
//   },
//   placeholder: {
//     width: 32,
//   },
//   saveButtonContainer: {
//   },
//   saveButton: {
//     marginHorizontal: SPACING.md,
//     paddingVertical: SPACING.smmd,
//     borderRadius: BORDER_RADIUS.lg,
//     backgroundColor: COLORS.black,
//     borderColor: COLORS.primary,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '90%',
//   },
//   saveButtonText: {
//     fontSize: FONTS.sizes.md,
//     color: COLORS.white,
//     fontWeight: '500',
//     marginLeft: SPACING.xs,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   section: {
//     backgroundColor: COLORS.white,
//     marginHorizontal: SPACING.md,
//     // marginBottom: SPACING.,
//     borderRadius: BORDER_RADIUS.xl,
//     // paddingVertical: SPACING.lg,
//     // ...SHADOWS.sm,
//   },
//   sectionTitle: {
//     fontSize: FONTS.sizes.sm,
//     fontWeight: '700',
//     color: COLORS.text.primary,
//     marginBottom: SPACING.sm,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     paddingVertical: SPACING.md,
//     backgroundColor: COLORS.white,
//   },
//   storeLogo: {
//     width: 100,
//     height: 100,
//     borderRadius: 60,
//     backgroundColor: COLORS.gray['50'],
//   },
//   changeLogoButton: {
//     // paddingVertical: SPACING.sm,
//     // paddingHorizontal: SPACING.lg,
//     backgroundColor: COLORS.gray[100],
//     borderRadius: 50,
//   },
//   changeLogoText: {
//     fontSize: FONTS.sizes.sm,
//     fontWeight: '600',
//     color: COLORS.text.primary,
//   },
//   bannerContainer: {
//     alignItems: 'center',
//   },
//   storeBanner: {
//     width: '100%',
//     height: 120,
//     borderRadius: BORDER_RADIUS.lg,
//     marginBottom: SPACING.md,
//   },
//   changeBannerButton: {
//     paddingVertical: SPACING.sm,
//     paddingHorizontal: SPACING.lg,
//     backgroundColor: COLORS.gray[100],
//     borderRadius: BORDER_RADIUS.lg,
//   },
//   changeBannerText: {
//     fontSize: FONTS.sizes.sm,
//     fontWeight: '600',
//     color: COLORS.text.primary,
//   },
//   inputGroup: {
//     marginBottom: SPACING.lg,
//   },
//   inputLabel: {
//     fontSize: FONTS.sizes.base,
//     fontWeight: '600',
//     color: COLORS.text.primary,
//     marginBottom: SPACING.sm,
//   },
//   textInput: {
//     // borderWidth: 1,
//     // borderColor: COLORS.gray[300],
//     borderRadius: BORDER_RADIUS.lg,
//     paddingHorizontal: SPACING.md,
//     paddingVertical: SPACING.sm,
//     fontSize: FONTS.sizes.sm,
//     color: COLORS.text.primary,
//     backgroundColor: COLORS.gray[50],
//   },
//   textArea: {
//     height: 100,
//     textAlignVertical: 'top',
//   },
// });

// export default StoreInformationScreen;



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

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { RootStackParamList, StoreProfileResponse } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { userProfileApi } from '../../services/userProfileApi';
import { useStoreMutation } from '../../hooks/useStoreMutation'; // Ensure this is a valid custom hook

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;
const { width, height } = Dimensions.get('window');

const StoreInformationScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, updateUser } = useAuth();

  // Initialize formData with user data or defaults
  const [formData, setFormData] = useState({
    name: user?.name || '',
    description: '',
    avatar: user?.avatar || null,
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Use useStoreMutation correctly
  const { getStoreProfile, storeProfileData: storeData, loading: storeLoading } = useStoreMutation();

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
        }
      }
      // Load store profile
      await getStoreProfile();
    })();
  }, [getStoreProfile]); // Dependency on getStoreProfile to trigger re-fetch

  // Update formData when storeData changes (from useStoreMutation)
  useEffect(() => {
    if (storeData) {
      setFormData((prev) => ({
        ...prev,
        name: storeData?.name || prev.name,
        description: storeData?.description || prev.description,
        avatar: storeData?.logo || prev.avatar, // Assuming 'logo' is the field name
      }));
    }
  }, [storeData]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'description':
        return value.trim() ? '' : 'Description is required'; // Added for consistency
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    ['name', 'description'].forEach((key) => {
      const fieldValue = formData[key as keyof typeof formData];
      const error = validateField(key, fieldValue !== null ? fieldValue : '');
      if (error) newErrors[key] = error;
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
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors({ ...errors, [name]: error });
    }
  };

  const handleSave = async () => {
    const newTouched = { name: true, description: true };
    setTouched(newTouched);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData: StoreProfileResponse = {
        name: formData.name,
        description: formData.description || '',
        logo: formData.avatar || '',
      };

      const response = await userProfileApi.updateStoreProfile(updateData);

      if (response.success) {
        // await updateUser({
        //   name: formData.name,
        //   description: formData.description,
        //   avatar: formData.avatar || undefined,
        // });
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
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
        setUploadingImage(true);
        const uploadResult = await userProfileApi.uploadImage(result.assets[0].uri);

        if (uploadResult.success && uploadResult.url) {
          setFormData({ ...formData, avatar: uploadResult.url });
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={18} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Store Information</Text>
      <View style={{ width: 40 }} />
    </View>
  );

  const renderAvatarSection = () => (
    <View style={styles.avatarSection}>
      <View style={styles.avatarContainer}>
        <Image
          source={formData.avatar ? { uri: formData.avatar } : require('../../assets/images/avatar.png')}
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
        <Text style={styles.label}>Store Name</Text>
        <View style={[styles.inputWrapper, errors.name && touched.name && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Enter your store name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            onBlur={() => handleBlur('name')}
            placeholderTextColor={COLORS.text.secondary}
            editable={!storeLoading && !loading && !uploadingImage}
          />
        </View>
        {errors.name && touched.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <View style={[styles.descriptionInputWrapper, errors.description && touched.description && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder="Write your description here..."
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            onBlur={() => handleBlur('description')}
            placeholderTextColor={COLORS.text.secondary}
            multiline
            numberOfLines={4}
            editable={!storeLoading && !loading && !uploadingImage}
          />
        </View>
        {errors.description && touched.description && <Text style={styles.errorText}>{errors.description}</Text>}
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={storeLoading || loading || uploadingImage}
      >
        {storeLoading || loading || uploadingImage ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (storeLoading) {
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
    marginTop: SPACING.md,
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
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 45,
  },
  descriptionInputWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    minHeight: 120,
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
});

export default StoreInformationScreen;