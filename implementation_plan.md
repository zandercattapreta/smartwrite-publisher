# Implementation Plan — Publisher: imagens, links, agendamento

**Data:** 2026-09-04  
**Escopo:** `smartwrite-publisher` v1.1.3  
**Fonte de verdade API:** `Casa do Zander/SmartWrite - Pipeline Substack.md`  
**Modo:** Desenvolvimento (APAE) — aguardando autorização

---

## [PROVA TÉCNICA]

1. `converter.ts` `convert()` → `convertToPlainMarkdown()` — manda markdown cru; caminho Tiptap/HTML está morto.
2. `SubstackPayloadBuilder.ts` — `draft_body` = string do markdown; sem `captionedImage`/`image2`.
3. Nenhum `/api/v1/image` em `src/substack/`.
4. `SubstackAdapter.capabilities.supportsScheduling = false`; `view.ts` botão Schedule `disabled`.
5. Create draft **sem** `audience: only_paid`.

---

## Objetivo

Plugin publica nota Obsidian no Substack com:
- imagens locais (`![[…]]`, `![](path)`, `[![[…]]](url)`)
- links clicáveis na imagem (`href` no `image2`)
- agendamento (`prepublish` + `scheduled_release`)
- regressão: texto-only draft continua OK

**Fora de escopo nesta leva:** Medium/WordPress; pipeline de blur/PSD (fica no vault); rewrite do plugin único `smartwrite/`.

---

## Fases

### Fase 1 — Imagens + ProseMirror (P0)

1. **`SubstackClient.uploadImage(dataUri)`**  
   `POST /api/v1/image` body `{ image: "data:image/...;base64,..." }` no host `{subdomain}.substack.com`.  
   Nunca logar cookie nem data-URI completo.

2. **`ImageResolver` (novo)**  
   Resolve path do vault (`App`/`vault`), lê binário → data-URI.  
   Aceita: `![[path]]`, `![](relativo)`, URLs http(s) (sem upload).

3. **`ProseMirrorBuilder` (novo ou evoluir `converter.ts`)**  
   Markdown → doc ProseMirror.  
   Imagens → nó `captionedImage` → `image2` com `src`, `width`, `height`, `bytes`, `type`, `alt`, `href?`, `imageSize: "large"`, `topImage`, etc. (contrato do doc).  
   Texto: paragraphs + mark `link`.  
   `draft_body` = **JSON.stringify(doc)** (string).

4. **Fluxo publish** (`view` → adapter):  
   parse → upload imagens → montar doc → createDraft (e opcional PUT body se API exigir 2 passos: create vazio + PUT — validar; doc usou create + PUT).

5. **Audience** default configurável; default série = `only_paid`.

### Fase 2 — Link na imagem

- Detectar `[![[path]]](href)` e `[![alt](img)](href)` → `attrs.href` no `image2`.

### Fase 3 — Agendamento (UI + API)

1. Ligar botão Schedule + date/time (BRT → UTC: 9h = `12:00:00.000Z`).
2. `GET .../prepublish?publish_date=ISO`
3. `POST .../scheduled_release` body `{ trigger_at, post_audience }`
4. `supportsScheduling: true`
5. Erros claros (cookie 401/403).

### Fase 4 — Batch + resiliência

- Batch existente: passar pelo mesmo pipeline de imagens.
- Opcional: schedule sequencial (N posts/dia, horário fixo) — **só se Fase 3 OK**.
- Retry em 429/502 (backoff 15–20s); progresso parcial.

### Fase 5 — Aceite (checklist do doc)

- [ ] Texto-only → draft OK  
- [ ] `![[imagem.jpg]]` → aparece no editor Substack  
- [ ] Imagem linkada → clique abre URL  
- [ ] Agendar amanhã 9h → Scheduled  
- [ ] Batch com imagens  
- [ ] Cookie expirado → erro claro  

---

## Arquivos previstos (tocar)

| Arquivo | Ação |
|---|---|
| `src/substack/SubstackClient.ts` | + uploadImage; PUT draft; schedule endpoints |
| `src/substack/SubstackAdapter.ts` | fluxo create/PUT; audience; schedule; capability |
| `src/substack/SubstackPayloadBuilder.ts` | draft_body = PM JSON string; audience |
| `src/substack/types.ts` | tipos image2 / schedule |
| `src/converter.ts` ou `src/substack/ProseMirrorBuilder.ts` | builder real |
| `src/substack/ImageResolver.ts` | novo |
| `src/view.ts` | Schedule UI; passar opções |
| `src/settings.ts` | audience default; timezone |
| `tests/` + vitest | **novo** (projeto hoje sem suite) |
| `package.json` | + vitest scripts |
| `CHANGELOG.md` | bump PATCH após aceite |

Estimativa: **> 2 arquivos** → gate APAE único para o plano inteiro das Fases 1–3. Fase 4 pode ser segundo gate.

---

## Plano de testes (máquina)

| Teste | Tipo | O quê |
|---|---|---|
| `ProseMirrorBuilder` | unit | texto; `![[a.jpg]]`; `[![[a.jpg]]](url)`; link inline |
| `ImageResolver` path parse | unit | wiki / md / absoluto vs relativo |
| `PayloadBuilder` | unit | `draft_body` é string JSON com `captionedImage` |
| `schedule payload` | unit | `trigger_at` ISO; audience |
| Adapter upload/schedule | integração mock `requestUrl` | POST image + scheduled_release paths/headers |

UI no Obsidian = aceite manual (Fase 5), **não** substitui vitest.

---

## Riscos

| Risco | Mitigação |
|---|---|
| API Substack muda | contrato do doc; validar Network tab se quebrar |
| GitHub remoto ≠ 1.1.3 | commits só locais / vault até alinhar remote |
| Cookie em log | strip logs de header Cookie e data-URI |
| `main.js` gitignored | build + deploy para vault Anotações |

---

## Deploy de teste

```bash
cd smartwrite-publisher
npm install
npm run build
# copiar main.js + styles.css + manifest.json → vault Anotações plugin dir
```

(Definir script `deploy` espelhando o do plugin único, se autorizado.)
