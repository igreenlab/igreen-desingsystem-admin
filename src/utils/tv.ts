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
            // Displays (fluid clamp)
            "display-2xl", "display-xl", "display-lg", "display-md",
            // Headings (xs estático, sm-xl fluid clamp)
            "heading-xl", "heading-lg", "heading-md", "heading-sm", "heading-xs",
            // Titles (weight 600 default)
            "title-lg", "title-md", "title-sm",
            // Body (xs/sm = weight 500 interactive; md-2xl = 400 corrido)
            "body-2xl", "body-xl", "body-lg", "body-md", "body-sm", "body-xs",
            // Captions (weight 400)
            "caption-md", "caption-sm", "caption-xs",
            // Code (mono regular)
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
