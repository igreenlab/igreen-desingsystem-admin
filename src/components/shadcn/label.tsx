import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Label — alinhado com `.tbl-form-label` do design-and-table-v2.
 * Specs: 13px / 600 / fg-default / tracking 0.01em — boa prática WCAG
 * pra labels de form (contraste maior que helper text).
 *
 * Nota: usa `text-body-sm font-normal` literal (não preset `label-base`) pra manter
 * `leading-none` previsível na inspeção — preset DS carrega lineHeight
 * 18px que entra em conflito quando combinado com leading-none.
 */
const labelVariants = cva(
  "text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
