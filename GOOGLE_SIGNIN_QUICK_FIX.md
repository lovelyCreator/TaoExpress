# Google Sign-In Quick Fix - DEVELOPER_ERROR

## Problem
Getting `DEVELOPER_ERROR` when trying to sign in with Google.

## Quick Solution (5 minutes)

### Step 1: Add Missing SHA-1 to Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your **Android OAuth Client** (package: `com.app.taoexpress`)
5. Click **Edit** (pencil icon)
6. Add this SHA-1 certificate (if not already there):

```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

7. You should now have TWO SHA-1 certificates:
   - `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` ← ADD THIS
   - `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0` ← Already there

8. Click **Save**

### Step 2: Wait 5-10 Minutes
Google needs time to propagate the changes.

### Step 3: Rebuild App
```bash
# Stop the current build process
# Then rebuild:
npx expo run:android
```

### Step 4: Test
1. Open app
2. Tap "Google" button
3. Google account picker should appear
4. Select your account
5. App should log you in and navigate to main screen

## What Happens Now

### Flow:
1. User taps "Google" button
2. ✅ Google Sign-In modal opens (real Google auth)
3. ✅ User selects Google account
4. ✅ App gets Google tokens and user info
5. ✅ App sends data to your backend API
6. ✅ Backend returns user token
7. ✅ App stores token and user data
8. ✅ App updates login status
9. ✅ App navigates to Main screen (logged in!)

## Current Configuration

**Package Name:** `com.app.taoexpress`

**Web Client ID:** `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com`

**SHA-1 Certificates (both required):**
- `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0`

## Backend API

The app calls your backend at:
```
POST /api/v1/auth/social-login
```

With:
```json
{
  "provider": "google",
  "access_token": "ya29.a0...",
  "email": "user@gmail.com",
  "name": "User Name",
  "provider_id": "1234567890",
  "guest_id": "12345"
}
```

Currently using **MOCK DATA** - see `GOOGLE_SIGNIN_BACKEND_INTEGRATION.md` to enable real backend.

## Troubleshooting

### Still getting DEVELOPER_ERROR?
- Wait 10-15 minutes after adding SHA-1
- Clear app data: Settings → Apps → TaoExpress → Clear Data
- Uninstall and reinstall app
- Verify both SHA-1 certificates are in Google Cloud Console

### Google modal doesn't open?
- Check Play Services are installed on device/emulator
- Check internet connection
- Check console logs for errors

### App doesn't navigate after sign-in?
- Check console logs for "Social login successful"
- Verify backend API is responding
- Check AuthContext is being updated

## Success Indicators

You'll know it's working when:
- ✅ Google account picker opens
- ✅ Console shows "Google Sign-In Success"
- ✅ Console shows "Social login successful"
- ✅ App navigates to Main screen
- ✅ User stays logged in after app restart

## Code Changes Made

1. ✅ Enabled real Google Sign-In (not mock)
2. ✅ Configured GoogleSignin with Web Client ID
3. ✅ LoginScreen calls backend API after Google auth
4. ✅ AuthContext updated with user data
5. ✅ Navigation to Main screen on success

Everything is ready - just add the SHA-1 to Google Cloud Console!
