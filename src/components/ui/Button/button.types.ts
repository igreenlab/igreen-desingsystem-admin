// @igreen-stamp: igreen-ds · button · v0.9.0 · 8694a32 · 2026-06-16
import type { ButtonVariantProps } from "./button.styles";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "color">,
    ButtonVariantProps {
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}
