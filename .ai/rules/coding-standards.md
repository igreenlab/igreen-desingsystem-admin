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
      // NUNCA colocar ring-ring-primary no base
      primary:   "focus-visible:ring-4 focus-visible:ring-ring-primary",
      secondary: "focus-visible:ring-4 focus-visible:ring-ring-secondary",
      danger:    "focus-visible:ring-4 focus-visible:ring-ring-danger",
      success:   "focus-visible:ring-4 focus-visible:ring-ring-success",
      warning:   "focus-visible:ring-4 focus-visible:ring-ring-warning",
    },
    variant: { filled: "", outline: "", soft: "", ghost: "bg-transparent" },
    size: {
      xxs: "min-h-form-xs  px-pad-md  gap-gp-sm  rounded-radius-3xl  text-label-sm",
      xs:  "min-h-form-sm  px-pad-lg  gap-gp-sm  rounded-radius-3xl  text-label-sm",
      sm:  "min-h-form-md  px-pad-xl  gap-gp-md  rounded-radius-base text-label-sm",
      md:  "min-h-form-lg  px-pad-2xl gap-gp-md  rounded-radius-base text-label-sm",
    },
    fullWidth: { true: "w-full flex-1" },
    disabled:  { true: "pointer-events-none" },
  },
  compoundVariants: [
    { color: "primary", variant: "filled",
      class: "bg-bg-primary text-fg-on-primary hover:bg-bg-primary-hover" },
    { color: "primary", variant: "outline",
      class: "bg-bg-surface border-border-primary text-fg-primary shadow-sh-sm hover:bg-bg-primary-subtle hover:border-transparent hover:shadow-sh-none" },
    { color: "primary", variant: "soft",
      class: "bg-bg-primary-subtle text-fg-primary hover:bg-bg-surface hover:border-border-primary" },
    { color: "primary", variant: "ghost",
      class: "text-fg-primary hover:bg-bg-primary-subtle" },
    // ... demais cores (secondary, danger, success, warning) seguem o mesmo padrão
    { disabled: true, class: "bg-bg-disabled text-fg-disabled border-transparent shadow-sh-none" },
    { disabled: true, variant: "outline", class: "bg-transparent border-border-disabled" },
    { disabled: true, variant: "soft",    class: "bg-bg-disabled" },
    { disabled: true, variant: "ghost",   class: "bg-transparent" },
  ],
  defaultVariants: { color: "primary", variant: "filled", size: "md" },
})
export type ComponentVariantProps = VariantProps<typeof componentVariants>
```

---

## Padrão ring animado (inputs) — referência

```typescript
// Na base — ring invisível com cor pré-carregada
"ring-0 ring-ring-primary"
"transition-[color,box-shadow,background-color] focus-visible:outline-none"

// No focus — apenas o ring cresce em largura
"focus-visible:ring-4"

// ❌ NÃO usar: "focus-visible:border-border-primary focus-visible:ring-4"
// O padrão correto usa SOMENTE o ring — sem border adicional no foco
```

---

## Mapa completo — classes DS vs Tailwind literal

### Spacing

| Token | Classe DS | Valor | Tailwind literal proibido |
|-------|-----------|-------|--------------------------|
| `gap.xs` | `gap-gp-xs` | 4px | `gap-1` |
| `gap.sm` | `gap-gp-sm` | 6px | — |
| `gap.md` | `gap-gp-md` | 8px | `gap-2` |
| `gap.lg` | `gap-gp-lg` | 12px | `gap-3` |
| `gap.xl` | `gap-gp-xl` | 16px | `gap-4` |
| `gap.2xl` | `gap-gp-2xl` | 24px | `gap-6` |
| `space.xs` | `p-sp-xs` | 4px | `p-1` |
| `space.sm` | `p-sp-sm` | 8px | `p-2` |
| `space.md` | `p-sp-md` | 16px | `p-4` |
| `space.lg` | `p-sp-lg` | 24px | `p-6` |
| `pad.md` | `px-pad-md` | 8px | `px-2` |
| `pad.lg` | `px-pad-lg` | 12px | `px-3` |
| `pad.xl` | `px-pad-xl` | 14px | — |
| `pad.2xl` | `px-pad-2xl` | 16px | `px-4` |

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

| Token | Classe DS | Valor | Tailwind literal proibido |
|-------|-----------|-------|--------------------------|
| `radius.xs` | `rounded-radius-xs` | 4px | `rounded` |
| `radius.sm` | `rounded-radius-sm` | 6px | `rounded-md` |
| `radius.md` | `rounded-radius-md` | 8px | `rounded-lg` |
| `radius.3xl` | `rounded-radius-3xl` | 22px | `rounded-2xl` |
| `radius.base` | `rounded-radius-base` | 26px | `rounded-3xl` |
| `radius.full` | `rounded-radius-full` | 9999px | `rounded-full` |

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
| tipografia | `text-label-sm` | `text-sm font-medium` |
| cor de fundo | `bg-bg-primary` | `bg-blue-600` |
| cor de texto | `text-fg-foreground` | `text-gray-900` |
| cor de borda | `border-border-main` | `border-gray-200` |
| ring estático | `focus-visible:ring-4 focus-visible:ring-ring-{color}` em color variant | `ring no base`, `ring-primary/30` |
| ring animado | `ring-0 ring-ring-primary` + `focus-visible:ring-4` | `ring-3`, border no foco |
