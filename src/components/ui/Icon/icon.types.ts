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

/**
 * Ícone como DADO, fora do mapa por nome: o path (ou paths, multi-path) + o nome,
 * de onde sai o `viewBox`. As constantes vivem em `icon-glyphs.ts`.
 */
export interface IconGlyph {
  name: string;
  d: string | string[];
}

/** Props do `IconSvg` — as mesmas do `Icon`, com `glyph` no lugar de `name`. */
export interface IconSvgProps extends Omit<IconProps, "name"> {
  /** O ícone a desenhar (constante de `icon-glyphs.ts`). */
  glyph: IconGlyph;
}
