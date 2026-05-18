import { forwardRef, useId, type ReactNode } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Switch } from "../../shadcn/switch";
import { cn } from "@/lib/utils";
import {
  formFieldRoot,
  formFieldLabel,
  formFieldRequired,
  formFieldMessage,
} from "./form-field.styles";
import type { FormFieldBaseProps, FieldState } from "./form-field.types";

/**
 * FormFieldSwitch — wrapper "one-shot" pra toggle switch com label inline.
 *
 * Layout: label à ESQUERDA, switch à DIREITA (padrão de toggle):
 *   ┌──────────────────────────────────────┐
 *   │ Label texto              [○──]       │
 *   │ Helper / error message               │
 *   └──────────────────────────────────────┘
 *
 * Reaproveita o Switch do shadcn.
 */
export type FormFieldSwitchProps = Omit<FormFieldBaseProps, "label"> & {
  label?: ReactNode;
  /** Posição do switch — default "end" (direita). "start" coloca à esquerda do label. */
  switchPosition?: "start" | "end";
} & Omit<
    ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    "id" | "className"
  >;

export const FormFieldSwitch = forwardRef<
  ElementRef<typeof SwitchPrimitive.Root>,
  FormFieldSwitchProps
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
      switchPosition = "end",
      ...switchProps
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

    const switchEl = (
      <Switch ref={ref} id={id} disabled={disabled} {...switchProps} />
    );
    const labelEl = label && (
      <label
        htmlFor={id}
        className={cn(formFieldLabel({ disabled }), "cursor-pointer flex-1")}
      >
        {label}
        {required && (
          <span className={formFieldRequired()} aria-hidden="true">
            *
          </span>
        )}
      </label>
    );

    return (
      <div className={cn(formFieldRoot(), "gap-[5px]", className)}>
        <div className="flex items-center gap-gp-md">
          {switchPosition === "start" ? (
            <>
              {switchEl}
              {labelEl}
            </>
          ) : (
            <>
              {labelEl}
              {switchEl}
            </>
          )}
        </div>
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
  },
);
FormFieldSwitch.displayName = "FormFieldSwitch";
