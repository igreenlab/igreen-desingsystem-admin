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
   * O título quebra em várias linhas (default `true`, que é como sempre foi) ou trunca
   * em uma só (`false`).
   *
   * Use `false` quando a altura do header for crítica e o título for previsível. Não o
   * use em título que carrega identificação (nome de projeto, de cliente): truncar ali
   * tira a informação que dá contexto à página inteira.
   */
  titleWrap?: boolean;
  /**
   * Linhas da descrição antes de cortar: 1 (default, igual ao anterior), 2 ou 3.
   */
  descriptionLines?: 1 | 2 | 3;

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
