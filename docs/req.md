Requisitos Funcionais (RF)

Monitoramento de Reinos

RF01 — Consulta periódica de status
O sistema deve consultar a API oficial da Blizzard para verificar o status dos reinos a cada 1 minuto.

RF02 — Listagem completa de reinos
O aplicativo deve exibir a lista completa de reinos das regiões Americas e Oceania.

RF03 — Indicação visual de status
Cada reino deve apresentar um indicador visual de status (ex.: ponto verde para online, vermelho para offline).

RF04 — Atualização automática da lista
A lista de reinos deve atualizar automaticamente quando houver mudança de status detectada.

RF05 — Exibição de contagem de reinos online/offline
O sistema deve mostrar o número total de reinos online e offline em tempo real.

RF06 — Visualização detalhada de reino
O usuário deve poder visualizar informações adicionais de um reino, como nome completo e status atual.

⸻

Favoritos

RF07 — Marcar reinos como favoritos
O usuário deve poder marcar reinos como favoritos.

RF08 — Remover reinos dos favoritos
O usuário deve poder remover reinos da lista de favoritos.

RF09 — Filtro por favoritos
O aplicativo deve permitir visualizar apenas os reinos favoritos.

RF10 — Ordenação por favoritos
Reinos favoritos devem aparecer prioritariamente na lista de reinos.

⸻

Notificações

RF11 — Notificação de mudança de status
O sistema deve enviar uma notificação quando um reino monitorado mudar de status (offline → online ou online → offline).

RF12 — Configuração de notificações de status
O usuário deve poder ativar ou desativar notificações de mudança de status.

RF13 — Notificação do weekly reset
O sistema deve enviar notificação automática no horário do weekly reset (terça-feira às 15:00 UTC).

RF14 — Configuração de notificações do weekly reset
O usuário deve poder ativar ou desativar notificações do weekly reset.

RF15 — Notificações apenas para favoritos
O usuário deve poder escolher receber notificações apenas para reinos favoritos.

⸻

Cadastro e Perfil de Usuário

RF16 — Cadastro de usuário
O sistema deve permitir criação de conta utilizando email e senha.

RF17 — Login de usuário
O sistema deve permitir autenticação de usuários previamente cadastrados.

RF18 — Logout de usuário
O usuário deve poder encerrar sua sessão no aplicativo.

RF19 — Perfil de usuário simples
O sistema deve permitir visualizar e editar um perfil contendo:
	•	nome ou nickname
	•	email
	•	preferências de notificação

RF20 — Persistência de preferências do usuário
O sistema deve armazenar as preferências do usuário entre sessões.

⸻

Preferências e Configurações

RF21 — Configuração de frequência de atualização
O usuário deve poder escolher a frequência de atualização dos reinos dentro de limites definidos pelo sistema.

RF22 — Configuração de notificações gerais
O usuário deve poder ativar ou desativar todas as notificações do aplicativo.

RF23 — Configuração de sons ou vibração de notificação
O sistema deve permitir definir comportamento de alerta para notificações.

⸻

Busca e Navegação

RF24 — Busca de reinos
O sistema deve permitir buscar reinos pelo nome.

RF25 — Ordenação da lista de reinos
A lista de reinos deve permitir ordenação por:
	•	nome
	•	status
	•	favoritos

RF26 — Paginação ou carregamento eficiente
A lista de reinos deve ser carregada de forma eficiente para evitar consumo excessivo de memória.

⸻

Histórico e Monitoramento

RF27 — Histórico de status de reinos
O sistema deve registrar mudanças recentes de status dos reinos.

RF28 — Visualização do histórico
O usuário deve poder visualizar um histórico de mudanças de status recentes.

⸻

Compatibilidade e Atualizações

RF29 — Atualização automática dos dados da API
O aplicativo deve buscar automaticamente novos dados quando disponíveis.

RF30 — Atualização automática da lista de reinos
Caso novos reinos sejam adicionados pela Blizzard, o aplicativo deve incorporá-los automaticamente.

⸻

Requisitos Não Funcionais (RNF)

Performance

RNF01 — Tempo de resposta da interface
A navegação entre telas deve ocorrer em menos de 500 ms em dispositivos modernos.

RNF02 — Atualização eficiente da API
As consultas à API devem ser otimizadas para reduzir consumo de bateria e dados móveis.

RNF03 — Uso eficiente de memória
O aplicativo deve gerenciar memória de forma eficiente para evitar travamentos.

⸻

Confiabilidade

RNF04 — Tolerância a falhas de rede
O sistema deve tratar falhas de conexão sem interromper a experiência do usuário.

RNF05 — Persistência do último status conhecido
Caso a API esteja indisponível, o aplicativo deve exibir o último status conhecido dos reinos.

⸻

Segurança

RNF06 — Comunicação segura com APIs
Todas as comunicações devem utilizar HTTPS/TLS.

RNF07 — Proteção de dados do usuário
Informações de usuário devem ser armazenadas de forma segura.

⸻

Escalabilidade

RNF08 — Arquitetura modular
O sistema deve permitir adição de novas regiões ou funcionalidades sem alterações estruturais profundas.

RNF09 — Suporte a grande número de usuários
A infraestrutura deve suportar crescimento da base de usuários.

⸻

Compatibilidade

RNF10 — Suporte multiplataforma
O aplicativo deve funcionar corretamente em Android e iOS.

RNF11 — Compatibilidade com diferentes resoluções de tela
A interface deve adaptar-se a diferentes tamanhos de dispositivos.

⸻

Experiência do Usuário

RNF12 — Interface intuitiva
O aplicativo deve possuir interface clara e simples de utilizar.

RNF13 — Feedback visual imediato
A interface deve fornecer feedback visual após ações do usuário.

⸻

Observabilidade e Manutenção

RNF14 — Registro de erros (logging)
O sistema deve registrar erros para análise e manutenção.

RNF15 — Monitoramento de falhas
O aplicativo deve registrar crashes para melhoria contínua.

Eficiência Energética

RNF16 — Otimização de consumo de bateria
O sistema deve minimizar operações em background para reduzir consumo de energia.

⸻

Atualizações

RNF17 — Atualizações compatíveis
Atualizações do aplicativo não devem quebrar dados existentes.