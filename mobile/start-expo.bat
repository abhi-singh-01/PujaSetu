@echo off
cd /d "%~dp0"
echo.
echo === PujaSetu Expo ===
echo 1. When asked to log in, choose: Proceed anonymously
echo 2. Scan QR with Expo Go (same Wi-Fi as PC)
echo 3. Login: 9876543210  OTP: 123456
echo.
npx expo start --lan --clear
pause
