# Roadmap: SmartWrite Publisher

Visão geral das versões planejadas e seu progresso.

## v0.1.x - Fundação ✅ COMPLETA

**Objetivo**: Estabelecer a infraestrutura base do plugin.

- [x] Boilerplate TypeScript + Obsidian API
- [x] Sidebar com seções funcionais
- [x] Sistema de configurações (cookies + URL)
- [x] Validação de conexão com Substack
- [x] Detecção de nota ativa com debounce
- [x] Sistema de logs para diagnóstico
- [x] Modal de ajuda com instruções

**Marcos**: v0.1.0 → v0.2.0

---

## v0.2.x - Publicação Individual ⏳ EM DESENVOLVIMENTO

**Objetivo**: Permitir publicar a nota ativa no Substack.

- [x] Parser de frontmatter (`app.metadataCache`) - Versão inicial
- [x] Conversor Markdown → HTML (Substack-compatible)
- [ ] Gerador de hashtags baseado em metadados
- [x] Fluxo de publicação: Draft / Live
- [ ] Schedule (Planejado para v0.2.2)
- [x] Feedback visual de sucesso/erro

**Marcos**: v0.2.0 → v0.2.2 (atual)

**Próximos passos**:

1. Refinar o `MarkdownConverter` para suportar imagens internas
2. Implementar agendamento (Schedule)
3. Iniciar Fase 3: Publicação em Lote

---

## v0.3.x - Publicação em Lote 📋 PLANEJADO

**Objetivo**: Publicar múltiplas notas de um diretório.

- [ ] Seletor de pastas do vault
- [ ] Scanner de arquivos pendentes (sem `published_at`)
- [ ] Motor de publicação sequencial com fila
- [ ] Barra de progresso na UI
- [ ] Relatório de processamento ao final

---

## v0.4.x - Polimento 📋 PLANEJADO

**Objetivo**: Melhorar UX e estabilidade.

- [ ] Notificações nativas do Obsidian
- [ ] Sincronização de propriedade `published_at` no YAML
- [ ] Suporte a temas (Dark/Light)
- [ ] Tratamento de erros mais robusto
- [ ] Documentação para usuários finais

---

## Legenda

- ✅ Completa
- ⏳ Em desenvolvimento
- 📋 Planejado
