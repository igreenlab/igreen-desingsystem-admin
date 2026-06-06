---
name: impl-igreen
description: >
  Criar ou editar componente iGreen com tv().
  Estrutura: index.ts + .tsx + .styles.ts + .types.ts + USAGE.md.
---

# DS Dev — Componente iGreen (tv())

> **Skill obrigatória.** Carregue este arquivo via `SkillTool` (skill: `ds-create-component`) ANTES de criar qualquer componente iGreen com `tv()` — não confie em memória de sessão anterior.

## Verificações antes de escrever código

```
1. Existe em .ai/context/components/inventory.md? → PARAR. Usar existente.
2. Tem lógica interativa complexa (Radix, etc)? → Usar impl-shadcn.md
3. Todos os tokens necessários existem? → Se não: PARAR, sinalizar cascata.
```

## Estrutura obrigatória

```
src/components/ui/NomeComponente/
├── index.ts
├── nome-componente.tsx        # ZERO hardcode
├── nome-componente.styles.ts  # tv() — fonte de verdade visual
├── nome-componente.types.ts   # VariantProps
└── USAGE.md                   # OBRIGATÓRIO
```

---

## Template `.styles.ts` completo

```typescript
import { tv, type VariantProps } from "@/utils/tv"  // NUNCA tailwind-variants

export const nomeVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "select-none whitespace-nowrap",
    "border border-transparent",           // transição suave obrigatória
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none",          // apenas outline-none no base — ring nas color variants
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
      // NUNCA: gap-4, rounded-lg, shadow-md, px-3, h-10
      xxs: "min-h-form-xs  px-pad-md  gap-gp-sm  rounded-radius-3xl  text-body-sm font-semibold",
      xs:  "min-h-form-sm  px-pad-lg  gap-gp-sm  rounded-radius-3xl  text-body-sm font-semibold",
      sm:  "min-h-form-md  px-pad-xl  gap-gp-md  rounded-radius-base text-body-sm font-semibold",
      md:  "min-h-form-lg  px-pad-2xl gap-gp-md  rounded-radius-base text-body-sm font-semibold",
    },
    fullWidth: { true: "w-full flex-1" },
    disabled:  { true: "pointer-events-none" },
  },
  compoundVariants: [
    // 1. Compostos cor × variant
    { color: "primary", variant: "filled",
      class: "bg-bg-primary text-fg-on-primary hover:bg-bg-primary-hover" },
    { color: "primary", variant: "outline",
      class: "bg-bg-surface border-border-primary text-fg-primary shadow-sh-sm hover:bg-bg-primary-subtle hover:border-transparent hover:shadow-sh-none" },
    { color: "primary", variant: "soft",
      class: "bg-bg-primary-subtle text-fg-primary hover:bg-bg-surface hover:border-border-primary" },
    { color: "primary", variant: "ghost",
      class: "text-fg-primary hover:bg-bg-primary-subtle" },
    // (demais cores seguem o mesmo padrão)

    // 2. Disabled — SEMPRE POR ÚLTIMO (L-006)
    { disabled: true, class: "bg-bg-disabled text-fg-disabled border-transparent shadow-sh-none" },
    { disabled: true, variant: "outline", class: "bg-transparent border-border-disabled" },
    { disabled: true, variant: "soft",    class: "bg-bg-disabled" },
    { disabled: true, variant: "ghost",   class: "bg-transparent" },
  ],
  defaultVariants: { color: "primary", variant: "filled", size: "md" },
})

export type NomeVariantProps = VariantProps<typeof nomeVariants>
```

## Template `.tsx`

```typescript
import { forwardRef } from "react"
import { nomeVariants } from "./nome-componente.styles"
import type { NomeComponenteProps } from "./nome-componente.types"

// ⚠️ Adaptar HTMLButtonElement e <button> para o elemento HTML correto
// Ex: HTMLDivElement + <div role="button"> para custom interactive
//     HTMLAnchorElement + <a> para links navegáveis
export const NomeComponente = forwardRef<HTMLButtonElement, NomeComponenteProps>(
  function NomeComponente(
    { color, variant, size, disabled, fullWidth, className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={nomeVariants({ color, variant, size, disabled, fullWidth, className })}
        {...rest}
      >
        {children}
      </button>
    )
  }
)
NomeComponente.displayName = "NomeComponente"
```

## Template `.types.ts`

```typescript
import type { ComponentPropsWithoutRef } from "react"
import type { NomeVariantProps } from "./nome-componente.styles"

export interface NomeComponenteProps
  extends ComponentPropsWithoutRef<"button">,
    NomeVariantProps {
  // props customizadas opcionais (iconLeft, iconRight, loading, etc)
}
```

## Template `index.ts`

```typescript
export { NomeComponente } from "./nome-componente"
export type { NomeComponenteProps } from "./nome-componente.types"
```

---

## Padrão Focus Ring — 2 variantes

### Padrão 1 — estático (Button, Select, Chip)

```typescript
base:  "focus-visible:outline-none"
color: "focus-visible:ring-4 focus-visible:ring-ring-{color}"
```

### Padrão 2 — animado (Input, Textarea)

```typescript
base:  "ring-0 ring-ring-primary"
       "transition-[color,box-shadow,background-color] focus-visible:outline-none"
focus: "focus-visible:ring-4"
```

---

## Padrões críticos resumidos

### Focus ring (L-001, L-003, L-004)
- **Sempre** `focus-visible:outline-none` no base
- Ring `focus-visible:ring-4 focus-visible:ring-ring-{color}` **por cor** (não no base)
- Nunca `ring-ring-*/30` (token já tem alpha)
- Nunca `ring-3` (não existe)

### Tamanhos (L-002)
- `min-h-form-{xs/sm/md/lg/xl}` — nunca `h-*` fixo
- Padding via `px-pad-*`, gap via `gap-gp-*`
- Tipografia via preset (`text-body-sm font-semibold`, etc) — nunca `text-[Npx] font-*` avulso (L-007)

### Variants order (L-006)
- `disabled` SEMPRE último em `compoundVariants`
- Caso contrário, é sobrescrito por color variants

### Imports
```typescript
import { tv, type VariantProps } from "@/utils/tv"  // NUNCA "tailwind-variants"
```

### Border base
```typescript
"border border-transparent"  // transição suave obrigatória
```

---

## Checklist antes de sinalizar `IMPL_PRONTA`

- [ ] Ring em cada `color` variant — NÃO no base; `focus-visible:outline-none` apenas no base
- [ ] Nenhum `ring-*/30`, `ring-3`, `outline-none` sem `focus-visible:`
- [ ] `tv` de `@/utils/tv`; `disabled` por último; `type="button"`
- [ ] Nenhum Tailwind literal com equivalente DS (consultar `.claude/rules/ds-standards.md`)
- [ ] Tipografia via presets; `min-h-form-*` (nunca `h-*`)
- [ ] **`USAGE.md` criado** em `src/components/ui/NomeComponente/USAGE.md`
- [ ] Exports em DOIS arquivos: `ui/[Nome]/index.ts` (criado) + `src/components/index.ts` (atualizado)
- [ ] `.ai/context/components/inventory.md` atualizado
- [ ] `pipeline-state.md` atualizado com formato CONCLUÍDO incluindo campo `Assumption`

Exemplo Assumption:
> "não existe componente Shadcn com lógica equivalente e a lógica é simples o suficiente para tv()"

---

## Referências

- Anti-patterns proibidos + 14 lições → `.claude/rules/ds-standards.md`
- Padrão tv() detalhado e exemplos longos → `.ai/rules/coding-standards.md`
- Inventário de componentes existentes → `.ai/context/components/inventory.md`
- USAGE.md por componente → `src/components/ui/<Nome>/USAGE.md`
