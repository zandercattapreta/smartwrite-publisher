# Changelog: SmartWrite Publisher

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
