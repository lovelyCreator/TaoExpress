# Twitter (X) OAuth Setup Guide for TaoExpress

## Overview
This guide covers setting up Twitter/X OAuth 2.0 authentication for your TaoExpress app.

---

## Prerequisites

- **Twitter Developer Account** (Free)
- **Elevated Access** (May require approval for production)

---

## Step-by-Step Setup

### 1. Create a Twitter Developer Account

1. Go to **Twitter Developer Portal**: https://developer.twitter.com/
2. Click "Sign up" or "Apply for a developer account"
3. Select your use case:
   - Choose "Hobbyist" > "Exploring the API"
   - Or "Professional" if applicable
4. Fill in the application form:
   - Describe how you'll use Twitter API
   - Be specific about your use case
5. Accept terms and submit
6. Verify your email

### 2. Create a Twitter App

1. Go to **Developer Portal**: https://developer.twitter.com/en/portal/dashboard
2. Click "Projects & Apps" in the sidebar
3. Click "Create App" (or create a project first)
4. Fill in:
   - **App name**: `TaoExpress`
   - **Description**: Brief description of your app
5. Click "Complete"
6. Save your **API Key** and **API Secret Key** (you'll need these!)

### 3. Configure OAuth 2.0 Settings

1. In your app dashboard, click "Settings"
2. Scroll to "User authentication settings"
3. Click "Set up"
4. Configure OAuth 2.0:
   - **App permissions**: Read
   - **Type of App**: Web App, Automated App or Bot
   - **App info**:
     - **Callback URI / Redirect URL**:
       ```
       https://auth.expo.io/@YOUR_EXPO_USERNAME/taoexpress
       taoexpress://oauthredirect
       ```
       (Add both for development and production)
     - **Website URL**: Your app website or GitHub repo
5. Click "Save"

### 4. Get Your Credentials

1. Go to "Keys and tokens" tab
2. Note your:
   - **API Key** (Client ID)
   - **API Secret Key** (Client Secret)
   - **Bearer Token** (for API v2)
3. Generate **Access Token and Secret** if needed

### 5. Request Elevated Access (Optional)

For production apps with >500K tweets/month:

1. Go to "Products" in the portal
2. Click "Elevated" under "Twitter API v2"
3. Fill out the application:
   - Describe your use case in detail
   - Explain why you need elevated access
4. Submit and wait for approval (usually 1-2 weeks)

---

## Update Your Code

### 1. Update Twitter Configuration

```typescript
// src/services/socialAuth.ts
const TWITTER_CLIENT_ID = 'YOUR_TWITTER_API_KEY_HERE';
const TWITTER_REDIRECT_URI = AuthSession.makeRedirectUri({
  useProxy: true, // For development with Expo Go
  native: 'taoexpress://oauthredirect',
});
```

### 2. OAuth 2.0 Implementation

The code is already implemented in `src/services/socialAuth.ts`:

```typescript
export const signInWithTwitter = async () => {
  try {
    const codeVerifier = await generateRandomString(64);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    const discovery = {
      authorizationEndpoint: 'https://twitter.com/i/oauth2/authorize',
      tokenEndpoint: 'https://api.twitter.com/2/oauth2/token',
    };
    
    const authRequest = new AuthSession.AuthRequest({
      clientId: TWITTER_CLIENT_ID,
      redirectUri: TWITTER_REDIRECT_URI,
      scopes: ['tweet.read', 'users.read', 'offline.access'],
      extraParams: {
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      },
    });
    
    const response = await authRequest.promptAsync(discovery);
    
    if (response.type === 'success') {
      // Exchange code for token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          code: response.params.code,
          clientId: TWITTER_CLIENT_ID,
          redirectUri: TWITTER_REDIRECT_URI,
          extraParams: { code_verifier: codeVerifier },
        },
        discovery
      );
      
      // Get user info
      const userInfoResponse = await fetch(
        'https://api.twitter.com/2/users/me?user.fields=profile_image_url',
        {
          headers: { Authorization: `Bearer ${tokenResponse.accessToken}` },
        }
      );
      
      const userInfo = await userInfoResponse.json();
      
      return {
        success: true,
        data: {
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken,
          userInfo: userInfo.data,
        },
      };
    }
    
    return { success: false, error: 'Authentication cancelled' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
```

---

## Available Scopes

### OAuth 2.0 Scopes:
- `tweet.read` - Read tweets
- `tweet.write` - Post tweets
- `users.read` - Read user profile
- `follows.read` - Read follows
- `follows.write` - Follow/unfollow users
- `offline.access` - Get refresh token
- `space.read` - Read Spaces
- `mute.read` - Read muted accounts
- `mute.write` - Mute/unmute accounts
- `like.read` - Read likes
- `like.write` - Like/unlike tweets
- `list.read` - Read lists
- `list.write` - Manage lists
- `block.read` - Read blocked accounts
- `block.write` - Block/unblock accounts
- `bookmark.read` - Read bookmarks
- `bookmark.write` - Manage bookmarks

**Note:** Only request scopes you actually need!

---

## Testing Your Setup

### Test in Development:

1. Run your app
2. Click "Sign in with Twitter"
3. Authorize the app
4. Check that user data is returned

### Test Scenarios:
- First-time authorization
- Subsequent sign-ins
- Authorization cancellation
- Token refresh
- Error handling

---

## Common Issues & Solutions

### Issue 1: "Invalid Callback URL"
**Solution:**
- Check that redirect URI in code matches Twitter settings exactly
- Add both development and production URLs
- No trailing slashes
- Use lowercase

### Issue 2: "403 Forbidden"
**Solution:**
- You may need Elevated Access for certain endpoints
- Check that your app has the required permissions
- Verify your API keys are correct

### Issue 3: "429 Too Many Requests"
**Solution:**
- You've hit rate limits
- Essential access: 500K tweets/month
- Elevated access: 2M tweets/month
- Implement rate limiting in your app

### Issue 4: "Invalid Client"
**Solution:**
- Verify API Key (Client ID) is correct
- Check that OAuth 2.0 is enabled
- Ensure app is not suspended

### Issue 5: "Email Not Available"
**Solution:**
- Twitter OAuth 2.0 doesn't provide email by default
- You need to apply for email access separately
- Or ask users for email in your app

---

## Rate Limits

### Essential Access (Free):
- **Tweet caps**: 500K tweets/month
- **User lookup**: 300 requests/15 min
- **Tweet lookup**: 300 requests/15 min

### Elevated Access:
- **Tweet caps**: 2M tweets/month
- **User lookup**: 900 requests/15 min
- **Tweet lookup**: 900 requests/15 min

### Best Practices:
- Cache user data
- Implement exponential backoff
- Monitor rate limit headers
- Use webhooks when possible

---

## Getting Email Access

Twitter doesn't provide email by default. To get email:

### Option 1: Apply for Email Access
1. Go to your app settings
2. Request additional permissions
3. Explain why you need email
4. Wait for approval

### Option 2: Ask Users Directly
1. After Twitter sign-in, ask for email
2. Verify the email address
3. Link it to the Twitter account

---

## Security Best Practices

1. **Use OAuth 2.0** (not OAuth 1.0a)
2. **Implement PKCE** (already done in code)
3. **Store tokens securely** (use secure storage)
4. **Implement token refresh** logic
5. **Validate tokens** on your backend
6. **Use HTTPS** for all API calls
7. **Don't expose API secrets** in client code
8. **Implement rate limiting** in your app
9. **Handle token expiration** gracefully
10. **Monitor for suspicious activity**

---

## Token Management

### Access Token:
- **Lifetime**: 2 hours
- **Use**: API requests
- **Refresh**: Use refresh token

### Refresh Token:
- **Lifetime**: Doesn't expire (until revoked)
- **Use**: Get new access token
- **Scope**: Must include `offline.access`

### Refresh Implementation:
```typescript
const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: TWITTER_CLIENT_ID,
    }),
  });
  
  return await response.json();
};
```

---

## Migration from OAuth 1.0a

If you're migrating from OAuth 1.0a:

### Key Differences:
- OAuth 2.0 uses Bearer tokens (simpler)
- PKCE required for security
- Different endpoints
- Different scopes
- Refresh tokens available

### Migration Steps:
1. Update to OAuth 2.0 endpoints
2. Implement PKCE flow
3. Update scope requests
4. Implement token refresh
5. Test thoroughly

---

## Useful Links

- Twitter Developer Portal: https://developer.twitter.com/
- OAuth 2.0 Documentation: https://developer.twitter.com/en/docs/authentication/oauth-2-0
- API Reference: https://developer.twitter.com/en/docs/api-reference-index
- Rate Limits: https://developer.twitter.com/en/docs/twitter-api/rate-limits
- Best Practices: https://developer.twitter.com/en/docs/twitter-api/getting-started/best-practices

---

## Current Configuration

**App Name:** TaoExpress
**App Scheme:** `taoexpress`
**Current Client ID:** `YOUR_TWITTER_CLIENT_ID` (Update this!)
**Redirect URI:** `taoexpress://oauthredirect`

---

## Checklist

- [ ] Twitter Developer Account created
- [ ] App created in Developer Portal
- [ ] OAuth 2.0 configured
- [ ] Callback URLs added
- [ ] API Key copied to code
- [ ] Scopes configured correctly
- [ ] Elevated Access requested (if needed)
- [ ] Email access requested (if needed)
- [ ] Rate limiting implemented
- [ ] Token refresh implemented
- [ ] Error handling implemented
- [ ] Tested in development
- [ ] Tested in production

---

**Note:** Twitter's API and policies change frequently. Always check the official documentation for the most up-to-date information. Consider applying for Elevated Access early if you expect significant usage.
