# SmartWrite Publisher - Testes via Terminal

## 📁 Estrutura de Pastas

```
_test files/
├── log/                          ← Logs dos testes (salvar aqui)
│   ├── teste-api-v0267-*.md
│   ├── teste-api-v0268-*.md
│   └── ...
├── README_TESTES.md             ← Este arquivo
└── TESTE_COMPLETO.txt           ← Comando pronto para colar
```

---

## 🚀 Como Testar

### Passo 1: Copiar o Comando

Abra o arquivo: `TESTE_COMPLETO.txt`

Copie todo o texto entre `=== COMANDO ===` e `=== FIM DO COMANDO ===`

### Passo 2: Colar no Claude Code

1. Abra Claude Code no seu Mac
2. Cole o comando
3. Aperte Enter

### Passo 3: Aguardar Resultado

O teste:
- ✅ Executa curl contra API Substack
- ✅ Salva resultado em formato markdown
- ✅ Coloca na pasta `/log` com timestamp

### Passo 4: Confirmar

Quando terminar, envie mensagem aqui:
```
Teste concluído!
```

Então eu vou buscar o último log gerado.

---

## 📊 O que é Testado

- **URL**: `/api/v1/drafts?publication_id=7678831`
- **Método**: POST
- **Payload**: `{ draft_title, draft_subtitle, draft_body, type, draft_bylines: [] }`
- **Esperado**: HTTP 200/201 (sucesso)

---

## 📝 Formato dos Logs

Os logs serão salvos como `.md` (Markdown) com estrutura:

```markdown
# Teste v0.2.6.7 - Publication ID Query Parameter Fix

**Data**: [timestamp]

## Configuração
- **Endpoint**: ...
- **Payload**: ...
- **Expected**: ...

## Resultado
[curl output aqui]

## Status
✅ Teste concluído em: [timestamp]
```

---

## 🗂️ Organização de Testes

Cada versão tem sua pasta de logs:
- `teste-api-v0267-*.md` → Testes da v0.2.6.7
- `teste-api-v0268-*.md` → Testes da v0.2.6.8
- etc.

---

**Pronto para testar!**
