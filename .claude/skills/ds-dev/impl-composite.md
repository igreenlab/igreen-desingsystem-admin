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

1. API limpa — consumidor não importa as bases diretamente (sobre o que o composite
   **exporta**, não sobre seus imports internos)
2. **Importar bases por caminho ESPECÍFICO com alias `@/`** — `import { Input } from
   "@/components/shadcn/input"`. ⚠️ **NUNCA barrel** (`@/components/shadcn`) **nem relativo
   cross-dir** (`../../shadcn/input`): ambos **quebram a distribuição copy-in** (o transform
   do shadcn só reescreve import específico de um registryDependency; barrel e relativo não
   são reescritos → o consumidor importa de um lugar que não existe). Ver
   `.ai/specs/registry-distribution.md` (regra de distribuibilidade).
3. Não reescrever lógica das bases
4. `htmlFor`, `aria-describedby`, `aria-invalid` obrigatórios onde aplicável
5. Estilos do wrapper em `.styles.ts` — zero hardcode no `.tsx`
6. **Bases não alteradas** — só compor, nunca modificar

## Checklist

- [ ] Bases existem e não foram alteradas
- [ ] Imports específicos com alias: `@/components/shadcn/<x>` / `@/components/ui/<X>`
  (NUNCA barrel `@/components/shadcn` nem relativo cross-dir `../../shadcn/x` — quebra copy-in)
- [ ] `tv` de `@/utils/tv`; zero hardcode; acessibilidade
- [ ] inventory atualizado (tipo: "composto"); USAGE.md criado
- [ ] **Registry:** `node scripts/registry-add-item.mjs <Nome>` → revisar entrada proposta
  (registryDeps + deps + ⚠ imports cross-dir) → adicionar ao `registry.json`. Distribuição
  efetiva entra no próximo `/ds-release` (Passo 6.2b). Sem isso o composite não é consumível.
- [ ] `pipeline-state.md` atualizado com formato CONCLUÍDO incluindo campo `Assumption`
  Ex: `Assumption: "não existe composto existente que combine estas bases desta forma"`
