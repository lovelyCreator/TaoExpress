# Google Sign-In Backend Integration Guide

## Current Implementation Status

### ✅ What's Working
1. **Native Google Sign-In SDK** - Installed and configured
2. **Google Sign-In UI** - Button triggers authentication
3. **Google OAuth Flow** - Opens Google account picker
4. **Token Retrieval** - Gets access token and user info from Google
5. **Mock Backend API** - Simulates backend response

### ⚠️ What Needs Backend Connection

The app currently uses **MOCK DATA** for the backend API call. To make it work with your real backend:

## Backend API Endpoint Required

### Endpoint: `/api/v1/auth/social-login`

**Method:** POST

**Request Body:**
```json
{
  "provider": "google",
  "access_token": "ya29.a0AfH6SMB...",
  "email": "user@gmail.com",
  "name": "User Name",
  "provider_id": "1234567890",
  "guest_id": "12345"
}
```

**Expected Response:**
```json
{
  "token": "your_jwt_token_here",
  "user_id": "user_123",
  "email": "user@gmail.com",
  "first_name": "User Name",
  "follower_count": 0,
  "following_count": 0,
  "image": null
}
```

## How to Enable Real Backend

### Step 1: Update `src/services/authApi.ts`

Find the `socialLogin` function and **uncomment** the real API call:

```typescript
// CURRENT (MOCK):
// const response = await apiClient.post<AuthResponse>('/auth/social-login', requestBody);

// CHANGE TO (REAL):
const response = await apiClient.post<AuthResponse>('/auth/social-login', requestBody);
```

And **comment out** the mock response:

```typescript
// MOCK DATA: Simulate API delay
// await new Promise(resolve => setTimeout(resolve, 500));

// MOCK DATA: Return mock response
// const mockResponse = { ... };
// const response = { data: mockResponse.data };
```

### Step 2: Verify API Base URL

In `src/services/authApi.ts`, check the API base URL:

```typescript
const API_BASE_URL = 'https://semistiff-vance-doctorly.ngrok-free.dev/api/v1';
```

Make sure this points to your backend server.

### Step 3: Test the Flow

1. **Build the app:**
   ```bash
   npx expo prebuild
   npx expo run:android
   ```

2. **Test Google Sign-In:**
   - Tap "Google" button
   - Select Google account
   - App should send data to backend
   - Backend should return user token
   - App should navigate to main screen

## Current Flow (with Mock Data)

```
User taps Google button
    ↓
Google Sign-In SDK opens
    ↓
User selects account
    ↓
App receives Google tokens
    ↓
App calls socialLogin() API
    ↓
[MOCK] Returns fake token ← YOU ARE HERE
    ↓
App stores token & user data
    ↓
App navigates to Main screen
```

## What Backend Should Do

1. **Receive the request** with Google access token
2. **Verify the token** with Google (optional but recommended)
3. **Check if user exists** in your database
   - If exists: Return existing user data
   - If new: Create new user account
4. **Generate JWT token** for your app
5. **Return user data** with token

## Backend Implementation Example (Node.js/Express)

```javascript
app.post('/api/v1/auth/social-login', async (req, res) => {
  try {
    const { provider, access_token, email, name, provider_id, guest_id } = req.body;
    
    // Verify token with Google (optional)
    // const googleUser = await verifyGoogleToken(access_token);
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        provider,
        provider_id,
        // ... other fields
      });
    }
    
    // Generate JWT token
    const token = generateJWT(user);
    
    // Return response
    res.json({
      token,
      user_id: user.id,
      email: user.email,
      first_name: user.name,
      follower_count: user.follower_count || 0,
      following_count: user.following_count || 0,
      image: user.image || null,
    });
  } catch (error) {
    res.status(500).json({ error: 'Social login failed' });
  }
});
```

## Troubleshooting

### Issue: "Login Failed" after Google sign-in

**Possible causes:**
1. Backend API endpoint not implemented
2. API base URL incorrect
3. Backend returning wrong response format
4. Network error

**Solution:**
- Check console logs for error details
- Verify backend is running
- Test API endpoint with Postman
- Check response format matches expected structure

### Issue: Google sign-in works but doesn't navigate

**Possible causes:**
1. Backend not returning token
2. Token not being stored correctly
3. Navigation logic issue

**Solution:**
- Check console logs for "Social login successful"
- Verify token is being stored in AsyncStorage
- Check AuthContext is being updated

## Testing Checklist

- [ ] Backend API endpoint `/auth/social-login` is implemented
- [ ] Backend can receive and process Google tokens
- [ ] Backend returns correct response format
- [ ] API base URL in app points to backend
- [ ] Real API call is uncommented in `authApi.ts`
- [ ] Mock data is commented out
- [ ] App is rebuilt with `npx expo run:android`
- [ ] Google sign-in opens account picker
- [ ] After selecting account, app calls backend
- [ ] Backend returns token
- [ ] App navigates to main screen
- [ ] User stays logged in after app restart

## Current Configuration

**Google OAuth Client ID:**
```
504835766110-u1kq6htjoenjum17a9g7k27j7ui4q2u7.apps.googleusercontent.com
```

**Package Name:**
```
com.app.taoexpress
```

**SHA-1 Certificate:**
```
35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0
```

Make sure these are configured in your Google Cloud Console.
