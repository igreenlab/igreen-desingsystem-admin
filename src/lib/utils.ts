import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

import { twMergeConfig } from "@/utils/tw-merge-config";

/**
 * `cn` — junta classes (clsx) e resolve conflito (tailwind-merge).
 *
 * A config do merge mora em `src/utils/tw-merge-config.ts` e é a MESMA usada pelo `tv()`
 * do DS. Antes cada um tinha a sua, com um comentário aqui pedindo sincronia manual que
 * nunca existiu — a de `tv` só conhecia os presets tipográficos.
 */
const twMerge = extendTailwindMerge(twMergeConfig);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
