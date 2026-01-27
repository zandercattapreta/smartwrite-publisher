---
description: Como atualizar o código, versionamento, backup e deploy no GitHub
---

Este workflow deve ser seguido sempre que uma alteração significativa for concluída e testada.

// turbo-all

1. **Criar Backup**:
   - Identificar a versão atual no `manifest.json`.
   - Criar uma pasta em `docs/bkps/v<versao_atual>`.
   - Copiar todos os arquivos fontes (`src/`, `main.js`, `manifest.json`, `styles.css`) para esta pasta.

2. **Incrementar Versão**:
   - Incrementar o último dígito (patch) da propriedade `version` no `package.json` e `manifest.json`.
   - Rodar `npm run version` para atualizar o `versions.json`.

3. **Compilar e Sincronizar**:
   - Rodar `npm run build` para garantir que o bundle `main.js` esteja atualizado na versão nova.

4. **Atualizar Documentos**:
   - Atualizar `CHANGELOG.md` com as novas implementações.
   - Atualizar `docs/ROADMAP.md` e `docs/DEVELOPMENT_PLAN.md` se necessário.

5. **Commit GitHub**:
   - Adicionar todas as alterações: `git add .`
   - Realizar o commit: `git commit -m "release: v<nova_versao> - <resumo_curto>"`
   - Enviar para o repositório: `git push origin main`

6. **Notas de Release**:
   - Criar um arquivo temporário ou seção no `CHANGELOG.md` descrevendo detalhadamente as correções e novas features.
