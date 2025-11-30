@echo off
echo ========================================
echo Getting SHA-1 Fingerprints for Google Sign-In
echo ========================================
echo.

echo [1/2] Getting DEBUG SHA-1...
echo.
cd android
call gradlew.bat signingReport
cd ..

echo.
echo ========================================
echo INSTRUCTIONS:
echo ========================================
echo 1. Look for "Variant: debug" in the output above
echo 2. Copy the SHA1 fingerprint
echo 3. Go to Firebase Console: https://console.firebase.google.com/
echo 4. Select your project
echo 5. Go to Project Settings (gear icon)
echo 6. Find your Android app (com.app.todaymall)
echo 7. Click "Add fingerprint" and paste the SHA1
echo 8. Download updated google-services.json
echo 9. Replace android/app/google-services.json
echo.
echo Current SHA-1 fingerprints in your code:
echo - 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
echo - 35:2A:B3:C0:06:50:CC:C9:2C:A7:29:D2:7D:23:77:48:5D:0C:06:D0
echo.
echo Make sure these match what you see above!
echo ========================================
pause
