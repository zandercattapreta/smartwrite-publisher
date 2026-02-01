# Scripts do SmartWrite Publisher

## 📋 Disponíveis

### `release.sh` - Rotina Automatizada de Release

Automatiza todo o processo de release: validação, build, versionamento, backup e git.

#### Uso

```bash
# Via bash direto
./scripts/release.sh

# Via npm
npm run release
```

#### Funcionalidades

✅ Validação da estrutura do projeto
✅ Compilação TypeScript com detecção de erros
✅ Verificação de segurança de tipos (`.trim()` em não-strings)
✅ Incremento automático de versão (patch)
✅ Criação de backup comprimido
✅ Commit automático com mensagem descritiva
✅ Push para GitHub (com fallback gracioso se falhar)

#### Fluxo

```
[1] Validação
    ↓
[2] Build TypeScript
    ↓
[3] Type Safety Check
    ↓
[4] Incrementar Versão
    ↓
[5] Backup
    ↓
[6] Commit Git
    ↓
[7] Push GitHub
```

#### Versioning

O script incrementa automaticamente o **patch version**:

- `0.3.2` → `0.3.3`
- `0.3.9` → `0.3.10`
- etc.

Para mudar **minor** ou **major**, editar manualmente `manifest.json`:

```json
{
    "version": "0.4.0" // Major.minor.patch
}
```

#### Saída Esperada

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
✓ Backup created: .backups/smartwrite-publisher-v0.3.3-20260129_150030.tar.gz (28K)

[7/7] Committing changes...
✓ Successfully pushed to GitHub

=== Release Complete ===
Version: 0.3.3
Backup: smartwrite-publisher-v0.3.3-20260129_150030.tar.gz
Committed: YES
```

#### Tratamento de Erros

| Erro                      | Solução                                              |
| ------------------------- | ---------------------------------------------------- |
| Build failed              | Executar `npm run build` para ver erros TypeScript   |
| Git user not configured   | Configurar com `git config --global user.name "..."` |
| Push failed               | Commit foi criado localmente, fazer push depois      |
| Project structure invalid | Verificar pastas: src/, manifest.json, CHANGELOG.md  |

## 📚 Documentação Relacionada

- `RELEASE_PROCEDURE.md` - Guia detalhado de processo de release
- `.release-history.json` - Histórico de releases anteriores
- `CHANGELOG.md` - Changelog detalhado de todas as versões
- `manifest.json` - Versão atual do plugin

## 🔧 Configuração

### Git

Certifique-se de que seu git está configurado:

```bash
git config --global user.name "Zander Catta Preta"
git config --global user.email "zander.cattapreta@zedicoes.com"
git config --list  # Verificar
```

### Node.js

Certifique-se de ter dependências instaladas:

```bash
npm install
```

## 🚦 Status das Releases

Veja o histórico em `.release-history.json`:

```json
{
  "releases": [...],
  "lastRelease": "0.3.2",
  "nextTarget": "0.3.3"
}
```
