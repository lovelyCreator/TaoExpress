# Additional APK Size Optimizations (80MB → <40MB)

This document outlines additional optimizations applied to further reduce APK size from 80MB to under 40MB.

## Additional Optimizations Applied

### 1. **Enhanced Metro Minifier Configuration**
- Added more aggressive Terser compression options:
  - `dead_code: true` - Remove dead code
  - `unused: true` - Remove unused variables
  - `drop_debugger: true` - Remove debugger statements
  - `pure_funcs` - Remove specific console functions
  - `mangle.toplevel: true` - Mangle top-level variable names
- **Expected reduction: ~5-10MB**

### 2. **More Aggressive ProGuard Rules**
- Increased optimization passes to 5
- Added code simplification optimizations
- Removed source file names and line numbers
- Added assumptions for logging removal
- **Expected reduction: ~5-10MB**

### 3. **R8 Full Mode**
- Enabled `android.enableR8.fullMode=true` in gradle.properties
- R8 full mode provides better code shrinking and optimization
- **Expected reduction: ~3-5MB**

### 4. **Packaging Optimizations**
- Excluded unnecessary META-INF files
- Removed Kotlin module metadata
- **Expected reduction: ~1-2MB**

### 5. **MultiDex Disabled**
- Set `multiDexEnabled false` (if app doesn't exceed 65K methods)
- Reduces overhead if not needed
- **Expected reduction: ~1-2MB**

## Manual Optimizations to Consider

### 1. **Remove Unused Dependencies**
Check if these can be removed (if not used):
- `react-native-web` - Only needed for web builds
- `react-dom` - Only needed for web builds
- `expo-av` - Only if not using audio/video
- `expo-apple-authentication` - Only for iOS

### 2. **Optimize Assets**
- Compress all PNG/JPG images in `src/assets/icons/`
- Convert large images to WebP format
- Remove unused images (check which ones are actually used)
- **Potential reduction: ~5-15MB**

### 3. **Remove Unused Fonts**
- `NotoSans-Light.ttf` is in assets but not loaded in App.tsx
- Consider removing if not used
- **Potential reduction: ~200-500KB per font**

### 4. **Check Native Libraries**
Some native libraries can be large:
- `react-native-image-crop-picker` - Can be large
- `react-native-webview` - ~5-10MB
- `expo-av` - ~3-5MB if included

### 5. **Split APK by Architecture** (Alternative)
If you need APK (not AAB), consider building separate APKs:
- `armeabi-v7a` only: ~25-30MB
- `arm64-v8a` only: ~25-30MB
- Users download the one for their device

## Build Commands

### Production Build
```bash
eas build --platform android --profile production
```

### Check APK Size
After build, check the actual size:
```bash
# APK will be in the build output
# Check file size in MB
```

## Expected Final Size

With all optimizations:
- **Universal APK**: ~35-45MB (down from 80MB)
- **Split APK (per architecture)**: ~20-25MB each

## Troubleshooting

If the app crashes after these optimizations:
1. Check ProGuard rules - may need to keep more classes
2. Test thoroughly - aggressive minification can break reflection-based code
3. Check Metro bundle - ensure all required code is included

## Next Steps

1. Build and test the app
2. If size is still >40MB, consider:
   - Removing more unused dependencies
   - Compressing assets manually
   - Using split APKs
   - Further asset optimization

