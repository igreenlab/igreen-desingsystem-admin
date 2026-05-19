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
- **Assumption central** — o que precisa ser verdade pra essa decisão funcionar (ex: "valor 0.625rem cobre o gap entre paragraph-xs (0.75rem) e a próxima escala menor")
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
  brand[0-1000] · neutral[0-950] · success/warning/danger/info[50-950]
  alpha.black/white/neutral/brand [10-64]
       ↓
color-light.ts + color-dark.ts (semântico)
  bg.* · fg.* · border.* · ring.* · overlay.*
```

Roles:

| Role | Uso |
|------|-----|
| `bg.*` | Fundos de superfície, containers, estados |
| `fg.*` | Texto e ícones (sem namespace separado pra ícone) |
| `border.*` | Bordas e dividers |
| `ring.*` | Focus rings — NUNCA usar `border` pra isso |
| `overlay.*` | Scrim, backdrop |

Sufixos:

- `*-inverted` — mesmo papel, fundo invertido (`fg.foreground-inverted` = texto claro em fundo escuro tipo tooltip)
- `on-*` — texto projetado pra sentar sobre cor específica (`fg.on-primary` = texto branco sobre azul da marca)

Variantes obrigatórias por cor de marca/status: `bg.{cor}-subtle` (alerts, banners), `bg.{cor}-muted` (intermediário), `fg.on-{cor}` (texto sobre sólido).

Fluxo: primitivo existe em palette? → adicionar em light + dark + on-* + subtle/muted → `npm run tokens:tw4`.

Nomes proibidos: `fg.brand`→`fg.primary` · `bg.page`→`bg.canvas` · `border.default`→`border.main` · `border.focus`→`ring.*` · `critical`→`danger` · `icon.*`→`fg.*`

---

### → Tipo: `spacing`

Grupos (arquivo: `semantic/spacing.ts`):

| Grupo | CSS var | Classe | Uso |
|-------|---------|--------|-----|
| `gap` | `--spacing-gp-*` | `gap-gp-*` | Entre filhos flex/grid, icon-to-label |
| `space` | `--spacing-sp-*` | `p-sp-*`, `m-sp-*` | Espaço genérico, margin, offset |
| `pad` | `--spacing-pad-*` | `px-pad-*` | Padding interno de componente |

Escala base 4px × n:

| Token gap | Valor | Token space | Valor | Token pad | Valor |
|-----------|-------|-------------|-------|-----------|-------|
| `gap.2xs` | 2px | `space.2xs` | 2px | `pad.2xs` | 2px |
| `gap.xs` | 4px | `space.xs` | 4px | `pad.xs` | 4px |
| `gap.sm` | 6px | `space.sm` | 8px | `pad.sm` | 6px |
| `gap.md` | 8px | `space.md` | 16px | `pad.md` | 8px |
| `gap.lg` | 12px | `space.lg` | 24px | `pad.lg` | 12px |
| `gap.xl` | 16px | `space.xl` | 32px | `pad.xl` | 14px |
| `gap.2xl` | 24px | `space.2xl` | 48px | `pad.2xl` | 16px |
| `gap.3xl` | 32px | | | `pad.3xl` | 24px |

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

Icon sizes: `icon.sm` 16px · `icon.md` 20px (default) · `icon.lg` 24px · `icon.xl` 32px

Container widths (`--container-*` → `max-w-container-*`):
`xs` 480 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440 · `main-content-max` 1368
`sidebar-md` 280 · `modal-md` 640 · `dropdown-md` 240

Layout heights: `navbar` 64px · `toolbar` 48px · `tab-bar` 56px · `header-sm/md/lg` 80/96/128px

NUNCA height fixo: `h-[44px]`/`h-11` → `min-h-form-xl`.

---

### → Tipo: `radius`

Arquivo: `semantic/shape.ts`. CSS var `--radius-radius-*` → classe `rounded-radius-*` (prefixo duplo INTENCIONAL pra evitar colisão com `rounded-sm/md/lg` TW nativo).

| Token | Valor | Uso |
|-------|-------|-----|
| `radius.xs` | 4px | sutil |
| `radius.md` | 8px | inputs |
| `radius.3xl` | 22px | badges, componentes menores |
| `radius.base` | 26px | **DEFAULT componentes interativos** |
| `radius.full` | 9999px | pills, avatars |

Relação form → radius:
- `form.lg/xl` → `rounded-radius-base` (26px)
- `form.xs/sm` → `rounded-radius-3xl` (22px)
- `form.2xs/3xs` → `rounded-radius-full` (pill)

NUNCA `rounded-sm`, `rounded-md`, `rounded-lg` (são TW nativo, valores diferentes dos tokens DS).

---

### → Tipo: `shadow`

Arquivo: `semantic/elevation.ts`. CSS var `--shadow-sh-*` → classe `shadow-sh-*` (prefixo `sh` INTENCIONAL — colisão com `shadow-sm/md/lg` TW nativo).

| Token | Uso |
|-------|-----|
| `shadow.sm` | Card repouso, inputs |
| `shadow.md` | Card hover |
| `shadow.lg` | Dropdown, popover |
| `shadow.xl` | Modal |
| `shadow.2xl` | Toast |

Dark mode: opacidade ≥ 2× do light (L-011).
NUNCA `shadow-sm`, `shadow-md`, `shadow-lg` (TW nativo).

zIndex: `dropdown` 100 · `sticky` 200 · `overlay` 300 · `modal` 400 · `popover` 500 · `toast` 600 · `tooltip` 700

---

### → Tipo: `typography`

Sistema:
- Presets **≥ 32px** (display, heading sm→xl) → `clamp()` fluid, lineHeight unitless
- Presets **< 32px** → `rem` estático, lineHeight em rem
- **NUNCA px** em nenhum preset (Figma mostra px → dividir por 16 pra rem)

Presets por categoria:

**display** (hero — fluid): `display-2xl` clamp(2.5→4.75rem) · `display-xl` clamp(2.25→3.8rem) · `display-lg` clamp(2→3rem) · `display-md` clamp(1.75→2.4rem)

**heading** (títulos de página): fluido `heading-xl/lg/md/sm` (clamp); estático `heading-xs` 1.5rem · `heading-2xs` 1.25rem

**title** (cards — estático, weight 500): `title-lg` 1.25rem · `title-md` 1rem · `title-sm` 0.875rem

**label** (botões, inputs, tabs — weight 500): `label-xl` 1.5rem · `label-lg` 1.125rem · `label-md` 1rem · `label-sm` 0.875rem · `label-xs` 0.75rem

**paragraph** (texto corrido — weight 400, mesmos tamanhos que label): `paragraph-xl/lg/md/sm/xs`

**subheading** (categorias — letter-spacing positivo): `subheading-md` 1rem · `subheading-sm` 0.875rem · `subheading-xs` 0.75rem · `subheading-2xs` 0.6875rem

**caption** (auxiliar): `caption-md` 0.8125rem · `caption-sm` 0.6875rem

**code**: `code-md` 1rem · `code-sm` 0.8125rem

Uso por componente:

| Componente | Preset |
|------------|--------|
| Button | `label-sm` |
| Input value | `paragraph-sm` |
| Label de campo | `label-sm` |
| Helper text | `paragraph-xs` |
| Badge sm | `subheading-2xs` |
| Badge md | `label-xs` |
| Tabs item | `label-sm` |
| Card title | `label-md` |

Regras:
```typescript
// ❌ NUNCA combinar avulsos
"text-[14px] font-medium leading-5"
"text-sm font-semibold"

// ✅ SEMPRE preset composto
"text-label-sm"
"text-paragraph-sm"
"text-subheading-2xs"
```

`label` vs `paragraph` = mesmo tamanho, peso diferente (500 vs 400). `subheading` = letter-spacing positivo. `caption` ≠ `subheading-2xs` (caption tem letter-spacing neutro).
