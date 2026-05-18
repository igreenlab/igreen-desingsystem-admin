import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectTriggerState,
} from "../../shadcn/select";
import { FormField } from "./form-field";
import type { FormFieldBaseProps } from "./form-field.types";

export type FormFieldSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

/**
 * FormFieldSelect — wrapper "one-shot" pra um select dropdown.
 *
 * Compõe FormField + Select (radix) — reutiliza os Select* primitives existentes.
 *
 * Uso simples via `options`:
 *   <FormFieldSelect label="País" placeholder="Selecione..." options={[
 *     { value: "br", label: "Brasil" },
 *     { value: "us", label: "Estados Unidos" },
 *   ]} />
 *
 * Pra casos avançados (groups, separators), use o Select primitive direto.
 */
export type FormFieldSelectProps = FormFieldBaseProps & {
  options: FormFieldSelectOption[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  /** className aplicado ao <SelectTrigger>. Pra estilizar o wrapper, use `className` (vai pro FormField root). */
  triggerClassName?: string;
  /** Largura/maxHeight customizada do dropdown */
  contentClassName?: string;
};

export function FormFieldSelect({
  label,
  required,
  helperText,
  state,
  errorMessage,
  warningMessage,
  successMessage,
  className,
  id,
  options,
  placeholder,
  value,
  defaultValue,
  onValueChange,
  disabled,
  triggerClassName,
  contentClassName,
}: FormFieldSelectProps) {
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
      disabled={disabled}
    >
      {({ id: fieldId, state: fieldState }) => (
        <Select
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
        >
          <SelectTrigger
            id={fieldId}
            state={fieldState as SelectTriggerState}
            className={triggerClassName}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className={contentClassName}>
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}
