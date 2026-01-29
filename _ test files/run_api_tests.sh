#!/bin/bash

# SmartWrite Publisher - Substack API Test Suite
# Execute todos os 5 testes contra a API do Substack
# Uso: bash run_api_tests.sh

COOKIE="connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I"
PUB_ID="7678831"
DOMAIN="thebreachrpg.substack.com"

echo "==============================================="
echo "Substack API Test Suite"
echo "==============================================="
echo ""

echo "TESTE 1: Validar Autenticação"
echo "=============================="
echo "GET /api/v1/publication"
echo ""
curl -i -X GET \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  https://$DOMAIN/api/v1/publication 2>&1
echo ""
echo ""
echo "---"
echo ""

echo "TESTE 2: Payload SEM draft_bylines"
echo "===================================="
echo "POST /api/v1/drafts?publication_id=$PUB_ID"
echo "Payload: {title, subtitle, body, type}"
echo ""
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"draft_title":"Test Without Bylines","draft_subtitle":"Testing","draft_body":"<p>Test draft without bylines field.</p>","type":"newsletter"}' \
  https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID 2>&1
echo ""
echo ""
echo "---"
echo ""

echo "TESTE 3: Payload COM draft_bylines vazio"
echo "=========================================="
echo "POST /api/v1/drafts?publication_id=$PUB_ID"
echo "Payload: {title, subtitle, body, type, draft_bylines: []}"
echo ""
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"draft_title":"Test With Empty Bylines","draft_subtitle":"Testing","draft_body":"<p>Test draft with empty bylines array.</p>","type":"newsletter","draft_bylines":[]}' \
  https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID 2>&1
echo ""
echo ""
echo "---"
echo ""

echo "TESTE 4: Payload MÍNIMO"
echo "======================="
echo "POST /api/v1/drafts?publication_id=$PUB_ID"
echo "Payload: {title, body}"
echo ""
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"draft_title":"Minimal Test","draft_body":"<p>Minimal test payload.</p>"}' \
  https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID 2>&1
echo ""
echo ""
echo "---"
echo ""

echo "TESTE 5: publication_id no body (sem query parameter)"
echo "====================================================="
echo "POST /api/v1/drafts"
echo "Payload: {publication_id, title, body}"
echo ""
curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"publication_id":7678831,"draft_title":"Test With PubId in Body","draft_body":"<p>Test with publication_id in body.</p>"}' \
  https://$DOMAIN/api/v1/drafts 2>&1
echo ""
echo ""

echo "==============================================="
echo "Testes concluídos!"
echo "==============================================="
echo ""
echo "Próximas ações:"
echo "1. Revise os status HTTP de cada teste"
echo "2. Identifique qual teste retornou 201 (sucesso)"
echo "3. Compartilhe os resultados para análise"
