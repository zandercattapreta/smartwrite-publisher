# SmartWrite Publisher - Definição do Projeto

Plugin para Obsidian.md que automatiza a publicação de notas para o Substack.

## Informações do Projeto

| Campo            | Valor                                                                                              |
| ---------------- | -------------------------------------------------------------------------------------------------- |
| **Nome**         | smartwrite-publisher                                                                               |
| **Versão Atual** | 0.1.8                                                                                              |
| **Repositório**  | [github.com/zandercpzed/smartwrite-publisher](https://github.com/zandercpzed/smartwrite-publisher) |
| **Autor**        | Zander Catta Preta                                                                                 |
| **Licença**      | MIT                                                                                                |
| **Plataforma**   | Desktop (macOS/Windows/Linux)                                                                      |

## Objetivo Principal

Permitir que usuários do Obsidian publiquem suas notas diretamente para o Substack, seja individualmente ou em lote, com extração automática de metadados e conversão de formato.

## Funcionalidades Principais

1. **Integração Nativa** - Plugin funciona na sidebar do Obsidian
2. **Processamento de Notas** - Lê nota ativa ou escaneia pastas específicas
3. **Extração de Metadados** - Utiliza YAML frontmatter para título, tags e classificações
4. **Conversão Markdown → HTML** - Transforma links internos e formatação para compatibilidade com Substack
5. **Automação de Publicação** - Criar rascunhos, publicar ao vivo ou agendar postagens
6. **Sugestão de Tags** - Gera hashtags baseadas nas propriedades da nota
7. **Histórico de Publicação** - Marca notas publicadas via metadados YAML

## Fora do Escopo

- Criação/geração de conteúdo
- Gestão de assinantes ou pagamentos
- Hospedagem de imagens (usa links existentes)
- Integração com plataformas além do Substack (fase inicial)

## Requisitos Técnicos

- **Runtime**: Obsidian.md instalado
- **Linguagem**: TypeScript
- **Build**: Node.js + esbuild
- **APIs**: Obsidian Plugin API + Substack (via cookies)

## Autenticação

O plugin utiliza injeção de cookies (`substack.sid`) para autenticação, evitando problemas com 2FA e mantendo a sessão do usuário de forma segura.
