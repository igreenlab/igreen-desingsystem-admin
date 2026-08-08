# Coding standards — iGreen DS

> Referência completa. Carregar apenas quando precisar de detalhe além do que
> está em `.claude/rules/ds-standards.md` ou nas skills de cada agente.
>
> Para uso cotidiano: `.claude/rules/ds-standards.md` (resumo executivo)
> Para implementação: `.claude/skills/ds-dev/*.md` (por tipo de tarefa)
> Para spec: `.claude/skills/ds-designer/*.md` (por tipo de token)

---

## Padrão tv() completo — referência

```typescript
import { tv, type VariantProps } from "@/utils/tv"

export const componentVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "select-none whitespace-nowrap",
    "border border-transparent",
    "transition-all duration-200 ease-out",
    // Apenas outline-none no base — ring fica em cada color variant
    "focus-visible:outline-none",
  ],
  variants: {
    color: {
      // Ring POR COR — cada variante usa seu próprio ring token
      // NUNCA colocar ring-ring-brand no base
      primary:   "focus-visible:ring-4 focus-visible:ring-ring-brand",
      secondary: "focus-visible:ring-4 focus-visible:ring-ring-secondary",
      danger:    "focus-visible:ring-4 focus-visible:ring-ring-danger",
      success:   "focus-visible:ring-4 focus-visible:ring-ring-success",
      warning:   "focus-visible:ring-4 focus-visible:ring-ring-warning",
    },
    variant: { filled: "", outline: "", soft: "", ghost: "bg-transparent" },
    size: {
      // Espelhado do Button real (button.styles.ts): radius `md` (8px) nos dois
      // menores, `lg` (10px) do sm pra cima. `rounded-radius-base` é ALIAS de `lg`
      // — prefira o nome do degrau, que é o que os componentes usam.
      "2xs": "min-h-form-xs  px-pad-lg  gap-gp-sm  rounded-radius-md text-body-sm font-semibold",
      xs:    "min-h-form-sm  px-pad-xl  gap-gp-sm  rounded-radius-md text-body-sm font-semibold",
      sm:    "min-h-form-md  px-pad-xl  gap-gp-sm  rounded-radius-lg text-body-sm font-semibold",
      md:    "min-h-form-lg  px-pad-2xl gap-gp-sm  rounded-radius-lg text-body-sm font-semibold",
    },
    fullWidth: { true: "w-full flex-1" },
    disabled:  { true: "pointer-events-none" },
  },
  compoundVariants: [
    { color: "primary", variant: "filled",
      class: "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-hover" },
    { color: "primary", variant: "outline",
      class: "bg-bg-surface border-border-brand text-fg-brand shadow-sh-sm hover:bg-bg-brand-subtle hover:border-transparent hover:shadow-sh-none" },
    { color: "primary", variant: "soft",
      class: "bg-bg-brand-subtle text-fg-brand hover:bg-bg-surface hover:border-border-brand" },
    { color: "primary", variant: "ghost",
      class: "text-fg-brand hover:bg-bg-brand-subtle" },
    // ... demais cores (secondary, danger, success, warning) seguem o mesmo padrão
    // Não existe `bg.disabled` nem `border.disabled` no V3 — só `fg.disabled`.
    // O padrão do DS é OPACIDADE, não uma paleta de desabilitado. Escrever
    // `bg-bg-disabled` não emite CSS e a classe some em silêncio.
    { disabled: true, class: "pointer-events-none opacity-50" },
  ],
  defaultVariants: { color: "primary", variant: "filled", size: "md" },
})
export type ComponentVariantProps = VariantProps<typeof componentVariants>
```

---

## Padrão ring animado (inputs) — referência

```typescript
// Na base — ring invisível com cor pré-carregada
"ring-0 ring-ring-brand"
"transition-[color,box-shadow,background-color] focus-visible:outline-none"

// No focus — apenas o ring cresce em largura
"focus-visible:ring-4"

// ❌ NÃO usar: "focus-visible:border-border-brand focus-visible:ring-4"
// O padrão correto usa SOMENTE o ring — sem border adicional no foco
```

---

## Mapa completo — classes DS vs Tailwind literal

### Spacing

⚠️ **`gap`, `space` e `pad` compartilham a MESMA escala** — `gap-gp-lg`, `p-sp-lg` e
`px-pad-lg` valem todos 10px. O que muda é a intenção, não o valor. Esta tabela tinha 3
faixas divergentes e errava por até 2,4× (dizia `space.lg` = 24px sendo 10px).

⚠️ **O número do Tailwind não é o degrau do DS**: `gap-4` vale 16px e `gap-gp-md` vale 8px.
A coluna "Tailwind literal proibido" lista o que **não usar**, não o equivalente de valor.
Pra preservar o valor de um layout existente, use a coluna da direita.

| Degrau | Valor | Classes DS | Não usar | Mesmo VALOR no Tailwind |
|---|---|---|---|---|
| `2xs` | 2px | `gap-gp-2xs` · `p-sp-2xs` · `px-pad-2xs` | `gap-0.5` | `gap-0.5` |
| `xs` | 4px | `gap-gp-xs` · `p-sp-xs` · `px-pad-xs` | `gap-1` | `gap-1` |
| `sm` | 6px | `gap-gp-sm` · `p-sp-sm` · `px-pad-sm` | `gap-1.5` | `gap-1.5` |
| `md` | 8px | `gap-gp-md` · `p-sp-md` · `px-pad-md` | `gap-2` | `gap-2` |
| `lg` | **10px** | `gap-gp-lg` · `p-sp-lg` · `px-pad-lg` | `gap-2.5` | `gap-2.5` |
| `xl` | **12px** | `gap-gp-xl` · `p-sp-xl` · `px-pad-xl` | `gap-3` | `gap-3` |
| `2xl` | **16px** | `gap-gp-2xl` · `p-sp-2xl` · `px-pad-2xl` | `gap-4` | `gap-4` |
| `3xl` | **20px** | `gap-gp-3xl` · `p-sp-3xl` · `px-pad-3xl` | `gap-5` | `gap-5` |
| `4xl` | **24px** | `gap-gp-4xl` · `p-sp-4xl` · `px-pad-4xl` | `gap-6` | `gap-6` |
| `5xl` | 28px | `gap-gp-5xl` · `p-sp-5xl` · `px-pad-5xl` | `gap-7` | `gap-7` |
| `6xl` | 32px | `gap-gp-6xl` · `p-sp-6xl` · `px-pad-6xl` | `gap-8` | `gap-8` |
| `7xl` | 48px | `gap-gp-7xl` · `p-sp-7xl` · `px-pad-7xl` | `gap-12` | `gap-12` |

Fora da escala: `gap.base`/`space.base` 16px · `pad.base` 12px · `space.px` 1px.

**Form: `gap-form-gap` (20px), nunca `gap-gp-*`** — L-024. Vale pra qualquer form, drawer ou
modal com 2+ FormField, inclusive dentro de grid.

Tokens de componente: `p-pad-card-base` (24px) / `-sm` (16px) · `px-pad-page-sm` (16) /
`-base` (24) / `-lg` (40).

### Form heights

| Token | Classe DS | Valor | Tailwind literal proibido |
|-------|-----------|-------|--------------------------|
| `form.3xs` | `min-h-form-3xs` | 20px | — |
| `form.2xs` | `min-h-form-2xs` | 24px | — |
| `form.xs` | `min-h-form-xs` | 28px | `h-7` |
| `form.sm` | `min-h-form-sm` | 32px | `h-8` |
| `form.md` | `min-h-form-md` | 36px | `h-9` |
| `form.lg` | `min-h-form-lg` | 40px | `h-10` |
| `form.xl` | `min-h-form-xl` | 44px | `h-11` |

### Radius

Todos derivam de `RADIUS_BASE = 0.625rem = 10px`.

| Token | Classe DS | Mult. | Valor | Tailwind literal proibido |
|-------|-----------|---|-------|--------------------------|
| `radius.none` | `rounded-radius-none` | — | 0 | `rounded-none` |
| `radius.xs` | `rounded-radius-xs` | ×0.4 | 4px | `rounded` |
| `radius.sm` | `rounded-radius-sm` | ×0.6 | 6px | `rounded-md` |
| `radius.md` | `rounded-radius-md` | ×0.8 | 8px | `rounded-lg` |
| `radius.lg` | `rounded-radius-lg` | ×1.0 | **10px** | `rounded-xl` |
| `radius.base` | `rounded-radius-base` | ×1.0 | **10px** (alias de `lg`) | — |
| `radius.xl` | `rounded-radius-xl` | ×1.4 | 14px | `rounded-2xl` |
| `radius.2xl` | `rounded-radius-2xl` | ×1.8 | 18px | — |
| `radius.3xl` | `rounded-radius-3xl` | ×2.2 | 22px | `rounded-3xl` |
| `radius.4xl` | `rounded-radius-4xl` | ×2.6 | 26px | — |
| `radius.full` | `rounded-radius-full` | — | 9999px | `rounded-full` |

⚠️ **`radius.base` vale 10px, não 26px** — esta tabela dizia 26 (o valor que ele TINHA antes
de virar alias de `lg`; os 26px migraram pro `4xl`). É o degrau mais usado do DS. Prefira
`rounded-radius-lg` ao alias: o alias já mudou de valor uma vez.

### Shadow

| Token | Classe DS | Tailwind literal proibido |
|-------|-----------|--------------------------|
| `shadow.sm` | `shadow-sh-sm` | `shadow-sm` |
| `shadow.md` | `shadow-sh-md` | `shadow-md` |
| `shadow.lg` | `shadow-sh-lg` | `shadow-lg` |
| `shadow.xl` | `shadow-sh-xl` | `shadow-xl` |

---

## Estrutura de arquivo — componente iGreen

```
src/components/ui/NomeComponente/
├── index.ts                  # barrel export
├── nome-componente.tsx       # lógica e markup — ZERO hardcode
├── nome-componente.styles.ts # tv() — fonte de verdade visual
├── nome-componente.types.ts  # interfaces e VariantProps
└── USAGE.md                  # OBRIGATÓRIO
```

---

## Naming conventions

| Elemento | Correto | Proibido |
|----------|---------|---------|
| gap | `gap-gp-md` | `gap-4`, `gap-gap-md` |
| padding genérico | `p-sp-md` | `p-4` |
| padding componente | `px-pad-lg` | `px-3` |
| border-radius | `rounded-radius-base` | `rounded-lg` |
| shadow | `shadow-sh-md` | `shadow-md` |
| height interativo | `min-h-form-lg` | `h-10`, `h-[40px]` |
| tipografia | `text-body-sm font-semibold` | `text-sm font-medium` |
| cor de fundo | `bg-bg-brand` | `bg-blue-600` |
| cor de texto | `text-fg-default` | `text-gray-900` |
| cor de borda | `border-border-default` | `border-gray-200` |
| ring estático | `focus-visible:ring-4 focus-visible:ring-ring-{color}` em color variant | `ring no base`, `ring-primary/30` |
| ring animado | `ring-0 ring-ring-brand` + `focus-visible:ring-4` | `ring-3`, border no foco |
