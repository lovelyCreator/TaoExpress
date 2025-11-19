# Test Credentials for Frontend-Only Mode

The app is currently running in **MOCK/FRONTEND-ONLY mode** for testing purposes. All authentication is handled locally without backend API calls.

## Pre-configured Test Accounts

### Account 1: Test User
- **Email**: `test@example.com`
- **Password**: `password123`
- **Name**: Test User
- **Followers**: 150
- **Following**: 89

### Account 2: Demo User
- **Email**: `demo@example.com`
- **Password**: `Demo123!`
- **Name**: Demo User
- **Followers**: 250
- **Following**: 120

## Creating New Accounts

You can also create new accounts by:
1. Go to Sign Up screen
2. Enter any email, password, name, and gender
3. The account will be stored in memory (will be lost when app restarts)

## Social Login (Mock)

All social login buttons (Google, Facebook, Apple, Twitter, Kakao) are currently in MOCK mode:
- **Google Sign-In**: Returns a mock Google user
- **Other providers**: Will show success/error messages but don't actually authenticate

## Features Available in Mock Mode

✅ **Login** - Use pre-configured accounts or create new ones
✅ **Sign Up** - Create new accounts (stored in memory)
✅ **Logout** - Clear authentication state
✅ **Change Password** - Simulates password change
✅ **Guest Mode** - Browse as guest
✅ **Social Login** - Mock responses for testing UI

## Testing Login Status

### To test as logged-in user:
1. Use one of the pre-configured accounts above
2. Or create a new account via Sign Up
3. Navigate through the app - you should see:
   - Profile screen with user info
   - Ability to like products
   - Ability to add to cart
   - Access to My Orders, My Store, etc.

### To test as guest:
1. Skip login or logout
2. Try to like a product or add to cart
3. You should see "Please login first" toast message

## Switching to Real Backend

To switch back to real backend API:

1. **In `src/services/authApi.ts`**:
   - Uncomment the real API calls
   - Comment out the mock responses

2. **In `src/services/socialAuth.ts`**:
   - Uncomment the real Google Sign-In implementation
   - Comment out the mock return statement

## Notes

- All data is stored in AsyncStorage and persists between app restarts
- In-memory user accounts (created via Sign Up) are lost when app restarts
- Pre-configured accounts are always available
- Mock mode is perfect for UI/UX testing without backend dependency
