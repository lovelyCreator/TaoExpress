# iOS Noto Sans Font Setup Guide

## ✅ Android Status
**Already working!** Noto Sans is a system font on Android, so no setup needed.

## 📱 iOS Setup Steps

### Step 1: Extract Font Files from ZIP

1. Extract your downloaded Noto Sans ZIP file
2. Look for these `.ttf` files (they might be in a subfolder):
   - `NotoSans-Regular.ttf` (required)
   - `NotoSans-Medium.ttf` (optional, for medium weight)
   - `NotoSans-Bold.ttf` (optional, for bold weight)

### Step 2: Create Fonts Folder

Create a `fonts` folder inside your `assets` directory:

```
assets/
  fonts/
    NotoSans-Regular.ttf
    NotoSans-Medium.ttf
    NotoSans-Bold.ttf
```

### Step 3: Copy Font Files

Copy the `.ttf` font files into the `assets/fonts/` folder you just created.

**Important:** Make sure the file names match exactly:
- `NotoSans-Regular.ttf`
- `NotoSans-Medium.ttf`
- `NotoSans-Bold.ttf`

### Step 4: Code is Ready!

The code has already been updated to:
- ✅ Load fonts automatically using `expo-font`
- ✅ Use platform-specific font names (Android: system font, iOS: loaded fonts)
- ✅ Handle font loading before app renders
- ✅ Show loading screen while fonts load on iOS

### Step 5: Test

1. Run the app on iOS: `npm run ios` or `expo run:ios`
2. The app will show a loading screen while fonts load
3. Once loaded, Noto Sans will be used throughout the app!

## Troubleshooting

**If fonts don't load:**
- Check that font files are in `assets/fonts/` folder
- Verify file names match exactly (case-sensitive)
- Check console for any error messages
- The app will continue with system font as fallback if fonts fail to load

