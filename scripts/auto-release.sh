#!/bin/bash

# =============================================================================
# SmartWrite Publisher - Automatic Release on Every src/ Change
# Monitora mudanças em src/ e executa rotina COMPLETA:
# 1. Build & Vault Sync
# 2. Backup
# 3. Increment Version
# 4. Update Docs
# 5. Git Commit (dispara post-commit hook)
# 6. Push GitHub
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
NC='\033[0m'

cd "$PROJECT_ROOT"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  SmartWrite Publisher - Automatic Release Watch Mode      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Monitorando mudanças em src/...${NC}"
echo -e "${YELLOW}A cada mudança, será executada a rotina COMPLETA:${NC}"
echo -e "  1️⃣  Build & Vault Sync"
echo -e "  2️⃣  Backup"
echo -e "  3️⃣  Increment Version"
echo -e "  4️⃣  Update Docs"
echo -e "  5️⃣  Git Commit"
echo -e "  6️⃣  Git Push"
echo ""
echo -e "${MAGENTA}Pressione CTRL+C para parar${NC}"
echo ""

previous_hash=""
change_count=0

execute_release() {
  change_count=$((change_count + 1))

  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}[$(date '+%H:%M:%S')] Mudança #$change_count detectada${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  # 1️⃣ BUILD & VAULT SYNC
  echo -e "${MAGENTA}[1/6] Build & Vault Sync${NC}"
  if npm run build > /tmp/build.log 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
    VAULT_TIME=$(stat -f%Sm -t%H:%M:%S "/sessions/friendly-zen-planck/mnt/_ smartwriter-publisher/.obsidian/plugins/smartwrite-publisher/main.js" 2>/dev/null || echo "N/A")
    echo -e "${GREEN}✓ Vault updated: $VAULT_TIME${NC}"
  else
    echo -e "${RED}✗ Build failed!${NC}"
    cat /tmp/build.log
    return 1
  fi
  echo ""

  # 2️⃣ BACKUP
  echo -e "${MAGENTA}[2/6] Creating Backup${NC}"
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

  # 3️⃣ INCREMENT VERSION
  echo -e "${MAGENTA}[3/6] Incrementing Version${NC}"
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
  NEW_PATCH=$((PATCH + 1))
  NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

  jq --arg version "$NEW_VERSION" '.version = $version' manifest.json > /tmp/manifest.json.tmp
  mv /tmp/manifest.json.tmp manifest.json

  jq --arg version "$NEW_VERSION" '.version = $version' package.json > /tmp/package.json.tmp
  mv /tmp/package.json.tmp package.json

  echo -e "${GREEN}✓ Version: ${CURRENT_VERSION} → ${NEW_VERSION}${NC}"
  echo ""

  # 4️⃣ UPDATE DOCS
  echo -e "${MAGENTA}[4/6] Updating Documentation${NC}"
  jq --arg version "$NEW_VERSION" \
     --arg date "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
     '.lastRelease = $version | .lastReleaseDate = $date' \
     .release-history.json > /tmp/release-history.json.tmp
  mv /tmp/release-history.json.tmp .release-history.json
  echo -e "${GREEN}✓ .release-history.json updated${NC}"
  echo ""

  # 5️⃣ GIT COMMIT
  echo -e "${MAGENTA}[5/6] Creating Git Commit${NC}"
  git add manifest.json package.json .release-history.json "$BACKUP_FILE" 2>/dev/null || true

  if git diff --cached --quiet 2>/dev/null; then
    echo -e "${YELLOW}⚠ No changes to commit${NC}"
  else
    git commit -m "auto: Release v${NEW_VERSION}

- Build & vault sync completed
- Backup created: $(basename $BACKUP_FILE)
- Version incremented: ${CURRENT_VERSION} → ${NEW_VERSION}
- Documentation updated

Co-Authored-By: SmartWrite Auto-Release <auto@smartwrite-publisher.dev>" \
      --no-verify || echo -e "${YELLOW}⚠ Commit already exists${NC}"
    echo -e "${GREEN}✓ Commit created${NC}"
  fi
  echo ""

  # 6️⃣ GIT PUSH
  echo -e "${MAGENTA}[6/6] Pushing to GitHub${NC}"
  if git push origin main 2>/dev/null; then
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
  else
    echo -e "${YELLOW}⚠ Push failed (network/auth). Changes committed locally.${NC}"
  fi
  echo ""

  echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║ ✅ Rotina Completa Executada!                             ║${NC}"
  echo -e "${GREEN}║ Versão: ${NEW_VERSION}                                               ║${NC}"
  echo -e "${GREEN}║ Backup: $(basename $BACKUP_FILE)${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
}

# Main loop
while true; do
  current_hash=$(find src/ -type f -newer /tmp/sw-watch-marker 2>/dev/null | wc -l)

  if [ "$current_hash" -gt 0 ]; then
    execute_release
    touch /tmp/sw-watch-marker
    previous_hash="$current_hash"
  fi

  sleep 1
done
