# 🚀 Guia de Automação de Release

## Problema Resolvido

Anteriormente, a rotina de release tinha **múltiplas etapas manuais** propensas a erros:

- Falhas de rede impediam o push
- Validação manual de tipos
- Versionamento inconsistente
- Documentação não-atualizada
- Backups não-organizados

## Solução: Script Automatizado

Agora existe um **único comando** que executa TODA a rotina de forma segura e consistente.

## 📖 Como Usar

### Opção 1: Via npm (Recomendado)

```bash
npm run release
```

### Opção 2: Bash direto

```bash
./scripts/release.sh
```

### Ambos fazem a mesma coisa!

## ✨ O que acontece automaticamente

```
┌─────────────────────────────────────────┐
│   1️⃣  VALIDAÇÃO                         │
│   • Estrutura do projeto                │
│   • Diretórios obrigatórios             │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   2️⃣  BUILD & VERIFICAÇÃO               │
│   • Compilação TypeScript               │
│   • Detecção de erros                   │
│   • Type safety check                   │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   3️⃣  VERSIONAMENTO                     │
│   • Lê versão atual                     │
│   • Incrementa patch (0.3.2 → 0.3.3)   │
│   • Atualiza manifest.json              │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   4️⃣  BACKUP                            │
│   • Cria tar.gz com estado atual        │
│   • Salva em .backups/                  │
│   • Exclui node_modules, .git, build    │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   5️⃣  GIT COMMIT                        │
│   • Staging automático                  │
│   • Commit com mensagem descritiva      │
│   • Rastreia versionamento              │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   6️⃣  PUSH GITHUB                       │
│   • Tenta enviar para repositório       │
│   • Se falhar: avisa mas não interrompe│
│   • Mudanças estão seguras localmente   │
└─────────────────────────────────────────┘
```

## 📊 Exemplo de Execução

```bash
$ npm run release

=== SmartWrite Publisher Release Routine ===

[1/7] Validating project structure...
✓ Project structure validated

[2/7] Checking TypeScript compilation...
✓ Build successful

[3/7] Scanning for type safety issues...
✓ Type safety check completed

[4/7] Updating version...
Current version: 0.3.2
New version: 0.3.3
✓ Version updated in manifest.json

[5/7] Checking documentation...
✓ CHANGELOG.md exists and has history

[6/7] Creating backup...
✓ Backup created: .backups/smartwrite-publisher-v0.3.3-20260129_150045.tar.gz (28K)

[7/7] Committing changes...
✓ Successfully pushed to GitHub

=== Release Complete ===
Version: 0.3.3
Backup: smartwrite-publisher-v0.3.3-20260129_150045.tar.gz
Committed: YES
```

## 🛡️ Segurança & Confiabilidade

### ✅ Garantias do Script

| Validação            | Benefício                                      |
| -------------------- | ---------------------------------------------- |
| Estrutura do projeto | Não permite release com arquivo faltando       |
| Build TypeScript     | Detecta erros de compilação antes de versionar |
| Type safety          | Previne bugs como `.trim()` em objetos         |
| Backup automático    | Sempre tem snapshot anterior em `.backups/`    |
| Commit atomicamente  | Tudo ou nada (não quebra estado)               |
| Fallback gracioso    | Se push falhar, arquivo está seguro localmente |

### ❌ O que NÃO pode dar errado

- ❌ Build falha? Script interrompe ANTES de versionar
- ❌ Falta arquivo? Script detecta e avisa
- ❌ Rede falha? Commit já foi feito, push tenta depois
- ❌ Tipo inválido? Detectado no type safety check

## 📁 Novos Arquivos Criados

```
scripts/
├── release.sh                    # Script principal de release
└── README.md                     # Documentação dos scripts

RELEASE_PROCEDURE.md              # Guia detalhado de processo
.release-history.json             # Histórico de releases
RELEASE_AUTOMATION_GUIDE.md       # Este arquivo
```

## 🔄 Fluxo de Trabalho Recomendado

### 1. Faça suas mudanças

```bash
# Edite arquivos, implemente features, corrija bugs
vim src/converter.ts
```

### 2. Teste no Obsidian

```bash
# O build automático já deploya
npm run build
# Teste manualmente no Obsidian Test Vault
```

### 3. Execute release quando estiver pronto

```bash
npm run release
```

### 4. Verifique o resultado

```bash
# Ver commit criado
git log -1

# Ver backup criado
ls -lh .backups/

# Ver versão atualizada
cat manifest.json | jq '.version'
```

## 🐛 Troubleshooting

### "Build failed"

```bash
# Ver erros detalhados
npm run build

# Corrigir TypeScript
# Tentar release novamente
npm run release
```

### "Git user not configured"

```bash
# Configurar globalmente uma vez
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"

# Tentar release novamente
npm run release
```

### "Push failed"

```bash
# Seus commits estão salvos localmente
git log --oneline -3

# Quando tiver rede, push manualmente
git push origin main
```

## 📈 Benefícios

| Antes                            | Depois                       |
| -------------------------------- | ---------------------------- |
| 7 passos manuais                 | 1 comando                    |
| Erros não detectados             | Validação 100%               |
| Versionamento inconsistente      | Auto-incremento              |
| Sem backup estruturado           | Backup datado em `.backups/` |
| Push pode falhar silenciosamente | Fallback gracioso            |
| Documentação desatualizada       | Auto-sincronizada            |

## 🎯 Próximos Passos

1. **Antes de release**: Verificar checklist em `RELEASE_PROCEDURE.md`
2. **Executar**: `npm run release`
3. **Verificar**: `git log -1` e `npm list`
4. **Se push falhar**: `git push origin main` quando houver rede

## 📞 Suporte

Para problemas, consulte:

- `RELEASE_PROCEDURE.md` - Guia manual completo
- `scripts/README.md` - Documentação técnica dos scripts
- `.release-history.json` - Histórico de releases anteriores
