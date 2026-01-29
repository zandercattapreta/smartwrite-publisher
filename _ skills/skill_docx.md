# Skill: DOCX

**Criação, edição e análise de documentos Word.**

---

## Descrição

Skill para trabalhar com documentos profissionais (.docx) incluindo:

- Criação de novos documentos
- Modificação de conteúdo existente
- Trabalho com tracked changes
- Adição de comentários
- Preservação de formatação

---

## Triggers

O skill é ativado quando detecta:

- `Word`, `document`, `.docx`
- `report`, `letter`, `memo`, `manuscript`
- `essay`, `paper`, `article`, `writeup`, `documentation`

---

## Quick Reference

| Tarefa                     | Abordagem                               |
| -------------------------- | --------------------------------------- |
| Ler/analisar conteúdo      | `pandoc` ou descompactar XML            |
| Criar novo documento       | `docx-js` (JavaScript)                  |
| Editar documento existente | Descompactar → editar XML → recompactar |

---

## Leitura de Documentos

### Extração de Texto

```bash
# Com tracked changes
pandoc --track-changes=all documento.docx -o output.md

# Acesso ao XML bruto
python scripts/unpack.py documento.docx unpacked/
```

### Conversão para Imagens

```bash
soffice --headless --convert-to pdf documento.docx
pdftoppm -jpeg -r 150 documento.pdf pagina
```

---

## Criação de Documentos (JavaScript)

### Setup

```javascript
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    Header,
    Footer,
    AlignmentType,
    HeadingLevel,
} = require('docx')

const doc = new Document({
    sections: [
        {
            children: [
                /* conteúdo */
            ],
        },
    ],
})
Packer.toBuffer(doc).then((buffer) => fs.writeFileSync('doc.docx', buffer))
```

### Tamanho de Página

```javascript
// IMPORTANTE: docx-js usa A4 por padrão, não US Letter
sections: [
    {
        properties: {
            page: {
                size: {
                    width: 12240, // 8.5 polegadas em DXA
                    height: 15840, // 11 polegadas em DXA
                },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 polegada
            },
        },
        children: [
            /* conteúdo */
        ],
    },
]
```

### Tamanhos Comuns (DXA: 1440 = 1 polegada)

| Papel       | Largura | Altura |
| ----------- | ------- | ------ |
| US Letter   | 12,240  | 15,840 |
| A4 (padrão) | 11,906  | 16,838 |

---

## Elementos de Documento

### Parágrafos e Texto

```javascript
new Paragraph({
    children: [
        new TextRun({ text: 'Texto em negrito', bold: true }),
        new TextRun({ text: ' e normal' }),
    ],
})

// Heading
new Paragraph({
    text: 'Título',
    heading: HeadingLevel.HEADING_1,
})
```

### Tabelas

```javascript
new Table({
    rows: [
        new TableRow({
            children: [
                new TableCell({ children: [new Paragraph('Célula 1')] }),
                new TableCell({ children: [new Paragraph('Célula 2')] }),
            ],
        }),
    ],
})
```

### Listas

```javascript
new Paragraph({
    text: 'Item de lista',
    bullet: { level: 0 },
})
```

---

## Edição de Documentos Existentes

### Workflow

1. **Descompactar** o .docx (é um ZIP)
2. **Editar** os arquivos XML internos
3. **Recompactar** em novo .docx

### Estrutura Interna

```
documento.docx (ZIP)/
├── [Content_Types].xml
├── _rels/
│   └── .rels
├── word/
│   ├── document.xml       # Conteúdo principal
│   ├── styles.xml         # Estilos
│   ├── settings.xml       # Configurações
│   └── media/             # Imagens
└── docProps/
    ├── core.xml           # Metadados
    └── app.xml            # Propriedades do app
```

### Scripts de Manipulação

```python
# Descompactar
import zipfile
with zipfile.ZipFile('documento.docx', 'r') as zip_ref:
    zip_ref.extractall('unpacked/')

# Recompactar
with zipfile.ZipFile('novo.docx', 'w') as zipf:
    for root, dirs, files in os.walk('unpacked/'):
        for file in files:
            path = os.path.join(root, file)
            arcname = os.path.relpath(path, 'unpacked/')
            zipf.write(path, arcname)
```

---

## Bibliotecas

| Biblioteca      | Linguagem  | Uso                     |
| --------------- | ---------- | ----------------------- |
| **docx-js**     | JavaScript | Criação de documentos   |
| **python-docx** | Python     | Leitura/criação simples |
| **pandoc**      | CLI        | Conversão de formatos   |

---

## Instalação

```bash
# docx-js (Node.js)
npm install -g docx

# python-docx
pip install python-docx

# pandoc
apt install pandoc  # ou brew install pandoc
```

---

## Estrutura do Skill

```
docx/
├── SKILL.md           # Instruções principais
└── scripts/
    ├── unpack.py      # Descompactar .docx
    ├── pack.py        # Recompactar .docx
    └── utilities.py   # Funções auxiliares
```

---

_Skill da biblioteca padrão Anthropic_
