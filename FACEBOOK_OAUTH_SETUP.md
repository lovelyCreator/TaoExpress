# Facebook OAuth Setup Guide for TaoExpress

## Overview
This guide will help you set up Facebook Login for your TaoExpress app.

---

## Step-by-Step Setup

### 1. Create a Facebook App

1. Go to **Facebook Developers**: https://developers.facebook.com/
2. Click "My Apps" in the top right
3. Click "Create App"
4. Select "Consumer" as the app type
5. Click "Next"

### 2. Configure Basic Settings

1. **App Display Name**: `TaoExpress`
2. **App Contact Email**: Your email
3. **Business Account**: (Optional) Select if you have one
4. Click "Create App"

### 3. Add Facebook Login Product

1. In your app dashboard, find "Facebook Login"
2. Click "Set Up"
3. Select your platform:
   - For testing: Select "Web"
   - For production: Select "Android" and "iOS"

### 4. Configure Facebook Login Settings

#### For Web (Development/Testing):
1. Go to "Facebook Login" > "Settings"
2. Add Valid OAuth Redirect URIs:
   ```
   https://auth.expo.io/@YOUR_EXPO_USERNAME/taoexpress
   ```
   Replace `YOUR_EXPO_USERNAME` with your Expo username

#### For Android:
1. Go to "Settings" > "Basic"
2. Click "Add Platform" > "Android"
3. Fill in:
   - **Package Name**: `com.app.taoexpress`
   - **Class Name**: `com.app.taoexpress.MainActivity`
   - **Key Hashes**: Generate using:
     ```bash
     # For debug
     keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
     # Password: android
     
     # For release
     keytool -exportcert -alias YOUR_RELEASE_KEY_ALIAS -keystore YOUR_RELEASE_KEY_PATH | openssl sha1 -binary | openssl base64
     ```
4. Enable "Single Sign On"

#### For iOS:
1. Go to "Settings" > "Basic"
2. Click "Add Platform" > "iOS"
3. Fill in:
   - **Bundle ID**: Your iOS bundle ID
4. Enable "Single Sign On"

### 5. Get Your App ID and App Secret

1. Go to "Settings" > "Basic"
2. Copy your **App ID**
3. Click "Show" next to **App Secret** and copy it

### 6. Configure App Domains

1. In "Settings" > "Basic"
2. Add App Domains:
   ```
   auth.expo.io
   ```

### 7. Update Your Code

Update the Facebook configuration in your code:

```typescript
// src/services/socialAuth.ts
const FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID_HERE';
const FACEBOOK_REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: true, // For development with Expo Go
});
```

### 8. Update app.json

Add Facebook configuration:

```json
{
  "expo": {
    "facebookScheme": "fbYOUR_FACEBOOK_APP_ID",
    "facebookAppId": "YOUR_FACEBOOK_APP_ID",
    "facebookDisplayName": "TaoExpress"
  }
}
```

### 9. Install Facebook SDK (Optional for native builds)

```bash
npx expo install expo-facebook
```

---

## Testing Your Setup

### Test in Development:
1. Make sure your app is in "Development" mode
2. Add test users in Facebook App Dashboard:
   - Go to "Roles" > "Test Users"
   - Click "Add" to create test users
3. Use test user credentials to log in

### Common Test Scenarios:
- Login with Facebook account
- Request email and public profile permissions
- Handle login cancellation
- Handle login errors

---

## Common Issues & Solutions

### Issue 1: "App Not Set Up"
**Solution:** 
- Make sure Facebook Login product is added
- Check that your app is not in "Development" mode restrictions
- Add your account as a test user or admin

### Issue 2: "Invalid OAuth Redirect URI"
**Solution:**
1. Check console log for actual redirect URI
2. Add exact URI to Facebook Login Settings
3. Make sure no trailing slashes

### Issue 3: "Can't Load URL"
**Solution:**
- Check that App Domains includes `auth.expo.io`
- Verify OAuth redirect URIs are correct
- Make sure app is not restricted by country

### Issue 4: "Invalid Key Hash"
**Solution:**
- Regenerate key hash using the correct keystore
- Make sure to use the debug keystore for development
- Add multiple key hashes if needed (debug + release)

### Issue 5: Email Permission Denied
**Solution:**
- Some users may not grant email permission
- Handle cases where email is null
- Request only necessary permissions

---

## Permissions

### Basic Permissions (No Review Required):
- `public_profile` - User's public profile info
- `email` - User's email address

### Advanced Permissions (Require Review):
- `user_friends` - List of friends
- `user_birthday` - User's birthday
- `user_location` - User's location

**Note:** Only request permissions you actually need!

---

## App Review (For Production)

### When to Submit for Review:
- When you need permissions beyond `public_profile` and `email`
- Before making your app public
- When you have >100 users

### Review Process:
1. Go to "App Review" in dashboard
2. Click "Permissions and Features"
3. Request the permissions you need
4. Provide:
   - Detailed description of how you use each permission
   - Step-by-step instructions for reviewers
   - Video demonstration (if required)
5. Submit for review

### Review Timeline:
- Usually takes 3-7 business days
- May require additional information
- Can be rejected if use case is unclear

---

## Privacy Policy & Terms

**Required for Production:**
1. Create a Privacy Policy URL
2. Create Terms of Service URL
3. Add them in "Settings" > "Basic":
   - Privacy Policy URL
   - Terms of Service URL

---

## Going Live

### Before Publishing:
1. ✅ Complete App Review (if needed)
2. ✅ Add Privacy Policy and Terms
3. ✅ Test with multiple accounts
4. ✅ Configure production redirect URIs
5. ✅ Add production key hashes
6. ✅ Set app icon and description

### Make App Public:
1. Go to "Settings" > "Basic"
2. Toggle "App Mode" from "Development" to "Live"
3. Confirm the change

**Warning:** Once live, you can't easily switch back to development mode!

---

## Security Best Practices

1. **Never commit App Secret** to version control
2. **Use environment variables** for sensitive data
3. **Validate tokens** on your backend
4. **Implement token refresh** logic
5. **Handle token expiration** gracefully
6. **Use HTTPS** for all API calls
7. **Implement rate limiting** on your backend

---

## Useful Links

- Facebook Login Documentation: https://developers.facebook.com/docs/facebook-login
- Expo Facebook: https://docs.expo.dev/versions/latest/sdk/facebook/
- Facebook App Dashboard: https://developers.facebook.com/apps/
- Facebook Login Best Practices: https://developers.facebook.com/docs/facebook-login/best-practices

---

## Current Configuration

**App Name:** TaoExpress
**Package Name (Android):** `com.app.taoexpress`
**App Scheme:** `taoexpress`
**Current App ID:** `YOUR_FACEBOOK_APP_ID` (Update this!)

---

## Troubleshooting Checklist

- [ ] Facebook App created
- [ ] Facebook Login product added
- [ ] App ID copied to code
- [ ] Redirect URIs configured
- [ ] App Domains added
- [ ] Platform settings configured (Android/iOS)
- [ ] Key hashes added (Android)
- [ ] Test users added
- [ ] Privacy Policy added (for production)
- [ ] App reviewed (if needed)
- [ ] App mode set correctly (Development/Live)

---

**Note:** Facebook frequently updates their platform. If you encounter issues not covered here, check the official Facebook documentation for the latest information.
