# Investigação: Qual formato Substack espera para draft_body?

**Data**: 29 de janeiro de 2026
**Problema**: Texto está chegando como HTML puro em vez de renderizado
**Status**: Em investigação

---

## 🔍 O Que Está Acontecendo

### Esperado (renderizado no Substack):
```
What We Heard at the Reunion

Compiled from therapy transcripts...

[Com formatação: itálicos, subtítulos, parágrafos, quebras]
```

### Recebido (HTML como texto plano):
```html
<h2>What We Heard at the Reunion</h2>
<p><em>Compiled from therapy transcripts...</em></p>
<hr />
[Todo o restante em HTML puro]
```

---

## ❓ Hipóteses

### Hipótese 1: Substack espera plain text, não HTML
- Estamos enviando HTML
- Substack está salvando HTML como texto literal
- Solução: Enviar plain text/markdown

### Hipótese 2: Substack espera Markdown, não HTML
- Markdown é mais portável
- Substack converte Markdown → HTML internamente
- Solução: Enviar Markdown em vez de HTML

### Hipótese 3: Substack espera HTML, mas com encoding especial
- Pode exigir `application/x-www-form-urlencoded`
- Pode exigir escape especial
- Solução: Ajustar encoding

### Hipótese 4: Campo correto não é `draft_body`
- Pode ser `body`, `content`, `post_body`
- Pode ter estrutura diferente (nested object)
- Solução: Verificar documentação da API

### Hipótese 5: Substack não processa o campo durante publicação
- Apenas grava o que recebe
- Usuário precisa fazer a formatação manualmente
- Solução: Enviar plain text para o usuário formatar depois

---

## 📋 Opções de Solução

### Opção A: Enviar Plain Text (Simples e Seguro)
```typescript
// Em converter.ts
return {
  title: "...",
  html: markdown,  // ← Enviar markdown/plain text em vez de HTML
  subtitle: "...",
  tags: []
};
```

**Vantagens**:
- ✅ Simples de implementar
- ✅ Sem risco de formatação quebrada
- ✅ Usuário vê exatamente o que enviou

**Desvantagens**:
- ❌ Sem formatação no Substack (usuário precisa formatar depois)
- ❌ Menos visual

---

### Opção B: Enviar Markdown (Recomendado)
```typescript
// Em converter.ts
// Remover a conversão para HTML
// Enviar markdown puro

return {
  title: "...",
  html: markdown,  // ← Markdown, não HTML
  subtitle: "...",
  tags: []
};
```

**Vantagens**:
- ✅ Markdown é formato universal
- ✅ Substack provavelmente suporta
- ✅ Preserva formatação
- ✅ Portable

**Desvantagens**:
- ⚠️ Precisa testar se Substack converte corretamente

---

### Opção C: Enviar HTML com Content-Type correto
```typescript
// Em SubstackClient.ts
headers['Content-Type'] = 'text/html; charset=utf-8';

// E garantir escape correto do HTML
```

**Vantagens**:
- ✅ HTML pode ser suportado

**Desvantagens**:
- ❌ Mais complexo
- ❌ Alto risco se Substack não suporta

---

## 🧪 Testes Propostos

### Teste 1: Enviar plain text e observar
```
1. Modificar converter.ts para retornar text puro (sem HTML)
2. Publicar novo draft
3. Verificar como aparece no Substack
```

**Esperado**: Texto com quebras de linha, mas sem formatação HTML

---

### Teste 2: Enviar Markdown e observar
```
1. Modificar converter.ts para retornar Markdown puro
2. Manter: # ## ### _text_ etc
3. Publicar novo draft
4. Verificar se Substack renderiza
```

**Esperado**: Texto formatado (se Substack suporta Markdown)

---

### Teste 3: Investigar documentação Substack
```
Perguntas:
- Substack API aceita HTML?
- Substack API aceita Markdown?
- Qual é o campo para corpo do post?
- Draft vs Post - diferença?
```

---

## 📌 Recomendação

**Enviar Markdown puro** é a melhor opção porque:

1. ✅ Universal (funciona em qualquer plataforma)
2. ✅ Preserva formatação (itálicos, títulos, etc)
3. ✅ Simples de implementar
4. ✅ Menos propenso a erros

**Mudança necessária**:
- Não converter Markdown → HTML
- Enviar Markdown puro como `draft_body`

---

## 🔧 Implementação Sugerida

### Arquivo: src/converter.ts

**Atual (HTML)**:
```typescript
convert(markdown: string): ConversionResult {
  const html = this.markdownToHtml(markdown);  // ← Converte para HTML
  return {
    html: html,  // ← Envia HTML
    title,
    subtitle,
    tags
  };
}
```

**Novo (Markdown)**:
```typescript
convert(markdown: string): ConversionResult {
  const { frontmatter, content } = this.extractFrontmatter(markdown);
  
  // Remove apenas o H1 (será o título)
  const body = content.replace(/^# +[^\n]*\n?/, '');
  
  return {
    html: body,  // ← Envia Markdown puro, não HTML
    title: extracted_title,
    subtitle: extracted_subtitle,
    tags
  };
}
```

---

## 📋 Próximas Ações

- [ ] Implementar envio de Markdown puro em `converter.ts`
- [ ] Remover função `markdownToHtml()` ou deixar apenas para preview local
- [ ] Rebuild do plugin
- [ ] Testar com novo draft
- [ ] Verificar resultado no Substack
- [ ] Documentar achados

---

**Status**: Recomendação: Enviar Markdown puro em vez de HTML
**Prioridade**: ALTA (afeta todos os drafts)
