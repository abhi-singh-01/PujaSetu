# Graph Report - PujaSetu  (2026-05-29)

## Corpus Check
- 99 files · ~24,577 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 578 nodes · 789 edges · 37 communities (32 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e732b108`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `/graphify` - 15 edges
2. `What You Must Do When Invoked` - 14 edges
3. `expo` - 12 edges
4. `PujaSetu` - 12 edges
5. `useAppSelector` - 12 edges
6. `useAppDispatch()` - 11 edges
7. `Provider` - 10 edges
8. `colors` - 9 edges
9. `Booking` - 8 edges
10. `protect()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `LocationSelectionScreen()` --calls--> `useAppDispatch()`  [EXTRACTED]
  mobile/src/screens/LocationSelectionScreen.tsx → mobile/src/hooks/useAppDispatch.ts
- `LoginScreen()` --calls--> `useAppDispatch()`  [EXTRACTED]
  mobile/src/screens/LoginScreen.tsx → mobile/src/hooks/useAppDispatch.ts
- `ServiceCategoriesScreen()` --calls--> `useAppDispatch()`  [EXTRACTED]
  mobile/src/screens/ServiceCategoriesScreen.tsx → mobile/src/hooks/useAppDispatch.ts
- `Props` --references--> `Provider`  [EXTRACTED]
  mobile/src/screens/BookingScreen.tsx → mobile/src/types/index.ts
- `ProviderListScreen()` --calls--> `useAppSelector`  [EXTRACTED]
  mobile/src/screens/ProviderListScreen.tsx → mobile/src/hooks/useAppDispatch.ts

## Communities (37 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (35): mongoose, Booking, Provider, User, allowed, { createNotification }, filter, Provider (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (33): Notification, authorize(), jwt, protect(), User, { validationResult }, mongoose, notificationSchema (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (42): code:powershell (& (Get-Content graphify-out\.graphify_python) -c "), code:powershell (@'), code:powershell (@'), code:powershell (@'), code:powershell (New-Item -ItemType Directory -Force -Path graphify-out | Out), code:powershell (@'), code:powershell (@'), code:powershell (@') (+34 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (38): dependencies, axios, expo, expo-image-picker, expo-linear-gradient, expo-location, expo-notifications, expo-secure-store (+30 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (30): calculateAdvanceAmount(), calculateRemainingAmount(), COMPLETION_OTP_EXPIRY_MINUTES, Razorpay, {
  ADVANCE_PERCENT,
  calculateAdvanceAmount,
  calculateRemainingAmount,
}, advanceAmount, advancePercent, { allowed } (+22 more)

### Community 5 - "Community 5"
Cohesion: 0.05
Nodes (36): code:block1 (/graphify                                             # full), code:powershell (@'), code:powershell (@'), code:powershell (if (-not (Test-Path graphify-out\.graphify_extract.json)) {), code:powershell (@'), code:powershell (@'), code:powershell (@'), code:powershell (@') (+28 more)

### Community 6 - "Community 6"
Cohesion: 0.06
Nodes (30): 1. Backend, 2. Mobile App, API Overview, Backend (`backend/.env`), Backend (Railway / Render / AWS), code:block1 (PujaSetu/), code:bash (cd backend), code:bash (cd backend) (+22 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (29): backgroundColor, backgroundImage, foregroundImage, adaptiveIcon, package, permissions, projectId, expo (+21 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (23): dependencies, bcryptjs, cors, dotenv, express, express-rate-limit, express-validator, helmet (+15 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (11): createBooking(), registerProvider(), ButtonProps, InputProps, BOOKING_TYPES, NAU_SERVICES, PANDIT_SERVICES, Props (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (15): allowed, { body }, { createAndSendOtp, verifyOtp }, generateToken, redirect, token, User, mongoose (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.13
Nodes (8): getDashboardStats(), api, getMyProviderProfile(), getPricing(), listPendingProviders(), updatePricing(), verifyProvider(), Props

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (15): getMe(), sendOtp(), updateProfile(), verifyOtp(), LoginScreen(), Props, authSlice, AuthState (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (7): getProvider(), getProviderReviews(), HeaderProps, ICON_MAP, ServiceCategoryCardProps, Props, colors

### Community 14 - "Community 14"
Cohesion: 0.14
Nodes (13): errorHandler(), notFound(), express, router, app, connectDB, cors, { errorHandler, notFound } (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.19
Nodes (7): getMyBookings(), Tab, Stack, MainTabParamList, RootStackParamList, STATUS_COLORS, Props

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (9): createPaymentOrder(), getCompletionOtpStatus(), markServiceComplete(), verifyCompletionOtp(), verifyPayment(), Props, Props, RemainingPaymentScreen() (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.24
Nodes (8): useAppDispatch(), useAppSelector, MainTabs(), RootNavigator(), HomeScreen(), Props, ProfileScreen(), Props

### Community 18 - "Community 18"
Cohesion: 0.18
Nodes (7): AppDispatch, RootState, store, initialState, LocationFilter, locationSlice, LocationState

### Community 19 - "Community 19"
Cohesion: 0.24
Nodes (8): getCities(), getDistricts(), getStates(), LocationSelectionScreen(), Props, District, LocationState, UserRole

### Community 20 - "Community 20"
Cohesion: 0.24
Nodes (5): searchProviders(), ProviderCardProps, Props, ProviderListScreen(), Provider

### Community 21 - "Community 21"
Cohesion: 0.22
Nodes (7): district, indiaLocations, state, states, express, locationController, router

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (6): fs, outPath, output, path, RAW, states

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (5): code:bash (pip install graphifyy), Graphify (knowledge graph), Key flows, PujaSetu — AI agent guide, Stack

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (3): ONBOARDING_SLIDES, Props, { width }

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (5): compilerOptions, ignoreDeprecations, strict, extends, include

### Community 26 - "Community 26"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig }, { withNativeWind }

## Knowledge Gaps
- **307 isolated node(s):** `PreToolUse`, `name`, `version`, `description`, `main` (+302 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `What You Must Do When Invoked` connect `Community 2` to `Community 5`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `/graphify` connect `Community 5` to `Community 2`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `PreToolUse`, `name`, `version` to the rest of the system?**
  _307 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.051207729468599035 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05496828752642706 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.047619047619047616 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._