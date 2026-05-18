import type { ReactNode } from "react";

/** Estado visual de um field — feedback semântico */
export type FieldState = "default" | "error" | "warning" | "success";

/**
 * Props compartilhados por todos os Form* wrappers (FormInput, FormSelect, etc).
 */
export type FormFieldBaseProps = {
  /** Label exibido acima do field */
  label?: string;
  /** Marca como required (asterisco vermelho ao lado do label) */
  required?: boolean;
  /** Texto auxiliar abaixo do field (esconde quando state="error" e errorMessage presente) */
  helperText?: ReactNode;
  /** Estado semântico do field — afeta cor da borda e mensagem exibida */
  state?: FieldState;
  /** Mensagem exibida quando state="error" (substitui helperText) */
  errorMessage?: ReactNode;
  /** Mensagem exibida quando state="warning" */
  warningMessage?: ReactNode;
  /** Mensagem exibida quando state="success" */
  successMessage?: ReactNode;
  /** className do container externo */
  className?: string;
  /** id do field (linka label↔input via htmlFor) */
  id?: string;
};
