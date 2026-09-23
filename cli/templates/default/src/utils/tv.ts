// src/utils/tv.ts
// tv() do DS — mesmo `tailwind-variants`, com a config de merge do design system.
//
// Importe SEMPRE daqui, nunca de "tailwind-variants" direto (gate: regra IMPORT do
// ds-lint-patterns). Sem o wrapper, o merge não reconhece nenhum token do DS.
import { tv as tvBase, type TVConfig } from "tailwind-variants";

import { twMergeConfig } from "./tw-merge-config";

export const tv: typeof tvBase = (options, config) =>
  tvBase(options, {
    ...config,
    twMergeConfig,
  } as TVConfig);

export type { VariantProps } from "tailwind-variants";
