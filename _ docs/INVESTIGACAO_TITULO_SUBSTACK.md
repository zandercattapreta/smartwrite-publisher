# Investigação: Por que o Título não aparece no Draft Substack

**Data**: 29 de janeiro de 2026
**Status**: Em investigação
**Draft testado**: 13_The-Interviewer.md

---

## 🔍 Problema

O título "CR-3-876043749-05: THE INTERVIEWER" não aparece no campo de título do draft no Substack.

### O que esperamos
```javascript
POST /api/v1/drafts
{
  "draft_title": "CR-3-876043749-05: THE INTERVIEWER",     ← Esperado
  "draft_body": "<p>Reconstructed from...</p>...",
  "draft_bylines": [],
  "type": "newsletter",
  "audience": "everyone"
}

Resultado no Substack:
- Campo "Title": "CR-3-876043749-05: THE INTERVIEWER"
```

### O que está acontecendo
```
POST /api/v1/drafts recebe o título correto (?)
MAS no dashboard do Substack, o título não aparece

Resultado no Substack:
- Campo "Title": (vazio?)
- Subtítulo: "The Perfect Opportunity" aparece no body como H2
```

---

## 🧪 Etapas de Investigação

### 1. VERIFICAR: O que converter.ts está fazendo

**Arquivo**: `src/converter.ts`

```typescript
convert(markdown: string, fallbackTitle: string = 'Sem título'): ConversionResult {
  const { frontmatter, content } = this.extractFrontmatter(markdown);
  const html = this.markdownToHtml(content);
  
  let title = frontmatter.title || this.extractFirstHeading(content) || fallbackTitle;
  
  return {
    html,
    title,
    subtitle: frontmatter.subtitle,
    tags: frontmatter.tags || []
  };
}
```

**Behavior esperado**:
- Input: "# CR-3-876043749-05: THE INTERVIEWER\n## The Perfect Opportunity\n..."
- Output:
  - `title`: "CR-3-876043749-05: THE INTERVIEWER"
  - `subtitle`: undefined
  - `html`: "<h2>The Perfect...</h2>..." (H1 removido, H2 preservado)

**Status**: ✅ Código parece correto

---

### 2. VERIFICAR: O que view.ts está fazendo

**Arquivo**: `src/view.ts` linha ~297

```typescript
const converted = this.converter.convert(content, this.activeFile.basename);

const result = await this.substackService.publishPost({
  title: converted.title,
  subtitle: converted.subtitle,
  bodyHtml: converted.html,
  isDraft: true
});
```

**Behavior esperado**:
- `converted.title`: "CR-3-876043749-05: THE INTERVIEWER"
- `converted.subtitle`: undefined
- Passa para `publishPost()`

**Status**: ✅ Código parece correto

---

### 3. VERIFICAR: O que SubstackService.publishPost() está fazendo

**Arquivo**: `src/substack/SubstackService.ts`

```typescript
async publishPost(options: PublishOptions): Promise<PublishResult> {
  // ...
  const payload = this.payloadBuilder.buildDraftPayload(options, user);
  const response = await this.client.post(`/api/v1/drafts`, payload);
  // ...
}
```

**Esperado**:
- `payloadBuilder.buildDraftPayload()` recebe:
  - `title`: "CR-3-876043749-05: THE INTERVIEWER"
  - `bodyHtml`: "<h2>The Perfect...</h2>..."
- Retorna payload com `draft_title` correto

**Status**: ✅ Deve estar correto

---

### 4. VERIFICAR: O que PayloadBuilder está fazendo

**Arquivo**: `src/substack/SubstackPayloadBuilder.ts`

```typescript
buildDraftPayload(
  options: PublishOptions,
  user: SubstackUserInfo
): DraftPayload {
  return {
    draft_title: options.title,           // ← "CR-3-876043749-05: THE INTERVIEWER"
    draft_body: options.bodyHtml,
    draft_bylines: user.id ? [{ user_id: user.id }] : [],
    draft_subtitle: options.subtitle || undefined,
    type: 'newsletter',
    audience: 'everyone'
  };
}
```

**Status**: ✅ Deve estar correto

---

### 5. VERIFICAR: O que SubstackClient está enviando

**Arquivo**: `src/substack/SubstackClient.ts`

```typescript
async post(endpoint: string, body: any): Promise<HttpResponse> {
  const headers = this.getHeaders();
  // Envia body como JSON
  const response = await requestUrl({
    url: this.baseUrl + endpoint,
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });
  return response;
}
```

**Status**: ✅ Deve estar correto

---

## ❓ Possíveis Razões para o Título não aparecer

### Hipótese 1: Substack ignora campo `draft_title`
- API aceita mas não valida
- Campo pode estar sendo lido como algo diferente
- **Teste**: Verificar response da API

### Hipótese 2: Campo precisa de formatação especial
- Pode exigir encoding especial
- Pode exigir tamanho mínimo
- **Teste**: Enviar título vazio, título muito longo

### Hipótese 3: Título está sendo extraído DEPOIS da publicação
- Substack extrai o primeiro H1 do body
- Se não houver H1, usa vazio
- **Teste**: Adicionar H1 ao body (não remover)

### Hipótese 4: Campo correto é diferente
- Pode ser `title` em vez de `draft_title`
- Pode ser `post_title`
- **Teste**: Verificar documentação da API Substack

### Hipótese 5: Título está sendo enviado mas não salvo
- API retorna erro silenciosamente
- **Teste**: Revisar response da API para erros

---

## 🧪 Testes Necessários

### Teste 1: Verificar payload enviado

**O que fazer**:
1. Adicionar log em `SubstackClient.ts` antes de enviar
2. Logar: `console.log(body)` para ver o payload exato
3. Publicar novo draft
4. Verificar logs no console do Obsidian

**Código**:
```typescript
async post(endpoint: string, body: any): Promise<HttpResponse> {
  console.log('Substack POST payload:', JSON.stringify(body, null, 2));
  // ... resto
}
```

---

### Teste 2: Verificar response da API

**O que fazer**:
1. Adicionar log da response em `SubstackClient.ts`
2. Logar: `console.log(response)` para ver resposta
3. Verificar se há erros no campo `draft_title`

**Código**:
```typescript
async post(endpoint: string, body: any): Promise<HttpResponse> {
  const response = await requestUrl({...});
  console.log('Substack API response:', response);
  // ... resto
}
```

---

### Teste 3: Testar com diferentes títulos

**O que fazer**:
1. Criar arquivo markdown com título simples
2. Publicar draft
3. Verificar se título aparece

**Exemplo**:
```markdown
# Simple Title

## Subtitle

Content here...
```

---

### Teste 4: Verificar documentação da API Substack

**Perguntas**:
- Qual é o campo correto para título?
- É `draft_title` ou `title` ou algo diferente?
- Há limitações de tamanho?
- Há caracteres especiais que causam problemas?

---

## 📋 Próximas Ações

1. [ ] Adicionar logs em `SubstackClient.ts`
2. [ ] Publicar novo draft com logs
3. [ ] Revisar logs no Obsidian
4. [ ] Comparar payload esperado vs enviado
5. [ ] Verificar response da API
6. [ ] Testar com título simples
7. [ ] Documentar achados em `_ docs/SUBSTACK_API_INVESTIGATION.md`

---

## 📌 Nota

É possível que o Substack extraia o título do **corpo** em vez de usar o campo `draft_title`. 

Se isso for verdade, a solução seria:
- Manter o H1 no body (não remover)
- Usar o H1 como título
- Usar H2 como subtítulo

Isso precisaria de mudança em `converter.ts` para NOT remover H1.

---

**Status**: Aguardando investigação com logs
**Prioridade**: ALTA (afeta todos os drafts)
