# SmartWrite Publisher - Git Hooks

Automatização completa do procedimento de release.

## 🎯 O que faz

Cada commit em `src/` dispara automaticamente:

1. ✅ **Build & Vault Sync** - `npm run build`
2. ✅ **Backup** - Cria `.tar.gz` em `.backups/`
3. ✅ **Increment Version** - Incrementa patch (0.3.3 → 0.3.4)
4. ✅ **Update Docs** - Atualiza `.release-history.json`
5. ✅ **Auto-Commit** - Commit da versão
6. ✅ **Auto-Push** - Push para GitHub

## 📋 Hooks Disponíveis

### `post-commit`
Executa após cada commit.

- **Trigger**: Detecta mudanças em `src/`
- **Ação**: Rotina completa BVD + versionamento + docs + GitHub
- **Fallback**: Se push falhar, changes ficam locais (seguro)

## 🚀 Como usar

### Instalação (já feita)

Git foi configurado para usar `.githooks/`:
```bash
git config core.hooksPath .githooks
```

Isso significa que hooks em `.githooks/` serão executados automaticamente.

### Fluxo de Desenvolvimento

```bash
# 1. Fazer mudanças no código
vim src/converter.ts

# 2. Stage e commit normalmente
git add -A
git commit -m "fix: Converter bug"

# 3. AUTOMATICAMENTE:
#    ✓ Build & sync vault
#    ✓ Create backup
#    ✓ Increment version (0.3.3 → 0.3.4)
#    ✓ Update docs
#    ✓ Create version commit
#    ✓ Push to GitHub

# Pronto! Tudo executado automaticamente
```

## ✅ Checklist - O que está automatizado

- [x] Build TypeScript
- [x] Sync Obsidian vault
- [x] Create backup (.tar.gz)
- [x] Increment patch version
- [x] Update manifest.json
- [x] Update package.json
- [x] Update .release-history.json
- [x] Create version commit
- [x] Push to GitHub
- [x] Fallback gracioso se push falhar

## ⚙️ O que NÃO está automatizado (ainda)

- [ ] CHANGELOG.md manual update (para notas descritivas)
- [ ] README.md manual update (tabela de versões)
- [ ] Git tags (v0.3.4, etc)
- [ ] GitHub release creation

## 🔍 Como ver logs

O hook escreve logs em tempo real. Você verá algo como:

```
[Post-Commit Hook] Iniciando rotina automática de release...
[1] Building and syncing to Obsidian vault...
✓ Build and vault sync successful
[2] Creating backup...
✓ Backup created: smartwrite-publisher-v0.3.4-20260129_152000.tar.gz
[3] Incrementing version...
✓ Version incremented: 0.3.3 → 0.3.4
[4] Updating documentation...
✓ Documentation updated
[5] Committing version bump...
✓ Commits and version bump successful
[6] Pushing to GitHub...
✓ Pushed to GitHub
=== Rotina automática completa! ===
```

## ⚠️ Se algo der errado

### Build falha
Hook detecta e avisa, mas não bloqueia commit.
```bash
npm run build  # Ver erro
# Corrigir...
git commit --amend
```

### Push falha
Changes estão salvos localmente, seguro.
```bash
git push origin main  # Tentar depois
```

### Quer desabilitar hook temporariamente
```bash
git commit --no-verify  # Pula hooks
```

## 📝 Como adicionar novos hooks

1. Criar arquivo em `.githooks/` (ex: `.githooks/pre-push`)
2. Adicionar lógica
3. Tornar executável: `chmod +x .githooks/pre-push`
4. Git usará automaticamente

## 🔗 Hooks Disponíveis

Git oferece muitos hooks. Veja `man githooks` para lista completa.

Alguns úteis para nosso caso:
- `post-commit` - Após commit (USANDO)
- `pre-commit` - Antes de commit (linting, testes)
- `pre-push` - Antes de push (verificações)
- `commit-msg` - Valida mensagem de commit

## 🎯 Status Atual

| Hook | Status | O que faz |
|------|--------|----------|
| `post-commit` | ✅ Ativo | Build, backup, version, commit, push |

## 📖 Referência

- Git Hooks Official: https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks
- Core Hooks Path: `git config core.hooksPath`
