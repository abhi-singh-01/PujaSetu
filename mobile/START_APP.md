# Open PujaSetu in Expo Go

## Step 1 — Backend must run
```powershell
cd ..\backend
npm run dev
```
Check: http://localhost:5000/api/health

## Step 2 — Start Expo (in a NEW terminal)
```powershell
cd mobile
npm run start:clear
```

When asked **"Log in to Expo?"** → choose **Proceed anonymously** (arrow keys + Enter).

## Step 3 — Open on phone
1. Install **Expo Go** from Play Store / App Store (update to latest).
2. Phone and PC on **same Wi‑Fi**.
3. Scan the QR code in the terminal (or open `exp://192.168.x.x:PORT` shown).

### Still not opening?
Try tunnel mode (works through firewall):
```powershell
npm run start:tunnel
```

### Android emulator
```powershell
npm run android
```
Set in `.env`: `EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api`

### Preview in browser (quick test)
```powershell
npm run web
```

## Login
Mobile: `9876543210` → OTP: `123456`
