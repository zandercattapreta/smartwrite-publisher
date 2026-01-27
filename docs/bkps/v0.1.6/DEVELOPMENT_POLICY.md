# Política de Desenvolvimento e Release

Para garantir a rastreabilidade e integridade do projeto, cada interação que envolva alteração de código deve seguir este workflow:

## Checklist de Interação

1.  **Incremento de Versão**:
    - Atualizar o último dígito (patch) em `manifest.json` e `package.json`.
    - Ex: `0.1.0` -> `0.1.1`.
2.  **Backup**:
    - Antes de grandes mudanças ou logo após o incremento, criar uma cópia em `/script/docs/bkps/vX.Y.Z/`.
3.  **Deploy Local**:
    - Rodar `npm run build` para atualizar o vault de testes (`/.obsidian/plugins/`).
4.  **Documentação de Produto**:
    - Atualizar `FEATURES.md` com o status das funcionalidades.
    - Atualizar `README.md` se houver mudanças na interface ou uso.
5.  **Registro de Release**:
    - Adicionar entrada no `CHANGELOG.md` descrevendo as mudanças.
6.  **Sincronização**:
    - `git add .`, `git commit -m "[Tipo]: Descrição vX.Y.Z"`, `git push origin main`.
