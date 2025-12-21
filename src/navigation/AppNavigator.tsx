import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList, AuthStackParamList, MainTabParamList } from '../types';
import { COLORS, DEMO_MODE } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeIcon from '../assets/icons/HomeIcon';
import CategoryIcon from '../assets/icons/CategoryIcon';
import LiveIcon from '../assets/icons/LiveIcon';
import CartIcon from '../assets/icons/CartIcon';
import AccountIcon from '../assets/icons/AccountIcon';

// Demo screens
import CartScreenDemo from '../screens/demo/CartScreen.demo';
import WishlistScreenDemo from '../screens/demo/WishlistScreen.demo';
import ProfileScreenDemo from '../screens/demo/ProfileScreen.demo';

// Import screens
import SplashScreen from '../screens/main/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import HomeScreen from '../screens/main/HomeScreen';
import SearchScreen from '../screens/main/searchScreen/SearchScreen';
import CartScreen from '../screens/main/CartScreen';
import LiveScreen from '../screens/main/LiveScreen';
import ProfileScreen from '../screens/main/profileScreen/ProfileScreen';
import ProductDetailScreen from '../screens/main/ProductDetailScreen';
import NotFoundScreen from '../screens/main/NotFoundScreen';
import ReviewsScreen from '../screens/main/profileScreen/ReviewsScreen';
import SellerProfileScreen from '../screens/main/searchScreen/SellerProfileScreen';
import CheckoutScreen from '../screens/main/profileScreen/CheckoutScreen';
import OrderConfirmationScreen from '../screens/main/profileScreen/settingScreen/OrderConfirmationScreen';
import SearchResultsScreen from '../screens/main/searchScreen/SearchResultsScreen';
import EditProfileScreen from '../screens/main/profileScreen/myPageScreen/EditProfileScreen';
import AddressBookScreen from '../screens/main/profileScreen/settingScreen/addressScreen/AddressBookScreen';
import SelectAddressScreen from '../screens/main/profileScreen/settingScreen/addressScreen/SelectAddressScreen';
import AddNewAddressScreen from '../screens/main/profileScreen/settingScreen/addressScreen/AddNewAddressScreen';
import EditAddressScreen from '../screens/main/profileScreen/settingScreen/addressScreen/EditAddressScreen';
import EditFinanceAddressScreen from '../screens/main/profileScreen/settingScreen/EditFinanceAddressScreen';
import PaymentMethodsScreen from '../screens/main/profileScreen/settingScreen/PaymentMethodsScreen';
import AddPaymentMethodScreen from '../screens/main/profileScreen/settingScreen/AddPaymentMethodScreen';
import OrderHistoryScreen from '../screens/main/profileScreen/settingScreen/OrderHistoryScreen';
import WishlistScreen from '../screens/main/WishlistScreen';
import ProfileSettingsScreen from '../screens/main/profileScreen/myPageScreen/ProfileSettingsScreen';
import HelpCenterScreen from '../screens/main/profileScreen/settingScreen/helpScreen/HelpCenterScreen';
import HelpSearchScreen from '../screens/main/profileScreen/settingScreen/helpScreen/HelpSearchScreen';
import HelpSectionScreen from '../screens/main/profileScreen/settingScreen/helpScreen/HelpSectionScreen';
import HelpArticleScreen from '../screens/main/profileScreen/settingScreen/helpScreen/HelpArticleScreen';
import LanguageSettingsScreen from '../screens/main/profileScreen/LanguageSettingsScreen';
import PaymentScreen from '../screens/main/profileScreen/settingScreen/PaymentScreen';
import AddAddressScreen from '../screens/main/profileScreen/settingScreen/addressScreen/AddAddressScreen';
// import EditProductScreen from '../screens/main/EditProductScreen'; // Temporarily removed due to missing module
// Order screens
import MyOrdersScreen from '../screens/main/profileScreen/settingScreen/OrderHistoryScreen';
import LeaveFeedbackScreen from '../screens/main/profileScreen/LeaveFeedbackScreen';
// Settings screens
import LocationScreen from '../screens/main/profileScreen/LocationScreen';
import PrivacyPolicyScreen from '../screens/main/profileScreen/PrivacyPolicyScreen';
import ChangePasswordScreen from '../screens/main/profileScreen/myPageScreen/ChangePasswordScreen';
import AffiliateMarketingScreen from '../screens/main/profileScreen/myPageScreen/AffiliateMarketingScreen';
import UnitSettingsScreen from '../screens/main/profileScreen/myPageScreen/UnitSettingsScreen';
import PaymentPasswordScreen from '../screens/main/profileScreen/myPageScreen/PaymentPasswordScreen';
import DepositScreen from '../screens/main/profileScreen/depositScreen/DepositScreen';
import ChargeScreen from '../screens/main/profileScreen/depositScreen/ChargeScreen';
import PointDetailScreen from '../screens/main/profileScreen/depositScreen/PointDetailScreen';
import CouponScreen from '../screens/main/profileScreen/depositScreen/CouponScreen';
import BuyListScreen from '../screens/main/profileScreen/settingScreen/BuyListScreen';
import ProblemProductScreen from '../screens/main/profileScreen/settingScreen/ProblemProductScreen';
import NoteScreen from '../screens/main/profileScreen/NoteScreen';
import LeaveNoteScreen from '../screens/main/profileScreen/LeaveNoteScreen';
import ShareAppScreen from '../screens/main/profileScreen/settingScreen/ShareAppScreen';
// Chat screens
import ChatScreen from '../screens/main/chatScreen/ChatScreen';
import ChatErrorBoundary from '../components/ChatErrorBoundary';
import ChatSettingsScreen from '../screens/main/chatScreen/ChatSettingsScreen';
// import EditProductScreen from '../screens/main/EditProductScreen';
import CategoryTabScreen from '../screens/main/CategoryTabScreen';
import ProductDiscoveryScreen from '../screens/main/searchScreen/ProductDiscoveryScreen';
import SubCategoryScreen from '../screens/main/SubCategoryScreen';
import Sub2CategoryScreen from '../screens/main/Sub2CategoryScreen';
import FinanceScreen from '../screens/main/profileScreen/settingScreen/FinanceScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import ChatSearchScreen from '../screens/main/chatScreen/ChatSearchScreen';
import CustomerServiceScreen from '../screens/main/profileScreen/CustomerServiceScreen';
import OrderInquiryScreen from '../screens/main/profileScreen/OrderInquiryScreen';
import ImageSearchScreen from '../screens/main/searchScreen/ImageSearchScreen';

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
        tabBarIcon: ({ focused }) => {
          const iconColor = focused ? COLORS.text.red : COLORS.black;
          const iconSize = 24;

          if (route.name === 'Home') {
            return <HomeIcon width={iconSize} height={iconSize} color={iconColor} />;
          } else if (route.name === 'Category') {
            return <CategoryIcon width={iconSize} height={iconSize} color={iconColor} />;
          } else if (route.name === 'Live') {
            return <LiveIcon width={iconSize} height={iconSize} color={iconColor} />;
          } else if (route.name === 'Cart') {
            return <CartIcon width={iconSize} height={iconSize} color={iconColor} />;
          } else if (route.name === 'Profile') {
            return <AccountIcon width={iconSize} height={iconSize} color={iconColor} />;
          }
          return <HomeIcon width={iconSize} height={iconSize} color={iconColor} />;
        },
        tabBarLabel: ({ focused, color }) => {
          let label = '';
          if (route.name === 'Home') label = 'Home';
          else if (route.name === 'Category') label = 'Category';
          else if (route.name === 'Live') label = 'Live';
          else if (route.name === 'Cart') label = 'Cart';
          else if (route.name === 'Profile') label = 'Account';
          
          return (
            <Text
              style={{
                fontSize: 12,
                color: focused ? COLORS.text.red : COLORS.black,
                fontWeight: focused ? '600' : '400',
              }}
            >
              {label}
            </Text>
          );
        },
        tabBarActiveTintColor: COLORS.text.red,
        tabBarInactiveTintColor: COLORS.black,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 20,
          paddingTop: 8,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <MainTab.Screen name="Home" component={HomeScreen} />
      <MainTab.Screen name="Category" component={CategoryTabScreen} />
      <MainTab.Screen name="Live" component={LiveScreen} />
      <MainTab.Screen name="Cart" component={DEMO_MODE ? CartScreenDemo : CartScreen} />
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

  // Always start with Main (homepage) - app supports guest mode
  const initialRoute = 'Main';

  return (
    <RootStack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Onboarding removed - skip directly to main screens */}
      <>
        <RootStack.Screen name="Main" component={MainTabNavigator} />
        <RootStack.Screen name="Auth" component={AuthNavigator} />
          <RootStack.Screen 
            name="NotFound"
            component={NotFoundScreen}
            options={{
              headerShown: false,
              title: 'Page Not Found',
            }}
          />
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
            name="ProductDiscovery"
            component={ProductDiscoveryScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="SubCategory"
            component={SubCategoryScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen 
            name="Sub2Category"
            component={Sub2CategoryScreen}
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
            name="SelectAddress" 
            component={SelectAddressScreen}
            options={{
              headerShown: false,
              title: 'Select Address',
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

      </>
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