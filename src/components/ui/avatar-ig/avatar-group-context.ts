import { createContext } from "react";
import type { AvatarSize, AvatarSurface } from "./avatar.types";

/**
 * Contexto do `AvatarGroup` — é assim que o `size` chega nos filhos.
 *
 * ## Por que num arquivo só dele
 *
 * Evita ciclo de import: o `AvatarGroup` precisa do `Avatar` (renderiza o `+N`) e o `Avatar`
 * precisa do contexto (lê o `size`). Com o contexto dentro do `avatar-group.tsx`, os dois
 * módulos se importariam mutuamente — funciona em ESM na maioria dos casos, mas depende da
 * ordem de avaliação e alguns bundlers avisam. Arquivo próprio corta a dependência.
 *
 * ## Por que contexto e não `cloneElement`
 *
 * Mesmo mecanismo do `ChipGroup`, do `KpiGroup` e do `CardOptionGroup`. Clonar filhos quebra
 * quando eles vêm de um `map`, de um fragmento ou de um wrapper — que é exatamente como uma
 * lista de responsáveis costuma ser montada.
 *
 * `undefined` = sem grupo em volta, e aí o `Avatar` mantém o default dele (`md`).
 */
export const AvatarGroupContext = createContext<
  { size?: AvatarSize; surface: AvatarSurface } | undefined
>(undefined);
