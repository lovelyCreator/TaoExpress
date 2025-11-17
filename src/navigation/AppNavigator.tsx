import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';
import { COLORS } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import SplashScreen from '../screens/lazy/SplashScreen.lazy';
import LoginScreen from '../screens/lazy/LoginScreen.lazy';
import SignupScreen from '../screens/lazy/SignupScreen.lazy';
import ForgotPasswordScreen from '../screens/lazy/ForgotPasswordScreen.lazy';
import ResetPasswordScreen from '../screens/lazy/ResetPasswordScreen.lazy';
import HomeScreen from '../screens/main/HomeScreen.lazy';
import SearchScreen from '../screens/main/SearchScreen.lazy';
import CartScreen from '../screens/lazy/CartScreen.lazy';
import NotificationsScreen from '../screens/lazy/NotificationsScreen.lazy';
import ProfileScreen from '../screens/lazy/ProfileScreen.lazy';
import ProductDetailScreen from '../screens/lazy/ProductDetailScreen.lazy';
import ReviewsScreen from '../screens/lazy/ReviewsScreen.lazy';
import SellerProfileScreen from '../screens/lazy/SellerProfileScreen.lazy';
import CheckoutScreen from '../screens/lazy/CheckoutScreen.lazy';
import OrderConfirmationScreen from '../screens/lazy/OrderConfirmationScreen.lazy';
import SearchResultsScreen from '../screens/lazy/SearchResultsScreen.lazy';
import EditProfileScreen from '../screens/lazy/EditProfileScreen.lazy';
import AddressBookScreen from '../screens/lazy/AddressBookScreen.lazy';
import AddNewAddressScreen from '../screens/lazy/AddNewAddressScreen.lazy';
import EditAddressScreen from '../screens/lazy/EditAddressScreen.lazy';
import EditFinanceAddressScreen from '../screens/lazy/EditFinanceAddressScreen.lazy';
import BalanceSettingsScreen from '../screens/lazy/BalanceSettingsScreen.lazy';
import BankAccountScreen from '../screens/lazy/BankAccountScreen.lazy';
import WithdrawScreen from '../screens/lazy/WithdrawScreen.lazy';
import WithdrawConfirmScreen from '../screens/lazy/WithdrawConfirmScreen.lazy';
import SellerCategoryScreen from '../screens/lazy/SellerCategoryScreen.lazy';
import PaymentMethodsScreen from '../screens/lazy/PaymentMethodsScreen.lazy';
import OrderHistoryScreen from '../screens/lazy/OrderHistoryScreen.lazy';
import WishlistScreen from '../screens/lazy/WishlistScreen.lazy';
import SettingsScreen from '../screens/lazy/SettingsScreen.lazy';
import ProfileSettingsScreen from '../screens/main/ProfileSettingsScreen';
import HelpCenterScreen from '../screens/main/HelpCenterScreen';
import HelpSearchScreen from '../screens/main/HelpSearchScreen';
import HelpSectionScreen from '../screens/main/HelpSectionScreen';
import HelpArticleScreen from '../screens/main/HelpArticleScreen';
import LanguageSettingsScreen from '../screens/main/LanguageSettingsScreen';
import FollowersScreen from '../screens/lazy/FollowersScreen.lazy';
import FollowingScreen from '../screens/lazy/FollowingScreen.lazy';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import AddAddressScreen from '../screens/main/AddAddressScreen';

// Seller screens
import MyStoreScreen from '../screens/lazy/MyStoreScreen.lazy';
import MyStoreSettingsScreen from '../screens/lazy/MyStoreSettingsScreen.lazy';
import StoreInformationScreen from '../screens/lazy/StoreInformationScreen.lazy';
import StorePerformanceScreen from '../screens/lazy/StorePerformanceScreen.lazy';
import ShippingSettingsScreen from '../screens/lazy/ShippingSettingsScreen.lazy';
import ShippingServiceScreen from '../screens/lazy/ShippingServiceScreen.lazy';
import MyProductsScreen from '../screens/lazy/MyProductsScreen.lazy';
import AddProductScreen from '../screens/lazy/AddProductScreen.lazy';
// import EditProductScreen from '../screens/main/EditProductScreen'; // Temporarily removed due to missing module
// Order screens
import MyOrdersScreen from '../screens/lazy/MyOrdersScreen.lazy';
import DetailOrderScreen from '../screens/lazy/DetailOrderScreen.lazy';
import LeaveFeedbackScreen from '../screens/lazy/LeaveFeedbackScreen.lazy';
// Settings screens
import LocationScreen from '../screens/lazy/LocationScreen.lazy';
import NotificationsSettingsScreen from '../screens/lazy/NotificationsSettingsScreen.lazy';
import SellerNotificationSettingsScreen from '../screens/lazy/SellerNotificationSettingsScreen.lazy';
import PrivacyPolicyScreen from '../screens/lazy/PrivacyPolicyScreen.lazy';
import AboutUsScreen from '../screens/lazy/AboutUsScreen.lazy';
import ChangePasswordScreen from '../screens/lazy/ChangePasswordScreen.lazy';
// Chat screens
import ChatScreen from '../screens/lazy/ChatScreen.lazy';
import ChatErrorBoundary from '../components/ChatErrorBoundary';
import ChatProductsScreen from '../screens/lazy/ChatProductsScreen.lazy';
import ChatOrdersScreen from '../screens/lazy/ChatOrdersScreen.lazy';
import ChatSettingsScreen from '../screens/lazy/ChatSettingsScreen.lazy';
// import EditProductScreen from '../screens/main/EditProductScreen';
import StoryViewScreen from '../screens/lazy/StoryViewScreen.lazy';
import CategoryTabScreen from '../screens/lazy/CategoryTabScreen.lazy';
import CategoryScreen from '../screens/lazy/CategoryScreen.lazy';
import SubCategoryScreen from '../screens/lazy/SubCategoryScreen.lazy';
import Sub2CategoryScreen from '../screens/lazy/Sub2CategoryScreen.lazy';
import ProductDiscoveryScreen from '../screens/lazy/ProductDiscoveryScreen.lazy';
import LikeScreen from '../screens/lazy/LikeScreen.lazy';
import AddShippingServiceScreen from '../screens/lazy/AddShippingServiceScreen.lazy';
import SellingHistoryScreen from '../screens/lazy/SellingHistoryScreen.lazy';
import FinanceScreen from '../screens/lazy/FinanceScreen.lazy';
import VariationsScreen from '../screens/lazy/VariationsScreen.lazy';
import SetUpVariationsInfoScreen from '../screens/lazy/SetUpVariationsInfoScreen.lazy';
import OtpVerificationScreen from '../screens/lazy/OtpVerificationScreen.lazy';
import ComponentDemoScreen from '../screens/lazy/ComponentDemoScreen.lazy';
import ExtendedComponentDemoScreen from '../screens/lazy/ExtendedComponentDemoScreen.lazy';
import WithdrawSuccessScreen from '../screens/lazy/WithdrawSuccessScreen.lazy';
import ChattingMemeberScreen from '../screens/main/ChattingMemberScreen';
import ChatSearchScreenWithSuspense from '../screens/lazy/ChatSearchScreen.lazy';
import PusherTestScreen from '../screens/main/PusherTestScreen';
import CustomerServiceScreen from '../screens/main/CustomerServiceScreen';
import ImageSearchScreen from '../screens/main/ImageSearchScreen';

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
const AuthNavigator = React.memo(() => {
  const authContext = useAuth();
  const loginError = authContext?.loginError;
  const signupError = authContext?.signupError;
  
  // Determine initial route based on error states
  let initialRoute: keyof AuthStackParamList = "Login"; // default
  if (signupError) {
    initialRoute = "Signup";
  } else if (loginError) {
    initialRoute = "Login";
  }
  
  console.log('AuthNavigator: Rendering AuthNavigator');
  console.log('AuthNavigator: loginError:', loginError, 'signupError:', signupError);
  console.log('AuthNavigator: initialRoute:', initialRoute);
  console.log('AuthNavigator: Call stack:', new Error().stack);
  
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
      initialRouteName={initialRoute}
    >
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <AuthStack.Screen name="OtpVerification" component={OtpVerificationScreen} />
    </AuthStack.Navigator>
  );
});

// Main Tab Navigator
const MainTabNavigator = () => {
  const authContext = useAuth();
  const shouldNavigateToProfile = authContext?.shouldNavigateToProfile;
  const clearNavigateToProfile = authContext?.clearNavigateToProfile;
  const isGuest = authContext?.isGuest;
  const navigation = useNavigation();
  
  console.log('MainTabNavigator: Rendering with shouldNavigateToProfile:', shouldNavigateToProfile, 'isGuest:', isGuest);
  
  // Navigate to Profile tab after login if needed
  useEffect(() => {
    console.log('MainTabNavigator: shouldNavigateToProfile changed to', shouldNavigateToProfile);
    if (shouldNavigateToProfile) {
      // Navigate to the Profile tab
      console.log('MainTabNavigator: Navigating to Profile screen');
      navigation.navigate('Profile' as never);
      // Clear the flag after handling
      clearNavigateToProfile();
    }
  }, [shouldNavigateToProfile, navigation, clearNavigateToProfile]); // Depend on all required values
  
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? require('../assets/icons/home_focused.png') : require('../assets/icons/home.png');
          } else if (route.name === 'Category') {
            iconName = focused ? require('../assets/icons/category_focused.png') : require('../assets/icons/category.png');
          } else if (route.name === 'Cart') {
            iconName = focused ? require('../assets/icons/cart_focused.png') : require('../assets/icons/cart.png');
          } else if (route.name === 'Like') {
            iconName = focused ? require('../assets/icons/like_focused.png') : require('../assets/icons/like.png');
          } else if (route.name === 'Profile') {
            iconName = focused ? require('../assets/icons/person_focused.png') : require('../assets/icons/person.png');
          } else {
            iconName = require('../assets/icons/home.png'); // fallback to home icon
          }

          // return <Ionicons name={iconName} size={size} color={color} />;
          return <Image source={ iconName } style={{ width: 20, height: 20 }} resizeMode="contain" />;
        },
        tabBarActiveTintColor: COLORS.black,
        tabBarInactiveTintColor: COLORS.gray[500],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: 80,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          display: 'none', // Hide tab labels
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Category" component={CategoryTabScreen} />
      <MainTab.Screen name="Cart" component={CartScreen} />
      <MainTab.Screen name="Like" component={WishlistScreen} />
      <MainTab.Screen name="Profile" component={ProfileScreen} />
    </MainTab.Navigator>
  );
};

// Root Stack Navigator
const RootNavigator = () => {
  const authContext = useAuth();
  const isAuthenticated = authContext?.isAuthenticated;
  const isLoading = authContext?.isLoading;
  console.log('RootNavigator: Rendering with isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);

  // Debug authentication state changes
  useEffect(() => {
    console.log('AppNavigator: Authentication state changed - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    console.log('AppNavigator: Current screen should be:', !isAuthenticated ? 'Auth' : 'Main');
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Onboarding removed - skip directly to main screens */}
      {(
        <>
          <RootStack.Screen name="Main" component={MainTabNavigator} />
          <RootStack.Screen name="Auth" component={AuthNavigator} />
          <RootStack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen}
            options={{
              headerShown: false,
              title: 'Product Details',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Reviews" 
            component={ReviewsScreen}
            options={{
              headerShown: false,
              title: 'Reviews',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="SellerProfile" 
            component={SellerProfileScreen}
            options={{
              headerShown: false,
              title: 'Seller Profile',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Checkout" 
            component={CheckoutScreen}
            options={{
              headerShown: false,
              title: 'Checkout',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{
              headerShown: false,
              title: 'Payment',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="AddAddress" 
            component={AddAddressScreen}
            options={{
              headerShown: false,
              title: 'Add Address',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="OrderConfirmation" 
            component={OrderConfirmationScreen}
            options={{
              headerShown: false,
              title: 'Order Confirmation',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="AddShippingService" 
            component={AddShippingServiceScreen}
            options={{
              headerShown: false,
              title: 'Add Shipping Service',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Search" 
            component={SearchScreen}
            options={{
              headerShown: false,
              title: 'Search Results',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="StoryView"
            component={StoryViewScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="SubCategory"
            component={SubCategoryScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="ProductDiscovery"
            component={ProductDiscoveryScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="ComponentDemo"
            component={ComponentDemoScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="ExtendedComponentDemo"
            component={ExtendedComponentDemoScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="CustomerService"
            component={CustomerServiceScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="ImageSearch"
            component={ImageSearchScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="Categories" 
            component={CategoryScreen}
            options={({ route }) => ({
              headerShown: false,
              title: route.params?.categoryId || 'Category',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            })}
          />
          <RootStack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{
              headerShown: false,
              title: 'Edit Profile',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="AddressBook" 
            component={AddressBookScreen}
            options={{
              headerShown: false,
              title: 'Address Book',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="AddNewAddress" 
            component={AddNewAddressScreen}
            options={{
              headerShown: false,
              title: 'New Address',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="EditAddress" 
            component={EditAddressScreen}
            options={{
              headerShown: false,
              title: 'Edit Address',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="EditFinanceAddress" 
            component={EditFinanceAddressScreen}
            options={{
              headerShown: false,
              title: 'Edit Address',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="PaymentMethods" 
            component={PaymentMethodsScreen}
            options={{
              headerShown: false,
              title: 'Payment Methods',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="OrderHistory" 
            component={OrderHistoryScreen}
            options={{
              headerShown: false,
              title: 'Order History',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="OrderSuccess" 
            component={OrderSuccessScreen}
            options={{
              headerShown: false,
              title: 'Order Success',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Wishlist" 
            component={WishlistScreen}
            options={{
              headerShown: false,
              title: 'Wishlist',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              headerShown: false,
              title: 'Settings',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="ProfileSettings" 
            component={ProfileSettingsScreen}
            options={{
              headerShown: false,
              title: 'Profile Settings',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="HelpCenter" 
            component={HelpCenterScreen}
            options={{
              headerShown: false,
              title: 'Help Center',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="HelpSearch" 
            component={HelpSearchScreen}
            options={{
              headerShown: false,
              title: 'Help Search',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="HelpSection" 
            component={HelpSectionScreen}
            options={{
              headerShown: false,
              title: 'Help Section',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="HelpArticle" 
            component={HelpArticleScreen}
            options={{
              headerShown: false,
              title: 'Help Article',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="LanguageSettings" 
            component={LanguageSettingsScreen}
            options={{
              headerShown: false,
              title: 'Language Settings',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          {/* Seller screens */}
          <RootStack.Screen 
            name="MyStore" 
            component={MyStoreScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="MyStoreSettings" 
            component={MyStoreSettingsScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="StoreInformation" 
            component={StoreInformationScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="StorePerformance" 
            component={StorePerformanceScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="Variations" 
            component={VariationsScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="SetUpVariationsInfo" 
            component={SetUpVariationsInfoScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="ShippingSettings" 
            component={ShippingSettingsScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="ShippingService" 
            component={ShippingServiceScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="Following" 
            component={FollowingScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="Followers" 
            component={FollowersScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="MyProducts" 
            component={MyProductsScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="AddProduct" 
            component={AddProductScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="SellerCategory" 
            component={SellerCategoryScreen}
            options={{
              headerShown: false,
              title: 'Category',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          {/* <RootStack.Screen 
            name="EditProduct" 
            component={EditProductScreen}
            options={{
              headerShown: false,
              title: 'Edit Product',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          /> */}
          {/* Order screens */}
          <RootStack.Screen 
            name="MyOrders" 
            component={MyOrdersScreen}
            options={{
              headerShown: false,
              title: 'My Orders',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="DetailOrder" 
            component={DetailOrderScreen}
            options={{
              headerShown: false,
              title: 'Order Details',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="LeaveFeedback" 
            component={LeaveFeedbackScreen}
            options={{
              headerShown: false,
              title: 'Leave Feedback',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="BalanceSettings" 
            component={BalanceSettingsScreen}
            options={{
              headerShown: false,
              title: 'Balance Settings',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="BankAccount" 
            component={BankAccountScreen}
            options={{
              headerShown: false,
              title: 'Bank Account',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          {/* Settings screens */}
          <RootStack.Screen 
            name="Location" 
            component={LocationScreen}
            options={{
              headerShown: false,
              title: 'Location',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Finance" 
            component={FinanceScreen}
            options={{
              headerShown: false,
              title: 'Finance',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="Withdraw" 
            component={WithdrawScreen}
            options={{
              headerShown: false,
              title: 'Withdraw',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="WithdrawConfirm" 
            component={WithdrawConfirmScreen}
            options={{
              headerShown: false,
              title: 'Confirm Withdrawal',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="WithdrawSuccess" 
            component={WithdrawSuccessScreen}
            options={{
              headerShown: false,
              title: 'Withdraw',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          {/* <RootStack.Screen 
            name="Sub2Category" 
            component={Sub2CategoryScreen}
            options={{
              headerShown: false,
              title: 'Sub2 Category',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          /> */}
          <RootStack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              headerShown: false,
              title: 'Notifications',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="SellingHistory" 
            component={SellingHistoryScreen}
            options={{
              headerShown: false,
              title: 'Selling History',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="NotificationsSettings" 
            component={NotificationsSettingsScreen}
            options={{
              headerShown: false,
              title: 'NotificationsSettings',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="SellerNotificationsSettings" 
            component={SellerNotificationSettingsScreen}
            options={{
              headerShown: false,
              title: 'NotificationsSettings',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="PrivacyPolicy" 
            component={PrivacyPolicyScreen}
            options={{
              headerShown: false,
              title: 'Privacy Policy',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="AboutUs" 
            component={AboutUsScreen}
            options={{
              headerShown: false,
              title: 'About Us',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="ChangePassword" 
            component={ChangePasswordScreen}
            options={{
              headerShown: false,
              title: 'Change Password',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          {/* Chat screens */}
          <RootStack.Screen 
            name="ChattingMembers" 
            component={() => (
              <ChatErrorBoundary>
                <ChattingMemeberScreen />
              </ChatErrorBoundary>
            )}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="ChatSearch" 
            component={ChatSearchScreenWithSuspense}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="Chat" 
            component={() => (
              <ChatErrorBoundary>
                <ChatScreen />
              </ChatErrorBoundary>
            )}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="ChatProducts" 
            component={ChatProductsScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="ChatOrders" 
            component={ChatOrdersScreen}
            options={{
              headerShown: false,
            }}
          />
          <RootStack.Screen 
            name="ChatSettings" 
            component={ChatSettingsScreen}
            options={{
              headerShown: false,
              title: 'Chat Settings',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />
          <RootStack.Screen 
            name="PusherTest" 
            component={PusherTestScreen}
            options={{
              headerShown: false,
              title: 'Pusher Test',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTintColor: COLORS.text.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
            }}
          />

        </>
      )}
    </RootStack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
};

export default AppNavigator;