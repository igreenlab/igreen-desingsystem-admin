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
    // Piso de 20px nos dois eixos: ícone menor que isso não se lê ao lado de um texto de
    // 13px, e o `place-items-center` mantém centrado quando o conteúdo é menor que a caixa.
    iconWrap: "grid shrink-0 place-items-center min-h-comp-2xs min-w-comp-2xs",
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
    /**
     * Onde o CONTROLE fica — e só ele.
     *
     * ⚠️ Era `flex-row-reverse` no root, que invertia TODOS os filhos e levava o ícone pra
     * direita junto. O ícone tem de ficar sempre à esquerda: ele identifica a opção (junto do
     * texto), enquanto o controle é a ação. `order-last` move apenas o controle, mantendo
     * ícone → texto na ordem de leitura em qualquer orientação.
     */
    orientation: {
      left: {},
      right: { control: "order-last" },
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
     *
     * ⚠️ Quem decide se esta variante entra é o `card-option.tsx`, e o default DEPENDE DO
     * CONTEXTO: em card solto vem do `type`; **em lista vem desligado**, porque a única borda
     * do item ali é a de baixo — a divisória — e pintá-la colore a linha que separa o
     * selecionado do vizinho, não o contorno dele.
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
     * Dentro de um grupo `layout="list"`: sem cantos e sem borda em volta — quem desenha o
     * contorno é o grupo. O que sobra é a **linha divisória**, feita pela borda de baixo de
     * cada item, com o último suprimido.
     *
     * ⚠️ A 1ª versão era `border-0` no item + `divide-y` no grupo, e **não desenhava divisória
     * nenhuma**: o `divide-y` funciona pondo `border-top` nos filhos a partir do 2º, e o
     * `border-0` do item zerava justamente essa borda. Medido no browser — `border-top: 0px`
     * nos três itens. Desenhar a borda no próprio item não depende dessa ordem de cascata.
     */
    inList: {
      true: {
        root: "rounded-radius-none border-x-0 border-t-0 border-b last:border-b-0",
      },
    },
    disabled: {
      // Não existe token bg/border de disabled no DS — o padrão é opacidade.
      true: { root: "opacity-50 cursor-not-allowed pointer-events-none" },
    },
  },
  compoundVariants: [
    /**
     * Em LISTA com destaque ligado, a sombra sai.
     *
     * `shadow-sh-sm` num card solto o levanta da página; numa linha de lista ele vaza por
     * cima da linha vizinha e some atrás do `overflow-hidden` do grupo — sombra dentro de
     * caixa cortada é ruído, não elevação. Fundo e cor de borda continuam (é justamente o que
     * o `highlightSelected` promete); só a elevação não faz sentido aqui.
     */
    {
      inList: true,
      highlight: true,
      class: { root: "has-[[data-state=checked]]:shadow-sh-none" },
    },
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
      /**
       * O grupo desenha só o contorno; a divisória entre linhas é a borda de baixo de cada
       * item (ver `inList`). Não usa `divide-y`: ele põe `border-top` nos filhos e brigava
       * com o reset de borda do item.
       *
       * Vale pros TRÊS tipos, não só switch — radio em lista é um seletor de linha única, e
       * checkbox em lista é uma lista de permissões.
       *
       * ⚠️ O `gap-0` é obrigatório e não é redundante: com `type="radio"` o grupo É o
       * `RadioGroup` do DS, que traz `grid w-full gap-gp-xl` no base. Sem declarar gap aqui,
       * o `gap-gp-xl` (12px) sobrevivia e a lista de radio saía com 12px entre as linhas —
       * medido. (A 1ª tentativa foi um `grid-none` que eu inventei; classe inexistente é
       * inerte e não zera nada.)
       */
      list: "gap-0 overflow-hidden border border-border-default",
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
