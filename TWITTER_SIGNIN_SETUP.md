# Twitter Sign-In Setup Guide

## ✅ Configuration Complete

Your Twitter OAuth 2.0 credentials have been configured in the app.

### Credentials Configured:
- **Client ID**: `dURqNDZQVDRTQjJYbWt2cUwtOFU6MTpjaQ`
- **Client Secret**: `7KcFO61dXldQA8Em1JQqWJK4VaJqL-DO46e25gObmnPGHbrfgZ`
- **Redirect URI**: `com.app.taoexpress://oauthredirect`

## Twitter Developer Portal Setup

### 1. Configure OAuth 2.0 Settings

Go to your Twitter app settings at: https://developer.twitter.com/en/portal/dashboard

1. Navigate to your app → **User authentication settings**
2. Click **Set up** or **Edit**
3. Configure the following:

#### App permissions:
- ✅ Read

#### Type of App:
- ✅ Native App (or Web App, Automated App or Bot)

#### App info:
- **Callback URI / Redirect URL**: 
  ```
  com.app.taoexpress://oauthredirect
  ```
  
- **Website URL**: (Your app's website or placeholder)
  ```
  https://taoexpress.com
  ```

#### OAuth 2.0 Settings:
- ✅ Enable OAuth 2.0
- ✅ Request email from users (optional)

4. Click **Save**

### 2. Verify Scopes

Make sure your app has these scopes enabled:
- `tweet.read` - Read tweets
- `users.read` - Read user profile
- `offline.access` - Refresh tokens

## How It Works

### Authentication Flow:

1. User taps "Sign in with Twitter"
2. App generates PKCE code challenge
3. Opens Twitter authorization page in browser
4. User authorizes the app
5. Twitter redirects back to app with authorization code
6. App exchanges code for access token
7. App fetches user profile from Twitter API v2
8. Returns user data to your app

### User Data Returned:

```typescript
{
  accessToken: string,
  refreshToken: string | null,
  userInfo: {
    id: string,           // Twitter user ID
    email: string,        // Empty (Twitter OAuth 2.0 doesn't provide email by default)
    name: string,         // Display name or username
    picture: string | null // Profile image URL
  }
}
```

## Testing

### 1. Build the app:
```bash
npx expo run:android
```

### 2. Test Twitter Sign-In:
1. Open the app
2. Navigate to Login screen
3. Tap "Sign in with Twitter"
4. Browser opens with Twitter authorization
5. Authorize the app
6. App receives user data

## Important Notes

### Email Address
- Twitter OAuth 2.0 **does not provide email** by default
- To get email, you need to:
  1. Apply for Elevated access in Twitter Developer Portal
  2. Request additional permissions
  3. Use OAuth 1.0a instead (requires different implementation)

### Redirect URI
- Must match exactly in Twitter Developer Portal
- Format: `com.app.taoexpress://oauthredirect`
- Case-sensitive

### Token Expiration
- Access tokens expire after 2 hours
- Use refresh token to get new access token
- Implement token refresh logic in your backend

## Troubleshooting

### "Invalid redirect_uri"
- Check that redirect URI in Twitter Developer Portal matches exactly
- Verify: `com.app.taoexpress://oauthredirect`

### "Invalid client_id"
- Verify Client ID is correct
- Make sure OAuth 2.0 is enabled in Twitter Developer Portal

### "Insufficient permissions"
- Check that required scopes are enabled
- Verify app permissions in Twitter Developer Portal

### Browser doesn't redirect back
- Check AndroidManifest.xml has correct intent filter
- Verify app scheme matches redirect URI

## AndroidManifest.xml Configuration

The app is already configured with the correct intent filter:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <data android:scheme="taoexpress"/>
  <data android:scheme="exp+taoexpress"/>
</intent-filter>
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for production
3. **Implement token refresh** on your backend
4. **Validate tokens** server-side
5. **Use HTTPS** for all API calls

## Production Checklist

- [ ] Verify redirect URI in Twitter Developer Portal
- [ ] Test authentication flow end-to-end
- [ ] Implement token refresh logic
- [ ] Handle error cases (cancelled, network errors)
- [ ] Add loading states in UI
- [ ] Test on multiple devices
- [ ] Move credentials to environment variables
- [ ] Set up backend token validation

## API Reference

```typescript
import { signInWithTwitter } from './services/socialAuth';

// Sign in with Twitter
const result = await signInWithTwitter();

if (result.success) {
  console.log('Access Token:', result.data.accessToken);
  console.log('User Info:', result.data.userInfo);
  // Handle successful login
} else {
  console.error('Error:', result.error);
  // Handle error
}
```

## Support

For Twitter API issues:
- Twitter Developer Portal: https://developer.twitter.com/en/portal/dashboard
- Twitter API Documentation: https://developer.twitter.com/en/docs/twitter-api
- OAuth 2.0 Guide: https://developer.twitter.com/en/docs/authentication/oauth-2-0

## Next Steps

1. Configure redirect URI in Twitter Developer Portal
2. Build and test the app
3. Verify authentication works
4. Implement backend token validation
5. Add error handling and loading states
