# Plano de Desenvolvimento Técnico

Detalhes de implementação e critérios de validação para cada fase.

## Versionamento

| Tipo  | Padrão | Exemplo                      |
| ----- | ------ | ---------------------------- |
| Patch | v0.1.X | Bug fixes, ajustes menores   |
| Minor | v0.X.0 | Nova funcionalidade completa |
| Major | vX.0.0 | Breaking changes             |

Backups são criados em `/script/docs/bkps/vX.Y.Z/` antes de mudanças significativas.

---

## Fase 1: Fundação ✅

### Implementação Concluída

```
src/
├── main.ts       # Plugin principal, registro de views e comandos
├── view.ts       # Sidebar UI com seções dinâmicas
├── settings.ts   # Tab de configurações do Obsidian
├── modal.ts      # Modal de ajuda
└── logger.ts     # Sistema de logs
```

### Testes Realizados

- **Unitário**: Validação de cookies vazios
- **Integração**: Persistência após reinício do Obsidian
- **Manual**: Test Connection → indicador verde

---

## Fase 2: Motor de Publicação ⏳

### Arquivos a Criar

```
src/
├── parser.ts     # MetadataParser - extração de frontmatter
├── converter.ts  # MarkdownConverter - MD → HTML
└── api.ts        # SubstackAPI - wrapper de requisições
```

### Implementação Detalhada

**1. MetadataParser**

```typescript
// Usar app.metadataCache.getFileCache(file)
interface NoteMetadata {
    title: string
    subtitle?: string
    tags: string[]
    publishedAt?: Date
}
```

**2. MarkdownConverter**

- Converter `[[wiki links]]` para texto ou remover
- Transformar callouts em blockquotes
- Manter formatação básica (bold, italic, headers)
- Preservar imagens como URLs

**3. SubstackAPI**

```typescript
// Endpoint: POST /api/v1/posts
interface DraftPayload {
    title: string
    body_html: string
    subtitle?: string
}
```

### Critérios de Validação

- [ ] Parser extrai título de nota com/sem frontmatter
- [ ] Conversor gera HTML válido para nota simples
- [ ] API cria draft no Substack com título correto

---

## Fase 3: Bulk Processor 📋

### Arquivos a Criar

```
src/
├── scanner.ts    # Iteração sobre vault
└── queue.ts      # Fila de publicação
```

### Implementação

**Scanner**

```typescript
// Usar app.vault.getFiles() com filtro
const pendingFiles = files.filter(
    (f) => f.path.startsWith(selectedFolder) && !hasPublishedMeta(f)
)
```

**Queue**

- Processamento sequencial com delay
- Estado: pending | processing | done | error
- Relatório final com contagem

### Critérios de Validação

- [ ] Scanner lista apenas arquivos da pasta selecionada
- [ ] Queue processa 3 arquivos em sequência
- [ ] Stress test: 10 arquivos sem crash

---

## Fase 4: Polimento 📋

### Melhorias

- Notificações via `new Notice()` com duração adequada
- Atualização de frontmatter: `published_at: YYYY-MM-DD`
- CSS variables para compatibilidade com temas
- Error boundaries em todas as operações de API
