import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

import { COLORS, SPACING } from '../../constants';
import {
  Header,
  Checkbox,
  PriceDisplay,
  VariantSelector,
  SummaryRow,
  FormInput,
  NotificationBadge,
  SectionTitle,
  RatingDisplay,
  SearchInput,
  IconButton,
} from '../../components';

const ExtendedComponentDemoScreen: React.FC = () => {
  // State for various components
  const [isChecked, setIsChecked] = useState(false);
  const [price, setPrice] = useState(182.00);
  const [originalPrice, setOriginalPrice] = useState(192.00);
  const [selectedSize, setSelectedSize] = useState('37');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(5);

  // Variant options
  const sizeOptions = [
    { id: '1', name: 'EU 37', value: '37' },
    { id: '2', name: 'EU 38', value: '38' },
    { id: '3', name: 'EU 39', value: '39' },
    { id: '4', name: 'EU 40', value: '40' },
  ];

  const validateEmail = () => {
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Extended Component Demo"
        showBackButton={true}
        rightIcons={[
          { 
            icon: 'notifications-outline', 
            onPress: () => Alert.alert('Notifications', 'Notifications icon pressed'),
            badgeCount: notificationCount
          },
        ]}
      />
      
      <ScrollView style={styles.content}>
        <SectionTitle 
          title="Form Components" 
          style={styles.section}
        />
        
        <FormInput
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          error={emailError}
          keyboardType="email-address"
          autoCapitalize="none"
          onIconPress={validateEmail}
        />
        
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search products"
          style={styles.searchInput}
        />
        
        <SectionTitle 
          title="Selection Components" 
          style={styles.section}
        />
        
        <View style={styles.row}>
          <Checkbox
            checked={isChecked}
            onPress={() => setIsChecked(!isChecked)}
            size={24}
          />
        </View>
        
        <VariantSelector
          label="Size"
          options={sizeOptions}
          selectedValue={selectedSize}
          onSelect={setSelectedSize}
        />
        
        <SectionTitle 
          title="Display Components" 
          style={styles.section}
        />
        
        <PriceDisplay
          price={price}
          originalPrice={originalPrice}
          style={styles.component}
        />
        
        <RatingDisplay
          rating={4.5}
          reviewCount={128}
          size={16}
          showReviewCount={true}
          style={styles.component}
        />
        
        <SectionTitle 
          title="Summary Components" 
          style={styles.section}
        />
        
        <SummaryRow
          label="Subtotal"
          value="$182.00"
          style={styles.component}
        />
        
        <SummaryRow
          label="Discount"
          value="-$10.00"
          isDiscount={true}
          style={styles.component}
        />
        
        <SummaryRow
          label="Total"
          value="$172.00"
          isTotal={true}
          style={styles.component}
        />
        
        <SectionTitle 
          title="Icon Buttons" 
          style={styles.section}
        />
        
        <View style={styles.iconButtonsRow}>
          <IconButton
            icon="heart-outline"
            onPress={() => Alert.alert('Like', 'Like button pressed')}
            size={24}
            color={COLORS.text.primary}
            backgroundColor={COLORS.white}
          />
          
          <IconButton
            icon="share-outline"
            onPress={() => Alert.alert('Share', 'Share button pressed')}
            size={24}
            color={COLORS.text.primary}
            backgroundColor={COLORS.white}
          />
          
          <IconButton
            icon="cart-outline"
            onPress={() => Alert.alert('Cart', 'Cart button pressed')}
            size={24}
            color={COLORS.text.primary}
            backgroundColor={COLORS.white}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  section: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  component: {
    marginBottom: SPACING.md,
  },
  searchInput: {
    marginBottom: SPACING.lg,
  },
  iconButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.lg,
  },
});

export default ExtendedComponentDemoScreen;