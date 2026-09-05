import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from "react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
} from "date-fns";
import { cn } from "@/lib/utils";
import {
  ganttBody,
  ganttCanvasScroll,
  ganttEmpty,
  ganttEmptyText,
  ganttGridPane,
  ganttRoot,
  ganttSplitter,
  ganttTimelinePane,
  GANTT_LANE_HEIGHT_PX,
  GANTT_PX_PER_DAY,
  GANTT_ROW_HEIGHT_PX,
  GANTT_WINDOW_DAYS,
} from "./gantt.styles";
import { GanttToolbar } from "./parts/gantt-toolbar";
import { GanttFilterPanel } from "./parts/gantt-filter-panel";
import { GanttSkeleton } from "./parts/gantt-skeleton";
import { GANTT_DEFAULT_COLUMNS, GanttGrid } from "./parts/gantt-grid";
import { GanttCalendarView } from "./views/calendar";
import { GanttListView } from "./views/list";
import { GanttTimelineView } from "./views/timeline";
import {
  dateToX,
  deriveWindow,
  flattenRows,
  rowHeights,
  rowOffsets,
  xToDate,
  type GanttFlatRow,
} from "./hooks/layout";
import { checkAllLinks, computeCriticalPath } from "./hooks/links";
import {
  aplicarFiltros,
  campoVazio,
  contarAplicados,
  parseDiaISO,
} from "./hooks/filters";
import type {
  GanttBar,
  GanttFilterModel,
  GanttProps,
  GanttRef,
  GanttView,
} from "./gantt.types";

/**
 * `Gantt` — cronograma de projeto com vínculos.
 *
 * Spec: `.ai/specs/gantt-componente-de-cronograma.md`.
 *
 * ## O que ele NÃO faz, e é decisão
 *
 * Não reagenda nada. Arrastar emite `onBarMove`; vínculo violado emite
 * `onLinkViolations`. Quem aplica é o consumidor — o DS é dumb sobre mutação, e
 * aqui isso vale em dobro: datas reescritas sozinhas parecem dados, e o erro
 * seria invisível.
 *
 * ## Janela é do consumidor
 *
 * `windowStart`/`windowEnd` vêm por prop. As setas `‹ ›` chamam o callback do
 * consumidor quando ele controla; sem as props, o componente mantém a janela em
 * estado próprio como conveniência — derivada dos dados na primeira montagem.
 */
export const Gantt = forwardRef<GanttRef, GanttProps>(function Gantt(
  {
    rows,
    links = [],
    view: viewProp,
    views,
    onViewChange,
    windowStart: wsProp,
    windowEnd: weProp,
    granularity: granProp,
    onGranularityChange,
    columns,
    gridWidth: gridWidthProp = 360,
    draggable = false,
    resizable = false,
    linkable = false,
    // Sem default no destructuring de propósito: `undefined` é o sinal de
    // "não controlado", e um default aqui o apagaria.
    criticalPath: criticalProp,
    onCriticalPathChange,
    criticalPathToggle = true,
    onGraphError,
    onLinkViolations,
    searchable = false,
    filterFields,
    filterModel,
    onFilterModelChange,
    onBarClick,
    onRowClick,
    /**
     * ⚠️ Estes quatro estavam DECLARADOS no tipo e nunca desestruturados aqui —
     * a raiz não os recebia. Era superfície de API sem nada por trás: os punhos
     * e as portas renderizavam, acessíveis, e o gesto não existia.
     */
    onBarMove,
    onBarResize,
    onLinkCreate,
    onLinkDelete,
    onDayAdd,
    onRowToggle,
    now = new Date(),
    locale,
    weekStartsOn = 0,
    toolbarActions,
    primaryAction,
    emptyState,
    loading = false,
    loadingState,
    className,
  },
  ref,
) {
  /* ── estado local só onde a prop não controla ─────────────────── */
  const [viewLocal, setViewLocal] = useState(viewProp ?? "timeline");
  /**
   * `views` recorta o que EXISTE; `view` diz qual está aberta.
   *
   * Quando a visão pedida não está na lista, abre a primeira permitida — ver
   * a nota de `views` nos tipos. Lista vazia é tratada como omitida: zero
   * visões renderizaria um componente sem conteúdo, e o consumidor que passou
   * `[]` quase certamente quis dizer "todas".
   */
  const visoesDisponiveis = useMemo<GanttView[]>(
    () =>
      views && views.length > 0
        ? views
        : ["timeline", "calendar", "list"],
    [views],
  );
  const viewPedida = viewProp ?? viewLocal;
  const view = visoesDisponiveis.includes(viewPedida)
    ? viewPedida
    : visoesDisponiveis[0];

  const [granLocal, setGranLocal] = useState(granProp ?? "day");
  const granularity = granProp ?? granLocal;

  const [criticalLocal, setCriticalLocal] = useState(criticalProp ?? false);
  const criticalPath = criticalProp ?? criticalLocal;

  const [busca, setBusca] = useState("");
  /**
   * `filterModel` local pro caso não-controlado.
   *
   * Com `filterFields` mas sem `filterModel`, o dropdown precisa guardar as
   * marcações em algum lugar — senão marcar não faz nada, e um filtro que não
   * filtra é pior que a ausência dele.
   */
  const [filterLocal, setFilterLocal] = useState<GanttFilterModel>({});
  const [colapsadas, setColapsadas] = useState<Set<string>>(() => new Set());
  const [gridWidth, setGridWidth] = useState(gridWidthProp);
  const [arrastandoDivisor, setArrastandoDivisor] = useState(false);

  /**
   * Janela: derivada dos dados na primeira montagem quando o consumidor não
   * controla. `useState` com inicializador e não `useMemo`, porque ela é
   * ESTADO — as setas de navegação a movem — e não valor derivado.
   */
  const [janelaLocal, setJanelaLocal] = useState(() =>
    deriveWindow(rows, granProp ?? "day"),
  );
  const windowStart = wsProp ?? janelaLocal.start;
  const windowEnd = weProp ?? janelaLocal.end;

  const pxPerDay = GANTT_PX_PER_DAY[granularity];

  /** Controlado vence o local — o consumidor manda quando ele participa. */
  const modeloEfetivo = filterModel ?? filterLocal;

  const aplicarModelo = useCallback(
    (proximo: GanttFilterModel) => {
      setFilterLocal(proximo);
      onFilterModelChange?.(proximo);
    },
    [onFilterModelChange],
  );

  /** Marca ou desmarca um grupo inteiro — o "selecionar todas" do painel. */
  const definirValores = useCallback(
    (fieldId: string, values: string[]) => {
      aplicarModelo({ ...modeloEfetivo, [fieldId]: values });
    },
    [modeloEfetivo, aplicarModelo],
  );

  const alternarValor = useCallback(
    (fieldId: string, value: string) => {
      const atuais = modeloEfetivo[fieldId] ?? [];
      const proximas = atuais.includes(value)
        ? atuais.filter((v) => v !== value)
        : [...atuais, value];
      aplicarModelo({ ...modeloEfetivo, [fieldId]: proximas });
    },
    [modeloEfetivo, aplicarModelo],
  );

  /* ── busca + filtro ──────────────────────────────────────────── */
  const rowsFiltradas = useMemo(() => {
    let saida = rows;

    const termo = busca.trim().toLowerCase();
    if (termo) {
      /**
       * Casar numa linha mantém os ANCESTRAIS dela visíveis.
       *
       * Sem isso, buscar uma tarefa a arranca da hierarquia e ela aparece solta
       * na raiz — o usuário perde a informação de qual fase ela pertence, que é
       * metade do valor de um Gantt hierárquico.
       */
       const casa = (r: (typeof rows)[number]) => {
        const alvo = [
          r.searchText,
          typeof r.label === "string" ? r.label : "",
          typeof r.sublabel === "string" ? r.sublabel : "",
          ...r.bars.map((b) => b.searchText ?? ""),
        ]
          .join(" ")
          .toLowerCase();
        return alvo.includes(termo);
      };

      const porId = new Map(rows.map((r) => [r.id, r]));
      const manter = new Set<string>();
      for (const r of rows) {
        if (!casa(r)) continue;
        manter.add(r.id);
        let pai = r.parent;
        let guarda = 0;
        while (pai && guarda < 50) {
          if (manter.has(pai)) break;
          manter.add(pai);
          pai = porId.get(pai)?.parent;
          guarda++;
        }
      }
      saida = saida.filter((r) => manter.has(r.id));
    }

    /**
     * Os 6 tipos de filtro vivem no núcleo puro (`hooks/filters.ts`), testado.
     *
     * ⚠️ Aqui havia o predicado inline de UM tipo só (interseção de strings) —
     * era o que limitava o componente a multi-seleção. Texto, faixa numérica e
     * período não eram expressáveis.
     *
     * A convenção "vazio = SEM filtro" (não "esconde tudo") mudou de lugar mas
     * não de valor: mora no `campoVazio`, que sabe que `["", ""]` de um campo
     * de faixa tem length 2 e zero intenção de filtrar.
     */
    saida = aplicarFiltros(saida, filterFields, modeloEfetivo);

    return saida;
  }, [rows, busca, filterFields, modeloEfetivo]);

  const flat: GanttFlatRow[] = useMemo(
    () => flattenRows(rowsFiltradas, colapsadas),
    [rowsFiltradas, colapsadas],
  );

  /**
   * #2 — alturas e offsets calculados AQUI, uma vez, e passados aos dois
   * painéis.
   *
   * Era o defeito: a grade usava a constante pra toda linha e o canvas somava
   * lanes. Uma linha-contêiner com 3 barras saía 98px de um lado e 48 do
   * outro, com o nome desalinhado das barras dali pra baixo (L-038).
   */
  const alturas = useMemo(
    () => rowHeights(flat, GANTT_ROW_HEIGHT_PX, GANTT_LANE_HEIGHT_PX),
    [flat],
  );
  const offsets = useMemo(() => rowOffsets(alturas), [alturas]);

  /**
   * Contagem por opção de filtro.
   *
   * ⚠️ Conta sobre `rows` (todas), não sobre `rowsFiltradas`: se contasse o
   * filtrado, marcar uma opção zeraria as irmãs dela e o usuário não teria
   * como saber que existem — o filtro se fecharia sobre si mesmo.
   */
  const contagens = useMemo(() => {
    const saida: Record<string, Record<string, number>> = {};
    for (const campo of filterFields ?? []) {
      const kind = campo.kind ?? "multi";
      /**
       * ⚠️ Contagem por opção só existe onde HÁ opções.
       *
       * Em `text`/`number`/`date` o valor é contínuo: não há o que contar por
       * chave, e tentar produzia um mapa com uma entrada por valor distinto do
       * dado ("6d": 1, "7d": 1, …) — lixo que o painel renderizaria como se
       * fosse contagem de opção.
       */
      if (kind !== "multi" && kind !== "single" && kind !== "boolean") continue;
      const porOpcao: Record<string, number> = {};
      for (const r of rows) {
        const v = campo.accessor(r);
        if (v === undefined || v === null) continue;
        for (const x of Array.isArray(v) ? v : [v]) {
          const chave = String(x);
          porOpcao[chave] = (porOpcao[chave] ?? 0) + 1;
        }
      }
      saida[campo.id] = porOpcao;
    }
    return saida;
  }, [rows, filterFields]);

  /* ── grafo ───────────────────────────────────────────────────── */
  const todasBarras = useMemo(() => {
    const lista: GanttBar[] = [];
    for (const r of rows) lista.push(...r.bars);
    return lista;
  }, [rows]);

  const mapaBarras = useMemo(
    () => new Map(todasBarras.map((b) => [b.id, b])),
    [todasBarras],
  );

  const violacoes = useMemo(
    () => checkAllLinks(links, mapaBarras),
    [links, mapaBarras],
  );

  const conflictBarIds = useMemo(
    () => new Set(violacoes.map((v) => v.link.target)),
    [violacoes],
  );

  /**
   * ⚠️ Emitir num `useEffect` e não no `useMemo`.
   *
   * Chamar callback do consumidor durante o cálculo do memo é efeito colateral
   * na fase de render — em StrictMode roda duas vezes, e um `setState` do lado
   * do consumidor viraria loop.
   */
  const violacoesRef = useRef<string>("");
  useEffect(() => {
    const assinatura = violacoes.map((v) => `${v.link.id}:${v.deficitDays}`).join("|");
    if (assinatura === violacoesRef.current) return;
    violacoesRef.current = assinatura;
    onLinkViolations?.(violacoes);
  }, [violacoes, onLinkViolations]);

  const criticalBarIds = useMemo(() => {
    if (!criticalPath || links.length === 0) return new Set<string>();
    const r = computeCriticalPath(todasBarras, links);
    if ("cycle" in r) return new Set<string>();
    return r.critical;
  }, [criticalPath, links, todasBarras]);

  /** Ciclo é resultado, não exceção — vai pro callback e o crítico não pinta. */
  const cicloRef = useRef<string>("");
  useEffect(() => {
    if (!criticalPath || links.length === 0) return;
    const r = computeCriticalPath(todasBarras, links);
    if (!("cycle" in r)) {
      cicloRef.current = "";
      return;
    }
    const assinatura = r.cycle.join("|");
    if (assinatura === cicloRef.current) return;
    cicloRef.current = assinatura;
    onGraphError?.({ kind: "cycle", barIds: r.cycle });
  }, [criticalPath, links, todasBarras, onGraphError]);

  /**
   * #3 — hover CRUZADO. A linha e a coluna sob o cursor acendem nos DOIS
   * painéis, e isso não é possível só com `:hover`: nenhum seletor CSS alcança
   * um irmão de outro contêiner. O índice mora aqui, no ancestral comum.
   */
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  /** #7 — linha selecionada por clique, no verde da marca. */
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  /** #2 — coluna selecionada por clique no cabeçalho do dia. */
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  /** #4 — o filtro agora é painel lateral, com estado de abertura. */
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  /* ── scroll espelhado entre os painéis ───────────────────────── */
  const [scrollTop, setScrollTop] = useState(0);
  const aoRolar = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  /* ── divisor arrastável ──────────────────────────────────────── */
  const bodyRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  /**
   * Instante do tempo pra recentrar a viewport, pendente até o próximo layout.
   *
   * Trocar de escala muda `pxPerDay` E a janela; o `scrollLeft` que traduzia
   * "estou olhando setembro" na escala antiga não significa nada na nova. Sem
   * recentrar, mudar pra trimestre deixava o usuário em 2024 numa janela de 5
   * anos cujos dados vivem em 2026 — canvas vazio, e nada dizendo onde estava
   * o trabalho.
   *
   * ⚠️ Estado + efeito, e não `scrollLeft` direto no handler: no momento do
   * clique o DOM ainda tem a largura ANTIGA do trilho. Atribuir ali seria
   * medir a escala velha pra posicionar na nova.
   */
  const [centrarEm, setCentrarEm] = useState<Date | null>(null);

  useEffect(() => {
    if (!centrarEm) return;
    const el = scrollerRef.current;
    if (!el) return;
    const x = dateToX(centrarEm, windowStart, pxPerDay);
    el.scrollLeft = Math.max(0, x - el.clientWidth / 2);
    setCentrarEm(null);
  }, [centrarEm, windowStart, pxPerDay]);
  useEffect(() => {
    if (!arrastandoDivisor) return;
    const mover = (e: PointerEvent) => {
      const caixa = bodyRef.current?.getBoundingClientRect();
      if (!caixa) return;
      // Piso de 180px e teto de 60% da largura: abaixo do piso a coluna do nome
      // não cabe, e acima do teto o cronograma — que é o ponto do componente —
      // fica menor que a grade.
      const bruto = e.clientX - caixa.left;
      setGridWidth(Math.min(Math.max(180, bruto), caixa.width * 0.6));
    };
    const soltar = () => setArrastandoDivisor(false);
    window.addEventListener("pointermove", mover);
    window.addEventListener("pointerup", soltar);
    return () => {
      window.removeEventListener("pointermove", mover);
      window.removeEventListener("pointerup", soltar);
    };
  }, [arrastandoDivisor]);

  /* ── navegação de janela ─────────────────────────────────────── */
  const larguraJanelaDias =
    differenceInCalendarDays(startOfDay(windowEnd), startOfDay(windowStart)) + 1;

  const mover = useCallback(
    (dias: number) => {
      // Só mexe no estado local: quando o consumidor controla a janela, mover
      // é decisão dele — e sobrescrever a prop faria o componente lutar contra
      // o próprio consumidor no próximo render.
      if (wsProp || weProp) return;
      setJanelaLocal((j) => ({
        start: addDays(j.start, dias),
        end: addDays(j.end, dias),
      }));
    },
    [wsProp, weProp],
  );

  useImperativeHandle(
    ref,
    (): GanttRef => ({
      goToDate: (date) => {
        if (wsProp || weProp) return;
        const meio = Math.floor(larguraJanelaDias / 2);
        setJanelaLocal({
          start: addDays(startOfDay(date), -meio),
          end: addDays(startOfDay(date), larguraJanelaDias - meio - 1),
        });
      },
      goToToday: () => {
        if (wsProp || weProp) return;
        const meio = Math.floor(larguraJanelaDias / 2);
        setJanelaLocal({
          start: addDays(startOfDay(now), -meio),
          end: addDays(startOfDay(now), larguraJanelaDias - meio - 1),
        });
      },
      expandAll: () => setColapsadas(new Set()),
      collapseAll: () =>
        setColapsadas(new Set(rows.filter((r) => r.parent === undefined).map((r) => r.id))),
    }),
    [wsProp, weProp, larguraJanelaDias, now, rows],
  );

  /**
   * Mês âncora da visão `calendar` — o MEIO da janela.
   *
   * ⚠️ Extraída pra variável porque agora TRÊS lugares a consomem: o título, a
   * navegação e a própria view. Calculada inline no JSX (como estava) o título
   * poderia dizer um mês e a grade mostrar outro no primeiro arredondamento
   * diferente — é a L-038 esperando acontecer.
   *
   * Não é `windowStart`: a janela derivada começa um dia ANTES da primeira
   * barra, então o âncora caía no mês anterior ao trabalho (medido: abria
   * agosto com 5 células ocupadas de 42 enquanto os dados viviam em set–nov).
   */
  const ancoraDoMes = useMemo(
    () =>
      addDays(startOfDay(windowStart), Math.floor(larguraJanelaDias / 2)),
    [windowStart, larguraJanelaDias],
  );

  /**
   * As visões SEM EIXO são mensais — `calendar` e `list`.
   *
   * ⚠️ A agenda começou lendo a janela inteira, e com os 64 dias do exemplo ela
   * saía com **62 blocos de dia e 168 itens**. Isso é uma lista de rolagem
   * infinita disfarçada de agenda: ninguém lê 168 cartões em sequência, e o
   * título prometia "31 ago – 2 nov" enquanto a leitura útil era "esta semana".
   *
   * Recortada no mês, ela tem no máximo 31 blocos — e o `‹ ›` andando um mês
   * exato dá ao usuário o gesto pra chegar nos outros. É o mesmo recorte que o
   * `SchedulerListView` faz, pelo mesmo motivo.
   *
   * ⛔ Não é a janela: a janela existe pro EIXO, que comprime 64 dias em pixels
   * e por isso pode mostrar tudo de uma vez. Agenda e grade de mês não
   * comprimem — cada dia custa uma linha.
   */
  const mesVisivel = useMemo(
    () => ({
      start: startOfMonth(ancoraDoMes),
      end: endOfMonth(ancoraDoMes),
    }),
    [ancoraDoMes],
  );

  /** As visões cujo período é um MÊS, não a janela do eixo. */
  const visaoMensal = view === "calendar" || view === "list";

  /**
   * O título muda de NATUREZA com a visão, não só de formato.
   *
   * `timeline` mostra o INTERVALO ("31 ago – 2 nov 2026") porque é isso que o
   * eixo cobre.
   *
   * `calendar` e `list` mostram o MÊS ("outubro 2026"), porque é isso que as
   * duas mostram. Anunciar um intervalo de 64 dias sobre uma grade que mostra 31
   * — ou sobre uma agenda recortada no mês — é o título mentindo sobre o
   * conteúdo.
   */
  const titulo = useMemo(() => {
    if (visaoMensal) {
      return format(ancoraDoMes, "MMMM yyyy", { locale });
    }
    const mesmoAno = windowStart.getFullYear() === windowEnd.getFullYear();
    const a = format(windowStart, mesmoAno ? "d MMM" : "d MMM yyyy", { locale });
    const b = format(windowEnd, "d MMM yyyy", { locale });
    return `${a} – ${b}`;
  }, [visaoMensal, ancoraDoMes, windowStart, windowEnd, locale]);

  /**
   * Quanto o `‹ ›` anda — e a unidade depende da visão.
   *
   * `timeline`: meia janela, que é o passo que mantém contexto de um lado
   * enquanto revela o outro.
   *
   * `calendar` e `list`: **um mês exato**. Meia janela ali andaria 32 dias e
   * poderia cair no mesmo mês (a grade não mudaria) ou pular um — em nenhum dos
   * dois casos o botão faria o que o título promete. O passo é calculado em DIAS
   * a partir do mês vizinho, pra a janela seguir sendo a fonte única.
   */
  const passoDeNavegacao = useCallback(
    (direcao: 1 | -1) => {
      if (visaoMensal) {
        const destino = addMonths(ancoraDoMes, direcao);
        return differenceInCalendarDays(destino, ancoraDoMes);
      }
      return direcao * Math.max(1, Math.floor(larguraJanelaDias / 2));
    },
    [visaoMensal, ancoraDoMes, larguraJanelaDias],
  );

  /**
   * Formata o ISO de um filtro `date` pro chip.
   *
   * Vive na raiz porque é onde o `locale` está — o chip mostraria
   * "2026-09-01" a um usuário pt-BR se formatasse por conta própria, e uma
   * segunda decisão de formato de data no mesmo componente é como duas fontes
   * divergem (L-038).
   */
  const formatarDataDeFiltro = useCallback(
    (iso: string) => {
      /**
       * ⚠️ `parseDiaISO` e NÃO `new Date(iso)` — o MESMO parser que o
       * predicado usa. Com `new Date`, o chip mostraria 29/09 pra um filtro
       * de 30/09 (ISO date-only é UTC; aqui é UTC−3) enquanto o filtro
       * casaria 30/09 corretamente: duas fontes pra mesma data divergindo em
       * um dia, que é a L-038 no pior formato — o chip mentiria sobre o que o
       * filtro está fazendo.
       */
      const d = parseDiaISO(iso);
      if (!d) return iso;
      return format(d, "dd/MM/yy", { locale });
    },
    [locale],
  );

  const colunas = columns ?? GANTT_DEFAULT_COLUMNS;
  /**
   * ⚠️ Não é `Object.values(modelo).filter(v => v.length > 0)`.
   *
   * Um campo de faixa guarda `["", ""]` — length 2 com zero intenção de
   * filtrar. A conta antiga daria 1 filtro ativo, com o badge aceso e o
   * "Limpar tudo" habilitado sobre nada.
   */
  const appliedCount = contarAplicados(filterFields, modeloEfetivo);

  return (
    <div className={cn(ganttRoot(), className)}>
      <GanttToolbar
        title={titulo}
        onPrev={() => mover(passoDeNavegacao(-1))}
        onNext={() => mover(passoDeNavegacao(1))}
        onToday={() => {
          if (wsProp || weProp) return;
          const meio = Math.floor(larguraJanelaDias / 2);
          setJanelaLocal({
            start: addDays(startOfDay(now), -meio),
            end: addDays(startOfDay(now), larguraJanelaDias - meio - 1),
          });
        }}
        view={view}
        views={visoesDisponiveis}
        /**
         * Controlado vence o local — e o callback dispara nos DOIS casos.
         *
         * ⚠️ `onViewChange` era desestruturado e nunca chamado: `view` só
         * mudava por prop, então a visão de calendário seria inalcançável pela
         * UI mesmo depois de construída.
         */
        onViewChange={(v) => {
          if (viewProp === undefined) setViewLocal(v);
          onViewChange?.(v);
        }}
        granularity={granularity}
        onGranularityChange={(g) => {
          // Que instante do tempo está no meio da viewport AGORA — antes de
          // `pxPerDay` mudar e o número perder o sentido.
          const el = scrollerRef.current;
          if (el) {
            setCentrarEm(
              xToDate(el.scrollLeft + el.clientWidth / 2, windowStart, pxPerDay),
            );
          }
          if (granProp === undefined) setGranLocal(g);
          onGranularityChange?.(g);
          /**
           * #9 — a janela ACOMPANHA a escala.
           *
           * Sem isto, trocar pra trimestre mantinha os ~60 dias e o cronograma
           * inteiro colapsava numa tira de 128px (medido: 60 dias × 2px/dia).
           * Escolher escala mais grossa é pedir pra ver MAIS TEMPO — não a
           * mesma janela comprimida.
           *
           * Só mexe no estado local: quando o consumidor controla a janela,
           * mudar de escala não pode sobrescrever a decisão dele.
           */
          if (wsProp || weProp) return;
          const dias = GANTT_WINDOW_DAYS[g];
          /**
           * #5a — a janela da escala é um PISO, e o cronograma é o outro.
           *
           * A janela centrada da escala (60 dias em `day`) podia ser MENOR que o
           * cronograma: voltar de "trimestre" pra "dia" recentrava em 60 dias e
           * **cortava as duas pontas** — as barras do fim desapareciam sem nada
           * dizer que havia mais. Medido no exemplo: 64 dias de dados, 60 de
           * janela, 2 dias perdidos em cada ponta.
           *
           * A correção é a UNIÃO da janela centrada com a extensão dos dados
           * (`deriveWindow`, a MESMA função que decide a janela na primeira
           * montagem), e não um `max` de larguras. União porque ela é
           * **idempotente e reversível**: day→quarter→day devolve exatamente a
           * janela original, enquanto recentrar numa largura maior desloca a
           * janela em 1 dia a cada volta pelo arredondamento do meio.
           */
          const extensao = deriveWindow(rows, g);
          setJanelaLocal((j) => {
            // Mantém o CENTRO: o usuário estava olhando um ponto do tempo, e
            // trocar a escala não deve teleportá-lo pra outro lugar.
            const meio = addDays(
              startOfDay(j.start),
              Math.floor(
                differenceInCalendarDays(startOfDay(j.end), startOfDay(j.start)) / 2,
              ),
            );
            const start = addDays(meio, -Math.floor(dias / 2));
            const end = addDays(meio, dias - Math.floor(dias / 2) - 1);
            return {
              start: extensao.start < start ? extensao.start : start,
              end: extensao.end > end ? extensao.end : end,
            };
          });
        }}
        searchable={searchable}
        search={busca}
        onSearchChange={setBusca}
        filterFields={filterFields}
        onOpenFilterPanel={() => setFiltroAberto(true)}
        appliedCount={appliedCount}
        filterModel={modeloEfetivo}
        onClearField={(id) => definirValores(id, [])}
        onClearAll={() => aplicarModelo({})}
        onToggleFilterValue={alternarValor}
        filterCounts={contagens}
        formatFilterDate={formatarDataDeFiltro}
        hasLinks={links.length > 0}
        showCriticalToggle={criticalPathToggle}
        criticalPath={criticalPath}
        onToggleCriticalPath={() => {
          const proximo = !criticalPath;
          if (criticalProp === undefined) setCriticalLocal(proximo);
          onCriticalPathChange?.(proximo);
        }}
        toolbarActions={toolbarActions}
        primaryAction={primaryAction}
      />

      <div
        ref={bodyRef}
        /*
          A moldura é do `ganttBody` só na timeline: as outras duas views
          trazem a própria (`ganttMonthFrame`, `ganttListFrame`), e as duas
          juntas desenham bordas concêntricas separadas por 1px.
        */
        className={ganttBody({ framed: view === "timeline" })}
        role="region"
        aria-label={`Cronograma, ${titulo}`}
      >
        {/*
          ⚠️ CARREGANDO vence VAZIO, e a ordem não é estética.

          Quem busca do servidor renderiza `rows={[]}` enquanto espera. Com o
          vazio primeiro, o componente afirmaria "Nenhuma tarefa neste período"
          — uma frase que ele não tem como saber que é verdade, e que faz o
          usuário desistir antes de o dado chegar.
        */}
        {loading ? (
          (loadingState ?? (
            <GanttSkeleton view={view} gridWidth={gridWidth} />
          ))
        ) : flat.length === 0 ? (
          <div className={ganttEmpty()}>
            {emptyState ?? (
              <span className={ganttEmptyText()}>
                Nenhuma tarefa neste período.
              </span>
            )}
          </div>
        ) : (
          <>
            {/*
              ⚠️ A grade e o divisor existem SÓ na `timeline`.

              Na grade de mês não há eixo horizontal pra a coluna de nomes
              acompanhar — ela seria uma lista de tarefas ao lado de um
              calendário, sem relação de linha entre as duas metades, roubando
              460px de uma grade que precisa de largura pra os chips caberem.
              O nome da tarefa está no próprio chip.
            */}
            {view === "timeline" ? (
              <>
            <div className={ganttGridPane()} style={{ width: gridWidth }}>
              <GanttGrid
                rows={flat}
                columns={colunas}
                heights={alturas}
                scrollTop={scrollTop}
                locale={locale}
                hoveredRow={hoveredRow}
                onHoverRow={setHoveredRow}
                selectedRow={selectedRow}
                onRowToggle={(id, colapsar) => {
                  setColapsadas((prev) => {
                    const proximo = new Set(prev);
                    if (colapsar) proximo.add(id);
                    else proximo.delete(id);
                    return proximo;
                  });
                  onRowToggle?.(id, colapsar);
                }}
                onRowClick={(row, e) => {
                  const i = flat.findIndex((f) => f.row.id === row.id);
                  // Clicar na linha já selecionada DESSELECIONA: sem isso não
                  // há como voltar ao estado neutro sem recarregar.
                  setSelectedRow((atual) => (atual === i ? null : i));
                  onRowClick?.(row, e);
                }}
              />
            </div>

            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Redimensionar a grade"
              tabIndex={0}
              className={ganttSplitter({ active: arrastandoDivisor })}
              onPointerDown={() => setArrastandoDivisor(true)}
              onKeyDown={(e) => {
                // Teclado move o divisor em passos de 16px — sem isso ele é
                // inalcançável sem ponteiro.
                if (e.key === "ArrowLeft") setGridWidth((w) => Math.max(180, w - 16));
                if (e.key === "ArrowRight") setGridWidth((w) => w + 16);
              }}
            />
              </>
            ) : null}

            <div className={ganttTimelinePane()}>
              {view === "timeline" ? (
                <GanttTimelineView
                  rows={flat}
                  allRows={rows}
                  links={links}
                  windowStart={windowStart}
                  windowEnd={windowEnd}
                  granularity={granularity}
                  pxPerDay={pxPerDay}
                  heights={alturas}
                  offsets={offsets}
                  now={now}
                  locale={locale}
                  weekStartsOn={weekStartsOn}
                  conflictBarIds={conflictBarIds}
                  criticalBarIds={criticalBarIds}
                  draggable={draggable}
                  resizable={resizable}
                  linkable={linkable}
                  hoveredRow={hoveredRow}
                  onHoverRow={setHoveredRow}
                  hoveredDay={hoveredDay}
                  onHoverDay={setHoveredDay}
                  selectedRow={selectedRow}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  onBarMove={onBarMove}
                  onBarResize={onBarResize}
                  onLinkCreate={onLinkCreate}
                  onLinkClick={onLinkDelete}
                  onScroll={aoRolar}
                  scrollRef={scrollerRef}
                  onBarClick={onBarClick}
                />
              ) : view === "calendar" ? (
                /*
                  ⚠️ O mês âncora é o MEIO da janela, e chegar nisso custou uma
                  medição.

                  Não é `now`: aí navegar com `‹ ›` moveria a janela e a grade
                  ficaria parada — as duas visões falariam de períodos
                  diferentes, e trocar de visão teleportaria o usuário.

                  E não é `windowStart`, que foi a primeira tentativa. A janela
                  derivada começa UM DIA ANTES da primeira barra, então o mês
                  âncora caía no mês anterior ao trabalho: medido no exemplo,
                  `windowStart` = 31/ago abria agosto com **5 células ocupadas
                  de 42** enquanto os dados viviam em set–nov.

                  O meio da janela é onde a massa do cronograma está, acompanha
                  o `‹ ›` e nunca cai num mês de borda.
                */
                <GanttCalendarView
                  rows={flat}
                  anchor={ancoraDoMes}
                  weekStartsOn={weekStartsOn}
                  now={now}
                  locale={locale}
                  conflictBarIds={conflictBarIds}
                  criticalBarIds={criticalBarIds}
                  onBarClick={onBarClick}
                  onDayAdd={onDayAdd}
                />
              ) : (
                /*
                  A agenda recebe o MÊS, não a janela — ver a nota do
                  `mesVisivel`. As setas `‹ ›` andam um mês nesta visão, então o
                  recorte e a navegação falam a mesma unidade.
                */
                <GanttListView
                  rows={flat}
                  windowStart={mesVisivel.start}
                  windowEnd={mesVisivel.end}
                  now={now}
                  locale={locale}
                  conflictBarIds={conflictBarIds}
                  criticalBarIds={criticalBarIds}
                  onBarClick={onBarClick}
                  emptyState={emptyState}
                />
              )}
            </div>
          </>
        )}
      </div>

      {/*
        O painel de filtro vive FORA do `ganttBody` porque o `FloatingPanel` se
        posiciona sozinho (fixed + portal). Dentro do body ele herdaria o
        `flex` e o `overflow-hidden` do contêiner dos dois painéis.
      */}
      {filterFields && filterFields.length > 0 ? (
        <GanttFilterPanel
          open={filtroAberto}
          onOpenChange={setFiltroAberto}
          fields={filterFields}
          model={modeloEfetivo}
          onToggleValue={alternarValor}
          onSetFieldValues={definirValores}
          onClearAll={() => aplicarModelo({})}
          appliedCount={appliedCount}
          counts={contagens}
        />
      ) : null}
    </div>
  );
});
