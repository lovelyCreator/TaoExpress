# Google Sign-In Setup Guide

## Error: DEVELOPER_ERROR

This error occurs because you need BOTH a Web OAuth Client AND an Android OAuth Client in Google Cloud Console.

## Your Configuration Details

- **Package Name**: `com.app.taoexpress`
- **SHA-1 Fingerprint**: `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0`
- **Web Client ID**: `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com`

## Steps to Fix:

### 1. Get Your SHA-1 Certificate Fingerprint

Open a new Command Prompt (not PowerShell) and run:

```cmd
cd %USERPROFILE%\.android
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Look for the **SHA1** line in the output. It will look like:
```
SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
```

Copy this SHA-1 fingerprint.

### 2. Add SHA-1 to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (the one with ID: `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7`)
5. Click on it to edit
6. Scroll down to **SHA-1 certificate fingerprints**
7. Click **+ ADD FINGERPRINT**
8. Paste your SHA-1 fingerprint
9. Add your package name: `com.app.taoexpress`
10. Click **SAVE**

### 3. **REQUIRED**: Create Android OAuth Client

You MUST have a separate Android OAuth Client (in addition to the Web client):

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Android** as application type
4. Enter:
   - **Name**: TaoExpress Android
   - **Package name**: `com.app.taoexpress`
   - **SHA-1 certificate fingerprint**: `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0`
5. Click **CREATE**

**IMPORTANT**: You need BOTH:
- ✅ Web OAuth Client (for webClientId in code)
- ✅ Android OAuth Client (for native sign-in to work)

### 4. Wait and Test

- Wait 5-10 minutes for Google to propagate the changes
- Rebuild your app: `npx expo run:android`
- Test the Google Sign-In button

## Current Configuration

- **Package Name**: `com.app.taoexpress`
- **Web Client ID**: `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com`

## Troubleshooting

If you still get the error:

1. Make sure you're using the **Web Client ID** (not Android Client ID) in the code
2. Verify the package name matches exactly: `com.app.taoexpress`
3. Check that SHA-1 is added to the correct OAuth client
4. Try clearing app data and cache
5. Rebuild the app completely: `npx expo prebuild --clean && npx expo run:android`

## Quick SHA-1 Command (Copy-Paste)

```cmd
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android | findstr SHA1
```

This will show only the SHA-1 line.


## Checklist - Make Sure You Have:

- [ ] **Web OAuth Client** created with Client ID: `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7`
- [ ] **Android OAuth Client** created with:
  - Package name: `com.app.taoexpress`
  - SHA-1: `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0`
- [ ] Waited 5-10 minutes after creating/updating credentials
- [ ] Rebuilt the app: `npx expo run:android`
- [ ] Cleared app data on device/emulator

## How to Verify Your Setup

1. Go to Google Cloud Console → Credentials
2. You should see TWO OAuth 2.0 Client IDs:
   - One with type "Web application"
   - One with type "Android"
3. Click on the Android one and verify:
   - Package name matches: `com.app.taoexpress`
   - SHA-1 is listed: `35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0`

## Still Not Working?

Try these additional steps:

1. **Uninstall and reinstall the app**:
   ```bash
   adb uninstall com.app.taoexpress
   npx expo run:android
   ```

2. **Check Google Play Services** on your emulator/device is up to date

3. **Verify the Web Client ID** in your code matches the one in Google Cloud Console

4. **Enable Google Sign-In API**:
   - Go to APIs & Services → Library
   - Search for "Google Sign-In API"
   - Make sure it's enabled

5. **Check OAuth consent screen**:
   - Go to APIs & Services → OAuth consent screen
   - Make sure it's configured with your app details
   - Add test users if in testing mode

## Common Mistakes

❌ Only creating a Web OAuth Client (you need Android too)
❌ Wrong package name (must be exactly `com.app.taoexpress`)
❌ Wrong SHA-1 fingerprint
❌ Not waiting for Google to propagate changes (5-10 minutes)
❌ Using release keystore SHA-1 instead of debug keystore
