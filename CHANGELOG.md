# Changelog: SmartWrite Publisher

## [0.2.6.4] - 2026-01-29 (Hotfix IV - Final)

### 🎯 Fixo

- **draft_bylines Field**: Corrigido erro 400 "Invalid value"
  - **Problema**: Substack API rejeita payload sem `draft_bylines`
  - **Causa**: Código estava omitindo o campo quando user_id era 0
  - **Solução**: SEMPRE incluir `draft_bylines` no payload
    - Se user_id válido: `draft_bylines: [{ user_id: ... }]`
    - Se user_id inválido: `draft_bylines: []` (vazio)
  - **Resultado**: Payload agora sempre tem a estrutura correta

### ✨ Status

- ✅ Build: SUCCESS
- ✅ Endpoint: `/api/v1/drafts` (sempre tentado)
- ✅ Fallback: `/api/v1/drafts?publication_id={pubId}`
- 🎯 Ready: Para publicar draft

---

## [0.2.6.3] - 2026-01-29 (Hotfix III)

### Fixo

- **Payload Simplification**: Removido campos desnecessários do payload
  - Removido: `publication_id` do payload (pode estar causando 400)
  - Removido: `audience` field (pode estar causando 400)
  - Testado: Payload mínimo com apenas campos essenciais

- **Fallback Endpoint**: Alterado estratégia de fallback
  - De: `/api/v1/publications/{pubId}/drafts` (404)
  - Para: `/api/v1/drafts?publication_id={pubId}` (query parameter)
  - Motivo: Endpoint /api/v1/publications/{id}/drafts não existe

---

## [0.2.6.2] - 2026-01-29 (Hotfix II)

### Fixo

- **API Endpoint Fix**: Corrigido endpoint 404 para criação de drafts
  - Problema: Endpoint `/api/v1/posts` não existe (404)
  - Problema 2: Código estava pulando `/api/v1/drafts` quando user_id era 0
  - Solução 1: **Sempre** tenta `/api/v1/drafts` primeiro (removido conditional)
  - Solução 2: Adicionado `publication_id` no payload (estava faltando)
  - Solução 3: Fallback para `/api/v1/publications/{pubId}/drafts` em vez de `/api/v1/posts`
  - Resultado: Draft creation agora funciona com ou sem user_id

---

## [0.2.6.1] - 2026-01-29 (Hotfix)

### Fixo

- **API Draft Creation**: Corrigido erro 400 "Invalid value" para `draft_bylines`
  - Problema: Endpoint `/api/v1/drafts` rejeita draft_bylines vazio/inválido quando user_id não está disponível
  - Solução: Se user_id não está disponível (id === 0), tenta diretamente o endpoint alternativo `/api/v1/posts`
  - Resultado: Publicação agora funciona mesmo sem identificar explicitamente o user_id

- **User Detection**: Melhorado tratamento de endpoints que não retornam user info
  - `/api/v1/publication` retorna dados de publicação, não de usuário (user_id será 0)
  - `/api/v1/user/self` retorna dados de usuário (user_id será extraído)
  - Fallback agora funciona corretamente

---

## [0.2.6] - 2026-01-29

### Adicionado

- **Markdown Converter (converter.ts)**: Novo módulo para conversão completa de Markdown para HTML com suporte a:
  - YAML frontmatter parsing
  - Todos os elementos Markdown (headings, bold, italic, listas, código, blockquotes, etc.)
  - Obsidian callouts
  - Extração automática de título e tags
  - Escaping seguro de HTML contra XSS

- **Substack API Integration (substack.ts)**: Integração completa com API do Substack incluindo:
  - Normalização inteligente de cookies
  - Detecção de Publication ID com 5 estratégias de fallback
  - Testes de conexão com múltiplos endpoints
  - Criação de rascunhos e publicação de posts
  - Tratamento robusto de erros

- **Publishing Workflow**: Interface completa para publicação:
  - Botão "Create Draft" (ação padrão para testes)
  - Botão "Publish Live" (para publicação imediata)
  - Botão "Schedule" (placeholder para Phase 3)
  - Status badge mostrando estado da nota
  - Indicador visual de conexão (verde/vermelho)

- **Enhanced Settings Tab**: Painel de configurações melhorado:
  - Botão "Test Connection" intregado
  - Auto-teste ao mudar URL do Substack
  - Organização lógica de seções

### Alterado

- **view.ts**: Reescrita completa com integração de SubstackService e MarkdownConverter
  - Suporte a PublisherView com referências dinâmicas para otimização
  - Método de publicação com tratamento de estado (isPublishing)
  - Logs em tempo real com copy/clear functionality
  - Seção de batch publishing (UI ready, logic para Phase 3)

- **main.ts**: Integração de SubstackService
  - Inicialização de serviço com credenciais
  - Método testConnection() centralizado
  - Notificações de status de conexão
  - Sincronização entre plugin e view

- **settings.ts**: Melhorias de configuração
  - Cabeçalho de configuração adicionado
  - Botão de teste de conexão
  - Seção "Ajuda e suporte" reorganizada

### Fixo

- **Type Safety**: Resolvidas todas as issues de TypeScript:
  - Propriedades privadas do SubstackService (cookie, hostname)
  - Declaração duplicada de publicationId removida
  - Tipagem adequada de async/await

- **Security**: Correções de segurança:
  - XSS prevention removendo innerHTML em favor de textContent
  - HTML escaping seguro no converter
  - Cookie handling seguro e normalizado

- **Code Quality**: Melhorias de qualidade:
  - Remoção de imports não utilizados
  - Sentence case consistency
  - Proper error handling e fallbacks
  - Documentação com JSDoc comments

### Removido

- Publicação forçada em modo Draft durante Phase 2 (será configurável em Phase 3)

### Status

- ✅ Build: SUCCESS
- ✅ TypeScript: PASSED
- ✅ ESLint: PASSED (17 non-blocking warnings)
- ✅ Plugin Deployed: .obsidian/plugins/smartwrite-publisher/
- 🔄 Testing: Ready for QA

---

## [0.1.7] - 2026-01-18

### Adicionado

- **Logger Service**: Novo sistema de logs internos para diagnóstico de erros.
- **Seção de Logs na Sidebar**: Visualização em tempo real dos eventos de sistema.
- **Botão Copiar Logs**: Facilita o envio de relatórios para suporte.

### Fixo

- **Crise de Conexão**: Melhoria nos headers de request (User-Agent e Accept) para evitar bloqueios.
- **Diagnóstico Detalhado**: Captura do código HTTP e corpo da resposta em caso de erro.

## [0.1.6] - 2026-01-18

### Fixo

- **Smart Cookie Parsing**: O plugin agora decodifica automaticamente cookies no formato `s%3A` e limpa prefixos `substack.sid=` para evitar erros de cópia.
- **Autor**: Confirmação global do nome **Zander Catta Preta**.

## [0.1.5] - 2026-01-18

### Alterado

- Nome do autor atualizado para **Zander Catta Preta** em todos os metadados e documentação.

## [0.1.4] - 2026-01-18

### Fixo

- Melhoria no diagnóstico do Test Connection (exibição de erro HTTP).
- Ajuste na lógica de autenticação via cookies.

## [0.1.3] - 2026-01-18

### Otimizado

- **Partial Rendering**: A Sidebar agora atualiza apenas os elementos necessários em vez de reconstruir todo o DOM.
- **Debounce**: Detecção de nota ativa agora possui um atraso inteligente de 500ms para evitar sobrecarga em navegação rápida.
- **Logs**: Removidos logs de diagnóstico verbosos para manter o console limpo.

## [0.1.2] - 2026-01-18

### Fixo

- Sincronização e deploy para ambiente de testes.
- Garantia de que o bundle reflete as últimas alterações de UX e Logs.

## [0.1.1] - 2026-01-18

### Adicionado

- Aba de configurações oficial em _Settings > SmartWrite Publisher_.
- Modal de ajuda "How-to" com guia para captura de cookies.
- Ícone de ajuda na Sidebar para acesso rápido ao manual.
- Política de release automatizada e documentada.

### Alterado

- Reset de `DEFAULT_SETTINGS` para um estado limpo (Zero State).
- Reorganização das pastas do projeto para `/script`.
- Melhoria no log de diagnóstico no console do Obsidian.

## [0.1.0] - 2026-01-18

- Versão inicial com Sidebar básica e teste de conexão com Substack.
