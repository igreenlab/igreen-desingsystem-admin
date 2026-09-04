---
name: spec-token
description: >
  Especificar token semântico do DS (cor, spacing, sizing, radius, shadow, tipografia).
  Sempre verifica existente antes de criar. Substitui os 4 spec-token-* específicos.
arguments:
  - name: tipo
    description: "color | spacing | sizing | radius | shadow | typography"
    required: true
---

# DS Designer — Spec de token (router único)

Esta skill substitui os antigos `spec-token-{color,spacing,sizing,typography}.md`. Mantém o checklist comum no topo e expande só a seção relevante pro tipo solicitado.

---

## ⛔ Regra 1 — verificação prévia obrigatória (vale pra TODOS os tipos)

```
Antes de propor qualquer token novo:
1. Abrir o arquivo semântico correspondente (ver tabela abaixo)
2. Existe token com valor/intenção similar?
   Sim → usar o existente. NÃO criar.
   Não → justificar por que nenhum existente serve → prosseguir pra spec
```

| Tipo | Arquivo a ler primeiro | Doc de referência |
|------|------------------------|-------------------|
| color | `tokens/brands/default/semantic/color-light.ts` + `color-dark.ts` | `.ai/context/tokens/color.md` |
| spacing | `tokens/brands/default/semantic/spacing.ts` | `.ai/context/tokens/spacing.md` |
| sizing | `tokens/brands/default/components/sizing.ts` | `.ai/context/tokens/sizing-shape-elevation.md` |
| radius | `tokens/brands/default/semantic/shape.ts` | `.ai/context/tokens/sizing-shape-elevation.md` |
| shadow | `tokens/brands/default/semantic/elevation.ts` | `.ai/context/tokens/sizing-shape-elevation.md` |
| typography | `tokens/brands/default/semantic/typography.ts` | `.ai/context/tokens/typography.md` |

---

## ⛔ Regra 2 — Spec deve incluir perspectiva Strategist

Toda spec entregue ao Orchestrator pra gate inclui:

- **Token proposto** — nome, valor, role
- **Alternativas descartadas** — quais tokens existentes foram considerados e por que não servem
- **Assumption central** — o que precisa ser verdade pra essa decisão funcionar (ex: "valor 0.625rem cobre o gap entre caption-md (0.75rem) e a próxima escala menor")
- **Impacto** — quais componentes esperam usar

---

## Após aprovação (qualquer tipo)

```
1. Adicionar token no arquivo semântico
2. (se dark mode) adicionar equivalente em color-dark.ts
3. npm run tokens:tw4
4. Validar utility class gerada
5. Handoff: TOKEN_SPEC_PRONTA: <nome>
```

---

## Seção específica — abra apenas a relevante

### → Tipo: `color`

Arquitetura:
```
color-palette.ts (primitivo OKLCH)
  brand · brandContrast · gray · success/warning/caution/danger/info · white · black · alpha
       ↓
color-light.ts + color-dark.ts (semântico)
  bg.* · fg.* · border.* · ring.* · overlay.* · chart.*
```

⚠️ Não existe primitivo `neutral` — o neutro se chama `gray`. `alpha` só tem `black` e
`white`. `brandContrast` existe porque no dark a família brand troca pra um tom mais
claro (verde escuro não contrasta com near-black).

Roles:

| Role | Uso |
|------|-----|
| `bg.*` | Fundos de superfície, containers, estados |
| `fg.*` | Texto e ícones (sem namespace separado pra ícone) |
| `border.*` | Bordas e dividers |
| `ring.*` | Focus rings — NUNCA usar `border` pra isso |
| `overlay.*` | Scrim, backdrop |
| `chart.*` | Séries de gráfico (`chart-1..5`) + `chart-grid` |

Sufixos:

- `on-*` — texto projetado pra sentar sobre cor específica (`fg.on-brand` = texto sobre
  o verde da marca; a marca `default` é **verde**, azul é a marca `blue`)

⚠️ **O tom sutil depende da FAMÍLIA, não do papel** (CLAUDE.md §Nomenclatura):

| Família | Tom sutil | Não existe |
|---|---|---|
| status (`success`/`warning`/`caution`/`danger`/`info`) | `bg.{cor}-muted` · `border.{cor}-muted` | `bg.success-subtle` · `border.warning` cru |
| `brand` | `bg.brand-subtle` | — |
| neutro (sem cor) | `bg.subtle` · `fg.subtle` · `border.subtle` | — |

Obrigatórias por cor nova: o tom sutil da família dela + `fg.on-{cor}` (texto sobre sólido).

Fluxo: primitivo existe em palette? → adicionar em light + dark + `on-*` + tom sutil da
família → `npm run tokens:tw4`.

**Nomes extintos (V2) → nome atual.** A direção é da esquerda pra direita — o da esquerda
**não emite CSS** e a classe some em silêncio:

`fg.primary`→`fg.brand` · `bg.primary`→`bg.brand` · `fg.foreground`→`fg.default` ·
`border.main`→`border.default` · `bg.page`→`bg.canvas` · `border.focus`→`ring.*` ·
`critical`→`danger` · `icon.*`→`fg.*` · `bg.disabled`→**não existe** (use
`opacity-50`; só `fg.disabled` existe)

---

### → Tipo: `spacing`

Grupos (arquivo: `semantic/spacing.ts`):

| Grupo | CSS var | Classe | Uso |
|-------|---------|--------|-----|
| `gap` | `--spacing-gp-*` | `gap-gp-*` | Entre filhos flex/grid, icon-to-label |
| `space` | `--spacing-sp-*` | `p-sp-*`, `m-sp-*` | Espaço genérico, margin, offset |
| `pad` | `--spacing-pad-*` | `px-pad-*` | Padding interno de componente |

⚠️ **Os 3 grupos compartilham a MESMA escala.** `gap.lg`, `space.lg` e `pad.lg` valem
todos 10px — o que muda é a intenção (e por consequência a classe), não o valor. A tabela
abaixo tinha 3 colunas de valores divergentes; era falsa desde a unificação da escala.

| Degrau | Valor | Classes |
|---|---|---|
| `2xs` | 2px | `gap-gp-2xs` · `p-sp-2xs` · `px-pad-2xs` |
| `xs` | 4px | `gap-gp-xs` · `p-sp-xs` · `px-pad-xs` |
| `sm` | 6px | `gap-gp-sm` · `p-sp-sm` · `px-pad-sm` |
| `md` | 8px | `gap-gp-md` · `p-sp-md` · `px-pad-md` |
| `lg` | 10px | `gap-gp-lg` · `p-sp-lg` · `px-pad-lg` |
| `xl` | 12px | `gap-gp-xl` · `p-sp-xl` · `px-pad-xl` |
| `2xl` | 16px | `gap-gp-2xl` · `p-sp-2xl` · `px-pad-2xl` |
| `3xl` | 20px | `gap-gp-3xl` · `p-sp-3xl` · `px-pad-3xl` |
| `4xl` | 24px | `gap-gp-4xl` · `p-sp-4xl` · `px-pad-4xl` |
| `5xl` | 28px | `gap-gp-5xl` · `p-sp-5xl` · `px-pad-5xl` |
| `6xl` | 32px | `gap-gp-6xl` · `p-sp-6xl` · `px-pad-6xl` |
| `7xl` | 48px | `gap-gp-7xl` · `p-sp-7xl` · `px-pad-7xl` |

Além destes: `gap.base`/`space.base` (16px), `pad.base` (12px) e `space.px` (1px).

**Form: `gap-form-gap` (20px), não `gap-gp-*`** — L-024. Vale pra qualquer form, drawer ou
modal com 2+ FormField empilhados, inclusive dentro de grid.

Tokens de componente (`components/spacing.ts`):

| Token | Classe | Valor | Uso |
|-------|--------|-------|-----|
| `padCard.base` | `p-pad-card-base` | 24px | Card default |
| `padCard.sm` | `p-pad-card-sm` | 16px | Card compacto |
| `padPage.base` | `px-pad-page-base` | 24px | Page padding default |
| `padPage.sm` | `px-pad-page-sm` | 16px | Mobile |
| `padPage.lg` | `px-pad-page-lg` | 40px | Desktop wide |

Escolher grupo:

| Situação | Grupo |
|----------|-------|
| Gap entre ícone e texto em botão | `gap` → `gap-gp-md` |
| Gap entre cards na grid | `gap` → `gap-gp-xl` |
| Padding botão/input (horizontal) | `pad` → `px-pad-lg` |
| Padding de card | `padCard` → `p-pad-card-base` |
| Padding lateral de página | `padPage` → `px-pad-page-base` |
| Margin/offset genérico | `space` → `m-sp-md` |

NUNCA Tailwind literal com equivalente DS: `gap-4`→`gap-gp-md` · `p-4`→`p-sp-md` · `px-3`→`px-pad-lg`.

---

### → Tipo: `sizing`

Form heights — controles interativos (`components/sizing.ts`):
`--spacing-form-*` → `min-h-form-*`

| Token | Valor | Uso |
|-------|-------|-----|
| `form.3xs` | 20px | badge micro, tab compacto |
| `form.2xs` | 24px | badge, tabs item |
| `form.xs` | 28px | button xxs |
| `form.sm` | 32px | button xs, input xs |
| `form.md` | 36px | desktop compacto |
| `form.lg` | 40px | **desktop default** |
| `form.xl` | 44px | **WCAG mobile** |

Icon sizes: `icon.2xs` 8 · `xs` 12 · `sm` 16 · **`md` 20 (default)** · `lg` 24 · `xl` 32 ·
`2xl` 40 · `3xl` 48px

Container widths (`--container-*` → `max-w-*`):
`xs` 480 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440 · `3xl` 1920 ·
`main-content-max` 1368 · `prose` 65ch · `sidebar-sm/lg` · `modal-sm/lg` ·
`dropdown-sm/lg` · `tooltip-sm/md/lg` · `drawer-sm/md/lg`

⚠️ **`container` é a ÚNICA exceção que não dobra o prefixo** (L-057): a classe é
`max-w-md` (768px do DS), **não** `max-w-container-md` — esta não existe e não emite CSS.

Layout heights: `navbar` 64px · `toolbar` 48px · `tab-bar` 56px · `header-sm/md/lg` 80/96/128px

NUNCA height fixo: `h-[44px]`/`h-11` → `min-h-form-xl`.

---

### → Tipo: `radius`

Arquivo: `semantic/shape.ts`. CSS var `--radius-radius-*` → classe `rounded-radius-*` (prefixo duplo INTENCIONAL pra evitar colisão com `rounded-sm/md/lg` TW nativo).

Todos derivam de `RADIUS_BASE = 0.625rem = 10px`:

| Token | Multiplicador | Valor | Uso |
|-------|---|-------|-----|
| `radius.none` | — | 0 | reset |
| `radius.xs` | ×0.4 | 4px | sutil |
| `radius.sm` | ×0.6 | 6px | chips, tags |
| `radius.md` | ×0.8 | 8px | botão pequeno (2xs/xs) |
| `radius.lg` | ×1.0 | **10px** | botão/input (sm→lg) |
| `radius.base` | ×1.0 | **10px** | **alias de `lg`** |
| `radius.xl` | ×1.4 | 14px | cards |
| `radius.2xl` | ×1.8 | 18px | painéis |
| `radius.3xl` | ×2.2 | 22px | superfícies grandes |
| `radius.4xl` | ×2.6 | 26px | (era o valor antigo de `base`) |
| `radius.full` | — | 9999px | pills, avatars |

⚠️ **`radius.base` vale 10px, não 26px.** Ele é alias de `lg`; os 26px migraram pro `4xl`.
Prefira o nome do degrau (`rounded-radius-lg`) ao alias — é o que os componentes usam.

Relação form → radius, medida no `Button` real:
- `form.md/lg/xl` (sm→lg) → `rounded-radius-lg` (10px)
- `form.xs/sm` (2xs/xs) → `rounded-radius-md` (8px)
- `form.2xs/3xs` → `rounded-radius-full` (pill)

NUNCA `rounded-sm`, `rounded-md`, `rounded-lg` (são TW nativo, valores diferentes dos tokens DS).

---

### → Tipo: `shadow`

Arquivo: `semantic/elevation.ts`. CSS var `--shadow-sh-*` → classe `shadow-sh-*` (prefixo `sh` INTENCIONAL — colisão com `shadow-sm/md/lg` TW nativo).

| Token | Uso |
|-------|-----|
| `shadow.none` | reset |
| `shadow.sm` | Card repouso, inputs |
| `shadow.md` | Card hover |
| `shadow.lg` | Dropdown, popover |
| `shadow.xl` | Modal |
| `shadow.2xl` | Toast |
| `shadow.aside` | Sidebar/drawer |
| `shadow.ring` · `ring-danger` · `ring-warning` · `ring-success` · `ring-info` | Foco por box-shadow (`focus-visible:shadow-sh-ring`) |

⚠️ **Não existem** `shadow.base`, `shadow.3xl`, `shadow.inner` nem `shadow.focus-*` — a
lista acima é completa.

Dark mode: opacidade ≥ 2× do light (L-011).
NUNCA `shadow-sm`, `shadow-md`, `shadow-lg` (TW nativo).

⚠️ **Shadow não é dark-aware por `var()`** (L-043): o Tailwind v4 **inlina** o valor da
`@theme` na utility, então `.dark { --shadow-* }` é código morto. O transform resolve com
indireção — `@theme inline { --shadow-sh-*: var(--ds-sh-*) }` + `:root`/`.dark { --ds-sh-* }`.
Não declare sombra dark direto no `.dark{}`.

zIndex: `dropdown` 100 · `sticky` 200 · `overlay` 300 · `modal` 400 · `popover` 500 · `toast` 600 · `tooltip` 700

---

### → Tipo: `typography`

Sistema:
- Presets **≥ 32px** (display, heading sm→xl) → `clamp()` fluid, lineHeight unitless
- Presets **< 32px** → `rem` estático, lineHeight em rem
- **NUNCA px** em nenhum preset (Figma mostra px → dividir por 16 pra rem)

Presets por role (7 roles, 27 presets):

**display** (hero — fluid `clamp()`): `display-2xl` · `display-xl` · `display-lg` · `display-md`

**heading** (títulos de página): fluido `heading-xl/lg/md/sm` (clamp); estático `heading-xs` 1.5rem/24px

**title** (cards/seções — weight **600** default): `title-lg` 1.25rem/20 · `title-md` 1rem/16 · `title-sm` 0.875rem/14

**body** (interativo + leitura): `body-2xl` · `body-xl` · `body-lg` · `body-md` 0.875rem/14 (leitura, w400) · **`body-sm` 0.8125rem/13 — DEFAULT do projeto; interativo = w500** · `body-xs` 0.75rem/12 (w500)

**caption** (auxiliar/metadados — w400): `caption-md` 0.75rem/12 · `caption-sm` 0.6875rem/11 · `caption-xs` 0.625rem/10

**stat** (valor de KPI/métrica — estático, bold): `stat-xl` 34px · `stat-lg` 30px ·
`stat-md` 24px · `stat-sm` 20px. Use sempre com `tabular-nums`. É o role que substitui o
`text-[Npx]` na unha em número de indicador — nunca `display-*` nem `heading-*` pra isso.

**code**: `code-md` 1rem · `code-sm` 0.8125rem

> ⚠️ **NÃO existem** `label-*`, `paragraph-*` nem `subheading-*` (removidos no rewrite 2026-05-19). Peso vem por override Tailwind sobre o preset (`font-semibold`/`font-medium`/`font-normal`), nunca por preset separado. Ao criar preset novo: registrar em `src/utils/tv.ts` `twMergeConfig` (L-016).

Uso por componente:

| Componente | Preset |
|------------|--------|
| Button | `body-sm font-semibold` (13/600) |
| Input value / Select | `body-sm` |
| Label de campo (FormField) | `body-sm font-semibold` |
| Helper text | `caption-md` |
| Badge / Chip | `body-xs` (ou `caption-md`) |
| Tabs item | `body-sm` |
| Card title | `title-md` |
| Valor de KPI / métrica | `stat-{sm\|md\|lg\|xl}` + `tabular-nums` |

Regras:
```typescript
// ❌ NUNCA combinar avulsos
"text-[14px] font-medium leading-5"
"text-sm font-semibold"

// ✅ SEMPRE preset composto (27 presets em 7 roles)
"text-body-sm font-semibold"   // 13/600 — Button labels, interactive
"text-body-sm"                  // 13/500 — body default do projeto
"text-title-sm"                 // 14/600 — section titles
```

Os 7 roles são `display | heading | title | body | caption | stat | code` — `stat-{sm,md,lg,xl}` (20/24/30/34px, estático, bold) é o valor de KPI/métrica, sempre com `tabular-nums`. **Não existem mais** `paragraph-*`, `label-*` ou `subheading-*` — substituições no shadcn-token-map.md. Override de peso via Tailwind nativo (`font-semibold`, `font-medium`, etc.) sobre o preset.
