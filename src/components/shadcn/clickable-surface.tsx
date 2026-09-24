"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { shouldPreventNavigation } from "@/utils/nav-link";

/**
 * ClickableSurface — o alvo esticado que transforma um card inteiro em botão ou link.
 *
 * ## Por que um elemento por cima, e não trocar a raiz por `<button>`
 *
 * O conteúdo permitido dentro de `<button>` é *phrasing content*. Um card tem `<h3>`,
 * parágrafos, às vezes uma tabela — HTML inválido, e o leitor de tela perde o heading
 * (deixa de anunciar a estrutura e passa a ler tudo como rótulo do botão). Trocar a raiz
 * por `<a>` tem o mesmo problema e ainda torna todo o texto interno parte do nome do link.
 *
 * A saída é um `<button>`/`<a>` vazio, absoluto, cobrindo a superfície: a árvore
 * semântica do card fica intacta e o alvo ganha foco, Enter/Space e — com `href` —
 * ctrl+clique, "abrir em nova aba" e "copiar endereço" de graça.
 *
 * ## Contrato de quem usa
 *
 * 1. O container precisa ser `relative` (senão o `inset-0` escapa pro ancestral posicionado).
 * 2. `label` é obrigatório: o alvo é vazio, então sem ele o leitor anuncia "botão" e nada mais.
 * 3. Controle que fica ACIMA do card (um menu, um botão de ajuda) precisa de `relative z-10`,
 *    senão o overlay o cobre e o clique vai pro card.
 *
 * Usado por `Card` (`onClick`/`href`) e por `Kpi`. Existe como peça própria porque a
 * segunda cópia de um padrão de acessibilidade sutil é onde ele começa a divergir.
 */
export type ClickableSurfaceLinkProps = {
  href: string;
  className: string;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  target?: string;
  "aria-label": string;
};

export type ClickableSurfaceProps = {
  /** Nome acessível do alvo. Obrigatório — o elemento não tem conteúdo. */
  label: string;
  /** Clique. Sem `href`, o alvo é `<button type="button">`. */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Destino. Com `href`, o alvo é `<a>`. */
  href?: string;
  /** `target` do anchor. `"_blank"` desliga o cancelamento da navegação. */
  target?: string;
  /** Substitui o `<a>` interno pelo link do seu router (L-068). */
  renderLink?: (props: ClickableSurfaceLinkProps) => React.ReactNode;
  className?: string;
};

export const CLICKABLE_SURFACE_CLASS =
  "absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand";

export function ClickableSurface({
  label,
  onClick,
  href,
  target,
  renderLink,
  className,
}: ClickableSurfaceProps) {
  if (!onClick && !href) return null;

  const classes = cn(CLICKABLE_SURFACE_CLASS, className);

  if (href) {
    const aoClicar = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // As 5 exceções que não podem cancelar a navegação (clique modificado, target,
      // href externo, href de hash, ausência de handler) estão medidas na L-068 — não
      // reimplemente aqui.
      if (
        shouldPreventNavigation({
          href,
          hasHandler: Boolean(onClick),
          target,
          event: e,
        })
      ) {
        e.preventDefault();
      }
      onClick?.(e);
    };

    const props: ClickableSurfaceLinkProps = {
      href,
      className: classes,
      onClick: aoClicar,
      target,
      "aria-label": label,
    };

    // Com `renderLink`, quem decide a navegação é o `<Link>` do router — o DS não mexe
    // em preventDefault (mesma regra do AppShell).
    return renderLink ? (
      <>{renderLink({ ...props, onClick: (e) => onClick?.(e) })}</>
    ) : (
      <a {...props} />
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} aria-label={label} />
  );
}

ClickableSurface.displayName = "ClickableSurface";
