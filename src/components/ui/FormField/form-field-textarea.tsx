import { forwardRef } from "react";
import { Textarea, type TextareaProps } from "@/components/shadcn/textarea";
import { FormField } from "./form-field";
import type { FormFieldBaseProps } from "./form-field.types";

/**
 * FormFieldTextarea — wrapper "one-shot" pra um campo multilinha.
 * Compõe FormField + Textarea (mesmo componente do shadcn/), sem reimplementação.
 */
export type FormFieldTextareaProps = FormFieldBaseProps &
  Omit<TextareaProps, "state" | "id">;

export const FormFieldTextarea = forwardRef<
  HTMLTextAreaElement,
  FormFieldTextareaProps
>(
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
      ...textareaProps
    },
    ref,
  ) => (
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
      disabled={textareaProps.disabled}
    >
      {({ id: fieldId, state: fieldState }) => (
        <Textarea
          ref={ref}
          id={fieldId}
          state={fieldState}
          {...textareaProps}
        />
      )}
    </FormField>
  ),
);
FormFieldTextarea.displayName = "FormFieldTextarea";
