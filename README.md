# PujaSetu

**Book Verified Pandits & Naus Across India**

PujaSetu is an India-wide service booking platform for Hindu rituals and ceremonies. Users can book verified **Pandits** and **Naus** (traditional barbers) for weddings, mundan, griha pravesh, Satyanarayan katha, havan, shradh, and more.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native (Expo), TypeScript, NativeWind, Redux Toolkit, React Navigation |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | OTP + JWT |
| Payments | Razorpay |
| Maps | Google Maps / expo-location |
| Verification | DigiLocker (OAuth stub) |
| Notifications | Firebase Cloud Messaging + expo-notifications |

## Project Structure

```
PujaSetu/
├── mobile/                 # Expo React Native app
│   └── src/
│       ├── api/            # API clients
│       ├── components/     # Reusable UI
│       ├── constants/      # Services, onboarding
│       ├── hooks/
│       ├── navigation/
│       ├── screens/        # All 15 app screens
│       ├── store/          # Redux slices
│       ├── theme/
│       └── types/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── data/           # india-locations.json (36 states)
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/        # seed, generate-locations
│       └── utils/
├── graphify-out/           # Knowledge graph (query before reading many files)
│   ├── graph.json
│   └── GRAPH_REPORT.md
└── README.md
```

## Graphify — token minimization (Cursor / AI IDE)

[Graphify](https://github.com/safishamsi/graphify) builds a **queryable knowledge graph** of this codebase so AI assistants use far fewer tokens — they traverse structure instead of re-reading every file.

### One-time setup

```bash
pip install graphifyy
graphify cursor install --project   # adds .cursor/rules/graphify.mdc
graphify update .                   # AST-only build (no API key needed)
```

### Daily workflow

```bash
# After code changes (free, no LLM cost)
graphify update .

# Query instead of grepping the whole repo
graphify query "how does booking OTP payment work?"
graphify path "createBooking" "verifyCompletionOtp"
graphify explain "Provider"
```

In **Cursor chat**, type `/graphify .` to rebuild, or use the commands above in terminal.

### What gets committed

| File | Purpose |
|------|---------|
| `graphify-out/graph.json` | Queryable graph — share with team |
| `graphify-out/GRAPH_REPORT.md` | Architecture summary |
| `.cursor/rules/graphify.mdc` | Tells Cursor to query graph first |
| `.graphifyignore` | Skips node_modules, assets from graph build |

Local-only (in `.gitignore`): `graphify-out/cache/`, `graph.html`, manifest/cost files.

Optional semantic extract for docs/PDFs: set `GEMINI_API_KEY` or `ANTHROPIC_API_KEY`, then `graphify extract .`

---

## Quick Start (Docker — recommended)

```bash
cd backend
docker compose up -d --build
docker compose --profile seed run --rm seed
```

API: `http://localhost:5000/api/health`

| Service | Port |
|---------|------|
| API | 5000 |
| MongoDB | 27017 |

Stop: `docker compose down`  
Production: `docker compose -f docker-compose.prod.yml up -d --build`

### Payment flow

1. **15% advance** — paid at booking (Razorpay / mock in dev)
2. Provider completes service → **generates 6-digit OTP**
3. **Customer + provider** both verify the same OTP in the app
4. **85% remaining** — unlocked only after mutual OTP verification

### Provider pricing

- `PUT /api/providers/profile/me/pricing` — set base rates + per-service prices
- Booking amount uses per-service price when `eventType` matches `servicePricing`

---

## Quick Start (manual)

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Expo Go app (for mobile testing)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
# Start MongoDB, then:
npm run dev
```

Seed sample data:

```bash
npm run seed
```

**Test accounts (after seed):**

| Role | Mobile | OTP (dev) |
|------|--------|-----------|
| Admin | 9999999999 | 123456 |
| Customer | 9876543210 | 123456 |
| Pandit | 9123456780 | 123456 |
| Nau | 9123456781 | 123456 |

### 2. Mobile App

```bash
cd mobile
cp .env.example .env
npm install
npm run start:clear
```

When Expo asks to log in, choose **Proceed anonymously**. Scan the QR code with **Expo Go** (phone and PC on same Wi‑Fi).

If the app does not load on phone, try tunnel mode: `npm run start:tunnel`

**API URL for devices:**

| Environment | URL |
|-------------|-----|
| iOS Simulator | `http://localhost:5000/api` |
| Android Emulator | `http://10.0.2.2:5000/api` |
| Physical device | `http://<YOUR_LAN_IP>:5000/api` |

## API Overview

Base URL: `http://localhost:5000/api`

| Endpoint | Description |
|----------|-------------|
| `POST /auth/send-otp` | Send OTP to mobile |
| `POST /auth/verify-otp` | Verify OTP, get JWT |
| `GET /locations/states` | All Indian states |
| `GET /locations/states/:code/districts` | Districts by state |
| `GET /providers/search` | Search with filters |
| `POST /bookings` | Create booking |
| `POST /bookings/:id/payment/order` | Razorpay order (advance 15% or remaining 85%) |
| `POST /bookings/:id/mark-service-complete` | Provider generates completion OTP |
| `POST /bookings/:id/verify-completion-otp` | Customer/provider mutual OTP verify |
| `PUT /providers/profile/me/pricing` | Provider sets custom prices |
| `GET /admin/dashboard` | Admin analytics |

## Features Implemented

- OTP login with JWT session persistence (SecureStore)
- Roles: customer, pandit, nau, admin
- Provider registration with document fields
- India location hierarchy (36 states + districts + cities)
- GPS nearby provider search
- Service categories for Pandit & Nau
- Provider search filters (rating, charges, verified, location)
- Booking flow (hourly / half-day / full-day / multi-day)
- Razorpay payment (mock mode without keys)
- Reviews & report
- Admin dashboard (approve providers, stats)
- Push notification hooks (FCM)
- Saffron-white cultural UI with NativeWind

## Environment Variables

### Backend (`backend/.env`)

See `backend/.env.example` for Twilio, Razorpay, DigiLocker, Google Maps, and Firebase keys.

### Mobile (`mobile/.env`)

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

## Deployment

### Backend (Railway / Render / AWS)

1. Set `MONGODB_URI` to MongoDB Atlas connection string
2. Set `JWT_SECRET`, `RAZORPAY_*`, `TWILIO_*`, `FIREBASE_SERVER_KEY`
3. Set `CLIENT_URL` to your app domains
4. Run `npm start`

### Mobile (EAS Build)

```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

Update `app.json` with your EAS project ID and configure push notification credentials.

### MongoDB Atlas

1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist server IPs
3. Use connection string in `MONGODB_URI`

## Integrations (Production Checklist)

- [ ] **Twilio** – real SMS OTP (`TWILIO_*`)
- [ ] **Razorpay** – add `react-native-razorpay` in PaymentScreen
- [ ] **DigiLocker** – complete OAuth callback handler
- [ ] **Google Maps** – Maps SDK keys in app.json / native config
- [ ] **Firebase** – FCM for push; register device token via `PUT /auth/profile`
- [ ] **Document upload** – S3/Cloudinary for Aadhaar/PAN images

## Regenerate Location Data

```bash
cd backend
node src/scripts/generate-locations.js
```

## License

Proprietary – PujaSetu © 2026
