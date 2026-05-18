import type { ReactNode } from "react";

export type PageHeaderProps = {
  /** Título principal da página (h1, text-title-md). */
  title?: string;
  /** Descrição/subtítulo logo abaixo do title. */
  description?: string;
  /**
   * Chip/badge inline ao lado do title (ex: contador de registros, status).
   * Aceita qualquer ReactNode mas normalmente é um `<Chip>` do DS.
   */
  badge?: ReactNode;
  /**
   * Slot do bloco de ações à direita (Buttons, dropdowns, etc).
   * No mobile (<md), por default o ÚLTIMO filho ganha `flex-1` pra virar
   * fluido. Desligue via `fluidPrimaryOnMobile={false}`.
   */
  actions?: ReactNode;
  /**
   * Conteúdo extra renderizado abaixo da linha title/actions — útil pra
   * tabs, filtros secundários, etc. Recebe largura total do header.
   */
  children?: ReactNode;

  /**
   * Em mobile (<md), esconde o bloco title/description/badge.
   *  - Default: `true` (pq o AppShell global já mostra o breadcrumb/título
   *    no Header — duplicação prejudica espaço vertical em telas pequenas).
   *  - `false`: mantém o bloco visível em qualquer viewport.
   */
  hideTextOnMobile?: boolean;
  /**
   * Em mobile, faz o último filho do `actions` ocupar o espaço restante
   * (vira CTA full-width). Default: `true`.
   */
  fluidPrimaryOnMobile?: boolean;

  /** className extra no `<header>` root. */
  className?: string;
};
