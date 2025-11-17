import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { COLORS, SPACING, BORDER_RADIUS } from '../constants';
import { RootStackParamList } from '../types';

type ProductPreviewRowNavigationProp = StackNavigationProp<RootStackParamList>;

interface ProductPreviewRowProps {
  previews: Array<{
    src: any;
    available: boolean;
  }>;
  onPreviewPress?: (index: number) => void;
}

const ProductPreviewRow: React.FC<ProductPreviewRowProps> = ({
  previews,
  onPreviewPress,
}) => {
  const navigation = useNavigation<ProductPreviewRowNavigationProp>();

  const handlePress = (index: number, available: boolean) => {
    if (onPreviewPress) {
      onPreviewPress(index);
    } else if (available) {
      navigation.navigate('StoryView', { storyIndex: index });
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.previewRowContainer}
      style={{ backgroundColor: COLORS.white }}
    >
      {previews.map((item, idx) => (
        <TouchableOpacity
          key={`preview-${idx}`}
          activeOpacity={0.85}
          onPress={() => handlePress(idx, item.available)}
        >
          <View style={item.available ? styles.previewOuterCircle : styles.previewOuterCircleGray}>
            <View style={item.available ? styles.previewInnerCircle : styles.previewInnerCircleGray}>
              <Image source={item.src} style={styles.previewImage} resizeMode="cover" />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  previewRowContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  previewOuterCircle: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.accentPink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  previewOuterCircleGray: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
  },
  previewInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInnerCircleGray: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray[50],
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProductPreviewRow;