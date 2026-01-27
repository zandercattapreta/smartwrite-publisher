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

3. **Compilar e Implantar no Obsidian**:
   - Rodar `npm run build`.
   - Note: O script `esbuild.config.mjs` copia automaticamente `main.js`, `manifest.json` e `styles.css` para a pasta `.obsidian/plugins/smartwrite-publisher` local do projeto.
   - **IMPORTANTE**: Após o build, você deve ir no Obsidian, em _Settings > Community Plugins_, e **Recarregar (Reload)** o plugin SmartWrite Publisher para ver as mudanças.

4. **Atualizar Documentos**:
   - Atualizar `CHANGELOG.md` com as novas implementações.
   - Atualizar `docs/ROADMAP.md` e `docs/DEVELOPMENT_PLAN.md` se necessário.

5. **Sincronizar com GitHub**:
   - Identificar a nova versão (ex: v0.2.2).
   - Adicionar todas as alterações: `git add .`
   - Realizar o commit: `git commit -m "release: v<nova_versao> - <resumo_curto>"`
   - Enviar para o repositório: `git push origin main --force` (se for necessário sobrescrever o histórico de arquivos grandes).

6. **Notas de Release**:
   - Validar que a versão no `manifest.json` e `package.json` são idênticas.
   - Criar um sumário detalhado das alterações feitas para o usuário.
