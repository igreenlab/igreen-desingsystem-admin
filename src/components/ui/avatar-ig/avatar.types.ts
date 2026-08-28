import type { AvatarVariantProps } from "./avatar.styles";

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    Omit<AvatarVariantProps, "color"> {
  /**
   * Semantic color preset for bg + fg pairing.
   * Ignored when `colorHex` is provided.
   * @default "muted"
   */
  color?: "brand" | "success" | "warning" | "critical" | "info" | "muted";

  /**
   * Hex color override (e.g. person-specific color).
   * When provided, background is set via inline style and text becomes white.
   * Takes precedence over `color`.
   */
  colorHex?: string;
}

/** Tamanhos do avatar — reusado pelo grupo, que os propaga por contexto. */
export type AvatarSize = NonNullable<AvatarVariantProps["size"]>;

/**
 * Superfície ATRÁS do grupo — define a cor do anel que separa um avatar do outro.
 * Errar aqui é o defeito clássico da pilha: anel `surface` numa linha de tabela vira halo.
 */
export type AvatarSurface = "surface" | "canvas" | "subtle" | "muted" | "table";

export interface AvatarGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * Tamanho de TODOS os avatares do grupo, propagado por contexto.
   * `size` no filho vence — escape hatch pro caso de um destacado.
   * @default "md"
   */
  size?: AvatarSize;

  /** Acima disso, corta e mostra `+N` no fim. Sem `max`, mostra todos. */
  max?: number;

  /**
   * Contagem REAL, quando ela não é o número de filhos renderizados.
   * Sem isso, uma lista paginada em 5 mostraria `+0` tendo 40 pessoas.
   */
  total?: number;

  /**
   * Superfície atrás do grupo — cor do anel de separação.
   * @default "surface"
   */
  surface?: AvatarSurface;
}
