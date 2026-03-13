# Deployment Guide — Realm Agent

## Services

| Service | Description |
|---------|-------------|
| Elixir (Phoenix) | Core backend — polling, push, weekly reset |
| PostgreSQL | Database |

That's it. No separate push gateway needed.

---

## Prerequisites

- Firebase project with FCM enabled → service account JSON key
- Blizzard API credentials (Client ID + Secret)
- PostgreSQL database

---

## Backend Elixir

### Option 1: Fly.io (Recommended)

```bash
cd backend-elixir
fly auth login
fly launch
```

Set secrets:

```bash
fly secrets set \
  BLIZZARD_CLIENT_ID=your_client_id \
  BLIZZARD_CLIENT_SECRET=your_client_secret \
  SECRET_KEY_BASE=$(mix phx.gen.secret) \
  FIREBASE_SERVICE_ACCOUNT_JSON="$(cat firebase-service-account.json)"
```

Create and attach a Postgres database:

```bash
fly postgres create
fly postgres attach <postgres-app-name>
```

Deploy:

```bash
fly deploy
fly ssh console -C "/app/bin/realm_agent eval 'RealmAgent.Release.migrate()'"
```

### Option 2: Railway

1. Connect your GitHub repository
2. Set the root directory to `backend-elixir`
3. Add environment variables (same as above)
4. Add a PostgreSQL service — `DATABASE_URL` is set automatically

---

## Mobile App

### Android

1. **Firebase:** Download `google-services.json` → place at `mobile-android/android/app/google-services.json`

2. **AdMob:** Update `AndroidManifest.xml`:
   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
   ```

3. **Keystore:**
   ```bash
   cd mobile-android/android/app
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore realm-agent.keystore -alias realm-agent \
     -keyalg RSA -keysize 2048 -validity 10000
   ```

4. **Build:**
   ```bash
   cd mobile-android
   npm install
   cd android && ./gradlew bundleRelease
   ```

5. Upload the `.aab` to Google Play Console.

### iOS

1. **Firebase:** Download `GoogleService-Info.plist` → place at `mobile-android/ios/RealmAgent/GoogleService-Info.plist`

2. **AdMob:** Set `ADMOB_APP_ID` as a build setting in Xcode (or via `xcconfig`).
   The `Info.plist` already references `$(ADMOB_APP_ID)`.

3. **Install pods:**
   ```bash
   cd mobile-android/ios && pod install
   ```

4. **Build:** Open `RealmAgent.xcworkspace` in Xcode → Archive → Distribute.

---

## Monitoring

**Fly.io:**
```bash
fly logs
```

**Railway:**
Dashboard → Deployments → Logs

**Firebase Console:**
Cloud Messaging → Reports

---

## Cost Estimate

| Service | Cost |
|---------|------|
| Fly.io (Elixir + Postgres) | ~$10–15/month |
| FCM (push notifications) | Free |
| Google Play registration | $25 one-time |
| Apple Developer Program | $99/year |

---

## Security Checklist

- Never commit credentials to Git
- Use environment variables for all secrets
- HTTPS on all endpoints
- Validate inputs in the backend
