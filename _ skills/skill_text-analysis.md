# Skill: Text Analysis

**Análise de legibilidade de textos usando 10 fórmulas padrão da indústria.**

---

## Descrição

Skill para análise abrangente de legibilidade textual, utilizando 10 fórmulas reconhecidas internacionalmente. Gera relatórios detalhados com métricas, interpretações e recomendações de melhoria.

---

## Triggers

O skill é ativado quando detecta:

- `readability`, `text analysis`, `reading level`
- `grade level`, `Flesch`, `Gunning Fog`, `SMOG`
- `Coleman-Liau`, `Dale-Chall`, `Linsear`
- `legibilidade`, `analyze text complexity`
- `document readability`, `writing assessment`

---

## Casos de Uso

1. Analisar legibilidade/complexidade de textos
2. Gerar relatórios de readability
3. Avaliar nível de leitura (grade level)
4. Avaliar acessibilidade de documentos
5. Comparar dificuldade entre documentos

---

## Quick Start

```python
# Executar o script de análise
python scripts/analyze_readability.py <arquivo> [idioma]

# Exemplos:
python scripts/analyze_readability.py documento.md        # Inglês
python scripts/analyze_readability.py documento.md pt     # Português
```

---

## 10 Métodos de Readability

### Métodos em Inglês (8)

| #   | Método                   | Fórmula                                                  | Mede                                  | Melhor Para         |
| --- | ------------------------ | -------------------------------------------------------- | ------------------------------------- | ------------------- |
| 1   | **Flesch Reading Ease**  | `206.835 - (1.015 × ASL) - (84.6 × ASW)`                 | Score 0-100 (maior = mais fácil)      | Avaliação geral     |
| 2   | **Flesch-Kincaid Grade** | `(0.39 × ASL) + (11.8 × ASW) - 15.59`                    | Nível escolar EUA                     | Docs governamentais |
| 3   | **Gunning Fog Index**    | `0.4 × (ASL + PHW)`                                      | Anos de educação                      | Escrita corporativa |
| 4   | **SMOG Index**           | `1.043 × √(polysyllables × 30/sentences) + 3.1291`       | Grade level (100% compreensão)        | Saúde/Médico        |
| 5   | **Coleman-Liau Index**   | `(0.0588 × L) - (0.296 × S) - 15.8`                      | Grade level (sem contagem de sílabas) | Avaliação rápida    |
| 6   | **ARI**                  | `(4.71 × chars/words) + (0.5 × words/sentences) - 21.43` | Grade level (sem contagem de sílabas) | Docs técnicos       |
| 7   | **Dale-Chall**           | `(0.1579 × PDW) + (0.0496 × ASL) [+3.6365 se PDW>5%]`    | Dificuldade de vocabulário            | Material educativo  |
| 8   | **Linsear Write**        | Easy×1 + Hard×3 ÷ sentences, depois ajuste               | Grade level                           | Manuais técnicos    |

### Métodos para Português/Línguas Românicas (2 adicionais)

| #   | Método                      | Fórmula                                             | Melhor Para                   |
| --- | --------------------------- | --------------------------------------------------- | ----------------------------- |
| 9   | **Flesch Português (IFLP)** | `248.835 - (1.015 × ASL) - (84.6 × ASW)`            | Textos em português           |
| 10  | **Índice Gulpease**         | `89 + ((300 × sentences) - (10 × letters)) ÷ words` | Italiano, português, espanhol |

### Variáveis-Chave

- **ASL** = Average Sentence Length (palavras ÷ sentenças)
- **ASW** = Average Syllables per Word (sílabas ÷ palavras)
- **PHW** = Percentage of Hard Words (3+ sílabas × 100 ÷ palavras)
- **PDW** = Percentage of Difficult Words (não na lista Dale-Chall)
- **L** = Letras por 100 palavras
- **S** = Sentenças por 100 palavras

---

## Interpretação dos Scores

### 1. Flesch Reading Ease

| Score  | Dificuldade           | Nível         |
| ------ | --------------------- | ------------- |
| 90-100 | Muito Fácil           | 5º ano        |
| 80-89  | Fácil                 | 6º ano        |
| 70-79  | Razoavelmente Fácil   | 7º ano        |
| 60-69  | Padrão                | 8º-9º ano     |
| 50-59  | Razoavelmente Difícil | Ensino Médio  |
| 30-49  | Difícil               | Faculdade     |
| 0-29   | Muito Difícil         | Pós-graduação |

### 2-6, 8. Grade Level (FKGL, Fog, SMOG, CLI, ARI, Linsear)

| Score | Interpretação        |
| ----- | -------------------- |
| ≤6    | Fundamental          |
| 7-8   | Ensino Médio inicial |
| 9-12  | Ensino Médio         |
| 13-16 | Faculdade            |
| ≥17   | Pós-graduação        |

### 7. Dale-Chall

| Score   | Nível            |
| ------- | ---------------- |
| ≤4.9    | 4º ano ou abaixo |
| 5.0-5.9 | 5º-6º ano        |
| 6.0-6.9 | 7º-8º ano        |
| 7.0-7.9 | 9º-10º ano       |
| 8.0-8.9 | 11º-12º ano      |
| 9.0-9.9 | Faculdade        |
| ≥10     | Pós-graduação    |

### 9. Flesch Português (IFLP)

| Score  | Dificuldade   |
| ------ | ------------- |
| 75-100 | Muito Fácil   |
| 50-74  | Fácil         |
| 25-49  | Difícil       |
| 0-24   | Muito Difícil |

### 10. Índice Gulpease

| Score  | Fundamental | Ensino Médio | Faculdade |
| ------ | ----------- | ------------ | --------- |
| <80    | Difícil     | Difícil      | Difícil   |
| 80-89  | Fácil       | Difícil      | Difícil   |
| 90-100 | Fácil       | Fácil        | Fácil     |

---

## Template de Relatório

```markdown
# READABILITY REPORT

## [Título do Documento]

**Data da Análise:** [Data]

---

## SUMÁRIO EXECUTIVO

[Avaliação geral em 1-2 sentenças]

---

## ESTATÍSTICAS BÁSICAS

| Métrica                         | Valor |
| ------------------------------- | ----- |
| Total de Palavras               | X     |
| Total de Sentenças              | X     |
| Total de Parágrafos             | X     |
| Palavras Complexas (3+ sílabas) | X     |
| Palavras Fáceis (1-2 sílabas)   | X     |
| Palavras Difíceis (Dale-Chall)  | X     |
| Tempo de Leitura                | X min |

---

## SCORES DE LEGIBILIDADE (10 Métodos)

### Métodos em Inglês

| #   | Métrica              | Score | Interpretação |
| --- | -------------------- | ----- | ------------- |
| 1   | Flesch Reading Ease  | X     | [Dificuldade] |
| 2   | Flesch-Kincaid Grade | X     | [Nível]       |
| 3   | Gunning Fog Index    | X     | [Nível]       |
| 4   | SMOG Index           | X     | [Nível]       |
| 5   | Coleman-Liau Index   | X     | [Nível]       |
| 6   | ARI                  | X     | [Nível]       |
| 7   | Dale-Chall Score     | X     | [Nível]       |
| 8   | Linsear Write        | X     | [Nível]       |

### Métodos Português/Romance (se aplicável)

| #   | Métrica                 | Score | Interpretação |
| --- | ----------------------- | ----- | ------------- |
| 9   | Flesch Português (IFLP) | X     | [Dificuldade] |
| 10  | Índice Gulpease         | X     | [Nível]       |

---

## PONTOS FORTES

- [Aspecto positivo 1]
- [Aspecto positivo 2]

## RECOMENDAÇÕES

- [Melhoria 1]
- [Melhoria 2]

---

## QUAL FÓRMULA USAR?

| Propósito          | Recomendada           |
| ------------------ | --------------------- |
| Inglês geral       | Flesch-Kincaid        |
| Saúde/Médico       | SMOG                  |
| Docs técnicos      | ARI ou Linsear Write  |
| Material educativo | Dale-Chall            |
| Português          | Flesch PT ou Gulpease |
| Avaliação rápida   | Coleman-Liau ou ARI   |

---

## ADEQUAÇÃO AO PÚBLICO

- ✅ [Público adequado]
- ⚠️ [Pode desafiar]
```

---

## Estrutura do Skill

```
text-analysis/
├── SKILL.md                         # Instruções principais
├── scripts/
│   └── analyze_readability.py       # Script com 10 métricas
└── references/
    └── readability_formulas.md      # Referência completa das fórmulas
```

---

## Qual Fórmula Usar?

| Propósito             | Fórmula Recomendada        |
| --------------------- | -------------------------- |
| Texto geral em inglês | Flesch-Kincaid Grade Level |
| Saúde/Médico          | SMOG Index                 |
| Documentação técnica  | ARI ou Linsear Write       |
| Material educacional  | Dale-Chall                 |
| Texto em português    | Flesch PT-BR ou Gulpease   |
| Avaliação rápida      | Coleman-Liau ou ARI        |

---

## Dicas para Melhorar Legibilidade

1. **Encurtar sentenças** — média de 15-20 palavras
2. **Usar palavras simples** — preferir 1-2 sílabas
3. **Evitar jargão** — usar alternativas comuns
4. **Usar voz ativa** — "A equipe completou" vs "Foi completado pela equipe"
5. **Quebrar parágrafos** — usar espaço em branco
6. **Ler em voz alta** — se tropeçar, leitores também tropeçarão

---

## Referências

- Flesch, R. (1948). "A New Readability Yardstick"
- Kincaid, J.P. et al. (1975). "Derivation of New Readability Formulas"
- Gunning, R. (1952). "The Technique of Clear Writing"
- McLaughlin, G.H. (1969). "SMOG Grading"
- Coleman, M. & Liau, T.L. (1975). "A computer readability formula"
- Smith, E.A. & Senter, R.J. (1967). "Automated Readability Index"
- Dale, E. & Chall, J. (1948/1995). "A Formula for Predicting Readability"
- Martins, T.B.F. et al. (1996). "Readability formulas for Brazilian Portuguese"
- Lucisano, P. & Piemontese, M.E. (1988). "GULPEASE"

---

_Skill atualizado em Janeiro 2026 — 10 métodos de readability_
