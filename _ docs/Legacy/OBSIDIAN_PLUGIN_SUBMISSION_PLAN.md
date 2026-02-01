# Plano de Submissão do Plugin SmartWrite Publisher para Obsidian

Este documento detalha o processo passo a passo para submeter o plugin SmartWrite Publisher ao repositório oficial de plugins do Obsidian. Ele foi elaborado com base na documentação oficial de submissão de plugins do Obsidian e no repositório de exemplo.

---

## Fase 1: Checklist Pré-submissão

Antes de iniciar o processo de submissão, verifique os seguintes pontos:

1.  **Repositório GitHub Configurado**:
    *   O código-fonte do plugin deve estar acessível publicamente no GitHub. (Já feito e verificado: `https://github.com/zandercpzed/smartwrite-publisher`)
    *   Certifique-se de que o repositório principal contenha o código-fonte do plugin diretamente, e não como um submódulo (corrigido recentemente).
    *   As pastas de desenvolvimento local (`_ BKPs`, `_ docs`, `_ skills`, `_ test files`) e configurações de ambiente (`.agent`, `.claude`) devem ser ignoradas pelo Git (configurado no `.gitignore` raiz).

2.  **`README.md` Descritivo**:
    *   O arquivo `README.md` na raiz do repositório deve descrever claramente o plugin, suas funcionalidades, como instalá-lo e como usá-lo. (Atualizado recentemente)

3.  **Arquivo `LICENSE`**:
    *   O repositório deve conter um arquivo `LICENSE` válido que especifique a licença sob a qual o plugin é distribuído. (Já existe)

4.  **`manifest.json` Verificado**:
    *   O arquivo `manifest.json` (localizado em `smartwrite_publisher/manifest.json`) deve conter os campos obrigatórios e atualizados:
        *   `id`: ID único do seu plugin (deve corresponder ao nome do repositório sem o prefixo `obsidian-`). Para SmartWrite Publisher, o ID pode ser `smartwrite-publisher`.
        *   `name`: Nome legível do plugin (ex: "SmartWrite Publisher").
        *   `author`: Seu nome ou nome da sua organização.
        *   `description`: Descrição breve e clara do que o plugin faz.
        *   `version`: A versão atual do plugin (será atualizada para a versão de submissão).
        *   `minAppVersion`: A versão mínima do Obsidian necessária para o plugin.

5.  **Revisão das Políticas de Desenvolvedor**:
    *   Leia e entenda as políticas de desenvolvedor e requisitos de submissão do Obsidian para garantir a conformidade.
        *   [Documentação Oficial](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin) (secção "Developer policies and submission requirements")

---

## Fase 2: Preparação para o Lançamento (Release)

Esta fase envolve preparar o código e o repositório para a versão que será submetida.

1.  **Atualizar a Versão do Plugin**:
    *   Edite `smartwrite_publisher/manifest.json` e `smartwrite_publisher/package.json`.
    *   Defina a `version` para a versão que será submetida (ex: `1.0.0`). Esta será a primeira versão oficial pública.

2.  **Gerar o Build de Produção**:
    *   No terminal, navegue até a pasta `smartwrite_publisher/`.
    *   Execute o comando de build para gerar os arquivos `main.js` e `styles.css` (se o plugin tiver estilos).
        ```bash
        cd smartwrite_publisher
        npm install  # Garanta que todas as dependências estão instaladas
        npm run build # Gera os arquivos de produção
        cd .. # Retorna à raiz do projeto
        ```

3.  **Criar um GitHub Release**:
    *   **Tag do Commit**: Crie uma tag Git com o número da versão (ex: `1.0.0`) no commit mais recente que contém as mudanças para esta versão.
        ```bash
        git tag 1.0.0
        git push origin 1.0.0
        ```
    *   **Crie o Release no GitHub**: Vá para a seção "Releases" do seu repositório no GitHub. Crie um novo release para a tag `1.0.0`.
    *   **Upload de Assets Binários**: Anexe os seguintes arquivos ao release como "assets binários":
        *   `smartwrite_publisher/main.js`
        *   `smartwrite_publisher/manifest.json`
        *   `smartwrite_publisher/styles.css` (se existir)

---

## Fase 3: Submissão para Revisão

Esta fase envolve a submissão formal do seu plugin para a equipe do Obsidian.

1.  **Fork do Repositório `obsidianmd/obsidian-releases`**:
    *   No GitHub, acesse `https://github.com/obsidianmd/obsidian-releases`.
    *   Faça um "Fork" deste repositório para sua conta GitHub.

2.  **Clonar seu Fork Localmente**:
    *   Clone o repositório forked para sua máquina local.
        ```bash
        git clone https://github.com/zandercpzed/obsidian-releases.git
        cd obsidian-releases
        ```

3.  **Editar `community-plugins.json`**:
    *   Abra o arquivo `community-plugins.json` no seu fork local (localizado na raiz do repositório `obsidian-releases`).
    *   Adicione uma nova entrada para o SmartWrite Publisher dentro do array JSON. Use o seguinte formato:
        ```json
        {
          "id": "smartwrite-publisher",
          "name": "SmartWrite Publisher",
          "author": "Zander Catta Preta",
          "description": "Professional publishing automation for Substack (and soon multiple blogging platforms) directly from Obsidian.",
          "repo": "zandercpzed/smartwrite-publisher"
        }
        ```
    *   Certifique-se de que a descrição (`description`) seja a mesma ou similar à do seu `manifest.json`.

4.  **Commit e Push para seu Fork**:
    *   Adicione o arquivo modificado: `git add community-plugins.json`
    *   Faça o commit: `git commit -m "Add SmartWrite Publisher plugin"`
    *   Envie as mudanças para seu fork: `git push origin main` (ou o nome da sua branch).

5.  **Criar um Pull Request (PR)**:
    *   No GitHub, vá para o seu repositório forked (`zandercpzed/obsidian-releases`).
    *   Crie um novo "Pull Request" do seu fork (`main` branch) para o repositório original (`obsidianmd/obsidian-releases`, `main` branch).
    *   **Título do PR**: O título do Pull Request deve seguir o formato específico: `Add plugin: SmartWrite Publisher` (substitua pelo nome real do seu plugin).

---

## Fase 4: Lidando com Comentários da Revisão

Após a criação do PR, a equipe do Obsidian irá revisar seu plugin.

1.  **Monitorar o PR**: Fique atento aos comentários e solicitações de alteração no seu Pull Request.
2.  **Realizar Alterações**:
    *   Se forem solicitadas mudanças no código do plugin: faça as alterações no seu repositório principal (`smartwrite-publisher`).
    *   Atualize a versão nos arquivos `manifest.json` e `package.json` se as mudanças justificarem um novo patch ou minor version.
    *   Crie um **novo release no GitHub** (Fase 2, passo 3) com a nova tag de versão e os assets atualizados.
    *   Não é necessário criar um novo PR para o `obsidian-releases`, apenas atualize seu repositório principal e o release. O PR original será atualizado automaticamente.

---

## Fase 5: Pós-Submissão

Após a aprovação e publicação do seu plugin pela equipe do Obsidian.

1.  **Anúncio**:
    *   Anuncie o lançamento do seu plugin nos fóruns do Obsidian e no canal `#updates` do Discord oficial.

---

**Observações Importantes**:

*   **Conflitos de Merge**: Se o seu Pull Request para `obsidianmd/obsidian-releases` apresentar conflitos de merge, você pode ignorá-los. A equipe do Obsidian cuidará da resolução antes da publicação.
*   **Tempo de Revisão**: O tempo de revisão pode variar dependendo da carga de trabalho da equipe do Obsidian. Seja paciente.
