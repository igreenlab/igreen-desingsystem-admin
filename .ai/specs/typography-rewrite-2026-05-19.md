# Typography rewrite — spec da Fase 2

> Spec do novo `tokens/brands/default/semantic/typography.ts` enxuto.
> Substitui completamente o atual (32 presets → 24 presets em 6 roles).
> Base: audit pós-Ondas em `.ai/audits/typography-inventory-2026-05-19.md`.
>
> **Princípio mandatório**: zero mudança visual. O preset herda o weight
> mais usado hoje; quem usar outro weight faz override inline.
> A escala discreta de pixels permanece intacta (10/11/12/13/14/16/18/20/24).

---

## Decisões consolidadas

Baseado nas respostas do usuário às 5 perguntas:

| # | Decisão | Resposta do usuário |
|---|---|---|
| 1 | `title-*` weight default | **600 (semibold)** — mais usado (56× vs 2× bold) |
| 2 | `body-xs` como preset dedicado | **Sim** — 12/500 (substitui label-xs sem mudar visual) |
| 3 | Tracking literais | **Manter os custom** (`0.02em`, `0.06em`) onde já estão — mudar para preset Tailwind alteraria visual |
| 4 | Aliases legacy | **Não** — migração direta nome antigo → nome novo, arquivo limpo |
| 5 | Solução técnica de `leading-X` | **Refactor pontual** — leading/weight/tracking nas classes devem sobrepor tipografia normalmente como Tailwind faz nativo |

**Princípio geral**: criar padrão, mas SEM ALTERAR VISUAL. Se 2 lugares usam weight 600 onde o preset default é 500, o componente fica com `text-X font-semibold` — preset cobre size+lh+tracking, override cobre weight.

---

## 1. Nova arquitetura de `typography.ts`

### 6 roles, 24 presets

```ts
// tokens/brands/default/semantic/typography.ts (novo)

// Hierarquia visual:
//   display    — hero/marketing (fluid clamp)
//   heading    — page titles (fluid sm→xl, estático xs)
//   title      — section/card title (estático, weight 600 default)
//   body       — texto corrido + interactive (estático)
//   caption    — meta/helper/microlabel (estático, weight 400 default)
//   code       — mono (estático)

export const display: Record<string, TypographyPreset> = {
  "display-md":  { fontSize: "clamp(1.75rem, calc(1.465rem + 1.215vw), 2.4375rem)", ... },
  "display-lg":  { fontSize: "clamp(2rem, calc(1.560rem + 1.878vw), 3.0625rem)", ... },
  "display-xl":  { fontSize: "clamp(2.25rem, calc(1.603rem + 2.762vw), 3.8125rem)", ... },
  "display-2xl": { fontSize: "clamp(2.5rem, calc(1.568rem + 3.978vw), 4.75rem)", ... },
}

export const heading: Record<string, TypographyPreset> = {
  "heading-xs": { fontSize: "1.5rem", lineHeight: "2rem", weight: 600 },   // 24/600
  "heading-sm": { fontSize: "clamp(1.5rem, calc(1.293rem + 0.884vw), 2rem)", weight: 500 },
  "heading-md": { fontSize: "clamp(1.75rem, calc(1.439rem + 1.326vw), 2.5rem)", weight: 500 },
  "heading-lg": { fontSize: "clamp(2rem, calc(1.586rem + 1.768vw), 3rem)", weight: 500 },
  "heading-xl": { fontSize: "clamp(2.25rem, calc(1.732rem + 2.210vw), 3.5rem)", weight: 500 },
}

export const title: Record<string, TypographyPreset> = {
  "title-sm": { fontSize: "0.875rem", lineHeight: "1.25rem", weight: 600, tracking: "-0.006em" },  // 14/600
  "title-md": { fontSize: "1rem",     lineHeight: "1.5rem",  weight: 600, tracking: "-0.011em" },  // 16/600
  "title-lg": { fontSize: "1.25rem",  lineHeight: "1.75rem", weight: 600, tracking: "0em" },      // 20/600
}

export const body: Record<string, TypographyPreset> = {
  "body-xs":  { fontSize: "0.75rem",   lineHeight: "1rem",     weight: 500, tracking: "0em" },        // 12/500 (interactive)
  "body-sm":  { fontSize: "0.8125rem", lineHeight: "1.125rem", weight: 500, tracking: "-0.003em" },   // 13/500 (interactive, body default do projeto)
  "body-md":  { fontSize: "0.875rem",  lineHeight: "1.25rem",  weight: 400, tracking: "-0.006em" },   // 14/400 (body padrão)
  "body-lg":  { fontSize: "1rem",      lineHeight: "1.5rem",   weight: 400, tracking: "-0.011em" },   // 16/400
  "body-xl":  { fontSize: "1.125rem",  lineHeight: "1.5rem",   weight: 400, tracking: "-0.015em" },   // 18/400
  "body-2xl": { fontSize: "1.5rem",    lineHeight: "2rem",     weight: 400, tracking: "-0.015em" },   // 24/400
}

export const caption: Record<string, TypographyPreset> = {
  "caption-xs": { fontSize: "0.625rem",  lineHeight: "0.75rem",   weight: 400, tracking: "0em" },   // 10/400
  "caption-sm": { fontSize: "0.6875rem", lineHeight: "0.875rem",  weight: 400, tracking: "0em" },   // 11/400
  "caption-md": { fontSize: "0.75rem",   lineHeight: "1rem",      weight: 400, tracking: "0em" },   // 12/400
}

export const code: Record<string, TypographyPreset> = {
  "code-sm": { fontSize: "0.8125rem", lineHeight: "1.6", weight: 400, fontFamily: mono }, // 13 mono
  "code-md": { fontSize: "1rem",      lineHeight: "1.6", weight: 400, fontFamily: mono }, // 16 mono
}
```

Total: 4 display + 5 heading + 3 title + 6 body + 3 caption + 2 code = **23 presets**.

(Audit sugeriu `body-2xl` 24px — incluso na tabela acima como 6º body. Total real: **24 presets**.)

### Weight default por role (regra explícita)

| Role | Weight default | Razão |
|---|---:|---|
| display | 600 (semibold) ou 700 (bold) | conforme tier — display-2xl/xl bold (hero), -lg/md/sm semibold |
| heading | 500 (medium) ou 600 (xs estático) | aligned com Material/Carbon — large heads são lighter |
| title | **600 (semibold)** | mais usado (56× vs 2× bold) |
| body-xs/sm | 500 (medium) | interactive (button, dropdown, input, table cell) |
| body-md/lg/xl/2xl | 400 (regular) | body corrido, descriptions |
| caption | 400 (regular) | meta info, helpers |
| code | 400 (regular) | mono |

---

## 2. Mapeamento direto antigo → novo (sem aliases, sem duplicidade)

Tabela de substituição **literal** que o Edit fará na Fase 3 (componente por componente).

### Presets com nome igual ou alias direto

| Antigo | Novo | Override necessário? |
|---|---|---|
| `caption-xs` | `caption-xs` | nenhum |
| `caption-sm` | `caption-sm` | nenhum |
| `code-sm` / `code-md` | `code-sm` / `code-md` | nenhum |
| `heading-xs..xl` | `heading-xs..xl` | nenhum |
| `display-md..2xl` | `display-md..2xl` | nenhum |

### Presets com substituição via override

| Antigo | Novo + override | Razão |
|---|---|---|
| `paragraph-xs` (12/400) | `caption-md` | regular 12 = caption-md |
| `paragraph-sm` (14/400) | `body-md` | regular 14 |
| `paragraph-base` ★ (13/400) | `body-sm font-normal` | body-sm default = 500, override pra 400 |
| `paragraph-md` (16/400) | `body-lg` | regular 16 |
| `paragraph-lg` (18/400) | `body-xl` | regular 18 |
| `paragraph-xl` (24/400) | `body-2xl` | regular 24 |
| `label-xs` (12/500) | `body-xs` | direto, mesmo size+weight |
| `label-sm` (14/500) | `body-md font-medium` | body-md default = 400, override |
| `label-base` ★ (13/500) | `body-sm` | direto, mesmo size+weight |
| `label-2xs` ★ (11/500) | `caption-sm font-medium` | caption-sm default = 400 |
| `label-md` (16/500) | `body-lg font-medium` | override |
| `label-lg` (18/500) | `body-xl font-medium` | override |
| `label-xl` (24/500) | `body-2xl font-medium` | override |
| `caption-md` (13/400) | `body-sm font-normal` | override de weight |
| `title-sm` (14/500) | `title-sm font-medium` | title default = 600, override down |
| `title-md` (16/500) | `title-md font-medium` | override down |
| `title-lg` (20/500) | `title-lg font-medium` | override down |
| `subheading-md` (16/500/0.06em) | `body-lg font-medium uppercase tracking-wider` | override pesado |
| `subheading-sm` (14/500/0.06em) | `body-md font-medium uppercase tracking-wider` | override pesado |
| `subheading-xs` (12/500/0.04em) | `caption-md font-medium uppercase tracking-wider` | override (0.04em ≈ wider 0.05em — diff mínimo, aceitar) |
| `subheading-2xs` (11/500/0.02em) | `caption-sm font-medium uppercase tracking-[0.02em]` | tracking custom mantém literal |
| `subheading-strong-md` ★ (11/700/0.06em) | `caption-sm font-bold uppercase tracking-wider` | direto via override |
| `subheading-strong-sm` ★ (10/700/0.06em) | `caption-xs font-bold uppercase tracking-wider` | direto |

### Verificação visual zero-change

Quando o legado já bate com weight default do novo, **não muda visual**:
- `paragraph-sm` → `body-md` ✅ (ambos 14/400)
- `label-xs` → `body-xs` ✅ (ambos 12/500)
- `label-base` → `body-sm` ✅ (ambos 13/500)

Quando weight é diferente, **override inline** preserva visual atual.

---

## 3. Refactor técnico: leading/weight/tracking devem sobrepor normalmente

Conforme decisão #5 do usuário: o override em `className` (Tailwind) **deve vencer** sobre o preset.

### Problema técnico atual

Em [tokens/transforms/to-tailwind-v4.ts:260-282](tokens/transforms/to-tailwind-v4.ts), cada preset gera:

```css
@utility text-paragraph-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  letter-spacing: -0.006em;
  font-family: var(--font-sans, ...);
}
```

Tailwind v4 cascata `@utility` em algumas combinações vence sobre regras nativas. Documentado no incidente do `shadcn/label.tsx` (label-base + leading-none → label-base venceu).

### Solução: CSS variables com fallback

Modificar o transform para gerar:

```css
@utility text-paragraph-sm {
  font-size: 0.875rem;
  line-height: var(--text-lh-override, 1.25rem);
  font-weight: var(--text-weight-override, 400);
  letter-spacing: var(--text-tracking-override, -0.006em);
  font-family: var(--font-sans, 'Geist', system-ui, sans-serif);
}
```

E **NÃO modificar** as utilities `leading-X`, `font-X`, `tracking-X` do Tailwind (elas já setam `line-height`, `font-weight`, `letter-spacing` direto, e devem vencer por specificity natural do Tailwind v4).

**Investigação prévia necessária na Fase 3** antes de aplicar refactor:

1. Reproduzir o conflito do label.tsx num caso isolado
2. Testar se ordem de classes no `className` muda comportamento (`text-X leading-Y` vs `leading-Y text-X`)
3. Testar se basta colocar `@utility` em ordem específica no CSS gerado
4. Se nada disso resolver, aplicar a opção CSS var

**Alternativa rápida** (se CSS var falhar): adicionar `!important` apenas onde override falha. Mapear cada caso em commit dedicado.

### Caso de teste antes do refactor

Criar isoladamente em uma DocPage de teste:
```tsx
<p className="text-body-sm leading-none">Teste leading-none</p>
<p className="text-body-sm">Teste sem leading</p>
```

Inspeção DOM deve mostrar:
- 1º com `line-height: 1` (leading-none vence)
- 2º com `line-height: 1.125rem` (preset default)

Se passar: nenhum refactor necessário, regra está OK.
Se falhar: aplicar CSS var.

---

## 4. Regra de uso (vai pra .claude/rules/ds-standards.md após Fase 4)

```
Uso de tipografia:

1. Composição cobre 100%? → use só o preset
   className="text-body-md"

2. Override de 1 atributo (weight, leading, tracking)?
   → use preset + Tailwind nativo
   className="text-body-md font-semibold"
   className="text-body-md leading-none"
   className="text-body-md tracking-wider"

3. 2+ overrides ou tracking custom?
   → use preset + Tailwind nativo + literal apenas no tracking
   className="text-body-md font-semibold leading-none tracking-[0.02em]"

4. NUNCA usar text-[Npx] (Tailwind arbitrary) — sempre preset DS

5. Aceitar literal apenas em:
   - Ícones Unicode decorativos (text-[2rem])
   - DocHeader fluid intencional (text-[2rem])
```

---

## 5. Estrutura final do typography.ts

```ts
/**
 * typography.ts — Semantic typography tokens (composite)
 *
 * 6 roles: display, heading, title, body, caption, code
 * 24 presets totais
 *
 * Weight default por role:
 *   - display/heading: depende do tier (semibold→bold)
 *   - title: 600 (semibold) — mais usado no projeto
 *   - body-xs/sm: 500 (medium) — interactive (button, dropdown, input)
 *   - body-md/lg/xl/2xl: 400 (regular) — body corrido
 *   - caption: 400 (regular)
 *   - code: 400 (regular)
 *
 * Override convencional via Tailwind nativo:
 *   - font-bold/semibold/medium — peso diferente
 *   - leading-none/snug/relaxed/[1.X] — line-height
 *   - tracking-wider/widest/[Xem] — letter-spacing
 *
 * Migration log:
 *   - 2026-05-19: rewrite enxuto. 32 → 24 presets. Eliminados: paragraph-*,
 *     label-*, subheading-* (substituídos por body-* + caption-* + overrides).
 *     Decimais e órfãos já haviam sido removidos nas Ondas 1-4 (2026-05-19).
 */

import { fontWeight, fontFamily, letterSpacing } from "../primitives/fonts";

interface TypographyPreset {
  fontSize:      string;
  lineHeight:    string;
  fontWeight:    string;
  letterSpacing: string;
  fontFamily:    string;
}

// ─── Display ────────────────────────────────────
export const display = { ... }   // 4 presets (md/lg/xl/2xl)

// ─── Heading ────────────────────────────────────
export const heading = { ... }   // 5 presets (xs/sm/md/lg/xl)

// ─── Title ──────────────────────────────────────
export const title = { ... }     // 3 presets (sm/md/lg) — default weight 600

// ─── Body ───────────────────────────────────────
export const body = { ... }      // 6 presets (xs/sm/md/lg/xl/2xl)

// ─── Caption ────────────────────────────────────
export const caption = { ... }   // 3 presets (xs/sm/md)

// ─── Code ───────────────────────────────────────
export const code = { ... }      // 2 presets (sm/md)

// ─── Export agrupado ─────────────────────────────
export const typography = {
  ...display,
  ...heading,
  ...title,
  ...body,
  ...caption,
  ...code,
} as const;

export type TypographyToken = typeof typography;
export type TypographyKey   = keyof typeof typography;
```

---

## 6. Próximos passos (Fase 3, ondas)

### Pré-condição
- Spec aprovada (esta) → gate
- Testar o conflito de `leading-X` num caso isolado antes de aplicar refactor

### Ordem das ondas (estimativa, sem commit nada até Fase 4)

| Onda | Foco | Arquivos estimados |
|---|---|---:|
| 5 | Reescrever `typography.ts` + regerar `tailwind-theme.css` | 2 (ts + css) |
| 6 | Investigar/aplicar fix de `leading-X` se necessário | 1-2 (transform + css) |
| 7 | Migrar `paragraph-*` → `body-*` (47 doc-pages + componentes core) | ~25 arquivos |
| 8 | Migrar `label-*` → `body-*` + `font-medium` override | ~20 arquivos |
| 9 | Migrar `subheading-*` → `caption/body + uppercase + tracking-wider` | ~5 arquivos |
| 10 | Migrar `caption-md` (13/400) → `body-sm font-normal` | ~3 arquivos |
| 11 | Substituir literais `text-[Npx]` por preset + overrides (UI iGreen) | ~30 arquivos |
| 12 | Substituir literais `text-[Npx]` em shadcn | ~13 arquivos |
| 13 | Substituir literais `text-[Npx]` em showcases (ChatV2 + Dashboard + Clientes) | ~15 arquivos |
| 14 | Validação visual final + ajustes pontuais | — |

Total estimado: ~9 ondas, cada uma com tsc + npm run dev validação visual.

### Gate humano entre ondas

Como nas Ondas 1-4: pausa visual obrigatória, sem commit até aprovação final.

---

## 7. Out of scope desta spec (mesmo na Fase 3)

- Refactor de color/spacing/shape tokens
- Mudar `text-[2rem]` em DocHeader / ShowcasePageV2 ícone ✦ (fluid intencional)
- Adicionar tracking custom além dos já existentes
- Mudar visual de qualquer componente — todos os overrides preservam visual atual
- Atualizar agentes/skills/lessons/pipeline-state — só depois de Fase 4 aprovada

---

## Aprovação necessária

Antes de iniciar a Fase 3 (Onda 5 — rewrite do typography.ts):

1. Validar a tabela de 24 presets (§1)
2. Validar mapping antigo→novo (§2)
3. Validar regra de uso (§4)
4. Concordar com plano de ondas (§6)
5. Confirmar: zero commit, zero pipeline update até Fase 4

A próxima sessão começa por **investigar o conflito de leading num caso isolado** (1 teste, 5 minutos) — confirma se o refactor de transform é necessário ou se o pattern atual funciona com ordem correta de classes.
