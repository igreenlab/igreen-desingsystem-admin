# `Gantt` — cronograma de projeto com vínculos

> **Status:** `PROPOSTA (2026-09-04)` — desenho pronto pra avaliação. Nada implementado.
> Aguardando o gate da Regra 4 (componente novo).

---

## 1. O problema

O DS sabe mostrar **quando** algo acontece (`Scheduler`, v0.56.0) e sabe mostrar **uma
data escolhida num formulário** (`Calendar`, `DatePicker`, `MonthYearPicker`). Não sabe
mostrar **o que depende de quê**.

Essa é a lacuna, e ela não é cosmética. A literatura de gestão de projeto converge num
ponto:

> *"Dependências são a informação mais importante num Gantt. Sem elas, o gráfico é uma
> lista de tarefas com datas. Com elas, é um modelo de como o projeto funciona: quais
> tarefas estão no caminho crítico, quais têm folga, e onde um atraso vai cascatear."*

Sem vínculo não é Gantt — é timeline. E timeline nós já temos.

## 2. Desambiguação — a linha que vai pro vocabulário do consumidor

Quatro componentes tocam "tempo" no DS. Sem esta tabela na
`cli/templates/default/_claude/rules/ds-components.md`, a IA do consumidor escolhe errado —
é a classe de defeito que a L-042 cataloga.

| Componente | Responde | Unidade |
|---|---|---|
| `Calendar` · `DatePicker` · `MonthYearPicker` | escolher **uma data** | campo de formulário |
| `Scheduler` | **quando** algo acontece — compromisso, reserva, agenda | evento (`start`/`end`) |
| `Gantt` | **o que depende de quê** — e o que isso implica no prazo | tarefa (hierarquia + vínculo + progresso) |

## 3. Contrato de tipos

```ts
export type GanttView = "timeline" | "calendar";

/** Chave de cor. CATEGÓRICA por default (qual frente), não semântica (qual status). */
export type GanttColorKey =
  | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
  | "brand" | "success" | "warning" | "danger" | "info" | "neutral";

export type GanttBar = {
  id: string;
  label?: ReactNode;
  /** `searchText` porque `label` é ReactNode e a busca só casa string. */
  searchText?: string;
  start: Date;
  /** Obrigatório. Duração zero = `end === start` — dito como igualdade, não ausência. */
  end: Date;
  colorKey?: GanttColorKey;
  /** 0–100. `undefined` = sem preenchimento parcial, que é diferente de 0. */
  progress?: number;
  /** Atravessa a borda da janela: corta o raio daquele lado. */
  continuesBefore?: boolean;
  continuesAfter?: boolean;
  /** Payload cru do consumidor, devolvido intacto nos callbacks. */
  meta?: unknown;
};

export type GanttRowType = "task" | "summary" | "milestone";

export type GanttRow = {
  id: string;
  label: ReactNode;
  sublabel?: ReactNode;
  searchText?: string;
  type?: GanttRowType;          // default "task"
  /** Hierarquia. Ausente = raiz. `summary` deriva o intervalo dos filhos. */
  parent?: string;
  /**
   * 1 barra  → linha de tarefa (Gantt de projeto)
   * N barras → linha-contêiner (timeline de portfólio: a sprint e as tasks dentro)
   */
  bars: GanttBar[];
  /** `stack` = uma lane por barra. `compact` = barras sem sobreposição dividem lane. */
  lanePacking?: "stack" | "compact";
  /** Conteúdo livre depois do rótulo, na grade da esquerda. */
  trailing?: ReactNode;
  collapsed?: boolean;
};

export type GanttLinkType = "FS" | "SS" | "FF" | "SF";

export type GanttLink = {
  id: string;
  source: string;               // id da BARRA, não da linha
  target: string;
  type?: GanttLinkType;         // default "FS"
  /** Dias de espera (positivo) ou antecipação (negativo). */
  lag?: number;
};
```

**Por que `source`/`target` apontam pra barra e não pra linha:** uma linha-contêiner tem N
barras, e o vínculo é entre trabalhos, não entre agrupamentos. Apontar pra linha tornaria o
vínculo ambíguo no formato de portfólio.

## 4. Props da raiz

| Prop | Tipo | Papel |
|---|---|---|
| `rows` | `GanttRow[]` | os dados |
| `links` | `GanttLink[]` | os vínculos. Ausente = sem setas |
| `view` | `GanttView` | `"timeline"` (default) ou `"calendar"` |
| `windowStart` / `windowEnd` | `Date` | **janela visível, do consumidor.** O componente não navega sozinho |
| `granularity` | `"day" \| "week" \| "month" \| "quarter"` | densidade do eixo |
| `columns` | `GanttColumn[]` | colunas da grade esquerda (nome, datas, duração, %, responsável) |
| `draggable` / `resizable` | `boolean` | default **`false`** — ver §7 |
| `linkable` | `boolean` | criar vínculo arrastando do conector. Default `false` |
| `criticalPath` | `boolean` | destaca o caminho crítico. Default `false` |
| `onBarClick` | `(bar, row, evt) => void` | abre o painel de detalhe — que é da TELA |
| `onBarMove` / `onBarResize` | `(change) => void` | emite; **não aplica** |
| `onLinkCreate` / `onLinkDelete` | `(link) => void` | idem |
| `onRowToggle` | `(rowId, collapsed) => void` | collapse controlado |
| `searchable` · `filterFields` · `filterModel` | — | mesma gramática do `Scheduler` |

## 5. As duas visões

**`timeline`** — grade esquerda + eixo de tempo à direita, barras posicionadas, setas SVG
entre elas, losango pra marco, barra-resumo com pontas, linha do "hoje".

**`calendar`** — grade de mês, cada barra vira chip no dia, `+N mais` no estouro. É outra
**leitura** do mesmo dado: *"o que acontece este mês"* em vez de *"o que bloqueia o quê"*.
Vínculos não são desenhados aqui — seta atravessando grade de mês não comunica nada.

⚠️ **Esta visão NÃO delega pro `Scheduler`, e a decisão é deliberada.** Delegar criaria
acoplamento por herança de propósito: toda necessidade nova do Gantt (losango de marco,
`colorKey` categórico, destaque de crítico) viraria mudança numa API publicada que serve
outros consumidores. E o mapeamento é perdedor: `SchedulerEvent` é plano, com cor semântica
— hierarquia e vínculo não têm onde morar.

**Preço aceito, explícito:** passam a existir duas grades de mês no repo, e a consistência
visual entre elas depende de revisão, não de construção. O que **não** duplica em silêncio é
a matemática: `buildMonthMatrix`, `computeOverflow` e `segmentMultiDay` vêm com teste próprio
sobre as mesmas bordas (virada de mês, grade de 6 linhas, barra que cruza a borda).

Mesmo critério que o `scheduler.styles.ts` já aplica ao `TableToolbar`: *"Nada aqui é
importado — só a gramática visual foi copiada (L-049)."*

## 6. Os 4 tipos de vínculo

| Tipo | Restrição | Uso |
|---|---|---|
| **FS** (finish-to-start) | `target.start ≥ source.end + lag` | ~90% do uso real. Default |
| **SS** (start-to-start) | `target.start ≥ source.start + lag` | tarefas que arrancam juntas |
| **FF** (finish-to-finish) | `target.end ≥ source.end + lag` | precisam terminar juntas |
| **SF** (start-to-finish) | `target.end ≥ source.start + lag` | raro, existe por completude |

`lag` positivo = espera; negativo = antecipação (*lead*).

**O componente valida e sinaliza, não corrige.** Vínculo violado ganha marcação visual e
entra no callback; o componente não move nada. Corrigir cronograma é decisão de negócio.

## 7. O que é opt-in, e por quê

`draggable`, `resizable`, `linkable` e `criticalPath` nascem **`false`**.

Os três primeiros pelo mesmo motivo do `Scheduler`: ligados sem handler conectado, o usuário
arrasta e vê a barra voltar sozinha — lê como bug do app, e o default protege disso (L-005 do
Scheduler, verificado em produção).

`criticalPath` porque é **cálculo**, não pintura: exige ordenação topológica sobre os
vínculos, custa O(V+E) a cada mudança, e num grafo com ciclo não tem resposta. Ligado por
default, um dado malformado do consumidor viraria travamento ou resultado silenciosamente
errado. Ciclo detectado → callback de erro, não exceção.

## 8. Pele: o que vem do DS, não das referências

As 13 referências visuais decidiram **estrutura** (quais colunas, o divisor arrastável, o
eixo em dois níveis, o menu de contexto na barra). A pele é do DS, conforme
`.ai/context/referencia-visual.md`:

| Peça | Token / classe | Origem |
|---|---|---|
| Altura de linha | `comp-2xl` (44px) — fonte ÚNICA, consumida pelos dois painéis | alvo de toque WCAG |
| Barra | gramática do `schedulerEvent` — `border`, `rounded-radius-xs`, transição de 150ms | `Scheduler` |
| Cor da barra | `--color-chart-1..5` categórico · semântico só quando a cor diz status | `Chart/USAGE` |
| Grade do eixo | `--color-chart-grid` | `Chart` |
| Toolbar | gramática do `schedulerToolbar` — período, `‹ Hoje ›`, busca, filtro, view | `Scheduler` |
| Linha do "hoje" | `schedulerNowLine` / `NowDot` / `NowStroke` | `Scheduler` |
| Chip de status | `Chip size="sm" variant="soft"` | `Chip` |
| Superfície flutuante | receita única da L-040 | `dropdown-menu` |
| Tipografia | presets — `body-sm` na grade, `caption-md` no eixo | `typography.ts` |

⛔ **Nenhum hex derivado de pixel de print.** A referência escolhe o CONJUNTO (`dark`,
`data-theme`), nunca o valor. Os prints incluem paletas de outros produtos (roxo, laranja,
azul-royal) que não existem no DS e não devem existir.

⛔ **Filtro é o motor nativo em chip** (L-051), não `select` acima da grade — mesmo que uma
referência mostre `select` acima da grade.

## 9. Alternativas descartadas

**A. Painel esquerdo = `DataTable`.** Ganharia colunas, ordenação e visões salvas de graça.
Descartada por medição: são **12.187 linhas em 75 arquivos**, o `hierarchical` dela vive na
*view de lista* e não na tabela, e a altura de linha dela deriva de `density`. Altura de
linha é exatamente o que os dois painéis precisam compartilhar ao pixel — deixá-la num
componente que o Gantt não controla é a classe de defeito da L-038 (default resolvido em dois
lugares que divergem).

**B. `Gantt` como view do `Scheduler`.** Obrigaria `SchedulerEvent` a carregar `parent` e
`links` — poluir uma API publicada na v0.56.0 pra servir outro modelo de dados. O Scheduler é
centrado em evento; o Gantt em tarefa.

**C. `GanttCalendar` delegando pro `Scheduler`/`DatePicker`.** Foi minha recomendação
inicial e foi **descartada pelo mantenedor**, com razão melhor que a minha: cria acoplamento
por herança de propósito. Registrado em §5 com o preço que a escolha cobra.

**D. Recálculo automático de cronograma.** Mover A empurrar B, C, D em cascata é um
**solver**, não um componente de UI. Fora do escopo por princípio: o DS é dumb sobre mutação.

## 10. Assumption central

> **Que a cor no Gantt carrega CATEGORIA (qual frente), não ESTADO (qual status), e que
> status viaja em `trailing` como `Chip`.**

É o que permite `colorKey` usar a paleta de chart — inclusive azul, legítimo como dado
categórico e proibido na interface (`DESIGN.md`: *"the system has zero blue tokens"*).

**Falsificável:** se uma tela real precisar que a barra comunique status por cor **e**
categoria por cor ao mesmo tempo, a união fecha e a resposta passa a ser um segundo canal
visual (hachura, borda, ícone) — não mais chaves de cor. A união fechada torna essa ampliação
aditiva.

**Segunda assumption, menor:** que ≤5 categorias simultâneas bastam. Mesma da v0.56.0, mesmo
gatilho pra reabrir.

## 11. Fora do escopo da v1 — YAGNI declarado

- recálculo automático em cascata (§9-D)
- nivelamento de recursos
- calendário de dias úteis e feriados
- baseline (planejado vs real) — segundo eixo temporal por linha; entra se pedirem
- export MS Project / XML / imagem
- edição inline na grade esquerda
- múltiplos projetos na mesma instância

## 12. Superfícies (L-042 — as 8)

1. código em `src/components/ui/Gantt/`
2. `USAGE.md`
3. `.ai/context/components/inventory.md`
4. showcase — `GanttDoc.tsx` + `App.tsx` (import, render, `DOC_PAGES`) + `doc-nav-data.ts` + entrada no `ComponentsOverviewDoc`
5. `registry.json` — deps: `@dnd-kit/core`, `date-fns`, `lucide-react`; registryDeps: `@igreen/button`, `@igreen/chip`, `@igreen/popover`, `@igreen/tooltip`, `@igreen/tv`, `@igreen/utils`
6. vocabulário do consumidor — com a tabela de desambiguação da §2
7. changelog
8. barrel `src/components/index.ts`

**Zero pacote npm novo.** `@dnd-kit/core`, `date-fns@4`, `@tanstack/react-virtual` e Radix já
estão no `package.json` — verificado.

## 13. Riscos medidos, não presumidos

| Risco | Mitigação |
|---|---|
| Setas SVG recortadas pelo `overflow-hidden` dos painéis | camada SVG própria, irmã da grade, não filha da célula — é o defeito que o `DragOverlay` resolveu no Scheduler |
| Altura de linha divergindo entre painéis | uma constante, consumida pelos dois. Teste que compara os dois `getBoundingClientRect` |
| Grafo de vínculos com ciclo | detecção na ordenação topológica → callback de erro |
| Muitas linhas | `@tanstack/react-virtual`, já no repo. ⚠️ virtualizar **e** desenhar setas exige que a camada SVG conheça o offset virtual |
| Mobile | a grade esquerda + eixo não caben em 375px. **Declarar o limite** como o Scheduler faz, não fingir que cabe |

---

## Referências

Estrutura levantada de 13 referências visuais fornecidas pelo mantenedor + pesquisa:
[SVAR React Gantt v2.3](https://dev.to/olga_tash/svar-react-gantt-v23-modern-project-timelines-for-react-19-e7f) ·
[Atlassian](https://www.atlassian.com/agile/project-management/gantt-chart) ·
[monday.com](https://monday.com/blog/project-management/gantt-charts-with-dependencies/) ·
[Wrike](https://help.wrike.com/hc/en-us/articles/209604229-Task-Dependencies-on-the-Gantt-Chart) ·
[TeamGantt](https://support.teamgantt.com/article/8-dependencies/) ·
[ProjectManager](https://www.projectmanager.com/blog/gantt-chart-dependencies)

O HTML `gantt-ds-proposta.html` (necessidade do time) contribuiu quatro decisões que o
levantamento inicial não tinha: janela fixa controlada pelo consumidor, `continuesBefore`/
`continuesAfter`, `lanePacking`, e `colorKey` categórico em vez de semântico. As quatro
afirmações que ele faz sobre o DS foram verificadas e **todas conferem**.
