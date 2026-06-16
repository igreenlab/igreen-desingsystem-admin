// @igreen-stamp: igreen-ds · button · v0.9.0 · 8694a32 · 2026-06-16
import { forwardRef } from "react";
import type { ButtonProps } from "./button.types";
import { buttonVariants } from "./button.styles";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      color,
      variant,
      size,
      shape,
      fullWidth,
      loading = false,
      disabled = false,
      iconLeft,
      iconRight,
      children,
      className,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={buttonVariants({
          color,
          variant,
          size,
          shape,
          fullWidth,
          disabled: isDisabled,
          className,
        })}
        {...rest}
      >
        {loading && <Spinner />}
        {!loading && iconLeft}
        {children}
        {!loading && iconRight}
      </button>
    );
  },
);

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="animate-spin"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28"
        strokeDashoffset="8"
        className="opacity-70"
      />
    </svg>
  );
}
