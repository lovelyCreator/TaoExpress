import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../constants';

interface ImageUploadProps {
  images: string[];
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
  style?: object;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onAddImage,
  onRemoveImage,
  style,
}) => {
  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: item }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemoveImage(index)}
      >
        <Ionicons name="close-circle" size={24} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {images.length > 0 && (
        <FlatList
          data={images}
          renderItem={renderImageItem}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageList}
        />
      )}
      
      <TouchableOpacity style={styles.addButton} onPress={onAddImage}>
        <Ionicons name="add" size={24} color={COLORS.gray[400]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageList: {
    marginRight: SPACING.sm,
  },
  imageContainer: {
    position: 'relative',
    marginRight: SPACING.sm,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ImageUpload;