# SmartWrite Publisher - Automação dos 5 Passos

## 🎯 Os 5 Passos Automatizados

Toda mudança em `src/` dispara automaticamente:

1. ✅ **TESTAR & REFATORAR** - `npm run build`
2. ✅ **BACKUP** - Cria `.tar.gz` em `.backups/`
3. ✅ **INCREMENT VERSION** - 0.3.3 → 0.3.4
4. ✅ **UPDATE VAULT** - Copia para `.obsidian/plugins/smartwrite-publisher/`
5. ✅ **UPDATE DOCS** - Atualiza `.release-history.json`

**Passo 6 (GitHub)** está fora da automação por enquanto.

---

## 🚀 Como Usar

### Iniciar o Daemon

```bash
npm start
```

Ou:

```bash
bash ./scripts/daemon.sh
```

### Fluxo

1. **Abrir Terminal 1** e iniciar daemon:
   ```bash
   npm start
   ```

2. **Abrir Terminal 2** e editar código:
   ```bash
   vim src/converter.ts
   # Fazer mudanças
   # Salvar arquivo
   ```

3. **Daemon detecta e executa automaticamente:**
   ```
   [15:30:45] MUDANÇA #1 DETECTADA EM src/
   [1/5] TESTAR & REFATORAR
   ✓ Build passed
   ✓ Vault synced at 15:30:48

   [2/5] BACKUP
   ✓ Backup: smartwrite-publisher-v0.3.4-20260129_153048.tar.gz (28K)

   [3/5] INCREMENT VERSION
   ✓ Version: 0.3.3 → 0.3.4

   [4/5] UPDATE VAULT
   ✓ Vault synchronized: v0.3.4

   [5/5] UPDATE DOCS
   ✓ .release-history.json updated

   ✅ ROTINA AUTOMÁTICA COMPLETA
   ```

4. **Pronto!** Todos os 5 passos executados automaticamente

---

## 📋 O que Cada Passo Faz

### 1️⃣ TESTAR & REFATORAR
```bash
npm run build
```
- Compila TypeScript
- Detecta erros de tipo
- Se falhar, daemon avisa mas não bloqueia

### 2️⃣ BACKUP
```bash
.backups/smartwrite-publisher-v0.3.4-TIMESTAMP.tar.gz
```
- Cria snapshot completo do projeto
- Exclui: node_modules, .git, build artifacts
- Tamanho: ~28KB cada

### 3️⃣ INCREMENT VERSION
```json
{
  "version": "0.3.4"
}
```
- Incrementa patch automaticamente
- Atualiza: manifest.json, package.json

### 4️⃣ UPDATE VAULT
```bash
.obsidian/plugins/smartwrite-publisher/
├── main.js (atualizado)
├── manifest.json (v0.3.4)
└── styles.css (atualizado)
```
- Copia bundle compilado para Obsidian
- Você recarrega plugin no Obsidian para aplicar

### 5️⃣ UPDATE DOCS
```json
{
  "lastRelease": "0.3.4",
  "nextTarget": "0.3.5"
}
```
- Atualiza `.release-history.json`
- Mantém histórico de versões

---

## ⚙️ Configuração (já feita)

Git configurado para usar `.githooks/`:
```bash
git config core.hooksPath .githooks
```

Scripts executáveis:
```bash
chmod +x ./scripts/daemon.sh
```

Package.json com script:
```json
"start": "bash ./scripts/daemon.sh"
```

---

## 🔍 Monitoramento

Daemon verifica mudanças a cada 2 segundos:

```bash
# Terminal com daemon rodando:
[15:30:00] Aguardando mudanças em src/...
[15:30:45] MUDANÇA #1 DETECTADA
[15:30:48] ✅ Rotina completa
[15:30:50] Aguardando próximas mudanças...
```

---

## ⚠️ Quando o Daemon Para

Pressione `CTRL+C` no terminal onde o daemon está rodando:

```bash
npm start
# ... rodando ...
^C  # Você pressiona CTRL+C
# Daemon para
```

---

## 📝 Exemplo Completo

### Terminal 1 - Iniciar Daemon
```bash
$ npm start

╔════════════════════════════════════════════════════════════╗
║         SmartWrite Publisher - Release Daemon              ║
║  Monitora mudanças e executa rotina COMPLETAMENTE automática
╚════════════════════════════════════════════════════════════╝

Processo Automatizado (5 Passos):
  1️⃣  TESTAR & REFATORAR → npm run build
  2️⃣  BACKUP → .backups/smartwrite-v*.tar.gz
  3️⃣  INCREMENT VERSION → 0.3.3 → 0.3.4
  4️⃣  UPDATE VAULT → .obsidian/plugins/smartwrite-publisher/
  5️⃣  UPDATE DOCS → .release-history.json

Aguardando mudanças em src/...
Pressione CTRL+C para parar
```

### Terminal 2 - Fazer Mudança
```bash
$ vim src/converter.ts
# Faz mudança na função convertToPlainMarkdown()
# Salva arquivo
# [ENTER]
```

### Terminal 1 - Daemon Detecta
```bash
[15:30:45] MUDANÇA #1 DETECTADA EM src/
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[1/5] TESTAR & REFATORAR
✓ Build passed
✓ Vault synced at 15:30:48

[2/5] BACKUP
✓ Backup: smartwrite-publisher-v0.3.4-20260129_153048.tar.gz (28K)

[3/5] INCREMENT VERSION
✓ Version: 0.3.3 → 0.3.4

[4/5] UPDATE VAULT
✓ Vault synchronized: v0.3.4

[5/5] UPDATE DOCS
✓ .release-history.json updated

╔════════════════════════════════════════════════════════════╗
║ ✅ ROTINA AUTOMÁTICA COMPLETA (PASSOS 1-5)                 ║
║ Versão: 0.3.4                                               ║
║ Backup: smartwrite-publisher-v0.3.4-20260129_153048.tar.gz ║
║ Vault: Sincronizado                                        ║
╚════════════════════════════════════════════════════════════╝

Aguardando próximas mudanças...
```

### Terminal 2 - Próxima Mudança
```bash
$ vim src/substack/SubstackService.ts
# Faz outra mudança
# Salva
```

### Terminal 1 - Detecta Automaticamente
```bash
[15:31:20] MUDANÇA #2 DETECTADA EM src/
[1/5] TESTAR & REFATORAR
✓ Build passed
✓ Vault synced at 15:31:23
...
✅ ROTINA AUTOMÁTICA COMPLETA
Versão: 0.3.5
```

---

## 📊 Resumo

| Item | Automático? | Como |
|------|-------------|------|
| Build | ✅ | npm run build |
| Backup | ✅ | tar -czf .backups/ |
| Version Bump | ✅ | jq edit manifest.json |
| Vault Sync | ✅ | cp to .obsidian/ |
| Docs Update | ✅ | jq edit .release-history.json |
| GitHub Commit | ⏳ | Manual depois |
| GitHub Push | ⏳ | Manual depois |

---

## 🎯 TL;DR

```bash
# Terminal 1: Inicia automação
npm start

# Terminal 2: Edita código normalmente
vim src/converter.ts
# Salva...

# Pronto! Os 5 passos executam automaticamente no Terminal 1
```

**Você não faz mais nada além de editar código.** ✨
