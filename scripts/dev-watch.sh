#!/bin/bash

# =============================================================================
# SmartWrite Publisher - Development Watch Mode
# Monitors code changes and auto-rebuilds with vault sync
# =============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$SCRIPT_DIR" )"
VAULT_PATH="/sessions/friendly-zen-planck/mnt/_ smartwriter-publisher/.obsidian/plugins/smartwrite-publisher"

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== SmartWrite Publisher - Development Watch Mode ===${NC}"
echo -e "${YELLOW}Watching for changes in src/...${NC}"
echo -e "${YELLOW}Auto-rebuilding and syncing to Obsidian vault${NC}"
echo ""
echo -e "${YELLOW}To reload plugin in Obsidian: Settings → Community plugins → SmartWrite Publisher → Disable/Enable${NC}"
echo ""

cd "$PROJECT_ROOT"

# Initial build
npm run build

# Watch for changes
previous_hash=""

while true; do
  # Get hash of src/ directory
  current_hash=$(find src/ -type f -exec md5sum {} \; | md5sum | cut -d' ' -f1)

  if [ "$current_hash" != "$previous_hash" ]; then
    # Changes detected
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] Changes detected, rebuilding...${NC}"

    if npm run build 2>&1 | grep -q "ERROR"; then
      echo -e "${YELLOW}⚠ Build failed, waiting for fix...${NC}"
    else
      echo -e "${GREEN}✓ Build successful${NC}"
      echo -e "${GREEN}✓ Vault synced: $(ls -l $VAULT_PATH/main.js | awk '{print $6, $7, $8}')${NC}"
      echo ""
    fi

    previous_hash="$current_hash"
  fi

  # Check every 2 seconds
  sleep 2
done
