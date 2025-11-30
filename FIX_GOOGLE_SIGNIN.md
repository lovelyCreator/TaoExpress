# Fix Google Sign-In DEVELOPER_ERROR

## Your Current Configuration
- **Package Name:** `com.app.taoexpress` (from build.gradle)
- **Web Client ID:** `504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com`

## The Problem
You need to create an **Android OAuth Client** in Google Cloud Console with your SHA-1 fingerprint.

## Step-by-Step Fix

### Step 1: Get Your SHA-1 Fingerprint

Run this command:
```bash
cd android
gradlew.bat signingReport
```

Copy the **SHA1** value (looks like: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`)

### Step 2: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Select your project (same project as Firebase)
3. Go to **APIs & Services** → **Credentials**

### Step 3: Create Android OAuth Client

1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth client ID"**
3. Choose **Application type:** Android
4. Fill in:
   - **Name:** TaoExpress Android
   - **Package name:** `com.app.taoexpress`
   - **SHA-1 certificate fingerprint:** [Paste your SHA-1 from Step 1]
5. Click **CREATE**

### Step 4: Verify Web OAuth Client Exists

In the same Credentials page, you should see:
- ✅ **Web client** (for web/backend) - Already exists
- ✅ **Android client** (just created) - New

**Important:** You need BOTH clients!

### Step 5: Update Firebase (if needed)

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ (Settings) → **Project Settings**
4. Scroll to **Your apps** section
5. Click on your Android app
6. Make sure SHA-1 is added there too
7. Download **google-services.json**
8. Replace `android/app/google-services.json`

### Step 6: Clean and Rebuild

```bash
# Clean the build
cd android
gradlew.bat clean
cd ..

# Clear app data
adb uninstall com.app.taoexpress

# Rebuild and run
npx react-native run-android
```

## Verification Checklist

Before testing, verify:

- [ ] Package name in `android/app/build.gradle` is `com.app.taoexpress`
- [ ] SHA-1 added to Google Cloud Console Android OAuth Client
- [ ] SHA-1 added to Firebase Console
- [ ] Downloaded latest `google-services.json` from Firebase
- [ ] Replaced `android/app/google-services.json` with new file
- [ ] Cleaned and rebuilt the app
- [ ] Uninstalled old app before testing

## Common Mistakes

1. **Wrong Package Name:** Make sure it's `com.app.taoexpress` everywhere
2. **Missing Android OAuth Client:** You need both Web AND Android clients
3. **Old google-services.json:** Must download after adding SHA-1
4. **Not cleaning:** Old builds can cache wrong config
5. **Not uninstalling:** Old app installation can cause issues

## Quick Test Commands

```bash
# 1. Get SHA-1
cd android && gradlew.bat signingReport && cd ..

# 2. Clean everything
cd android && gradlew.bat clean && cd ..

# 3. Uninstall old app
adb uninstall com.app.taoexpress

# 4. Rebuild
npx react-native run-android
```

## Still Not Working?

If you still get DEVELOPER_ERROR after following all steps:

1. **Wait 5-10 minutes** - Google Cloud changes can take time to propagate
2. **Check package name matches everywhere:**
   - build.gradle: `com.app.taoexpress`
   - Google Cloud Console: `com.app.taoexpress`
   - Firebase Console: `com.app.taoexpress`
3. **Verify you have BOTH OAuth clients:**
   - Web client (for backend)
   - Android client (for mobile app)
4. **Make sure you're using the Web Client ID in code** (not Android Client ID)

## Need Help?

Share screenshots of:
1. Google Cloud Console → Credentials page (showing both Web and Android clients)
2. Firebase Console → Project Settings → Your apps (showing SHA-1)
3. Output from `gradlew.bat signingReport`
