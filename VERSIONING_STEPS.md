# SmartWrite Publisher - Passos de Versionamento

## 📋 Os 3 Passos Essenciais

Toda vez que você faz uma release, siga **NESTA ORDEM**:

### **PASSO 1: CRIAR BACKUP** 🔄
### **PASSO 2: ATUALIZAR OBSIDIAN VAULT** 🔧
### **PASSO 3: ATUALIZAR DOCUMENTAÇÃO** 📚

---

## 🔄 PASSO 1: CRIAR BACKUP

### O quê fazer
Salvar snapshot do código ANTES de fazer mudanças.

### Como fazer

**Automático (via script de release)**:
```bash
npm run release
```
O script cria backup em `.backups/smartwrite-publisher-v0.3.3-TIMESTAMP.tar.gz`

**Manual**:
```bash
mkdir -p .backups
tar -czf .backups/smartwrite-publisher-v$(jq -r '.version' manifest.json)-$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=node_modules --exclude=.git \
  src/ manifest.json package.json README.md CHANGELOG.md
```

### Verificar
```bash
ls -lh .backups/
```

---

## 🔧 PASSO 2: ATUALIZAR OBSIDIAN VAULT

### ⚠️ CRÍTICO: Este é o passo mais importante!

O Obsidian vault fica em:
```
/sessions/friendly-zen-planck/mnt/_ smartwriter-publisher/.obsidian/plugins/smartwrite-publisher/
```

**Se não atualizar aqui, Obsidian continua rodando versão antiga!**

### Como fazer

**Automático**:
```bash
npm run build
```

Isso:
1. ✅ Compila TypeScript (`tsc`)
2. ✅ Gera `main.js` (bundle)
3. ✅ Copia para `.obsidian/plugins/smartwrite-publisher/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`

### Verificar

```bash
# Ver versão no vault
cat .obsidian/plugins/smartwrite-publisher/manifest.json | jq '.version'

# Ver tamanho do build
ls -lh .obsidian/plugins/smartwrite-publisher/main.js

# Ver timestamp (deve ser AGORA)
ls -l .obsidian/plugins/smartwrite-publisher/manifest.json
```

**Esperado**: Versão deve estar SINCRONIZADA com `manifest.json` no projeto

### ✅ Validação
```bash
# Source (projeto)
echo "Source version:" $(jq -r '.version' manifest.json)

# Vault (Obsidian)
echo "Vault version:" $(jq -r '.version' .obsidian/plugins/smartwrite-publisher/manifest.json)

# Devem ser iguais!
```

---

## 📚 PASSO 3: ATUALIZAR DOCUMENTAÇÃO

### Arquivos a atualizar (nesta ordem):

#### 3a. CHANGELOG.md
Adicionar entrada para NOVA versão no TOPO:

```markdown
## [0.3.4] - 2026-01-29 (Feature/Fix - Description)

### 🎯 Adicionado / Fixo

- **Descrição curta**: Explicação detalhada
  - Ponto 1
  - Ponto 2
  - Impacto

### ✅ Status
- ✅ Build: SUCCESS (26KB)
- ✅ Deployed: Obsidian Test Vault
- ✅ TypeScript: All errors resolved
- 🧪 Testing: Ready for testing

---
```

#### 3b. README.md
Atualizar tabela de versões:

```markdown
| Versão | Data | Status | Descrição |
|--------|------|--------|-----------|
| 0.3.4 | 29/01/2026 | ✅ Estável | Descrição da release |
| 0.3.3 | 29/01/2026 | ✅ Estável | Release anterior |
```

#### 3c. .release-history.json
Adicionar nova entrada:

```json
{
  "releases": [
    {
      "version": "0.3.4",
      "date": "2026-01-29T15:30:00Z",
      "type": "feature",
      "description": "Feature description",
      "changes": ["Change 1", "Change 2"],
      "method": "automated"
    },
    // ... anteriores
  ],
  "lastRelease": "0.3.4",
  "nextTarget": "0.3.5"
}
```

#### 3d. package.json
Verificar versão sincronizada:
```json
{
  "version": "0.3.4"  // Deve match manifest.json
}
```

---

## 📊 Checklist de Versionamento

Antes de fazer release, execute **EM ORDEM**:

```bash
# 1️⃣ BACKUP - Salvar snapshot
npm run release
# OU
mkdir -p .backups
tar -czf .backups/smartwrite-publisher-v$(jq -r '.version' manifest.json)-$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=node_modules --exclude=.git src/ manifest.json package.json README.md CHANGELOG.md

# 2️⃣ BUILD + UPDATE VAULT - Copiar para Obsidian
npm run build

# ✅ VALIDAR - Versão sincronizada?
echo "Source:" $(jq -r '.version' manifest.json)
echo "Vault:" $(jq -r '.version' .obsidian/plugins/smartwrite-publisher/manifest.json)

# 3️⃣ DOCUMENTAÇÃO - Atualizar arquivos
vim CHANGELOG.md      # Adicionar entrada nova no TOPO
vim README.md         # Atualizar tabela de versões
vim .release-history.json # Adicionar nova versão
vim package.json      # Verificar sincronização

# 4️⃣ GIT - Commit tudo
git add -A
git commit -m "v0.3.4: [Descrição]"

# 5️⃣ PUSH - Enviar para GitHub
git push origin main
```

---

## 🔍 Validações Importantes

### ✅ Passo 1 - Backup
- [ ] Arquivo `.tar.gz` criado em `.backups/`
- [ ] Contém `src/`, `manifest.json`, documentação
- [ ] Tamanho > 10KB (não vazio)

### ✅ Passo 2 - Vault Atualizado
- [ ] `npm run build` roda sem erros
- [ ] Versão em `manifest.json` (source) = versão em `.obsidian/` (vault)
- [ ] `main.js` foi atualizado (timestamp recente)
- [ ] Obsidian reconhece nova versão

### ✅ Passo 3 - Documentação
- [ ] CHANGELOG.md tem entrada nova no TOPO
- [ ] README.md tabela sincronizada
- [ ] .release-history.json atualizado
- [ ] package.json version sincronizada
- [ ] Nenhum arquivo com versão antiga

---

## ⚠️ Erros Comuns

### ❌ "Vault ainda está em v0.3.2"
**Causa**: Não executou `npm run build` (Passo 2)
**Solução**:
```bash
npm run build
```

### ❌ "CHANGELOG desatualizado"
**Causa**: Não atualizou docs (Passo 3)
**Solução**:
```bash
vim CHANGELOG.md  # Adicionar nova versão no TOPO
```

### ❌ "Versão 0.3.3 em manifest.json mas 0.3.2 em package.json"
**Causa**: Sincronização inadequada
**Solução**:
```bash
# Verificar
jq '.version' manifest.json
jq '.version' package.json

# Se diferente, atualizar package.json
jq --arg v "0.3.3" '.version = $v' package.json > /tmp/p.json && mv /tmp/p.json package.json
```

### ❌ "Git push falhou"
**Causa**: Rede ou autenticação
**Solução**:
- Commit foi feito localmente (seguro)
- Tentar push depois: `git push origin main`

---

## 🔄 Fluxo Recomendado Completo

```
┌─────────────────────────────────────────┐
│ 1. Fazer mudanças no código             │
│    vim src/converter.ts                 │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 2. Testar localmente                    │
│    npm run build                        │
│    (testar manualmente no Obsidian)     │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 3. BACKUP - Passo 1                     │
│    npm run release                      │
│    (cria .backups/smartwrite-v*.tar.gz) │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 4. VAULT - Passo 2                      │
│    npm run build                        │
│    ✓ Sincroniza .obsidian/             │
│    ✓ Atualiza manifest.json             │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 5. DOCS - Passo 3                       │
│    vim CHANGELOG.md                     │
│    vim README.md                        │
│    vim .release-history.json            │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 6. GIT - Commit                         │
│    git add -A                           │
│    git commit -m "v0.3.4: ..."          │
│    git push origin main                 │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│ 7. VALIDE                               │
│    • Vault sincronizado?                │
│    • Docs atualizadas?                  │
│    • Commit criado?                     │
│    • Backup em .backups/?               │
└─────────────────────────────────────────┘
```

---

## 🚀 Script Simplificado (Automático)

Se seguir a rotina manual, use:
```bash
npm run release
```

Mas **SEMPRE** verifique que:
1. ✅ Backup criado
2. ✅ `npm run build` executado
3. ✅ Documentação atualizada

---

## 📝 Resumo dos 3 Passos

| Passo | O quê | Como | Validação |
|-------|-------|------|-----------|
| **1** | Backup | `npm run release` ou `tar -czf` | Arquivo em `.backups/` |
| **2** | Vault | `npm run build` | Versão sincronizada |
| **3** | Docs | Editar `CHANGELOG.md`, `README.md`, etc | Arquivos atualizados |

---

## ✨ Dica Final

Memorize a sequência:
1. **B**ackup
2. **V**ault (npm run build)
3. **D**ocumentation

**BVD** = Sempre nesta ordem!
