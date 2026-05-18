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
| `icon.xs` | 12px | `size-icon-xs` | inline com texto xs |
| `icon.sm` | 16px | `size-icon-sm` | ícone SVG padrão |
| `icon.md` | 20px | `size-icon-md` | **default** — nav, listas, inputs |
| `icon.lg` | 24px | `size-icon-lg` | ênfase, nav items |
| `icon.xl` | 32px | `size-icon-xl` | feature icons |
| `icon.2xl` | 40px | `size-icon-2xl` | hero icons |

### `container` — larguras de container e overlays
> CSS var: `--container-*` → classe: `max-w-container-*`

| Token | Valor | Classe |
|-------|-------|--------|
| `container.xs` | 480px | `max-w-container-xs` |
| `container.sm` | 640px | `max-w-container-sm` |
| `container.md` | 768px | `max-w-container-md` |
| `container.lg` | 1024px | `max-w-container-lg` |
| `container.xl` | 1280px | `max-w-container-xl` |
| `container.2xl` | 1440px | `max-w-container-2xl` |
| `container.sidebar-md` | 280px | `max-w-container-sidebar-md` |
| `container.modal-md` | 640px | `max-w-container-modal-md` |
| `container.dropdown-md` | 240px | `max-w-container-dropdown-md` |

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
| `radius.3xl` | 22px | `rounded-radius-3xl` | badges, componentes menores |
| `radius.base` | 26px | `rounded-radius-base` | **DEFAULT componentes interativos** |
| `radius.4xl` | 26px | `rounded-radius-4xl` | alias numérico de base |
| `radius.full` | 9999px | `rounded-radius-full` | pills, avatars |

**NUNCA** usar `rounded-sm`, `rounded-md`, `rounded-lg` — são classes Tailwind nativas com valores diferentes dos tokens DS.

### Relação formHeight → radius

```
min-h-form-xl (44px) → rounded-radius-base (26px)
min-h-form-lg (40px) → rounded-radius-base (26px)
min-h-form-md (36px) → rounded-radius-base (26px)
min-h-form-sm (32px) → rounded-radius-3xl  (22px)
min-h-form-xs (28px) → rounded-radius-3xl  (22px)
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

| Token | Classe Tailwind | Nível | Uso |
|-------|-----------------|-------|-----|
| `shadow.none` | `shadow-sh-none` | 0 | plano |
| `shadow.base` | `shadow-sh-base` | 1 | default |
| `shadow.sm` | `shadow-sh-sm` | 1 | card repouso, inputs |
| `shadow.md` | `shadow-sh-md` | 2 | card hover |
| `shadow.lg` | `shadow-sh-lg` | 3 | dropdown, popover |
| `shadow.xl` | `shadow-sh-xl` | 4 | modal |
| `shadow.2xl` | `shadow-sh-2xl` | 5 | toast |
| `shadow.3xl` | `shadow-sh-3xl` | 6 | máximo |
| `shadow.inner` | `shadow-sh-inner` | — | inset |
| `shadow.focus-primary` | `shadow-sh-focus-primary` | — | focus btn primary |
| `shadow.focus-error` | `shadow-sh-focus-error` | — | focus input erro |

**NUNCA** usar `shadow-sm`, `shadow-md`, `shadow-lg` — são classes Tailwind nativas.

### Blur — usar Tailwind nativo diretamente

Blur não tem token DS. Usar Tailwind nativo sem prefixo:
`blur-sm` (4px), `blur-md` (8px), `blur-lg` (16px), `blur-xl` (24px).

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
"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary"
"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-danger"

// ❌ ERRADO — token já tem alpha, modificador é desnecessário e errado
"ring-ring-primary/30"   // NUNCA
"ring-ring-primary/20"   // NUNCA
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
