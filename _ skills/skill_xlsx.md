# Skill: XLSX

**Criação, edição e análise de planilhas Excel.**

---

## Descrição

Skill para trabalhar com arquivos de planilha (.xlsx, .xlsm, .csv, .tsv) incluindo:

- Criação de novas planilhas com fórmulas e formatação
- Leitura e análise de dados
- Modificação de planilhas existentes preservando fórmulas
- Análise de dados e visualização
- Recálculo de fórmulas

---

## Triggers

O skill é ativado quando detecta:

- `Excel`, `spreadsheet`, `.xlsx`
- `data table`, `budget`, `financial model`
- `chart`, `graph`, `tabular data`, `xls`

---

## Quick Start

### Leitura com Pandas

```python
import pandas as pd

# Ler Excel
df = pd.read_excel('arquivo.xlsx')  # Padrão: primeira aba
all_sheets = pd.read_excel('arquivo.xlsx', sheet_name=None)  # Todas as abas

# Analisar
df.head()      # Preview
df.info()      # Info das colunas
df.describe()  # Estatísticas

# Escrever Excel
df.to_excel('saida.xlsx', index=False)
```

### Criação com openpyxl

```python
from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws['A1'] = 'Título'
ws['A2'] = 42
wb.save('arquivo.xlsx')
```

---

## Padrões para Modelos Financeiros

### Código de Cores (Padrão da Indústria)

| Cor                           | Uso                                              |
| ----------------------------- | ------------------------------------------------ |
| **Azul (0,0,255)**            | Inputs hardcoded, números que o usuário alterará |
| **Preto (0,0,0)**             | TODAS as fórmulas e cálculos                     |
| **Verde (0,128,0)**           | Links de outras abas do mesmo workbook           |
| **Vermelho (255,0,0)**        | Links externos para outros arquivos              |
| **Fundo Amarelo (255,255,0)** | Premissas-chave que precisam de atenção          |

### Formatação de Números

| Tipo        | Formato                                  |
| ----------- | ---------------------------------------- |
| Anos        | Texto ("2024" não "2,024")               |
| Moeda       | $#,##0; especificar unidades nos headers |
| Zeros       | Mostrar como "-"                         |
| Percentuais | 0.0% (uma casa decimal)                  |
| Múltiplos   | 0.0x para múltiplos de valuation         |
| Negativos   | Parênteses (123) não -123                |

### Regras de Fórmulas

1. **Premissas separadas** — Colocar taxas de crescimento, margens, múltiplos em células separadas
2. **Usar referências** — `=B5*(1+$B$6)` ao invés de `=B5*1.05`
3. **Zero erros** — Nenhum #REF!, #DIV/0!, #VALUE!, #N/A, #NAME?
4. **Documentar fontes** — Comentar hardcodes com "Source: [Sistema], [Data], [Referência]"

---

## Recálculo de Fórmulas

O skill inclui um script para recalcular fórmulas usando LibreOffice:

```bash
python scripts/recalc.py arquivo.xlsx saida.xlsx
```

**Requisito:** LibreOffice instalado

---

## Operações Comuns

### Criar Planilha com Fórmulas

```python
from openpyxl import Workbook

wb = Workbook()
ws = wb.active

# Headers
ws['A1'] = 'Item'
ws['B1'] = 'Preço'
ws['C1'] = 'Quantidade'
ws['D1'] = 'Total'

# Dados
ws['A2'] = 'Produto A'
ws['B2'] = 100
ws['C2'] = 5
ws['D2'] = '=B2*C2'

# Fórmula de soma
ws['D5'] = '=SUM(D2:D4)'

wb.save('vendas.xlsx')
```

### Ler e Analisar

```python
import pandas as pd

# Ler todas as abas
sheets = pd.read_excel('relatorio.xlsx', sheet_name=None)

for nome, df in sheets.items():
    print(f"--- {nome} ---")
    print(df.describe())
```

### Formatar Células

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
ws = wb.active

# Estilo de header
header_font = Font(bold=True, color='FFFFFF')
header_fill = PatternFill(start_color='4472C4', fill_type='solid')

ws['A1'] = 'Header'
ws['A1'].font = header_font
ws['A1'].fill = header_fill

wb.save('formatado.xlsx')
```

---

## Bibliotecas Python

| Biblioteca     | Uso                                     |
| -------------- | --------------------------------------- |
| **pandas**     | Análise de dados, manipulação, I/O      |
| **openpyxl**   | Criação/edição de .xlsx com fórmulas    |
| **xlsxwriter** | Criação de .xlsx com gráficos avançados |
| **xlrd**       | Leitura de .xls legado                  |

---

## Estrutura do Skill

```
xlsx/
├── SKILL.md           # Instruções principais
└── scripts/
    └── recalc.py      # Recálculo de fórmulas via LibreOffice
```

---

_Skill da biblioteca padrão Anthropic_
