# PujaSetu — Resume Tomorrow

**Tagline:** Book Verified Pandits & Naus Across India

---

## Start of day (5 min)

### 1. Backend + database
```powershell
cd backend
# Option A — Docker (if Docker Desktop is running)
docker compose up -d
docker compose --profile seed run --rm seed   # first time only

# Option B — Local
npm run dev
# MongoDB must be running on localhost:27017
npm run seed   # if DB is empty
```

API health: http://localhost:5000/api/health

### 2. Mobile (Expo)
```powershell
cd mobile
# Copy .env if missing — use LAN IP on real phone, 10.0.2.2 on Android emulator
copy .env.example .env
npx expo start
```

### 3. Graphify (optional, after code changes)
```powershell
graphify update .
```

---

## Test logins (dev OTP: `123456`)

| Role     | Mobile       |
|----------|--------------|
| Customer | 9876543210   |
| Admin    | 9999999999   |
| Pandit   | 9123456780   |
| Nau      | 9123456781   |

---

## Done so far

- [x] Full-stack PujaSetu (Expo + Express + MongoDB)
- [x] OTP auth, roles, provider registration, India locations
- [x] 15% advance booking + mutual OTP for remaining 85%
- [x] Provider custom pricing API + mobile screens
- [x] Docker setup (`backend/docker-compose.yml`)
- [x] Graphify knowledge graph + Cursor token rules

---

## Tomorrow — suggested tasks

1. **Expo on device** — confirm API URL in `mobile/.env` (LAN IP for phone)
2. **Docker** — start Docker Desktop, run `docker compose up -d`
3. **Razorpay** — add keys + `react-native-razorpay` on Payment screens
4. **Push notifications** — Firebase FCM keys + device token registration
5. **DigiLocker** — complete OAuth callback for provider verification
6. **Polish UI** — splash icon, onboarding assets, error toasts
7. **EAS build** — `eas build` for Android APK testing

---

## Key paths

| What        | Where |
|-------------|--------|
| API         | `backend/src/server.js` |
| Bookings    | `backend/src/controllers/bookingController.js` |
| Mobile app  | `mobile/App.tsx` → `src/navigation/` |
| Graph       | `graphify-out/GRAPH_REPORT.md` |
| Deploy docs | `README.md` |

---

## API URL cheat sheet

| Device              | `EXPO_PUBLIC_API_URL`              |
|---------------------|------------------------------------|
| Android emulator    | `http://10.0.2.2:5000/api`         |
| iOS simulator       | `http://localhost:5000/api`        |
| Physical phone      | `http://<YOUR_PC_LAN_IP>:5000/api` |

Restart Expo after changing `.env`.
