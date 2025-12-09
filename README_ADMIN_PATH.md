# Running the App on localhost:8000/admin/

To run the Expo web app on `localhost:8000/admin/`, you have a few options:

## Option 1: Use a Reverse Proxy (Recommended)

Use nginx or another reverse proxy to serve the app from `/admin/`:

### nginx Configuration Example:

```nginx
server {
    listen 8000;
    server_name localhost;

    location /admin/ {
        proxy_pass http://localhost:19006/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        rewrite ^/admin/(.*)$ /$1 break;
    }
}
```

Then run:
```bash
npm run web
# Expo will run on port 19006 (default)
# nginx will proxy it to localhost:8000/admin/
```

## Option 2: Use Expo's Built-in Server with Custom Path

Run Expo and access it via:
```bash
npm run web:admin
```

Then manually navigate to `http://localhost:8000/admin/` in your browser.

**Note:** You may need to configure your router (React Navigation) to handle the base path. Update your navigation configuration to use a base path if needed.

## Option 3: Build Static Files and Serve from /admin/

1. Build the static web files:
```bash
npx expo export:web
```

2. Configure your web server (nginx, Apache, etc.) to serve the `web-build` folder from `/admin/`.

## Option 4: Update Navigation Container (If using React Navigation)

If you need the app to work properly with the `/admin/` base path, you may need to update your navigation configuration:

```typescript
// In your AppNavigator.tsx or main navigation file
import { Linking } from 'react-native';

const prefix = '/admin';

<NavigationContainer
  linking={{
    prefixes: [prefix],
    config: {
      screens: {
        // your screen config
      }
    }
  }}
>
  {/* your navigators */}
</NavigationContainer>
```

## Quick Start

For the simplest setup, use Option 1 with nginx or Option 2 and manually navigate to the admin path.

