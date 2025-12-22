# APK Size Optimization Guide

This document outlines the optimizations applied to reduce APK size from 130MB+ to under 40MB.

## Optimizations Applied

### 1. **Android App Bundle (AAB) Instead of APK**
- Changed build type to `app-bundle` in `eas.json`
- AAB format allows Google Play to generate optimized APKs per device
- Can reduce download size by 20-30% compared to universal APK

### 2. **Architecture Optimization**
- Removed x86 and x86_64 architectures (only used by emulators and very few devices)
- Only building for `armeabi-v7a` and `arm64-v8a` (covers 99%+ of Android devices)
- **Size reduction: ~30-40MB**

### 3. **Code Shrinking (ProGuard/R8)**
- Enabled `minifyEnabled true` in release builds
- Added comprehensive ProGuard rules to keep necessary classes
- Removes unused code and obfuscates remaining code
- **Size reduction: ~20-30MB**

### 4. **Resource Shrinking**
- Enabled `shrinkResources true` in release builds
- Removes unused resources (images, layouts, strings, etc.)
- **Size reduction: ~10-20MB**

### 5. **Image Optimization**
- Disabled GIF support (if not needed)
- Enabled PNG crunching
- Using WebP format for better compression
- **Size reduction: ~5-10MB**

### 6. **ProGuard Rules**
- Added rules for React Native, Expo, Google Sign-In, Socket.io
- Removed logging statements in release builds
- Optimized class and method names

## Build Commands

### For Production (AAB - Recommended)
```bash
eas build --platform android --profile production
```

### For Preview (APK)
```bash
eas build --platform android --profile preview
```

## Additional Optimization Tips

### 1. **Remove Unused Dependencies**
Review `package.json` and remove any unused packages:
- Check if all expo packages are needed
- Consider removing `react-native-web` if not building for web
- Remove `react-dom` if not needed

### 2. **Optimize Assets**
- Compress images in `assets/` and `src/assets/`
- Use WebP format for images where possible
- Remove unused images and icons

### 3. **Lazy Loading**
- Already implemented with lazy loading screens
- Consider code splitting for large components

### 4. **Native Module Optimization**
- Only include native modules that are actually used
- Some modules like `expo-av` can be large if not needed

## Expected Results

After these optimizations:
- **Universal APK**: ~40-50MB (down from 130MB+)
- **AAB (per device)**: ~25-35MB download size
- **Split APKs**: ~20-30MB per architecture

## Monitoring

To check APK size after build:
1. Download the build from EAS
2. Check file size
3. Use `bundletool` to analyze AAB:
   ```bash
   bundletool build-apks --bundle=app-release.aab --output=app.apks
   ```

## Notes

- AAB format is required for Google Play Store (recommended)
- For direct APK distribution, use the `preview` profile
- Test thoroughly after enabling ProGuard to ensure no runtime issues
- Keep ProGuard rules updated when adding new dependencies

