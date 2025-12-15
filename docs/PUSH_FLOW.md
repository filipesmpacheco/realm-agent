# Fluxo de Notificações Push

Este documento descreve o fluxo completo de notificações push no Realm Agent, desde a detecção de mudanças até a entrega no dispositivo do usuário.

## Arquitetura

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│  Blizzard API   │─────▶│ Elixir Core  │─────▶│  Node.js    │
│  (Status WoW)   │      │  (Monitor)   │      │  (Gateway)  │
└─────────────────┘      └──────────────┘      └─────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────┐
                                              │  Firebase   │
                                              │     FCM     │
                                              └─────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────┐
                                              │   Android   │
                                              │     App     │
                                              └─────────────┘
```

## Tipos de Notificação

### 1. Mudança de Status (Individual)

**Trigger:** Um realm muda de UP para DOWN (ou vice-versa)

**Fluxo:**

1. StatusChecker detecta mudança
2. Cria evento no banco de dados
3. Chama Notifier.send_status_change/1
4. Node.js envia para tópico `wow_us_all_status`
5. FCM entrega para dispositivos inscritos

**Payload:**

```json
{
  "topic": "wow_us_all_status",
  "notification": {
    "title": "Realm OFFLINE",
    "body": "Area 52 ficou OFFLINE • Americas & Oceania"
  },
  "data": {
    "type": "individual",
    "realm_name": "Area 52",
    "status": "OFFLINE"
  }
}
```

### 2. Mudança de Status (Agregada)

**Trigger:** Mais de 5 reinos mudam simultaneamente

**Fluxo:**

1. StatusChecker detecta múltiplas mudanças
2. Agrega em um único evento
3. Envia resumo ao invés de notificações individuais

**Payload:**

```json
{
  "topic": "wow_us_all_status",
  "notification": {
    "title": "Mudanças de status",
    "body": "12 reinos mudaram (8 offline, 4 online)"
  },
  "data": {
    "type": "aggregated",
    "changes": [...]
  }
}
```

### 3. Weekly Reset

**Trigger:** Cron job (toda terça-feira às 15:00 UTC)

**Fluxo:**

1. Oban dispara WeeklyResetWorker
2. Worker chama Notifier.send_weekly_reset/1
3. Node.js envia para tópico `wow_us_weekly_reset`

**Payload:**

```json
{
  "topic": "wow_us_weekly_reset",
  "notification": {
    "title": "Weekly reset",
    "body": "US/Latin/Oceanic — terças 15:00 UTC"
  },
  "data": {
    "type": "weekly_reset",
    "region": "us",
    "timestamp": "2024-01-16T15:00:00Z"
  }
}
```

## Tópicos FCM

O app Android assina os seguintes tópicos:

| Tópico                | Descrição          | Quando Assinar                         |
| --------------------- | ------------------ | -------------------------------------- |
| `wow_us_all_status`   | Mudanças de status | Quando "Mudanças de status" está ativo |
| `wow_us_weekly_reset` | Weekly reset       | Quando "Weekly reset" está ativo       |

### Gerenciamento de Inscrições

O app gerencia inscrições dinamicamente:

```typescript
// Ativar notificações de status
await subscribeToTopic("wow_us_all_status");

// Desativar notificações de status
await unsubscribeFromTopic("wow_us_all_status");
```

## Dedupe e Throttling

Para evitar spam de notificações, o backend implementa:

### 1. Dedupe (Flapping Prevention)

Se um realm oscila entre UP/DOWN rapidamente:

- **Janela:** 5 minutos
- **Ação:** Ignora mudanças dentro da janela
- **Resultado:** Apenas a primeira mudança gera notificação

### 2. Agregação

Se muitos reinos mudam simultaneamente:

- **Threshold:** 5 reinos
- **Ação:** Agrupa em uma única notificação
- **Resultado:** "12 reinos mudaram" ao invés de 12 notificações

### 3. Rate Limiting

Por tipo de evento:

- **Status changes:** Máximo 1 notificação a cada 60 segundos
- **Weekly reset:** Apenas 1 vez por semana

## Configuração Android

### Notification Channel

O app cria um canal de notificação:

```kotlin
val channel = NotificationChannel(
    "realm_status",
    "Realm Status",
    NotificationManager.IMPORTANCE_HIGH
)
```

### Permissões

Android 13+ requer permissão em runtime:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

### Handling de Notificações

#### Foreground (App aberto)

```typescript
onMessageReceived((message) => {
  // Exibir notificação local ou atualizar UI
});
```

#### Background (App fechado)

FCM entrega automaticamente. Ao tocar:

```typescript
onNotificationOpenedApp((message) => {
  // Navegar para tela relevante
  if (message.data.type === "weekly_reset") {
    navigation.navigate("Events");
  }
});
```

## Monitoramento

### Logs do Backend Elixir

```
[info] StatusChecker iniciado. Polling a cada 60000ms
[info] Encontrados 245 connected realms
[info] Status mudou: Area 52 (1) -> DOWN
[info] Detectadas 1 mudanças de status
[info] Notificação enviada com sucesso para tópico: wow_us_all_status
```

### Logs do Node.js

```
✅ Firebase Admin SDK inicializado com sucesso
🚀 Realm Agent Push Gateway rodando na porta 3000
2024-01-16T12:00:00Z - POST /push/topic
✅ Notificação enviada para tópico "wow_us_all_status": projects/.../messages/...
```

## Troubleshooting

### Notificações não chegam

1. **Verificar inscrição no tópico:**

   ```typescript
   const topics = await messaging().getSubscribedTopics();
   console.log("Subscribed topics:", topics);
   ```

2. **Verificar permissões:**

   ```typescript
   const hasPermission = await requestPermission();
   console.log("Has permission:", hasPermission);
   ```

3. **Verificar logs do backend:**
   - Elixir: StatusChecker detectou mudança?
   - Node.js: Recebeu requisição do Elixir?
   - FCM: Mensagem foi enviada com sucesso?

### Notificações duplicadas

- Verificar se o app não está inscrito no mesmo tópico múltiplas vezes
- Verificar logs do backend para dedupe

## Referências

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [FCM Topics](https://firebase.google.com/docs/cloud-messaging/android/topic-messaging)
- [Android Notifications](https://developer.android.com/develop/ui/views/notifications)
