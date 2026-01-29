# SmartWrite Publisher - Backup Policy

**Effective Date**: 29 de janeiro de 2026
**Version**: 1.0

---

## 📋 Overview

As parte de boas práticas de desenvolvimento, estabelecemos uma rotina sistemática de backups antes de cada alteração significativa. Isso garante que possamos reverter rapidamente em caso de problemas.

## 🎯 Backup Routine

### Quando fazer backup?
1. **Antes de qualquer refactoring** (como foi feito em v0.3.0)
2. **Antes de alterações arquiteturais** (mudança de padrões/estrutura)
3. **Antes de publicar nova versão** (minor/major versions)
4. **Quando encontrar bugs críticos** (para análise posterior)

### Como fazer backup?

#### Manual (para releases)
```bash
cd smartwrite_publisher/

# Criar backup datado (formato: vX.Y.Z_YYYYMMDD_HHMMSS.tar.gz)
tar -czf ".backups/v0.3.0_$(date +%Y%m%d_%H%M%S).tar.gz" \
  --exclude=".git" \
  --exclude="node_modules" \
  --exclude=".DS_Store" \
  .
```

#### Automático (proposta para CI/CD)
```yaml
# .github/workflows/backup.yml
name: Backup on Release
on:
  release:
    types: [published]

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Create backup
        run: |
          mkdir -p .backups
          tar -czf ".backups/${{ github.event.release.tag_name }}_$(date +%Y%m%d_%H%M%S).tar.gz" .
      - name: Upload backup
        uses: actions/upload-artifact@v2
```

## 📂 Backup Structure

### Location
```
smartwrite_publisher/
└── .backups/
    ├── v0.3.0_20260129_125158.tar.gz   ← Latest
    ├── v0.2.6.10_20260129_XXXXXX.tar.gz
    ├── v0.2.6.6_20260129_XXXXXX.tar.gz
    └── ... (older versions)
```

### What's Included
```
v0.3.0_20260129_125158.tar.gz
├── src/                    (all source code)
├── manifest.json          (plugin metadata)
├── package.json           (dependencies)
├── README.md              (documentation)
├── CHANGELOG.md           (release notes)
├── ROADMAP.md             (project roadmap)
└── ... (all project files except node_modules, .git, .DS_Store)
```

### What's Excluded
- ❌ `.git/` - Version control history (managed by git)
- ❌ `node_modules/` - Dependencies (recoverable via npm install)
- ❌ `.DS_Store` - macOS system files
- ❌ `main.js` - Generated (recoverable via npm run build)
- ❌ `styles.css` - Generated (recoverable via build)

## 📊 Backup History

### Current Backups
```
v0.3.0_20260129_125158.tar.gz (87 KB)
- Complete refactoring release
- New modular architecture
- All Phase 2 hotfixes resolved
```

### Future Backups
To be created as versions are released:
- v0.3.1, v0.3.2, etc. (bug fixes)
- v0.4.0 (testing + reliability)
- v0.5.0 (performance optimization)
- v1.0.0 (production ready)

## 🔄 Recovery Procedure

### Restore from Backup
```bash
cd smartwrite_publisher/

# List available backups
ls -lh .backups/

# Extract backup (example)
tar -xzf .backups/v0.3.0_20260129_125158.tar.gz

# Reinstall dependencies
npm install

# Build plugin
npm run build
```

### If Build Fails After Restore
```bash
# Clean everything
rm -rf node_modules package-lock.json main.js

# Reinstall and rebuild
npm install
npm run build
```

## 🔒 Backup Security

### Current Status
- ✅ Stored locally in project repository
- ✅ Excluded from git (.gitignore ready)
- ✅ Not stored in CI/CD artifacts

### Future Improvements
- [ ] Off-site backup (GitHub Releases)
- [ ] Encrypted backups for sensitive data
- [ ] Automated daily backups
- [ ] Archive old backups (>6 months)

## 📋 Checklist: Before Major Changes

Before implementing significant changes, follow this checklist:

```markdown
- [ ] Pull latest changes: `git pull origin main`
- [ ] Ensure clean working directory: `git status`
- [ ] Create backup: `tar -czf .backups/...`
- [ ] Create feature branch: `git checkout -b feature/name`
- [ ] Make changes and test locally
- [ ] Run build: `npm run build`
- [ ] Commit changes with descriptive message
- [ ] Push feature branch
- [ ] Create pull request
- [ ] After merge, verify production build
```

## 🗂️ Backup Naming Convention

**Format**: `vX.Y.Z_YYYYMMDD_HHMMSS.tar.gz`

**Example**: `v0.3.0_20260129_125158.tar.gz`

**Components**:
- `v0.3.0` - Version number from manifest.json
- `20260129` - Date (YYYYMMDD format)
- `125158` - Time (HHMMSS format)
- `.tar.gz` - Compressed archive

## 📈 Retention Policy

### Current (v0.3.0)
Keep all backups indefinitely (project is small, <100KB each)

### Future (when project grows)
```
- Last 3 months: Keep all daily backups
- 3-12 months: Keep weekly backups
- >1 year: Archive only major versions (1.0, 2.0, etc)
```

## 🔄 Integration with Git

### Git is NOT a Backup
Git stores version history, not full snapshots. For safety:
```bash
# Full backup before major refactoring
tar -czf .backups/v0.3.0_...tar.gz .

# Then make changes
# ... implement changes ...

# Commit to git (history)
git add -A
git commit -m "feat: new feature"

# Push to remote (redundancy)
git push origin main
```

### .gitignore Configuration
```bash
# Don't store backup archives in git
.backups/
*.tar.gz
```

## 📞 Support

For backup-related questions:
- Review this policy
- Check backup history: `ls -lh .backups/`
- Extract test backup to verify integrity
- Contact: zander.cattapreta@zedicoes.com

---

## ✅ Compliance Checklist

After each major release:

- [x] Create dated backup before changes
- [x] Tag release in git
- [x] Document what was backed up
- [x] Verify backup can be extracted
- [x] Add entry to CHANGELOG
- [x] Update ROADMAP if needed
- [x] Commit all documentation

---

**Policy Version**: 1.0
**Last Updated**: 29 de janeiro de 2026, 12:51 UTC
**Next Review**: 28 de fevereiro de 2026 (monthly)
**Created by**: Development Team
**Status**: ✅ Active
