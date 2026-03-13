# Realm-Agent

Aplicativo mobile Android (React Native) que monitora o status dos reinos de World of Warcraft (Americas & Oceania) e envia notificações push quando há mudanças de status ou durante o weekly reset.

## Arquitetura

O projeto é composto por 3 componentes principais:

1. **Backend Elixir** (`backend-elixir/`) - Core service que monitora a Blizzard API
2. **Backend Node.js** (`backend-node/`) - Push gateway para Firebase Cloud Messaging
3. **Mobile Android** (`mobile-android/`) - Aplicativo React Native

## Pré-requisitos

- Elixir 1.14+ e Erlang/OTP 25+
- Node.js 18+
- PostgreSQL 15+
- Docker e Docker Compose (opcional, para desenvolvimento local)
- Android Studio (para build do app)

### Credenciais Necessárias

Você precisará obter:

1. **Blizzard API**: Client ID e Client Secret

   - Acesse: https://develop.battle.net/
   - Crie uma aplicação OAuth

2. **Firebase**:

   - Crie um projeto no Firebase Console
   - Baixe o arquivo `google-services.json` (para Android)
   - Baixe o Service Account JSON (para backend Node.js)

3. **Google AdMob**:
   - Crie uma conta no AdMob
   - Configure unidades de anúncio para o app

## Configuração

1. Clone o repositório:

```bash
git clone <repository-url>
cd realm-agent
```

2. Copie o arquivo de exemplo de variáveis de ambiente:

```bash
cp .env.example .env
```

3. Edite o `.env` e preencha suas credenciais.

4. Coloque o arquivo `firebase-service-account.json` na raiz do projeto.

## Desenvolvimento Local

### Usando Docker Compose (Recomendado)

```bash
docker-compose up
```

Isso iniciará:

- PostgreSQL na porta 5432
- Backend Elixir na porta 4000
- Backend Node.js na porta 3000

### Manualmente

#### Backend Elixir

```bash
cd backend-elixir
mix deps.get
mix ecto.create
mix ecto.migrate
mix phx.server
```

#### Backend Node.js

```bash
cd backend-node
npm install
npm start
```

#### Mobile Android

```bash
cd mobile-android
npm install
npx react-native run-android
```

## Estrutura do Projeto

```
realm-agent/
├── backend-elixir/          # Phoenix backend (monitoramento)
│   ├── lib/
│   │   ├── realm_agent/
│   │   │   ├── blizzard/    # Cliente Blizzard API
│   │   │   ├── monitor/     # Polling e detecção de mudanças
│   │   │   ├── events/      # Sistema de eventos
│   │   │   └── realms/      # Schemas de reinos
│   │   └── realm_agent_web/
│   └── priv/
├── backend-node/            # Push gateway (FCM)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── index.js
│   └── package.json
├── mobile-android/          # React Native app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── theme/
│   └── android/
└── docs/                    # Documentação
```

## Funcionalidades

### MVP (Versão Inicial)

- ✅ Monitoramento contínuo de status dos reinos (Americas & Oceania)
- ✅ Notificação push quando status muda (online ↔ offline)
- ✅ Notificação agendada de weekly reset (terças 15:00 UTC)
- ✅ Configuração de preferências de notificação
- ✅ Timeline de eventos
- ✅ Anúncios via AdMob
- ✅ Compra in-app para remover anúncios ($2.99)

### Futuro

- 🔄 Favoritos: notificar apenas reinos selecionados
- 🔄 Quiet hours: silenciar notificações em horários específicos
- 🔄 Suporte iOS
- 🔄 Outras regiões (EU, KR, TW)
- 🔄 Histórico detalhado com gráficos

## Testes

### Backend Elixir

```bash
cd backend-elixir
mix test
```

### Backend Node.js

```bash
cd backend-node
npm test
```

### Mobile

```bash
cd mobile-android
npm test
```

## Deploy

Consulte [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para instruções detalhadas de deploy.

## Licença

MIT

## Autor

Filipe Pacheco

claude --resume f83e0208-a4ae-4fa7-a535-18794750e301