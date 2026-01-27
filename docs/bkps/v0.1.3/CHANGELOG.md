# Changelog: SmartWrite Publisher

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
