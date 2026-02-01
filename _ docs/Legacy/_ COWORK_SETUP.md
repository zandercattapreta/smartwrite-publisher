# SmartWrite Publisher - Setup para Claude Cowork

## 🎯 Objetivos do Projeto

**SmartWrite Publisher** é um plugin Obsidian que automatiza a publicação de notas em Substack.

### Objetivo Principal

Permitir que o usuário publique conteúdo do seu vault Obsidian diretamente em Substack, sem sair do editor.

### Fases de Desenvolvimento

- **Phase 1** ✅ (v0.1.x): Fundação, Sidebar, conectividade com Substack
- **Phase 2** ✅ (v0.2.x): Publicação de nota ativa (nota aberta no momento)
- **Phase 3** ✅ (v0.3.x): Tiptap JSON + automação
- **Phase 4** ✅ (v0.4.x - v1.0.0): Publicação em lote e Lançamento Oficial

### Status Atual (v1.0.0) - Lançamento Oficial

- ✅ Plugin compilado e funcional (versão 1.0.0)
- ✅ Arquitetura modular e robusta implementada
- ✅ Automação de builds e releases configurada
- ✅ Suporte a Batch Publishing e UI aprimorada
- ✅ Repositório refatorado para estrutura monorepo

---

## 📁 Organização de Pastas

```
/Users/zander/Library/CloudStorage/GoogleDrive-zander.cattapreta@zedicoes.com/My Drive/_ programação/_ smartwrite_publisher/

├── .git/                          # Repositório GitHub (metadados)
├── .gitignore                     # Regras de arquivos/pastas ignorados pelo Git
├── README.md                      # Documentação principal do projeto
├── CHANGELOG.md                   # Histórico de mudanças do projeto
├── LICENSE                        # Licença do projeto
├── package-lock.json              # Lockfile de dependências npm
├── _ BKPs/                        # BACKUPS LOCAIS (IGNORADO PELO GIT)
│   └── ...                        # Backups das versões passadas
├── _ docs/                        # DOCUMENTAÇÃO INTERNA E PLANEJAMENTO (IGNORADO PELO GIT)
│   ├── ...                        # Arquivos de planejamento, guias, etc.
├── _ skills/                      # SKILLS PARA ASSISTENTES (IGNORADO PELO GIT)
│   └── ...                        # Configurações de IA, prompts, etc.
├── _ test files/                  # ARQUIVOS DE TESTE LOCAIS (IGNORADO PELO GIT)
│   └── ...                        # Arquivos temporários, logs, etc.
└── smartwrite_publisher/          # CÓDIGO-FONTE DO PLUGIN (SINCRONIZADO COM GITHUB)
    ├── src/                       # Código-fonte TypeScript
    │   ├── main.ts                # Entry point do plugin
    │   ├── view.ts                # UI/View
    │   ├── converter.ts           # Markdown → texto
    │   └── ...                    # Outros módulos do plugin
    ├── manifest.json              # Metadados do plugin Obsidian
    ├── package.json               # Dependências npm e scripts
    ├── esbuild.config.mjs         # Configuração de build
    ├── styles.css                 # Estilos do plugin
    ├── versions.json              # Mapeamento de versões
    └── ...                        # Outros arquivos do plugin
```

### Regras de Pasta

- ❌ **NUNCA MEXER**: `smartwrite_publisher/src/` (código), `.obsidian/`, `node_modules/`, `dist/`, `.git/`
- ✏️ **EDITAR**: Apenas `smartwrite_publisher/src/` quando necessário (código)
- 📚 **GERENCIAR**: `_ docs/`, `_ skills/`, README.md, CHANGELOG.md, .release-history.json
- 🔒 **APENAS LER**: `_ BKPs/` (apenas para referência)

---

## 🔄 Rotinas de Automação

### A Automação dos 5 Passos

**OBJETIVO**: Toda mudança em `src/` dispara automaticamente 5 passos (sem intervenção manual).

#### Os 5 Passos (em ordem)

1. **TESTAR & REFATORAR** → `npm run build` (TypeScript compilation)
2. **BACKUP** → Cria `.tar.gz` com snapshot do código
3. **INCREMENT VERSION** → Aumenta patch (0.3.4 → 0.3.5)
4. **UPDATE VAULT** → Copia bundle compilado para `.obsidian/plugins/smartwrite-publisher/`
5. **UPDATE DOCS** → Atualiza `.release-history.json`

#### Como Usar

**Opção A: Daemon Contínuo (Recomendado)**

```bash
cd smartwrite_publisher
npm start
# Fica aguardando mudanças em src/
# Quando detecta mudança, executa 5 passos automaticamente
```

**Opção B: Manual Único**

```bash
cd smartwrite_publisher
npm run release
# Executa 5 passos uma vez
```

#### Exemplo de Fluxo

```
Terminal 1:
$ npm start
[Aguardando mudanças em src/...]

Terminal 2:
$ vim src/converter.ts
[Salva arquivo...]

Terminal 1 (Detecta automaticamente):
[MUDANÇA DETECTADA]
[1/5] TESTAR & REFATORAR... ✓
[2/5] BACKUP... ✓
[3/5] INCREMENT VERSION... ✓
[4/5] UPDATE VAULT... ✓
[5/5] UPDATE DOCS... ✓
[ROTINA COMPLETA]

Terminal 1 (Aguardando próximas mudanças...):
```

### Documentação Detalhada

Para usar a automação: ver `AUTOMATION_6_STEPS.md`

### GitHub (Fora de Automação Atualmente)

GitHub push foi REMOVIDO da automação por enquanto (será resolvido depois). Commits ficam locais, push manual se necessário.

---

## 🏗️ Decisões de Arquitetura

### 1. Formato de Envio para Substack (v1.0.0)

**Decisão**: Tiptap JSON (formato rico)

**Por quê**:

- Após investigações e refatoração, o formato Tiptap JSON foi implementado com sucesso.
- O plugin agora converte Markdown do Obsidian para Tiptap JSON, que é o formato nativo da API do Substack.

**Código**:

```typescript
// src/converter.ts
// A lógica de conversão Markdown -> Tiptap JSON reside no módulo converter.ts
export function convertToTiptapJson(markdown: string): TiptapDocument {
	// ... lógica de conversão ...
}
```

**Field de envio**: `bodyJson` (envia a estrutura Tiptap JSON)

### 2. Arquitetura Modular

**Decisão**: Separação clara de responsabilidades

**Estrutura**:

- `SubstackClient.ts` → HTTP requests (abstração de rede)
- `SubstackPayloadBuilder.ts` → Montar payload JSON (validação)
- `Converter.ts` → Transformação de formato (markdown → texto)
- `View.ts` → UI do plugin (React/Svelte)
- `Logger.ts` → Logs estruturados

**Benefício**: Fácil testar/debugar cada componente independente.

### 3. Sistema de Logs

**Decisão**: Logger centralizado com estrutura

```typescript
logger.info("Publicando nota...");
logger.warn("Campo obrigatório ausente");
logger.error("Falha ao conectar com Substack");
```

**Benefício**: Debugging mais fácil, histórico de operações.

### 4. Versionamento SemVer

**Decisão**: Versão oficial `1.0.0` (SemVer)

**Arquivos sincronizados**:

- `manifest.json` (plugin metadata)
- `package.json` (npm metadata)
- `versions.json` (histórico de versões mínimas do Obsidian)
- `CHANGELOG.md` (histórico estruturado)
- `README.md` (versão atual)

**Benefício**: Versão única de verdade, sincronizada em todos os locais.

### 5. Backups Consolidados

**Decisão**: Todos em `_ BKPs/` (Google Drive)

**Formato**: `.tar.gz` (melhor compressão que ZIP, padrão em Node.js)

**Retenção**: Todos os backups são guardados (histórico completo)

**Localização única**: `/Users/zander/.../_ smartwrite_publisher/_ BKPs/`

---

## 🛠️ Como Trabalhar neste Projeto

### Antes de Começar

1. Leia `COWORK_SETUP.md` (você está aqui) ✓
2. Entenda a pasta structure
3. Entenda os 5 passos de automação

### Ao Fazer Mudança no Código

1. Edite `src/`
2. Mantenha `npm start` rodando em Terminal 1
3. Mudanças são detectadas automaticamente
4. 5 passos executam sozinhos

### Ao Testar

1. Mude código em `src/`
2. Automação compila e copia para `.obsidian/`
3. Recarregue plugin em Obsidian (Ctrl+R)
4. Teste manualmente

### Se Algo Quebrar

1. Ver logs: `logger.ts` printa mensagens detalhadas
2. Ver DEBUG_EMPTY_POSTS.md para debugging específico
3. Rollback: use backup em `_ BKPs/`

### Documentação para Atualizar

- `CHANGELOG.md` - Adicionar entrada v0.3.X (descrição do que mudou)
- `README.md` - Atualizar tabela de versões se necessário
- `.release-history.json` - Automático (não editar manualmente)

---

## 📊 Checklist para Nova Sessão

Zander preparou o projeto assim para você:

- [x] Código compilando (v1.0.0)
- [x] Backups consolidados em `_ BKPs/`
- [x] Documentação sem redundâncias (`_ docs/`)
- [x] Automação dos 5 passos funcionando
- [x] Obsidian vault atualizado para v0.3.4
- [x] Skills configurados para Cowork
- [x] GitHub configurado (push manual por enquanto)

### Seu Próximo Passo

1. Testar v0.3.4 no Obsidian (formato plain markdown)
2. Se posts chegarem com conteúdo: ✅ Problema resolvido!
3. Se ainda vazios: Implementar logging em `SubstackPayloadBuilder.ts` para ver o que está sendo enviado

---

## 📞 Referências Rápidas

| Necessidade             | Arquivo                 |
| ----------------------- | ----------------------- |
| Como usar automação     | `AUTOMATION_6_STEPS.md` |
| Debugar posts vazios    | `DEBUG_EMPTY_POSTS.md`  |
| Roadmap futuro          | `ROADMAP.md`            |
| Histórico de versões    | `VERSIONING_PHASES.md`  |
| Procedimento de release | `VERSIONING_STEPS.md`   |

---

**Documento preparado por**: Zander em 01/02/2026
**Para sessão**: Claude Cowork
**Status do projeto**: v1.0.0 (Lançamento Oficial)
