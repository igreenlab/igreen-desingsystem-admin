# Typography Inventory — 2026-05-19 (pós-Ondas, pré-rewrite)

> Snapshot pós-Ondas 1-4 (decimais e órfãos eliminados). Inventário dos
> ~200 `text-[Npx]` literais restantes, padrões de composição recorrentes
> e proposta de mapeamento para o novo `typography.ts` enxuto (6 roles,
> ~23 presets).
>
> **Esta auditoria é base para Fase 2 (spec) e Fase 3 (implementação).**
> Não modifica código. Substitui o audit de 2026-05-18 como referência atual.

---

## Sumário

- [1. Visão geral pós-Ondas](#1-visão-geral-pós-ondas)
- [2. Distribuição por tier (literais restantes)](#2-distribuição-por-tier-literais-restantes)
- [3. Padrões de composição recorrentes (top 13)](#3-padrões-de-composição-recorrentes-top-13)
- [4. Mapeamento proposto por padrão → nova escala](#4-mapeamento-proposto-por-padrão--nova-escala)
- [5. Inventário completo por arquivo (UI + shadcn)](#5-inventário-completo-por-arquivo)
- [6. Inventário em showcases](#6-inventário-em-showcases)
- [7. Aliases legacy sugeridos](#7-aliases-legacy-sugeridos)
- [8. Notas de implementação para a Fase 3](#8-notas-de-implementação-para-a-fase-3)

---

## 1. Visão geral pós-Ondas

### Estado tipográfico

| Categoria | Ocorrências | Notas |
|---|---:|---|
| Presets DS (`text-paragraph-sm` etc) | ~1363 | adoção dominante |
| Literais `text-[Npx]` | ~199 | tier discreto (10-24px) |
| Tailwind nativo (`text-xs`, `text-3xl`) | 0 | eliminados (3 anomalias da pré-Ondas) |
| Inline styles | 0 | mantido limpo |
| Decimais `.5` | 0 | ★ eliminado nas Ondas |
| Órfãos (15, 17, 22, 26) | 0 | ★ eliminado nas Ondas |

### Razão para os 199 literais restantes

**Causa raiz técnica** (já documentada no plan): `@utility text-X` em Tailwind v4
embeda `font-size + line-height + weight + tracking + family` num único bloco.
Quando se quer override de `leading-X` ou `tracking-X`, o `@utility` muitas vezes
vence sobre regras posteriores — observado no incidente do shadcn/label.tsx.

Por isso, padrões com **leading custom** ou **tracking pontual** acabam mantidos
como Tailwind arbitrary (`text-[Npx]`), preservando previsibilidade de cascade.

---

## 2. Distribuição por tier (literais restantes)

| px | Ocorrências | Onde mais aparece |
|---:|---:|---|
| **10** | ~25 | badges (sort, unread, KPI ranking), uppercase microlabels, kbd |
| **11** | ~50 | tooltips, microlabels uppercase, avatares xs, table caption |
| **12** | ~50 | helpers, modal descriptions, cell secundário, microbutton |
| **13** | ~60 | body default (table cell, dropdown item, input, button) |
| **14** | ~10 | message body, avatar lg, panel title secondary |
| **16** | ~5 | modal/panel title (com font-bold) |
| **18** | 1 | alert-dialog title (com font-bold) |
| **20** | 1 | AgentsPreview ✅ icon |
| **24** | 5 | KPI Dashboard (com font-bold + leading-none + tabular-nums) |
| `[2rem]` | 2 | DocHeader / ShowcasePageV2 ícone ✦ (fluid intencional) |

Total = ~199 ocorrências em 50 arquivos. Escala discreta: 10/11/12/13/14/16/18/20/24.

---

## 3. Padrões de composição recorrentes (top 13)

Cada padrão = combo de classes que repete em N arquivos.

### P1 — Body cell / table value (`text-[13px]` puro)
Composição: `text-[13px] text-fg-default` (sem leading, sem tracking customizado).
- Onde: 25+ locais — table cells, dropdown items, input values, button text, search inputs, command palette
- Sample: [table.styles.ts:60](src/components/ui/Table/table.styles.ts#L60), [input.tsx:28](src/components/shadcn/input.tsx#L28), [select.tsx:29](src/components/shadcn/select.tsx#L29), [command.tsx:77](src/components/shadcn/command.tsx#L77), [textarea.tsx:27](src/components/shadcn/textarea.tsx#L27)
- Composição-alvo: **13 / 400 / lh-normal / tracking-normal**

### P2 — Cell label/interactive (`text-[13px] font-medium`)
Composição: `text-[13px] font-medium`.
- Onde: 12+ locais — tabs, dropdown items interativos, command items, sidebar items
- Sample: [tabs.tsx:38](src/components/shadcn/tabs.tsx#L38), [dropdown-menu.tsx:63](src/components/shadcn/dropdown-menu.tsx#L63), [sidebar.styles.ts:208](src/components/ui/MenuSidebar/sidebar.styles.ts#L208), [pagination.tsx:69](src/components/shadcn/pagination.tsx#L69)
- Composição-alvo: **13 / 500 / lh-normal**

### P3 — Heading inline / button text / table header (`text-[13px] font-semibold leading-none`)
Composição: `text-[13px] font-semibold leading-none`.
- Onde: 15+ locais — Button, Chip lg, table thead, conversation name, detail section header
- Sample: [button.styles.ts:29](src/components/ui/Button/button.styles.ts#L29), [table.styles.ts:40](src/components/ui/Table/table.styles.ts#L40), [tabela-teste.styles.ts:47](src/components/ui/TabelaTeste/tabela-teste.styles.ts#L47), [conversation-list-item.styles.ts:16](src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts#L16)
- Composição-alvo: **13 / 600 / lh-1 / tracking-normal**

### P4 — Form label (`text-[13px] font-semibold tracking-[0.01em] leading-none`)
Composição: P3 + `tracking-[0.01em]` (positivo, "wide").
- Onde: 3 locais
- Sample: [shadcn/label.tsx:17](src/components/shadcn/label.tsx#L17), [FormField/form-field.styles.ts:14](src/components/ui/FormField/form-field.styles.ts#L14), [clientes-showcase.styles.ts:11](src/preview/pages/ClientesShowcase/clientes-showcase.styles.ts#L11)
- Composição-alvo: **13 / 600 / lh-1 / tracking-+wide**

### P5 — Caption / helper / meta (`text-[12px] text-fg-muted`)
Composição: `text-[12px]` sem peso, com cor muted.
- Onde: 20+ locais — modal descriptions, helpers, cells secundárias, sidebar bookmarks
- Sample: [Modal/modal.styles.ts:92](src/components/ui/Modal/modal.styles.ts#L92), [add-view-modal.styles.ts:81](src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts#L81), [tabela-teste.styles.ts:196](src/components/ui/TabelaTeste/tabela-teste.styles.ts#L196), [details-column.styles.ts:16](src/preview/pages/ChatV2/components/DetailsColumn/details-column.styles.ts#L16)
- Composição-alvo: **12 / 400 / lh-normal**

### P6 — Caption medium / chip / interactive small (`text-[12px] font-medium`)
Composição: P5 + weight 500.
- Onde: 18+ locais — sort/filter chips, secondary buttons, sidebar subitens, view popover items
- Sample: [table-toolbar.styles.ts:282](src/components/ui/TableToolbar/table-toolbar.styles.ts#L282), [views-popover.tsx:147](src/components/ui/TableToolbar/popovers/views-popover.tsx#L147), [sidebar.styles.ts:226](src/components/ui/MenuSidebar/sidebar.styles.ts#L226), [filter-popover.tsx:460](src/components/ui/TableToolbar/popovers/filter-popover.tsx#L460)
- Composição-alvo: **12 / 500 / lh-normal**

### P7 — Caption micro / tooltip / time (`text-[11px]` puro com muted)
Composição: `text-[11px] text-fg-muted` (sem peso explícito).
- Onde: 30+ locais — timestamps, sort dirs, channel dot, helper count, history meta
- Sample: [conversation-list-item.styles.ts:18](src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts#L18), [details-column.styles.ts:25](src/preview/pages/ChatV2/components/DetailsColumn/details-column.styles.ts#L25), [DashboardShowcase.tsx:267](src/preview/pages/DashboardShowcase.tsx#L267), [filter-row.styles.ts:18](src/preview/pages/ChatV2/components/FilterRow/filter-row.styles.ts#L18)
- Composição-alvo: **11 / 400 / lh-normal**

### P8 — Section header uppercase strong (`text-[11px] font-semibold uppercase tracking-wide leading-none`)
Composição: small caps com tracking positivo.
- Onde: 5+ locais — popover headers (Sort, Cols, Filter), ComponentDocTemplate label
- Sample: [sort-popover.tsx:116](src/components/ui/TableToolbar/popovers/sort-popover.tsx#L116), [cols-popover.tsx:146](src/components/ui/TableToolbar/popovers/cols-popover.tsx#L146), [filter-popover.tsx:446](src/components/ui/TableToolbar/popovers/filter-popover.tsx#L446)
- Composição-alvo: **11 / 600 / lh-1 / uppercase / tracking-+wide**

### P9 — Badge bold uppercase (`text-[10/11px] font-bold uppercase tracking-[0.02-0.06em] leading-none`)
Composição: pillish badge com bold + uppercase + tracking forte.
- Onde: 8+ locais — sidebar section headers, avatar fallbacks brand, MenuSidebar chat avatars, FiltersColumn group label
- Sample: [sidebar.styles.ts:159](src/components/ui/MenuSidebar/sidebar.styles.ts#L159), [sidebar.styles.ts:315](src/components/ui/MenuSidebar/sidebar.styles.ts#L315), [filters-column.styles.ts:19](src/preview/pages/ChatV2/components/FiltersColumn/filters-column.styles.ts#L19), [header.styles.ts:285](src/components/ui/Header/header.styles.ts#L285)
- Composição-alvo: **10-11 / 700 / lh-1 / uppercase / tracking-+wider**

### P10 — Sort index / unread badge / KPI ranking (`text-[10px] font-bold leading-none [tabular-nums]`)
Composição: badge numérico minúsculo.
- Onde: 5+ locais — Table sortBadge, TabelaTeste thSortIndex, ConversationListItem unread, Header kbd, user-menu pill
- Sample: [table.styles.ts:94](src/components/ui/Table/table.styles.ts#L94), [tabela-teste.styles.ts:108](src/components/ui/TabelaTeste/tabela-teste.styles.ts#L108), [conversation-list-item.styles.ts:29](src/preview/pages/ChatV2/components/ConversationListItem/conversation-list-item.styles.ts#L29), [header.styles.ts:125](src/components/ui/Header/header.styles.ts#L125)
- Composição-alvo: **10 / 700 / lh-1 / tabular-nums**

### P11 — Modal / Panel title (`text-[16px] font-bold leading-[1.3] tracking-[-0.01em]`)
Composição: title estática com leading apertado + tracking negativo.
- Onde: 4 locais — Modal, AddViewModal, Panel, FloatingPanel
- Sample: [modal.styles.ts:85](src/components/ui/Modal/modal.styles.ts#L85), [add-view-modal.styles.ts:74](src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts#L74), [panel.styles.ts:69](src/components/ui/Panel/panel.styles.ts#L69), [floating-panel.styles.ts:48](src/components/ui/FloatingPanel/floating-panel.styles.ts#L48)
- Composição-alvo: **16 / 700 / lh-1.3 / tracking--tight**

### P12 — Modal description (`text-[12px] text-fg-muted leading-[1.45]`)
Composição: descrição secundária com leading mais aberto.
- Onde: 4+ locais — Modal sub, AddViewModal sub, AddViewModal toggleDesc
- Sample: [modal.styles.ts:92](src/components/ui/Modal/modal.styles.ts#L92), [add-view-modal.styles.ts:81](src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts#L81), [add-view-modal.styles.ts:125](src/components/ui/TableToolbar/popovers/add-view-modal.styles.ts#L125)
- Composição-alvo: **12 / 400 / lh-1.45**

### P13 — KPI Dashboard / large number (`text-[24px] font-bold leading-none [tabular-nums]`)
Composição: número grande com tabular-nums.
- Onde: 5 locais — DashboardShowcase (4 KPI principais + 1 sub)
- Sample: [DashboardShowcase.tsx:252](src/preview/pages/DashboardShowcase.tsx#L252), :280, :317, :413, :518
- Composição-alvo: **24 / 700 / lh-1 / tabular-nums**

---

## 4. Mapeamento proposto por padrão → nova escala

Considerando os 23 presets propostos no plano (6 roles: display/heading/title/body/caption/code).

| Padrão | Composição literal | Preset novo + override |
|---|---|---|
| P1 Body cell | `text-[13px]` | `text-body-sm` |
| P2 Cell interactive | `text-[13px] font-medium` | `text-body-sm font-medium` |
| P3 Heading inline / button | `text-[13px] font-semibold leading-none` | `text-body-sm font-semibold leading-none` |
| P4 Form label | `text-[13px] font-semibold tracking-[0.01em] leading-none` | `text-body-sm font-semibold tracking-[0.01em] leading-none` |
| P5 Caption muted | `text-[12px]` | `text-caption-md` |
| P6 Caption medium | `text-[12px] font-medium` | `text-caption-md font-medium` (ou criar `body-xs`=12/500) |
| P7 Microcaption muted | `text-[11px]` | `text-caption-sm` |
| P8 Section header uppercase | `text-[11px] font-semibold uppercase tracking-wide` | `text-caption-sm font-semibold uppercase tracking-wide` |
| P9 Badge bold uppercase | `text-[10-11px] font-bold uppercase tracking-[X]` | `text-caption-xs font-bold uppercase tracking-wider` (10) ou `text-caption-sm font-bold uppercase tracking-wider` (11) |
| P10 Sort/unread badge | `text-[10px] font-bold leading-none tabular-nums` | `text-caption-xs font-bold leading-none tabular-nums` |
| P11 Modal title | `text-[16px] font-bold leading-[1.3] tracking-[-0.01em]` | `text-title-md font-bold leading-[1.3] tracking-[-0.01em]` (se title-md = 16/600 default) |
| P12 Modal description | `text-[12px] leading-[1.45]` | `text-caption-md leading-[1.45]` |
| P13 KPI number | `text-[24px] font-bold leading-none tabular-nums` | `text-heading-xs font-bold leading-none tabular-nums` |

### Padrões que requerem decisão extra

**P11 Modal title** — proposta do plano: `title-md` weight default 600. Se vier 600, basta `text-title-md leading-[1.3] tracking-[-0.01em]` (sem override de weight). Mas se mantermos `title-md` = 500 default, precisa override `font-bold`.

**P9 Badge tracking** — atual usa `tracking-[0.02em]` (Header sidebar avatar) e `tracking-[0.06em]` (MenuSidebar section header, FiltersColumn). Esses valores não batem com Tailwind `tracking-wider` (= 0.05em). Precisa decidir: usar tracking literal mesmo (override) ou substituir todos por `tracking-wider`/`tracking-widest`.

**P4 Form label** — `tracking-[0.01em]` é positivo (wide), mas a proposta `body-sm` tem tracking -0.003em (tight). Override `tracking-[0.01em]` funciona OK (positive sobrepõe negative).

---

## 5. Inventário completo por arquivo

### Componentes UI iGreen (em `src/components/ui/`)

| Arquivo | Literais | Notas |
|---|---:|---|
| Modal/modal.styles.ts | 2 | P11 title + P12 description |
| Panel/panel.styles.ts | 1 | P11 (sem leading) |
| FloatingPanel/floating-panel.styles.ts | 1 | P11 (sem leading) |
| TableToolbar/table-toolbar.styles.ts | 8 | P1/P2/P3/P5/P6 (vários cells e chips) |
| TableToolbar/popovers/sort-popover.tsx | 7 | P8 header + P5/P6/P7 entries |
| TableToolbar/popovers/cols-popover.tsx | 4 | P8 + P5/P6 |
| TableToolbar/popovers/filter-popover.tsx | 15 | P5/P6/P7/P8 — popover complexa |
| TableToolbar/popovers/views-popover.tsx | 7 | P5/P6/P7 |
| TableToolbar/popovers/add-view-modal.styles.ts | 4 | P11/P12 + P3 toggleLabel |
| TableToolbar/parts/toolbar-mobile-sheet.tsx | 1 | P6 |
| Header/header.styles.ts | 17 | maior diversidade — P1/P2/P3/P5/P7/P9/P10/P11 |
| MenuSidebar/sidebar.styles.ts | 8 | P2/P5/P6/P7/P8/P9/P10 |
| FormField/form-field.styles.ts | 2 | P4 label + (helper 11 puro) |
| Table/table.styles.ts | 3 | P1/P3/P10 |
| TabelaTeste/tabela-teste.styles.ts | 10 | P1/P3/P10 + sizing cells |
| AppShell/user-menu.tsx | 6 | P2/P7/P9 |
| Button/button.styles.ts | 1 | P3 |
| Chip/chip.styles.ts | 5 | sizing literal (sm/md/lg/xl + counter) |
| FooterTable/footer-table.tsx | 1 | P1 |
| DataTable/_filter-field.tsx | 1 | P1 (no path "column-types/_filter-field.tsx") |

### Componentes shadcn adaptados (em `src/components/shadcn/`)

| Arquivo | Literais | Notas |
|---|---:|---|
| input.tsx | 1 | P1 |
| input-group.tsx | 8 | P1 (size variants) + P6 button sm |
| label.tsx | 2 | P4 (literal `text-[13px]` intencional via comentário) |
| textarea.tsx | 1 | P1 + leading-[1.5] |
| select.tsx | 2 | P1 + P2 |
| dropdown-menu.tsx | 2 | P2 + shortcut text 11 |
| command.tsx | 4 | P1 + P2 + shortcut 11 + heading 10 |
| alert-dialog.tsx | 2 | P11-like 18px title + body desc |
| pagination.tsx | 2 | P2 (numbered nav) + tracking-wider |
| tabs.tsx | 1 | P2 |
| badge.tsx | 2 | sizing variants (10 sm / 13 lg) |
| accordion.tsx | 0 | usa preset |
| breadcrumb.tsx | 0 | usa preset |

**Total UI + shadcn ≈ 110 ocorrências.**

---

## 6. Inventário em showcases

### `src/preview/pages/` (não-doc, showcases reais)

| Arquivo | Literais | Notas |
|---|---:|---|
| DashboardShowcase.tsx | 27 | P5/P6/P7/P10/P13 + KPI (5×) + sub-totals |
| ChatV2/components/* | 13 | P1/P5/P6/P7/P9/P10 + avatares variados |
| ClientesShowcase/* | 7 | P4 fieldLabel + drawer P1/P5/avatares |
| FloatingPanelDoc.tsx | 2 | avatar + meta |
| AgentsPreview.tsx | 8 | ícone 20 + mono 11 + badges 10 |
| ChipDoc.tsx | 5 | demo monospace 11-12 |
| CommandDoc.tsx | 2 | kbd 10 |
| ShowcasePageV2.tsx | 1 | ícone `[2rem]` (Unicode ✦) |
| IconsDoc.tsx | 1 | grid label 10 |
| ComponentDocTemplate.tsx | 2 | h1 `[2rem]` + uppercase label 11 |
| TableDoc.tsx | 1 | avatar |
| PaginationDoc.tsx | 1 | code preview 12 |
| FooterTableDoc.tsx | 2 | example markup |
| ChatV2 PersonAvatar.tsx | 3 | sm 11 / md 13 / lg 14 (proporcional ao circle) |

**Total preview ≈ 75 ocorrências.**

### `src/preview/components/` (DocLayout helpers)

| Arquivo | Literais | Notas |
|---|---:|---|
| doc-toc.tsx | 1 | TOC monospace 11 |
| doc-sidebar.tsx | 2 | sidebar item 13 |

**Total UI/shadcn/preview ≈ 200 ocorrências** (bate com a métrica inicial de 199, margem de erro ±5).

---

## 7. Aliases legacy sugeridos (para Fase 3)

Para migração progressiva sem quebrar consumers, `typography.ts` pode exportar aliases. Tabela de compatibilidade:

| Preset antigo | Cobertura no novo | Alias direto? |
|---|---|---|
| `paragraph-sm` (14/400) | `body-md` | ✅ direto |
| `paragraph-base` ★ (13/400) | `body-sm` + font-normal override (se body-sm vier 500) | ⚠️ requer override |
| `paragraph-xs` (12/400) | `caption-md` | ✅ direto |
| `paragraph-md` (16/400) | `body-lg` | ✅ direto |
| `paragraph-lg` (18/400) | `body-xl` | ✅ direto |
| `paragraph-xl` (24/400) | (novo: `body-2xl`?) | ⚠️ ausente — propor |
| `label-sm` (14/500) | `body-md` + font-medium override | ⚠️ requer override |
| `label-base` ★ (13/500) | `body-sm` (se default = 500) | ✅ direto |
| `label-xs` (12/500) | `caption-md` + font-medium OU criar `body-xs`=12/500 | ⚠️ decisão |
| `label-2xs` ★ (11/500) | `caption-sm` + font-medium | ⚠️ requer override |
| `label-md` (16/500) | `body-lg` + font-medium | ⚠️ requer override |
| `label-lg` (18/500) | `body-xl` + font-medium | ⚠️ requer override |
| `label-xl` (24/500) | (novo: `body-2xl`?) | ⚠️ ausente |
| `caption-md` (13/400) | `body-sm` + font-normal override | ⚠️ requer override |
| `caption-sm` (11/400) | `caption-sm` | ✅ direto (mesmo nome) |
| `caption-xs` ★ (10/400) | `caption-xs` | ✅ direto (mesmo nome) |
| `title-sm` (14/500) | `title-sm` (14/600) | ⚠️ weight muda 500→600 |
| `title-md` (16/500) | `title-md` (16/600) | ⚠️ weight muda |
| `title-lg` (20/500) | `title-lg` (20/600) | ⚠️ weight muda |
| `subheading-md` (16/500/0.06) | `body-lg uppercase tracking-wider font-medium` | ⚠️ override pesado |
| `subheading-sm` (14/500/0.06) | `body-md uppercase tracking-wider font-medium` | ⚠️ override pesado |
| `subheading-xs` (12/500/0.04) | `caption-md uppercase tracking-wider font-medium` | ⚠️ override pesado |
| `subheading-2xs` (11/500/0.02) | `caption-sm uppercase tracking-wider font-medium` | ⚠️ override pesado |
| `subheading-strong-md` ★ (11/700/0.06) | `caption-sm font-bold uppercase tracking-wider` | ⚠️ |
| `subheading-strong-sm` ★ (10/700/0.06) | `caption-xs font-bold uppercase tracking-wider` | ⚠️ |
| `heading-xs..xl` | `heading-xs..xl` | ✅ direto |
| `display-md..2xl` | `display-md..2xl` | ✅ direto |
| `code-sm` / `code-md` | `code-sm` / `code-md` | ✅ direto |

**Conclusão**:
- ✅ 11 presets antigos têm alias **direto**
- ⚠️ 16 presets requerem **override de weight ou tracking** para equivaler
- ⚠️ `paragraph-xl` / `label-xl` (24/regular ou 500) ausentes na proposta — sugiro **adicionar `body-2xl`** ao plano

### Sugestão adicional ao plano

Adicionar **`body-2xl`** (24px) ao role body para cobrir paragraph-xl / label-xl. Ficaria:
- body-2xl: 24 / 400 / lh 32 / tracking -0.015em

Total: **24 presets** (vs 23 originais).

---

## 8. Notas de implementação para a Fase 3

### Decisões pendentes (revisar na Fase 2)

1. **Weight default em title-***: 500 (mantém legado) ou 600 (mais semibold, alinha com Material 3)?
2. **Body-xs como preset dedicado**: criar 12/500 explícito, ou sempre `caption-md font-medium`?
3. **Tracking**: substituir `tracking-[0.02em]`/`tracking-[0.06em]` literais por `tracking-wider`/`tracking-widest` (≈ 0.05em)? Diferença visual mínima mas elimina arbitrary.
4. **Aliases legacy**: manter typography.ts EXPORT duplo (novos + legados) durante toda Fase 3, ou só por algumas ondas?
5. **Solução técnica de leading**: refactor de `to-tailwind-v4.ts` (CSS var) OU `!important` pontual? Recomendação: deixar para a Fase 3 quando tivermos +1 caso de conflito.

### Ondas estimadas para Fase 3

Não calcular ainda — depende da spec final. Estimativa preliminar com 50 arquivos:
- 5-6 ondas de ~8-10 arquivos
- Pelo menos 1 onda dedicada às popovers do TableToolbar (4 arquivos densos)

### Padrões que viram preset NOVO obrigatório (se algum)

Após esta análise: **nenhum padrão isolado requer preset novo**. Todos os 13 padrões da §3 são cobertos pela proposta de 23 presets + overrides convencionados.

### Fora do escopo

- `text-[2rem]` em DocHeader / ShowcasePageV2 ícone ✦ — fluid intencional, fica
- `[font-variant-numeric:tabular-nums]` — feature opaque, não é tier tipográfico
- USAGE.md menções de `text-[13px]` — strings em doc, não classNames
- Comentários sobre `text-[13px]` — documentação, não código

---

## Notas finais

- **Data do snapshot**: 2026-05-19
- **Estado git**: 24 arquivos modificados (Ondas 1-4), unstaged
- **Audit anterior**: [.ai/audits/typography-inventory-2026-05-18.md](.ai/audits/typography-inventory-2026-05-18.md)
- **Próxima passo**: Fase 2 — spec do novo `typography.ts` + aliases + decisão técnica de leading
- **Lembrete**: nenhuma mudança em código nesta passada. Apenas audit.
