import { createContext } from "react";
import type { TabsNavigationDensity, TabsNavigationSurface } from "./tabs-navigation.types";

/**
 * Contexto em arquivo próprio pelo mesmo motivo do `AvatarGroup`: `tabs-navigation.tsx` define a raiz
 * E a aba, e a aba precisa ler o que a raiz decidiu (`density`, `fill`, `surface`, qual está
 * ativa). Com o contexto dentro do mesmo módulo isso é trivial, mas quem quisesse importar só
 * a aba puxaria a raiz junto — e no copy-in o arquivo viaja inteiro.
 */
export interface TabsNavigationContexto {
  value: string;
  onValueChange: (value: string) => void;
  surface: TabsNavigationSurface;
  density: TabsNavigationDensity;
  fill: boolean;
  actionsMode: "hover" | "persistent";
  /** Registrado pela raiz pra o `Panel` saber o `id` da aba que o rotula. */
  idTab: (value: string) => string;
}

export const TabsNavigationContext = createContext<TabsNavigationContexto | null>(null);
