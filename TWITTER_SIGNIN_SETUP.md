# Twitter Sign-In Setup Guide

This guide will help you set up Twitter authentication using `@react-native-twitter-signin/twitter-signin`.

## Prerequisites

- Twitter Developer Account
- Twitter App created in Twitter Developer Portal

## Step 1: Install the Package

```bash
npm install @react-native-twitter-signin/twitter-signin
```

or

```bash
yarn add @react-native-twitter-signin/twitter-signin
```

## Step 2: Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App or use an existing one
3. Go to your App settings
4. Note down your:
   - **API Key** (Consumer Key)
   - **API Secret Key** (Consumer Secret)

## Step 3: Configure Twitter App Settings

### Enable OAuth 1.0a

1. In your Twitter App settings, go to "User authentication settings"
2. Enable "OAuth 1.0a"
3. Set the following:
   - **App permissions**: Read and write (or Read only if you don't need write access)
   - **Callback URL**: `taoexpress://` (or your custom scheme)
   - **Website URL**: Your app's website URL

### Request Email Access

1. In the "Additional permissions" section
2. Enable "Request email address from users"

## Step 4: Update Configuration

### Update `src/services/socialAuth.ts`

Replace the placeholder values:

```typescript
const TWITTER_CONSUMER_KEY = 'YOUR_TWITTER_CONSUMER_KEY'; // Replace with your API Key
const TWITTER_CONSUMER_SECRET = 'YOUR_TWITTER_CONSUMER_SECRET'; // Replace with your API Secret Key
```

## Step 5: iOS Configuration

### Update `ios/Podfile`

Add the following to your Podfile:

```ruby
pod 'TwitterKit', '~> 3.4'
```

Then run:

```bash
cd ios && pod install
```

### Update `Info.plist`

Add the following to `ios/TaoExpress/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>twitterkit-YOUR_CONSUMER_KEY</string>
    </array>
  </dict>
</array>

<key>LSApplicationQueriesSchemes</key>
<array>
  <string>twitter</string>
  <string>twitterauth</string>
</array>
```

Replace `YOUR_CONSUMER_KEY` with your actual Twitter Consumer Key.

## Step 6: Android Configuration

### Update `android/app/build.gradle`

Add the following to the `defaultConfig` section:

```gradle
android {
    defaultConfig {
        // ... other config
        
        manifestPlaceholders = [
            twitterConsumerKey: "YOUR_CONSUMER_KEY",
            twitterConsumerSecret: "YOUR_CONSUMER_SECRET"
        ]
    }
}
```

### Update `AndroidManifest.xml`

Add the following inside the `<application>` tag in `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
    android:name="com.twitter.sdk.android.core.identity.OAuthActivity"
    android:configChanges="orientation|screenSize"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="twitterkit-${twitterConsumerKey}" />
    </intent-filter>
</activity>
```

## Step 7: Update app.json

Add Twitter to the scheme:

```json
{
  "expo": {
    "scheme": "taoexpress",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "twitterkit-YOUR_CONSUMER_KEY"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

## Step 8: Build the App

Since this is a native module, you need to rebuild your app:

### For Development

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### For Production

```bash
# Build with EAS
eas build --platform ios
eas build --platform android
```

## Usage

The Twitter sign-in is already integrated in your `LoginScreen`. When users tap the Twitter button:

1. The native Twitter SDK will open
2. User authenticates with Twitter
3. App receives the authentication tokens
4. User info is fetched from Twitter API
5. User is logged into your app

## Testing

1. Run the app on a physical device or simulator
2. Tap the Twitter sign-in button on the login screen
3. Authenticate with your Twitter account
4. Verify that you're logged in successfully

## Troubleshooting

### "Invalid Consumer Key"
- Double-check your Consumer Key and Secret in `socialAuth.ts`
- Make sure they match your Twitter App credentials

### "Callback URL not approved"
- Verify the callback URL in Twitter Developer Portal matches your app scheme
- Make sure OAuth 1.0a is enabled

### "Email not provided"
- Request email permission in Twitter Developer Portal
- Some Twitter accounts may not have email addresses

### iOS Build Errors
- Run `cd ios && pod install` again
- Clean build folder: `cd ios && xcodebuild clean`

### Android Build Errors
- Sync Gradle files
- Clean build: `cd android && ./gradlew clean`

## Security Notes

1. **Never commit your Consumer Secret** to version control
2. Use environment variables for production:
   ```typescript
   const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
   const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
   ```
3. Store secrets securely using EAS Secrets:
   ```bash
   eas secret:create --scope project --name TWITTER_CONSUMER_KEY --value your_key
   eas secret:create --scope project --name TWITTER_CONSUMER_SECRET --value your_secret
   ```

## Additional Resources

- [Twitter Developer Documentation](https://developer.twitter.com/en/docs)
- [@react-native-twitter-signin GitHub](https://github.com/GoldenOwlAsia/react-native-twitter-signin)
- [Twitter API Reference](https://developer.twitter.com/en/docs/api-reference-index)

## Support

If you encounter issues:
1. Check the package GitHub issues
2. Verify your Twitter App configuration
3. Check console logs for detailed error messages
