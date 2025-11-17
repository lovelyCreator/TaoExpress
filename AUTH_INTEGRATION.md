# Authentication API Integration

This document explains how the authentication API integration has been implemented in the Glowmify application.

## Overview

The authentication system has been updated to integrate with the backend API endpoints for login and registration using a more advanced hook-based approach similar to `useMutation`. The implementation includes:

1. New authentication service (`authApi.ts`) that handles API calls
2. Custom hooks for authentication mutations (`useAuthMutations.ts`)
3. Social authentication service (`socialAuth.ts`) for Google, Facebook, and Apple Sign-In
4. Updated screens to use the new hooks
5. Token and user data storage using AsyncStorage

## Frontend-Only Mode

When a backend server is not available, the authentication system can operate in frontend-only mode. This mode allows users to register and login without server connectivity. All user data is stored locally in memory and AsyncStorage.

To switch between modes:
- Set `USE_FRONTEND_ONLY = true` in `useAuthMutations.ts` for frontend-only mode
- Set `USE_FRONTEND_ONLY = false` in `useAuthMutations.ts` for backend mode

After successful authentication in frontend-only mode, users are automatically navigated to the main application (profile section by default).

## Demo Login/Signup

For testing purposes, both LoginScreen and SignupScreen include demo functionality:
- **Demo Login**: Automatically logs in with demo credentials (`demo@example.com` / `Demo123!`)
- **Demo Signup**: Automatically registers with demo credentials and logs in

## API Endpoints

### Login (Backend)
- **Method**: POST
- **URL**: `http://192.168.5.54/api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email_or_phone": "user@example.com",
    "password": "password123",
    "login_type": "manual",
    "field_type": "email",
    "guest_id": "33"
  }
  ```

### Register (Backend)
- **Method**: POST
- **URL**: `http://192.168.5.54/api/v1/auth/sign-up`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "User Name",
    "gender": "man"
  }
  ```

## Implementation Details

### 1. Authentication Service (`src/services/authApi.ts`)

The authentication service handles all API communication and token management:

- `login(email, password)`: Calls the login API endpoint and stores the returned token (backend mode)
- `register(email, password, name, gender)`: Calls the registration API endpoint and stores the returned token (backend mode)
- `loginFrontendOnly(email, password)`: Handles login in frontend-only mode
- `registerFrontendOnly(email, password, name, gender)`: Handles registration in frontend-only mode
- `storeAuthData(token, userData)`: Stores the authentication token and user data in AsyncStorage
- `clearAuthData()`: Removes stored authentication data from AsyncStorage
- `getStoredToken()`: Retrieves the stored authentication token
- `getStoredUserData()`: Retrieves the stored user data

### 2. Authentication Hooks (`src/hooks/useAuthMutations.ts`)

Custom hooks that provide a `useMutation`-like interface for authentication operations:

- `useLoginMutation(options)`: Hook for login operations with loading, success, and error states
- `useRegisterMutation(options)`: Hook for registration operations with loading, success, and error states

Both hooks return an object with:
- `mutate`: Function to trigger the operation
- `data`: Response data when successful
- `error`: Error message when failed
- `isLoading`: Boolean indicating if operation is in progress
- `isSuccess`: Boolean indicating if operation succeeded
- `isError`: Boolean indicating if operation failed

### 3. Social Authentication (`src/services/socialAuth.ts`)

Implementation of social authentication for Google, Facebook, and Apple Sign-In:

- `signInWithGoogle()`: Handles Google OAuth flow
- `signInWithFacebook()`: Handles Facebook OAuth flow
- `signInWithApple()`: Handles Apple Sign-In (iOS only)
- `useSocialLogin(options)`: Hook for social login operations with loading, success, and error states

### 4. Component Updates

- **LoginScreen**: Updated to use `useLoginMutation` hook and `useSocialLogin` hook, with automatic navigation to profile on success and demo login functionality
- **SignupScreen**: Updated to use `useRegisterMutation` hook and `useSocialLogin` hook, with automatic navigation to profile on success and demo signup functionality

### 5. AuthContext Updates (`src/context/AuthContext.tsx`)

The AuthContext has been maintained for backward compatibility and global state management:
- Still provides the same interface for components
- Handles global authentication state
- Manages user data persistence

## Data Storage

Authentication data is stored in AsyncStorage using the following keys:

- `user_token`: Stores the JWT token returned from the API
- `user_data`: Stores basic user information (email, name)

In frontend-only mode, user credentials are stored in memory and user data/token are stored in AsyncStorage.

## Usage

### Login with Hook
```typescript
import { useLoginMutation } from '../../hooks/useAuthMutations';
import { useAuth } from '../../context/AuthContext';

const LoginScreen: React.FC = () => {
  const { login: authLogin } = useAuth(); // For updating global state
  const { mutate: login, isLoading, isError, error, isSuccess, data } = useLoginMutation({
    onSuccess: (data) => {
      // Update global auth state
      authLogin(data.user.email, 'dummy'); // In real implementation, we'd pass the actual data
    },
    onError: (error) => {
      // Handle error
    }
  });
  
  // Navigate to profile on success
  useEffect(() => {
    if (isSuccess && data) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    }
  }, [isSuccess, data, navigation]);
  
  // Demo login function
  const handleDemoLogin = async () => {
    const demoEmail = 'demo@example.com';
    const demoPassword = 'Demo123!';
    await login({ email: demoEmail, password: demoPassword });
  };
  
  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: 'password123' });
  };
  
  // ... rest of component
};
```

### Register with Hook
```typescript
import { useRegisterMutation } from '../../hooks/useAuthMutations';
import { useAuth } from '../../context/AuthContext';

const SignupScreen: React.FC = () => {
  const { signup: authSignup } = useAuth(); // For updating global state
  const { mutate: register, isLoading, isError, error, isSuccess, data } = useRegisterMutation({
    onSuccess: (data) => {
      // Update global auth state
      authSignup({ email: data.user.email, password: 'dummy', name: data.user.name, gender: 'man' });
    },
    onError: (error) => {
      // Handle error
    }
  });
  
  // Navigate to profile on success
  useEffect(() => {
    if (isSuccess && data) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    }
  }, [isSuccess, data, navigation]);
  
  // Demo signup function
  const handleDemoSignup = async () => {
    const demoData = {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'Demo123!',
      gender: 'woman',
    };
    await register({
      email: demoData.email,
      password: demoData.password,
      name: demoData.name,
      gender: demoData.gender,
    });
  };
  
  const handleSignup = async () => {
    await register({
      email: 'user@example.com',
      password: 'password123',
      name: 'User Name',
      gender: 'man'
    });
  };
  
  // ... rest of component
};
```

### Social Login with Hook
```typescript
import { useSocialLogin } from '../../services/socialAuth';

const LoginScreen: React.FC = () => {
  const { mutate: socialLogin, isLoading, isError, error } = useSocialLogin({
    onSuccess: (data) => {
      // Handle successful social login
      console.log('Social login successful:', data);
    },
    onError: (error) => {
      // Handle social login error
      console.log('Social login error:', error);
    }
  });
  
  const handleGoogleLogin = async () => {
    await socialLogin('google');
  };
  
  const handleFacebookLogin = async () => {
    await socialLogin('facebook');
  };
  
  const handleAppleLogin = async () => {
    await socialLogin('apple');
  };
  
  // ... rest of component
};
```

### Traditional Context Usage (Backward Compatible)
```typescript
const { login, signup, logout } = useAuth();

// Login
await login('user@example.com', 'password123');

// Register
await signup({
  email: 'user@example.com',
  password: 'password123',
  name: 'User Name',
  gender: 'man'
});

// Logout
await logout();
```

## Social Authentication Setup

To use social authentication, you need to configure the following:

### Google Sign-In
1. Create a project in the Google Cloud Console
2. Enable the Google+ API
3. Create OAuth 2.0 credentials
4. Add your client ID to `socialAuth.ts`

### Facebook Sign-In
1. Create an app in the Facebook Developer Console
2. Add the Facebook Login product
3. Configure OAuth settings
4. Add your app ID to `socialAuth.ts`

### Apple Sign-In
1. Enable Sign in with Apple in your Apple Developer account
2. Configure your app to use Sign in with Apple
3. Add your service ID to `socialAuth.ts`

## Error Handling

The implementation includes proper error handling for:

- Network errors
- API errors (invalid credentials, email already exists, etc.)
- Storage errors
- Social authentication errors

Errors are returned in a consistent format through the hooks:
```typescript
{
  data: any | null;
  error: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}
```

## Benefits of Hook-Based Approach

1. **Better State Management**: Each component can manage its own loading, success, and error states
2. **Separation of Concerns**: API logic is separated from UI logic
3. **Reusability**: Hooks can be reused across different components
4. **Type Safety**: Strong typing for all operations
5. **Consistent Interface**: Similar to popular libraries like React Query
6. **Backward Compatibility**: Existing code using AuthContext continues to work
7. **Flexible Mode Switching**: Easy to switch between frontend-only and backend modes
8. **Automatic Navigation**: Users are automatically navigated to profile after successful authentication
9. **Demo Functionality**: Easy testing with demo login/signup buttons

## Troubleshooting

### Common Issues

1. **Crypto Error**: If you encounter `[ReferenceError: Property 'crypto' doesn't exist]`, make sure you're using `expo-crypto` instead of the browser's crypto API.

2. **Redirect URI Issues**: Ensure your redirect URIs are properly configured in both your app and the OAuth provider's dashboard.

3. **Platform-Specific Issues**: Apple Sign-In only works on iOS devices. Make sure to handle platform-specific behavior in your code.

### Debugging Tips

1. Check the console logs for detailed error messages
2. Verify your OAuth client IDs and configurations
3. Test each social provider separately
4. Ensure proper network connectivity

## Future Improvements

1. Add token refresh functionality
2. Implement more comprehensive user data synchronization
3. Add biometric authentication support
4. Implement social login integration with real providers
5. Add caching mechanisms for better performance
6. Implement retry logic for failed requests
7. Add support for more social providers (Twitter, GitHub, etc.)