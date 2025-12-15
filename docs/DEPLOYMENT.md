# Deployment Guide - Realm Agent

Este guia descreve como fazer deploy dos componentes do Realm Agent em produção.

## Pré-requisitos

- Conta no Firebase (para FCM)
- Credenciais da Blizzard API
- Conta no Google Play Console (para publicar o app)
- Conta no AdMob

## Backend Elixir (Core Service)

### Opção 1: Fly.io (Recomendado)

1. **Instalar Fly CLI:**

```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login:**

```bash
fly auth login
```

3. **Criar app:**

```bash
cd backend-elixir
fly launch
```

4. **Configurar secrets:**

```bash
fly secrets set BLIZZARD_CLIENT_ID=your_client_id
fly secrets set BLIZZARD_CLIENT_SECRET=your_client_secret
fly secrets set NODE_SERVICE_URL=https://your-node-service.com
fly secrets set SECRET_KEY_BASE=$(mix phx.gen.secret)
```

5. **Criar banco de dados:**

```bash
fly postgres create
fly postgres attach <postgres-app-name>
```

6. **Deploy:**

```bash
fly deploy
```

7. **Rodar migrations:**

```bash
fly ssh console
mix ecto.migrate
```

### Opção 2: Railway

1. **Conectar repositório:**

   - Acesse railway.app
   - Crie novo projeto
   - Conecte seu repositório GitHub

2. **Configurar variáveis:**

   - `BLIZZARD_CLIENT_ID`
   - `BLIZZARD_CLIENT_SECRET`
   - `NODE_SERVICE_URL`
   - `SECRET_KEY_BASE`

3. **Adicionar PostgreSQL:**

   - Railway → Add Service → PostgreSQL
   - Variável `DATABASE_URL` será criada automaticamente

4. **Deploy automático:**
   - Push para branch main dispara deploy

## Backend Node.js (Push Gateway)

### Opção 1: Heroku

1. **Criar app:**

```bash
cd backend-node
heroku create realm-agent-push
```

2. **Configurar buildpack:**

```bash
heroku buildpacks:set heroku/nodejs
```

3. **Configurar variáveis:**

```bash
heroku config:set PORT=3000
```

4. **Upload do service account:**

```bash
# Converter para base64 e configurar como variável
cat firebase-service-account.json | base64 > firebase-base64.txt
heroku config:set FIREBASE_SERVICE_ACCOUNT_BASE64=$(cat firebase-base64.txt)
```

5. **Atualizar código para decodificar:**

```javascript
// src/firebase.js
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  ? JSON.parse(
      Buffer.from(
        process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
        "base64"
      ).toString()
    )
  : require(serviceAccountPath);
```

6. **Deploy:**

```bash
git push heroku main
```

### Opção 2: Railway

Similar ao backend Elixir, mas:

- Root directory: `backend-node`
- Start command: `npm start`

## Mobile Android

### 1. Preparação

1. **Configurar Firebase:**

   - Baixe `google-services.json`
   - Coloque em `android/app/`

2. **Configurar AdMob:**

   - Obtenha App ID e Unit IDs
   - Atualize `AndroidManifest.xml`:

   ```xml
   <meta-data
       android:name="com.google.android.gms.ads.APPLICATION_ID"
       android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
   ```

3. **Configurar Keystore:**

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore realm-agent.keystore -alias realm-agent -keyalg RSA -keysize 2048 -validity 10000
```

4. **Configurar `gradle.properties`:**

```properties
REALM_AGENT_UPLOAD_STORE_FILE=realm-agent.keystore
REALM_AGENT_UPLOAD_KEY_ALIAS=realm-agent
REALM_AGENT_UPLOAD_STORE_PASSWORD=***
REALM_AGENT_UPLOAD_KEY_PASSWORD=***
```

5. **Atualizar `android/app/build.gradle`:**

```gradle
signingConfigs {
    release {
        storeFile file(REALM_AGENT_UPLOAD_STORE_FILE)
        storePassword REALM_AGENT_UPLOAD_STORE_PASSWORD
        keyAlias REALM_AGENT_UPLOAD_KEY_ALIAS
        keyPassword REALM_AGENT_UPLOAD_KEY_PASSWORD
    }
}
```

### 2. Build Release

```bash
cd mobile-android
npm install
cd android
./gradlew bundleRelease
```

AAB estará em: `android/app/build/outputs/bundle/release/app-release.aab`

### 3. Google Play Console

1. **Criar app:**

   - Acesse play.google.com/console
   - Criar aplicativo

2. **Upload AAB:**

   - Production → Create new release
   - Upload `app-release.aab`

3. **Configurar In-App Products:**

   - Monetize → Products → In-app products
   - Criar produto `remove_ads` - $2.99

4. **Configurar AdMob:**

   - Monetize → Monetization setup
   - Link AdMob account

5. **Preencher informações:**

   - Store listing
   - Content rating
   - Privacy policy

6. **Enviar para revisão**

## Monitoramento

### Logs do Backend Elixir

**Fly.io:**

```bash
fly logs
```

**Railway:**

- Dashboard → Deployments → Logs

### Logs do Node.js

**Heroku:**

```bash
heroku logs --tail
```

**Railway:**

- Dashboard → Deployments → Logs

### Firebase Console

- Analytics → Events
- Cloud Messaging → Reports

### Google Play Console

- Statistics → Overview
- Crashes → ANRs & crashes

## Troubleshooting

### Backend não conecta ao banco

- Verificar `DATABASE_URL`
- Rodar migrations: `mix ecto.migrate`

### Notificações não chegam

- Verificar Firebase service account
- Verificar logs do Node.js
- Testar endpoint manualmente:

```bash
curl -X POST https://your-node-service.com/push/topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "wow_us_all_status",
    "notification": {
      "title": "Test",
      "body": "Test notification"
    }
  }'
```

### App crasha no Android

- Verificar logs: `adb logcat`
- Verificar ProGuard rules
- Testar em debug build primeiro

## Custos Estimados

### Infraestrutura

- **Fly.io (Elixir):** ~$5-10/mês (1 shared CPU, 256MB RAM)
- **Heroku/Railway (Node.js):** ~$5/mês (hobby tier)
- **PostgreSQL:** Incluído no Fly.io ou ~$5/mês no Railway

### Firebase

- **FCM:** Gratuito (mensagens ilimitadas)
- **Analytics:** Gratuito

### Google Play

- **Taxa única:** $25 (registro de desenvolvedor)
- **Comissão:** 15% das vendas (primeiros $1M/ano)

### AdMob

- **Gratuito:** Você recebe por impressões/cliques

**Total estimado:** ~$15-20/mês + $25 inicial

## Backup e Recuperação

### Banco de Dados

**Fly.io:**

```bash
fly postgres backup create
fly postgres backup list
```

**Railway:**

- Backups automáticos diários

### Código

- Manter repositório Git atualizado
- Tags de release: `git tag v1.0.0`

## Atualizações

### Backend

1. Push para repositório
2. Deploy automático (Railway) ou `fly deploy` (Fly.io)

### Mobile

1. Incrementar `versionCode` e `versionName` em `build.gradle`
2. Build novo AAB
3. Upload no Play Console
4. Rollout gradual (10% → 50% → 100%)

## Segurança

- ✅ Nunca commitar credenciais no Git
- ✅ Usar variáveis de ambiente
- ✅ HTTPS em todos os endpoints
- ✅ Validar inputs no backend
- ✅ Rate limiting no Node.js (considerar adicionar)
- ✅ Monitorar logs para atividades suspeitas
