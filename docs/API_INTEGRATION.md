# Integração com a Blizzard API

Este documento descreve como o Realm Agent integra com a Blizzard API para monitorar o status dos reinos do World of Warcraft.

## Autenticação

O backend Elixir utiliza OAuth 2.0 Client Credentials flow para autenticar com a Blizzard API.

### Obter Credenciais

1. Acesse: https://develop.battle.net/
2. Faça login com sua conta Battle.net
3. Crie uma nova aplicação OAuth
4. Anote o **Client ID** e **Client Secret**

### Fluxo de Autenticação

```
POST https://oauth.battle.net/token
Authorization: Basic base64(client_id:client_secret)
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
```

Resposta:

```json
{
  "access_token": "USmc0V...",
  "token_type": "bearer",
  "expires_in": 86399
}
```

## Endpoints Utilizados

### 1. Connected Realms Index

Lista todos os connected realms de uma região.

**Endpoint:**

```
GET https://us.api.blizzard.com/data/wow/connected-realm/index
```

**Parâmetros:**

- `namespace`: `dynamic-us` (para Americas & Oceania)
- `locale`: `en_US`
- `access_token`: Token OAuth

**Resposta:**

```json
{
  "connected_realms": [
    {
      "href": "https://us.api.blizzard.com/data/wow/connected-realm/1?namespace=dynamic-us"
    },
    ...
  ]
}
```

### 2. Connected Realm Status

Obtém o status de um connected realm específico.

**Endpoint:**

```
GET https://us.api.blizzard.com/data/wow/connected-realm/{id}
```

**Parâmetros:**

- `namespace`: `dynamic-us`
- `locale`: `en_US`
- `access_token`: Token OAuth

**Resposta:**

```json
{
  "id": 1,
  "status": {
    "type": "UP"
  },
  "realms": [
    {
      "id": 1,
      "name": "Area 52",
      "slug": "area-52"
    }
  ],
  "population": {
    "type": "FULL"
  }
}
```

## Rate Limits

A Blizzard API possui rate limits:

- **36,000 requests por hora** (10 requests por segundo)
- **100 requests por segundo** (burst)

### Estratégia de Polling

Para evitar rate limits, o Realm Agent:

1. Faz polling a cada **60 segundos** (configurável)
2. Trabalha com **connected realms** (não reinos individuais)
3. Implementa **backoff exponencial** em caso de erro

## Tratamento de Erros

### Códigos de Status

- `200 OK` - Sucesso
- `401 Unauthorized` - Token inválido ou expirado
- `404 Not Found` - Realm não encontrado
- `429 Too Many Requests` - Rate limit excedido
- `500 Internal Server Error` - Erro do servidor Blizzard

### Retry Logic

O backend implementa retry com backoff exponencial:

```
Tentativa 1: imediato
Tentativa 2: 2 segundos
Tentativa 3: 4 segundos
Tentativa 4: 8 segundos
```

## Regiões Suportadas

Atualmente, o Realm Agent monitora apenas:

- **US** (United States)
- **Latin America**
- **Oceanic**

Todas essas regiões usam o namespace `dynamic-us`.

### Futuras Expansões

- **EU** (Europe) - `dynamic-eu`
- **KR** (Korea) - `dynamic-kr`
- **TW** (Taiwan) - `dynamic-tw`
- **CN** (China) - `dynamic-cn`

## Referências

- [Blizzard API Documentation](https://develop.battle.net/documentation)
- [OAuth 2.0 Guide](https://develop.battle.net/documentation/guides/using-oauth)
- [WoW Game Data APIs](https://develop.battle.net/documentation/world-of-warcraft/game-data-apis)
