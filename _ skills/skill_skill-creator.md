# Skill Creator

**Tipo:** Workflow
**Formato:** Guia interativo
**Trigger:** `/skill-creator`, criar skill, novo skill, atualizar skill

## Descrição

Guia estruturado para criar skills efetivos que estendem as capacidades do Claude. Skills são pacotes modulares que fornecem conhecimento especializado, workflows e integrações de ferramentas para domínios específicos.

## Quando Usar

- Criar um novo skill do zero
- Atualizar ou melhorar um skill existente
- Empacotar funcionalidade repetitiva em formato reutilizável
- Documentar processos específicos de domínio

## Estrutura de um Skill

```
skill-name/
├── SKILL.md              # (obrigatório) Instruções principais
├── scripts/              # (opcional) Código executável
│   └── example.py
├── references/           # (opcional) Documentação de referência
│   └── docs.md
└── assets/               # (opcional) Arquivos para output
    └── template.xlsx
```

## Componentes

### SKILL.md (Obrigatório)

O arquivo principal contém:

**Frontmatter YAML:**
```yaml
---
name: skill-name
description: |
  Descrição clara do que o skill faz e quando deve ser usado.

  MANDATORY TRIGGERS: palavras-chave que ativam o skill

  Use when: (1) Situação 1, (2) Situação 2, ...
---
```

**Body Markdown:**
- Instruções de uso
- Workflow passo-a-passo
- Templates e exemplos
- Referências a recursos bundled

### Scripts (Opcional)

Código Python/Bash para tarefas que:
- São repetitivas e reescritas frequentemente
- Requerem precisão determinística
- Envolvem cálculos complexos

**Exemplo:** `scripts/analyze_readability.py`

### References (Opcional)

Documentação que Claude deve consultar durante o trabalho:
- Schemas de dados
- Documentação de APIs
- Guias de domínio específico
- Tabelas de referência

**Exemplo:** `references/readability_formulas.md`

### Assets (Opcional)

Arquivos usados no output final (não carregados no contexto):
- Templates (XLSX, PPTX, DOCX)
- Imagens e logos
- Boilerplate code

**Exemplo:** `assets/report_template.xlsx`

## Processo de Criação

### 1. Entender o Skill

Perguntas a responder:
- Qual funcionalidade o skill deve suportar?
- Quais são exemplos concretos de uso?
- O que um usuário diria para ativar este skill?

### 2. Planejar Recursos

Para cada exemplo de uso, identificar:
- Scripts necessários para tarefas repetitivas
- Referências para informação de domínio
- Assets para templates e outputs

### 3. Inicializar o Skill

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

O script cria:
- Diretório do skill
- SKILL.md template
- Pastas scripts/, references/, assets/

### 4. Implementar Recursos

1. Criar scripts e testá-los
2. Documentar referências
3. Adicionar assets necessários
4. Escrever SKILL.md com instruções claras

### 5. Empacotar o Skill

```bash
scripts/package_skill.py <path/to/skill-folder> [output-dir]
```

Gera arquivo `.skill` (ZIP) para distribuição.

## Princípios de Design

### Concisão

O contexto é um recurso compartilhado. Incluir apenas:
- Informação que Claude não possui
- Exemplos concisos ao invés de explicações longas
- Referências para detalhes extensos

### Progressive Disclosure

Três níveis de carregamento:
1. **Metadata** (~100 palavras) — sempre no contexto
2. **SKILL.md body** (<5k palavras) — quando skill ativa
3. **Recursos** — sob demanda

### Graus de Liberdade

| Liberdade | Quando Usar | Formato |
|-----------|-------------|---------|
| Alta | Múltiplas abordagens válidas | Instruções em texto |
| Média | Padrão preferido com variações | Pseudocódigo ou scripts parametrizados |
| Baixa | Operações frágeis, consistência crítica | Scripts específicos |

## Padrões de Organização

### Guia com Referências

```markdown
# PDF Processing

## Quick start
[código básico]

## Advanced features
- **Form filling**: See [FORMS.md](references/FORMS.md)
- **API reference**: See [REFERENCE.md](references/REFERENCE.md)
```

### Organização por Domínio

```
bigquery-skill/
├── SKILL.md
└── references/
    ├── finance.md
    ├── sales.md
    └── product.md
```

### Condicionais

```markdown
## Creating documents
Use docx-js for new documents.

**For tracked changes**: See [REDLINING.md](references/REDLINING.md)
**For OOXML details**: See [OOXML.md](references/OOXML.md)
```

## O Que NÃO Incluir

- README.md
- INSTALLATION_GUIDE.md
- CHANGELOG.md
- Documentação para usuários humanos
- Informação sobre o processo de criação

Skills são para agentes de IA, não humanos.

## Exemplo: text-analysis Skill

```
text-analysis/
├── SKILL.md                           # Workflow de análise
├── scripts/
│   └── analyze_readability.py         # Script de 10 métricas
└── references/
    └── readability_formulas.md        # Fórmulas e interpretações
```

**SKILL.md highlights:**
- 10 métodos de readability documentados
- Workflow de análise em 4 passos
- Template de relatório
- Tabelas de interpretação

## Comandos Úteis

```bash
# Inicializar novo skill
scripts/init_skill.py my-skill --path ./skills/

# Validar e empacotar
scripts/package_skill.py ./skills/my-skill/

# Empacotar com diretório de saída
scripts/package_skill.py ./skills/my-skill/ ./dist/
```

## Iteração

Após usar o skill:
1. Identificar dificuldades ou ineficiências
2. Determinar melhorias em SKILL.md ou recursos
3. Implementar mudanças
4. Testar novamente

Skills evoluem com uso real.
