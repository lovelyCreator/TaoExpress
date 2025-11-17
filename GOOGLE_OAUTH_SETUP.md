# Google OAuth Setup Guide for TaoExpress

## Current Error
**Error 400: invalid_request - Access blocked: Authorization Error**

This error occurs because Google OAuth requires proper configuration. Here's how to fix it:

---

## Step-by-Step Solution

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Select or Create a Project
- If you don't have a project, create one named "TaoExpress"
- Select your project from the dropdown

### 3. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" or "Google Identity"
- Click "Enable"

### 4. Configure OAuth Consent Screen
Go to "APIs & Services" > "OAuth consent screen"

**For Development/Testing:**
- Select "External" user type
- Click "Create"
- Fill in required fields:
  - App name: `TaoExpress`
  - User support email: Your email
  - Developer contact: Your email
- Click "Save and Continue"
- Skip "Scopes" (or add: email, profile, openid)
- Add test users (your email addresses for testing)
- Click "Save and Continue"

**Important:** Apps in "Testing" mode can only be used by test users you add!

### 5. Create OAuth 2.0 Credentials

#### For Web (Development with Expo Go):
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Name it: "TaoExpress Web"
5. Add Authorized redirect URIs:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/taoexpress
   ```
   Replace `YOUR_EXPO_USERNAME` with your actual Expo username

6. Click "Create"
7. Copy the Client ID

#### For Android (Production):
1. Create another OAuth client ID
2. Select "Android"
3. Name it: "TaoExpress Android"
4. Package name: `com.app.taoexpress`
5. Get SHA-1 certificate fingerprint:
   ```bash
   # For debug builds
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # For release builds (use your actual keystore)
   keytool -list -v -keystore /path/to/your/keystore.jks -alias your-key-alias
   ```
6. Paste the SHA-1 fingerprint
7. Click "Create"

#### For iOS (Production):
1. Create another OAuth client ID
2. Select "iOS"
3. Name it: "TaoExpress iOS"
4. Bundle ID: Get from your iOS app configuration
5. Click "Create"

### 6. Update Your Code

Update the Client ID in your code:

```typescript
// src/services/socialAuth.ts
const GOOGLE_CLIENT_ID = 'YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com';
```

### 7. Update Redirect URI Configuration

The code has been updated to use Expo's proxy for development:

```typescript
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: true, // Use Expo's proxy for development
});
```

### 8. Test the Configuration

Run your app and check the console for the redirect URI:
```
console.log("Redirect URI:", GOOGLE_REDIRECT_URI);
```

Then add this exact URI to your Google Cloud Console:
- Go to your Web OAuth client
- Add the logged URI to "Authorized redirect URIs"
- Click "Save"

---

## Common Issues & Solutions

### Issue 1: "Access blocked" Error
**Solution:** Make sure you've added your email as a test user in the OAuth consent screen.

### Issue 2: "Redirect URI mismatch"
**Solution:** 
1. Check the console log for the actual redirect URI
2. Add it exactly to Google Cloud Console
3. Wait a few minutes for changes to propagate

### Issue 3: "App not verified"
**Solution:** For development, use "Testing" mode and add test users. For production, submit your app for verification.

### Issue 4: Using Expo Go
**Solution:** 
- Use `useProxy: true` in makeRedirectUri
- Add the Expo auth proxy URL to authorized redirect URIs:
  ```
  https://auth.expo.io/@YOUR_EXPO_USERNAME/taoexpress
  ```

### Issue 5: Using Development Build or Standalone App
**Solution:**
- Use `useProxy: false` in makeRedirectUri
- Use the custom scheme: `taoexpress://`
- Add to authorized redirect URIs:
  ```
  taoexpress://oauthredirect
  ```

---

## Current Configuration

**App Scheme:** `taoexpress`
**Package Name (Android):** `com.app.taoexpress`
**Current Client ID:** `329489503761-db8oqqkc3q63k3ilpigktbpr6tr1r7oe.apps.googleusercontent.com`

---

## For Production

When ready for production:

1. **Verify Your App:**
   - Go to OAuth consent screen
   - Click "Publish App"
   - Submit for verification (required for >100 users)

2. **Update OAuth Client:**
   - Create production OAuth clients for Android and iOS
   - Use production SHA-1 certificates
   - Update redirect URIs for production

3. **Update Code:**
   ```typescript
   const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({
     useProxy: false, // Don't use proxy in production
     native: 'taoexpress://oauthredirect',
   });
   ```

---

## Quick Fix for Testing NOW

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Add your email to "Test users"
3. Make sure the app is in "Testing" mode
4. Try signing in again with your test email

---

## Need Help?

- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- Expo Auth Session: https://docs.expo.dev/guides/authentication/
- React Native Google Sign-In: https://github.com/react-native-google-signin/google-signin

---

**Note:** Changes in Google Cloud Console can take 5-10 minutes to propagate. If you still see errors after making changes, wait a few minutes and try again.
