# Fix Google Sign-In DEVELOPER_ERROR

## Problem
Getting error: `DEVELOPER_ERROR: Follow troubleshooting instructions`

## Root Cause
Your app is signed with a different SHA-1 certificate than what's configured in Google Cloud Console.

## Your SHA-1 Certificates

You have TWO debug keystores:

### 1. App-specific keystore (android/app/debug.keystore)
```
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

### 2. System keystore (C:\Users\Sintra\.android\debug.keystore)
```
SHA1: 35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0
```

## Solution: Add BOTH SHA-1 to Google Cloud Console

### Step 1: Go to Google Cloud Console
1. Open https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Find Your Android OAuth Client
Look for the OAuth 2.0 Client ID with:
- **Type**: Android
- **Package name**: `com.app.taoexpress`

### Step 3: Add BOTH SHA-1 Certificates

Click on your Android OAuth client and add these SHA-1 certificates:

**SHA-1 Certificate 1:**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**SHA-1 Certificate 2:**
```
35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0
```

### Step 4: Save and Wait
- Click **Save**
- Wait 5-10 minutes for changes to propagate

### Step 5: Rebuild and Test
```bash
# Uninstall old app
adb uninstall com.app.taoexpress

# Rebuild and install
npx expo run:android
```

## Alternative: Use Single Keystore

If you want to use only ONE keystore, configure the app to use the system keystore:

### Update android/app/build.gradle

Find the `signingConfigs` section and update it:

```gradle
signingConfigs {
    debug {
        storeFile file(System.getProperty('user.home') + '/.android/debug.keystore')
        storePassword 'android'
        keyAlias 'AndroidDebugKey'
        keyPassword 'android'
    }
}
```

Then rebuild:
```bash
npx expo prebuild --clean
npx expo run:android
```

## Verify Configuration

After adding SHA-1 certificates, verify in Google Cloud Console:

1. Go to **Credentials**
2. Click on your Android OAuth client
3. You should see:
   - **Package name**: `com.app.taoexpress`
   - **SHA-1 certificates**: Both certificates listed

## Test Google Sign-In

1. Open the app
2. Tap "Google" button
3. Should open Google account picker
4. Select account
5. Should successfully sign in

## Common Issues

### Still getting DEVELOPER_ERROR?
- Wait 10-15 minutes after adding SHA-1
- Clear app data: Settings → Apps → TaoExpress → Clear Data
- Uninstall and reinstall app
- Check package name matches exactly: `com.app.taoexpress`

### Wrong package name?
Make sure `android/app/build.gradle` has:
```gradle
defaultConfig {
    applicationId "com.app.taoexpress"
    // ...
}
```

### Wrong Web Client ID?
In `src/services/socialAuth.ts`, verify:
```typescript
const GOOGLE_WEB_CLIENT_ID = '504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com';
```

This should match the **Web Client ID** from Google Cloud Console (NOT the Android Client ID).

## Quick Checklist

- [ ] Added SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] Added SHA-1: `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0`
- [ ] Package name is `com.app.taoexpress`
- [ ] Waited 10 minutes after saving
- [ ] Uninstalled old app
- [ ] Rebuilt app with `npx expo run:android`
- [ ] Tested Google Sign-In

## Success!
Once configured correctly, Google Sign-In should work without DEVELOPER_ERROR.
