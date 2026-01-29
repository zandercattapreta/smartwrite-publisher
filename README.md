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

## 📦 Fases de Desenvolvimento

Este projeto está sendo desenvolvido em fases:

- **v0.1.0**: ✅ Fundação, Sidebar e Conectividade.
- **v0.2.0**: ✅ Publicação de Nota Ativa (Phase 2 - Hotfixes v0.2.6.6-v0.2.6.10).
- **v0.3.x**: ✅ **Tiptap JSON Format** (29 jan 2026)
  - v0.3.0: Arquitetura Refatorada com separação de responsabilidades
    - Modular architecture com SubstackClient, PayloadBuilder, ErrorHandler, IdStrategy
    - Fixed: Cookie headers, Content-Type, Duplicate endpoints
  - v0.3.2: Tiptap JSON Implementation (Markdown → Tiptap JSON converter)
    - Fixed: HTML literal rendering issue
    - Converted: `draft_body` (string) → `bodyJson` (Tiptap JSON)
    - Added: Type-safe validation for both string (legacy) and Tiptap formats
    - Ready para publicação em lote (Phase 3 feature-ready)

### Histórico de Versões

| Versão | Data | Status | Descrição |
|--------|------|--------|-----------|
| 0.3.3 | 29/01/2026 | ✅ Estável | Parser bug fixes, correção de posts vazios |
| 0.3.2 | 29/01/2026 | ✅ Estável | Tiptap JSON implementation, correção de validação de tipos |
| 0.3.1 | 29/01/2026 | ✅ Estável | Hotfix na extração de título (H1 vs H2+) |
| 0.3.0 | 29/01/2026 | ✅ Estável | Arquitetura modular, correção de bugs estruturais |
| 0.2.6.10 | 29/01/2026 | 🔄 Hotfix | Última tentativa de hotfix antes refactoring |
| 0.2.6.6-0.2.6.9 | 29/01/2026 | ❌ Ineficaz | Série de hotfixes que revelaram problemas arquiteturais |
| 0.2.0 | 28/01/2026 | ✅ Estável | Publicação integrada ao Obsidian |
| 0.1.0+ | 18/01/2026 | ✅ Foundational | Sidebar, conexão, logger |

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

Desenvolvido por [Zander Catta Preta](https://github.com/zandercpzed/smartwrite-publisher).
