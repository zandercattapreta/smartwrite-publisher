# 🔴 DESCOBERTA CRÍTICA: Substack Usa Tiptap JSON, Não HTML

**Data**: 29 de janeiro de 2026
**Importância**: CRÍTICA - Muda completamente a estratégia
**Status**: Achado validado em múltiplas fontes

---

## 🚨 O Que Descobrimos

### Não há API Oficial Pública
- Substack **não oferece API pública** para criar/editar drafts
- Toda integração é **reverse-engineered**
- Qualquer integração pode quebrar se Substack mudar internamente

### O Formato é Tiptap JSON, Não HTML
- **NÃO**: HTML puro (`<h2>Texto</h2>`)
- **NÃO**: Markdown (`# Texto`)
- **SIM**: Tiptap JSON (estrutura hierárquica de objetos)

### O Campo Correto é `bodyJson`, Não `draft_body`
- Campo que usamos: `draft_body` ❌
- Campo correto: `bodyJson` ✅

---

## 📋 Formato Tiptap JSON

Tiptap é um editor rich text que estrutura conteúdo como JSON:

### Estrutura Básica
```json
{
  "type": "doc",
  "attrs": {"schemaVersion": "v1"},
  "content": [
    {
      "type": "paragraph",
      "content": [
        {"type": "text", "text": "Your text here"}
      ]
    }
  ]
}
```

### Exemplo com Formatação
```json
{
  "type": "doc",
  "attrs": {"schemaVersion": "v1"},
  "content": [
    {
      "type": "heading",
      "attrs": {"level": 2},
      "content": [
        {"type": "text", "text": "Título"}
      ]
    },
    {
      "type": "paragraph",
      "content": [
        {"type": "text", "text": "Texto em "},
        {"type": "text", "text": "negrito", "marks": [{"type": "bold"}]},
        {"type": "text", "text": " e "},
        {"type": "text", "text": "itálico", "marks": [{"type": "italic"}]}
      ]
    }
  ]
}
```

---

## 🎯 Por Que Nosso Código Está Falhando

### Esperado (Tiptap JSON):
```json
{
  "draft_title": "CR-3-876043749-05: THE INTERVIEWER",
  "bodyJson": {
    "type": "doc",
    "content": [...]
  }
}
```

### Atual (HTML):
```json
{
  "draft_title": "CR-3-876043749-05: THE INTERVIEWER",
  "draft_body": "<h2>Texto</h2><p>Conteúdo</p>"  ← ERRADO!
}
```

**Substack está armazenando `draft_body` como texto literal** porque:
1. Campo `draft_body` pode não ser reconhecido
2. Mesmo se fosse, HTML não é o formato esperado
3. Tiptap JSON é a única estrutura que renderiza corretamente

---

## 💾 Mudança Necessária

### Novo Fluxo

```
Markdown
  ↓
Converter para Tiptap JSON
  ↓
Enviar em campo `bodyJson`
  ↓
Substack renderiza corretamente ✅
```

### Implementação

**Arquivo**: `src/converter.ts`

Ao invés de:
```typescript
const html = this.markdownToHtml(content);
return {
  html: html,  // ← HTML (errado)
  title,
  subtitle
};
```

Fazer:
```typescript
const tiptapJson = this.markdownToTiptapJson(content);
return {
  html: tiptapJson,  // ← Tiptap JSON (correto)
  title,
  subtitle
};
```

### Nova Função

Precisa criar `markdownToTiptapJson()`:

```typescript
private markdownToTiptapJson(markdown: string): object {
  // Converter Markdown para estrutura Tiptap JSON
  // Itálico: _text_ → marks: [{type: 'italic'}]
  // Negrito: **text** → marks: [{type: 'bold'}]
  // Headings: # text → {type: 'heading', attrs: {level: 1}, content: [...]}
  // Parágrafos: texto → {type: 'paragraph', content: [...]}
  // HR: --- → {type: 'horizontalRule'}
  
  return {
    type: "doc",
    attrs: { schemaVersion: "v1" },
    content: [
      // ... conteúdo estruturado
    ]
  };
}
```

---

## 📚 Fontes Consultadas

1. **Substack Official API** (Limitado)
   - https://support.substack.com/hc/en-us/articles/45099095296916-Substack-Developer-API
   - Confirma: "Limited API, no draft creation"

2. **Reverse-Engineering Documentação**
   - Substack API ReadTheDocs: https://substack-api.readthedocs.io/
   - python-substack: https://github.com/ma2za/python-substack
   - JPres/Substack-API: https://github.com/JPres-Projects/Substack-API

3. **Artigos Técnicos**
   - "How to Reverse-Engineer the Substack API"
   - "No Official API? No Problem: Reverse-Engineered Substack"

---

## 🔧 Próximas Ações

### Curto Prazo
- [ ] Implementar `markdownToTiptapJson()`
- [ ] Mudar `draft_body` para `bodyJson` em `SubstackPayloadBuilder.ts`
- [ ] Testar novo payload

### Considerações
- Tiptap JSON é mais complexo que HTML
- Mais trabalho de parsing do Markdown
- MAS: Resultado final será correto e renderizado

---

## ⚠️ Risco

Como **não há API oficial**, Substack pode mudar o formato internamente a qualquer tempo. Solução:
- Manter este documento atualizado
- Monitorar mudanças em bibliotecas de comunidade
- Ter fallback se formato quebrar

---

## 📌 Conclusão

**O "HTML literal no draft" que você está vendo é o sintoma correto de que estamos usando o formato errado.**

Substack espera **Tiptap JSON**, não HTML.

Quando mudarmos para Tiptap JSON, o draft renderizará perfeitamente.

---

**Status**: Pronto para implementação
**Prioridade**: CRÍTICA
**Complexidade**: Média (parser Markdown → Tiptap JSON)
