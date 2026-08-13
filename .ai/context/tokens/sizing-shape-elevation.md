# Tokens dimensionais — contexto do agente

> Carregar quando a tarefa envolve: sizing, shape ou elevation.
> Para spacing/gap/pad, usar `tokens-spacing.md`.

---

## sizing.ts — Escala genérica (`comp`)
> CSS var: `--spacing-comp-*` → classes: `h-comp-*`, `w-comp-*`, `size-comp-*`, `min-h-comp-*`

| Token | Valor | Uso |
|-------|-------|-----|
| `comp.3xs` | 16px | badge micro |
| `comp.2xs` | 20px | badge, switch |
| `comp.xs` | 24px | chip, tag |
| `comp.sm` | 28px | tabs item |
| `comp.md` | 32px | compacto |
| `comp.lg` | 36px | button sm, input sm |
| `comp.xl` | 40px | button md, input md — desktop |
| `comp.2xl` | 44px | WCAG touch target |
| `comp.3xl` | 48px | confortável |
| `comp.4xl` | 56px | hero CTA |

---

## components/sizing.ts — Tokens de componente específico

### `form` — heights de controles interativos (Button, Input, Select)
> CSS var: `--spacing-form-*` → classe: `min-h-form-*`

| Token | Valor | Classe Tailwind | Uso |
|-------|-------|-----------------|-----|
| `form.3xs` | 20px | `min-h-form-3xs` | badge micro |
| `form.2xs` | 24px | `min-h-form-2xs` | badge, tabs |
| `form.xs` | 28px | `min-h-form-xs` | button xxs, tabs |
| `form.sm` | 32px | `min-h-form-sm` | button xs, input xs |
| `form.md` | 36px | `min-h-form-md` | button sm, input sm — desktop compacto |
| `form.lg` | 40px | `min-h-form-lg` | button md, input md — **desktop default** |
| `form.xl` | 44px | `min-h-form-xl` | **WCAG touch target** — mobile obrigatório |

### `layout` — heights de seções fixas
> CSS var: `--spacing-layout-*` → classe: `min-h-layout-*`

| Token | Valor | Classe |
|-------|-------|--------|
| `layout.navbar` | 64px | `min-h-layout-navbar` |
| `layout.toolbar` | 48px | `min-h-layout-toolbar` |
| `layout.tab-bar` | 56px | `min-h-layout-tab-bar` |
| `layout.header-sm` | 80px | `min-h-layout-header-sm` |
| `layout.header-md` | 96px | `min-h-layout-header-md` |
| `layout.header-lg` | 128px | `min-h-layout-header-lg` |

### `icon` — tamanhos de ícone (square)
> CSS var: `--spacing-icon-*` → classe: `size-icon-*`

| Token | Valor | Classe | Uso |
|-------|-------|--------|-----|
| `icon.2xs` | 8px | `size-icon-2xs` | dot, marcador |
| `icon.xs` | 12px | `size-icon-xs` | inline com texto xs |
| `icon.sm` | 16px | `size-icon-sm` | ícone SVG padrão |
| `icon.md` | 20px | `size-icon-md` | **default** — nav, listas, inputs |
| `icon.lg` | 24px | `size-icon-lg` | ênfase, nav items |
| `icon.xl` | 32px | `size-icon-xl` | feature icons |
| `icon.2xl` | 40px | `size-icon-2xl` | hero icons |
| `icon.3xl` | 48px | `size-icon-3xl` | ilustração, empty state |

### `container` — larguras de container e overlays
> CSS var: `--container-*` → classe: `max-w-*`

| Token | Valor | Classe |
|-------|-------|--------|
| `container.xs` | 480px | `max-w-xs` |
| `container.sm` | 640px | `max-w-sm` |
| `container.md` | 768px | `max-w-md` |
| `container.lg` | 1024px | `max-w-lg` |
| `container.xl` | 1280px | `max-w-xl` |
| `container.2xl` | 1440px | `max-w-2xl` |
| `container.3xl` | 1920px | `max-w-3xl` |
| `container.main-content-max` | 1368px | `max-w-main-content-max` — body do AppShell em `layout="compact"` |
| `container.prose` | 65ch | `max-w-prose` |
| `container.sidebar-sm` / `-lg` | — | `max-w-sidebar-sm` / `-lg` |
| `container.modal-sm` / `-lg` | — | `max-w-modal-sm` / `-lg` |
| `container.dropdown-sm` / `-lg` | — | `max-w-dropdown-sm` / `-lg` |
| `container.tooltip-sm` / `-md` / `-lg` | — | `max-w-tooltip-*` |
| `container.drawer-sm` / `-md` / `-lg` | — | `max-w-drawer-*` (o `-md` é 480px) |
| `container.full` | — | `max-w-full` |

⚠️ **`container` é a ÚNICA exceção que não dobra o prefixo (L-057).** O transform emite
`--container-md`, que **sobrescreve** a escala nativa do Tailwind — então a classe é
`max-w-md` (768px do DS), e **`max-w-container-md` não existe**: não emite CSS e falha em
silêncio, sem quebrar build, `tsc` nem teste.

---

## shape.ts — Radius
> CSS var: `--radius-radius-*` → classe: `rounded-radius-*`
> Prefixo duplo `radius-radius` é intencional — evita colisão com `rounded-sm/md/lg` do Tailwind nativo.

| Token | Valor | Classe Tailwind | Uso |
|-------|-------|-----------------|-----|
| `radius.none` | 0px | `rounded-radius-none` | sharp corners |
| `radius.xs` | 4px | `rounded-radius-xs` | sutil |
| `radius.sm` | 6px | `rounded-radius-sm` | tabs indicator |
| `radius.md` | 8px | `rounded-radius-md` | inputs menores |
| `radius.lg` | 10px | `rounded-radius-lg` | igual ao knob |
| `radius.xl` | 14px | `rounded-radius-xl` | modais, painéis |
| `radius.2xl` | 18px | `rounded-radius-2xl` | textarea, select |
| `radius.3xl` | 22px | `rounded-radius-3xl` | superfícies grandes |
| `radius.base` | **10px** | `rounded-radius-base` | **alias de `lg`** |
| `radius.4xl` | 26px | `rounded-radius-4xl` | (era o valor antigo de `base`) |
| `radius.full` | 9999px | `rounded-radius-full` | pills, avatars |

⚠️ **`radius.base` vale 10px, não 26px.** `RADIUS_BASE = 0.625rem = 10px` e `base` é alias
de `lg` (×1.0); os 26px migraram pro `4xl` (×2.6). Esta tabela dizia 26px e a relação
form→radius abaixo era derivada disso — as duas estavam erradas.

**Prefira o nome do degrau (`rounded-radius-lg`) ao alias `base`** — é o que os componentes
reais usam, e o alias já mudou de valor uma vez.

**NUNCA** usar `rounded-sm`, `rounded-md`, `rounded-lg` — são classes Tailwind nativas com valores diferentes dos tokens DS.

### Relação formHeight → radius (medida no `Button` real)

```
min-h-form-xl (44px) → rounded-radius-lg (10px)
min-h-form-lg (40px) → rounded-radius-lg (10px)
min-h-form-md (36px) → rounded-radius-lg (10px)
min-h-form-sm (32px) → rounded-radius-md (8px)
min-h-form-xs (28px) → rounded-radius-md (8px)
```

### shape.ts — Border width
> CSS var: `--border-width-*`

| Token | Valor | Uso |
|-------|-------|-----|
| `borderWidth.xs` | 1px | padrão — inputs, cards |
| `borderWidth.sm` | 2px | ênfase — foco, hover outline |
| `borderWidth.md` | 4px | forte — accent, progress |

---

## elevation.ts — Shadow
> CSS var: `--shadow-sh-*` → classe: `shadow-sh-*`
> Prefixo `sh` evita colisão com `shadow-sm/md/lg` do Tailwind nativo.

Lista **completa** — 12 shadows, conferida contra o CSS gerado:

| Token | Classe Tailwind | Uso |
|-------|-----------------|-----|
| `shadow.none` | `shadow-sh-none` | plano |
| `shadow.sm` | `shadow-sh-sm` | card repouso, inputs |
| `shadow.md` | `shadow-sh-md` | card hover |
| `shadow.lg` | `shadow-sh-lg` | dropdown, popover |
| `shadow.xl` | `shadow-sh-xl` | modal |
| `shadow.2xl` | `shadow-sh-2xl` | toast |
| `shadow.aside` | `shadow-sh-aside` | sidebar / drawer |
| `shadow.ring` | `shadow-sh-ring` | foco por box-shadow (`focus-visible:shadow-sh-ring`) |
| `shadow.ring-danger` / `-warning` / `-success` / `-info` | `shadow-sh-ring-*` | foco em estado de validação |

⚠️ **NÃO existem** `shadow.base`, `shadow.3xl`, `shadow.inner`, `shadow.focus-primary` nem
`shadow.focus-error` — esta tabela os listava e todos falham em silêncio.

**NUNCA** usar `shadow-sm`, `shadow-md`, `shadow-lg` — são classes Tailwind nativas.

⚠️ **Shadow não é dark-aware por `var()` (L-043).** O Tailwind v4 **inlina** o valor da
`@theme` na utility, então `.dark { --shadow-* }` é código morto — no dark a sombra ficaria
com o valor do light. O transform resolve com indireção: `@theme inline { --shadow-sh-*:
var(--ds-sh-*) }` + `:root`/`.dark { --ds-sh-* }`. Nunca declare sombra dark direto no `.dark{}`.

### Blur — token existe em TS, mas NÃO é emitido

`elevation.ts` define `blur.sm/md/lg/xl`, mas o transform **não os emite** de propósito
(`to-tailwind-v4.ts`: "blur removido — usa Tailwind nativo"). `grep '^  --blur-'` no tema = 0.

Use o Tailwind nativo, e **com os valores dele**, não os do token TS:
`blur-sm` (8px), `blur-md` (12px), `blur-lg` (16px), `blur-xl` (24px).

---

## elevation.ts — Opacity
> CSS var: `--opacity-*`

| Token | Valor | Uso |
|-------|-------|-----|
| `opacity.disabled` | 0.38 | estado disabled |
| `opacity.hover` | 0.08 | overlay hover |
| `opacity.focus` | 0.12 | overlay focus |
| `opacity.muted` | 0.5 | visibilidade reduzida |

---

## Ring tokens — focus rings

Ring tokens usam cores alpha (20%) embutidas. **NUNCA usar modificador de opacidade.**

```typescript
// ✅ CERTO — sem barra, sem número
"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-danger"

// ❌ ERRADO — token já tem alpha, modificador é desnecessário e errado
"ring-ring-brand/30"   // NUNCA
"ring-ring-brand/20"   // NUNCA
```

Nunca usar `ring-offset` — o alpha 20% já provê contraste.

---

## zIndex

| Token | Valor | CSS var |
|-------|-------|---------|
| `zIndex.dropdown` | 100 | `--z-index-dropdown` |
| `zIndex.sticky` | 200 | `--z-index-sticky` |
| `zIndex.overlay` | 300 | `--z-index-overlay` |
| `zIndex.modal` | 400 | `--z-index-modal` |
| `zIndex.popover` | 500 | `--z-index-popover` |
| `zIndex.toast` | 600 | `--z-index-toast` |
| `zIndex.tooltip` | 700 | `--z-index-tooltip` |

---

## Regra crítica — NUNCA height fixo

```typescript
// ❌ ERRADO
className="h-[44px]"
className="h-11"
style={{ height: "44px" }}

// ✅ CERTO
className="min-h-form-lg"   // 40px — desktop
className="min-h-form-xl"   // 44px — mobile WCAG
```

---

## Para adicionar novo token

Após qualquer mudança em token semântico ou de componente:
```bash
npm run tokens:tw4
```

Sem este passo o token existe no TypeScript mas não vira CSS var nem utility class.
