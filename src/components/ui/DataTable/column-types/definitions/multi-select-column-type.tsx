import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/shadcn/checkbox";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/ui/Button/button";
// Import DIRETO do part (não do barrel do TableToolbar): o barrel puxa o
// simple-filter-drawer, que importa este column-types/index de volta —
// ciclo que estourava TDZ ("Cannot access MultiSelectColumnType before
// initialization") no load do registry.
import { ToolbarSegmented } from "@/components/ui/TableToolbar/parts/toolbar-segmented";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { FILTER_FIELD_CLASS } from "../_filter-field";
import type {
  ColumnTypeDefinition,
  FastFilterInputProps,
  FilterInputProps,
} from "../column-types.types";

/**
 * Render do dropdown multiselect — lista checkboxes com toggle.
 * Usado em ambos os contextos (modal advanced + fast filter popover).
 */
/** Normaliza value pra array — aceita string/number escalar OU array.
 *  Cenário: presets/saved views podem hidratar o filterModel com `value: "active"`
 *  (escalar) + `operator: "equals"`, mas o widget renderiza igual ao multiSelect
 *  (filterType da column é "multiSelect"). Mesmo critério usado em
 *  `renderChipValue` e `matchesFilter` mais abaixo. */
const toArray = (value: unknown): Array<string | number> => {
  if (Array.isArray(value)) return value as Array<string | number>;
  if (value == null || value === "") return [];
  return [value as string | number];
};

/** A partir de quantas opções a lista ganha campo de busca. Abaixo disso a
 *  busca só adiciona altura (status com 3 valores não precisa filtrar). */
const BUSCA_A_PARTIR_DE = 10;

/** TETO da lista: a altura vem do CONTEÚDO e, passando de 240px, rola. Era um
 *  PISO (`flex-1 min-h-[96px]`), e por isso 1–2 opções — ou só o "Carregando…" —
 *  ganhavam 96px de altura com 30–60px de conteúdo: um vazio dentro do popover.
 *
 *  Sem `flex-1`: ele é `flex: 1 1 0%`, e com o piso removido uma base resolvida
 *  como 0 colapsaria a lista. A base default (`auto`) é sempre o conteúdo; o
 *  encolher (`flex-shrink: 1`) segue o mesmo, e é isso que deixa o ROOT (cujo
 *  max-h é o espaço reportado pelo Radix) espremer só a lista quando a viewport
 *  é baixa. */
const LISTA_MAX_H = "max-h-[240px]";

/** Piso de proteção pro monitor baixo: quando a viewport espreme o popover, só a
 *  lista encolhe, e sem piso ela poderia sumir. Liga a partir de 4 linhas.
 *
 *  Cada linha tem 32px (`py-pad-sm` ×2 + `text-body-md`), então: 2 linhas ≈ 66px
 *  (menos que o piso — um piso aí é vazio), 3 linhas ≈ 100px (JÁ passa de 96px) e
 *  4 linhas ≈ 134px. O limiar 4 é CONSERVADOR de propósito, com folga sobre as 3
 *  linhas: garante que o piso nunca é maior que o conteúdo quando liga. Mas **não
 *  protege** lista de 1–3 linhas em viewport baixa — com 3 o piso caberia sem criar
 *  vazio e mesmo assim não é aplicado. */
const LISTA_PISO = "min-h-[96px]";
const LISTA_PISO_A_PARTIR_DE = 4;

/** Largura mínima do root: 220px de sempre, ou a largura TRAVADA na abertura —
 *  o que for maior.
 *
 *  O popover do chip é dimensionado pelo conteúdo, então filtrar a lista (que
 *  estreita as linhas visíveis) encolhia o popover no meio da digitação. O trava
 *  grava a maior largura vista em `--ms-min-w` (ver o efeito no componente).
 *
 *  O `min(…, --radix-popover-content-available-width)` impede que o trava vire
 *  overflow se a viewport encolher depois (rotação do celular, janela
 *  redimensionada com o popover aberto): o espaço disponível manda sobre a largura
 *  travada. Os 100vw do fallback só valem fora de um Popover Radix. */
const ROOT_MIN_W =
  "min-w-[max(220px,min(var(--ms-min-w,0px),var(--radix-popover-content-available-width,100vw)))]";

const OPTION_ROW = cn(
  "flex items-center gap-gp-md w-full",
  "px-pad-md py-pad-sm rounded-radius-md",
  "text-body-md text-fg-default text-left cursor-pointer",
  "hover:bg-bg-muted focus-within:bg-bg-muted",
  "transition-colors duration-100",
);

function OptionRow({
  opt,
  checked,
  onToggle,
  renderOption,
}: {
  opt: { label: string; value: string | number; pinned?: boolean };
  checked: boolean;
  onToggle: (v: string | number) => void;
  renderOption?: (opt: { label: string; value: string | number }) => ReactNode;
}) {
  return (
    <label className={OPTION_ROW}>
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle(opt.value)}
        aria-label={opt.label}
        className="shrink-0"
      />
      <span className="flex-1 min-w-0 truncate">
        {renderOption ? renderOption(opt) : (opt.label as ReactNode)}
      </span>
    </label>
  );
}

/**
 * Widget multiSelect do chip — EXPORTADO como bloco componível: um tipo
 * custom do consumidor pode embrulhá-lo (widget padrão + ações próprias no
 * entorno) em vez de reconstruir busca/lista/seleção do zero. Declare
 * `ownsMulti: true` no tipo custom pra ser dono do chip multi (a promoção
 * interna não sequestra — ver data-table.tsx, customOwnsMulti). Com o flag o
 * `value` chega SEMPRE como array, mesmo com 1 valor.
 *
 * ⚠️ Declarar `isAnyOf`/`isNoneOf` nos operators NÃO dá posse — este comentário
 * afirmava isso, e é a dedução que o 2º review do PR #343 desmentiu (ver o JSDoc de
 * `ColumnTypeDefinition.ownsMulti`).
 */
export function MultiSelectDropdown({
  value,
  onChange,
  options = [],
  renderOption,
  operator,
  onOperatorChange,
  loadOptions,
  resolveValueLabel,
}: FastFilterInputProps) {
  const selected = toArray(value);
  const selectedSet = new Set(selected.map(String));
  const [busca, setBusca] = useState("");

  /* ── Largura travada: o popover não encolhe ao filtrar a lista ──
     Guarda a MAIOR largura vista em `--ms-min-w` (lida por ROOT_MIN_W). Imperativo
     de propósito: o callback do ResizeObserver roda depois do layout e ANTES do paint,
     então escrever o estilo ali evita o popover encolher visivelmente por um frame
     — um setState poderia só renderizar depois do paint. O root não tem `style` do React,
     então nada sobrescreve a variável. Só sobe: crescer de verdade (a 1ª página
     assíncrona chegou) acompanha, encolher nunca. Largura 0 (jsdom, display:none)
     não escreve nada, e o piso de 220px segue sozinho. */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    let travada = 0;
    const travar = () => {
      // offsetWidth, não getBoundingClientRect: o popover abre com zoom-in-95, e o
      // rect devolveria a largura JÁ escalada (95%), travando 5% a menos.
      const w = el.offsetWidth;
      if (w <= travada) return;
      travada = w;
      el.style.setProperty("--ms-min-w", `${w}px`);
    };
    travar();
    const ro = new ResizeObserver(travar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ── Modo assíncrono (item 6 Sólis): busca no servidor + paginação ── */
  const isAsync = !!loadOptions;
  const [asyncOpts, setAsyncOpts] = useState<
    Array<{ label: string; value: string | number }>
  >([]);
  const [asyncPage, setAsyncPage] = useState(1);
  const [asyncHasMore, setAsyncHasMore] = useState(false);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [asyncErro, setAsyncErro] = useState(false);
  const reqSeq = useRef(0);
  const fetchPage = (search: string, page: number) => {
    if (!loadOptions) return;
    const seq = ++reqSeq.current;
    setAsyncLoading(true);
    setAsyncErro(false);
    loadOptions(search, page)
      .then(({ options: batch, hasMore }) => {
        if (seq !== reqSeq.current) return; // resposta velha — descarta
        setAsyncOpts((prev) => (page === 1 ? batch : [...prev, ...batch]));
        setAsyncHasMore(hasMore);
        setAsyncPage(page);
      })
      // Filtro de servidor falha por rede no mundo real: sem o catch era
      // unhandled rejection + lista muda sem feedback (review 2026-10-22).
      .catch(() => {
        if (seq === reqSeq.current) setAsyncErro(true);
      })
      .finally(() => {
        if (seq === reqSeq.current) setAsyncLoading(false);
      });
  };
  // 1ª página no mount + debounce de 300ms na digitação.
  useEffect(() => {
    if (!isAsync) return;
    const t = setTimeout(() => fetchPage(busca, 1), busca ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, isAsync]);

  /* ── Ordenação estática: fixas (pinned) numa seção própria; no resto,
     MARCADOS primeiro — congelada no mount pra lista não pular a cada
     toggle (item 7 Sólis). ── */
  const [ordemInicial] = useState(() => {
    const score = (o: { value: string | number }) =>
      selectedSet.has(String(o.value)) ? 0 : 1;
    return [...options]
      .filter((o) => !o.pinned)
      .sort((a, b) => score(a) - score(b));
  });
  const pinnedOpts = options.filter((o) => o.pinned);

  const baseList = isAsync ? asyncOpts : ordemInicial;
  const visiveis =
    !isAsync && busca
      ? baseList.filter((o) =>
          o.label.toLowerCase().includes(busca.toLowerCase()),
        )
      : baseList;

  // Async: marcados ficam SEMPRE visíveis no topo, mesmo fora da página/busca
  // carregada — rótulo via resolveValueLabel (ou o value cru).
  const labelDe = (v: string | number): ReactNode => {
    const hit =
      asyncOpts.find((o) => String(o.value) === String(v)) ??
      options.find((o) => String(o.value) === String(v));
    return hit?.label ?? resolveValueLabel?.(v) ?? String(v);
  };
  const asyncSelecionados = isAsync ? selected : [];

  // Linhas que a lista realmente mostra (as fixas ficam fora dela). No async os
  // marcados vão pra seção do topo, então não contam de novo entre os visíveis.
  const linhasDaLista = isAsync
    ? asyncSelecionados.length +
      visiveis.filter((o) => !selectedSet.has(String(o.value))).length
    : visiveis.length;

  const toggle = (val: string | number) => {
    const set = new Set(selected.map(String));
    if (set.has(String(val))) set.delete(String(val));
    else set.add(String(val));
    onChange(Array.from(set));
  };
  // "Selecionar todos" é ADITIVO sobre os VISÍVEIS (fixas ficam de fora): com
  // busca ativa seleciona só o resultado filtrado, sem perder o resto.
  const selecionarVisiveis = () => {
    const set = new Set(selected.map(String));
    for (const o of visiveis) set.add(String(o.value));
    onChange(Array.from(set));
  };
  const todosVisiveisMarcados =
    visiveis.length > 0 &&
    visiveis.every((o) => selectedSet.has(String(o.value)));

  const mostraBusca = isAsync || options.length >= BUSCA_A_PARTIR_DE;
  const temMulti = operator === "isAnyOf" || operator === "isNoneOf";

  // Linha de ações: só quando há o que selecionar OU o que limpar. O "Selecionar
  // todos" já sumia sem opção visível; o "Limpar" ficava sozinho (desabilitado) —
  // o DS discordando de si mesmo. Sem NADA a selecionar nem a limpar a linha some
  // inteira, não só os links: vazia, o `gap` do container deixaria um espaço fantasma.
  // Marcado + nenhuma opção visível (busca sem acerto, 1ª página ainda não chegou)
  // MANTÉM a linha: o "Limpar" é então a única saída da seleção.
  const temAcoes =
    (options.length > 1 || isAsync) && (visiveis.length > 0 || selected.length > 0);

  // Link de ação compacto — mesmo idioma do "Limpar todos" dos chips
  // (toolbarAppliedClearLink): texto brand pequeno com underline no hover.
  const ACTION_LINK = cn(
    "text-body-xs font-medium text-fg-brand cursor-pointer outline-none",
    "bg-transparent border-0 p-0",
    "hover:underline underline-offset-2 focus-visible:underline",
    "disabled:opacity-50 disabled:pointer-events-none",
  );

  return (
    <div
      ref={rootRef}
      className={`flex flex-col gap-gp-md p-pad-md ${ROOT_MIN_W} max-h-[calc(var(--radix-popover-content-available-height,480px)-8px)]`}
    >
      {/* Incluindo/Excluindo no TOPO, como segmented do DS (mesmo padrão do
          density/view-mode toggle) — não dois botões soltos no rodapé. */}
      {onOperatorChange && temMulti && (
        <ToolbarSegmented
          fluid
          ariaLabel="Modo do filtro"
          value={operator}
          onValueChange={(v) => v !== operator && onOperatorChange(v as "isAnyOf" | "isNoneOf")}
          items={[
            { value: "isAnyOf", label: "Incluindo os selecionados", children: "Incluindo" },
            {
              value: "isNoneOf",
              label: "Excluindo os selecionados",
              children: (
                <span className={operator === "isNoneOf" ? "text-fg-danger" : undefined}>
                  Excluindo
                </span>
              ),
            },
          ]}
        />
      )}
      {mostraBusca && (
        <Input
          autoFocus
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar..."
          aria-label="Buscar opção"
        />
      )}
      {/* Ações JUNTO da busca (não no rodapé): Selecionar à esquerda, Limpar à
          DIREITA. Sem contador: com filtro pré-carregado o número confundia
          mais do que ajudava (decisão do mantenedor, 2026-10-22). */}
      {temAcoes ? (
        <div className="flex items-center justify-between gap-gp-lg">
          {visiveis.length > 0 ? (
            <button
              type="button"
              onClick={selecionarVisiveis}
              disabled={todosVisiveisMarcados}
              className={ACTION_LINK}
            >
              {busca ? "Selecionar visíveis" : "Selecionar todos"}
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={selected.length === 0}
            className={ACTION_LINK}
          >
            Limpar
          </button>
        </div>
      ) : null}
      {/* Opções FIXAS: fora da busca, da rolagem e do "Selecionar todos". */}
      {pinnedOpts.length > 0 && (
        <div className="flex flex-col gap-gp-2xs border-b border-border-subtle pb-pad-2xs">
          {pinnedOpts.map((opt) => (
            <OptionRow
              key={String(opt.value)}
              opt={opt}
              checked={selectedSet.has(String(opt.value))}
              onToggle={toggle}
              renderOption={renderOption}
            />
          ))}
        </div>
      )}
      <div
        className={cn(
          "flex flex-col gap-gp-2xs overflow-y-auto scrollbar-thin pr-pad-2xs",
          LISTA_MAX_H,
          linhasDaLista >= LISTA_PISO_A_PARTIR_DE && LISTA_PISO,
        )}
      >
        {/* Async: os já marcados primeiro, sempre visíveis (fora da página carregada). */}
        {asyncSelecionados.length > 0 && (
          <div className="flex flex-col gap-gp-2xs border-b border-border-subtle pb-pad-2xs">
            {asyncSelecionados.map((v) => {
              const rotulo = labelDe(v);
              return (
                <label key={String(v)} className={OPTION_ROW}>
                  <Checkbox
                    checked
                    onCheckedChange={() => toggle(v)}
                    // a11y: o rótulo legível, não o id cru (review 2026-10-22)
                    aria-label={typeof rotulo === "string" ? rotulo : String(v)}
                    className="shrink-0"
                  />
                  <span className="flex-1 min-w-0 truncate">{rotulo}</span>
                </label>
              );
            })}
          </div>
        )}
        {!isAsync && options.length === 0 && (
          <p className="text-body-xs font-normal text-fg-muted px-pad-md py-pad-sm">
            Sem opções disponíveis
          </p>
        )}
        {(isAsync ? !asyncLoading && visiveis.length === 0 : options.length > 0 && visiveis.length === 0) && (
          <p className="text-body-xs font-normal text-fg-muted px-pad-md py-pad-sm">
            Nenhuma opção encontrada
          </p>
        )}
        {visiveis.map((opt) =>
          // async: os marcados já renderizaram na seção de cima
          isAsync && selectedSet.has(String(opt.value)) ? null : (
            <OptionRow
              key={String(opt.value)}
              opt={opt}
              checked={selectedSet.has(String(opt.value))}
              onToggle={toggle}
              renderOption={renderOption}
            />
          ),
        )}
        {isAsync && asyncLoading && (
          <p className="text-body-xs font-normal text-fg-muted px-pad-md py-pad-sm">
            Carregando…
          </p>
        )}
        {isAsync && !asyncLoading && asyncErro && (
          <div className="flex items-center gap-gp-md px-pad-md py-pad-sm">
            <span className="text-body-xs font-normal text-fg-danger">
              Falha ao carregar as opções.
            </span>
            <Button
              color="secondary"
              variant="ghost"
              size="2xs"
              onClick={() => fetchPage(busca, 1)}
            >
              Tentar de novo
            </Button>
          </div>
        )}
        {isAsync && !asyncLoading && asyncHasMore && (
          <Button
            color="secondary"
            variant="ghost"
            size="2xs"
            className="self-start"
            onClick={() => fetchPage(busca, asyncPage + 1)}
          >
            Carregar mais
          </Button>
        )}
      </div>
    </div>
  );
}

/** Trigger compacto + popover pra uso no modal advanced — economiza espaço
 *  comparado a renderizar a lista de checkboxes inline.
 *
 *  EXPORTADO junto do `MultiSelectDropdown`: um tipo custom com `ownsMulti` tem
 *  DOIS lugares a preencher — `renderFastFilterInput` (chip, já dentro de um popover:
 *  use o `MultiSelectDropdown`) e `renderFilterInput` (modal avançado, sem popover
 *  em volta: use este). Sem ele, o widget próprio do chip fica sem par no avançado. */
export function MultiSelectFieldDropdown(props: FilterInputProps) {
  const { value, options = [] } = props;
  const selected = toArray(value);
  const labels = selected.map((v) => {
    const opt = options.find((o) => String(o.value) === String(v));
    return opt?.label ?? String(v);
  });
  const display =
    labels.length === 0
      ? ""
      : labels.length <= 2
        ? labels.join(", ")
        : `${labels.length} selecionados`;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className={FILTER_FIELD_CLASS}>
          <span className={display ? "truncate" : "text-fg-muted opacity-70 truncate"}>
            {display || "Selecione..."}
          </span>
          <ChevronDown className="size-icon-xs text-fg-muted shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        // mobileSheet OFF: como select normal, o dropdown abre ancorado abaixo do
        // trigger no mobile (em vez de virar sheet bottom-up) — facilita a seleção.
        mobileSheet={false}
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[200px]"
      >
        <MultiSelectDropdown {...props} />
      </PopoverContent>
    </Popover>
  );
}

export const MultiSelectColumnType: ColumnTypeDefinition = {
  type: "multiSelect",
  // Labels alinhados com `DEFAULT_OP_LABELS` do ToolbarApplied — chip e popover
  // devem usar o MESMO label pra cada operator (consistência visual). "é"/"não é"
  // ao invés de "é um de"/"não é nenhum de" — mais curto e bate com o chip.
  operators: [
    { id: "isAnyOf", label: "é" },
    { id: "isNoneOf", label: "não é" },
    { id: "isEmpty", label: "está vazio" },
    { id: "isNotEmpty", label: "não está vazio" },
  ],
  /** Modal advanced: trigger + popover (compacto).
   *  isEmpty/isNotEmpty: operator se basta — não precisa de input. */
  renderFilterInput: (props) => {
    if (props.operator === "isEmpty" || props.operator === "isNotEmpty") {
      return <span className="text-fg-muted text-body-sm pl-pad-md">(sem valor)</span>;
    }
    return <MultiSelectFieldDropdown {...props} />;
  },
  /** Chip fast filter: já está dentro de um popover, renderiza inline. */
  renderFastFilterInput: (props) => <MultiSelectDropdown {...props} />,
  matchesFilter: (cellValue, filterValue, operator) => {
    const cell = cellValue == null ? "" : String(cellValue);
    if (operator === "isEmpty") return cell.length === 0;
    if (operator === "isNotEmpty") return cell.length > 0;
    const arr = Array.isArray(filterValue)
      ? filterValue.map(String)
      : filterValue == null
        ? []
        : [String(filterValue)];
    if (arr.length === 0) return true; // filtro vazio = passa tudo
    if (operator === "isAnyOf" || operator === "equals") {
      return arr.includes(cell);
    }
    if (operator === "isNoneOf" || operator === "neq") {
      return !arr.includes(cell);
    }
    return null;
  },
  renderChipValue: (value, options) => {
    const arr = Array.isArray(value)
      ? (value as Array<string | number>)
      : value == null
        ? []
        : [value as string | number];
    if (arr.length === 0) return null;
    const labelOf = (v: string | number) =>
      options?.find((o) => String(o.value) === String(v))?.label ?? String(v);
    if (arr.length === 1) return labelOf(arr[0]);
    if (arr.length === 2) return `${labelOf(arr[0])}, ${labelOf(arr[1])}`;
    return `${arr.length} selecionados`;
  },
};
