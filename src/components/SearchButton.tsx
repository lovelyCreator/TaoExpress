import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BORDER_RADIUS, COLORS, FONTS, SPACING } from '../constants';
import CameraIcon from '../assets/icons/CameraIcon';
import { useAppSelector } from '../store/hooks';
import { translations } from '../i18n/translations';

interface SearchButtonProps {
  placeholder: string;
  onPress: () => void;
  onCameraPress?: () => void;
  style?: ViewStyle;
}

const SearchButton: React.FC<SearchButtonProps> = ({
  placeholder,
  onPress,
  onCameraPress,
  style,
}) => {
  const locale = useAppSelector((s) => s.i18n.locale) as 'en' | 'ko' | 'zh';

  // Translation function
  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[locale as keyof typeof translations];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  return (
    <View style={[styles.container, style]}>
      {onCameraPress && (
        <TouchableOpacity style={styles.cameraButton} onPress={onCameraPress}>
          {/* <Ionicons name="camera-outline" size={22} color={COLORS.text.primary} /> */}
          <CameraIcon width={24} height={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      )}
      {onCameraPress && <View style={styles.bar}/>}
      <TouchableOpacity style={styles.input} onPress={onPress}>
        <Text style={styles.trendingText}>{t('search.trending')}</Text>
        <Text style={styles.keywordText}>{t('search.keyword')}</Text>        
      </TouchableOpacity>
      <TouchableOpacity style={styles.searchButton} onPress={onPress}>
        <Ionicons name="search" size={20} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    minHeight: 40,
    borderWidth: 2.5,
  },
  input: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: SPACING.sm,
  },
  trendingText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.red,
    fontWeight: '600',
  },
  keywordText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  cameraButton: {
    paddingLeft: SPACING.sm,
    flexDirection: 'row',
  },
  searchButton: {
    backgroundColor: COLORS.text.primary,
    borderRadius: BORDER_RADIUS.full,
    width: 34,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    width: 0.5,
    height: 16,
    backgroundColor: COLORS.gray[600],
    marginHorizontal: SPACING.sm,
  },
});

export default SearchButton;
