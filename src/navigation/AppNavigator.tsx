import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';
import { COLORS, DEMO_MODE } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo screens
import CartScreenDemo from '../screens/demo/CartScreen.demo';
import WishlistScreenDemo from '../screens/demo/WishlistScreen.demo';
import ProfileScreenDemo from '../screens/demo/ProfileScreen.demo';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/SearchScreen';
import CartScreen from '../screens/main/CartScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import ReviewsScreen from '../screens/main/ReviewsScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import AddressBookScreen from '../screens/AddressBookScreen';
import AddNewAddressScreen from '../screens/AddNewAddressScreen';
import EditAddressScreen from '../screens/EditAddressScreen';
import EditFinanceAddressScreen from '../screens/EditFinanceAddressScreen';
import WithdrawConfirmScreen from '../screens/main/WithdrawConfirmScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/AddPaymentMethodScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ProfileSettingsScreen from '../screens/main/ProfileSettingsScreen';
import HelpCenterScreen from '../screens/main/HelpCenterScreen';
import HelpSearchScreen from '../screens/main/HelpSearchScreen';
import HelpSectionScreen from '../screens/main/HelpSectionScreen';
import HelpArticleScreen from '../screens/main/HelpArticleScreen';
import LanguageSettingsScreen from '../screens/main/LanguageSettingsScreen';
import OrderSuccessScreen from '../screens/OrderSuccessScreen';
import PaymentScreen from '../screens/main/PaymentScreen';
import AddAddressScreen from '../screens/main/AddAddressScreen';

// Seller screens
import StoreInformationScreen from '../screens/main/StoreInformationScreen';
import StorePerformanceScreen from '../screens/main/StorePerformanceScreen';
// import EditProductScreen from '../screens/main/EditProductScreen'; // Temporarily removed due to missing module
// Order screens
import MyOrdersScreen from '../screens/main/MyOrdersScreen';
import DetailOrderScreen from '../screens/main/DetailOrderScreen';
import LeaveFeedbackScreen from '../screens/main/LeaveFeedbackScreen';
// Settings screens
import LocationScreen from '../screens/main/LocationScreen';
import NotificationsSettingsScreen from '../screens/main/NotificationsSettingsScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import ChangePasswordScreen from '../screens/main/ChangePasswordScreen';
import AffiliateMarketingScreen from '../screens/main/AffiliateMarketingScreen';
import UnitSettingsScreen from '../screens/main/UnitSettingsScreen';
import PaymentPasswordScreen from '../screens/main/PaymentPasswordScreen';
import DepositScreen from '../screens/main/DepositScreen';
import ChargeScreen from '../screens/main/ChargeScreen';
import PointDetailScreen from '../screens/main/PointDetailScreen';
import CouponScreen from '../screens/main/CouponScreen';
import BuyListScreen from '../screens/main/BuyListScreen';
import ProblemProductScreen from '../screens/main/ProblemProductScreen';
import NoteScreen from '../screens/main/NoteScreen';
import LeaveNoteScreen from '../screens/main/LeaveNoteScreen';
import ShareAppScreen from '../screens/main/ShareAppScreen';
// Chat screens
import ChatScreen from '../screens/main/ChatScreen';
import ChatErrorBoundary from '../components/ChatErrorBoundary';
import ChatProductsScreen from '../screens/main/ChatProductsScreen';
import ChatOrdersScreen from '../screens/main/ChatOrdersScreen';
import ChatSettingsScreen from '../screens/main/ChatSettingsScreen';
// import EditProductScreen from '../screens/main/EditProductScreen';
import CategoryTabScreen from '../screens/main/CategoryTabScreen';
import CategoryScreen from '../screens/CategoryScreen';
import SubCategoryScreen from '../screens/main/SubCategoryScreen';
import Sub2CategoryScreen from '../screens/main/Sub2CategoryScreen';
import ProductDiscoveryScreen from '../screens/main/ProductDiscoveryScreen';
import LikeScreen from '../screens/main/LikeScreen';
import AddShippingServiceScreen from '../screens/AddShippingServiceScreen';
import FinanceScreen from '../screens/main/FinanceScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import WithdrawSuccessScreen from '../screens/main/WIthDrawSuccessScreen';
import ChattingMemeberScreen from '../screens/main/ChattingMemberScreen';
import ChatSearchScreen from '../screens/main/ChatSearchScreen';
import PusherTestScreen from '../screens/main/PusherTestScreen';
import CustomerServiceScreen from '../screens/main/CustomerServiceScreen';
import OrderInquiryScreen from '../screens/main/OrderInquiryScreen';
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
      <AuthStack.Screen name="EmailVerification" component={EmailVerificationScreen} />
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
          // height: 80,
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
      <MainTab.Screen name="Cart" component={DEMO_MODE ? CartScreenDemo : CartScreen} />
      <MainTab.Screen name="Like" component={DEMO_MODE ? WishlistScreenDemo : WishlistScreen} />
      <MainTab.Screen name="Profile" component={DEMO_MODE ? ProfileScreenDemo : ProfileScreen} />
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
            name="CustomerService"
            component={CustomerServiceScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="OrderInquiry"
            component={OrderInquiryScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="ImageSearch"
            component={ImageSearchScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="Search"
            component={SearchScreen}
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
            name="AddPaymentMethod" 
            component={AddPaymentMethodScreen}
            options={{
              headerShown: false,
              title: 'Add Payment Method',
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
          <RootStack.Screen 
            name="Deposit" 
            component={DepositScreen}
            options={{
              headerShown: false,
              title: 'Deposit',
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
            name="Charge" 
            component={ChargeScreen}
            options={{
              headerShown: false,
              title: 'Charge',
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
            name="PointDetail" 
            component={PointDetailScreen}
            options={{
              headerShown: false,
              title: 'Point Detail',
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
            name="Coupon" 
            component={CouponScreen}
            options={{
              headerShown: false,
              title: 'Coupon',
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
            name="BuyList" 
            component={BuyListScreen}
            options={{
              headerShown: false,
              title: 'Buy List',
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
            name="ProblemProduct" 
            component={ProblemProductScreen}
            options={{
              headerShown: false,
              title: 'Problem Product',
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
            name="Note" 
            component={NoteScreen}
            options={{
              headerShown: false,
              title: 'Note',
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
            name="LeaveNote" 
            component={LeaveNoteScreen}
            options={{
              headerShown: false,
              title: 'Leave Note',
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
            name="ShareApp" 
            component={ShareAppScreen}
            options={{
              headerShown: false,
              title: 'Share App',
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
          <RootStack.Screen 
            name="AffiliateMarketing" 
            component={AffiliateMarketingScreen}
            options={{
              headerShown: false,
              title: 'Affiliate Marketing',
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
            name="UnitSettings" 
            component={UnitSettingsScreen}
            options={{
              headerShown: false,
              title: 'Unit Settings',
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
            name="PaymentPassword" 
            component={PaymentPasswordScreen}
            options={{
              headerShown: false,
              title: 'Payment Password',
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
            component={ChatSearchScreen}
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