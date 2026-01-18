# SmartWrite Publisher (Obsidian Plugin)

Automatizador de publicações para **Substack** diretamente do seu vault no Obsidian.md.

## 🚀 O que ele faz

- **Integração Nativa**: Funciona diretamente na Sidebar do Obsidian.
- **Publicação Contextual**: Detecta automaticamente a nota ativa e permite publicá-la como Rascunho, Live ou Agendada.
- **Gerenciamento de Ativos**: Converte Markdown do Obsidian para HTML compatível com o Substack.
- **Hashtags Inteligentes**: Sugere tags baseadas no conteúdo e metadados da nota.
- **Automação em Lote**: Publique diretórios inteiros de uma vez (Fase 3).

## 🛠️ Instalação e Configuração

1. **Ative o Plugin**: Após instalar, clique no ícone de "Broadcast" na Ribbon lateral esquerda.
2. **Configure sua Sessão**:
    - Vá para a seção **Quick Settings** na Sidebar.
    - Insira seu `substack.sid` (obtido via Cookies no browser).
    - Insira a URL da sua publicação.
3. **Teste a Conexão**: Clique em "Test Connection". Se o ponto ficar verde, você está pronto.

## 📦 Desenvolvimento (v0.1.0)

Este projeto está sendo desenvolvido em fases:

- **v0.1.0**: Fundação, Sidebar e Conectividade (ATUAL).
- **v0.2.0**: Publicação de Nota Ativa.
- **v0.3.0**: Publicação em Lote por Diretório.

### Build e Deploy

Para desenvolvedores:

```bash
npm install
npm run build
```

O build automático copia os arquivos necessários para a pasta de plugins do seu vault (conforme configurado no `esbuild.config.mjs`).

## 📄 Licença

Este projeto é licenciado sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido por [Zander CP](https://github.com/zandercpzed/smartwrite-publisher).
