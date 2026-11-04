import { useMemo } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FloatingPanel } from "../../FloatingPanel";
import { Button } from "../../Button/button";
// FormField do DS — wrapper padrão pra label+input. Sem ele, labels têm
// font-weight inconsistente (font-medium em vez de font-semibold) e cor
// errada no dark (sempre fg-default em vez de fg-muted). Pattern obrigatório
// pra qualquer form do projeto — ver lesson L-023.
import { FormField } from "../../FormField";
// Coupling-aceita: TableToolbar consome utilities do DataTable que são API
// pública (ColumnTypeRegistry, operator mapping, FilterModel types). O mesmo
// pattern já existe em FilterPopover que importa `ColumnOption`. Coupling
// reverso (DataTable → TableToolbar) continua proibido.
import { columnTypeRegistry } from "../../DataTable/column-types";
import type { ColumnOption, ColumnTypeDefinition } from "../../DataTable/column-types";
import type {
  FilterItem,
  FilterModel,
  FilterOperator,
} from "../../DataTable/data-table.types";
import {
  genFilterId,
  filterValueIsEmpty as isEmpty,
  defaultOperatorForFilterType,
  MULTI_VALUE_OPERATORS,
  NO_VALUE_OPERATORS,
} from "../../DataTable/utils/filter-ops";
import type { FilterPopoverColumn } from "../popovers/filter-popover";

/**
 * SimpleFilterDrawer — alternativa simplificada ao query builder do FilterPopover.
 *
 * Renderiza uma lista vertical com TODOS os campos filtráveis das colunas
 * (cada linha: label da coluna + widget de filtro do column-type). Sem
 * "Adicionar condição" — todos os campos estão sempre visíveis.
 *
 * Aplicação LIVE — não tem botão "Aplicar". Cada mudança no widget atualiza
 * `filterModel` na hora (mesmo flow do filter shortcut do header). User vê
 * a tabela filtrar enquanto edita.
 *
 * Comportamento:
 *   - Cada coluna filtrável vira 1 linha (escondida se field listado em hiddenFields)
 *   - O drawer não OFERECE escolha de operador (pra isso existe o query builder via
 *     chevron), mas RESPEITA o que já está no modelo: field com filtro vigente é
 *     desenhado e reescrito com o operador dele; field sem filtro nasce com o default
 *     do tipo (multiSelect → isAnyOf, text → contains, etc). Ver `operadorDoField`
 *   - Footer: "Limpar todos" remove todos items do filterModel
 *   - Drawer é non-modal — coexiste com tabela atrás
 */

export type ToolbarSimpleFilterDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Colunas filtráveis — vem do filterPopoverColumns do adapter. */
  columns: FilterPopoverColumn[];

  /** FilterModel atual + setter. */
  filterModel: FilterModel;
  onFilterModelChange: (model: FilterModel) => void;

  /**
   * Lista de field names que NÃO devem aparecer no drawer (mesmo sendo
   * filtráveis). Útil pra ocultar filtros que só fazem sentido no advanced
   * (ex: filtros internos). Default: array vazio (mostra todos).
   */
  hiddenFields?: string[];

  /** Override do título do drawer. Default: "Filtros". */
  title?: string;

  /** Override da descrição do drawer. Default: contagem de filtros ativos. */
  description?: string;

  /**
   * Tamanho do drawer. Default: "md" (400px). Use "lg" (560px) se há muitos
   * campos com widgets largos (dates, multi-select com muitas options).
   */
  size?: "sm" | "md" | "lg" | "xl";
};

/**
 * Operador que o drawer usa pra um field: o que JÁ ESTÁ no modelo quando há filtro,
 * o default do tipo quando o field ainda não tem nenhum.
 *
 * Até 2026-11-03 os dois lados do drawer (render e escrita) derivavam o operador do
 * TIPO da coluna e ignoravam `items[0].operator`. Um filtro que chegou em `isNoneOf`,
 * `notContains` ou `between` — de preset, de visão salva ou do builder avançado — era
 * DESENHADO como se fosse o default, e mexer no valor REESCREVIA o operador pro
 * default, em silêncio. Preservar é o default novo; criar segue igual.
 *
 * ⚠️ Uma guarda, com motivo medido: **o tipo tem que DECLARAR o operador**. A lista
 * `def.operators` é a mesma que o builder avançado oferece e a única que o
 * `renderFilterInput` daquele tipo tem branch pra tratar. Um `between` guardado num
 * campo `text` (modelo escrito à mão, `filterType` trocado depois, ou typo que faz o
 * registry cair no `text` por fallback) não tem widget que o edite — e escrevê-lo de
 * volta produz um item que **aprova todas as linhas**: o `matchesFilter` do tipo
 * devolve `null`, o processador NÃO descarta o item, cai no fallback de string e,
 * sem `case` pro operador, no `default: return true` (`use-data-table-processor.ts`).
 * O chip continua na tela anunciando um filtro que não filtra nada. Nesse caso o
 * default do tipo volta a mandar, que é exatamente o comportamento anterior.
 *
 * O nascimento usa o default do REGISTRY e nada além dele. Até 2026-11-03 havia aqui
 * um `promoteOperatorForFilterType(defaultOperatorForFilterType(...))`, herdado do
 * escritor pré-correção, cujo comentário prometia "multiSelect ⇒ sempre
 * isAnyOf/isNoneOf". A chamada era **inerte e não podia deixar de ser**: ela só age
 * sobre `equals`/`neq`, e o argumento que recebia era o próprio default do registry —
 * medido nos 16 tipos registrados, `MUDOU=false` em 16/16. Removida (L-061: no-op não
 * se documenta, se tira). Pior que morta, ela era um override latente do contrato
 * declarado: um consumidor que re-registre `multiSelect` com outro `operators[0]`
 * teria a escolha dele sobrescrita, contra o que o `defaultOperatorForFilterType`
 * promete ("um column-type novo já traz seu default correto"). Quem garante o
 * `isAnyOf` do `multiSelect` é o `operators[0]` dele — e isso agora tem teste.
 *
 * A promoção segue existindo e valendo onde ela de fato age: nos adapters e no
 * controller, onde o operador vem de um preset `{field, value}` como `equals`.
 */
function operadorDoField(
  items: FilterItem[],
  filterType: string | undefined,
  def: ColumnTypeDefinition,
): FilterOperator {
  const vigente = items[0]?.operator;
  if (vigente && def.operators?.some((o) => o.id === vigente)) return vigente;
  return defaultOperatorForFilterType(filterType);
}

/**
 * O drawer agrega TODOS os items do field num array único (e espalha de volta 1 item
 * por valor) — mas só quando o widget do tipo sabe desenhar uma lista.
 *
 * `def.operators[0]` é a FORMA pra qual o `renderFilterInput` daquele tipo foi escrito:
 * quando o default do tipo já é multi, o widget é list-shaped (`multiSelect`, `tags`).
 * `badge` e `user` declaram `isAnyOf` pro builder avançado e renderizam um `<Select>`
 * ÚNICO — é a mesma dupla que o JSDoc de `ColumnTypeDefinition.ownsMulti` nomeia.
 * Entregar o array a eles mostraria o placeholder num campo que TEM valor.
 *
 * ⚠️ A guarda é só sobre a FORMA do valor. O operador segue preservado nos dois casos:
 * um tipo de valor único em `isAnyOf` recebe o escalar, e a escrita devolve `isAnyOf`
 * com 1 item — que é um grupo multi válido de um valor só. Tipo registrado pelo
 * consumidor que queira a lista no drawer precisa declarar um operador multi em
 * `operators[0]`.
 */
function agregaComoLista(
  operator: FilterOperator,
  def: ColumnTypeDefinition,
): boolean {
  if (!MULTI_VALUE_OPERATORS.has(operator)) return false;
  return MULTI_VALUE_OPERATORS.has(def.operators?.[0]?.id as FilterOperator);
}

/**
 * Este operador deixa a linha SEM nada pra editar?
 *
 * Duas fontes, nesta ordem:
 *
 * 1. **`NO_VALUE_OPERATORS`** — `isEmpty`/`isNotEmpty`, o par que `text`, `select` e
 *    `multiSelect` já tratam como sem valor dentro do próprio `renderFilterInput`.
 *    É o fallback dos built-in: nenhum deles declara nada, e nada muda pra eles.
 * 2. **`noValue` DECLARADO no operador do tipo** — ponto de extensão do consumidor.
 *
 * ⚠️ A fonte 2 existia no tipo (`ColumnTypeOperator.noValue`, exportado em
 * `column-types/index.ts` e `DataTable/index.ts`) e era **inerte** até 2026-11-03:
 * nenhum tipo declarava e NADA lia. Um consumidor punha `noValue: true` e não
 * acontecia nada — sem erro, sem aviso. É a L-061 ("no-op não é desligado, está
 * ARMADO"). Ligar foi escolhido em vez de remover **porque o campo é API pública**:
 * remover quebraria a compilação de quem já declarou, ligar entrega o que o nome
 * sempre prometeu. Adição opt-in pura — os 16 built-in continuam byte-idênticos.
 */
function semValorPraEditar(
  operator: FilterOperator,
  def: ColumnTypeDefinition,
): boolean {
  if (NO_VALUE_OPERATORS.has(operator)) return true;
  return def.operators?.some((o) => o.id === operator && o.noValue === true) === true;
}

export function ToolbarSimpleFilterDrawer({
  open,
  onOpenChange,
  columns,
  filterModel,
  onFilterModelChange,
  hiddenFields,
  title = "Filtros",
  description,
  size = "md",
}: ToolbarSimpleFilterDrawerProps) {
  const hiddenSet = useMemo(
    () => new Set(hiddenFields ?? []),
    [hiddenFields],
  );

  /** Colunas que aparecem no drawer (não escondidas). */
  const visibleColumns = useMemo(
    () => columns.filter(c => !hiddenSet.has(c.key)),
    [columns, hiddenSet],
  );

  /** Map field → items do filterModel pra esse field (pode ser N pra multi). */
  const itemsByField = useMemo(() => {
    const m = new Map<string, FilterItem[]>();
    for (const item of filterModel.items) {
      if (!m.has(item.field)) m.set(item.field, []);
      m.get(item.field)!.push(item);
    }
    return m;
  }, [filterModel]);

  /** Contagem de filtros ativos (com valor) pra header. */
  const activeCount = useMemo(
    () => filterModel.items.filter(i => !isEmpty(i.value)).length,
    [filterModel],
  );

  /** Atualiza valor de um field — substitui items existentes pelo novo array
   *  de items (1 por valor pra multi; 1 single pros demais). Mantém posição
   *  original dos items NO array preservando ordem de outros fields.
   *
   *  `effectiveOperator` chega RESOLVIDO do render (`operadorDoField`) — o vigente
   *  no modelo, ou o default do tipo pro field que ainda não tem filtro. Derivá-lo
   *  aqui de novo era metade do defeito: a edição do valor reescrevia o operador. */
  const updateFieldValue = (
    field: string,
    newValue: unknown,
    effectiveOperator: FilterOperator,
  ) => {
    // Constrói os novos items pro field
    const newItems: FilterItem[] = [];
    if (effectiveOperator === "isAnyOf" || effectiveOperator === "isNoneOf") {
      const arr = Array.isArray(newValue) ? newValue : (newValue != null && newValue !== "" ? [newValue] : []);
      for (const v of arr) {
        if (v == null || v === "") continue;
        newItems.push({ id: genFilterId(), field, operator: effectiveOperator, value: v as FilterItem["value"] });
      }
    } else if (effectiveOperator === "between") {
      // Date/number range — value é tupla
      if (!isEmpty(newValue)) {
        newItems.push({ id: genFilterId(), field, operator: effectiveOperator, value: newValue as FilterItem["value"] });
      }
    } else {
      // Single value (text/number/select)
      if (!isEmpty(newValue)) {
        newItems.push({ id: genFilterId(), field, operator: effectiveOperator, value: newValue as FilterItem["value"] });
      }
    }

    // Substitui items do field NA POSIÇÃO ORIGINAL — preserva ordem de outros fields
    const reconstructed: FilterItem[] = [];
    let inserted = false;
    for (const item of filterModel.items) {
      if (item.field === field) {
        if (!inserted) {
          reconstructed.push(...newItems);
          inserted = true;
        }
        // skip — substituído pelo spread acima
      } else {
        reconstructed.push(item);
      }
    }
    if (!inserted) reconstructed.push(...newItems);

    onFilterModelChange({ ...filterModel, items: reconstructed });
  };

  /** Remove TODOS items do filterModel. */
  const clearAll = () => {
    onFilterModelChange({ ...filterModel, items: [] });
  };

  return (
    <FloatingPanel
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      size={size}
      // O corpo já aplica px-[18px] py-[14px] próprio abaixo.
      bodyPadded={false}
      title={title}
      description={description ?? `${activeCount} ${activeCount === 1 ? "filtro ativo" : "filtros ativos"}`}
      titleIcon={SlidersHorizontal}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            color="secondary"
            size="sm"
            onClick={clearAll}
            disabled={activeCount === 0}
            iconLeft={<X />}
          >
            Limpar todos
          </Button>
          <Button
            variant="filled"
            color="primary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </div>
      }
    >
      {/* Padding interno alinhado com header/footer do FloatingPanel (px-[18px] py-[14px]).
       *  O body do FloatingPanel é genérico (sem padding default) — cada consumer
       *  define o seu. Aqui usamos os mesmos valores do header/footer pra ter
       *  alinhamento visual consistente quando user lê o drawer de cima até a base.
       *
       *  Gap entre campos: form-gap (20px) — token DS dedicado pra forms com
       *  FormField units empilhados (L-024). Não usar gap-gp-* semântico aqui. */}
      <div className="flex flex-col gap-form-gap px-[18px] py-[14px]">
        {visibleColumns.length === 0 && (
          <p className="text-body-sm text-fg-muted text-center py-pad-2xl">
            Nenhuma coluna filtrável disponível.
          </p>
        )}

        {visibleColumns.map((col) => {
          const items = itemsByField.get(col.key) ?? [];
          const typeId = col.filterType ?? col.type ?? "text";
          const def = columnTypeRegistry.get(typeId);
          const operator = operadorDoField(items, col.filterType, def);

          // currentValue depende do tipo:
          //  - multi: agregado dos items[].value (array)
          //  - tuple (between): primeiro item.value (já é tupla)
          //  - single: primeiro item.value
          const isMultiOp = agregaComoLista(operator, def);
          const isTupleOp = operator === "between";
          const currentValue = isMultiOp
            ? items
                .flatMap(it => Array.isArray(it.value) ? (it.value as unknown[]) : (it.value != null ? [it.value] : []))
                .filter(v => v != null && v !== "")
            : isTupleOp
              ? items[0]?.value
              : items[0]?.value;

          const filterOp = operator;
          const options = (col.options ?? []) as ColumnOption[];
          const rotulo =
            typeof col.label === "string" ? col.label : String(col.label);

          /**
           * A linha não tem o que editar — e por isso precisa de saída PRÓPRIA.
           *
           * `isEmpty`/`isNotEmpty` só chegam aqui pela preservação (nenhum tipo os tem
           * como default), e o `renderFilterInput` de `text`/`select`/`multiSelect`
           * devolve "(sem valor)", sem `onChange`. Sem este botão a única saída seria o
           * "Limpar todos" do rodapé, que apaga o filtro de TODOS os campos — trocar um
           * defeito silencioso (digitar rebaixava o operador) por um beco sem saída
           * nuclear é exatamente o que a L-070 proíbe.
           *
           * Nasce SÓ nesta linha: nenhuma outra muda de aparência ou comportamento.
           * O sinal é o OPERADOR, não o widget — não dá pra perguntar ao
           * `renderFilterInput` se ele trouxe `onChange`. Tipo registrado DECLARA o seu
           * com `noValue` no operador (ver `semValorPraEditar`).
           */
          const linhaSemSaida =
            semValorPraEditar(operator, def) && items.length > 0;

          // Usa <FormField> do DS — garante label com font-semibold + cor
          // dark-mode-aware (fg-default light / fg-muted dark). Children
          // render-prop recebe id pra linkar htmlFor; o widget vem do
          // columnTypeRegistry e não consome o id automaticamente, mas o
          // padrão visual (label + spacing + dark mode) fica correto.
          return (
            <FormField key={col.key} label={rotulo}>
              {() => (
                <div className="w-full flex items-center gap-gp-md">
                  <div className="min-w-0 flex-1">
                    {def.renderFilterInput({
                      value: currentValue as never,
                      onChange: (v: unknown) => updateFieldValue(col.key, v, operator),
                      operator: filterOp as never,
                      options,
                      loadOptions: col.loadOptions,
                      resolveValueLabel: col.resolveValueLabel,
                      // Unidade (`prefix`/`suffix`) também no campo do funil — item 9a.
                      typeOptions: col.typeOptions,
                    })}
                  </div>
                  {linhaSemSaida && (
                    /* Valor vazio pelo escritor ÚNICO: `filterValueIsEmpty("")` zera os
                       items deste field e a reconstrução preserva a ordem dos outros —
                       a mesma garantia que os testes de edição já travam. */
                    <Button
                      variant="ghost"
                      color="secondary"
                      size="sm"
                      iconLeft={<X />}
                      aria-label={`Limpar filtro de ${rotulo}`}
                      onClick={() => updateFieldValue(col.key, "", operator)}
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              )}
            </FormField>
          );
        })}
      </div>
    </FloatingPanel>
  );
}
