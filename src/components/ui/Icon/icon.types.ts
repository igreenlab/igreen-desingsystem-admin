import type { SVGProps } from "react";
import { icons } from "./icons";

/** Nome do ícone — chave da biblioteca de tokens (`icons.ts`). Autocompleta. */
export type IconName = keyof typeof icons;

export type IconSizePreset = "xs" | "sm" | "md" | "lg" | "xl";

/** Preset (`xs`–`xl`) ou valor arbitrário (`number` em px, ou string CSS: `'2rem'`). */
export type IconSize = IconSizePreset | number | (string & {});

export type IconTone =
  | "default"
  | "muted"
  | "brand"
  | "danger"
  | "success"
  | "warning"
  | "info";

export interface IconProps
  extends Omit<SVGProps<SVGSVGElement>, "name" | "fontSize"> {
  /** Qual ícone renderizar (muda o `d` do path). */
  name: IconName;
  /** Tamanho — preset (token `size-icon-*`) ou valor arbitrário. @default "md" */
  size?: IconSize;
  /** Cor CSS arbitrária (override). Sem isso herda `currentColor` / `tone`. */
  color?: string;
  /** Tom semântico via token (`fg.*`). */
  tone?: IconTone;
  /** Texto acessível → vira `<title>` + `role="img"`. Sem isso o ícone é decorativo (`aria-hidden`). */
  title?: string;
}
