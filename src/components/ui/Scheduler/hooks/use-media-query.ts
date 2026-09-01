import { useEffect, useState } from "react";

/**
 * Media query reativa — re-renderiza quando o resultado muda (resize,
 * mudança de orientação).
 *
 * ⚠️ **Isto é uma cópia** de `MenuSidebar/use-media-query.ts`, byte a byte no
 * comportamento. Não é descuido: importar de `../MenuSidebar` é o mesmo
 * cross-import entre pastas de `ui/` que gerou o `registryDependency` dangling
 * da L-049 no `DataList` — o item `scheduler` do registry passaria a depender
 * de `menu-sidebar` inteiro (com nav, rotas e drawer) pra usar 20 linhas de
 * `matchMedia`, e no copy-in o import não resolveria.
 *
 * Esta é a **segunda** duplicação que o `Scheduler` faz pelo mesmo motivo (a
 * primeira é a gramática visual da toolbar). Duas já são sinal: se aparecer uma
 * terceira, o certo passa a ser um item de registry compartilhado
 * (`@igreen/hooks` ou similar) em vez de seguir copiando — e aí as três cópias
 * convergem pra ele. Registrado como dívida no PR/handoff, não resolvido aqui,
 * porque criar canal de distribuição novo é decisão de release, não de
 * componente.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
