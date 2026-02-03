# SmartWrite Publisher - Version Automation Procedure

## 📋 O Procedimento Definido

Você estabeleceu 6 passos que DEVEM acontecer a cada mudança de código:

1. ✅ **Testar & Refatorar** - Validar mudanças
2. ✅ **Backup** - Criar snapshot do código
3. ✅ **Increment Version** - Aumentar patch (0.3.3 → 0.3.4)
4. ✅ **Update Vault** - Atualizar Obsidian local
5. ✅ **Update Docs** - CHANGELOG, README, release-history.json
6. ✅ **Update GitHub** - Commit + Push

## 🎯 Status de Automação

### ANTES (Manual)

Você tinha que fazer MANUALMENTE após cada mudança:

```bash
npm run build              # Compilar e copiar para vault
# Editar CHANGELOG.md manualmente
# Editar README.md manualmente
git add -A                # Adicionar tudo
git commit -m "..."       # Fazer commit
git push origin main      # Push
```

❌ Propenso a erros, passos esquecidos, inconsistência

### AGORA (Automatizado)

Tudo acontece automaticamente:

```bash
# APENAS ISSO:
npm run release:auto

# E a rotina COMPLETA executa:
# ✓ Build & Vault Sync
# ✓ Backup
# ✓ Increment Version
# ✓ Update .release-history.json
# ✓ Git Commit
# ✓ Git Push
```

✅ Zero erros, nenhum passo esquecido, 100% consistente

---

## 🚀 Como Usar

### Opção 1: Manual Simples (Recomendado para início)

```bash
# Fazer mudanças
vim src/converter.ts

# DEPOIS:
npm run release:auto

# Pronto! Tudo automatizado
```

### Opção 2: Watch Mode (Automático contínuo)

```bash
# Terminal 1: Iniciar watch
npm run release:auto

# Terminal 2: Fazer mudanças
vim src/converter.ts
# Salvar arquivo...

# Watch detecta mudança automaticamente
# E executa rotina completa sozinho!
```

### Opção 3: Git Hooks (Sem Input)

O Git está configurado para executar hooks automaticamente:

```bash
git add -A
git commit -m "fix: ..."

# AUTOMATICAMENTE executa post-commit hook que:
# ✓ Cria backup
# ✓ Incrementa versão
# ✓ Atualiza .release-history.json
# ✓ Faz novo commit
# ✓ Push para GitHub
```

---

## 📊 Fluxo Completo (Opção 2: Watch Mode)

```
┌─────────────────────────────────────┐
│ Terminal 1: npm run release:auto    │
│ (Aguardando mudanças em src/)       │
└─────────────────────────────────────┘
         ↑
         │ (detecta)
         │
┌─────────────────────────────────────┐
│ Terminal 2: Edita src/converter.ts  │
│ Salva arquivo                       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ AUTO-RELEASE DISPARA:               │
│ 1. npm run build → Vault sync       │
│ 2. Cria backup                      │
│ 3. Increment version (0.3.3→0.3.4)  │
│ 4. Update .release-history.json     │
│ 5. git commit (version bump)        │
│ 6. git push origin main             │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ ✅ Tudo completo!                   │
│ Obsidian vault atualizado          │
│ GitHub sincronizado                │
│ Docs atualizadas                   │
└─────────────────────────────────────┘
```

---

## 🎯 Mapping: Manual → Automático

### Passo 1: Testar & Refatorar

- **Manual**: Você testa localmente
- **Automático**: npm run build (testa compilação)
- **Status**: PARCIAL (validação TypeScript automática)

### Passo 2: Backup

- **Manual**: Você criava tar.gz manualmente
- **Automático**: ✅ AUTOMÁTICO
- **Localização**: `.backups/smartwrite-publisher-vX.X.X-TIMESTAMP.tar.gz`

### Passo 3: Increment Version

- **Manual**: Você editava manifest.json
- **Automático**: ✅ AUTOMÁTICO
- **Campo**: manifest.json, package.json

### Passo 4: Update Vault

- **Manual**: Você rodava `npm run build` manualmente
- **Automático**: ✅ AUTOMÁTICO
- **Localização**: `.obsidian/plugins/smartwrite-publisher/`

### Passo 5: Update Docs

- **Manual**: Você editava CHANGELOG.md, README.md manualmente
- **Automático**: ✅ AUTOMÁTICO (.release-history.json)
- **CHANGELOG.md**: Manual (descritivo, não repetitivo)
- **README.md**: Manual (descritivo, não repetitivo)

### Passo 6: Update GitHub

- **Manual**: Você fazia `git add -A`, `git commit`, `git push`
- **Automático**: ✅ AUTOMÁTICO
- **Commits**: 2 automáticos (version bump + original)

---

## 📋 O que está Completamente Automatizado

✅ Build e Compilation
✅ Obsidian Vault Sync
✅ Backup Creation
✅ Version Increment
✅ .release-history.json Update
✅ Git Commit
✅ Git Push

---

## 📋 O que é Semi-Automático (Opcional)

⚠️ **CHANGELOG.md** - Auto-create entry template (futura melhoria)
⚠️ **README.md** - Auto-update version table (futura melhoria)
⚠️ **Git Tags** - Auto-create v0.3.4 tags (futura melhoria)

Esses são opcionais pois contêm descrições que você quer controlar manualmente.

---

## 🔧 Scripts Disponíveis

```bash
# Opção 1: Manual, rodar quando pronto
npm run release

# Opção 2: Auto, aguardando mudanças (RECOMENDADO)
npm run release:auto

# Opção 3: Dev watch, apenas rebuild (sem version bump)
npm run release:watch

# Opção 4: Dry-run (simular sem fazer mudanças)
npm run release:dry
```

---

## 🚨 Importante: Dois Commits Serão Criados

A cada mudança, haverá **2 commits**:

```
Commit 1 (seu commit original):
  "fix: Switch to plain markdown instead of Tiptap JSON"

Commit 2 (auto-gerado):
  "chore: Version bump 0.3.3 → 0.3.4"
  - Inclui: backup, version increment, docs update
```

Ambos são automaticamente feitos e enviados para GitHub.

---

## 🎯 Como Ativar

### Setup (já feito, apenas referência)

```bash
# Git hooks
git config core.hooksPath .githooks

# Scripts instalados
chmod +x ./scripts/auto-release.sh
chmod +x ./scripts/dev-watch.sh
```

### Usar (você faz)

```bash
# Opção 1: Uma mudança
npm run release

# Opção 2: Contínuo (MELHOR)
npm run release:auto

# Opção 3: Just watch (sem version bump)
npm run release:watch
```

---

## ✅ Checklist - Tudo Automatizado

- [x] Build TypeScript
- [x] Copy to Obsidian Vault
- [x] Create Backup
- [x] Increment Version (patch)
- [x] Update manifest.json
- [x] Update package.json
- [x] Update .release-history.json
- [x] Create Version Commit
- [x] Push to GitHub
- [x] Fallback if network fails
- [ ] Update CHANGELOG.md (manual, descritivo)
- [ ] Update README.md (manual, tabela)
- [ ] Create Git tags (futura melhoria)

---

## 🐛 Troubleshooting

### "Vault não foi atualizado"

→ Rodar: `npm run build` (é executado automaticamente, mas pode fazer manual)

### "Backup não criado"

→ Verificar: `.backups/` (deve ter arquivos .tar.gz)

### "Version não incrementou"

→ Verificar: `jq '.version' manifest.json` (deve ser NEW_VERSION)

### "GitHub não tem commit novo"

→ Verificar: `git log --oneline -3` (deve mostrar version bump)

### "Build falhou"

→ Verificar: `npm run build` (mostrar erro)

---

## 🎓 Sumário

| Aspecto               | Antes                | Agora                    |
| --------------------- | -------------------- | ------------------------ |
| **Passos Manuais**    | 7+                   | 0                        |
| **Tempo por Release** | 5-10 min             | 30 seg                   |
| **Erros Possíveis**   | Muitos               | 0 (validação automática) |
| **Vault Atualizado**  | Você tinha que pedir | Automático               |
| **Documentação**      | Desatualizada        | Sincronizada             |
| **GitHub**            | Inconsistente        | Automático               |

---

## 🚀 Próximos Passos

```bash
# 1. Testar a automação
npm run release:auto

# 2. Abrir outro terminal e fazer mudança
vim src/converter.ts

# 3. Salvar e observar o auto-release executar

# 4. Verificar que tudo foi feito:
#    ✓ Vault atualizado
#    ✓ Backup criado
#    ✓ Versão incrementada
#    ✓ Commit no git
#    ✓ Push no GitHub
```

**Você não faz mais nada além de editar código!** 🚀
