# Skill: PPTX

**Criação, edição e análise de apresentações PowerPoint.**

---

## Descrição

Skill para trabalhar com apresentações (.pptx) incluindo:
- Criação de novas apresentações
- Modificação de conteúdo existente
- Trabalho com layouts e masters
- Adição de comentários e speaker notes
- Extração de conteúdo

---

## Triggers

O skill é ativado quando detecta:
- `PowerPoint`, `presentation`, `.pptx`
- `slides`, `slide deck`, `pitch deck`
- `ppt`, `slideshow`, `deck`

---

## Quick Reference

| Tarefa | Abordagem |
|--------|-----------|
| Ler conteúdo | `markitdown` ou descompactar XML |
| Criar nova apresentação | Workflow `html2pptx` |
| Editar apresentação existente | Descompactar → editar OOXML → recompactar |
| Criar com template | Copiar template + modificar XML |

---

## Leitura de Apresentações

### Extração de Texto

```bash
# Converter para markdown
python -m markitdown apresentacao.pptx
```

### Acesso ao XML Bruto

```bash
python scripts/unpack.py apresentacao.pptx unpacked/
```

### Estrutura Interna

```
apresentacao.pptx (ZIP)/
├── ppt/
│   ├── presentation.xml           # Metadados e referências
│   ├── slides/
│   │   ├── slide1.xml             # Conteúdo dos slides
│   │   └── slide2.xml
│   ├── notesSlides/               # Speaker notes
│   ├── comments/                   # Comentários
│   ├── slideLayouts/              # Templates de layout
│   ├── slideMasters/              # Masters
│   ├── theme/                      # Tema e cores
│   └── media/                      # Imagens e mídia
└── docProps/
    └── core.xml                    # Metadados
```

---

## Criação de Apresentações (html2pptx)

### Workflow

1. **Ler documentação** completa de `html2pptx.md` e `css.md`
2. **Extrair biblioteca**:
   ```bash
   mkdir -p html2pptx && tar -xzf html2pptx.tgz -C html2pptx
   ```
3. **Planejar apresentação**: direção estética, paleta de cores, tipografia
4. **Criar slides em HTML** seguindo as convenções
5. **Converter para PPTX**

### Estrutura HTML

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .slide { width: 960px; height: 540px; }
    .title { font-size: 48px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="slide">
    <h1 class="title">Título do Slide</h1>
    <p>Conteúdo do slide</p>
  </div>
</body>
</html>
```

---

## Extração de Tipografia e Cores

Para emular designs existentes:

1. **Ler arquivo de tema**: `ppt/theme/theme1.xml`
   - Cores: `<a:clrScheme>`
   - Fontes: `<a:fontScheme>`

2. **Examinar slides**: `ppt/slides/slide1.xml`
   - Fontes em uso: `<a:rPr>`
   - Cores aplicadas: elementos de estilo

3. **Buscar padrões**:
   ```bash
   grep -r "srgbClr" unpacked/ppt/
   grep -r "latin typeface" unpacked/ppt/
   ```

---

## Edição de Apresentações Existentes

### Workflow OOXML

1. **Descompactar** o .pptx
2. **Localizar** o arquivo XML relevante
3. **Editar** o XML preservando namespaces
4. **Recompactar** em novo .pptx

### Elementos Comuns em OOXML

```xml
<!-- Texto em slide -->
<a:t>Texto aqui</a:t>

<!-- Formatação de texto -->
<a:rPr lang="en-US" b="1" sz="2400">
  <a:solidFill>
    <a:srgbClr val="FF0000"/>
  </a:solidFill>
</a:rPr>

<!-- Imagem -->
<p:pic>
  <p:blipFill>
    <a:blip r:embed="rId2"/>
  </p:blipFill>
</p:pic>
```

---

## Bibliotecas Python

```python
from pptx import Presentation

# Criar nova apresentação
prs = Presentation()
slide_layout = prs.slide_layouts[0]  # Layout de título
slide = prs.slides.add_slide(slide_layout)

title = slide.shapes.title
title.text = "Título da Apresentação"

subtitle = slide.placeholders[1]
subtitle.text = "Subtítulo"

prs.save('apresentacao.pptx')
```

### Adicionar Imagem

```python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[5])  # Layout em branco
slide.shapes.add_picture('imagem.png', Inches(1), Inches(1), width=Inches(4))
```

### Adicionar Tabela

```python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[5])
table = slide.shapes.add_table(3, 3, Inches(1), Inches(1), Inches(6), Inches(2)).table

table.cell(0, 0).text = "Header 1"
table.cell(0, 1).text = "Header 2"
table.cell(1, 0).text = "Dado 1"
```

---

## Estrutura do Skill

```
pptx/
├── SKILL.md           # Instruções principais
├── html2pptx.md       # Workflow de criação
├── css.md             # Guia de estilos CSS
├── ooxml.md           # Referência OOXML
├── html2pptx.tgz      # Biblioteca de conversão
└── ooxml/
    └── scripts/
        ├── unpack.py  # Descompactar
        └── pack.py    # Recompactar
```

---

## Documentação Adicional

- **html2pptx.md** — Workflow completo para criação via HTML
- **css.md** — Guia de estilos CSS para slides
- **ooxml.md** — Referência técnica do formato OOXML

---

*Skill da biblioteca padrão Anthropic*
