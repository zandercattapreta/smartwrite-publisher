# Plan: Post Metadata Fields (Campos Transversais)

**Data**: 2026-01-29
**Tipo**: Funcionalidades transversais (aplicam-se a Draft, Live, Schedule)
**Status**: Planejamento

---

## 🎯 Objetivo

Permitir configuração de metadados avançados dos posts do Substack diretamente do Obsidian:

- Audience (público-alvo)
- Free Preview (preview gratuito)
- Allow Comments (permitir comentários)
- Delivery (entrega)
- Tags

---

## 📊 Campos Identificados

### Grupo 1: Configurações Default (Audience, Free Preview, Allow Comments, Delivery)

**Comportamento esperado**:

1. Mostrar configuração default do blog na sidebar
2. Permitir alteração antes de publicar
3. Alteração sincroniza com Substack

**UI Design**:

```
┌─────────────────────────────────┐
│ ⚙️ Configurações de Publicação  │
│                                 │
│ Audience:     [Only Paid ▼]     │
│ Free Preview: [First 25%  ▼]    │
│ Comments:     [✓] Permitir      │
│ Delivery:     [✓] Enviar email  │
└─────────────────────────────────┘
```

### Grupo 2: Tags

**Comportamento esperado**:

1. Buscar lista de tags do blog via API
2. Exibir como checkboxes ou multi-select
3. Permitir adicionar nova tag
4. Aplicar a post único ou lote

**UI Design**:

```
┌─────────────────────────────────┐
│ 🏷️ Tags                         │
│                                 │
│ [✓] fiction                     │
│ [✓] sci-fi                      │
│ [ ] horror                      │
│ [ ] fantasy                     │
│                                 │
│ [+ Add new tag]                 │
└─────────────────────────────────┘
```

---

## 🔍 Investigação API - Por Campo

### 1. Audience (Público-alvo)

**Valores possíveis**:

- `everyone` - Todos
- `only_free` - Apenas assinantes gratuitos
- `only_paid` - Apenas assinantes pagos

**Investigar**:

- [ ] Campo no payload: `audience`
- [ ] GET default do blog: `/api/v1/publication` (?)
- [ ] Aceita alteração por post?

**Payload esperado**:

```json
{
    "draft_title": "...",
    "bodyJson": "...",
    "audience": "only_paid"
}
```

---

### 2. Free Preview (Preview Gratuito)

**Valores possíveis**:

- `none` - Sem preview
- `first_25` - Primeiros 25%
- `first_50` - Primeiros 50%
- `full` - Completo

**Investigar**:

- [ ] Campo no payload: `free_preview` ou `paywall_free_preview`
- [ ] GET default: `/api/v1/publication`
- [ ] Aceita alteração por post?

**Payload esperado**:

```json
{
    "draft_title": "...",
    "bodyJson": "...",
    "paywall_free_preview": "first_25"
}
```

---

### 3. Allow Comments (Permitir Comentários)

**Valores possíveis**:

- `true` - Permitir
- `false` - Não permitir

**Investigar**:

- [ ] Campo no payload: `write_comment_permissions` ou `allow_comments`
- [ ] Valores: boolean ou string (`everyone`, `only_paid`, `none`)?
- [ ] GET default: `/api/v1/publication`

**Payload esperado**:

```json
{
    "draft_title": "...",
    "bodyJson": "...",
    "write_comment_permissions": "only_paid"
}
```

---

### 4. Delivery (Enviar Email)

**Valores possíveis**:

- `true` - Enviar email aos assinantes
- `false` - Não enviar

**Investigar**:

- [ ] Campo no payload: `should_send_email` ou `send_email`
- [ ] GET default: `/api/v1/publication`
- [ ] Aceita alteração por post?

**Payload esperado**:

```json
{
    "draft_title": "...",
    "bodyJson": "...",
    "should_send_email": true
}
```

---

### 5. Tags

**Valores possíveis**:

- Array de strings: `["fiction", "sci-fi"]`

**Investigar**:

- [ ] Campo no payload: `tags` ou `sections`
- [ ] GET lista de tags: `/api/v1/tags` (?)
- [ ] POST nova tag: Criar on-the-fly ou pré-cadastrar?
- [ ] Limite de tags por post?

**Payload esperado**:

```json
{
    "draft_title": "...",
    "bodyJson": "...",
    "tags": ["fiction", "sci-fi", "new-tag"]
}
```

---

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/
├── substack/
│   ├── SubstackMetadataManager.ts  [NOVO]
│   │   ├── fetchDefaultSettings()
│   │   ├── fetchAvailableTags()
│   │   └── buildMetadataPayload()
│   ├── SubstackPayloadBuilder.ts   [MODIFICAR]
│   │   └── Adicionar campos de metadata
│   └── types.ts                    [MODIFICAR]
│       ├── PostMetadata interface
│       └── PublishOptions.metadata
├── view.ts                          [MODIFICAR]
│   ├── renderMetadataSection()     [ADICIONAR]
│   └── renderTagsSelector()        [ADICIONAR]
└── settings.ts                      [MODIFICAR]
    └── defaultMetadata settings
```

### Fluxo de Dados

```
[Plugin carrega]
     ↓
[MetadataManager] fetchDefaultSettings()
     ↓
[Settings] Armazena defaults
     ↓
[View] Renderiza campos com defaults
     ↓
[User altera campo]
     ↓
[PayloadBuilder] buildMetadataPayload()
     ↓
[SubstackClient] POST com metadata
     ↓
[Substack API]
```

---

## 📦 Blocos de Desenvolvimento

### Bloco 1: Audience ⏳

**Prioridade**: Média
**Depende de**: Investigação API

- [ ] Investigar campo `audience` na API
- [ ] Se suportado: Implementar UI dropdown
- [ ] Se suportado: Modificar PayloadBuilder
- [ ] Se NÃO suportado: Marcar como bloqueado

**Estimativa**: 1 sessão (se API suportar)

---

### Bloco 2: Free Preview ⏳

**Prioridade**: Baixa
**Depende de**: Investigação API

- [ ] Investigar campo `paywall_free_preview` na API
- [ ] Se suportado: Implementar UI dropdown
- [ ] Se suportado: Modificar PayloadBuilder
- [ ] Se NÃO suportado: Marcar como bloqueado

**Estimativa**: 1 sessão (se API suportar)

---

### Bloco 3: Allow Comments ⏳

**Prioridade**: Média
**Depende de**: Investigação API

- [ ] Investigar campo `write_comment_permissions` na API
- [ ] Se suportado: Implementar UI checkbox/dropdown
- [ ] Se suportado: Modificar PayloadBuilder
- [ ] Se NÃO suportado: Marcar como bloqueado

**Estimativa**: 1 sessão (se API suportar)

---

### Bloco 4: Delivery (Email) ⏳

**Prioridade**: Alta (importante para automação)
**Depende de**: Investigação API

- [ ] Investigar campo `should_send_email` na API
- [ ] Se suportado: Implementar UI checkbox
- [ ] Se suportado: Modificar PayloadBuilder
- [ ] Se NÃO suportado: Marcar como bloqueado

**Estimativa**: 1 sessão (se API suportar)

---

### Bloco 5: Tags 🎯

**Prioridade**: Alta (feature muito útil)
**Depende de**: Investigação API

- [ ] Investigar endpoint GET `/api/v1/tags`
- [ ] Investigar campo `tags` no payload
- [ ] Se suportado: Implementar MetadataManager.fetchAvailableTags()
- [ ] Se suportado: Implementar UI multi-select
- [ ] Se suportado: Permitir adicionar nova tag
- [ ] Se suportado: Modificar PayloadBuilder
- [ ] Se NÃO suportado: Marcar como bloqueado

**Estimativa**: 2-3 sessões (se API suportar)

---

## 🧪 Plano de Testes

### Por Campo

**Teste 1: Audience**

- Alterar para "Only Paid"
- Publicar draft
- Verificar no Substack: Audience correto

**Teste 2: Free Preview**

- Alterar para "First 25%"
- Publicar draft
- Verificar no Substack: Paywall na posição correta

**Teste 3: Allow Comments**

- Desabilitar comentários
- Publicar draft
- Verificar no Substack: Comentários desabilitados

**Teste 4: Delivery**

- Desabilitar envio de email
- Publicar live
- Verificar: Email NÃO enviado aos assinantes

**Teste 5: Tags**

- Selecionar 2 tags existentes
- Adicionar 1 tag nova
- Publicar draft
- Verificar no Substack: 3 tags aplicadas

---

## 🚨 Riscos & Plano de Contingência

### Risco 1: API não suporta campo X

**Probabilidade**: Média-Alta
**Impacto**: Bloqueia funcionalidade

**Plano**:

- Investigar TODOS os campos antes de implementar
- Priorizar campos suportados
- Marcar como "bloqueado" no Roadmap os não suportados
- Considerar workarounds (ex: web scraping, ou manual)

### Risco 2: Tags não tem endpoint GET

**Probabilidade**: Média
**Impacto**: Médio

**Plano A**: Extrair tags de posts existentes
**Plano B**: Permitir apenas input manual (não multi-select)
**Plano C**: Marcar como bloqueado

### Risco 3: Defaults variam por publicação

**Probabilidade**: Baixa
**Impacto**: Médio

**Plano**: Armazenar defaults nos settings locais, permitir edição

---

## 📊 Priorização

| Campo          | Prioridade | Razão                                 |
| -------------- | ---------- | ------------------------------------- |
| Tags           | 🔴 Alta    | Organização, descoberta, SEO          |
| Delivery       | 🔴 Alta    | Evitar envio acidental de email       |
| Allow Comments | 🟡 Média   | Controle de engajamento               |
| Audience       | 🟡 Média   | Paywall, monetização                  |
| Free Preview   | 🟢 Baixa   | Menos usado, pode ser default do blog |

---

## 📅 Roadmap de Implementação

### Fase 0: Investigação (PRÓXIMA) - 1 sessão

- Testar TODOS os campos na API Substack
- Documentar quais são suportados
- Documentar formato de cada campo
- Atualizar este documento com resultados

### Fase 1: Tags (se suportado) - 2-3 sessões

- Implementar MetadataManager
- Fetch de tags disponíveis
- UI multi-select
- Adicionar nova tag

### Fase 2: Delivery (se suportado) - 1 sessão

- UI checkbox
- Modificar PayloadBuilder
- Testar envio de email

### Fase 3: Allow Comments (se suportado) - 1 sessão

- UI checkbox/dropdown
- Modificar PayloadBuilder
- Testar comentários

### Fase 4: Audience (se suportado) - 1 sessão

- UI dropdown
- Modificar PayloadBuilder
- Testar paywall

### Fase 5: Free Preview (se suportado) - 1 sessão

- UI dropdown
- Modificar PayloadBuilder
- Testar preview

---

## 🎯 Próximos Passos Imediatos

1. **Investigar API Substack** (mesma sessão que Schedule)
    - Testar payload com cada campo
    - Verificar resposta
    - Documentar suporte

2. **Atualizar ROADMAP**
    - Adicionar blocos de metadata
    - Marcar bloqueados se não suportados

3. **Priorizar implementação**
    - Tags > Delivery > Comments > Audience > Preview

---

**Status**: 📋 Plano criado, aguardando investigação API
**Próximo**: Testar campos de metadata na API Substack
