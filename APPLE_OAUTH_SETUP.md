# Apple Sign In Setup Guide for TaoExpress

## Overview
Apple Sign In is required for iOS apps that offer other social login options. This guide covers setup for both iOS and web.

---

## Prerequisites

- **Apple Developer Account** ($99/year)
- **Xcode** (for iOS development)
- **iOS device or simulator** (iOS 13+)

---

## Step-by-Step Setup

### 1. Configure App ID in Apple Developer Portal

1. Go to **Apple Developer Portal**: https://developer.apple.com/account/
2. Navigate to "Certificates, Identifiers & Profiles"
3. Click "Identifiers"
4. Click the "+" button to create a new identifier (or select existing)
5. Select "App IDs" and click "Continue"
6. Select "App" and click "Continue"
7. Fill in:
   - **Description**: `TaoExpress`
   - **Bundle ID**: `com.app.taoexpress` (Explicit)
8. Scroll down and enable "Sign in with Apple"
9. Click "Continue" and then "Register"

### 2. Create a Service ID (For Web/Android)

1. In "Identifiers", click "+" again
2. Select "Services IDs" and click "Continue"
3. Fill in:
   - **Description**: `TaoExpress Web`
   - **Identifier**: `com.app.taoexpress.service`
4. Enable "Sign in with Apple"
5. Click "Configure" next to "Sign in with Apple"
6. Configure:
   - **Primary App ID**: Select your app ID
   - **Domains and Subdomains**: Add:
     ```
     auth.expo.io
     ```
   - **Return URLs**: Add:
     ```
     https://auth.expo.io/@YOUR_EXPO_USERNAME/taoexpress
     ```
7. Click "Save" and then "Continue"
8. Click "Register"

### 3. Create a Key for Sign in with Apple

1. Go to "Keys" in the left sidebar
2. Click the "+" button
3. Fill in:
   - **Key Name**: `TaoExpress Sign in with Apple Key`
4. Enable "Sign in with Apple"
5. Click "Configure" next to "Sign in with Apple"
6. Select your Primary App ID
7. Click "Save"
8. Click "Continue" and then "Register"
9. **Download the key file** (.p8) - You can only download this once!
10. Note your **Key ID** (10 characters)
11. Note your **Team ID** (found in top right of developer portal)

---

## iOS Setup

### 1. Update app.json

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.app.taoexpress",
      "usesAppleSignIn": true
    }
  }
}
```

### 2. Install Expo Apple Authentication

```bash
npx expo install expo-apple-authentication
```

### 3. Code Implementation

The code is already implemented in `src/services/socialAuth.ts`:

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

export const signInWithApple = async () => {
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
        userInfo: {
          id: credential.user,
          email: credential.email,
          name: `${credential.fullName?.givenName} ${credential.fullName?.familyName}`,
        },
      },
    };
  } catch (error) {
    // Handle error
  }
};
```

### 4. Build and Test

```bash
# Create a development build
eas build --profile development --platform ios

# Or build locally
npx expo run:ios
```

**Note:** Apple Sign In does NOT work in Expo Go! You must use a development build or standalone app.

---

## Android/Web Setup (Optional)

Apple Sign In can work on Android/Web using the Service ID:

### 1. Update Configuration

```typescript
// For web/Android, you'll need to implement JWT verification
const APPLE_CLIENT_ID = 'com.app.taoexpress.service'; // Your Service ID
const APPLE_REDIRECT_URI = 'https://auth.expo.io/@YOUR_EXPO_USERNAME/taoexpress';
```

### 2. Backend Verification Required

For web/Android, you need a backend to:
1. Verify the identity token
2. Exchange authorization code for tokens
3. Validate the user

---

## Testing Apple Sign In

### Test Scenarios:

1. **First Time Sign In**:
   - User sees Apple Sign In prompt
   - User can choose to share or hide email
   - User can edit their name
   - App receives user data

2. **Subsequent Sign Ins**:
   - User sees simplified prompt
   - No user data returned (only user ID)
   - Must handle this case!

3. **Hide My Email**:
   - User chooses to hide email
   - Apple provides relay email: `xyz@privaterelay.appleid.com`
   - Your app must handle relay emails

4. **Sign In Cancellation**:
   - User cancels the prompt
   - Handle gracefully

---

## Important Considerations

### 1. User Data Only Provided Once
**Critical:** Apple only provides name and email on the FIRST sign in!

```typescript
// Store user data immediately on first sign in
if (credential.email) {
  // This is the first sign in - save this data!
  await saveUserData({
    id: credential.user,
    email: credential.email,
    name: credential.fullName,
  });
}
```

### 2. Handle Missing Email
Users can choose to hide their email:

```typescript
if (!credential.email) {
  // User chose to hide email
  // You must handle this case
  // Consider asking for email separately
}
```

### 3. Verify Identity Token
Always verify the identity token on your backend:

```typescript
// Backend verification (Node.js example)
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

jwt.verify(identityToken, getKey, {
  issuer: 'https://appleid.apple.com',
  audience: 'com.app.taoexpress',
}, (err, decoded) => {
  if (err) {
    // Invalid token
  } else {
    // Valid token - decoded contains user info
  }
});
```

---

## Common Issues & Solutions

### Issue 1: "Sign in with Apple is not available"
**Solution:**
- Only works on iOS 13+
- Must use development build or standalone app (not Expo Go)
- Check that capability is enabled in Xcode

### Issue 2: "Invalid Client"
**Solution:**
- Verify Bundle ID matches exactly
- Check that Service ID is configured correctly
- Ensure domains and return URLs are correct

### Issue 3: "User Data Not Returned"
**Solution:**
- This is normal for subsequent sign ins
- Store user data on first sign in
- Use the user ID to look up stored data

### Issue 4: "Email is Null"
**Solution:**
- User chose to hide email
- Handle this case in your app
- Consider making email optional or asking separately

### Issue 5: "Token Verification Failed"
**Solution:**
- Check that audience matches your Bundle ID or Service ID
- Verify issuer is `https://appleid.apple.com`
- Ensure token hasn't expired

---

## App Store Review Requirements

### Apple's Requirements:
1. **Must offer Apple Sign In** if you offer other social logins
2. **Equivalent functionality** - Don't give advantages to other sign-in methods
3. **Prominent placement** - Apple Sign In button should be visible
4. **Follow design guidelines** - Use official Apple Sign In button

### Design Guidelines:
- Use official Apple Sign In button
- Don't modify the button appearance
- Place it above or at same level as other sign-in options
- Follow Human Interface Guidelines

---

## Button Design

### Official Button Styles:
```typescript
import { AppleAuthenticationButton } from 'expo-apple-authentication';

// White button with black text
<AppleAuthenticationButton
  buttonType={AppleAuthenticationButton.Type.SIGN_IN}
  buttonStyle={AppleAuthenticationButton.Style.WHITE}
  cornerRadius={5}
  onPress={handleAppleSignIn}
/>

// Black button with white text
<AppleAuthenticationButton
  buttonType={AppleAuthenticationButton.Type.SIGN_IN}
  buttonStyle={AppleAuthenticationButton.Style.BLACK}
  cornerRadius={5}
  onPress={handleAppleSignIn}
/>
```

---

## Security Best Practices

1. **Always verify tokens** on your backend
2. **Store user data** on first sign in
3. **Handle relay emails** properly
4. **Implement token refresh** if needed
5. **Use HTTPS** for all communications
6. **Don't trust client-side** validation alone
7. **Implement rate limiting** on your backend

---

## Useful Links

- Apple Sign In Documentation: https://developer.apple.com/sign-in-with-apple/
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
- Expo Apple Authentication: https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- Token Verification: https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user

---

## Current Configuration

**Bundle ID:** `com.app.taoexpress`
**Service ID:** `com.app.taoexpress.service` (Create this!)
**Team ID:** (Get from Apple Developer Portal)
**Key ID:** (Get after creating key)

---

## Checklist

- [ ] Apple Developer Account active
- [ ] App ID created with Sign in with Apple enabled
- [ ] Service ID created (for web/Android)
- [ ] Key created and downloaded
- [ ] Team ID and Key ID noted
- [ ] app.json updated with usesAppleSignIn
- [ ] expo-apple-authentication installed
- [ ] Development build created (not using Expo Go)
- [ ] Backend token verification implemented
- [ ] User data storage implemented
- [ ] Tested on real iOS device
- [ ] Button follows design guidelines
- [ ] App Store review guidelines followed

---

**Important:** Apple Sign In requires a paid Apple Developer account and does NOT work in Expo Go. You must create a development build or standalone app to test this feature.
