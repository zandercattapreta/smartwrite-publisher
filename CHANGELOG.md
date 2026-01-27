# Changelog: SmartWrite Publisher

## [0.2.3] - 2026-01-27

### Adicionado

- **Captura Automática**: O plugin agora tenta validar a conexão e capturar o ID da publicação automaticamente ao preencher a URL ou o Cookie nas configurações.
- **Fallback HTML**: Adicionada extração do `publication_id` via parsing do HTML da página inicial caso a API JSON falhe.

### Corrigido

- **Identificação de Publicação**: Resolvido problema onde publicações com metadados incompletos via API não retornavam o ID interno.

## [0.2.2] - 2026-01-27

### Adicionado

- **Diagnóstico Profundo**: Adicionado log de chaves JSON para facilitar a identificação de mudanças na API do Substack.
- **Forçar Rascunho**: Por segurança, nesta fase de testes, todas as publicações são criadas como rascunho (Draft) por padrão.

### Corrigido

- **ID de Publicação**: Refinada a extração do ID da publicação para suportar respostas aninhadas e diferentes formatos de payload da API.

## [0.2.1] - 2026-01-27

### Adicionado

- **Botão de Teste**: Adicionado botão "Test Connection" diretamente na aba de configurações para melhor UX.
- **Workflow de Atualização**: Definido novo workflow de release em `.agent/workflows/update-code.md`.

### Corrigido

- **Conexão Substack (403)**: Resolvido erro 403 Forbidden através de cabeçalhos de navegador mais robustos e cabeçalho `X-Requested-With`.
- **ID de Publicação**: Implementada lógica de fallback para recuperar o ID da publicação através de múltiplos endpoints da API do Substack.
- **Conversão de Callouts**: Corrigida a ordem de conversão no `MarkdownConverter` para garantir que Callouts do Obsidian sejam processados antes de blockquotes genéricos.
- **Deploy Local**: Ajustado `esbuild.config.mjs` para implantar automaticamente na vault local do projeto.

## [0.2.0] - 2026-01-23

### Adicionado

- **Motor de Publicação**: Implementação completa do fluxo de publicação individual.
- **Biblioteca substack-api**: Integração com biblioteca open-source para comunicação robusta com Substack.
- **Conversor Markdown → HTML**: Novo módulo `converter.ts` que transforma sintaxe Obsidian em HTML compatível.
  - Suporte a frontmatter YAML (título, subtítulo, tags)
  - Conversão de wiki links `[[note]]` para texto
  - Suporte a callouts → blockquotes
  - Formatação completa: bold, italic, strikethrough, listas, código
- **Botões funcionais**: "Publish Live" e "Create Draft" agora executam publicação real.
- **Seletor de pastas**: Dropdown populado com pastas do vault (preparação para v0.3.0).
- **Estado de publicação**: Botões desabilitados durante operação para evitar duplicatas.

### Alterado

- **Arquitetura modular**: Separação de responsabilidades em módulos dedicados:
  - `substack.ts` - Wrapper da API Substack
  - `converter.ts` - Conversão de formato
- **TestConnection**: Agora usa a biblioteca substack-api em vez de chamadas HTTP diretas.
- **Versão bumped**: 0.1.8 → 0.2.0 (nova funcionalidade completa).

### Corrigido

- **Logs em tempo real**: Console de logs atualiza após cada operação.
- **Configuração dinâmica**: Serviço reconfigura automaticamente ao alterar credenciais.

## [0.1.8] - 2026-01-20

### Fixo

- **Autenticação Substack**: Removida decodificação de cookies que quebrava a assinatura da sessão.
- **Request Headers**: Atualizado User-Agent e adicionado Referer para evitar bloqueios e redirecionamentos 404.

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
