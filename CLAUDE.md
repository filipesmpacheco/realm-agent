# Realm Agent — Claude Rules

## Project Overview

Realm Agent is a cross-platform mobile app (Android + iOS) that monitors WoW realm status for Americas & Oceania and sends push notifications on status changes or weekly reset.

### Architecture

```
mobile-android/    # React Native app (Android + iOS)
backend-elixir/    # Phoenix app — polls Blizzard API, sends FCM push directly
docs/              # API, push flow, deployment guides
```

### Tech Stack — Mobile

| Layer       | Library                            |
|-------------|------------------------------------|
| Framework   | React Native 0.83 + React 19       |
| Navigation  | @react-navigation (react-navigation)|
| Push (FCM)  | @react-native-firebase/messaging   |
| Ads         | react-native-google-mobile-ads     |
| IAP         | react-native-iap                   |
| Storage     | @react-native-async-storage        |

---

## Code Style (see `docs/Code Style Guide.md` for full reference)

The style guide at `docs/Code Style Guide.md` is the authoritative source. Key rules:

- **Function components only** — no class components
- **PascalCase** for component files (`.tsx`), **camelCase** for hooks/services/utils (`.ts`)
- **Custom hooks** must start with `use`
- **No `console.log`** — remove before commit
- **No `any` type** — use proper types from the library or define in `src/types/`
- **No Portuguese comments** — all inline comments must be in English
- **`Pressable` over `TouchableOpacity`**
- **`FlatList` over `ScrollView`** for lists — always use `contentInsetAdjustmentBehavior="automatic"`
- **No hardcoded colors/spacing** — always use `src/theme`
- **Routes stay clean** — logic lives in `src/screens/`, routes just import screens

---

## Folder Structure

```
mobile-android/
  src/
    screens/    # Screen components (logic + template)
    components/ # Reusable UI components
    hooks/      # Custom hooks
    services/   # FCM, IAP, AdMob service modules
    types/      # Shared TypeScript types
    theme/      # colors, typography, spacing, borderRadius
  android/      # Android native
  ios/          # iOS native
```

> Routes (`App.tsx` / navigation files) import from `src/screens/` only.

---

## Cross-Platform (Android + iOS)

The app must run on **both** platforms. Every service and screen must be cross-platform.

### Platform-specific rules

- Use `Platform.OS === 'android'` / `Platform.OS === 'ios'` guards when needed
- **Never** use Android-only or iOS-only APIs without a Platform guard
- `PermissionsAndroid` is Android-only — always gate it behind `Platform.OS === 'android'`

### Firebase (FCM)

- Android: requires `google-services.json` at `android/app/google-services.json`
- iOS: requires `GoogleService-Info.plist` at `ios/RealmAgent/GoogleService-Info.plist`
- iOS does NOT use `PermissionsAndroid` — `messaging().requestPermission()` handles it
- `FirebaseAppDelegateProxyEnabled = false` is set in `Info.plist` (manual setup mode)

### In-App Purchase (IAP)

- `react-native-iap` is cross-platform — `initIAP()`, `purchaseRemoveAds()`, `setupPurchaseListeners()` work on both
- SKU for Android Play Store: `remove_ads`
- SKU for iOS App Store: must match the product ID configured in App Store Connect (typically `com.realmagent.removeads` or similar)
- If SKUs differ by platform, use `Platform.select({ ios: '...', android: '...' })`

### AdMob

- Android: `google-services.json` includes AdMob config; App ID declared in `AndroidManifest.xml`
- iOS: `GADApplicationIdentifier` is set via `$(ADMOB_APP_ID)` build variable in `Info.plist`
  - Set `ADMOB_APP_ID` as a build setting in Xcode or via CI environment
- iOS 14+: `NSUserTrackingUsageDescription` is declared in `Info.plist` for ATT prompt
  - Show ATT prompt before initializing AdMob on iOS

### iOS Info.plist requirements

| Key | Purpose |
|-----|---------|
| `GADApplicationIdentifier` | AdMob App ID — set via `$(ADMOB_APP_ID)` build var |
| `NSUserTrackingUsageDescription` | Required for ATT / personalized ads |
| `FirebaseAppDelegateProxyEnabled` | Disable Firebase's automatic swizzling |

### Android Manifest requirements

| Permission | Purpose |
|-----------|---------|
| `INTERNET` | Network access |
| `POST_NOTIFICATIONS` | Push notifications on Android 13+ |

---

## FCM Topics

| Topic | Description |
|-------|-------------|
| `wow_us_all_status` | Realm status changes (UP/DOWN) |
| `wow_us_weekly_reset` | Weekly reset reminder |

Subscribe/unsubscribe via `src/services/fcm.ts` — never call `messaging()` directly from components.

---

## Known Limitations / Future Work

- **Subscription state is not persisted**: On app restart, the UI toggles reset to off even though FCM topic subscriptions remain active server-side. Fix: load/save subscription state to AsyncStorage in `HomeScreen` or a dedicated hook.
- **IAP SKU is Android-centric**: `remove_ads` works for Google Play but must be changed for App Store Connect when configuring iOS IAP.
- **ATT prompt not implemented**: iOS 14+ requires an ATT consent prompt before showing personalized AdMob ads. Implement using `react-native-tracking-transparency` before AdMob initialization.

---

## Backend

Single service: **Elixir (Phoenix)** + PostgreSQL.

- Polls Blizzard API every 60s via `StatusChecker` GenServer
- Sends FCM push directly via FCM v1 HTTP API — auth via `goth` (Google service account)
- Weekly reset scheduled via Oban cron (Tuesdays 15:00 UTC)
- Credentials are **never committed** — use env vars (see below)
- See `docs/API_INTEGRATION.md` and `docs/PUSH_FLOW.md` for full flow details

### Required environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `SECRET_KEY_BASE` | Phoenix secret (generate with `mix phx.gen.secret`) |
| `BLIZZARD_CLIENT_ID` | Blizzard OAuth client ID |
| `BLIZZARD_CLIENT_SECRET` | Blizzard OAuth client secret |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Full JSON content of the Firebase service account key |

`FIREBASE_SERVICE_ACCOUNT_JSON` is optional — when absent, push notifications are skipped with a warning log (useful for local dev without Firebase).

---

## Running the App

```bash
cd mobile-android
npm install

# Android
npx react-native run-android

# iOS (macOS only)
cd ios && pod install && cd ..
npx react-native run-ios
```

> iOS requires macOS with Xcode installed. `GoogleService-Info.plist` must be present before building.
