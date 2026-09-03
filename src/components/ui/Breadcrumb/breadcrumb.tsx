import { Fragment, forwardRef } from "react";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb as BreadcrumbRaiz,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/shadcn/breadcrumb";
import { cn } from "@/lib/utils";
import { BreadcrumbSwitcher } from "./breadcrumb-switcher";
import { breadcrumbCaminho } from "./breadcrumb.styles";
import type { BreadcrumbProps, BreadcrumbItemData } from "./breadcrumb.types";

/** Só vira seletor com os TRÊS: lista, valor e callback (ver `breadcrumb.types.ts`). */
function ehSwitcher(
  item: BreadcrumbItemData,
): item is BreadcrumbItemData & {
  switcher: NonNullable<BreadcrumbItemData["switcher"]>;
  value: string;
  onValueChange: (value: string) => void;
} {
  return (
    Array.isArray(item.switcher) &&
    item.switcher.length > 0 &&
    typeof item.value === "string" &&
    typeof item.onValueChange === "function"
  );
}

/**
 * `Breadcrumb` — o caminho, nos dois modos que o DS precisa servir.
 *
 * ## Com `items`: dados entram, cadeia sai
 *
 * É o modo de 95% das telas. O componente resolve o que quase todo consumidor reescrevia na
 * unha: último item não é link, separador entre itens, truncagem, e o item que **troca o
 * registro aberto** (`switcher`) — tudo a partir de um array.
 *
 * ## Sem `items`: composição
 *
 * Renderiza `children` direto no primitivo. É a saída pra quem precisa interpor algo no meio
 * do caminho (um `Chip` de ambiente, um ícone) ou estilizar item a item. O primitivo continua
 * existindo em `shadcn/breadcrumb` — este arquivo não o substitui, embrulha.
 *
 * ## Por que os dois no mesmo nome
 *
 * Porque é a mesma peça. Dois componentes fariam a escolha aparecer no catálogo, no menu e no
 * vocabulário — e a pergunta "qual dos dois?" não tem resposta útil: é o mesmo caminho, com e
 * sem dados prontos.
 *
 * @example
 * <Breadcrumb
 *   items={[
 *     { label: "Clientes", href: "/clientes" },
 *     { label: cliente.nome, switcher: clientes, value: id, onValueChange: abrir },
 *   ]}
 * />
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, size = "md", separator, className, children, ...rest },
  ref,
) {
  if (!items) {
    return (
      <BreadcrumbRaiz ref={ref} className={className} {...rest}>
        {children}
      </BreadcrumbRaiz>
    );
  }

  if (items.length === 0) return null;

  /**
   * Item único = TÍTULO da página, não caminho — e por isso sobe pra 16px/600 no `size="sm"`.
   * Não é exceção estética: uma cadeia de um elemento só não é uma cadeia, é o nome da tela.
   * Esse comportamento vinha do `HeaderBreadcrumb` e é o que mantém o Header idêntico.
   */
  const sozinho = items.length === 1;
  const estilos = breadcrumbCaminho({ size, sozinho });

  return (
    <BreadcrumbRaiz ref={ref} className={className} {...rest}>
      <BreadcrumbList className={estilos.lista()}>
        {items.map((item, i) => {
          const ultimo = i === items.length - 1;
          const clicavel = !ultimo && (item.href !== undefined || item.onClick !== undefined);

          return (
            <Fragment key={`${item.label}-${i}`}>
              {i > 0 ? (
                <BreadcrumbSeparator className={estilos.separador()}>
                  {separator ?? <ChevronRight strokeWidth={1.7} />}
                </BreadcrumbSeparator>
              ) : null}

              <BreadcrumbItem className="min-w-0">
                {ehSwitcher(item) ? (
                  /* Vem ANTES do teste de link: um seletor com `href` continua sendo seletor —
                     o clique abre a lista. */
                  <BreadcrumbSwitcher
                    value={item.value}
                    onValueChange={item.onValueChange}
                    options={item.switcher}
                    size={size}
                    title={item.switcherTitle}
                    searchPlaceholder={item.switcherSearchPlaceholder}
                    emptyMessage={item.switcherEmptyMessage}
                    footer={item.switcherFooter}
                    aria-label={item.switcherAriaLabel ?? `Trocar: ${item.label}`}
                  />
                ) : clicavel ? (
                  <BreadcrumbLink
                    href={item.href ?? "#"}
                    className={estilos.item({ atual: false })}
                    onClick={(e) => {
                      if (!item.href) e.preventDefault();
                      item.onClick?.(e);
                    }}
                  >
                    {item.label}
                  </BreadcrumbLink>
                ) : ultimo ? (
                  <BreadcrumbPage className={estilos.item({ atual: true })}>
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <span className={cn(estilos.item({ atual: false }), "cursor-default")}>
                    {item.label}
                  </span>
                )}

                {/* `trailing` — irmão do rótulo/gatilho, FORA dele.

                    Depois do bloco condicional de propósito: vale igual pros
                    quatro tipos de item (seletor, link, página atual, texto
                    inerte), e nenhum deles precisa saber que existe.

                    Não vai DENTRO do gatilho do seletor porque ele é um
                    `<button>`: aninhar interativo em `<button>` é HTML inválido
                    e quebra clique e foco. Como irmão, o slot aceita qualquer
                    montagem — inclusive chip clicável, link ou botão.

                    `shrink-0` porque o `<li>` é `min-w-0`: sem isso o chip
                    seria o primeiro a ser esmagado quando o caminho aperta, e o
                    que tem que truncar é o rótulo, que é texto. */}
                {item.trailing ? (
                  <span className="flex shrink-0 items-center">{item.trailing}</span>
                ) : null}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbRaiz>
  );
});

Breadcrumb.displayName = "Breadcrumb";
