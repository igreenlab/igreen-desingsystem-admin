import type { ReactNode, MouseEvent } from "react";
import type { Locale } from "date-fns";

/**
 * Contrato público do `Gantt`.
 *
 * Spec: `.ai/specs/gantt-componente-de-cronograma.md`.
 *
 * ## A distinção que justifica o componente existir
 *
 * O DS já sabia mostrar **quando** algo acontece (`Scheduler`) e **qual data** foi
 * escolhida num formulário (`Calendar`/`DatePicker`). Não sabia mostrar **o que
 * depende de quê** — e é isso que `links` traz. Sem vínculo isto seria uma
 * timeline, não um Gantt.
 *
 * ## Um tipo, dois formatos de dado
 *
 * `GanttRow.bars` é array de propósito, e é o que faz um componente servir duas
 * leituras sem `if` no consumidor:
 *
 *   1 barra  + `parent`   → Gantt de projeto (a linha É a tarefa)
 *   N barras sem `parent` → timeline de portfólio (a linha é a sprint/frente,
 *                            e as barras são o que tem dentro)
 *
 * ⛔ Nada aqui é importado do `Scheduler`. Os dois modelos são incompatíveis por
 * desenho — `SchedulerEvent` é plano, com cor semântica, e não tem onde guardar
 * hierarquia nem vínculo. Só a gramática visual é compartilhada (ver o topo de
 * `gantt.styles.ts`, L-049).
 */

/* ────────────────────────────────────────────────────────────── cor ── */

/**
 * Chave de cor da barra.
 *
 * ⚠️ **A paleta de chart vem primeiro porque no Gantt a cor diz CATEGORIA — qual
 * frente de trabalho —, não ESTADO.** Estado viaja em `GanttRow.trailing` como
 * `Chip`, que é o canal que o DS já usa pra status.
 *
 * Isso é o que autoriza `chart-3` (azul): o `DESIGN.md` diz que *"the system has
 * zero blue tokens"* e o `Chart/USAGE.md` descreve a paleta como *"verde-marca +
 * harmônicas (teal/azul/âmbar/violeta)"*. Azul é legítimo como **dado
 * categórico** e proibido na **interface** — e barra de Gantt é dado.
 *
 * As chaves semânticas seguem disponíveis pro caso em que a cor realmente diz
 * status (um `milestone` atrasado, por exemplo). União fechada: ampliar é
 * aditivo e não quebra ninguém.
 */
export type GanttColorKey =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

/* ────────────────────────────────────────────────────────────── barra ── */

export type GanttBar = {
  /** Identidade. É o que volta nos callbacks e o que `GanttLink` referencia. */
  id: string;

  /** Rótulo dentro da barra. Some quando a barra fica estreita demais. */
  label?: ReactNode;

  /**
   * Texto pra busca. Existe porque `label` é `ReactNode` e o motor de busca só
   * casa string — sem isto, uma barra rotulada com JSX é invisível à busca.
   */
  searchText?: string;

  start: Date;

  /**
   * Fim, **obrigatório**.
   *
   * Duração zero se diz como `end === start`, não como `end` ausente. Opcional,
   * ele obrigaria todo cálculo a decidir o que fazer com o vazio — e cada lugar
   * decidiria diferente. É a mesma escolha do `SchedulerEvent`.
   */
  end: Date;

  colorKey?: GanttColorKey;

  /**
   * Progresso 0–100, preenchido como faixa mais escura dentro da barra.
   *
   * `undefined` **não** é 0: ausente significa "não rastreia progresso" e não
   * desenha faixa nenhuma; `0` significa "rastreia, e está em zero" e desenha a
   * trilha vazia. Nas referências os dois estados aparecem lado a lado.
   */
  progress?: number;

  /**
   * A barra atravessa a borda da janela visível.
   *
   * Corta o raio daquele lado — sinal de "não acaba aqui". Passa a ser
   * necessário no instante em que a janela é fixa (`windowStart`/`windowEnd`),
   * porque sem isso uma barra truncada é indistinguível de uma que termina ali.
   *
   * Normalmente derivado pelo próprio componente ao recortar na janela; a prop
   * existe pro consumidor que já pagina no servidor e sabe o que ficou fora.
   */
  continuesBefore?: boolean;
  continuesAfter?: boolean;

  /** Payload cru do consumidor. Devolvido intacto nos callbacks. */
  meta?: unknown;
};

/* ────────────────────────────────────────────────────────────── linha ── */

/**
 * - `task` — trabalho com duração. O caso comum.
 * - `summary` — agrupador. O intervalo é **derivado dos filhos**, não informado.
 * - `milestone` — ponto no tempo, desenhado como losango. Duração é ignorada.
 */
export type GanttRowType = "task" | "summary" | "milestone";

export type GanttRow = {
  id: string;
  label: ReactNode;
  /** Segunda linha do rótulo — código, responsável, contagem. */
  sublabel?: ReactNode;
  searchText?: string;

  /** @default "task" */
  type?: GanttRowType;

  /**
   * Id da linha-pai. Ausente = raiz.
   *
   * Uma linha `summary` com filhos tem o intervalo calculado pelo componente
   * (menor `start`, maior `end`). Informar `bars` num `summary` é aceito e
   * vence o cálculo — pro caso em que o consumidor tem o agregado do servidor e
   * não quer que o componente recompute.
   */
  parent?: string;

  /** Ver a nota do topo: 1 barra = tarefa, N barras = contêiner. */
  bars: GanttBar[];

  /**
   * `stack` = uma lane por barra (o "arco-íris": todas visíveis, linha mais alta).
   * `compact` = barras que não se sobrepõem dividem a mesma lane (linha baixa).
   *
   * @default "stack"
   */
  lanePacking?: "stack" | "compact";

  /**
   * Conteúdo livre depois do rótulo, na grade da esquerda — chip de status,
   * avatar do responsável, contador. Mesmo papel do `trailing` do `Breadcrumb`.
   */
  trailing?: ReactNode;

  /** Estado inicial de collapse. Controle contínuo via `onRowToggle`. */
  collapsed?: boolean;
};

/* ───────────────────────────────────────────────────────────── vínculo ── */

/**
 * Os 4 tipos canônicos de dependência.
 *
 * | Tipo | Restrição                              | Uso                        |
 * |------|----------------------------------------|----------------------------|
 * | `FS` | `target.start ≥ source.end   + lag`    | ~90% do uso real. Default  |
 * | `SS` | `target.start ≥ source.start + lag`    | arrancam juntas            |
 * | `FF` | `target.end   ≥ source.end   + lag`    | terminam juntas            |
 * | `SF` | `target.end   ≥ source.start + lag`    | raro, existe por completude|
 */
export type GanttLinkType = "FS" | "SS" | "FF" | "SF";

export type GanttLink = {
  id: string;

  /**
   * Ids de **BARRA**, não de linha.
   *
   * Uma linha-contêiner tem N barras, e o vínculo é entre trabalhos, não entre
   * agrupamentos — apontar pra linha tornaria o vínculo ambíguo no formato de
   * portfólio.
   */
  source: string;
  target: string;

  /** @default "FS" */
  type?: GanttLinkType;

  /**
   * Dias de espera (positivo) ou antecipação (negativo, *lead*).
   *
   * `lag: 2` num FS = "começa 2 dias depois que o anterior termina".
   * `lag: -1` = "pode começar 1 dia antes de o anterior terminar".
   */
  lag?: number;
};

/** Vínculo cuja restrição as datas atuais violam. */
export type GanttLinkViolation = {
  link: GanttLink;
  /** Dias de folga negativa — o quanto o alvo teria que andar pra satisfazer. */
  deficitDays: number;
};

/* ───────────────────────────────────────────────────────────── coluna ── */

export type GanttColumn = {
  /** Chave estável. `"label"` é a coluna do nome e sempre existe. */
  id: string;
  header: ReactNode;
  /** Largura em px. A coluna do nome estica; as outras são fixas. */
  width?: number;
  align?: "left" | "center" | "right";
  /** Render da célula. Sem isto, cai no `label`/`sublabel` da linha. */
  render?: (row: GanttRow) => ReactNode;
};

/* ──────────────────────────────────────────────────────── mutação ── */

export type GanttBarChange = {
  bar: GanttBar;
  row: GanttRow;
  start: Date;
  end: Date;
};

/* ──────────────────────────────────────────────────────────── raiz ── */

/**
 * As três visões, e cada uma responde uma pergunta diferente do MESMO dado:
 *
 *   timeline  "o que depende do quê"      eixo horizontal + setas + gesto
 *   calendar  "o que acontece no dia 12"  grade de mês com segmentos
 *   list      "o que vem a seguir"        agenda por dia, só dias com tarefa
 *
 * ⚠️ A `list` NÃO é uma tabela de tarefas — isso é o `DataTable` (view lista,
 * `hierarchical`). Ela é uma AGENDA: agrupa por DIA e repete a tarefa em cada
 * dia que ela ocupa, com a posição dentro do intervalo. Responde "o que estou
 * fazendo hoje e amanhã", que nem o eixo nem a grade de mês respondem sem o
 * usuário contar colunas.
 */
export type GanttView = "timeline" | "calendar" | "list";

export type GanttGranularity = "day" | "week" | "month" | "quarter";

export type GanttFilterOption = {
  value: string;
  label: string;
  colorKey?: GanttColorKey;
};

/**
 * Que tipo de filtro este campo é — e portanto que input o painel renderiza.
 *
 * O vocabulário espelha o da `DataTable` (`text` / `number` / `select` +
 * `filterType` pra date), porque o usuário lê a mesma frase nas duas telas:
 * "Status é Ativo", "Duração entre 3 e 10", "Início a partir de 01/09/26".
 *
 * ⚠️ Até a v0.59 o `Gantt` aceitava só `multi` — não por bug, por ausência de
 * contrato. Filtro de texto, faixa ou período eram impossíveis de expressar.
 *
 * | kind      | input                    | `model[id]`              |
 * |-----------|--------------------------|--------------------------|
 * | `multi`   | checkboxes (default)     | os valores marcados      |
 * | `single`  | radio                    | um valor                 |
 * | `text`    | campo de busca           | `[termo]`                |
 * | `number`  | dois campos numéricos    | `[min, max]` — "" = livre |
 * | `date`    | dois campos de data      | `[de, até]` — "" = livre  |
 * | `boolean` | radio Sim/Não            | `["true"]` \| `["false"]` |
 *
 * ⚠️ `GanttFilterModel` NÃO mudou de forma pra isso — segue
 * `Record<string, string[]>`. O que faltava não era a forma do dado, era como
 * interpretá-lo; por isso não há migração pra quem já usava `multi`.
 */
export type GanttFilterKind =
  | "multi"
  | "single"
  | "text"
  | "number"
  | "date"
  | "boolean";

export type GanttFilterField = {
  id: string;
  label: string;

  /** @default "multi" */
  kind?: GanttFilterKind;

  /**
   * Opções — obrigatórias em `multi`/`single`, opcionais em `boolean` (sem
   * elas o chip usa "Sim"/"Não"), ignoradas em `text`/`number`/`date`.
   */
  options?: GanttFilterOption[];

  /**
   * Extrai o valor da linha pra comparar.
   *
   * O tipo de retorno é largo porque o predicado depende do `kind`: `number`
   * aceita número ou string numérica, `date` aceita `Date` ou ISO, `boolean`
   * normaliza "1"/"sim"/"true". Devolver `undefined` **exclui** a linha quando
   * o filtro está ativo — filtrar por "Responsável = Ana" e receber as linhas
   * sem responsável nenhum é o oposto do pedido.
   */
  accessor: (
    row: GanttRow,
  ) => string | string[] | number | Date | boolean | null | undefined;

  /** Placeholder dos inputs de `text`/`number`/`date`. */
  placeholder?: string;

  /**
   * Força o campo de busca dentro deste grupo.
   *
   * Sem isto, a busca aparece a partir de 7 opções — abaixo disso ela é
   * ruído: ocupa a altura de uma opção e meia pra filtrar algo que já cabe
   * inteiro na tela.
   *
   * Serve pro caso em que o consumidor sabe que a lista cresce em produção
   * mesmo tendo poucas opções no mock.
   */
  searchable?: boolean;
};

export type GanttFilterModel = Record<string, string[]>;

export interface GanttProps {
  rows: GanttRow[];

  /** Ausente = sem setas. Presente = é um Gantt de verdade. */
  links?: GanttLink[];

  /** @default "timeline" */
  view?: GanttView;
  onViewChange?: (view: GanttView) => void;

  /**
   * **Janela visível, e ela é do consumidor.**
   *
   * O componente não navega sozinho — mesmo princípio do `Kanban` e da `Table`.
   * Quem consome troca a janela; o `Gantt` só desenha o que cabe nela e marca as
   * barras que a atravessam (`continuesBefore`/`continuesAfter`).
   *
   * Omitidos, o componente deriva a janela do menor `start` e maior `end` das
   * barras — conveniência pro caso simples, não substituto do controle.
   */
  windowStart?: Date;
  windowEnd?: Date;

  /** @default "day" */
  granularity?: GanttGranularity;

  /** Colunas da grade esquerda. Omitido, usa nome + datas + duração. */
  columns?: GanttColumn[];

  /**
   * Largura inicial da grade esquerda, em px. O divisor entre os painéis é
   * arrastável — todas as referências têm isso.
   *
   * 360 e não 320: com as 3 colunas default (nome + início + fim), 320 deixava
   * ~136px pro nome, que trunca em qualquer tarefa com mais de duas palavras.
   * @default 360
   */
  gridWidth?: number;

  /**
   * @default false — ligado sem `onBarMove` conectado, o usuário arrasta e vê a
   * barra voltar sozinha, que lê como bug do app. Mesmo default do `Scheduler`.
   */
  draggable?: boolean;
  resizable?: boolean;
  /** Criar vínculo arrastando do conector da barra. @default false */
  linkable?: boolean;

  /**
   * Destaca o caminho crítico.
   *
   * @default false — e não é economia de pixel: é **cálculo**. Exige ordenação
   * topológica sobre os vínculos, e num grafo com ciclo não existe resposta.
   * Ligado por default, um dado malformado do consumidor viraria travamento ou
   * resultado silenciosamente errado. Ciclo detectado → `onGraphError`.
   */
  criticalPath?: boolean;

  /**
   * Mostra o botão que liga/desliga o caminho crítico na toolbar.
   *
   * `false` quando o estado é uma decisão da TELA e não do usuário — por
   * exemplo um painel onde o crítico está sempre visível. Aí o botão só
   * ocuparia 40px oferecendo desligar algo que a tela quer ligado.
   *
   * ⚠️ Desligar o botão NÃO desliga o realce: quem manda no realce é
   * `criticalPath`. As duas props são independentes de propósito — esconder
   * o controle de um estado permanente é diferente de não ter o estado.
   *
   * O botão também não aparece quando não há `links`: sem grafo não existe
   * caminho crítico, e um toggle que nunca muda nada é pior que a ausência.
   */
  criticalPathToggle?: boolean;
  onGraphError?: (erro: { kind: "cycle"; barIds: string[] }) => void;

  /** Vínculos violados pelas datas atuais. Emitido quando o conjunto muda. */
  onLinkViolations?: (violations: GanttLinkViolation[]) => void;

  searchable?: boolean;
  filterFields?: GanttFilterField[];
  filterModel?: GanttFilterModel;
  onFilterModelChange?: (model: GanttFilterModel) => void;

  /** Abre o painel de detalhe — que é da TELA, não do componente. */
  onBarClick?: (bar: GanttBar, row: GanttRow, evt: MouseEvent) => void;
  onRowClick?: (row: GanttRow, evt: MouseEvent) => void;

  /** Emitem a intenção. **Não aplicam** — quem aplica é o consumidor. */
  onBarMove?: (change: GanttBarChange) => void;
  onBarResize?: (change: GanttBarChange) => void;
  onLinkCreate?: (link: Omit<GanttLink, "id">) => void;
  onLinkDelete?: (link: GanttLink) => void;

  /**
   * Clique no "+" de uma célula da visão `calendar`.
   *
   * ⚠️ **Sem este handler o "+" não é renderizado.** Um botão de adicionar que
   * não adiciona nada é pior que a ausência dele — mesma regra do toggle de
   * caminho crítico sem vínculo no grafo.
   *
   * Recebe o dia clicado à meia-noite local. Quem cria a tarefa é você: o
   * `Gantt` é dumb sobre mutação.
   */
  onDayAdd?: (date: Date) => void;

  onRowToggle?: (rowId: string, collapsed: boolean) => void;

  /** "Hoje". Injetável pra teste e pra fuso do servidor. @default new Date() */
  now?: Date;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  /** Slot livre na toolbar, entre o filtro e o seletor de visão. */
  toolbarActions?: ReactNode;
  primaryAction?: ReactNode;

  /** Sem nenhuma linha depois de busca e filtro. */
  emptyState?: ReactNode;

  className?: string;
}

export type GanttRef = {
  /** Move a janela pra conter esta data, preservando a largura. */
  goToDate: (date: Date) => void;
  goToToday: () => void;
  /** Expande/colapsa tudo. */
  expandAll: () => void;
  collapseAll: () => void;
};
