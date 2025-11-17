import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SPACING } from '../../constants';

const LikeScreen: React.FC = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Navigate to Wishlist immediately when this screen is accessed
    navigation.navigate('Wishlist' as never);
  }, [navigation]);

  // This content will briefly show before navigation
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Redirecting to Wishlist...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '500',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default LikeScreen;
