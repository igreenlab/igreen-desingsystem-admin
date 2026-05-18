import { forwardRef, type ReactNode } from "react";
import { Input, type InputProps } from "../../shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../shadcn/input-group";
import { FormField } from "./form-field";
import type { FormFieldBaseProps } from "./form-field.types";

/**
 * FormFieldInput — wrapper "one-shot" pra um campo de texto.
 *
 * Renderização condicional:
 *   - sem addon → renderiza <Input> puro
 *   - com `startAddon` ou `endAddon` → renderiza <InputGroup> com InputGroupInput
 *
 * Os addons aceitam string (renderiza como InputGroupText, ex "R$") ou ReactNode
 * (ícone, botão — passa direto). Não há mais startIcon vs startAdornment: o
 * InputGroup trata ambos via composição.
 */
export type FormFieldInputProps = FormFieldBaseProps &
  Omit<InputProps, "state" | "id"> & {
    /** Conteúdo à esquerda. String vira `<InputGroupText>`, ReactNode (ícone/botão) passa direto. */
    startAddon?: ReactNode;
    /** Conteúdo à direita. Mesma regra do startAddon. */
    endAddon?: ReactNode;
  };

function renderAddon(content: ReactNode, key: string): ReactNode {
  if (typeof content === "string") {
    return (
      <InputGroupAddon key={key} align={key === "start" ? "inline-start" : "inline-end"}>
        <InputGroupText>{content}</InputGroupText>
      </InputGroupAddon>
    );
  }
  return (
    <InputGroupAddon key={key} align={key === "start" ? "inline-start" : "inline-end"}>
      {content}
    </InputGroupAddon>
  );
}

export const FormFieldInput = forwardRef<HTMLInputElement, FormFieldInputProps>(
  (
    {
      label,
      required,
      helperText,
      state,
      errorMessage,
      warningMessage,
      successMessage,
      className,
      id,
      startAddon,
      endAddon,
      ...inputProps
    },
    ref,
  ) => {
    const hasAddon = startAddon !== undefined || endAddon !== undefined;
    // Separa o `size` do CVA pra usar no wrapper — InputGroupInput recebe os
    // demais HTML attrs (sem o size, que no <input> nativo seria number).
    const { size, ...inputHtmlProps } = inputProps;

    return (
      <FormField
        label={label}
        required={required}
        helperText={helperText}
        state={state}
        errorMessage={errorMessage}
        warningMessage={warningMessage}
        successMessage={successMessage}
        className={className}
        id={id}
        disabled={inputProps.disabled}
      >
        {({ id: fieldId, state: fieldState }) =>
          hasAddon ? (
            <InputGroup state={fieldState} size={size ?? undefined}>
              {startAddon !== undefined && renderAddon(startAddon, "start")}
              <InputGroupInput ref={ref} id={fieldId} {...inputHtmlProps} />
              {endAddon !== undefined && renderAddon(endAddon, "end")}
            </InputGroup>
          ) : (
            <Input
              ref={ref}
              id={fieldId}
              state={fieldState}
              size={size}
              {...inputHtmlProps}
            />
          )
        }
      </FormField>
    );
  },
);
FormFieldInput.displayName = "FormFieldInput";
