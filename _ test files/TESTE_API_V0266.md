# Teste v0.2.6.6 - Draft Bylines Fix

## Instruções Rápidas

1. **Copie o comando abaixo**
2. **Cole no Claude Code**
3. **Aperte Enter**
4. **Aguarde resultado**
5. **Compartilhe o arquivo `log-teste-[DATA].txt` comigo**

---

## Comando para Colar

```bash
cd ~/Library/CloudStorage/GoogleDrive-zander.cattapreta@zedicoes.com/My\ Drive/_\ programação/_\ smartwriter-publisher/_\ test\ files && bash -c '
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="log-teste-$TIMESTAMP.txt"

{
  echo "============================================"
  echo "SmartWrite Publisher v0.2.6.6 - API Fix Test"
  echo "Data: $(date)"
  echo "============================================"
  echo ""
  echo "Testing: draft_bylines: [] (empty array)"
  echo "Expected: HTTP 200/201 (Success)"
  echo ""
  echo "---"
  echo ""

  curl -i -X POST \
    -H "Cookie: connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I" \
    -H "Content-Type: application/json" \
    -d '"'"'{
      "draft_title": "v0.2.6.6 Test - Empty Bylines Fix",
      "draft_subtitle": "Testing the fix",
      "draft_body": "<p>This draft tests the v0.2.6.6 fix with empty draft_bylines array.</p>",
      "type": "newsletter",
      "draft_bylines": []
    }'"'"' \
    https://thebreachrpg.substack.com/api/v1/drafts?publication_id=7678831

  echo ""
  echo ""
  echo "============================================"
  echo "Test Complete!"
  echo "============================================"
  echo ""
  echo "✓ Resultado salvo em: $LOG_FILE"

} | tee "$LOG_FILE"

echo ""
echo "Arquivo criado: $(pwd)/$LOG_FILE"
'
```

---

## O que o comando faz

1. Navega até a pasta de testes
2. Cria um timestamp (data/hora)
3. Cria arquivo `log-teste-[DATA].txt`
4. Executa teste HTTP POST contra API Substack
5. Salva todo o resultado no arquivo
6. Mostra o caminho do arquivo

---

## Resultado Esperado

✅ **HTTP 200 ou 201** = Fix funcionou!
❌ **HTTP 400** = Ainda há problema

---

## Após Executar

Compartilhe o conteúdo do arquivo `log-teste-[DATA].txt` comigo para análise.
