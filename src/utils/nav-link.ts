/**
 * nav-link.ts — decide se o clique num item de navegação deve cancelar a
 * navegação nativa do `<a>`.
 *
 * ## O defeito que isto corrige
 *
 * O `SidebarItem` renderiza `<a href={item.href}>` e **nunca** chamava
 * `preventDefault`. Com `href` de PATH (`/app/clientes`) — o que todo app com
 * `BrowserRouter` usa — o handler do consumidor rodava **e** o browser executava a
 * navegação: **recarregamento completo da página a cada clique de menu**.
 *
 * Ficou meses invisível porque o exemplo canônico (`src/examples/app-shell/nav-data.ts`)
 * usa `href` de **HASH** (`#/app/clientes`) em todos os itens, e mudança de fragmento
 * **não** recarrega documento. Showcase verde, consumidor quebrado — a assinatura da
 * "segunda regra de ouro" do DS. Nenhum gate podia pegar: `tsc`, os testes,
 * `registry-check` e `examples-drift` não exercitam roteamento.
 *
 * Reproduzido em 2026-08-08 com o componente real: o jsdom imprime
 * `Not implemented: navigation to another Document` no clique.
 *
 * ## Por que NÃO é só "chamar preventDefault"
 *
 * Cancelar sempre quebraria quatro coisas legítimas, e a 4ª quebraria o próprio showcase:
 *
 * 1. **Clique modificado** (ctrl/cmd/shift/alt, botão do meio) — é como o usuário abre
 *    em nova aba. Cancelar mata isso e não há como o consumidor recuperar.
 * 2. **`target="_blank"`** — o item pede explicitamente outra aba.
 * 3. **Link externo** (`https:`, `mailto:`, `tel:`, `//host`) — não é rota do app;
 *    router nenhum resolve, e cancelar deixaria o link morto.
 * 4. **`href` de HASH** (`#/rota`) — ⚠️ o mais sutil. Hash router escuta `hashchange`;
 *    cancelar o default impede o fragmento de mudar e **o evento nunca dispara**. Ou
 *    seja: cancelar cegamente trocaria "recarrega" por "não navega" em todo consumidor
 *    de hash router — e no `example-app-shell`, que é a referência do próprio DS.
 *
 * ## A regra
 *
 * Só cancela quando as 4 condições valem juntas: há intenção declarada de tratar o
 * clique (`onItemClick` no componente ou `onClick` no item), o clique é simples, o
 * destino é uma rota interna, e o `href` **não** é hash.
 *
 * Consumidor que quer o caminho canônico passa `renderLink` — aí o `<Link>` do router
 * cuida de tudo e esta heurística nem roda.
 */
import type { MouseEvent } from "react";

/** Protocolos/formas que nunca são rota interna do app. */
const EXTERNO = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** `https://x`, `mailto:a@b`, `tel:+55`, `//cdn` → true. `/app`, `#/app`, `app` → false. */
export function isExternalHref(href: string | undefined): boolean {
  if (!href) return false;
  // `#` sozinho ou `#/rota` nunca é externo, e `:` dentro de fragmento não conta.
  if (href.startsWith("#")) return false;
  return EXTERNO.test(href);
}

/** `#`, `#/rota` → true. Hash muda fragmento, não documento. */
export function isHashHref(href: string | undefined): boolean {
  return !!href && href.startsWith("#");
}

/** ctrl/cmd/shift/alt ou botão que não é o principal → o usuário quer outra aba/janela. */
export function isModifiedClick(e: {
  button?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}): boolean {
  return (
    (e.button ?? 0) !== 0 ||
    !!e.metaKey ||
    !!e.ctrlKey ||
    !!e.shiftKey ||
    !!e.altKey
  );
}

export type PreventNavigationInput = {
  /** O `href` do item. Ausente → é `<button>`, não há navegação a cancelar. */
  href?: string;
  /** Há handler do consumidor pro clique? Sem isso, o `<a>` é a única navegação. */
  hasHandler: boolean;
  /** `target` do item (`"_blank"` desliga o cancelamento). */
  target?: string;
  /** O evento — só as teclas/botão são lidos. */
  event: Pick<
    MouseEvent<HTMLAnchorElement>,
    "button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey" | "defaultPrevented"
  >;
};

/**
 * @returns `true` quando o clique deve ter `preventDefault()` — ou seja, quando cancelar
 *   a navegação nativa é o que o consumidor claramente quer.
 */
export function shouldPreventNavigation({
  href,
  hasHandler,
  target,
  event,
}: PreventNavigationInput): boolean {
  if (!href) return false; // é <button>
  if (!hasHandler) return false; // ninguém vai tratar → deixa o <a> navegar
  if (event.defaultPrevented) return false; // alguém já decidiu antes
  if (target && target !== "_self") return false; // pediu outra aba
  if (isHashHref(href)) return false; // hash router depende do hashchange
  if (isExternalHref(href)) return false; // não é rota do app
  if (isModifiedClick(event)) return false; // abrir em nova aba
  return true;
}
