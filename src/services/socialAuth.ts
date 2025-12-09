import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import React from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { SocialLoginOptions, SocialLoginResult } from '../types';

// Handle redirect URI for OAuth
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
// IMPORTANT: You need BOTH Web Client ID AND Android Client ID in Google Cloud Console
// Web Client ID - for getting ID tokens
const GOOGLE_WEB_CLIENT_ID = '504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = "https://auth.expo.io/@roy_hensley/todaymall";

// Configure Google Sign-In
// IMPORTANT: Create an Android OAuth Client in Google Cloud Console with:
// - Package name: com.app.todaymall (must match build.gradle)
// - SHA-1: Get from running: cd android && gradlew.bat signingReport
// 
// You need BOTH:
// 1. Web OAuth Client (for backend) - webClientId below
// 2. Android OAuth Client (for mobile) - with SHA-1 fingerprint



GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});



// Facebook OAuth Configuration
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';
const FACEBOOK_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.glowmify.app://oauthredirect',
});

// Apple OAuth Configuration
const APPLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.glowmify.app://oauthredirect',
});
// Twitter OAuth 2.0 Configuration
const TWITTER_CLIENT_ID = 'dURqNDZQVDRTQjJYbWt2cUwtOFU6MTpjaQ';
const TWITTER_CLIENT_SECRET = '7KcFO61dXldQA8Em1JQqWJK4VaJqL-DO46e25gObmnPGHbrfgZ';
const TWITTER_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.app.todaymall://oauthredirect',
});
const KAKAO_CLIENT_ID = 'YOUR_KAKAO_REST_API_KEY';
const KAKAO_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.glowmify.app://oauthredirect',
});

// Generate random string for PKCE
const generateRandomString = async (length: number = 32): Promise<string> => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  
  // Use expo-crypto to generate random values
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  
  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }
  
  return result;
};

// Generate SHA256 hash for PKCE
const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const hashed = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  
  // Convert base64 to base64url encoding
  return hashed
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Google Sign In with native modal and backend integration
export const signInWithGoogle = async () => {
  
  try {
    // Check if Play Services are available (Android only)
    await GoogleSignin.hasPlayServices();
    console.log("Google Signin Start");
    
    // Sign in with Google - this shows the native Google Sign-In modal
    const response = await GoogleSignin.signIn();
    
    console.log('Google Sign-In Success:', response);

    // Check if sign-in was successful
    if (!response || !response.data) {
      console.log('Google Sign-In: No response data');
      return {
        success: false,
        error: 'Sign-in failed - no response data',
      };
    }

    // Get ID token directly from response (more reliable)
    const idToken = response.data.idToken;
    
    if (!idToken) {
      console.log('Google Sign-In: No ID token in response');
      return {
        success: false,
        error: 'Failed to get authentication token',
      };
    }
    
    console.log("Google ID Token: ", idToken);

    // Send idToken to backend
    const API_BASE_URL = 'https://todaymall.co.kr/api/v1';
    const backendResponse = await fetch(`${API_BASE_URL}/auth/google/mobile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        idToken: idToken,
      }),
    });

    console.log('Backend Response Status:', backendResponse.status);
    
    // Get response text first
    const responseText = await backendResponse.text();
    console.log('Backend Response Text:', responseText.substring(0, 200));
    
    // Try to parse as JSON
    let backendData;
    try {
      backendData = JSON.parse(responseText);
      console.log('Backend Response:', backendData);
    } catch (parseError) {
      console.error('Failed to parse backend response:', parseError);
      return {
        success: false,
        error: 'Invalid response from server',
      };
    }

    // Check if backend authentication was successful
    if (!backendResponse.ok || backendData.status !== 'success') {
      return {
        success: false,
        error: backendData.message || 'Backend authentication failed',
      };
    }

    // Extract user data from backend response (same format as login)
    const { user, token, refreshToken } = backendData.data;

    return {
      success: true,
      data: {
        token: token,
        refreshToken: refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_id || user.name,
          phone: user.phone,
          avatar: user.avatar,
        },
      },
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Handle specific error codes
    if (error.code === 'SIGN_IN_CANCELLED' || error.code === '-5') {
      return {
        success: false,
        error: 'Sign-in cancelled',
      };
    } else if (error.code === 'IN_PROGRESS') {
      return {
        success: false,
        error: 'Sign-in already in progress',
      };
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      return {
        success: false,
        error: 'Google Play Services not available',
      };
    } else if (error.code === 'SIGN_IN_REQUIRED' || error.message?.includes('getTokens requires')) {
      return {
        success: false,
        error: 'Sign-in was not completed',
      };
    } else if (error.code === 'DEVELOPER_ERROR') {
      return {
        success: false,
        error: 'Configuration error - Please check SHA-1 fingerprint in Firebase Console',
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Facebook Sign In
export const signInWithFacebook = async () => {
  try {
    // Generate PKCE codes
    const codeVerifier = await generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Create discovery document
    const discovery = {
      authorizationEndpoint: 'https://www.facebook.com/v17.0/dialog/oauth',
      tokenEndpoint: 'https://graph.facebook.com/v17.0/oauth/access_token',
    };

    // Create auth request
    const authRequest = new AuthSession.AuthRequest({
      clientId: FACEBOOK_APP_ID,
      redirectUri: FACEBOOK_REDIRECT_URI,
      scopes: ['public_profile', 'email'],
      extraParams: {
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      },
    });

    // Perform the authentication
    const response = await authRequest.promptAsync(discovery, {
      windowFeatures: { width: 500, height: 600 },
    });

    if (response.type === 'success') {
      // Exchange code for token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          code: response.params.code,
          clientId: FACEBOOK_APP_ID,
          redirectUri: FACEBOOK_REDIRECT_URI,
          extraParams: {
            code_verifier: codeVerifier,
          },
        },
        discovery
      );

      // Get user info
      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenResponse.accessToken}`
      );

      const userInfo = await userInfoResponse.json();

      return {
        success: true,
        data: {
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          userInfo: {
            id: userInfo.id,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture?.data?.url,
          },
        },
      };
    } else {
      return {
        success: false,
        error: 'Authentication cancelled',
      };
    }
  } catch (error) {
    console.error('Facebook Sign-In Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Apple Sign In (iOS only)
export const signInWithApple = async () => {
  // Apple Sign In is only available on iOS
  if (Platform.OS !== 'ios') {
    return {
      success: false,
      error: 'Apple Sign-In is only available on iOS devices',
    };
  }

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    return {
      success: true,
      data: {
        accessToken: credential.identityToken,
        refreshToken: null,
        userInfo: {
          id: credential.user,
          email: credential.email,
          name: credential.fullName?.givenName + ' ' + credential.fullName?.familyName,
          picture: null,
        },
      },
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      return {
        success: false,
        error: 'Authentication cancelled',
      };
    }
    console.error('Apple Sign-In Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Social login hook (similar to useMutation pattern)

export const useSocialLogin = (options?: SocialLoginOptions): SocialLoginResult => {
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSuccess, setIsSuccess] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const mutate = async (provider: 'google' | 'facebook' | 'apple' | 'twitter' | 'kakao') => {
    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'apple':
          result = await signInWithApple();
          break;
        case 'twitter':
          result = await signInWithTwitter();
          break;
        case 'kakao':
          result = await signInWithKakao();
          break;
        default:
          throw new Error('Unsupported provider');
      }

      if (result.success) {
        setData(result.data);
        setIsSuccess(true);
        options?.onSuccess?.(result.data);
      } else {
        setError(result.error || 'Authentication failed');
        setIsError(true);
        options?.onError?.(result.error || 'Authentication failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsError(true);
      options?.onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
  };
};

// Twitter Sign In with OAuth 2.0 PKCE
export const signInWithTwitter = async () => {
  try {
    console.log('Twitter Sign-In: Starting OAuth 2.0 authentication');
    console.log('Twitter Redirect URI:', TWITTER_REDIRECT_URI);
    
    // Generate PKCE codes
    const codeVerifier = await generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    console.log('Twitter: PKCE codes generated');
    
    // Twitter OAuth 2.0 endpoints
    const discovery = {
      authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    };
    
    // Create auth request with PKCE
    const authRequest = new AuthSession.AuthRequest({
      clientId: TWITTER_CLIENT_ID,
      redirectUri: TWITTER_REDIRECT_URI,
      scopes: ['tweet.read', 'users.read', 'offline.access'],
      extraParams: {
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      },
    });
    
    console.log('Twitter: Prompting user for authentication');
    
    // Prompt user for authentication
    const response = await authRequest.promptAsync(discovery, {
      windowFeatures: { width: 500, height: 600 },
    });
    
    console.log('Twitter: Auth response received:', response.type);
    
    if (response.type === 'success') {
      console.log('Twitter: Exchanging code for token');
      
      // Exchange code for token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          code: response.params.code,
          clientId: TWITTER_CLIENT_ID,
          redirectUri: TWITTER_REDIRECT_URI,
          extraParams: {
            code_verifier: codeVerifier,
          },
        },
        discovery
      );
      
      console.log('Twitter: Token received, fetching user info');
      
      // Get user info from Twitter API v2
      const userInfoResponse = await fetch(
        'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username',
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`,
          },
        }
      );
      
      const userInfoData = await userInfoResponse.json();
      console.log('Twitter: User info received:', userInfoData);
      
      const userInfo = userInfoData.data;
      
      return {
        success: true,
        data: {
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken || null,
          userInfo: {
            id: userInfo?.id || '',
            email: '', // Twitter OAuth 2.0 doesn't provide email by default
            name: userInfo?.name || userInfo?.username || '',
            picture: userInfo?.profile_image_url || null,
          },
        },
      };
    }
    
    console.log('Twitter: Authentication cancelled by user');
    return {
      success: false,
      error: 'Authentication cancelled',
    };
  } catch (error) {
    console.error('Twitter Sign-In Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

export const signInWithKakao = async () => {
  try {
    const codeVerifier = await generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const discovery = {
      authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize',
      tokenEndpoint: 'https://kauth.kakao.com/oauth/token',
    };
    const authRequest = new AuthSession.AuthRequest({
      clientId: KAKAO_CLIENT_ID,
      redirectUri: KAKAO_REDIRECT_URI,
      scopes: ['profile', 'account_email'],
      extraParams: {
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      },
    });
    const response = await authRequest.promptAsync(discovery, {
      windowFeatures: { width: 500, height: 600 },
    });
    if (response.type === 'success') {
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          code: response.params.code,
          clientId: KAKAO_CLIENT_ID,
          redirectUri: KAKAO_REDIRECT_URI,
          extraParams: { code_verifier: codeVerifier },
        },
        discovery
      );
      const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
      });
      const userInfo = await userInfoResponse.json();
      return {
        success: true,
        data: {
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          userInfo: {
            id: String(userInfo.id),
            email: userInfo.kakao_account?.email || '',
            name: userInfo.properties?.nickname || '',
            picture: userInfo.properties?.profile_image || null,
          },
        },
      };
    }
    return { success: false, error: 'Authentication cancelled' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};
