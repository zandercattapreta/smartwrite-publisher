# Prompt para Claude Code - Substack API Tests

Use este prompt com Claude Code para executar todos os 5 testes contra a API do Substack.

---

## Como Usar

1. Abra Terminal
2. Execute:

```bash
claude code < /path/to/_ test\ files/CLAUDE_CODE_API_TEST_PROMPT.md
```

Ou copie e cole o conteúdo do prompt abaixo direto no Claude Code.

---

## PROMPT PARA CLAUDE CODE

```
Execute os seguintes testes contra a API do Substack. Para cada teste:
1. Execute o comando curl
2. Capture o status HTTP (primeira linha da resposta)
3. Capture o corpo da resposta completo
4. Organize os resultados em um formato claro

Configurações:
- Domain: thebreachrpg.substack.com
- Publication ID: 7678831
- Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I

TESTE 1: Validar Autenticação
Endpoint: /api/v1/publication
Método: GET
Comando:
curl -i -X GET \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  https://thebreachrpg.substack.com/api/v1/publication

---

TESTE 2: Payload SEM draft_bylines
Endpoint: /api/v1/drafts?publication_id=7678831
Método: POST
Payload:
{
  "draft_title": "Test Without Bylines",
  "draft_subtitle": "Testing",
  "draft_body": "<p>Test draft without bylines field.</p>",
  "type": "newsletter"
}

Comando:
curl -i -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "Test Without Bylines",
    "draft_subtitle": "Testing",
    "draft_body": "<p>Test draft without bylines field.</p>",
    "type": "newsletter"
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831

---

TESTE 3: Payload COM draft_bylines vazio
Endpoint: /api/v1/drafts?publication_id=7678831
Método: POST
Payload:
{
  "draft_title": "Test With Empty Bylines",
  "draft_subtitle": "Testing",
  "draft_body": "<p>Test draft with empty bylines array.</p>",
  "type": "newsletter",
  "draft_bylines": []
}

Comando:
curl -i -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "Test With Empty Bylines",
    "draft_subtitle": "Testing",
    "draft_body": "<p>Test draft with empty bylines array.</p>",
    "type": "newsletter",
    "draft_bylines": []
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831

---

TESTE 4: Payload MÍNIMO
Endpoint: /api/v1/drafts?publication_id=7678831
Método: POST
Payload:
{
  "draft_title": "Minimal Test",
  "draft_body": "<p>Minimal test payload.</p>"
}

Comando:
curl -i -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "Minimal Test",
    "draft_body": "<p>Minimal test payload.</p>"
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831

---

TESTE 5: publication_id no body (em vez de query parameter)
Endpoint: /api/v1/drafts
Método: POST
Payload:
{
  "publication_id": 7678831,
  "draft_title": "Test With PubId in Body",
  "draft_body": "<p>Test with publication_id in body.</p>"
}

Comando:
curl -i -X POST \
  -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
  -H "Content-Type: application/json" \
  -d '{
    "publication_id": 7678831,
    "draft_title": "Test With PubId in Body",
    "draft_body": "<p>Test with publication_id in body.</p>"
  }' \
  https://thebreachrpg.substack.com/api/v1/drafts

---

Depois de executar todos os testes, crie um resumo em formato markdown com:
1. TESTE | Status HTTP | Sucesso (S/N) | Erro (se houver)
2. Uma análise do qual payload funcionou (se algum)
3. Próximas ações recomendadas baseadas nos resultados

Salve o resultado em: /sessions/friendly-zen-planck/mnt/_ smartwriter-publisher/_ test files/API_TEST_RESULTS.md
```

---

## Alternativa: Usar como Script Bash

Se preferir executar como script, copie este comando:

```bash
#!/bin/bash

COOKIE="connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I"
PUB_ID="7678831"
DOMAIN="thebreachrpg.substack.com"

echo "==============================================="
echo "Substack API Test Suite"
echo "==============================================="
echo ""

echo "TESTE 1: Validar Autenticação"
echo "=============================="
curl -i -X GET \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  https://$DOMAIN/api/v1/publication
echo ""
echo ""

echo "TESTE 2: Payload SEM draft_bylines"
echo "===================================="
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"draft_title":"Test Without Bylines","draft_subtitle":"Testing","draft_body":"<p>Test.</p>","type":"newsletter"}' \
  https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID
echo ""
echo ""

echo "TESTE 3: Payload COM draft_bylines vazio"
echo "=========================================="
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"draft_title":"Test With Empty Bylines","draft_subtitle":"Testing","draft_body":"<p>Test.</p>","type":"newsletter","draft_bylines":[]}' \
  https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID
echo ""
echo ""

echo "TESTE 4: Payload MÍNIMO"
echo "======================="
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"draft_title":"Minimal Test","draft_body":"<p>Minimal.</p>"}' \
  https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID
echo ""
echo ""

echo "TESTE 5: publication_id no body"
echo "================================"
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"publication_id":7678831,"draft_title":"Test With PubId","draft_body":"<p>Test.</p>"}' \
  https://$DOMAIN/api/v1/drafts
echo ""
echo ""

echo "==============================================="
echo "Testes concluídos!"
echo "==============================================="
```

Salve como `test_api.sh`, execute com `bash test_api.sh` e compartilhe os resultados comigo.
