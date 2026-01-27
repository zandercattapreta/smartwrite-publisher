# Política de Desenvolvimento

Workflow para garantir rastreabilidade e qualidade do código.

## Checklist por Commit

### 1. Antes de Começar
- [ ] Criar branch se for feature grande (opcional para patches)
- [ ] Verificar versão atual em `manifest.json`

### 2. Após Alterações
- [ ] Incrementar versão (patch: `0.1.7` → `0.1.8`)
  - `manifest.json`
  - `package.json`
- [ ] Adicionar entrada no `CHANGELOG.md`
- [ ] Atualizar `FEATURES.md` se aplicável

### 3. Build e Teste
```bash
npm run build
```
- [ ] Testar no vault de desenvolvimento
- [ ] Verificar console do Obsidian por erros

### 4. Commit
```bash
git add .
git commit -m "[Tipo]: Descrição - vX.Y.Z"
git push origin main
```

**Tipos de commit:**
- `[Fix]` - Correção de bug
- `[Feat]` - Nova funcionalidade
- `[Refactor]` - Reestruturação sem mudança funcional
- `[Docs]` - Documentação
- `[Style]` - CSS ou formatação

### 5. Backup (para marcos)
Antes de versões `.X.0`, criar backup em:
```
/script/docs/bkps/vX.Y.Z/
```

## Estrutura de Arquivos

```
script/
├── docs/
│   ├── PROJECT_DEFINITION.md  # O quê e por quê
│   ├── FEATURES.md            # Status atual
│   ├── ROADMAP.md             # Visão de futuro
│   ├── DEVELOPMENT_PLAN.md    # Como implementar
│   ├── INTERFACE_DESIGN.md    # Especificação de UI
│   ├── USER_JOURNEY.md        # Fluxos de uso
│   ├── DEVELOPMENT_POLICY.md  # Este arquivo
│   └── bkps/                  # Backups versionados
│
└── smartwrite-publisher/
    ├── src/                   # Código fonte
    ├── manifest.json          # Metadados do plugin
    ├── package.json           # Dependências
    ├── CHANGELOG.md           # Histórico de versões
    └── README.md              # Documentação pública
```

## Versionamento Semântico

| Incremento | Quando usar | Exemplo |
|------------|-------------|---------|
| Patch (0.0.X) | Bug fixes, ajustes menores | 0.1.7 → 0.1.8 |
| Minor (0.X.0) | Nova funcionalidade completa | 0.1.8 → 0.2.0 |
| Major (X.0.0) | Breaking changes | 0.9.0 → 1.0.0 |

## Releases

Para publicar no Obsidian Community Plugins:

1. Garantir que `manifest.json` está atualizado
2. Criar tag no GitHub: `git tag 0.2.0 && git push --tags`
3. Criar release no GitHub com os arquivos:
   - `main.js`
   - `manifest.json`
   - `styles.css`
