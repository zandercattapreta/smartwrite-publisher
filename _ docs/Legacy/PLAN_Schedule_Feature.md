# Plan: Schedule Feature (Agendamento de Publicações)

**Data**: 2026-01-29
**Versão alvo**: v0.4.0
**Prioridade**: Alta (feature mais solicitada)

---

## 🎯 Objetivo

Permitir que o usuário agende publicações de posts no Substack para data/hora futura, diretamente do Obsidian.

---

## 📋 Requisitos Funcionais

### RF1: Seleção de Data/Hora

- [ ] UI: Date picker na sidebar
- [ ] UI: Time picker (hora e minuto)
- [ ] Timezone: Usar timezone do usuário (auto-detectar)
- [ ] Validação: Data futura (não permitir passado)
- [ ] Validação: Horário mínimo (ex: +15min do agora)

### RF2: Criação de Post Agendado

- [ ] API: Verificar se Substack suporta `publish_at` field
- [ ] Payload: Adicionar `publish_at` timestamp ao payload
- [ ] Confirmação: Mostrar mensagem "Agendado para DD/MM/YYYY HH:MM"
- [ ] Log: Registrar agendamento nos logs

### RF3: Gerenciamento de Agendamentos

- [ ] UI: Lista de posts agendados (opcional para v0.4.0)
- [ ] Ação: Cancelar agendamento (opcional para v0.4.0)
- [ ] Ação: Reagendar (editar data/hora) (opcional para v0.4.0)

### RF4: Feedback Visual

- [ ] Status badge: "Agendado" (cor diferente de Draft/Published)
- [ ] Tooltip: Mostrar data/hora agendada ao passar mouse
- [ ] Notificação: Confirmar agendamento bem-sucedido

### RF5: Detecção de Conflitos de Agendamento ⭐ NOVO

- [ ] API: Buscar posts já agendados no Substack
- [ ] Validação: Detectar conflito de horário (posts agendados no mesmo dia/hora)
- [ ] Alerta: Mostrar aviso ao usuário quando houver conflito
- [ ] UI: Listar posts conflitantes (título, horário)
- [ ] Opção: Permitir usuário escolher se prossegue ou reagenda

**Regras de Conflito**:

- ⚠️ **Conflito Total**: Mesmo dia, mesma hora exata (±5min)
- ⚠️ **Aviso**: Múltiplos posts no mesmo dia (informativo)

### RF6: Agendamentos Recorrentes (Batch Publishing) ⭐ NOVO

- [ ] UI: Interface de recorrência (similar a calendários/reuniões)
- [ ] Padrões: Dias úteis, dias específicos da semana, diário, semanal
- [ ] Configuração: Horário fixo para todos os posts
- [ ] Geração: Criar lista de datas automaticamente
- [ ] Preview: Mostrar calendário visual antes de confirmar
- [ ] Validação: Verificar conflitos com agendamentos existentes

**Padrões Suportados**:

- 📅 Todos os dias úteis (seg-sex) às HH:MM
- 📅 Dias específicos (ex: terça e quinta) às HH:MM
- 📅 Semanalmente (toda segunda) às HH:MM
- 📅 Diariamente às HH:MM
- 📅 Customizado: Selecionar dias manualmente

---

## 🔍 Investigação Necessária

### 1. Substack API - Scheduling Support

**Questões**:

- ✅ Substack aceita campo `publish_at` ou `scheduled_at`?
- ✅ Formato: ISO 8601 timestamp? Unix timestamp?
- ✅ Timezone: UTC ou timezone do usuário?
- ✅ Endpoint: `/api/v1/drafts` ou `/api/v1/posts/schedule`?

**Método de investigação**:

1. Testar payload com campo `publish_at` na API atual
2. Verificar resposta do Substack
3. Se não aceitar, investigar endpoint alternativo
4. Fallback: Criar draft + instrução manual ao usuário

**Resultado esperado**:

```json
{
    "draft_title": "Título",
    "bodyJson": "...",
    "type": "newsletter",
    "publish_at": "2026-02-01T15:00:00.000Z" // ISO 8601 UTC
}
```

### 2. Obsidian Plugin - Date Picker

**Questões**:

- ✅ Obsidian API tem componente nativo de date picker?
- ❌ Se não, usar biblioteca externa? (ex: flatpickr)
- ✅ Como integrar na sidebar sem conflito de estilos?

**Opções**:

1. **Native HTML5**: `<input type="datetime-local">`
    - Pros: Simples, nativo, sem dependências
    - Cons: Estilo limitado, pode variar entre navegadores

2. **Flatpickr**: Biblioteca JS popular
    - Pros: Customizável, bom UX
    - Cons: +50KB de bundle size

3. **Obsidian Modal**: Modal com calendário customizado
    - Pros: Controle total, consistente com Obsidian
    - Cons: Mais código para manter

**Recomendação**: Começar com HTML5 `datetime-local` (simples), migrar para Flatpickr se necessário.

### 3. Timezone Handling

**Questões**:

- ✅ Converter timezone do usuário para UTC?
- ✅ Armazenar timezone no settings?
- ✅ Exibir horário local ou UTC na UI?

**Solução**:

```typescript
// Usuário seleciona: 01/02/2026 15:00 (horário local: GMT-3)
const localTime = new Date('2026-02-01T15:00:00')

// Converter para UTC
const utcTime = localTime.toISOString() // "2026-02-01T18:00:00.000Z"

// Enviar para Substack em UTC
payload.publish_at = utcTime
```

### 4. Listagem de Posts Agendados (RF5) ⭐ NOVO

**Questões**:

- ✅ Substack tem endpoint para listar posts agendados?
- ✅ Endpoint: `/api/v1/posts?status=scheduled`? ou `/api/v1/scheduled-posts`?
- ✅ Resposta inclui `publish_at` timestamp?
- ✅ Como paginar resultados (muitos posts agendados)?

**Método de investigação**:

1. Testar GET `/api/v1/posts` com filtro de status
2. Verificar campos retornados (id, title, publish_at, type)
3. Implementar cache local para evitar múltiplas requisições
4. Atualizar cache após criar novo agendamento

**Resultado esperado**:

```json
{
    "scheduled_posts": [
        {
            "id": 12345,
            "title": "Post já agendado",
            "publish_at": "2026-02-01T15:00:00.000Z",
            "type": "newsletter"
        }
    ]
}
```

### 5. Geração de Recorrência (RF6) ⭐ NOVO

**Questões**:

- ✅ Algoritmo para gerar datas de acordo com padrão?
- ✅ Como lidar com feriados (opcional)?
- ✅ Limite de posts: quantos podem ser agendados de uma vez?
- ✅ Como mapear posts do Obsidian para datas geradas?

**Padrões de Implementação**:

```typescript
interface RecurrencePattern {
    type: 'weekdays' | 'specific-days' | 'weekly' | 'daily' | 'custom'
    days?: number[] // 0=domingo, 1=segunda, ..., 6=sábado
    time: string // "09:00"
    startDate: Date
    endDate?: Date // Ou número de ocorrências
    occurrences?: number
}

// Exemplo: Terça e quinta, às 12:00
const pattern: RecurrencePattern = {
    type: 'specific-days',
    days: [2, 4], // Terça=2, Quinta=4
    time: '12:00',
    startDate: new Date('2026-02-01'),
    occurrences: 10, // Próximas 10 ocorrências
}

// Gera: 2026-02-04 12:00, 2026-02-06 12:00, 2026-02-11 12:00, ...
```

**Bibliotecas úteis**:

- Nativa JS: Implementar manualmente (mais controle, sem deps)
- `rrule` (opcional): Biblioteca para recorrência (RFC 5545)

---

## 🏗️ Arquitetura

### Estrutura de Arquivos (Modificações)

```
src/
├── substack/
│   ├── SubstackPayloadBuilder.ts   [MODIFICAR]
│   │   └── buildScheduledPayload() [ADICIONAR]
│   ├── types.ts                    [MODIFICAR]
│   │   └── PublishOptions.scheduledAt: Date [ADICIONAR]
│   ├── SubstackService.ts          [MODIFICAR]
│   │   ├── schedulePost()           [ADICIONAR]
│   │   └── getScheduledPosts()      [ADICIONAR] ⭐ RF5
│   └── SubstackClient.ts           [MODIFICAR]
│       └── fetchScheduledPosts()    [ADICIONAR] ⭐ RF5
├── view.ts                          [MODIFICAR]
│   ├── renderScheduleUI()           [ADICIONAR]
│   ├── handleSchedule()             [ADICIONAR]
│   └── renderRecurrenceUI()         [ADICIONAR] ⭐ RF6
├── utils/
│   ├── datetime.ts                  [NOVO ARQUIVO]
│   │   ├── toUTC()
│   │   ├── toLocalTime()
│   │   └── validateFutureDate()
│   ├── scheduler.ts                 [NOVO ARQUIVO] ⭐ RF5
│   │   ├── detectConflicts()        // Detecta conflitos de horário
│   │   ├── findOverlappingPosts()   // Busca posts no mesmo horário
│   │   └── formatConflictWarning()  // Gera mensagem de alerta
│   └── recurrence.ts                [NOVO ARQUIVO] ⭐ RF6
│       ├── generateDates()          // Gera datas por padrão
│       ├── parsePattern()           // Converte UI → RecurrencePattern
│       └── validateRecurrence()     // Valida padrão antes de gerar
└── types/
    └── schedule.ts                  [NOVO ARQUIVO]
        ├── RecurrencePattern        // Interface de padrão
        ├── ScheduledPost            // Interface de post agendado
        └── ConflictInfo             // Interface de conflito
```

### Fluxo de Dados

#### Fluxo 1: Agendamento Simples (com detecção de conflitos)

```
[User selects date/time in sidebar]
          ↓
[view.ts] handleSchedule()
          ↓
[datetime.ts] validateFutureDate()
          ↓
[SubstackService] getScheduledPosts() ⭐ RF5
          ↓
[scheduler.ts] detectConflicts(selectedDate, existingPosts) ⭐ RF5
          ↓
     [CONFLITO?]
    /          \
  SIM          NÃO
   ↓            ↓
[Alerta]    [Continuar]
   ↓            ↓
[Usuário decide: prosseguir ou cancelar]
          ↓
[datetime.ts] toUTC()
          ↓
[SubstackPayloadBuilder] buildScheduledPayload()
          ↓
[SubstackService] schedulePost()
          ↓
[SubstackClient] POST /api/v1/drafts (with publish_at)
          ↓
[Substack API Response]
          ↓
[view.ts] Update status badge: "Agendado"
```

#### Fluxo 2: Agendamento em Lote com Recorrência ⭐ RF6

```
[User selects folder + recurrence pattern]
          ↓
[view.ts] handleBatchSchedule()
          ↓
[recurrence.ts] parsePattern(userInput) // Dias úteis, 9h, etc.
          ↓
[recurrence.ts] generateDates(pattern, folderFilesCount)
          ↓
[view.ts] Mostrar preview: Lista de posts + datas
          ↓
[Usuário confirma]
          ↓
[SubstackService] getScheduledPosts() // Verificar conflitos
          ↓
[scheduler.ts] detectConflicts(generatedDates, existingPosts)
          ↓
     [CONFLITOS?]
    /          \
  SIM          NÃO
   ↓            ↓
[Mostrar]   [Continuar]
[Conflitos]      ↓
   ↓         [LOOP para cada post]
[Ajustar]         ↓
          [datetime.ts] toUTC()
          ↓
          [SubstackPayloadBuilder] buildScheduledPayload()
          ↓
          [SubstackService] schedulePost()
          ↓
          [Próximo post...]
          ↓
[view.ts] Mostrar resumo: X posts agendados
```

---

## 🎨 UI/UX Design

### Sidebar - Schedule Section

```
┌─────────────────────────────────┐
│ ▼ Nota ativa                    │
│   📄 Meu Post Incrível          │
│   Status: Pendente              │
│                                 │
│   [Create draft]  [Publish live]│
│   [Schedule ▼]                  │ ← NOVO BOTÃO
└─────────────────────────────────┘

Ao clicar em "Schedule ▼":

┌─────────────────────────────────┐
│ 📅 Agendar Publicação           │
│                                 │
│ Data: [01/02/2026     ]         │ ← datetime-local
│ Hora: [15:00          ]         │
│                                 │
│ Timezone: GMT-3 (São Paulo)     │ ← Auto-detectado
│                                 │
│ [Cancelar]  [Agendar Publicação]│
└─────────────────────────────────┘
```

### Status Badge - Agendado

```css
.status-badge.scheduled {
    background-color: var(--text-warning-bg);
    color: var(--text-warning);
}
```

```html
<span class="status-badge scheduled" title="Agendado para 01/02/2026 15:00">
    📅 Agendado
</span>
```

### Alerta de Conflito (RF5) ⭐ NOVO

```
┌────────────────────────────────────────┐
│ ⚠️ Conflito de Agendamento             │
├────────────────────────────────────────┤
│                                        │
│ Já existe(m) post(s) agendado(s)       │
│ para esta data/hora:                   │
│                                        │
│ 📅 01/02/2026 15:00                    │
│   • "Título do Post Conflitante"      │
│                                        │
│ Deseja agendar mesmo assim?            │
│                                        │
│ [Cancelar]  [Reagendar]  [Prosseguir] │
└────────────────────────────────────────┘
```

**Variações**:

- **Conflito Total**: Mesma hora (±5min) → Botão vermelho "Prosseguir"
- **Aviso**: Mesmo dia, hora diferente → Botão amarelo "OK, agendar"

### Interface de Recorrência (RF6) ⭐ NOVO

```
┌────────────────────────────────────────┐
│ 🔁 Agendamento em Lote                 │
├────────────────────────────────────────┤
│                                        │
│ Pasta selecionada: [Meus Posts ▾]     │
│ Posts encontrados: 10                  │
│                                        │
│ ─── Padrão de Recorrência ───          │
│                                        │
│ ⚪ Diariamente                         │
│ ⚪ Dias úteis (seg-sex)                │
│ 🔘 Dias específicos:                   │
│    ☑ Seg  ☑ Ter  ☐ Qua  ☑ Qui  ☐ Sex │
│    ☐ Sáb  ☐ Dom                       │
│ ⚪ Semanalmente                        │
│                                        │
│ Horário: [09:00]                       │
│                                        │
│ Início: [01/02/2026]                   │
│ Fim: ⚪ Após [10] ocorrências           │
│      ⚪ Até data [15/03/2026]          │
│                                        │
│ [Preview]  [Cancelar]  [Agendar Tudo] │
└────────────────────────────────────────┘

Ao clicar em "Preview":

┌────────────────────────────────────────┐
│ 📅 Preview de Agendamentos             │
├────────────────────────────────────────┤
│                                        │
│ 📄 Post 1 → 02/02/2026 09:00 (seg)    │
│ 📄 Post 2 → 04/02/2026 09:00 (qua)    │
│ 📄 Post 3 → 06/02/2026 09:00 (sex)    │
│ 📄 Post 4 → 09/02/2026 09:00 (seg)    │
│ ...                                    │
│                                        │
│ ⚠️ 2 conflitos detectados              │
│   • Post 1 conflita com "Outro post"  │
│   • Post 3 conflita com "Mais um"     │
│                                        │
│ [Ajustar]  [Cancelar]  [Confirmar]    │
└────────────────────────────────────────┘
```

---

## 🧪 Plano de Testes

### Testes Manuais (MVP)

1. **Caso 1: Agendamento Básico**
    - Selecionar data futura (amanhã, 15:00)
    - Clicar "Agendar Publicação"
    - Verificar: Draft criado no Substack com `publish_at` correto
    - Verificar: Status badge mostra "Agendado"
    - Verificar: Log registra agendamento

2. **Caso 2: Validação de Data Passada**
    - Tentar selecionar data passada (ontem)
    - Verificar: Erro mostrado ("Data deve ser futura")
    - Verificar: Agendamento não criado

3. **Caso 3: Validação de Horário Próximo**
    - Tentar agendar para daqui a 5 minutos
    - Verificar: Aviso ou permissão (decisão de UX)

4. **Caso 4: Timezone Correto**
    - Agendar para 15:00 local (GMT-3)
    - Verificar no Substack: Horário armazenado como 18:00 UTC
    - Verificar: UI mostra 15:00 local

5. **Caso 5: Detecção de Conflito (RF5)** ⭐ NOVO
    - Cenário: Post já agendado para 01/02/2026 15:00
    - Tentar agendar outro post para 01/02/2026 15:00
    - Verificar: Alerta de conflito mostrado
    - Verificar: Lista mostra post conflitante
    - Ação: Cancelar agendamento
    - Verificar: Nenhum post criado

6. **Caso 6: Prosseguir com Conflito (RF5)** ⭐ NOVO
    - Cenário: Post já agendado para 01/02/2026 15:00
    - Tentar agendar outro post para 01/02/2026 15:00
    - Verificar: Alerta mostrado
    - Ação: Clicar "Prosseguir"
    - Verificar: Ambos os posts agendados para mesmo horário

7. **Caso 7: Recorrência Dias Úteis (RF6)** ⭐ NOVO
    - Selecionar pasta com 5 posts
    - Padrão: Dias úteis (seg-sex), 09:00
    - Início: 03/02/2026 (segunda)
    - Ocorrências: 5
    - Preview: 03/02, 04/02, 05/02, 06/02, 07/02 (todos às 09:00)
    - Confirmar agendamento
    - Verificar: 5 posts criados no Substack nas datas corretas

8. **Caso 8: Recorrência com Conflito (RF6)** ⭐ NOVO
    - Cenário: Post já agendado para 04/02/2026 09:00
    - Selecionar pasta com 3 posts
    - Padrão: Ter/Qui, 09:00
    - Gera: 04/02, 06/02, 11/02
    - Preview: Mostra conflito em 04/02
    - Verificar: Alerta exibido
    - Ação: Ajustar (pular 04/02 ou reagendar)
    - Verificar: Apenas posts sem conflito agendados

### Testes Automatizados (Futuro - v0.5.0)

```typescript
describe('ScheduleFeature', () => {
    test('converts local time to UTC correctly', () => {
        const localTime = new Date('2026-02-01T15:00:00-03:00')
        const utc = toUTC(localTime)
        expect(utc).toBe('2026-02-01T18:00:00.000Z')
    })

    test('rejects past dates', () => {
        const pastDate = new Date('2020-01-01')
        expect(validateFutureDate(pastDate)).toBe(false)
    })

    // RF5: Detecção de Conflitos
    test('detects scheduling conflicts', () => {
        const existingPosts = [
            {
                title: 'Post 1',
                publish_at: '2026-02-01T15:00:00.000Z',
            },
        ]
        const newDate = new Date('2026-02-01T15:00:00.000Z')
        const conflicts = detectConflicts(newDate, existingPosts)
        expect(conflicts.length).toBe(1)
        expect(conflicts[0].title).toBe('Post 1')
    })

    test('allows scheduling when no conflicts', () => {
        const existingPosts = [
            {
                title: 'Post 1',
                publish_at: '2026-02-01T15:00:00.000Z',
            },
        ]
        const newDate = new Date('2026-02-02T15:00:00.000Z')
        const conflicts = detectConflicts(newDate, existingPosts)
        expect(conflicts.length).toBe(0)
    })

    // RF6: Recorrência
    test('generates weekday dates correctly', () => {
        const pattern: RecurrencePattern = {
            type: 'weekdays',
            time: '09:00',
            startDate: new Date('2026-02-02'), // Segunda
            occurrences: 5,
        }
        const dates = generateDates(pattern)
        expect(dates.length).toBe(5)
        expect(dates[0]).toMatch(/2026-02-02/) // Seg
        expect(dates[1]).toMatch(/2026-02-03/) // Ter
        expect(dates[4]).toMatch(/2026-02-06/) // Sex
    })

    test('generates specific-days recurrence', () => {
        const pattern: RecurrencePattern = {
            type: 'specific-days',
            days: [2, 4], // Terça e Quinta
            time: '12:00',
            startDate: new Date('2026-02-01'),
            occurrences: 4,
        }
        const dates = generateDates(pattern)
        expect(dates.length).toBe(4)
        // Deve gerar: 04/02 (ter), 06/02 (qui), 11/02 (ter), 13/02 (qui)
    })
})
```

---

## 📦 Implementação Faseada

### Fase 1 (MVP - v0.4.0)

**Objetivo**: Agendamento básico funcional

- [ ] Investigar Substack API (publish_at field)
- [ ] Adicionar datetime-local input na sidebar
- [ ] Implementar conversão timezone (local → UTC)
- [ ] Modificar PayloadBuilder para incluir publish_at
- [ ] Modificar SubstackService.publishPost() para aceitar scheduledAt
- [ ] Atualizar status badge para "Agendado"
- [ ] Testar manualmente 4 casos acima
- [ ] Documentar em CHANGELOG e README

**Entregável**: Usuário pode agendar post para data/hora futura.

### Fase 2 (Melhorias - v0.4.1)

**Objetivo**: UX aprimorado

- [ ] Substituir datetime-local por Flatpickr (se necessário)
- [ ] Adicionar validação de horário mínimo (+15min)
- [ ] Mostrar tooltip com data/hora agendada no badge
- [ ] Permitir editar agendamento (reagendar)
- [ ] Adicionar opção "Cancelar agendamento"

**Entregável**: UX polida para agendamentos.

### Fase 3 (Gestão - v0.4.2)

**Objetivo**: Gerenciar múltiplos agendamentos

- [ ] Nova seção "Posts Agendados" na sidebar
- [ ] Listar todos os posts com status "scheduled"
- [ ] Permitir cancelar/reagendar da lista
- [ ] Sincronizar com Substack (verificar status real)

**Entregável**: Dashboard de agendamentos.

---

## 🚨 Riscos & Mitigação

### Risco 1: Substack API não suporta publish_at

**Probabilidade**: Média
**Impacto**: Alto

**Mitigação**:

- **Plano A**: Usar campo `publish_at` se API aceitar
- **Plano B**: Criar draft + armazenar data localmente + notificar usuário
- **Plano C**: Integração com ferramentas externas (Zapier, IFTTT)

### Risco 2: Timezone bugs

**Probabilidade**: Alta
**Impacto**: Médio

**Mitigação**:

- Testes extensivos com múltiplos timezones
- Usar biblioteca confiável (date-fns ou Luxon)
- Validar conversão UTC ↔ local

### Risco 3: Usuário agenda e Obsidian não está aberto

**Probabilidade**: Alta
**Impacto**: Médio (se Obsidian precisar estar aberto)

**Mitigação**:

- **Ideal**: Agendamento server-side no Substack (não depende de Obsidian)
- **Fallback**: Avisar usuário que agendamento é feito no Substack, não localmente

---

## 📊 Métricas de Sucesso

| Métrica           | Target          | Como medir                                    |
| ----------------- | --------------- | --------------------------------------------- |
| Feature funciona? | 100%            | Agendamento cria draft com publish_at correto |
| Timezone correto? | 100%            | Comparar UTC enviado vs esperado              |
| UX intuitiva?     | >80% satisfação | Feedback do usuário (zander)                  |
| Performance       | <500ms          | Tempo de resposta do agendamento              |

---

## 🛠️ Checklist de Implementação

**ANTES de codificar**:

- [ ] Investigar Substack API (testar publish_at)
- [ ] Decidir: HTML5 datetime-local ou Flatpickr?
- [ ] Confirmar timezone: UTC ou local?
- [ ] Revisar este plano com usuário (zander)

**Durante implementação**:

- [ ] Criar branch: `feature/schedule-posts`
- [ ] Implementar datetime utilities
- [ ] Modificar PayloadBuilder
- [ ] Modificar SubstackService
- [ ] Adicionar UI na sidebar
- [ ] Testar casos 1-4
- [ ] Executar 5 passos obrigatórios (commit_test)
- [ ] Atualizar documentação

**Após implementação**:

- [ ] Testar em produção com post real
- [ ] Coletar feedback do usuário
- [ ] Iterar melhorias (Fase 2)

---

## 📅 Timeline Estimado

| Fase              | Duração         | Tarefas                                |
| ----------------- | --------------- | -------------------------------------- |
| Investigação      | 1 sessão        | Testar Substack API, decidir abordagem |
| Implementação MVP | 2-3 sessões     | Código, testes, docs                   |
| Testes & Iteração | 1 sessão        | Bugs, ajustes finos                    |
| **Total**         | **4-5 sessões** | v0.4.0 completo                        |

---

## 🎯 Próximos Passos Imediatos

1. **Investigar Substack API** (PRÓXIMA TAREFA)
    - Criar draft de teste com campo `publish_at`
    - Verificar se aceita e qual formato
    - Documentar resultado

2. **Decisão de UI**
    - HTML5 datetime-local (rápido) vs Flatpickr (bonito)
    - Feedback do usuário

3. **Implementar MVP**
    - Seguir checklist acima
    - Prioridade: funcional > bonito

---

**Status**: 📋 Plano aprovado, aguardando investigação API
**Próximo**: Testar Substack API com `publish_at` field
