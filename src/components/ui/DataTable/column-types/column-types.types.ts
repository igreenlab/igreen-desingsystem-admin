import type { ReactNode } from "react";
import type { FilterOperator, FilterValue } from "../data-table.types";

/** ID conhecido de tipo de coluna. Strings livres tambem aceitas (Registry fallback "text"). */
export type ColumnTypeId =
  | "text"
  | "number"
  | "date"
  | "select"
  | "multiSelect"
  | "boolean"
  | (string & {});

/** Opcao de valor pra tipos select/multiSelect. */
export type ColumnOption = {
  label: string;
  value: string | number;
  color?: string;
  /** FIXA no topo da lista do multiSelect — fora da busca, da rolagem e do
   *  "Selecionar todos" (eixos como "Sem veículo" / "Sem arrendamento"). */
  pinned?: boolean;
};

/** Carregador assíncrono de opções (filtros com milhares de valores — item 6
 *  Sólis). `page` começa em 1; `hasMore` liga o "Carregar mais". */
export type FilterLoadOptions = (
  search: string,
  page: number,
) => Promise<{ options: ColumnOption[]; hasMore: boolean }>;

/** Props que o renderer de filtro avancado (modal) recebe. */
export type FilterInputProps = {
  /** Valor atual no input. */
  value: FilterValue;
  /** Disparado quando user muda. */
  onChange: (value: FilterValue) => void;
  /** Operador atual selecionado (pode afetar UI). */
  operator: FilterOperator;
  /** Opcoes da coluna (select/multiSelect). */
  options?: ColumnOption[];
  /** Placeholder do input. */
  placeholder?: string;
  /** Modo assíncrono (mesmo contrato do chip) — o widget do builder avançado
   *  e do drawer funil busca no servidor igual ao fast filter. */
  loadOptions?: FilterLoadOptions;
  /** Rótulo de valor marcado fora da página carregada (par do loadOptions). */
  resolveValueLabel?: (value: string | number) => ReactNode;
  /**
   * `column.typeOptions` da coluna sendo filtrada — a MESMA bag que o
   * `renderCell` já recebia. É o que leva `prefix`/`suffix` (item 9a) pro campo:
   * sem ela a unidade só existiria na célula, e quem está filtrando não vê a
   * célula — vê o campo e o chip.
   *
   * Leva também `countLabel` (item 27), o rótulo de "N selecionados" — ver
   * `resolveCountLabel` em `_shared`.
   */
  typeOptions?: Record<string, unknown>;
};

/** Props que o chip rapido (fast filter popover) recebe. */
export type FastFilterInputProps = {
  /** Valor atual — single ou array dependendo do tipo. */
  value: FilterValue;
  /** Disparado quando muda. */
  onChange: (value: FilterValue) => void;
  /** Opcoes auto-extraidas ou estaticas. */
  options?: ColumnOption[];
  /** Render custom de opcao (pra colorir status etc). */
  renderOption?: (option: ColumnOption) => ReactNode;
  /** Fechar popover (usado em single-select onde click fecha automatico). */
  onClose?: () => void;
  /** Operador atual do grupo do chip (item 8 Sólis). */
  operator?: FilterOperator;
  /** Troca o operador do grupo SEM fechar o popover — habilita o alternador
   *  "Incluindo/Excluindo" no rodapé do multiSelect. */
  onOperatorChange?: (operator: FilterOperator) => void;
  /** Modo assíncrono (item 6 Sólis): quando presente, a lista busca no
   *  servidor (debounce + "Carregar mais") em vez de usar `options`. */
  loadOptions?: FilterLoadOptions;
  /** Rótulo de um valor JÁ MARCADO que não está na página carregada. */
  resolveValueLabel?: (value: string | number) => ReactNode;
  /** `column.typeOptions` da coluna — ver `FilterInputProps.typeOptions`. */
  typeOptions?: Record<string, unknown>;
};

/** Operador disponivel pra um tipo. */
export type ColumnTypeOperator = {
  id: FilterOperator;
  label: string;
  /**
   * O operador se basta SEM valor (ex: `isEmpty`) — o `renderFilterInput` deste tipo
   * não tem o que editar quando ele está ativo.
   *
   * Quem lê: o `ToolbarSimpleFilterDrawer` (funil), pra dar à linha uma **saída
   * própria** — um "Limpar" que remove o filtro daquele campo. Sem isso a única saída
   * seria o "Limpar todos" do rodapé, que apaga o filtro de todos os campos (L-070).
   *
   * `isEmpty`/`isNotEmpty` já valem sem declaração (`NO_VALUE_OPERATORS` em
   * `utils/filter-ops`): este campo é pro tipo REGISTRADO que tem um operador
   * sem valor próprio.
   *
   * ⚠️ Até 2026-11-03 este campo era **inerte** — exportado na API pública, declarado
   * por nenhum dos 16 tipos e lido por nada. Foi ligado, não removido, justamente por
   * ser público (L-061). Nenhum built-in o declara, então o comportamento deles não
   * mudou.
   */
  noValue?: boolean;
};

/** Props que `renderCell` recebe pra render default. */
export type CellRenderProps = {
  /** Valor extraído via valueGetter ou dot-path. */
  value: unknown;
  /** Row completa (qualquer T). */
  row: unknown;
  /** Opções da coluna (filterOptions) — útil pra resolver labels em select/badge/status. */
  options?: ColumnOption[];
  /** ColumnDef parcial — campos auxiliares como valueFormatter, etc. */
  column?: {
    field?: string;
    headerName?: string;
    valueFormatter?: (v: unknown) => string;
    typeOptions?: Record<string, unknown>;
  };
};

/** Props que `renderEdit` recebe pra editor inline. */
export type CellEditRenderProps = {
  value: unknown;
  row: unknown;
  onChange: (next: unknown) => void;
  onCommit: () => void;
  onCancel: () => void;
  options?: ColumnOption[];
};

/** Alinhamento default sugerido pelo tipo. */
export type ColumnTypeAlign = "left" | "center" | "right";

/** Definicao completa de um tipo de coluna. */
export type ColumnTypeDefinition = {
  /** ID unico do tipo. */
  type: ColumnTypeId;
  /** Operadores suportados — ordem importa (primeiro = default). */
  operators: ColumnTypeOperator[];
  /**
   * O `renderFastFilterInput` deste tipo sabe editar uma LISTA de valores?
   *
   * Quando `true`, o chip multi (operador `isAnyOf`/`isNoneOf`, ou 2+ valores) usa o
   * widget DESTE tipo em vez de ser promovido ao `multiSelect` built-in. É o que permite
   * um tipo registrado pelo consumidor substituir o popover multi inteiro (colar lista,
   * clique-substitui…) sem PR no DS.
   *
   * ⚠️ Declarar `isAnyOf` nos `operators` **não** basta e nunca bastou: `badge` e `user`
   * declaram o operador (pra funcionar no builder avançado) e o widget de chip deles é um
   * `<Select>` ÚNICO, que chama `onChange` com uma string. Inferir posse a partir da lista
   * de operadores entregava escolha única sobre campo de array nesses dois — por isso a
   * posse é declarada, não deduzida.
   *
   * Default `undefined` (= `false`): o tipo cede o chip multi ao `multiSelect`.
   */
  ownsMulti?: boolean;
  /** Renderiza input no modal Filtros (advanced builder). */
  renderFilterInput: (props: FilterInputProps) => ReactNode;
  /** Renderiza input no popover do chip rapido (fast filter). */
  renderFastFilterInput: (props: FastFilterInputProps) => ReactNode;
  /**
   * Match runtime: dado o valor da celula + filter item, retorna se row passa.
   * Retornar `null` = "operador nao reconhecido, ignore esse filtro".
   */
  matchesFilter: (cellValue: unknown, filterValue: FilterValue, operator: FilterOperator) => boolean | null;
  /**
   * Render do chip de filtro (label visual). Recebe valor + options + columnLabel.
   * Default: "{columnLabel}: {value}". MultiSelect mostra "{N} selecionados" se > 2.
   *
   * O 3º argumento é o `column.typeOptions` da coluna (item 9a): é por ele que a
   * unidade chega ao chip — "100 – 500 kWh" em vez de "100 – 500", que foi o pedido
   * original. Opcional, e tipo que o ignora segue idêntico.
   *
   * O mesmo 3º argumento leva `countLabel` (item 27), o rótulo da CONTAGEM — use
   * `resolveCountLabel(n, typeOptions)` do `_shared` em vez de escrever
   * "N selecionados" na mão, senão o tipo fica com gênero fixo. ⚠️ No chip multi quem
   * colapsa a contagem costuma ser o `use-filter-popover-adapter` (N items de 1 valor);
   * o tipo só colapsa quando um item sozinho traz um array de 3+.
   */
  renderChipValue?: (
    value: FilterValue,
    options?: ColumnOption[],
    typeOptions?: Record<string, unknown>,
  ) => ReactNode;

  /* ── Fase G.2 — slots de cell + edit + defaults ─────────────────── */

  /** Render default da célula. Usado quando consumer não passa `column.render`.
   *  Fallback chain: column.render > renderCell > valueFormatter > raw value. */
  renderCell?: (props: CellRenderProps) => ReactNode;
  /** Editor inline default. Usado quando consumer não passa `column.renderEdit`
   *  E `editable: true`. Fallback chain: column.renderEdit > renderEdit do tipo > InputEditor por editType. */
  renderEdit?: (props: CellEditRenderProps) => ReactNode;
  /** Formatter default — string output pra accessibility, tooltip, export, etc.
   *  Aplicado quando consumer não passa `column.valueFormatter`. */
  formatValue?: (value: unknown) => string;
  /** Alinhamento default. Consumer pode override via `column.align`. */
  defaultAlign?: ColumnTypeAlign;
  /** Ellipsis (truncate com `...`) default. Consumer pode override. */
  defaultEllipsis?: boolean;
  /** Largura default em px. Consumer pode override via `column.width`. */
  defaultWidth?: number;
  /** Sortable default — alguns tipos (badge custom, actions) podem ser false. */
  defaultSortable?: boolean;
  /** Ícone default no header (lucide component). Consumer pode override via
   *  `column.icon`. Indicador visual rápido do tipo da coluna. */
  defaultIcon?: React.ComponentType<{
    className?: string;
    size?: number;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
};
