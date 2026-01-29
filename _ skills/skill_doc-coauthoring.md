# Skill: Doc Co-Authoring

**Workflow estruturado para co-autoria de documentação.**

---

## Descrição

Guia para workflow colaborativo de criação de documentos, ajudando usuários a:

- Transferir contexto eficientemente
- Refinar conteúdo através de iteração
- Verificar se o documento funciona para leitores

---

## Triggers

O skill é ativado quando detecta:

- `write a doc`, `draft a proposal`, `create a spec`
- `PRD`, `design doc`, `decision doc`, `RFC`
- `write up`, `documentation`, `technical spec`
- Início de tarefa substancial de escrita

---

## Estágios do Workflow

### Visão Geral

1. **Context Gathering** — Usuário fornece contexto enquanto Claude faz perguntas
2. **Refinement & Structure** — Construção iterativa de cada seção
3. **Reader Testing** — Testar o documento com Claude sem contexto

---

## Estágio 1: Coleta de Contexto

### Perguntas Iniciais

1. Que tipo de documento é este? (spec técnica, decision doc, proposta)
2. Quem é o público principal?
3. Qual o impacto desejado quando alguém ler?
4. Existe um template ou formato específico?
5. Outras restrições ou contexto?

### Info Dumping

Encoraje o usuário a fornecer todo o contexto disponível:

- Background do projeto/problema
- Discussões de equipe ou documentos relacionados
- Por que alternativas não estão sendo usadas
- Contexto organizacional (dinâmicas de equipe, incidentes passados)
- Pressões de timeline ou restrições
- Arquitetura técnica ou dependências
- Preocupações de stakeholders

**Dica:** O usuário não precisa se preocupar em organizar — apenas colocar tudo para fora.

### Modos de Fornecer Contexto

- Info dump stream-of-consciousness
- Apontar para canais ou threads de equipe
- Linkar documentos compartilhados
- Colar conteúdo relevante diretamente

---

## Estágio 2: Refinamento & Estrutura

### Workflow

1. **Propor estrutura** — Esboçar seções baseado no contexto coletado
2. **Iterar por seção**:
    - Brainstorm de pontos-chave
    - Rascunhar seção
    - Refinar com feedback
3. **Conectar seções** — Garantir fluxo lógico
4. **Polir** — Consistência de tom, formatação, clareza

### Técnicas de Brainstorming

- Listar todos os pontos relevantes para uma seção
- Priorizar por importância
- Identificar lacunas de informação
- Considerar objeções do público

### Padrões de Documento

| Tipo               | Seções Típicas                                            |
| ------------------ | --------------------------------------------------------- |
| **Technical Spec** | Context, Goals, Non-Goals, Design, Alternatives, Timeline |
| **Decision Doc**   | Context, Options, Recommendation, Risks, Implementation   |
| **PRD**            | Problem, Users, Solution, Success Metrics, Timeline       |
| **RFC**            | Summary, Motivation, Design, Drawbacks, Alternatives      |

---

## Estágio 3: Teste com Leitor

### Objetivo

Identificar "blind spots" — informações que o autor assume mas que não estão no documento.

### Processo

1. **Simular leitor sem contexto** — Iniciar nova conversa
2. **Pedir para resumir** — O documento comunica o que deveria?
3. **Fazer perguntas** — O leitor consegue responder perguntas-chave?
4. **Identificar confusões** — Onde o leitor fica perdido?
5. **Iterar** — Corrigir blind spots identificados

### Perguntas de Teste

- "Qual o objetivo principal deste documento?"
- "Quais são as principais decisões propostas?"
- "Quais riscos são mencionados?"
- "O que não está claro?"

---

## Dicas para Documentos Efetivos

### Estrutura

- **Começar com o porquê** — Contexto antes de detalhes
- **Hierarquia clara** — Headers, sub-headers, listas
- **Resumo executivo** — TL;DR no início
- **Call to action** — O que o leitor deve fazer?

### Escrita

- **Frases curtas** — Mais fáceis de processar
- **Voz ativa** — Mais direta e clara
- **Exemplos concretos** — Ilustram conceitos abstratos
- **Evitar jargão** — Ou definir quando necessário

### Formatação

- **Bullets para listas** — Mais fáceis de scanear
- **Tabelas para comparações** — Informação estruturada
- **Diagramas quando úteis** — Visualizar arquitetura
- **Links para detalhes** — Manter documento principal conciso

---

## Quando Usar Este Workflow

### Usar

- Documentos substanciais (>1 página)
- Múltiplos stakeholders
- Decisões importantes
- Informação técnica complexa
- Documentos que precisam "durar"

### Não Usar

- Notas rápidas
- Comunicação informal
- Documentos de referência simples
- Quando o usuário prefere freeform

---

## Estrutura do Skill

```
doc-coauthoring/
└── SKILL.md           # Workflow completo
```

---

_Skill da biblioteca padrão Anthropic_
