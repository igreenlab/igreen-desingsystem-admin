---
name: impl-composite
description: >
  Criar componente composto (múltiplos sub-componentes com tv()).
  Usar compound pattern com context e sub-exports.
---

# DS Dev — Componente composto

## Verificações obrigatórias

```
1. Composto já existe em component-inventory.md? → PARAR. Editar existente.
2. Todos os componentes-base existem em shadcn/ ou ui/? → Se não: criar base primeiro.
3. Tokens necessários existem? → Se não: PARAR, sinalizar cascata.
```

## Estrutura

```
src/components/ui/[NomeComposto]/
├── index.ts
├── [nome].tsx          # composição + API unificada
├── [nome].styles.ts    # tv() com slots — só estilos do wrapper
├── [nome].types.ts     # interface unificada
└── USAGE.md
```

## Template com slots

```typescript
// [nome].styles.ts
import { tv, type VariantProps } from "@/utils/tv"

export const formFieldStyles = tv({
  slots: {
    root:     "flex flex-col gap-gp-xs",
    label:    "text-body-sm font-semibold text-fg-foreground",
    helper:   "text-body-xs",
    required: "text-fg-danger ml-0.5",
  },
  variants: {
    hasError: {
      true:  { helper: "text-fg-danger" },
      false: { helper: "text-fg-muted" },
    },
  },
  defaultVariants: { hasError: false },
})
export type FormFieldVariantProps = VariantProps<typeof formFieldStyles>
```

```typescript
// [nome].tsx
// ✅ Usar barrel imports — nunca imports diretos de arquivo
import { Input, Label } from "@/components/shadcn"
import { formFieldStyles } from "./form-field.styles"
import type { FormFieldProps } from "./form-field.types"

export const FormField = ({ id, label, helperText, errorMessage, required, ...inputProps }: FormFieldProps) => {
  const hasError = !!errorMessage
  const styles = formFieldStyles({ hasError })
  return (
    <div className={styles.root()}>
      {label && (
        <Label htmlFor={id} className={styles.label()}>
          {label}
          {required && <span className={styles.required()} aria-hidden="true">*</span>}
        </Label>
      )}
      <Input id={id}
        aria-describedby={helperText || errorMessage ? `${id}-helper` : undefined}
        aria-invalid={hasError} {...inputProps} />
      {(helperText || errorMessage) && (
        <p id={`${id}-helper`} className={styles.helper()}>{errorMessage ?? helperText}</p>
      )}
    </div>
  )
}
```

## Regras

1. API limpa — consumidor não importa as bases diretamente
2. Importar bases via barrel: `import { X } from "@/components/shadcn"` — nunca `@/components/shadcn/x`
3. Não reescrever lógica das bases
4. `htmlFor`, `aria-describedby`, `aria-invalid` obrigatórios onde aplicável
5. Estilos do wrapper em `.styles.ts` — zero hardcode no `.tsx`
6. **Bases não alteradas** — só compor, nunca modificar

## Checklist

- [ ] Bases existem e não foram alteradas
- [ ] Barrel imports usados: `@/components/shadcn` (não `@/components/shadcn/x`)
- [ ] `tv` de `@/utils/tv`; zero hardcode; acessibilidade
- [ ] inventory atualizado (tipo: "composto"); USAGE.md criado
- [ ] `pipeline-state.md` atualizado com formato CONCLUÍDO incluindo campo `Assumption`
  Ex: `Assumption: "não existe composto existente que combine estas bases desta forma"`
