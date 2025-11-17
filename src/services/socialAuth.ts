import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import React from 'react';
import { SocialLoginOptions, SocialLoginResult } from '../types';

// Handle redirect URI for OAuth
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = '329489503761-db8oqqkc3q63k3ilpigktbpr6tr1r7oe.apps.googleusercontent.com';
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  // Use the scheme from your app.json/app.config.js
  // For Expo Go: uses exp://
  // For development builds: uses your custom scheme
  useProxy: true, // Use Expo's proxy for development
});
console.log("Redirect URI:", GOOGLE_REDIRECT_URI);
// Facebook OAuth Configuration
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';
const FACEBOOK_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.glowmify.app://oauthredirect',
});

// Apple OAuth Configuration
const APPLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.glowmify.app://oauthredirect',
});
const TWITTER_CLIENT_ID = 'YOUR_TWITTER_CLIENT_ID';
const TWITTER_REDIRECT_URI = AuthSession.makeRedirectUri({
  native: 'com.glowmify.app://oauthredirect',
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

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    // Generate PKCE codes
    const codeVerifier = await generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Create discovery document
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
    };

    // Create auth request
    const authRequest = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      redirectUri: GOOGLE_REDIRECT_URI,
      scopes: ['openid', 'profile', 'email'],
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
          clientId: GOOGLE_CLIENT_ID,
          redirectUri: GOOGLE_REDIRECT_URI,
          extraParams: {
            code_verifier: codeVerifier,
          },
        },
        discovery
      );

      // Get user info
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
        }
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
            picture: userInfo.picture,
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
    console.error('Google Sign-In Error:', error);
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

export const signInWithTwitter = async () => {
  try {
    const codeVerifier = await generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const discovery = {
      authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    };
    const authRequest = new AuthSession.AuthRequest({
      clientId: TWITTER_CLIENT_ID,
      redirectUri: TWITTER_REDIRECT_URI,
      scopes: ['openid', 'profile', 'email'],
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
          clientId: TWITTER_CLIENT_ID,
          redirectUri: TWITTER_REDIRECT_URI,
          extraParams: { code_verifier: codeVerifier },
        },
        discovery
      );
      const userInfoResponse = await fetch('https://api.twitter.com/2/users/me', {
        headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
      });
      const userInfo = await userInfoResponse.json();
      return {
        success: true,
        data: {
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          userInfo: {
            id: userInfo.data?.id || userInfo.id,
            email: userInfo.data?.email || userInfo.email,
            name: userInfo.data?.name || userInfo.name,
            picture: userInfo.data?.profile_image_url || null,
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
