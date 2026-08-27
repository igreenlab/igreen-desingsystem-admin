import { tv, type VariantProps } from "@/utils/tv";

/**
 * CardOption — controle de formulário apresentado como card clicável, com o controle
 * (checkbox, radio ou switch) trocável por prop.
 *
 * ## Por que um componente e não três
 *
 * Medido em 2026-08-27: dos três padrões de "card com controle" que o DS mostrava, **só um
 * era componente** (`CardCheckbox`). O "Card Selection" do radio e o "Card Toggle" do switch
 * eram markup solto dentro das páginas de doc — e por isso divergiam em 11 dimensões:
 * alinhamento (`items-start` vs `items-center`), padding (20px vs 12px), radius, preset do
 * label (`body-md medium` vs `body-sm semibold`), preset da descrição (`body-md` onde devia
 * ser `caption`), cor do selecionado, lado do input, e por aí.
 *
 * O que produziu a divergência foi a ausência de componente, não falta de disciplina: cada
 * exemplo foi escrito à mão, em momentos diferentes, e quem copiasse da doc levava a versão
 * daquele dia. `has-[[data-state=checked]]` aparecia 5× no repo, **todas** em página de doc e
 * nenhuma em tela real — ou seja, a janela pra unificar era esta, sem migração.
 *
 * ## As duas assimetrias que o `type` carrega
 *
 * Não é "o mesmo card com controle diferente" em tudo:
 *
 *   1. **Lado do controle.** Checkbox/radio à esquerda, switch à direita — convenção de linha
 *      de configuração. Um default único erraria metade dos casos, então o default deriva do
 *      `type` (ver `card-option.tsx`).
 *   2. **Destaque de selecionado.** Radio/checkbox SELECIONAM uma opção e ganham o destaque
 *      (`bg-success-muted` + `border-brand`). Switch é ESTADO, não seleção: uma lista de
 *      settings toda verde é ruído, e é exatamente por isso que o exemplo antigo do switch
 *      não tinha estado nenhum. Daí `highlightSelected` derivar do `type`.
 *
 * ## Foco — corrige defeito do CardCheckbox
 *
 * O anel vai no card por **`has-[:focus-visible]`**, não por `focus-visible:` no root. O
 * `CardCheckbox` declarava `focus-visible:ring-4` no `<label>`, e **label não recebe foco**:
 * era CSS morto (verificado no browser em 2026-08-27 — o anel que aparecia era só o do
 * controle de 16px, do `shadcn/checkbox`). Com `has-`, o card inteiro reage ao foco do
 * controle interno, que é o que a área clicável grande promete.
 */
export const cardOption = tv({
  slots: {
    root: [
      "flex w-full items-center",
      "border text-left cursor-pointer",
      "transition-[border-color,background-color,box-shadow] duration-150",
      // O anel é do CARD, disparado pelo foco do controle dentro dele.
      "has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ring-brand",
    ],
    control: "shrink-0",
    iconWrap: "grid shrink-0 place-items-center",
    body: "flex min-w-0 flex-1 flex-col gap-gp-2xs",
    label: "truncate font-semibold leading-tight text-fg-default",
    description: "text-fg-muted",
  },
  variants: {
    size: {
      sm: {
        root: "p-pad-md gap-gp-md rounded-radius-md",
        label: "text-body-sm",
        description: "text-caption-sm",
      },
      md: {
        root: "p-pad-xl gap-gp-lg rounded-radius-lg",
        label: "text-body-sm",
        description: "text-caption-md",
      },
      lg: {
        root: "p-pad-2xl gap-gp-xl rounded-radius-xl",
        label: "text-body-md",
        description: "text-caption-md",
      },
    },
    /** Onde o controle fica. `right` empurra o corpo, não reordena o DOM. */
    orientation: {
      left: {},
      right: { root: "flex-row-reverse" },
    },
    /**
     * O destaque de selecionado vem do **data attribute do controle**, não de prop.
     *
     * ⚠️ A 1ª versão derivava de `checked === true` em JS e o card de **radio nunca
     * destacava** — a seleção do radio mora no `value` do grupo, não numa prop do item, então
     * a condição era falsa por construção. Pego no browser: o item com
     * `data-state="checked"` seguia branco.
     *
     * `has-[[data-state=checked]]` resolve os três tipos de uma vez e funciona também em uso
     * NÃO-CONTROLADO (`defaultValue`/`defaultChecked`), onde nenhuma prop diz o estado. É a
     * L-012: Radix marca estado por data attribute, não por atributo HTML.
     */
    highlight: {
      true: {
        root: [
          "border-border-default bg-bg-surface hover:border-border-input hover:bg-bg-muted",
          "has-[[data-state=checked]]:border-border-brand",
          "has-[[data-state=checked]]:bg-bg-success-muted",
          "has-[[data-state=checked]]:shadow-sh-sm",
        ],
      },
      false: {
        root: "border-border-default bg-bg-surface hover:border-border-input hover:bg-bg-muted",
      },
    },
    /**
     * Dentro de um grupo `layout="list"` o item perde borda e cantos — quem os desenha é o
     * grupo, e o `divide-y` faz a separação. Sem isso, lista = cards empilhados com borda
     * dupla entre eles.
     */
    inList: {
      true: { root: "rounded-radius-none border-0" },
    },
    disabled: {
      // Não existe token bg/border de disabled no DS — o padrão é opacidade.
      true: { root: "opacity-50 cursor-not-allowed pointer-events-none" },
    },
  },
  compoundVariants: [
    // disabled SEMPRE por último (L-006), senão as classes de selected/hover o sobrescrevem
    {
      disabled: true,
      class: { root: "border-border-default bg-bg-surface hover:bg-bg-surface" },
    },
  ],
  defaultVariants: {
    size: "md",
    orientation: "left",
    highlight: true,
  },
});

/**
 * O container. Guarda a borda e o arredondamento quando `layout="list"`, porque nesse modo
 * os itens não têm os seus.
 */
export const cardOptionGroup = tv({
  base: "flex w-full flex-col",
  variants: {
    layout: {
      spaced: "gap-gp-lg",
      list: [
        "overflow-hidden border border-border-default",
        "divide-y divide-border-default",
      ],
    },
    size: {
      // O radius do grupo acompanha o do item, senão o canto da lista destoa do card solto.
      sm: "",
      md: "",
      lg: "",
    },
    disabled: {
      true: "opacity-50 pointer-events-none",
    },
  },
  compoundVariants: [
    { layout: "list", size: "sm", class: "rounded-radius-md" },
    { layout: "list", size: "md", class: "rounded-radius-lg" },
    { layout: "list", size: "lg", class: "rounded-radius-xl" },
  ],
  defaultVariants: {
    layout: "spaced",
    size: "md",
  },
});

export type CardOptionVariants = VariantProps<typeof cardOption>;
export type CardOptionGroupVariants = VariantProps<typeof cardOptionGroup>;
