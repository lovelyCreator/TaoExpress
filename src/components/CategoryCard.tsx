import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    image: string;
    productCount?: number;
  };
  onPress: (categoryId: string) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(category.id)}
    >
      <Image 
        source={{ uri: category.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.name}>{category.name}</Text>
        {category.productCount && (
          <Text style={styles.count}>{category.productCount} products</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={COLORS.gray[400]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  count: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
});

export default CategoryCard;
