# Typography Inventory — 2026-05-18

> **Snapshot read-only** do uso de tipografia no iGreen Design System em
> 18 de maio de 2026. Catalogação completa: font-sizes, font-weights,
> line-heights, letter-spacings, font-families, custom features.
>
> **Sem recomendações de migração.** Este documento existe pra **descrever
> o estado atual**, não pra prescrever mudanças. Decisões de normalização
> ficam fora deste escopo.

---

## Sumário

- [1. Sumário executivo](#1-sumário-executivo)
- [2. Source of truth — `typography.ts`](#2-source-of-truth--typographyts)
- [3. Inventário por tipo de declaração](#3-inventário-por-tipo-de-declaração)
- [4. Inventário por área de uso](#4-inventário-por-área-de-uso)
- [5. Combinações compostas mais comuns](#5-combinações-compostas-mais-comuns)
- [6. Drift catalogado (arbitrary vs preset existente)](#6-drift-catalogado-arbitrary-vs-preset-existente)
- [7. Exceções intencionais](#7-exceções-intencionais)
- [8. Apêndices — listagens completas filepath:line](#8-apêndices--listagens-completas-filepathline)

---

## 1. Sumário executivo

### 1.1 Totais por categoria de declaração

| Categoria | Ocorrências totais | Valores únicos |
|---|---:|---:|
| Presets DS (`text-{role}-{scale}`) | ~1.280 | 23 |
| Arbitrary font-size (`text-[Npx]`, `text-[Nrem]`) | ~131 | 17 |
| Tailwind literal (`text-xs`, `text-sm`, etc.) | **4** | 3 |
| Font weights (`font-medium`, `font-semibold`, etc.) | ~93 | 4 |
| Line-height — preset (`leading-none`, `leading-relaxed`, etc.) | ~57 | 6 |
| Line-height — arbitrary (`leading-[1.3]`, `leading-[1.45]`, `leading-[1.5]`) | ~14 | 3 |
| Letter-spacing — preset (`tracking-wider`, `tracking-tight`, etc.) | ~55 | 4 |
| Letter-spacing — arbitrary (`tracking-[Nem]`) | ~23 | 5 |
| Font-family explícito (`font-mono`, `font-sans`) | ~8 | 2 |
| Inline styles (`style={{ fontSize/fontWeight/... }}`) | **0** | — |
| Custom features (`[font-variant-numeric:tabular-nums]`) | ~31 | 1 |
| **Total declarações tipográficas** | **~1.696** | — |

### 1.2 Distribuição por área × tipo

| Área | Total | Preset DS | Arbitrary | Literal | Inline |
|---|---:|---:|---:|---:|---:|
| `src/components/ui/` (iGreen tv()) | ~175 | 22 | 77 | 0 | 0 |
| `src/components/shadcn/` (adaptado) | ~80 | 26 | 29 | 3 | 0 |
| `src/preview/pages/*Doc.tsx` (DocPages) | ~1.000 | ~970 | ~25 | 1 | 0 |
| `src/preview/pages/ChatV2/` | ~95 | ~70 | ~25 | 0 | 0 |
| `src/preview/pages/ClientesShowcase/` | ~55 | ~40 | ~15 | 0 | 0 |
| `src/preview/pages/DashboardShowcase.tsx` | ~75 | ~50 | ~25 | 0 | 0 |
| `src/preview/components/` (DocLayout, etc.) | ~30 | ~30 | 0 | 0 | 0 |
| Showcases adicionais (AgentsPreview, etc.) | ~40 | ~30 | ~10 | 0 | 0 |

### 1.3 Top 10 valores mais usados (todas áreas)

| Rank | Valor | Ocorrências | Tipo |
|---:|---|---:|---|
| 1 | `text-paragraph-sm` | ~467 | preset DS |
| 2 | `text-code-sm` | ~277 | preset DS |
| 3 | `text-label-sm` | ~190 | preset DS |
| 4 | `text-label-xs` | ~127 | preset DS |
| 5 | `text-caption-sm` | ~68 | preset DS |
| 6 | `text-title-lg` | ~53 | preset DS |
| 7 | `font-semibold` | ~80 | weight |
| 8 | `text-[13px]` | ~45 | arbitrary |
| 9 | `tracking-wider` | ~50 | tracking preset |
| 10 | `text-[12.5px]` | ~22 | arbitrary decimal |

### 1.4 Insights chave

- **Presets DS dominam o uso geral** (~1.280 de ~1.696 declarações). Isso é saudável.
- **Componentes UI iGreen são a exceção** — usam mais arbitrary (77×) que preset (22×). Razão: foram construídos antes de existirem os presets `label-2xs`, `label-base`, `paragraph-base`, `caption-xs`, `subheading-strong-md/sm` (ver §6).
- **4 ocorrências de Tailwind literal** persistem (anomalias documentadas em §3.3).
- **Zero inline styles tipográficos** em todo o projeto — todos via className.
- **31 usos de `[font-variant-numeric:tabular-nums]`** concentrados em Dashboard, Kanban e ChatV2 — alinhamento de números.
- **Valores decimais** (`text-[12.5px]`, `text-[11.5px]`, `text-[10.5px]`, `text-[13.5px]`, `text-[14.5px]`) existem em ~30 lugares. Não há preset DS pra valores fracionários — são calibração visual fina.

---

## 2. Source of truth — `typography.ts`

Arquivo: [tokens/brands/default/semantic/typography.ts](../../tokens/brands/default/semantic/typography.ts)

### 2.1 Categorias e presets ativos

#### Display — fluid (clamp), hero sections

| Preset | font-size | line-height | weight | tracking |
|---|---|---|---|---|
| `display-2xl` | clamp(2.5rem → 4.75rem) | 1.1 | 700 (bold) | -0.02em |
| `display-xl` | clamp(2.25rem → 3.8125rem) | 1.1 | 700 (bold) | -0.02em |
| `display-lg` | clamp(2rem → 3.0625rem) | 1.15 | 600 (semibold) | -0.01em |
| `display-md` | clamp(1.75rem → 2.4375rem) | 1.15 | 600 (semibold) | -0.01em |

#### Heading — fluid (sm→xl) + estático (xs)

| Preset | font-size | line-height | weight | tracking |
|---|---|---|---|---|
| `heading-xl` | clamp(2.25rem → 3.5rem) | 1.15 | 500 (medium) | -0.01em |
| `heading-lg` | clamp(2rem → 3rem) | 1.2 | 500 (medium) | -0.01em |
| `heading-md` | clamp(1.75rem → 2.5rem) | 1.2 | 500 (medium) | -0.01em |
| `heading-sm` | clamp(1.5rem → 2rem) | 1.25 | 500 (medium) | -0.005em |
| `heading-xs` | 1.5rem (24px) | 2rem (32px) | 500 (medium) | 0em |

#### Title — estático, títulos de card/seção

| Preset | font-size | px | line-height | weight | tracking |
|---|---|---|---|---|---|
| `title-lg` | 1.25rem | **20px** | 1.75rem (28px) | 500 | 0em |
| `title-md` | 1rem | **16px** | 1.5rem (24px) | 500 | 0em |
| `title-sm` | 0.875rem | **14px** | 1.25rem (20px) | 500 | 0em |

#### Label — interactive (botões, inputs, tabs, nav)

| Preset | font-size | px | line-height | weight | tracking |
|---|---|---|---|---|---|
| `label-xl` | 1.5rem | **24px** | 2rem | 500 | -0.015em |
| `label-lg` | 1.125rem | **18px** | 1.5rem | 500 | -0.015em |
| `label-md` | 1rem | **16px** | 1.5rem | 500 | -0.011em |
| `label-sm` | 0.875rem | **14px** | 1.25rem | 500 | -0.006em |
| `label-xs` | 0.75rem | **12px** | 1rem | 500 | 0em |
| `label-2xs` ★ | 0.6875rem | **11px** | 0.875rem (14px) | 500 | 0em |
| `label-base` ★ | 0.8125rem | **13px** | 1.125rem (18px) | 500 | -0.003em |

#### Paragraph — texto corrido (peso 400)

| Preset | font-size | px | line-height | weight | tracking |
|---|---|---|---|---|---|
| `paragraph-xl` | 1.5rem | **24px** | 2rem | 400 | -0.015em |
| `paragraph-lg` | 1.125rem | **18px** | 1.5rem | 400 | -0.015em |
| `paragraph-md` | 1rem | **16px** | 1.5rem | 400 | -0.011em |
| `paragraph-sm` | 0.875rem | **14px** | 1.25rem | 400 | -0.006em |
| `paragraph-xs` | 0.75rem | **12px** | 1rem | 400 | 0em |
| `paragraph-base` ★ | 0.8125rem | **13px** | 1.125rem (18px) | 400 | -0.003em |

#### Caption — auxiliar (timestamps, metadados)

| Preset | font-size | px | line-height | weight | tracking |
|---|---|---|---|---|---|
| `caption-md` | 0.8125rem | **13px** | 1.125rem (18px) | 400 | 0em |
| `caption-sm` | 0.6875rem | **11px** | 0.875rem (14px) | 400 | 0em |
| `caption-xs` ★ | 0.625rem | **10px** | 0.75rem (12px) | 400 | 0em |

#### Subheading — sections (uppercase)

| Preset | font-size | px | line-height | weight | tracking |
|---|---|---|---|---|---|
| `subheading-md` | 1rem | **16px** | 1.5rem | 500 | 0.06em |
| `subheading-sm` | 0.875rem | **14px** | 1.25rem | 500 | 0.06em |
| `subheading-xs` | 0.75rem | **12px** | 1rem | 500 | 0.04em |
| `subheading-2xs` | 0.6875rem | **11px** | 0.75rem (12px) | 500 | 0.02em |
| `subheading-strong-md` ★ | 0.6875rem | **11px** | 0.875rem (14px) | **700** | 0.06em |
| `subheading-strong-sm` ★ | 0.625rem | **10px** | 0.75rem (12px) | **700** | 0.06em |

#### Code — monospace

| Preset | font-size | px | line-height | weight | tracking | family |
|---|---|---|---|---|---|---|
| `code-md` | 1rem | **16px** | 1.6 | 400 | 0em | mono |
| `code-sm` | 0.8125rem | **13px** | 1.6 | 400 | 0em | mono |

### 2.2 Presets ★ NOVOS

Adicionados recentemente (já existem no `typography.ts` mas adoção em
código ainda é parcial — ver §6):

- **`label-2xs`** — 11px medium. Casos: micro label, hint count, rail tooltip.
- **`label-base`** — 13px medium. Casos: button sm, dropdown item, input value, tab default.
- **`paragraph-base`** — 13px regular. Casos: body small, msg bubble, table cell, command item.
- **`caption-xs`** — 10px regular. Casos: micro caption (bubble meta, conv ID, history meta).
- **`subheading-strong-md`** — 11px bold + 0.06em tracking. Substitui `text-[11px] font-bold tracking-[0.06em] uppercase`.
- **`subheading-strong-sm`** — 10px bold + 0.06em tracking. Casos: chip counter, unread badge, header tab count.

### 2.3 Aliases removidos historicamente

Documentados nos comentários do `typography.ts`:

- `heading-2xs` — era duplicata de `title-lg` (ambos 20px/500/0em). Consumidores migrados.
- `body-*` — aliases legacy de `paragraph-*`. Sem consumidores.
- `overline-*` — aliases legacy de `subheading-*`. Sem consumidores.

### 2.4 Tabela cruzada — tamanho ↔ presets disponíveis

| px | Presets que cobrem |
|---:|---|
| 10 | `caption-xs`, `subheading-strong-sm` |
| 11 | `caption-sm`, `label-2xs`, `subheading-2xs`, `subheading-strong-md` |
| 12 | `label-xs`, `paragraph-xs`, `subheading-xs` |
| 13 | `caption-md`, `label-base`, `paragraph-base`, `code-sm` |
| 14 | `label-sm`, `paragraph-sm`, `subheading-sm`, `title-sm` |
| 16 | `label-md`, `paragraph-md`, `subheading-md`, `title-md`, `code-md` |
| 18 | `label-lg`, `paragraph-lg` |
| 20 | `title-lg` |
| 24 | `heading-xs`, `label-xl`, `paragraph-xl` |
| ≥32 (fluid) | `heading-*`, `display-*` |

**Sem preset para:** 10.5, 11.5, 12.5, 13.5, 14.5, 15, 17, 22, 26 px (valores arbitrários — ver §3.2 e §6.4).

---

## 3. Inventário por tipo de declaração

### 3.1 Presets DS em uso

#### Distribuição total

| Categoria | Total | Variantes em uso |
|---|---:|---|
| `paragraph-*` | 488 | sm (467), xs (14), md (14), lg (2), xl (1), base (0) |
| `label-*` | 319 | sm (190), xs (127), md (1), lg (1), xl (1), 2xs (0), base (0) |
| `code-*` | 278 | sm (277), md (1) |
| `caption-*` | 72 | sm (68), md (4), xs (0) |
| `title-*` | 60 | lg (53), md (8), sm (3) |
| `heading-*` | 11 | xs (8), md (4), lg (3), sm (3), xl (1) |
| `display-*` | 4 | xl (1), md (1), lg (1), 2xl (1) |
| `subheading-*` | 0 | — |

**Observação importante**: os presets ★ NOVOS (`label-2xs`, `label-base`,
`paragraph-base`, `caption-xs`, `subheading-strong-md/sm`) têm **0
ocorrências** de uso em código. Foram adicionados ao token system mas a
migração dos `text-[Npx]` arbitrary ainda não foi feita (ver §6).

#### Presets nunca usados

Foram declarados em `typography.ts` mas não aparecem em código:
- Todos os `subheading-*` (md, sm, xs, 2xs) — sections uppercase usam `text-label-xs uppercase tracking-wider` em vez do preset
- Todos os ★ NOVOS (label-2xs, label-base, paragraph-base, caption-xs, subheading-strong-md, subheading-strong-sm)

### 3.2 Arbitrary font-size (`text-[Npx]`, `text-[Nrem]`)

Agrupado por valor único e total cross-area:

| Valor | Total | ui/ | shadcn/ | preview/ | Preset DS equivalente |
|---|---:|---:|---:|---:|---|
| `text-[13px]` | **~45** | 21 | 18 | 6 | `label-base`, `paragraph-base`, `caption-md`, `code-sm` (todos 13px) |
| `text-[11px]` | **~35** | 9 | 2 | 24 | `caption-sm`, `label-2xs`, `subheading-2xs`, `subheading-strong-md` |
| `text-[12.5px]` | **~22** | 5 | 3 | 14 | — (não há preset 12.5px) |
| `text-[12px]` | **~26** | 10 | 1 | 15 | `label-xs`, `paragraph-xs`, `subheading-xs` |
| `text-[10px]` | **~19** | 6 | 3 | 10 | `caption-xs`, `subheading-strong-sm` |
| `text-[11.5px]` | **~10** | 3 | 0 | 7 | — |
| `text-[15px]` | **~7** | 2 | 0 | 5 | — |
| `text-[14px]` | **~6** | 1 | 0 | 5 | `label-sm`, `paragraph-sm` (mas line-heights diferem) |
| `text-[10.5px]` | **~7** | 2 | 0 | 5 | — |
| `text-[16px]` | **~5** | 2 | 0 | 3 | `label-md`, `paragraph-md`, `title-md` |
| `text-[26px]` | **~3** | 0 | 0 | 3 | — (Dashboard KPI) |
| `text-[17px]` | **~2** | 2 | 0 | 0 | — |
| `text-[18px]` | **~1** | 0 | 1 | 0 | `label-lg`, `paragraph-lg` |
| `text-[20px]` | **~1** | 0 | 0 | 1 | `title-lg` |
| `text-[22px]` | **~1** | 0 | 0 | 1 | — |
| `text-[24px]` | **~1** | 0 | 0 | 1 | `heading-xs`, `label-xl`, `paragraph-xl` |
| `text-[2rem]` | **~2** | 0 | 0 | 2 | — (~32px, abaixo do display-md mínimo) |
| `text-[0.8rem]` | **~1** | 0 | 1 | 0 | — (~12.8px, sem preset exato) |
| `text-[13.5px]` | **~2** | 1 | 0 | 1 | — |
| `text-[14.5px]` | **~1** | 1 | 0 | 0 | — |

**Total arbitrary**: ~197 ocorrências em 17 valores únicos.

### 3.3 Tailwind literal (anomalias)

**Total**: 4 ocorrências em 3 valores únicos — todas anomalias documentadas
(deveriam estar via preset DS ou explicitamente justificadas).

| Valor | Onde | Notas |
|---|---|---|
| `text-xs` | `src/preview/pages/PipelineMemoryDoc.tsx:205` | DocPage — provavelmente intencional pra label muito pequeno |
| `text-sm` | `src/components/shadcn/input.tsx:31` | Dentro de `file:` pseudo-element (input file selector) — file size do nativo do navegador |
| `text-sm` | `src/components/shadcn/input-group.tsx:76` | Mesmo padrão — `file:` pseudo |
| `text-sm` | `src/preview/pages/TransformTokensDoc.tsx:214` | DocPage — texto de exemplo de código |
| `text-3xl` | `src/preview/pages/ShowcasePageV2.tsx:770` | DocPage — heading de showcase |

> Os `text-sm` em `file:*` pseudo-elements (input file) são herdados do
> Shadcn original — costumam ser exceções razoáveis pra estilizar a UI
> nativa do navegador. Documentado, não bloqueia.

### 3.4 Font weights

| Valor | Total | Areas |
|---|---:|---|
| `font-semibold` | ~80 | ui (24), shadcn (11), preview (~45) |
| `font-bold` | ~35 | ui (18), shadcn (2), preview (~15) |
| `font-medium` | ~28 | ui (11), shadcn (10), preview (~7) |
| `font-normal` | ~4 | shadcn (3), preview (~1) |

**Pesos não usados (todos = 0):** `font-thin`, `font-extralight`,
`font-light`, `font-extrabold`, `font-black`.

### 3.5 Line-height

#### Presets (`leading-*` Tailwind)

| Valor | Total | Areas |
|---|---:|---|
| `leading-none` | ~27 | ui (18), shadcn (5), preview (4) |
| `leading-relaxed` | ~22 | preview (~21), shadcn (1) |
| `leading-loose` | ~8 | preview (~8) |
| `leading-tight` | ~3 | ui (1), shadcn (1), preview (1) |
| `leading-snug` | ~2 | ui (2) |
| `leading-normal` | 0 | — |

#### Arbitrary (`leading-[Nvalue]`)

| Valor | Total | Onde (sample) |
|---|---:|---|
| `leading-[1.5]` | 4 | `alert-dialog.tsx:120`, `input-group.tsx:100`, `textarea.tsx:27`, `page-header.styles.ts:27` |
| `leading-[1.3]` | 5 | `kanban.styles.ts:219`, `modal.styles.ts:84`, `add-view-modal.styles.ts:72/74/121` |
| `leading-[1.45]` | 5 | `add-view-modal.styles.ts:81/125`, `modal.styles.ts:91`, `kanban.styles.ts:231`, `message-bubble.styles.ts:11` |

### 3.6 Letter-spacing

#### Presets (`tracking-*` Tailwind)

| Valor | Total | Areas |
|---|---:|---|
| `tracking-wider` | ~50 | preview (~45), shadcn (5) |
| `tracking-tight` | ~3 | ui (1), shadcn (1), preview (1) |
| `tracking-normal` | 0 | — |
| `tracking-wide` | 0 | — |
| `tracking-tighter` | 0 | — |
| `tracking-widest` | 0 | — |

#### Arbitrary (`tracking-[Nvalue]`)

| Valor | Total | Onde |
|---|---:|---|
| `tracking-[0.02em]` | 8 | `sidebar.styles.ts` (5), `header.styles.ts` (1), `user-menu.tsx` (1), MenuSidebar tooltips |
| `tracking-[-0.01em]` | 6 | `page-header.styles.ts`, `panel.styles.ts`, `floating-panel.styles.ts`, `modal.styles.ts`, `add-view-modal.styles.ts`, `alert-dialog.tsx:105` |
| `tracking-[0.06em]` | 2 | `sidebar.styles.ts:315`, `filters-column.styles.ts:19` |
| `tracking-[0.01em]` | 4 | `label.tsx:13` (shadcn), `form-field.styles.ts:14`, `sidebar.styles.ts:125`, `clientes-showcase.styles.ts:11` |
| `tracking-[0.04em]` | 1 | `DashboardShowcase.tsx:707` |

### 3.7 Font-family explícito

| Valor | Total | Notas |
|---|---:|---|
| `font-mono` | ~5 | Code samples em DocPages |
| `font-sans` | ~3 | MenuSidebar/Header — provavelmente redundante (padrão herdado) |

### 3.8 Inline styles tipográficos

**Zero ocorrências** em todo o projeto:
- `style={{ fontSize: ... }}` → 0
- `style={{ fontWeight: ... }}` → 0
- `style={{ lineHeight: ... }}` → 0
- `style={{ letterSpacing: ... }}` → 0
- `style={{ fontFamily: ... }}` → 0

100% via `className`. Sinal positivo de disciplina arquitetural.

### 3.9 Custom features

#### `[font-variant-numeric:tabular-nums]`

**Total: 31 ocorrências.** Aplicado pra alinhar números em colunas (KPI
cards, table cells, badges com contadores, timestamps).

Distribuição:
- `DashboardShowcase.tsx` — 13 ocorrências (KPIs, totais)
- `Kanban/kanban.styles.ts` — 3
- `TabelaTeste/tabela-teste.styles.ts` — 4
- `ChatV2/components/ConversationListItem/` — 3 (unread badges, hora)
- `ChatV2/components/ConversationColumn/` — 1
- `ChatV2/components/DateSeparator/` — 1
- `ChatV2/components/FilterRow/` — 1
- `ChatV2/components/DetailsColumn/` — 1
- `ChatV2/components/MessageBubble/` — 1
- `ClientesShowcase/ClientesShowcase.tsx` — 1
- `ClientsKanbanPreview.tsx` — 1
- `KanbanDoc.tsx` — 2

#### `font-feature-settings`

**Zero ocorrências.**

---

## 4. Inventário por área de uso

### 4.1 `src/components/ui/` — Componentes iGreen (tv())

**18 arquivos `.styles.ts` + auxiliares. ~175 declarações tipográficas.**

| Componente | Padrão dominante | Notas |
|---|---|---|
| Avatar | `font-bold` + `text-[10/11/13/14px]` por size | Calibração proporcional ao círculo (L-014) |
| Button | `text-[13px] font-semibold leading-none` | Coberto por `label-base` (★ NOVO) |
| Chip | Mix `text-[10/11/12/13px]` + `font-semibold`/`font-bold` | Vários tiers conforme size |
| FormField | `text-[12.5px] font-semibold tracking-[0.01em]` (label) + `text-[11.5px]` (helper) | Sem preset exato pra 12.5px |
| Header | Diversos: `text-[10/11/13/15px]`, `font-semibold/bold` + tracking customizado | Maior diversidade tipográfica |
| MenuSidebar | `text-[10/11/12.5/14/14.5px]` + tracking-[0.02em/0.06em] | Densidade alta, sizes apertados |
| Modal/AlertModal | `text-[12.5/13/17px]` + `leading-[1.3/1.45]` + tracking-[-0.01em] | Títulos com tracking negativo |
| Panel/FloatingPanel | `text-[16px] font-bold tracking-[-0.01em]` | Mesmo padrão de titles |
| PageHeader | `text-title-lg font-bold tracking-[-0.01em]` + `leading-[1.5]` | Único componente UI que usa preset DS |
| TableToolbar | `text-[11.5/12/13/13.5/17px]` + diversos pesos | Forms compactos |
| Table/TabelaTeste | `text-[10.5/13px]` + `font-bold` + `font-mono` | Headers e cells |
| Kanban | `text-caption-md/sm` + `[font-variant-numeric:tabular-nums]` | Mais alinhado com presets |
| DataTable | `text-title-md` + diversos arbitrary internos | Complexo, ver §8 |

### 4.2 `src/components/shadcn/` — Componentes adaptados

**26 arquivos. ~80 declarações tipográficas.**

Comportamento típico: mantém estrutura do Shadcn original mas substitui
tokens por DS. Onde Shadcn usava `text-sm font-medium`, geralmente foi
trocado por preset DS (`text-paragraph-sm` ou `text-label-sm`). Casos que
NÃO migraram:

- `input.tsx:31` — `text-sm` no `file:*` pseudo (UI nativa do browser)
- `input-group.tsx:76` — mesma situação
- `command.tsx`, `dropdown-menu.tsx`, `pagination.tsx` — usam `text-[13px]`
  em items (deveria ser `label-base` ou `paragraph-base`)

Combos mais comuns no shadcn/:
- `text-[13px] font-medium` — 4+ ocorrências (items de dropdown/command)
- `text-paragraph-sm` — 12 ocorrências
- `text-label-sm` — 6 ocorrências
- `font-semibold` — 11 ocorrências

### 4.3 `src/preview/pages/*Doc.tsx` — DocPages individuais

**~1.000 declarações tipográficas em ~40 arquivos.**

Padrão dominante: **presets DS quase exclusivos**. Estes arquivos são
páginas de documentação geradas com `DocLayout`, `DocHeader`, `SectionH2`
— consomem presets corretamente.

Distribuição:
- `text-paragraph-sm` — ~467
- `text-code-sm` — ~277
- `text-label-sm` + `text-label-xs` — ~317
- `text-caption-sm` — ~68
- `text-title-lg` — ~53

Anomalias: 1 ocorrência de `text-xs` (PipelineMemoryDoc) e 1 de `text-sm`
(TransformTokensDoc) — ver §3.3.

### 4.4 `src/preview/pages/ChatV2/` — Chat showcase

**~95 declarações em 10+ subcomponentes.**

Calibração visual fina — usa muitos arbitrary:

| Componente | Tipografia chave |
|---|---|
| ChannelDot | `text-[11px]` |
| DateSeparator | `text-[11px]` + tabular-nums |
| PersonAvatar | `text-[11/13/14px]` (3 tiers conforme size) |
| ConversationListItem | `text-[10.5px]` (unread badge), `text-[13px]` (name), `text-[12.5px]` (preview) |
| MessageBubble | `text-[13.5px] leading-[1.45]` (body), `text-[10.5px]` (meta) |
| DetailField/DetailSection | `text-[12px]` (label), `text-[12.5px]` (value) |
| FilterRow/FiltersColumn | `text-[11.5px]` + tracking-[0.06em] uppercase |
| ConversationColumn | `text-[11.5px]` + tabular-nums |
| DetailsColumn | `text-[12.5px]` + tabular-nums |
| QueueColumn | mistura presets + arbitrary |

### 4.5 `src/preview/pages/ClientesShowcase/` — CRUD showcase

**~55 declarações em ClientesShowcase + DetailDrawer + NovoClienteDrawer.**

Padrão híbrido: tabela usa presets DS, mas drawers usam arbitrary fino:
- `ClientesShowcase.tsx`: `text-[10/11.5/12.5/13/14px]`
- `DetailDrawer/detail-drawer.tsx`: `text-[10/11.5/12.5/13/14/15/17px]` + tabular-nums
- `NovoClienteDrawer/novo-cliente-drawer.tsx`: usa presets DS

### 4.6 `src/preview/pages/DashboardShowcase.tsx`

**~75 declarações em 1 arquivo grande.**

Especialização visual: **números grandes alinhados**:

| Padrão | Onde |
|---|---|
| `text-[26px] font-bold [font-variant-numeric:tabular-nums]` | KPIs principais (3×) |
| `text-[24px] font-bold` | KPI secundário (1×) |
| `text-[22px] font-bold` | Tier abaixo (1×) |
| `text-[15px] font-semibold` | Sub-totais (2×) |
| `text-[12.5px]` + tabular-nums | Table cells (2×) |
| `tracking-[0.04em]` uppercase | Table thead (1×) |

13 das 31 ocorrências de `tabular-nums` do projeto estão neste arquivo.

### 4.7 `src/preview/components/` — DocLayout, DocHeader, etc.

**~30 declarações. 100% presets DS.**

| Arquivo | Tipografia |
|---|---|
| `doc-layout.tsx` | `text-paragraph-sm`, `text-label-sm` |
| `doc-header.tsx` | `text-[2rem]` (anomalia raras), `text-paragraph-sm`, `text-caption-sm` |
| `doc-sidebar.tsx` | `text-label-sm`, `text-caption-sm` |
| `doc-section.tsx` | `text-title-lg`, `text-caption-sm` |
| `doc-props-table.tsx` | `text-code-sm`, `text-label-xs` |
| `doc-toc.tsx` | `text-[11px] font-mono` (TOC monospace) |

---

## 5. Combinações compostas mais comuns

Top 20 padrões `text-X font-Y leading-Z tracking-W` que aparecem juntos:

| # | Combo | Total | Onde | Preset DS equivalente |
|---:|---|---:|---|---|
| 1 | `text-[13px] font-semibold leading-none` | 3+ | Button, Header breadcrumb, Chip count | `label-base` (≈, sem leading-none explícito) |
| 2 | `text-[11px] font-semibold uppercase tracking-[0.02em]` | 3+ | Sidebar tooltips, avatares com iniciais | — (sem preset exato) |
| 3 | `text-[12.5px] font-semibold tracking-[0.01em]` | 3+ | FormField labels, Sidebar subitems, Conversation names | — (sem preset 12.5px) |
| 4 | `text-[13.5px] leading-[1.45]` | 3+ | MessageBubble, Modal description, Add view modal | — (sem preset 13.5px) |
| 5 | `text-[13px] font-medium leading-none` | 2+ | TableToolbar tab, Shadcn dropdown items | `label-base` (medium) |
| 6 | `text-[16px] font-bold tracking-[-0.01em]` | 2 | FloatingPanel title, Panel title | — (title-md tem weight medium, não bold) |
| 7 | `text-[17px] font-bold leading-[1.3]` | 2 | Modal title, Add view modal title | — |
| 8 | `text-[10px] font-bold tracking-[0.06em] uppercase` | 2 | Sidebar section header, Header icon badge | `subheading-strong-sm` (★) |
| 9 | `text-[11px] font-semibold uppercase tracking-wider` | 2+ | Preview doc header, Command palette groups | — |
| 10 | `text-[13px] tracking-wider` | 2 | Table headCell, Pagination | — |
| 11 | `text-[11px] font-mono` | 2+ | Doc TOC, Command output | — |
| 12 | `text-[10.5px] font-bold leading-none` | 2 | Table sort badge, Unread badge | — |
| 13 | `text-[14.5px] font-bold` | 1 | Sidebar panel title | — |
| 14 | `text-[15px] font-semibold` | 1 | Breadcrumb standalone | — |
| 15 | `text-[12px] font-medium` | 2 | FormField message, TableToolbar applied chip | `label-xs` (12px medium) |
| 16 | `text-[12px] text-fg-muted tracking-[0.01em]` | 1 | Add view modal sub title | — |
| 17 | `text-[2rem] font-semibold tracking-tight leading-tight` | 1 | Preview page header | — (32px sem preset estático) |
| 18 | `text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis` | 1 | Conversation list name | `label-base` + ellipsis |
| 19 | `text-[13px] leading-[1.5]` | 1 | Form input placeholder | — |
| 20 | `text-[10px] font-semibold text-fg-muted` | 2+ | Header kbd, Doc annotations | `caption-xs` + override de weight |

**Padrões observáveis:**
- `font-semibold leading-none` é o combo universal pra labels/buttons inline
- Headings de modal/panel: `font-bold tracking-[-0.01em]` (não usa medium dos presets)
- Section headers uppercase: variações de `font-bold tracking-[0.02em–0.06em] uppercase`
- Number displays: `font-bold tabular-nums` (Dashboard, badges)

---

## 6. Drift catalogado (arbitrary vs preset existente)

**Esta seção lista valores arbitrary que poderiam ser substituídos por
presets existentes.** Catalogação apenas — sem recomendação de mudança
imediata.

### 6.1 `text-[13px]` (~45×) vs presets de 13px

Há **4 presets DS para 13px**, cada um com line-height/weight/tracking diferente:

| Preset | weight | line-height | tracking | melhor pra |
|---|---|---|---|---|
| `label-base` ★ | 500 | 1.125rem (18px) | -0.003em | botões, dropdowns, inputs |
| `paragraph-base` ★ | 400 | 1.125rem (18px) | -0.003em | body small, cells, bubbles |
| `caption-md` | 400 | 1.125rem (18px) | 0em | metadados, timestamps |
| `code-sm` | 400 | 1.6 | 0em | código mono |

Onde `text-[13px]` aparece sem preset definido (45 ocorrências), a escolha
do preset apropriado depende do contexto semântico.

### 6.2 `text-[11px]` (~35×) vs presets de 11px

| Preset | weight | line-height | tracking |
|---|---|---|---|
| `caption-sm` | 400 | 0.875rem (14px) | 0em |
| `label-2xs` ★ | 500 | 0.875rem (14px) | 0em |
| `subheading-2xs` | 500 | 0.75rem (12px) | 0.02em |
| `subheading-strong-md` ★ | 700 | 0.875rem (14px) | 0.06em |

Decisão depende do contexto (regular vs medium vs bold + tracking).

### 6.3 `text-[10px]` (~19×) vs presets de 10px

| Preset | weight | line-height | tracking |
|---|---|---|---|
| `caption-xs` ★ | 400 | 0.75rem (12px) | 0em |
| `subheading-strong-sm` ★ | 700 | 0.75rem (12px) | 0.06em |

### 6.4 Valores decimais sem preset

| Valor | Ocorrências | Status |
|---|---:|---|
| `text-[10.5px]` | 7 | Sem preset DS. Calibração visual fina |
| `text-[11.5px]` | 10 | Sem preset DS |
| `text-[12.5px]` | 22 | Sem preset DS. Mais usado dos decimais |
| `text-[13.5px]` | 2 | Sem preset DS |
| `text-[14.5px]` | 1 | Sem preset DS |

### 6.5 Tracking arbitrário vs valores nomeados

`tracking-[0.02em]`, `tracking-[0.06em]`, `tracking-[-0.01em]`, `tracking-[0.01em]`, `tracking-[0.04em]` somam ~23 ocorrências. Comparar com `letterSpacing` em `fonts.ts`:

```ts
letterSpacing = {
  tighter: -0.02em,
  tight:   -0.01em,  // ← usado em vários componentes
  normal:   0em,
  wide:     0.01em,  // ← usado em vários componentes
  wider:    0.03em,
  widest:   0.05em,  // ← próximo do 0.06em arbitrário
}
```

Os valores arbitrary não batem 1:1 com a escala — alguns usam 0.02em e
0.06em que não estão nomeados nos primitives. Isso pode ser propósito
(calibração fina) ou drift histórico.

---

## 7. Exceções intencionais

### 7.1 Avatar — calibração proporcional (L-014)

`src/components/ui/Avatar/avatar.styles.ts` usa `text-[10/11/13/14px]`
em variantes diferentes de tamanho do círculo. Documentado na lição
L-014: tipografia do avatar é calibrada pelo diâmetro, não pela escala
DS. **Exceção válida.**

### 7.2 Dashboard — números KPI com tabular-nums

`DashboardShowcase.tsx` usa `text-[26px]`, `text-[24px]`, `text-[22px]`
sempre combinado com `font-bold` + `[font-variant-numeric:tabular-nums]`
pra alinhar dígitos verticalmente entre cards. Estes tamanhos não existem
nos presets DS (`label-xl`/`title-lg` são 20-24px max sem fluid). **Caso
de uso válido — pode justificar preset novo se virar pattern.**

### 7.3 `file:` pseudo-elements

`text-sm` aparece dentro de seletor `file:*` em `input.tsx` e
`input-group.tsx`. Esses estilos atingem o botão nativo de file picker do
browser — costumam ser exceções razoáveis. **Não bloqueia.**

### 7.4 Code blocks com mono explícito

`text-[11px] font-mono` em DocLayout TOC e command output preserva
monoespaço com tamanho menor que `code-sm` (13px). **Exceção visual
documentada.**

### 7.5 Modal/Panel titles com font-bold

Padrão recorrente: `text-[16/17px] font-bold tracking-[-0.01em]` em
Modal, Panel, FloatingPanel, AlertDialog. Os presets `title-md`/`title-sm`
usam weight medium (500), não bold. **Drift consciente possivel** —
títulos de modal/drawer historicamente usam bold pra dar mais destaque.

### 7.6 PageHeader com `text-title-lg font-bold`

`page-header.styles.ts` usa `text-title-lg font-bold tracking-[-0.01em]`.
`title-lg` é weight 500 por padrão. O override pra bold é intencional —
PageHeader serve como heading de página.

---

## 8. Apêndices — listagens completas filepath:line

### A. Font sizes arbitrary raros (lista completa)

#### `text-[26px]` (3 ocorrências)
- `src/preview/pages/DashboardShowcase.tsx:252`
- `src/preview/pages/DashboardShowcase.tsx:317`
- `src/preview/pages/DashboardShowcase.tsx:413`

#### `text-[24px]` (1)
- `src/preview/pages/DashboardShowcase.tsx:518`

#### `text-[22px]` (1)
- `src/preview/pages/DashboardShowcase.tsx:280`

#### `text-[20px]` (1)
- `src/preview/pages/AgentsPreview.tsx:504`

#### `text-[18px]` (1)
- `src/components/shadcn/alert-dialog.tsx:105`

#### `text-[17px]` (2)
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:74`
- `src/components/ui/Modal/modal.styles.ts:84`

#### `text-[16px]` (3)
- `src/preview/pages/AgentsPreview.tsx:730`
- `src/components/ui/Panel/panel.styles.ts:69`
- `src/components/ui/FloatingPanel/floating-panel.styles.ts:48`

#### `text-[15px]` (7)
- `src/components/ui/Header/header.styles.ts:88`
- `src/components/ui/Header/header.styles.ts:162`
- `src/preview/pages/DashboardShowcase.tsx:310`
- `src/preview/pages/DashboardShowcase.tsx:373`
- `src/preview/pages/FloatingPanelDoc.tsx:330`
- `src/preview/pages/ClientesShowcase/components/DetailDrawer/detail-drawer.tsx:144`
- `src/preview/pages/ShowcasePageV2.tsx:30`

#### `text-[14px]` (5)
- `src/components/ui/MenuSidebar/sidebar.styles.ts:335`
- `src/preview/pages/ClientesShowcase/components/DetailDrawer/detail-drawer.tsx:139`
- `src/preview/pages/ChatV2/components/DetailsColumn/details-column.styles.ts:14`
- `src/preview/pages/ChatV2/components/PersonAvatar/person-avatar.tsx:16`
- `src/preview/pages/FloatingPanelDoc.tsx:325`

#### `text-[2rem]` (2)
- `src/preview/components/doc-header.tsx:12`
- `src/preview/pages/ComponentDocTemplate.tsx:20`

#### `text-[0.8rem]` (1)
- `src/components/shadcn/calendar.tsx:63`

### B. Font sizes decimais

#### `text-[10.5px]` (5)
- `src/components/ui/Table/table.styles.ts:94`
- `src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts:29`
- `src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts:33`
- `src/components/ui/TabelaTeste/tabela-teste.styles.ts:108`
- `src/preview/pages/ChatV2/components/MessageBubble/message-bubble.styles.ts:13`

#### `text-[11.5px]` (6)
- `src/components/ui/TableToolbar/table-toolbar.styles.ts:274`
- `src/components/ui/TableToolbar/popovers/sort-popover.tsx:155`
- `src/components/ui/FormField/form-field.styles.ts:30`
- `src/preview/pages/ClientesShowcase/ClientesShowcase.tsx:281`
- `src/preview/pages/ChatV2/components/ConversationColumn/conversation-column.styles.ts:13`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:125`

#### `text-[12.5px]` (15)
- `src/components/shadcn/input-group.tsx:190`
- `src/components/shadcn/input-group.tsx:212`
- `src/components/shadcn/label.tsx:13`
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:81`
- `src/preview/pages/ClientesShowcase/clientes-showcase.styles.ts:11`
- `src/components/ui/Modal/modal.styles.ts:91`
- `src/components/ui/FormField/form-field.styles.ts:14`
- `src/preview/pages/DashboardShowcase.tsx:532`
- `src/preview/pages/DashboardShowcase.tsx:716`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:226`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:360`
- `src/preview/pages/ClientesShowcase/components/DetailDrawer/detail-drawer.tsx:297`
- `src/preview/pages/ChatV2/components/DetailField/detail-field.tsx:18`
- `src/preview/pages/ChatV2/components/DetailsColumn/details-column.styles.ts:27`
- `src/preview/pages/ChatV2/components/FilterRow/filter-row.styles.ts:14`

#### `text-[13.5px]` (2)
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:121`
- `src/preview/pages/ChatV2/components/MessageBubble/message-bubble.styles.ts:11`

#### `text-[14.5px]` (1)
- `src/components/ui/MenuSidebar/sidebar.styles.ts:190`

### C. Tailwind literal (anomalias)

#### `text-xs` (1)
- `src/preview/pages/PipelineMemoryDoc.tsx:205`

#### `text-sm` (3)
- `src/components/shadcn/input.tsx:31` (`file:` pseudo)
- `src/components/shadcn/input-group.tsx:76` (`file:` pseudo)
- `src/preview/pages/TransformTokensDoc.tsx:214`

#### `text-3xl` (1)
- `src/preview/pages/ShowcasePageV2.tsx:770`

### D. Tracking arbitrário

#### `tracking-[0.04em]` (1)
- `src/preview/pages/DashboardShowcase.tsx:707`

#### `tracking-[0.06em]` (2)
- `src/components/ui/MenuSidebar/sidebar.styles.ts:315`
- `src/preview/pages/ChatV2/components/FiltersColumn/filters-column.styles.ts:19`

#### `tracking-[-0.01em]` (6)
- `src/components/shadcn/alert-dialog.tsx:105`
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:76`
- `src/components/ui/PageHeader/page-header.styles.ts:25`
- `src/components/ui/FloatingPanel/floating-panel.styles.ts:48`
- `src/components/ui/Panel/panel.styles.ts:69`
- `src/components/ui/Modal/modal.styles.ts:86`

#### `tracking-[0.01em]` (4)
- `src/components/shadcn/label.tsx:13`
- `src/components/ui/FormField/form-field.styles.ts:14`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:125`
- `src/preview/pages/ClientesShowcase/clientes-showcase.styles.ts:11`

#### `tracking-[0.02em]` (8)
- `src/components/ui/AppShell/user-menu.tsx:88`
- `src/components/ui/Header/header.styles.ts:285`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:158`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:159`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:258`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:259`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:375`
- `src/components/ui/MenuSidebar/sidebar.styles.ts:376`

### E. Leading arbitrário

#### `leading-[1.3]` (5)
- `src/components/ui/Kanban/kanban.styles.ts:219`
- `src/components/ui/Modal/modal.styles.ts:84`
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:72`
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:74`
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:121`

#### `leading-[1.45]` (5)
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:81`
- `src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts:125`
- `src/components/ui/Modal/modal.styles.ts:91`
- `src/components/ui/Kanban/kanban.styles.ts:231`
- `src/preview/pages/ChatV2/components/MessageBubble/message-bubble.styles.ts:11`

#### `leading-[1.5]` (4)
- `src/components/shadcn/alert-dialog.tsx:120`
- `src/components/shadcn/input-group.tsx:100`
- `src/components/shadcn/textarea.tsx:27`
- `src/components/ui/PageHeader/page-header.styles.ts:27`

### F. Custom feature — `tabular-nums` (lista completa, 31 ocorrências)

#### Dashboard (13)
- `src/preview/pages/DashboardShowcase.tsx:252`
- `src/preview/pages/DashboardShowcase.tsx:317`
- `src/preview/pages/DashboardShowcase.tsx:413`
- `src/preview/pages/DashboardShowcase.tsx:518`
- `src/preview/pages/DashboardShowcase.tsx:533`
- `src/preview/pages/DashboardShowcase.tsx:576`
- `src/preview/pages/DashboardShowcase.tsx:597`
- `src/preview/pages/DashboardShowcase.tsx:617`
- `src/preview/pages/DashboardShowcase.tsx:640`
- `src/preview/pages/DashboardShowcase.tsx:720`
- `src/preview/pages/DashboardShowcase.tsx:723`
- `src/preview/pages/DashboardShowcase.tsx:734`
- `src/preview/pages/ClientesShowcase/ClientesShowcase.tsx:281`

#### Kanban (3)
- `src/components/ui/Kanban/kanban.styles.ts:68`
- `src/components/ui/Kanban/kanban.styles.ts:225`
- `src/components/ui/Kanban/kanban.styles.ts:243`

#### TabelaTeste (4)
- `src/components/ui/TabelaTeste/tabela-teste.styles.ts:109`
- `src/components/ui/TabelaTeste/tabela-teste.styles.ts:263`
- `src/components/ui/TabelaTeste/tabela-teste.styles.ts:266`
- `src/components/ui/TabelaTeste/tabela-teste.styles.ts:269`

#### ChatV2 (9)
- `src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts:18`
- `src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts:29`
- `src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts:33`
- `src/preview/pages/ChatV2/components/DateSeparator/date-separator.tsx:13`
- `src/preview/pages/ChatV2/components/ConversationColumn/conversation-column.tsx:94`
- `src/preview/pages/ChatV2/components/FilterRow/filter-row.styles.ts:18`
- `src/preview/pages/ChatV2/components/DetailsColumn/details-column.styles.ts:25`
- `src/preview/pages/ChatV2/components/MessageBubble/message-bubble.styles.ts:15`
- `src/preview/pages/ClientsKanbanPreview.tsx:160`

#### Doc pages (2)
- `src/preview/pages/KanbanDoc.tsx:155`
- `src/preview/pages/KanbanDoc.tsx:221`

### G. Cross-reference rápida — preset ↔ arbitrary equivalente em px

| px | Preset(s) DS | Arbitrary observado |
|---:|---|---|
| 10 | `caption-xs` ★, `subheading-strong-sm` ★ | `text-[10px]` (~19×) |
| 10.5 | — | `text-[10.5px]` (~7×) |
| 11 | `caption-sm`, `label-2xs` ★, `subheading-2xs`, `subheading-strong-md` ★ | `text-[11px]` (~35×) |
| 11.5 | — | `text-[11.5px]` (~10×) |
| 12 | `label-xs`, `paragraph-xs`, `subheading-xs` | `text-[12px]` (~26×) |
| 12.5 | — | `text-[12.5px]` (~22×) |
| 13 | `caption-md`, `label-base` ★, `paragraph-base` ★, `code-sm` | `text-[13px]` (~45×) |
| 13.5 | — | `text-[13.5px]` (~2×) |
| 14 | `label-sm`, `paragraph-sm`, `subheading-sm`, `title-sm` | `text-[14px]` (~6×) |
| 14.5 | — | `text-[14.5px]` (~1×) |
| 15 | — | `text-[15px]` (~7×) |
| 16 | `label-md`, `paragraph-md`, `subheading-md`, `title-md`, `code-md` | `text-[16px]` (~5×) |
| 17 | — | `text-[17px]` (~2×) |
| 18 | `label-lg`, `paragraph-lg` | `text-[18px]` (~1×) |
| 20 | `title-lg` | `text-[20px]` (~1×) |
| 22 | — | `text-[22px]` (~1×) |
| 24 | `heading-xs`, `label-xl`, `paragraph-xl` | `text-[24px]` (~1×) |
| 26 | — | `text-[26px]` (~3×) |
| 32 (~2rem) | (display-md mínimo fluid) | `text-[2rem]` (~2×) |
| ~12.8 (0.8rem) | — | `text-[0.8rem]` (~1×) |

---

## Notas finais

- **Data do snapshot**: 2026-05-18
- **Commit no momento**: `929b388` (último antes deste audit)
- **Versão `@snksergio/design-system` no NPM**: 0.1.1
- **Versão `@snksergio/create-design-system` no NPM**: 0.1.2
- **Total de declarações tipográficas mapeadas**: ~1.696
- **Próximo audit similar**: gerar novo arquivo `typography-inventory-YYYY-MM-DD.md` — não editar este

> **Lembrete da lição L-007 + incidente histórico de migração:**
> Tipografia tem armadilhas porque presets se sobrepõem em pixels mas
> divergem em weight/line-height/tracking. Qualquer migração futura
> deve consultar a **§2.4 (cruzada px ↔ presets)** + contexto semântico
> de cada uso antes de substituir.
