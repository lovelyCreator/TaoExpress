# Kakao OAuth Setup Guide for TaoExpress

## Overview
Kakao is a popular social login platform in South Korea. This guide covers setting up Kakao Login for your TaoExpress app.

---

## Prerequisites

- **Kakao Developer Account** (Free)
- **Korean phone number** (for verification)

---

## Step-by-Step Setup

### 1. Create a Kakao Developer Account

1. Go to **Kakao Developers**: https://developers.kakao.com/
2. Click "시작하기" (Get Started) or "로그인" (Login)
3. Sign in with your Kakao account (or create one)
4. Verify your phone number if required

### 2. Create a Kakao Application

1. Go to **My Applications**: https://developers.kakao.com/console/app
2. Click "애플리케이션 추가하기" (Add Application)
3. Fill in:
   - **앱 이름** (App Name): `TaoExpress`
   - **사업자명** (Company Name): Your name or company
4. Click "저장" (Save)
5. Note your **REST API Key** (Native App Key)

### 3. Configure Platform Settings

#### For Android:
1. In your app dashboard, go to "플랫폼" (Platform)
2. Click "Android 플랫폼 등록" (Register Android Platform)
3. Fill in:
   - **패키지명** (Package Name): `com.app.taoexpress`
   - **마켓 URL** (Market URL): Your Play Store URL (optional)
   - **키 해시** (Key Hash): Generate using:
     ```bash
     # For debug
     keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore -storepass android -keypass android | openssl sha1 -binary | openssl base64
     
     # For release
     keytool -exportcert -alias YOUR_RELEASE_KEY_ALIAS -keystore YOUR_RELEASE_KEY_PATH | openssl sha1 -binary | openssl base64
     ```
4. Click "저장" (Save)

#### For iOS:
1. Click "iOS 플랫폼 등록" (Register iOS Platform)
2. Fill in:
   - **번들 ID** (Bundle ID): Your iOS bundle ID
   - **팀 ID** (Team ID): Your Apple Developer Team ID
3. Click "저장" (Save)

### 4. Configure Kakao Login

1. Go to "제품 설정" (Product Settings) > "카카오 로그인" (Kakao Login)
2. Click "활성화 설정" (Activation Settings)
3. Toggle "ON" to activate Kakao Login
4. Configure Redirect URI:
   - Click "Redirect URI 등록" (Register Redirect URI)
   - Add:
     ```
     https://auth.expo.io/@YOUR_EXPO_USERNAME/taoexpress
     taoexpress://oauthredirect
     ```
5. Click "저장" (Save)

### 5. Configure Consent Items

1. In "카카오 로그인" (Kakao Login) settings
2. Go to "동의 항목" (Consent Items)
3. Configure required permissions:
   - **닉네임** (Nickname): Required
   - **프로필 사진** (Profile Image): Optional
   - **카카오계정(이메일)** (Email): Required
4. Click "저장" (Save)

---

## Update Your Code

```typescript
// src/services/socialAuth.ts
const KAKAO_CLIENT_ID = 'YOUR_KAKAO_REST_API_KEY_HERE';
const KAKAO_REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: true, // For development with Expo Go
  native: 'taoexpress://oauthredirect',
});
```

---

## Testing Your Setup

### Test in Development:
1. Run your app
2. Click "Sign in with Kakao"
3. Authorize the app
4. Check that user data is returned

### Test Scenarios:
- First-time authorization
- Subsequent sign-ins
- Authorization cancellation
- Email consent handling

---

## Common Issues & Solutions

### Issue 1: "Invalid Client"
**Solution:**
- Verify REST API Key is correct
- Check that Kakao Login is activated
- Ensure app is not suspended

### Issue 2: "Redirect URI Mismatch"
**Solution:**
- Check that redirect URI in code matches Kakao settings exactly
- Add both development and production URLs
- No trailing slashes

### Issue 3: "Invalid Key Hash" (Android)
**Solution:**
- Regenerate key hash using correct keystore
- Use debug keystore for development
- Add multiple key hashes if needed

### Issue 4: "Email Not Provided"
**Solution:**
- User may not consent to email sharing
- Handle cases where email is null
- Make email optional or ask separately

---

## Available Scopes

- `profile` - Nickname and profile image
- `account_email` - Email address
- `friends` - Friend list (requires approval)
- `talk_message` - Send Kakao Talk messages (requires approval)
- `gender` - Gender (requires approval)
- `age_range` - Age range (requires approval)
- `birthday` - Birthday (requires approval)

**Note:** Some scopes require business verification!

---

## Business Verification

For advanced features (friends, messaging, etc.):

1. Go to "비즈 앱 전환" (Convert to Business App)
2. Submit business documents:
   - Business registration
   - Company information
   - Service description
3. Wait for approval (1-2 weeks)

---

## Useful Links

- Kakao Developers: https://developers.kakao.com/
- Kakao Login Guide: https://developers.kakao.com/docs/latest/en/kakaologin/common
- REST API Reference: https://developers.kakao.com/docs/latest/en/kakaologin/rest-api
- SDK Documentation: https://developers.kakao.com/sdk

---

## Current Configuration

**App Name:** TaoExpress
**Package Name (Android):** `com.app.taoexpress`
**App Scheme:** `taoexpress`
**REST API Key:** `YOUR_KAKAO_REST_API_KEY` (Update this!)

---

## Checklist

- [ ] Kakao Developer Account created
- [ ] Application created
- [ ] REST API Key copied
- [ ] Platform settings configured
- [ ] Kakao Login activated
- [ ] Redirect URIs added
- [ ] Consent items configured
- [ ] Key hash added (Android)
- [ ] Tested in development
- [ ] Business verification (if needed)

---

**Note:** Kakao's developer console is primarily in Korean. Use a browser with translation if needed. The platform is very popular in South Korea but less common internationally.
