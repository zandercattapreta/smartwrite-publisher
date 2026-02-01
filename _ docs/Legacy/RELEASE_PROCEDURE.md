# SmartWrite Publisher - Release Procedure

## Visão Geral

Rotina automatizada para garantir qualidade e consistência em cada release.

## 📋 Checklist de Pré-Release

Antes de executar o script de release, verifique:

- [ ] Todas as mudanças de código estão completas
- [ ] TypeScript compila sem erros: `npm run build`
- [ ] Plugin foi testado no Obsidian Test Vault
- [ ] Funcionalidades funcionam conforme esperado
- [ ] Não há console errors ou warnings críticos

## 🚀 Executando a Rotina de Release

### Comando Básico

```bash
cd /sessions/friendly-zen-planck/mnt/smartwrite_publisher
./scripts/release.sh
```

### O que o script faz (ordem):

1. **Validação** - Verifica estrutura do projeto
2. **Build TypeScript** - Compila e detecta erros
3. **Type Safety Check** - Procura por `.trim()` em objetos (tipos não-string)
4. **Versionamento** - Incrementa patch version automaticamente
5. **Backup** - Cria arquivo tar.gz com estado atual
6. **Commit Git** - Cria commit com mensagem automática
7. **Push GitHub** - Tenta enviar para repositório remoto

### Saída do Script

```
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
✓ Backup created: .backups/smartwrite-publisher-v0.3.3-20260129_150000.tar.gz (28K)

[7/7] Committing changes...
✓ Successfully pushed to GitHub

=== Release Complete ===
Version: 0.3.3
Backup: smartwrite-publisher-v0.3.3-20260129_150000.tar.gz
Committed: YES
```

## ⚠️ Possíveis Erros

### Erro: "Build failed"

**Solução**: Corrigir erros de TypeScript e tentar novamente

```bash
npm run build  # Para ver os erros
```

### Erro: "Git user not configured"

**Solução**: Configurar git user globalmente

```bash
git config --global user.name "Zander Catta Preta"
git config --global user.email "zander.cattapreta@zedicoes.com"
```

### Aviso: "Push failed (network/auth issue)"

**Solução**: Commit foi criado localmente, fazer push manualmente depois

```bash
git push origin main
```

## 📝 Arquivos Modificados

Depois de executar o script, verifique:

```bash
git status          # Ver mudanças
git log -1          # Ver último commit
git diff HEAD~1     # Ver diff da versão anterior
```

## 🔄 Rotina Manual (sem script)

Se precisar fazer release manualmente:

1. **Validar e buildar**

    ```bash
    npm run build
    ```

2. **Incrementar versão em manifest.json**

    ```json
    "version": "0.3.3"  // incrementar patch
    ```

3. **Atualizar CHANGELOG.md**
    - Adicionar seção de nova versão no topo
    - Incluir data atual
    - Descrever mudanças

4. **Criar backup**

    ```bash
    mkdir -p .backups
    tar -czf .backups/smartwrite-publisher-v0.3.3-$(date +%Y%m%d_%H%M%S).tar.gz \
      --exclude=node_modules --exclude=.git \
      src/ manifest.json package.json README.md CHANGELOG.md
    ```

5. **Fazer commit**

    ```bash
    git add -A
    git commit -m "v0.3.3: [descrição das mudanças]"
    ```

6. **Push para GitHub**
    ```bash
    git push origin main
    ```

## 📊 Histórico de Releases

| Versão | Data       | Comando              | Status |
| ------ | ---------- | -------------------- | ------ |
| 0.3.2  | 29/01/2026 | Manual               | ✅     |
| 0.3.3  | TBD        | ./scripts/release.sh | ⏳     |

## 🎯 Próximos Melhoramentos

- [ ] Suporte a git tags automáticas
- [ ] Atualizar CHANGELOG automaticamente
- [ ] Notificar usuário via webhook
- [ ] Validação de commit message
- [ ] Release notes automatizadas
