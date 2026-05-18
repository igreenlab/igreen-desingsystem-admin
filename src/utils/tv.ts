// src/utils/tv.ts
// tv() customizado que ensina o tailwind-merge a reconhecer
// os presets tipográficos do iGreen como font-size, não text-color.
import { tv as tvBase, type TVConfig } from "tailwind-variants";

// Objeto de config — NÃO é o resultado de extendTailwindMerge()
// TV3 recebe o config diretamente e aplica o merge internamente
const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            // Displays
            "display-2xl", "display-xl", "display-lg", "display-md",
            // Headings (heading-2xs removido — duplicata de title-lg)
            "heading-xl", "heading-lg", "heading-md", "heading-sm",
            "heading-xs",
            // Titles
            "title-lg", "title-md", "title-sm",
            // Labels (+ label-base 13px e label-2xs 11px)
            "label-xl", "label-lg", "label-md", "label-sm", "label-base", "label-xs", "label-2xs",
            // Paragraphs (+ paragraph-base 13px)
            "paragraph-xl", "paragraph-lg", "paragraph-md",
            "paragraph-sm", "paragraph-base", "paragraph-xs",
            // Captions (+ caption-xs 10px)
            "caption-md", "caption-sm", "caption-xs",
            // Subheadings (+ strong-md/sm com weight 700 + tracking apertado)
            "subheading-md", "subheading-sm",
            "subheading-xs", "subheading-2xs",
            "subheading-strong-md", "subheading-strong-sm",
            // Code
            "code-md", "code-sm",
          ],
        },
      ],
    },
  },
};

export const tv: typeof tvBase = (options, config) =>
  tvBase(options, {
    ...config,
    twMergeConfig,
  } as TVConfig);

export type { VariantProps } from "tailwind-variants";
