# Google Sign-In Setup Guide - Fix DEVELOPER_ERROR

## Problem
You're getting `DEVELOPER_ERROR` because the SHA-1 certificate fingerprint is not properly configured in Google Cloud Console.

## Solution Steps

### Step 1: Get Your SHA-1 Fingerprints

Run these commands in your project root:

#### For Debug Build (Development)
```bash
cd android
./gradlew signingReport
```

Or on Windows:
```bash
cd android
gradlew.bat signingReport
```

Look for the **debug** variant and copy the **SHA1** fingerprint.

#### For Release Build (Production)
If you have a keystore file (`@roy_hensley__Glowmify.jks`), get its SHA-1:

```bash
keytool -list -v -keystore @roy_hensley__Glowmify.jks -alias glowmify
```

Enter your keystore password when prompted.

### Step 2: Add SHA-1 to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon)
4. Scroll down to **Your apps** section
5. Click on your Android app (`com.app.todaymall`)
6. Click **Add fingerprint**
7. Paste your SHA-1 fingerprint
8. Click **Save**

**Important:** Add BOTH debug and release SHA-1 fingerprints!

### Step 3: Download Updated google-services.json

1. After adding SHA-1 fingerprints, download the updated `google-services.json`
2. Replace the file at: `android/app/google-services.json`

### Step 4: Verify Google Cloud Console OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Find your **Android OAuth Client**
5. Verify it has:
   - **Package name:** `com.app.todaymall`
   - **SHA-1 fingerprints:** Both debug and release

If the Android OAuth Client doesn't exist, create one:
- Click **Create Credentials** > **OAuth client ID**
- Select **Android**
- Enter package name: `com.app.todaymall`
- Add your SHA-1 fingerprints
- Click **Create**

### Step 5: Clean and Rebuild

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

Or on Windows:
```bash
cd android
gradlew.bat clean
cd ..
npx react-native run-android
```

## Current Configuration

Your current setup:
- **Package Name:** `com.app.todaymall`
- **Web Client ID:** `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com`
- **SHA-1 #1:** `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **SHA-1 #2:** `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0`

## Quick Fix Command

Run this to get your current debug SHA-1:

**Windows:**
```bash
cd android && gradlew.bat signingReport && cd ..
```

**Mac/Linux:**
```bash
cd android && ./gradlew signingReport && cd ..
```

Look for output like:
```
Variant: debug
Config: debug
Store: C:\Users\YourName\.android\debug.keystore
Alias: androiddebugkey
MD5: XX:XX:XX:...
SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25  <-- Copy this
SHA-256: XX:XX:XX:...
```

## Troubleshooting

### If error persists:

1. **Check package name matches everywhere:**
   - `android/app/build.gradle` → `applicationId`
   - Firebase Console → Android app package name
   - Google Cloud Console → OAuth client package name

2. **Verify Web Client ID:**
   - Make sure you're using the **Web Client ID** (not Android Client ID) in your code
   - Current: `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com`

3. **Clear app data:**
   ```bash
   adb shell pm clear com.app.todaymall
   ```

4. **Reinstall the app:**
   ```bash
   npx react-native run-android
   ```

## Need Help?

If you're still getting the error, share:
1. Output from `gradlew signingReport`
2. Screenshot of Firebase Console SHA-1 configuration
3. Screenshot of Google Cloud Console OAuth client configuration
