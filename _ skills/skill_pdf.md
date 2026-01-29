# Skill: PDF

**Manipulação abrangente de documentos PDF.**

---

## Descrição

Toolkit completo para processamento de PDF incluindo:
- Extração de texto e tabelas
- Criação de novos PDFs
- Merge e split de documentos
- Preenchimento de formulários
- Manipulação de metadados

---

## Triggers

O skill é ativado quando detecta:
- `PDF`, `.pdf`
- `form`, `extract`, `merge`, `split`
- Qualquer operação com arquivos PDF

---

## Quick Start

```python
from pypdf import PdfReader, PdfWriter

# Ler um PDF
reader = PdfReader("documento.pdf")
print(f"Páginas: {len(reader.pages)}")

# Extrair texto
texto = ""
for page in reader.pages:
    texto += page.extract_text()
```

---

## Operações Básicas com pypdf

### Merge PDFs

```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

### Split PDF

```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"pagina_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

### Rotacionar Páginas

```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # 90 graus horário
writer.add_page(page)

with open("rotacionado.pdf", "wb") as output:
    writer.write(output)
```

### Extrair Metadados

```python
reader = PdfReader("documento.pdf")
meta = reader.metadata
print(f"Título: {meta.title}")
print(f"Autor: {meta.author}")
print(f"Assunto: {meta.subject}")
print(f"Criador: {meta.creator}")
```

---

## Extração de Texto e Tabelas com pdfplumber

```python
import pdfplumber

with pdfplumber.open("documento.pdf") as pdf:
    for page in pdf.pages:
        # Texto
        texto = page.extract_text()

        # Tabelas
        tabelas = page.extract_tables()
        for tabela in tabelas:
            for linha in tabela:
                print(linha)
```

---

## Preenchimento de Formulários

### Identificar Campos

```python
from pypdf import PdfReader

reader = PdfReader("formulario.pdf")
fields = reader.get_fields()

for field_name, field_data in fields.items():
    print(f"{field_name}: {field_data}")
```

### Preencher Campos

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("formulario.pdf")
writer = PdfWriter()
writer.append(reader)

writer.update_page_form_field_values(
    writer.pages[0],
    {"campo_nome": "João Silva", "campo_data": "01/01/2026"}
)

with open("preenchido.pdf", "wb") as output:
    writer.write(output)
```

---

## Criação de PDFs com reportlab

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("novo.pdf", pagesize=letter)
c.drawString(100, 750, "Olá, Mundo!")
c.drawString(100, 700, "Este é um PDF criado com Python.")
c.save()
```

---

## Bibliotecas Python

| Biblioteca | Uso |
|------------|-----|
| **pypdf** | Operações básicas (merge, split, rotate, forms) |
| **pdfplumber** | Extração de texto e tabelas |
| **reportlab** | Criação de PDFs do zero |
| **pdf2image** | Conversão para imagens |
| **PyMuPDF (fitz)** | Manipulação avançada |

---

## Conversão para Imagens

```bash
# Via poppler-utils
pdftoppm -jpeg -r 150 documento.pdf pagina

# Via ImageMagick
convert documento.pdf pagina.png
```

```python
from pdf2image import convert_from_path

images = convert_from_path('documento.pdf')
for i, image in enumerate(images):
    image.save(f'pagina_{i+1}.png', 'PNG')
```

---

## Estrutura do Skill

```
pdf/
├── SKILL.md           # Instruções principais
├── REFERENCE.md       # Referência avançada
├── FORMS.md           # Guia para formulários
└── scripts/
    ├── fill_fillable_fields.py
    └── extract_form_field_info.py
```

---

## Documentação Adicional

- **REFERENCE.md** — Features avançadas, bibliotecas JS, exemplos detalhados
- **FORMS.md** — Instruções específicas para preenchimento de formulários

---

*Skill da biblioteca padrão Anthropic*
