import { createContext } from "react";
import type { NavTabsDensity, NavTabsSurface } from "./nav-tabs.types";

/**
 * Contexto em arquivo próprio pelo mesmo motivo do `AvatarGroup`: `nav-tabs.tsx` define a raiz
 * E a aba, e a aba precisa ler o que a raiz decidiu (`density`, `fill`, `surface`, qual está
 * ativa). Com o contexto dentro do mesmo módulo isso é trivial, mas quem quisesse importar só
 * a aba puxaria a raiz junto — e no copy-in o arquivo viaja inteiro.
 */
export interface NavTabsContexto {
  value: string;
  onValueChange: (value: string) => void;
  surface: NavTabsSurface;
  density: NavTabsDensity;
  fill: boolean;
  actionsMode: "hover" | "persistent";
  /** Registrado pela raiz pra o `Panel` saber o `id` da aba que o rotula. */
  idTab: (value: string) => string;
}

export const NavTabsContext = createContext<NavTabsContexto | null>(null);
