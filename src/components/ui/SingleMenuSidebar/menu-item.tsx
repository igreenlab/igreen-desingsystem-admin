"use client";

import type { MouseEvent } from "react";
import { shouldPreventNavigation } from "@/utils/nav-link";
import { menuItem } from "./single-menu-sidebar.styles";
import type { SingleMenuItemProps } from "./single-menu-sidebar.types";

/**
 * Item de menu do `SingleMenuSidebar`.
 *
 * ## O defeito que isto corrige (medido em 2026-08-18)
 *
 * Até aqui este componente renderizava **sempre** `<button type="button" onClick>` — e o
 * tipo `SingleMenuSubItem` declarava `href?: string`, e o `USAGE.md` documentava
 * `{ id, label, href? }`. Ou seja: o consumidor declarava o destino, o TypeScript aceitava,
 * e **nada lia**. `href` era prop morta.
 *
 * O que se perdia com isso — tudo silenciosamente, sem erro nenhum:
 *
 *   · ctrl/cmd+clique e botão do meio não abriam em nova aba
 *   · "copiar endereço do link" não existia no menu de contexto
 *   · leitor de tela anunciava "botão", não "link"
 *   · nenhum router do consumidor podia ser integrado
 *
 * ⚠️ **Não era o mesmo defeito do `MenuSidebar`.** Lá o `<a href>` existia e navegava
 * nativamente **junto** do handler, recarregando a página inteira a cada clique. Aqui o
 * problema é o oposto: não havia `<a>` nenhum. O conserto, porém, usa a mesma regra —
 * `@/utils/nav-link`, movido pra util compartilhada nesta mesma mudança justamente pra
 * não haver duas cópias divergindo (e pra o `single-menu-sidebar` não precisar depender
 * do item de registry do `menu-sidebar` inteiro só pra reaproveitar 60 linhas puras).
 */
export function SingleMenuItem({
  label,
  selected = false,
  href,
  target,
  onClick,
  renderLink,
  interceptNavigation,
}: SingleMenuItemProps) {
  const s = menuItem({ selected });

  const content = (
    <>
      <div className={s.border()} />
      <span className={s.text()}>{label}</span>
    </>
  );

  const handleClick = (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    // Só cancela a navegação nativa quando o consumidor claramente trata o clique — e
    // nunca em clique modificado, `target="_blank"`, link externo ou href de HASH. As 5
    // exceções e o porquê de cada uma estão em `@/utils/nav-link`.
    //
    // Não corre quando há `renderLink`: aí quem decide é o `<Link>` do router.
    if (!renderLink) {
      const prevent = shouldPreventNavigation({
        href,
        hasHandler: interceptNavigation ?? !!onClick,
        target,
        event: e as MouseEvent<HTMLAnchorElement>,
      });
      if (prevent) e.preventDefault();
    }
    onClick?.(e);
  };

  if (href) {
    const linkProps = {
      href,
      target,
      className: s.root(),
      onClick: handleClick as (e: MouseEvent<HTMLAnchorElement>) => void,
      "aria-current": selected ? ("page" as const) : undefined,
      children: content,
    };

    // `renderLink` é render-prop, não `linkComponent`: um componente escrito inline
    // remonta a subárvore a cada render do pai (L-068).
    if (renderLink) return <>{renderLink(linkProps)}</>;

    return <a {...linkProps} />;
  }

  return (
    <button type="button" onClick={handleClick} className={s.root()}>
      {content}
    </button>
  );
}

SingleMenuItem.displayName = "SingleMenuItem";
