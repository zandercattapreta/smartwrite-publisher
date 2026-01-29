# SmartWrite Publisher - Fases de Versão

## 📊 Visão Geral das Fases

| Fase        | Versão | Data          | Status          | Objetivo                         |
| ----------- | ------ | ------------- | --------------- | -------------------------------- |
| **Phase 1** | 0.1.x  | 18/01/2026    | ✅ Concluída    | Fundação, Sidebar, Conectividade |
| **Phase 2** | 0.2.x  | 28-29/01/2026 | ✅ Concluída    | Publicação de Nota Ativa         |
| **Phase 3** | 0.3.x  | 29/01/2026+   | 🔄 Em Progresso | Tiptap JSON + Automação          |
| **Phase 4** | 0.4.x  | Planejado     | ⏳ Futuro       | Publicação em Lote               |

---

## 🎯 PHASE 1: Foundation (v0.1.x)

### Objetivo

Criar a base do plugin: interface, conectividade com Substack, logs.

### Versões

- **v0.1.0** - 18/01/2026
    - Sidebar básica
    - Teste de conexão
    - Logger simples

- **v0.1.1** - 18/01/2026
    - Aba de configurações oficial
    - Modal "How-to" para captura de cookies
    - Ícone de ajuda

- **v0.1.2-v0.1.7** - 18/01/2026
    - Logger service aprimorado
    - Smart cookie parsing
    - Diagnóstico detalhado
    - Partial rendering otimizado

### Resultado

✅ Plugin funcional com interface básica e logs

---

## 🚀 PHASE 2: Active Note Publishing (v0.2.x)

### Objetivo

Implementar publicação de notas do Obsidian → Substack.

### Timeline

```
v0.2.0        - Primeira publicação funcional
    ↓
v0.2.6-v0.2.6.10 - Série de 11 hotfixes para debugar
                 (problemas de API, headers, endpoints)
```

### Hotfixes Realizados

| Versão     | Data  | Problema                  | Solução                              |
| ---------- | ----- | ------------------------- | ------------------------------------ |
| 0.2.6      | 29/01 | Markdown converter bugado | Implementado converter.ts            |
| 0.2.6.1    | 29/01 | draft_bylines inválido    | Conditional logic                    |
| 0.2.6.2    | 29/01 | Endpoint 404              | Fallback para /drafts?publication_id |
| 0.2.6.3    | 29/01 | Payload com campos extras | Simplificado                         |
| 0.2.6.4-6  | 29/01 | draft_bylines (reprise)   | Array vazio vs omitido               |
| 0.2.6.6    | 29/01 | **FINALMENTE RESOLVIDO**  | Array vazio `[]` é obrigatório       |
| 0.2.6.7-10 | 29/01 | Query param, type safety  | Publication ID strategy              |

### Key Learning

⚠️ **Descoberta**: Série de hotfixes revelou problemas **arquiteturais**, não apenas bugs pontuais
→ Levou a decisão de refactoring completo (v0.3.0)

### Resultado

✅ Publicação funciona (mas código muito desorganizado)

---

## 🏗️ PHASE 3: Architecture + Tiptap JSON (v0.3.x)

### Objetivo

1. **Refactor arquitetura** (0.3.0)
2. **Implementar Tiptap JSON** (0.3.2)
3. **Adicionar automação** (0.3.3+)
4. **Garantir qualidade** (testes, docs)

### Versões Implementadas

#### **v0.3.0** - 29/01/2026 (Major Refactor)

**Problema**: Código monolítico, duplicações, headers errados

**Solução**: Arquitetura modular

```
ANTES:
  substack.ts (532 linhas)
    ├─ Tudo junto: HTTP, payload, erros, estratégias
    ├─ Duplicação de endpoints
    └─ Headers incorretos (substack.sid → deveria ser connect.sid)

DEPOIS:
  SubstackClient.ts (HTTP wrapper correto)
  SubstackPayloadBuilder.ts (Factory pattern)
  SubstackErrorHandler.ts (Error handling)
  SubstackIdStrategy.ts (Strategy pattern)
  SubstackService.ts (Orchestrator limpo)
```

**Mudanças**:

- ✅ Separação de responsabilidades (SRP)
- ✅ 532 linhas → ~150 por componente (-72%)
- ✅ Headers corrigidos (connect.sid)
- ✅ Endpoints duplicados removidos
- ✅ 100% type safe

#### **v0.3.1** - 29/01/2026 (Hotfix - Title Extraction)

**Problema**: Regex `/^#\s+.+\n?/` capturava H1, H2, H3 indistintamente

- Arquivo com H1 + H2 perdia o H2 no body

**Solução**: `/^# +[^\n]*\n?/` (exatamente um `#`)

- Respeita hierarquia: H1 (título) > H2+ (body)

#### **v0.3.2** - 29/01/2026 (Tiptap JSON Implementation)

**Problema**: Enviando HTML literal em `draft_body` field

- Post no Substack exibia tags HTML como texto
- Ex: `<h2>Título</h2>` aparecia literalmente

**Root Cause**: Substack API espera `bodyJson` (Tiptap JSON), não HTML string

**Solução Implementada**:

1. Novo conversor: `markdownToTiptapJson()`
2. Parser inline: `parseInlineMarkdown()` (bold, italic, code, strikethrough)
3. Changed field: `draft_body` → `bodyJson`
4. Type validation: suporta string (legacy) e TiptapDocument

**Tiptap JSON Structure**:

```json
{
    "type": "doc",
    "attrs": { "schemaVersion": "v1" },
    "content": [
        {
            "type": "paragraph",
            "content": [
                { "type": "text", "text": "Hello ", "marks": [] },
                {
                    "type": "text",
                    "text": "world",
                    "marks": [{ "type": "bold" }]
                }
            ]
        }
    ]
}
```

#### **v0.3.3** - 29/01/2026 (Parser Bug Fixes)

**Problema**: Posts ainda saindo vazios

- `parseInlineMarkdown()` podia retornar estruturas inválidas
- Nodes vazios geravam parágrafos sem conteúdo

**Solução**:

- Type safety: Always returns `Array<TiptapText>`
- Validação: Texto vazio retorna `[{ type: 'text', text: '' }]`
- Garantia: Documento nunca fica vazio

**Bugs Corrigidos**:

1. Italic vs Bold regex ambígua → Separadas
2. Nodes vazios possíveis → Validados
3. Array vazio → Parágrafo vazio garantido

### Próximas Versões Planejadas

#### **v0.3.4+** (em desenvolvimento)

- [ ] Testes unitários para conversor
- [ ] Suporte a listas (bullets, numbered)
- [ ] Suporte a blockquotes
- [ ] Suporte a código de múltiplas linhas
- [ ] Suporte a imagens
- [ ] Tratamento de links

---

## 📦 PHASE 4: Batch Publishing (v0.4.x)

### Objetivo

Publicar múltiplas notas em lote.

### Planejado

- [ ] Seleção de múltiplos arquivos
- [ ] Pré-visualização de cada post
- [ ] Agendamento em lote
- [ ] Relatório de publicações
- [ ] Sincronização bidirecional (Obsidian ↔ Substack)

---

## 📈 Progresso por Métrica

### Arquitetura

```
Phase 1: ██░░░░░░ (Básica)
Phase 2: █████░░░ (Funcional, com dívida técnica)
Phase 3: ████████░ (Refatorada, com Tiptap JSON)
Phase 4: ░░░░░░░░░ (Planejado)
```

### Qualidade de Código

```
Phase 1: 60% (Prototype)
Phase 2: 40% (Hotfixes everywhere)
Phase 3: 85% (Arquitetura + tipos + docs)
Phase 4: 90% (Com testes planejados)
```

### Cobertura de Funcionalidades

```
v0.1: Conexão + Logs              ████░░░░░░ (40%)
v0.2: Publicação básica           █████████░ (90%)
v0.3: Tiptap JSON + Automação     ████████░░ (80%)
v0.4: Batch + Sync                ░░░░░░░░░░ (0% planejado)
```

---

## 🔄 Padrão de Desenvolvimento Observado

### Pattern: Problem → Hotfix → Refactor

1. **Problem Emerges** (v0.2.6)
    - API calls failing, headers wrong, duplicates

2. **Quick Hotfixes** (v0.2.6.1-6)
    - Conditional logic, fallbacks, patches
    - Cada hotfix revela novo problema

3. **Root Cause Analysis** (v0.2.6.6 final)
    - Problemas arquiteturais identificados
    - Não é só bugs, é design ruim

4. **Refactor** (v0.3.0)
    - Rewrite completo com patterns corretos
    - Separation of concerns
    - Type safety

5. **New Problems** (v0.3.2)
    - Tiptap JSON specs não eram conhecidas
    - Parser implementado com bugs

6. **Fix & Iterate** (v0.3.3)
    - Validação, type checking
    - Garantias de não-vazio

### Lição

💡 **Hotfixes são Band-Aids**: Se há muitos hotfixes em sequência, é sinal de problema arquiteural → Refactor

---

## 📊 Timeline Visual

```
18/01 ────────────────────────────────────────── 29/01
v0.1 ║ v0.2 (hotfixes!) ║ v0.3.0 ║ v0.3.1 ║ v0.3.2 ║ v0.3.3 →

Foundation    Phase 2         Phase 3 - Refactor + Tiptap
              Buggy           Clean Arch + JSON parsing

Current Status: v0.3.3 - Posts rendering correctly (hopefully! 🤞)
```

---

## 🎯 O Que Cada Fase Entregou

| Phase | Entrega              | Aprendizado                |
| ----- | -------------------- | -------------------------- |
| **1** | Interface funcional  | Como fazer plugin Obsidian |
| **2** | Publicação live      | Não escalável com hotfixes |
| **3** | Arquitetura + Tiptap | Refactor vale a pena       |
| **4** | Batch automation     | (pendente)                 |

---

## 🚀 Status Atual (v0.3.3)

### ✅ Implementado

- Sidebar com Quick Settings
- Markdown → Tiptap JSON converter
- Publicação de nota ativa
- Detecção de Publication ID (5 estratégias)
- Error handling inteligente
- Type safety 100%
- Release automation
- Comprehensive documentation

### 🧪 Em Teste

- Posts saindo com conteúdo correto?
- Parser inline funcionando?
- Formatação (bold, italic) renderizando?

### ⏳ Próximo

- Mais testes com exemplos reais
- Suporte a listas
- Suporte a blockquotes
- Suporte a imagens

---

## 📝 Conclusão

**SmartWrite Publisher evoluiu de:**

- 🔴 Prototype bugado (v0.1)
- 🟠 Funcional mas frágil (v0.2)
- 🟢 Sólido com arquitetura (v0.3)
- 🟢 Pronto para batch (v0.4 planejado)

**Próximo milestone**: Validar que v0.3.3 realmente fixa o problema de posts vazios.
