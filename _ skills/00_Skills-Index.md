# Skills Index

Catálogo de skills disponíveis para uso com Claude Code.

---

## Skills Disponíveis

| Skill                                     | Descrição                               | Triggers                         |
| ----------------------------------------- | --------------------------------------- | -------------------------------- |
| **[text-analysis](text-analysis.md)**     | Análise de legibilidade (10 métodos)    | readability, Flesch, Dale-Chall  |
| **[xlsx](xlsx.md)**                       | Criação e edição de planilhas Excel     | Excel, spreadsheet, .xlsx        |
| **[pdf](pdf.md)**                         | Manipulação de documentos PDF           | PDF, .pdf, form, merge           |
| **[docx](docx.md)**                       | Criação e edição de documentos Word     | Word, document, .docx            |
| **[pptx](pptx.md)**                       | Criação e edição de apresentações       | PowerPoint, presentation, slides |
| **[doc-coauthoring](doc-coauthoring.md)** | Workflow colaborativo para documentação | write docs, proposal, spec       |
| **[skill-creator](skill-creator.md)**     | Guia para criação de novos skills       | create skill, new skill          |

---

## Como Usar Skills

### Invocação Automática

Skills são ativados automaticamente quando o Claude detecta triggers relevantes na conversa.

### Invocação Manual

Use o comando slash para invocar um skill diretamente:

```
/skill-name
```

### Estrutura de um Skill

```
skill-name/
├── SKILL.md           # Instruções principais (obrigatório)
├── scripts/           # Scripts executáveis (opcional)
├── references/        # Documentação de referência (opcional)
└── assets/            # Templates e recursos (opcional)
```

---

## Criando Novos Skills

Para criar um novo skill, use o skill-creator:

1. Leia `skill-creator.md` para entender o processo
2. Use `init_skill.py` para inicializar a estrutura
3. Implemente o SKILL.md e recursos necessários
4. Use `package_skill.py` para empacotar

---

## Skills Personalizados

### text-analysis

Skill personalizado para análise de legibilidade de textos, com suporte a:

- 10 métricas de readability
- Análise em inglês e português
- Relatórios detalhados

Localização: `/user-data/uploads/text-analysis/`

---

_Última atualização: Janeiro 2026_
