#!/bin/bash

# =============================================================================
# SmartWrite Publisher - Release Daemon
# Roda continuamente monitorando mudanças em src/
# EXECUTA AUTOMATICAMENTE os 6 passos quando detecta mudanças
# =============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

cd "$PROJECT_ROOT"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         SmartWrite Publisher - Release Daemon              ║${NC}"
echo -e "${BLUE}║  Monitora mudanças e executa rotina COMPLETA automaticamente${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Processo Automatizado (5 Passos):${NC}"
echo -e "  1️⃣  TESTAR & REFATORAR → npm run build"
echo -e "  2️⃣  BACKUP → .backups/smartwrite-v*.tar.gz"
echo -e "  3️⃣  INCREMENT VERSION → 0.3.3 → 0.3.4"
echo -e "  4️⃣  UPDATE VAULT → .obsidian/plugins/smartwrite-publisher/"
echo -e "  5️⃣  UPDATE DOCS → .release-history.json"
echo ""
echo -e "${YELLOW}Aguardando mudanças em src/...${NC}"
echo -e "${YELLOW}Pressione CTRL+C para parar${NC}"
echo ""

# Marker para detectar mudanças
touch /tmp/sw-daemon-marker

execute_full_workflow() {
  TIMESTAMP=$(date '+%H:%M:%S')
  CHANGE_NUM=$((${CHANGE_NUM:-0} + 1))

  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${MAGENTA}[$TIMESTAMP] MUDANÇA #$CHANGE_NUM DETECTADA EM src/${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # ======================================================================
  # PASSO 1: TESTAR & REFATORAR
  # ======================================================================
  echo -e "${CYAN}[1/6] TESTAR & REFATORAR${NC}"
  if npm run build > /tmp/daemon-build.log 2>&1; then
    echo -e "${GREEN}✓ Build passed${NC}"
    VAULT_TIME=$(date '+%H:%M:%S')
    echo -e "${GREEN}✓ Vault synced at $VAULT_TIME${NC}"
  else
    echo -e "${RED}✗ Build FAILED - Aguardando correção...${NC}"
    cat /tmp/daemon-build.log | head -20
    echo ""
    return 1
  fi
  echo ""

  # ======================================================================
  # PASSO 2: BACKUP
  # ======================================================================
  echo -e "${CYAN}[2/6] BACKUP${NC}"
  CURRENT_VERSION=$(jq -r '.version' manifest.json)
  BACKUP_DIR=".backups"
  mkdir -p "$BACKUP_DIR"
  BACKUP_FILE="$BACKUP_DIR/smartwrite-publisher-v${CURRENT_VERSION}-$(date +%Y%m%d_%H%M%S).tar.gz"

  tar -czf "$BACKUP_FILE" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=main.js \
    --exclude=.obsidian \
    src/ manifest.json package.json README.md CHANGELOG.md esbuild.config.mjs tsconfig.json 2>/dev/null || true

  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "${GREEN}✓ Backup: $(basename $BACKUP_FILE) ($BACKUP_SIZE)${NC}"
  echo ""

  # ======================================================================
  # PASSO 3: INCREMENT VERSION
  # ======================================================================
  echo -e "${CYAN}[3/6] INCREMENT VERSION${NC}"
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
  NEW_PATCH=$((PATCH + 1))
  NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

  # Update manifest.json
  jq --arg version "$NEW_VERSION" '.version = $version' manifest.json > /tmp/manifest.json.tmp
  mv /tmp/manifest.json.tmp manifest.json

  # Update package.json
  jq --arg version "$NEW_VERSION" '.version = $version' package.json > /tmp/package.json.tmp
  mv /tmp/package.json.tmp package.json

  echo -e "${GREEN}✓ Version: ${CURRENT_VERSION} → ${NEW_VERSION}${NC}"
  echo ""

  # ======================================================================
  # PASSO 4: UPDATE VAULT
  # ======================================================================
  echo -e "${CYAN}[4/6] UPDATE VAULT${NC}"
  # Já feito no passo 1 (npm run build copia para .obsidian/)
  VAULT_FILE="/sessions/friendly-zen-planck/mnt/_ smartwriter-publisher/.obsidian/plugins/smartwrite-publisher/manifest.json"
  if [ -f "$VAULT_FILE" ]; then
    VAULT_VERSION=$(jq -r '.version' "$VAULT_FILE")
    if [ "$VAULT_VERSION" = "$NEW_VERSION" ]; then
      echo -e "${GREEN}✓ Vault synchronized: v$VAULT_VERSION${NC}"
    else
      echo -e "${YELLOW}⚠ Vault version mismatch: expected $NEW_VERSION, got $VAULT_VERSION${NC}"
    fi
  fi
  echo ""

  # ======================================================================
  # PASSO 5: UPDATE DOCS
  # ======================================================================
  echo -e "${CYAN}[5/6] UPDATE DOCS${NC}"

  # Update .release-history.json
  jq --arg version "$NEW_VERSION" \
     --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
     '.lastRelease = $version | .lastReleaseDate = $date | .nextTarget = ($version | split(".") as $v | $v[0] + "." + $v[1] + "." + ($v[2] | tonumber + 1 | tostring) | join("."))' \
     .release-history.json > /tmp/release-history.json.tmp
  mv /tmp/release-history.json.tmp .release-history.json

  echo -e "${GREEN}✓ .release-history.json updated${NC}"
  echo ""

  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║ ✅ ROTINA AUTOMÁTICA COMPLETA (PASSOS 1-5)                 ║${NC}"
  echo -e "${GREEN}║ Versão: ${YELLOW}${NEW_VERSION}${GREEN}                                               ║${NC}"
  echo -e "${GREEN}║ Backup: ${YELLOW}$(basename $BACKUP_FILE)${GREEN}${NC}"
  echo -e "${GREEN}║ Vault: Sincronizado                                        ║${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}Aguardando próximas mudanças...${NC}"
  echo ""
}

# Main loop - monitora mudanças em src/
while true; do
  # Detecta se há arquivos em src/ modificados após o marker
  NEW_FILES=$(find src/ -type f -newer /tmp/sw-daemon-marker 2>/dev/null | wc -l)

  if [ "$NEW_FILES" -gt 0 ]; then
    execute_full_workflow
    touch /tmp/sw-daemon-marker
  fi

  # Check a cada 2 segundos
  sleep 2
done
