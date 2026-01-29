# SmartWrite Publisher - Substack API Direct Test

**Objetivo**: Testar diferentes payloads contra a API do Substack para identificar qual estrutura funciona.

---

## Configuração Base

```
Domain: thebreachrpg.substack.com
Publication ID: 7678831
Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I
```

---

## TESTE 1: Validar Autenticação

**O que testa**: Se o cookie ainda é válido

**Comando**:

```bash
curl -X GET \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  https://thebreachrpg.substack.com/api/v1/publication
```

**Esperado**:

- ✅ **200**: Autenticação válida
- ❌ **403**: Cookie expirado/sem permissões
- ❌ **401**: Não autenticado

---

## TESTE 2: Payload SEM draft_bylines

**O que testa**: Se a API aceita o payload sem o campo draft_bylines

**Comando**:

```bash
curl -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "Test Draft Without Bylines",
    "draft_subtitle": "Testing API payload structure",
    "draft_body": "<p>This is a test draft without bylines field.</p>",
    "type": "newsletter"
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831
```

**Esperado**:

- ✅ **201**: Draft criado com sucesso
- ❌ **400**: Campo obrigatório faltando
- ❌ **403**: Permissão insuficiente

---

## TESTE 3: Payload COM draft_bylines vazio

**O que testa**: Se a API aceita um array vazio para draft_bylines

**Comando**:

```bash
curl -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "Test Draft With Empty Bylines",
    "draft_subtitle": "Testing API payload structure",
    "draft_body": "<p>This is a test draft with empty bylines array.</p>",
    "type": "newsletter",
    "draft_bylines": []
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831
```

**Esperado**:

- ✅ **201**: Draft criado com sucesso
- ❌ **400**: Descrição do erro indicará qual é o problema
- ❌ **403**: Permissão insuficiente

---

## TESTE 4: Payload MÍNIMO

**O que testa**: Qual é o payload mínimo necessário para criar um draft

**Comando**:

```bash
curl -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "Minimal Test",
    "draft_body": "<p>Minimal test payload.</p>"
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831
```

**Esperado**:

- ✅ **201**: Draft criado com apenas title + body
- ❌ **400**: Campos adicionais são obrigatórios

---

## TESTE 5: Com diferentes endpoints

Se `/api/v1/drafts` continuar falhando, tente:

### Opção A: Sem query parameter

```bash
curl -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "publication_id": 7678831,
    "draft_title": "Test Draft",
    "draft_body": "<p>Test payload.</p>"
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts
```

### Opção B: Endpoint alternativo

```bash
curl -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "Test Draft",
    "draft_body": "<p>Test payload.</p>"
  }' \
  https://thebreachrpg.substack.com/api/v1/publications/7678831/drafts
```

---

## Como Usar no Terminal (MacOS/Linux)

1. Copie um dos comandos acima
2. Cole no Terminal
3. Aperte Enter
4. **Compartilhe a resposta completa** (status code + response body)

---

## Como Usar no Postman/Insomnia

1. Abra a ferramenta
2. Nova requisição POST
3. URL: `https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831`
4. Headers:
    - `Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I`
    - `Content-Type: application/json`
5. Body (JSON):

```json
{
    "draft_title": "Test Draft",
    "draft_subtitle": "Testing API",
    "draft_body": "<p>Test payload.</p>",
    "type": "newsletter"
}
```

6. Clique em Send
7. Compartilhe o status code e a response

---

## Interpretando Resultados

| Status      | Significado                                                      |
| ----------- | ---------------------------------------------------------------- |
| **200/201** | ✅ Sucesso! Encontramos o payload correto                        |
| **400**     | ❌ Payload inválido - confira os campos obrigatórios e estrutura |
| **403**     | ❌ Cookie expirado ou sem permissões - renove autenticação       |
| **404**     | ❌ Endpoint não existe                                           |
| **500**     | ❌ Erro no servidor do Substack                                  |

---

## Próximas Ações

1. **Execute TESTE 1** para validar autenticação
2. **Execute TESTE 2** para testar sem draft_bylines
3. **Execute TESTE 3** para testar com array vazio
4. **Execute TESTE 4** para testar payload mínimo
5. **Compartilhe os resultados** para que possamos corrigir o código

---

## Notas

- O token pode expirar. Se vir erro 403, pode ser necessário renovar
- Cada teste cria um draft de teste. Você pode deletar depois no Substack
- Se conseguir criar um draft com sucesso, note exatamente qual payload funcionou
