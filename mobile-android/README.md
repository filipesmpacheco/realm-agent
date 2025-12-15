# Realm Agent - Mobile Android

Aplicativo React Native para monitoramento de status dos reinos do World of Warcraft.

## Configuração Inicial

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Adicione um app Android:
   - Package name: `com.realmagent`
   - Baixe o arquivo `google-services.json`
   - Coloque em `android/app/google-services.json`

### 3. Configurar AdMob

1. Acesse o [AdMob Console](https://apps.admob.com/)
2. Crie um app Android
3. Crie unidades de anúncio (Banner)
4. Anote os IDs das unidades de anúncio
5. Atualize `android/app/src/main/AndroidManifest.xml` com seu AdMob App ID

### 4. Configurar In-App Purchase

1. Configure produtos no Google Play Console
2. Produto: `remove_ads` - Preço: $2.99
3. Atualize o código em `src/services/iap.ts` com o SKU correto

## Estrutura do Projeto

```
src/
├── screens/              # Telas principais
│   ├── OnboardingScreen.tsx
│   ├── StatusScreen.tsx
│   ├── EventsScreen.tsx
│   └── SettingsScreen.tsx
├── components/           # Componentes reutilizáveis
│   ├── AdBanner.tsx
│   ├── HeroCard.tsx
│   ├── EventCard.tsx
│   └── ...
├── services/             # Serviços
│   ├── fcm.ts           # Firebase Cloud Messaging
│   └── iap.ts           # In-App Purchase
├── theme/                # Tema Material Design 3
│   └── index.ts
└── navigation/           # Navegação
    └── AppNavigator.tsx
```

## Próximos Passos para Implementação

### Telas a Implementar

1. **OnboardingScreen.tsx**
   - Solicitar permissão de notificações
   - Toggles para categorias (Status / Weekly Reset)
   - Botão "Ativar e continuar"

2. **StatusScreen.tsx**
   - Hero Card com resumo (online/offline)
   - Lista de mudanças recentes
   - Botão "Ver todos os eventos"

3. **EventsScreen.tsx**
   - Filtros (Tudo / Offline / Online / Reset)
   - Timeline de eventos
   - Cards expandíveis

4. **SettingsScreen.tsx**
   - Toggles de notificação
   - Botão de compra (remover anúncios)
   - Informações do app

### Serviços a Implementar

1. **fcm.ts**
   ```typescript
   - requestPermission()
   - subscribeToTopic(topic: string)
   - unsubscribeFromTopic(topic: string)
   - onMessage(handler)
   ```

2. **iap.ts**
   ```typescript
   - purchaseRemoveAds()
   - checkPurchaseStatus()
   - restorePurchases()
   ```

### Componentes a Criar

1. **AdBanner.tsx** - Banner AdMob (oculto se comprou remoção)
2. **HeroCard.tsx** - Card principal da tela Status
3. **EventCard.tsx** - Card de evento na timeline
4. **ToggleRow.tsx** - Row com toggle para configurações

## Tópicos FCM

O app deve assinar os seguintes tópicos:

- `wow_us_all_status` - Mudanças de status
- `wow_us_weekly_reset` - Weekly reset

## Build e Deploy

### Debug Build

```bash
npm run android
```

### Release Build

```bash
cd android
./gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

### Gerar AAB para Play Store

```bash
cd android
./gradlew bundleRelease
```

O AAB estará em: `android/app/build/outputs/bundle/release/app-release.aab`

## Notas Importantes

- **Permissões Android 13+**: Solicitar permissão de notificações em runtime
- **Channel ID**: Criar canal de notificação `realm_status` para Android 8+
- **Background Restrictions**: O app não roda em background; notificações vêm do backend
- **AdMob Test Ads**: Use IDs de teste durante desenvolvimento

## Referências

- [React Native Firebase](https://rnfirebase.io/)
- [React Navigation](https://reactnavigation.org/)
- [Google Mobile Ads](https://docs.page/invertase/react-native-google-mobile-ads)
- [React Native IAP](https://github.com/dooboolab-community/react-native-iap)
