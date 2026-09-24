import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Label — alinhado com `.tbl-form-label` do design-and-table-v2.
 * Specs: 13px / 600 / fg-default / tracking 0.01em — boa prática WCAG
 * pra labels de form (contraste maior que helper text).
 *
 * `weight` — default `semibold`, que é o peso de rótulo de CAMPO. Existe `regular` pra
 * rótulo de OPÇÃO dentro de um grupo (checkbox, radio, switch): ali o destaque pertence
 * à legenda do grupo, e oito opções em 600 achatam a hierarquia que o 600 deveria criar.
 * A doc do Checkbox já escrevia `className="font-normal"` em duas linhas — a prop existe
 * pra isso deixar de ser override e virar API.
 *
 * ⚠️ Default continua `semibold`: rótulo de campo é contraste de leitura (WCAG), não
 * enfeite. Não troque o default achando que "fica mais leve".
 */
const labelVariants = cva(
  "text-body-sm tracking-[0.01em] text-fg-default dark:text-fg-muted leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      weight: {
        semibold: "font-semibold",
        regular: "font-normal",
      },
    },
    defaultVariants: {
      weight: "semibold",
    },
  }
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, weight, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ weight }), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
