# Design de Interface

Especificação visual e funcional dos elementos de UI do plugin.

## Estrutura Geral

```
┌─────────────────────────────────────┐
│  [Ribbon Icon]                      │  ← Lateral esquerda do Obsidian
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  SmartWrite Publisher         [?]   │  ← Header + Help
├─────────────────────────────────────┤
│  ▼ Nota Ativa                       │
│    Nome: exemplo.md                 │
│    Status: [Pendente]               │
│    [Publish Live] [Draft] [Schedule]│
├─────────────────────────────────────┤
│  ▼ Publicação em Lote               │
│    Pasta: [Dropdown ▼]              │
│    [Publish All]                    │
├─────────────────────────────────────┤
│  ▼ Configurações Rápidas            │
│    ● Conectado / ○ Desconectado     │
│    [Cookie Input     ]              │
│    [URL Input        ]              │
│    [Test Connection]                │
├─────────────────────────────────────┤
│  ▼ Logs de Sistema                  │
│    12:30:15 [INFO] Conexão OK       │
│    12:30:10 [INFO] Iniciando...     │
│                            [Copiar] │
└─────────────────────────────────────┘
```

## Componentes

### 1. Ribbon Icon
- **Ícone**: `share-2` (Lucide)
- **Ação**: Abre/foca a sidebar

### 2. Seção: Nota Ativa
Exibe informações da nota atualmente aberta no editor.

| Elemento | Tipo | Comportamento |
|----------|------|---------------|
| Nome | Text | Atualiza via debounce (500ms) |
| Status | Badge | Pendente / Publicado |
| Publish Live | Button (CTA) | Publica imediatamente |
| Create Draft | Button | Salva como rascunho |
| Schedule | Button | Abre date picker |

### 3. Seção: Publicação em Lote
Para publicar múltiplas notas de uma pasta.

| Elemento | Tipo | Comportamento |
|----------|------|---------------|
| Pasta | Dropdown | Lista pastas do vault |
| Publish All | Button (Warning) | Processa todos os arquivos |

### 4. Seção: Configurações Rápidas
Autenticação e conexão com Substack.

| Elemento | Tipo | Comportamento |
|----------|------|---------------|
| Status Dot | Span | Verde (conectado) / Vermelho |
| Cookie | Input (password) | Persiste em settings |
| URL | Input (text) | Persiste em settings |
| Test Connection | Button | Valida sessão |

### 5. Seção: Logs de Sistema
Console de diagnóstico para suporte.

| Elemento | Tipo | Comportamento |
|----------|------|---------------|
| Log Lines | Div | Timestamp + Level + Message |
| Copiar | Button | Copia para clipboard |

## Settings Tab (Menu do Obsidian)

Acessível via Settings → SmartWrite Publisher.

- Cookie (password input)
- URL (text input)
- Links: GitHub, Licença MIT

## Classes CSS Principais

```css
.smartwrite-publisher-sidebar  /* Container principal */
.publisher-section             /* Seção colapsável */
.status-badge                  /* Badge de status */
.status-dot.green/.red         /* Indicador de conexão */
.log-console                   /* Container de logs */
.log-line.info/.error          /* Linha de log */
```
