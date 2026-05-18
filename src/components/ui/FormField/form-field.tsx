import { useId } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  formFieldRoot,
  formFieldLabel,
  formFieldRequired,
  formFieldMessage,
} from "./form-field.styles";
import type { FormFieldBaseProps, FieldState } from "./form-field.types";

export type FormFieldProps = FormFieldBaseProps & {
  /** O field em si (Input, Select, Textarea, Checkbox, Switch, etc) — recebe id automático */
  children: (ctx: { id: string; state: FieldState }) => ReactNode;
  /** Hide quando o field é "self-contained" (ex: Checkbox com label inline) */
  hideLabel?: boolean;
  /** Marcar field como disabled (afeta cor do label) */
  disabled?: boolean;
};

/**
 * FormField — base wrapper compartilhado por FormFieldInput, FormFieldSelect, etc.
 *
 * Estrutura:
 *   [Label + required asterisk]   (top)
 *   [Field (passado via children render-prop)]
 *   [Helper text OR error/warning/success message]   (bottom)
 *
 * Mensagem é decidida pela prioridade: error → warning → success → helperText.
 * O `id` gerado é passado ao child via render-prop pra linkar `htmlFor` no label.
 */
export function FormField({
  label,
  required,
  helperText,
  state = "default",
  errorMessage,
  warningMessage,
  successMessage,
  className,
  id: idProp,
  children,
  hideLabel,
  disabled,
}: FormFieldProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  // Priority: error → warning → success → helper
  let message: ReactNode = helperText;
  let messageState: FieldState = "default";
  if (state === "error" && errorMessage) {
    message = errorMessage;
    messageState = "error";
  } else if (state === "warning" && warningMessage) {
    message = warningMessage;
    messageState = "warning";
  } else if (state === "success" && successMessage) {
    message = successMessage;
    messageState = "success";
  }

  return (
    <div className={cn(formFieldRoot(), className)}>
      {label && !hideLabel && (
        <label
          htmlFor={id}
          className={formFieldLabel({ disabled })}
        >
          {label}
          {required && <span className={formFieldRequired()} aria-hidden="true">*</span>}
        </label>
      )}
      {children({ id, state })}
      {message && (
        <p
          className={formFieldMessage({ state: messageState })}
          role={messageState === "error" ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
}
