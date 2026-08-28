import "@testing-library/jest-dom/vitest";

/**
 * jsdom não implementa a Pointer Capture API, e o Radix a usa em TODO menu
 * flutuante (Select, DropdownMenu, Popover): abrir o gatilho chama
 * `hasPointerCapture` e o teste morre com `is not a function` — falha da
 * plataforma de teste, não do componente.
 *
 * Sem isto, nenhum teste consegue ABRIR um Select para clicar numa opção, e a
 * única coisa testável de um dropdown vira o estado fechado.
 *
 * `scrollIntoView` cai na mesma categoria: o Radix rola o item ativo para a
 * área visível ao abrir a lista.
 */
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => undefined;
  Element.prototype.releasePointerCapture = () => undefined;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => undefined;
}

/**
 * `ResizeObserver` — mesma categoria: jsdom não implementa, e o **cmdk** o instancia no mount
 * de qualquer `<Command>`. Isso derruba o teste com `ReferenceError` antes de qualquer
 * asserção, e atinge tudo que usa busca em lista: `Command`, `Combobox`, o ⌘K do `Header` e o
 * `BreadcrumbSwitcher`. Não dá pra guardar por dentro como fazemos no nosso código (o
 * `TabsNavigation` checa `typeof ResizeObserver`) — a chamada é da dependência.
 *
 * O stub não observa nada: os testes verificam comportamento (o que abre, o que filtra, o que
 * volta no callback), não medida de layout — que em jsdom seria 0 de qualquer forma.
 */
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
