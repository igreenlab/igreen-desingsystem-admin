import { forwardRef, useId, type ReactNode } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Checkbox } from "../../shadcn/checkbox";
import { cn } from "@/lib/utils";
import {
  formFieldRoot,
  formFieldLabel,
  formFieldRequired,
  formFieldMessage,
} from "./form-field.styles";
import type { FormFieldBaseProps, FieldState } from "./form-field.types";

/**
 * FormFieldCheckbox — wrapper "one-shot" pra checkbox com label inline.
 *
 * Layout (diferente de FormFieldInput/Select):
 *   ┌──────────────────────────────────────┐
 *   │ [☑] Label texto                      │
 *   │     Helper / error message           │
 *   └──────────────────────────────────────┘
 *
 * Reaproveita o Checkbox do shadcn. O label fica à direita (não em cima).
 */
export type FormFieldCheckboxProps = Omit<FormFieldBaseProps, "label"> & {
  /** Texto do label (inline à direita do checkbox) */
  label?: ReactNode;
  /** Props nativas do Radix Checkbox.Root */
} & Omit<
    ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    "id" | "className"
  >;

export const FormFieldCheckbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  FormFieldCheckboxProps
>(
  (
    {
      label,
      required,
      helperText,
      state = "default",
      errorMessage,
      warningMessage,
      successMessage,
      className,
      id: idProp,
      disabled,
      ...checkboxProps
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp ?? autoId;

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
      <div className={cn(formFieldRoot(), "gap-[5px]", className)}>
        <div className="flex items-center gap-gp-md">
          <Checkbox
            ref={ref}
            id={id}
            disabled={disabled}
            {...checkboxProps}
          />
          {label && (
            <label
              htmlFor={id}
              className={cn(formFieldLabel({ disabled }), "cursor-pointer")}
            >
              {label}
              {required && (
                <span className={formFieldRequired()} aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
        </div>
        {message && (
          <p
            className={cn(formFieldMessage({ state: messageState }), "pl-[26px]")}
            role={messageState === "error" ? "alert" : undefined}
          >
            {message}
          </p>
        )}
      </div>
    );
  },
);
FormFieldCheckbox.displayName = "FormFieldCheckbox";
