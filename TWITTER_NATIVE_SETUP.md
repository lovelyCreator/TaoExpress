# Twitter (X) Authentication Setup Guide

This guide explains the Twitter authentication implementation in this app.

## Current Implementation
- **Mock Mode** - Returns test user data for development

## Why Mock Mode?

The native Twitter SDK (`@react-native-twitter-signin/twitter-signin`) is **deprecated and no longer available** in Maven repositories. Twitter has discontinued support for their native mobile SDKs.

## Production Implementation Options

For production, you have several options:

### Option 1: Backend OAuth Flow (Recommended)
Implement Twitter OAuth 2.0 through your backend server:

1. User clicks "Sign in with Twitter"
2. App redirects to your backend OAuth endpoint
3. Backend handles Twitter OAuth 2.0 with PKCE
4. Backend exchanges code for tokens securely
5. Backend returns user data to app

**Advantages:**
- ✅ Secure (tokens never exposed to client)
- ✅ Works with Twitter API v2
- ✅ Full control over authentication flow

### Option 2: Web-Based OAuth with expo-auth-session
Use `expo-auth-session` to implement OAuth 2.0 PKCE:

```typescript
// Example implementation (see socialAuth.ts for full code)
const discovery = {
  authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
  tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
};

const authRequest = new AuthSession.AuthRequest({
  clientId: TWITTER_CLIENT_ID,
  redirectUri: TWITTER_REDIRECT_URI,
  scopes: ['tweet.read', 'users.read', 'offline.access'],
  extraParams: {
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  },
});
```

**Advantages:**
- ✅ No backend required
- ✅ Uses Twitter OAuth 2.0
- ✅ Works with Expo

**Disadvantages:**
- ⚠️ Client ID exposed in app
- ⚠️ More complex setup

### Option 3: Third-Party Auth Services
Use services like Firebase Auth, Auth0, or Supabase that handle Twitter OAuth for you.

## Current Mock Implementation

The app currently returns mock data for testing:

```typescript
{
  accessToken: 'mock_twitter_token_...',
  refreshToken: 'mock_twitter_secret_...',
  userInfo: {
    id: 'twitter_user_123',
    email: 'twitteruser@twitter.com',
    name: 'Twitter Test User',
    picture: 'https://via.placeholder.com/150',
  },
}
```

## Setup for Production

### 1. Get Twitter API Credentials

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or select an existing one
3. Navigate to "Keys and tokens"
4. For OAuth 2.0, copy your **Client ID**
5. Set up OAuth 2.0 settings:
   - Type of App: Web App, Automated App or Bot
   - Callback URI: Your redirect URI
   - Website URL: Your app's website

### 2. Update Configuration

In `src/services/socialAuth.ts`, replace:

```typescript
const TWITTER_CLIENT_ID = 'YOUR_TWITTER_CLIENT_ID';
```

### 3. Build and Run

```bash
npx expo prebuild
npx expo run:android
# or
npx expo run:ios
```

## How to Use

```typescript
import { signInWithTwitter } from './services/socialAuth';

// Sign in with Twitter
const result = await signInWithTwitter();

if (result.success) {
  console.log('Access Token:', result.data.accessToken);
  console.log('User Info:', result.data.userInfo);
  // User info includes: id, email, name, picture
}
```

## Notes

- ✅ App builds successfully with prebuild method
- ✅ Currently uses mock data for testing
- ✅ Ready to integrate real OAuth when needed
- ⚠️ Native Twitter SDK is deprecated (not available)
- 💡 For production, implement backend OAuth or use expo-auth-session

## Build Commands

```bash
# Prebuild (generate native projects)
npx expo prebuild

# Build for Android
npx expo run:android

# Build for iOS
npx expo run:ios
```
