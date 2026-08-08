/**
 * Barrel dos primitivos shadcn adaptados aos tokens do DS.
 *
 * É o entry do subpath `@snksergio/design-system/shadcn` — separado do barrel raiz
 * de propósito: são 41 arquivos / 233 nomes exportados, e o consumidor típico usa 3 ou 4.
 * No mesmo entry do raiz, qualquer `import` do pacote arrastaria o grafo inteiro
 * (Radix, cmdk, vaul, embla, input-otp, sonner) antes de o bundler do consumidor
 * conseguir podar. Em subpath próprio, quem não importa `/shadcn` não paga nada.
 *
 * `export *` em todos: medido, os 41 arquivos não têm UMA colisão de nome entre si.
 *
 * ⚠️ A API destes é a padrão shadcn/Radix — não há `USAGE.md` por arquivo. O que
 * existe é o índice único `src/components/shadcn/USAGE.md`, só com **gotchas**
 * (setup no root, dep extra, receita flutuante L-040, z-index L-030).
 *
 * ⚠️ Consumidor npm: os primitivos usam as mesmas classes DS dos demais componentes,
 * então a diretiva `@source` do seu CSS precisa cobrir `dist-lib/**` — não só o
 * `index.mjs`. Sem ela nenhuma classe é gerada (Tailwind v4 não escaneia node_modules).
 */

export * from "./accordion";
export * from "./alert";
export * from "./alert-dialog";
export * from "./aspect-ratio";
export * from "./avatar";
export * from "./badge";
export * from "./breadcrumb";
export * from "./calendar";
export * from "./card";
export * from "./carousel";
export * from "./checkbox";
export * from "./collapsible";
export * from "./command";
export * from "./context-menu";
export * from "./dialog";
export * from "./drawer";
export * from "./dropdown-menu";
export * from "./hover-card";
export * from "./input";
export * from "./input-group";
export * from "./input-otp";
export * from "./label";
export * from "./menubar";
export * from "./navigation-menu";
export * from "./pagination";
export * from "./popover";
export * from "./progress";
export * from "./radio-group";
export * from "./scroll-area";
export * from "./select";
export * from "./separator";
export * from "./sheet";
export * from "./skeleton";
export * from "./slider";
export * from "./sonner";
export * from "./switch";
export * from "./tabs";
export * from "./textarea";
export * from "./toggle";
export * from "./toggle-group";
export * from "./tooltip";
