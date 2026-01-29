#!/bin/bash

# SmartWrite Publisher - Test Runner
# Usage: bash run_test.sh

TEST_VERSION="${1:-v0267}"
COOKIE="connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I"
PUB_ID="7678831"
DOMAIN="thebreachrpg.substack.com"

LOG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/log"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/teste-api-$TEST_VERSION-$TIMESTAMP.md"

mkdir -p "$LOG_DIR"

{
  echo "# Teste SmartWrite Publisher - API v0.2.6.7"
  echo ""
  echo "**Data**: $(date)"
  echo ""
  echo "## Configuração"
  echo ""
  echo "- **Versão Testada**: $TEST_VERSION"
  echo "- **Domain**: $DOMAIN"
  echo "- **Publication ID**: $PUB_ID"
  echo "- **Endpoint**: /api/v1/drafts?publication_id=$PUB_ID"
  echo "- **Método**: POST"
  echo ""
  echo "## Payload"
  echo ""
  echo "\`\`\`json"
  echo "{"
  echo '  "draft_title": "v0.2.6.7 Test - Query Parameter Fix",'
  echo '  "draft_subtitle": "Testing publication_id query parameter",'
  echo '  "draft_body": "<p>This draft tests the v0.2.6.7 fix with correct query parameter.</p>",'
  echo '  "type": "newsletter",'
  echo '  "draft_bylines": []'
  echo "}"
  echo "\`\`\`"
  echo ""
  echo "## Resultado da API"
  echo ""
  echo "\`\`\`"

  curl -i -X POST \
    -H "Cookie: $COOKIE" \
    -H "Content-Type: application/json" \
    -d '{
      "draft_title": "v0.2.6.7 Test - Query Parameter Fix",
      "draft_subtitle": "Testing publication_id query parameter",
      "draft_body": "<p>This draft tests the v0.2.6.7 fix with correct query parameter.</p>",
      "type": "newsletter",
      "draft_bylines": []
    }' \
    https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID

  echo ""
  echo "\`\`\`"
  echo ""
  echo "## Status"
  echo ""
  echo "✅ Teste concluído em: $(date)"
  echo ""
  echo "📁 Log salvo em: $LOG_FILE"

} | tee "$LOG_FILE"

echo ""
echo "✓ Arquivo criado: $LOG_FILE"
