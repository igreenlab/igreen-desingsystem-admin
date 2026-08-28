/**
 * Breadcrumb — o caminho e as suas variações, num lugar só.
 *
 * Os primitivos (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, …) continuam morando em
 * `shadcn/breadcrumb.tsx`, que é onde a API padrão do shadcn deve ficar; aqui eles são
 * **re-exportados** junto com o `BreadcrumbSwitcher`. Assim o consumidor importa a peça
 * inteira de um endereço só e não precisa saber que uma metade nasceu no shadcn.
 *
 * ⚠️ O switcher não é "outro componente": é o item do caminho quando ele **troca o registro
 * aberto** em vez de linkar. Manter os dois separados fazia a mesma peça aparecer duas vezes
 * no catálogo, no menu e no vocabulário — foi o que o mantenedor apontou.
 */
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/shadcn/breadcrumb";

export { BreadcrumbSwitcher } from "./breadcrumb-switcher";
export { breadcrumbSwitcher } from "./breadcrumb-switcher.styles";
export type {
  BreadcrumbSwitcherProps,
  BreadcrumbSwitcherOption,
} from "./breadcrumb-switcher.types";
