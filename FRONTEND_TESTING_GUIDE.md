# Frontend Testing Guide

## Quick Start

The app is now configured for **frontend-only testing** with mock authentication.

### Test Accounts (Ready to Use)

```
Email: test@example.com
Password: password123

Email: demo@example.com  
Password: Demo123!
```

## Testing Scenarios

### 1. Login Flow
- Open app → Click "Login"
- Use test credentials above
- Should navigate to Home screen as logged-in user

### 2. Sign Up Flow
- Open app → Click "Sign up"
- Enter any email/password/name
- Account created and logged in automatically

### 3. Guest Mode
- Open app → Browse without logging in
- Try to like a product → See "Please login first" message
- Try to add to cart → See "Please login first" message

### 4. Social Login (Mock)
- Click Google/Facebook/etc button
- See mock success message
- User logged in with mock data

### 5. Logout
- Go to Profile → Logout
- Returns to guest mode

### 6. Product Interactions
**As Guest:**
- ❌ Cannot like products
- ❌ Cannot add to cart
- ✅ Can browse products

**As Logged-in User:**
- ✅ Can like products (heart button on bottom-right)
- ✅ Can add to cart
- ✅ Can view profile
- ✅ Can access My Orders, My Store, etc.

## What's Mocked

- ✅ Login API
- ✅ Sign Up API
- ✅ Guest Login API
- ✅ Change Password API
- ✅ Google Sign-In
- ✅ All social logins

## Data Persistence

- User sessions persist in AsyncStorage
- Survives app restarts
- Clear app data to reset

## UI Changes Made

### ProductCard Component
- ❌ Removed cart button
- ✅ Heart button moved to bottom-right
- ✅ Works across all variants (grid, horizontal, moreToLove, etc.)

### Removed Files
- `GoogleSignInModal.tsx` (unused)
- `googleauth.tsx` screen (unused)

## Ready for Testing!

Just run the app and start testing with the credentials above. All authentication flows work without any backend!
