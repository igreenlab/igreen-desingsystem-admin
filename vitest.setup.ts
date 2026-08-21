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
