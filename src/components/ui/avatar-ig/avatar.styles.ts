import { tv, type VariantProps } from "@/utils/tv";

/**
 * Avatar styles — iGreen DS
 *
 * Circular badge with initials. No interactive states (no hover, no focus, no disabled).
 *
 * Size uses `size-comp-*` tokens (square: width = height):
 *   xs = 20px (comp-2xs)  |  sm = 24px (comp-xs)  |  md = 28px (comp-sm)
 *   lg = 32px (comp-md)   |  xl = 40px (comp-xl)
 *
 * Color applies bg + fg pairs from semantic tokens.
 * `_custom` is an internal-only variant used when `colorHex` overrides the
 * background via inline style — it intentionally applies no bg/fg so the
 * component can set them manually.
 *
 * Typography scales with size to keep initials proportional inside the circle.
 */
export const avatarVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "shrink-0",
    "rounded-radius-full",
    "overflow-hidden",
    "leading-none",
    "font-bold",
    "select-none",
  ],

  variants: {
    size: {
      xs: "size-comp-2xs text-caption-sm",  // 20px / 11px
      sm: "size-comp-xs  text-caption-sm",  // 24px / 11px
      md: "size-comp-sm  text-caption-sm",  // 28px / 11px — default
      lg: "size-comp-md  text-body-sm font-normal",  // 32px / 13px
      xl: "size-comp-xl  text-body-md font-medium",    // 40px / 14px
    },

    color: {
      brand:    "bg-bg-brand    text-fg-on-brand",
      success:  "bg-bg-success  text-fg-on-success",
      warning:  "bg-bg-warning  text-fg-on-warning",
      critical: "bg-bg-danger   text-fg-on-danger",
      info:     "bg-bg-info     text-fg-on-info",
      muted:    "bg-bg-muted    text-fg-muted",
      /** Internal: used by colorHex override — no bg/fg applied. */
      _custom:  "",
    },
  },

  defaultVariants: {
    size: "md",
    color: "muted",
  },
});

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;

/**
 * Item da pilha do `AvatarGroup` — o wrapper que sobrepõe e desenha o anel de separação.
 *
 * ## Por que o anel mora AQUI e não no `Avatar`
 *
 * `ring` acompanha o `border-radius` do elemento em que está. Num wrapper quadrado ele
 * traçaria um quadrado em volta do círculo — daí o `rounded-radius-full` no próprio wrapper.
 * E ficar no wrapper (e não no `Avatar`) mantém o `Avatar` solto sem anel nenhum: o anel só
 * existe porque há sobreposição.
 *
 * ## A sobreposição escala com o tamanho
 *
 * Não é constante: 6px num avatar de 20px é **30%** de sobreposição, e no de 40px é **15%** —
 * visualmente são arranjos diferentes. O mapa abaixo mantém ~25% em toda a escala, e cada
 * valor é token de spacing (`sp-*`), não px na unha.
 *
 * ## O `surface` existe porque o anel é da cor do que está ATRÁS
 *
 * `ring-bg-surface` num painel funciona; na linha de uma tabela (`bg-bg-table`) apareceria um
 * halo claro em volta de cada avatar. Quem sabe o que está atrás é quem compõe — daí ser prop.
 */
/**
 * Container da pilha. É um `tv()` de uma linha só de propósito: sem ele o `className` do
 * consumidor entraria por concatenação crua, e `items-start` não venceria o `items-center`
 * daqui (é o `twMerge` embutido no `tv` que resolve conflito de classe). Também mantém o
 * `avatar-ig` dependendo só de `@igreen/tv` — usar o `cn` de `@/lib/utils` acrescentaria uma
 * `registryDependency` ao item por causa de duas classes.
 */
export const avatarGroupRoot = tv({ base: "flex items-center" });

export const avatarGroupItem = tv({
  base: ["relative inline-flex rounded-radius-full ring-2"],

  variants: {
    /** Deslocamento negativo ≈ 25% do diâmetro, em token. Ver o bloco acima. */
    size: {
      xs: "-ml-sp-xs", //  20px → 4
      sm: "-ml-sp-sm", //  24px → 6
      md: "-ml-sp-sm", //  28px → 6
      lg: "-ml-sp-md", //  32px → 8
      xl: "-ml-sp-lg", //  40px → 10
    },

    /** Cor do anel = superfície de trás. */
    surface: {
      surface: "ring-bg-surface",
      canvas: "ring-bg-canvas",
      subtle: "ring-bg-subtle",
      muted: "ring-bg-muted",
      table: "ring-bg-table",
    },

    /** O primeiro não desloca — senão a pilha inteira sai da margem esquerda. */
    primeiro: { true: "ml-0" },
  },

  defaultVariants: {
    size: "md",
    surface: "surface",
  },
});
