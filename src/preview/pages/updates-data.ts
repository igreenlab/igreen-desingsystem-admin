/**
 * updates-data.ts — Timeline de updates do iGreen Design System
 *
 * Como adicionar uma nova entry:
 *   1. Adicione um objeto ReleaseEntry NO TOPO do array RELEASES (mais recente primeiro)
 *   2. Use semver ou tag "preview" para versões em desenvolvimento
 *   3. Agrupe as mudanças por type ("added" | "changed" | "fixed" | "removed" | "improved" | "deprecated" | "breaking")
 *   4. Cada item da lista vai virar uma linha bullet na timeline
 *
 * Esse arquivo é fonte única — a página UpdatesDoc renderiza tudo automaticamente.
 */

export type ChangeType =
  | "added"
  | "changed"
  | "fixed"
  | "removed"
  | "improved"
  | "deprecated"
  | "breaking";

export type ReleaseTag = "preview" | "release" | "patch" | "milestone";

export interface ChangeGroup {
  type: ChangeType;
  items: string[];
}

export interface ReleaseEntry {
  /** Versão semver ou identificador de preview */
  version: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** Tag visual da release */
  tag: ReleaseTag;
  /** Título curto resumindo a release */
  title: string;
  /** Parágrafo opcional explicando o contexto */
  summary?: string;
  /** Lista de mudanças agrupadas por tipo */
  changes: ChangeGroup[];
}

/**
 * Adicione novas entries NO TOPO. Mais recente primeiro.
 */
export const RELEASES: ReleaseEntry[] = [
  {
    version: "0.20.0",
    date: "2026-06-28",
    tag: "release",
    title: "MenuSidebar: ícone opcional em bookmark section (atalhos)",
    summary:
      "Bookmark section item ganhou a prop opcional `icon?`. Quando presente, renderiza um ícone colorido (tingido com `color` via currentColor, sem caixa de fundo, ~12px — menor que o ícone de categoria) no lugar do dot. Ideal pra atalhos de ferramentas/integrações, combinando com `onAdd` (botão '+' no header da section) pra padrões tipo catálogo de plugins. Totalmente aditivo e retrocompatível: itens sem `icon` continuam com o dot redondo.",
    changes: [
      {
        type: "added",
        items: [
          "MenuSidebar: `SidebarBookmarkItem.icon?: LucideIcon` opcional — ícone colorido (currentColor via `color`, `size-icon-xs`/12px, sem fundo) no lugar do dot quando presente. Novo style `sidebarBookmarkIcon`.",
        ],
      },
      {
        type: "improved",
        items: [
          "MenuSidebarDoc: showcase de sections agora demonstra a variante bookmark com ícone + botão `onAdd` (\"+\"); USAGE e PROPS_DATA atualizados.",
        ],
      },
    ],
  },
  {
    version: "0.19.1",
    date: "2026-06-26",
    tag: "patch",
    title: "DataTable: autoFit deixa de ser congelado pelo persist",
    summary:
      "Fix do autoFit que não preenchia 'de novo' em tabelas com `persistId`. O persist estava salvando as larguras EFETIVAS (que já incluem o autoFit) como se fossem resize manual; no reload elas viravam `widthOverrides` (precedência máxima) e congelavam o layout — o autoFit nunca mais re-preenchia se o container mudasse. Agora o persist guarda SÓ o resize manual do usuário; o autoFit recalcula livre a cada carga. Schema do persist bumpado (v5) pra descartar os widths congelados já salvos.",
    changes: [
      {
        type: "fixed",
        items: [
          "DataTable: persist (workspace Default + saved views) guarda só o resize manual (`widthOverrides`), não as larguras efetivas com autoFit — antes congelava o layout e matava o autoFit no reload (sobrava espaço à direita 'de novo').",
          "DataTable: SCHEMA_VERSION do persist → v5 (invalida o state antigo com widths congelados; autoFit recalcula limpo na próxima carga).",
        ],
      },
    ],
  },
  {
    version: "0.19.0",
    date: "2026-06-26",
    tag: "release",
    title: "DataTable: listConfig.getPath — tabela paginada + lista em árvore",
    summary:
      "Complemento da view Lista: `listConfig.getPath` desacopla a árvore da LISTA do tree-data da TABELA. Antes, lista hierárquica exigia `getTreeDataPath`, que também ligava o tree-data na tabela e desligava a paginação. Agora dá pra ter tabela FLAT (paginada/ordenável) + lista em ÁRVORE no mesmo DataTable: passe `listConfig.getPath` (caminho raiz→self) e NÃO passe `getTreeDataPath`.",
    changes: [
      {
        type: "added",
        items: [
          "DataTable: `listConfig.getPath?: (row) => (string|number)[]` — caminho da árvore só pra view Lista, independente do `getTreeDataPath` (que liga tree-data na tabela). Fallback pro `getTreeDataPath` quando ausente. Permite tabela paginada + lista em árvore.",
        ],
      },
      {
        type: "changed",
        items: [
          "crud-builder (repo + CLI): nota de roteamento atualizada — `listConfig.getPath` pra tabela FLAT paginada + lista em ÁRVORE (vs `getTreeDataPath`, que liga tree-data na tabela). USAGE + DataTableDoc documentam a prop.",
        ],
      },
    ],
  },
  {
    version: "0.18.0",
    date: "2026-06-26",
    tag: "release",
    title: "DataTable: view Lista (toggle Tabela ↔ Lista)",
    summary:
      "Nova view no DataTable: `viewMode: \"list\"` + `listConfig`. Igual ao kanban, o DataTable mantém a MESMA toolbar (busca/filtros/views/ações/totalizadores) e só troca o corpo por uma lista de cards (`<List>` do DS) alimentada pelas rows processadas. O toggle Tabela/Lista aparece automático na toolbar quando há `listConfig`. Com `listConfig.hierarchical` + `getTreeDataPath`, a lista vira árvore (indentação/conectores + `depth` por nível). Showcase em `#/clients-list-view`.",
    changes: [
      {
        type: "added",
        items: [
          "DataTable: `viewMode: \"list\"` + `listConfig={{ renderItem, hierarchical?, defaultExpanded?, getMenuItems? }}` — 3ª view com toggle Tabela/Lista automático (e Kanban se `kanbanConfig`). Mesma toolbar; corpo vira `<List>` com as rows processadas.",
          "DataTable: lista em árvore via `listConfig.hierarchical` + `getTreeDataPath` (mesmo path do tree-data) — `renderItem(row, { depth, open })`.",
          "Showcase `#/clients-list-view` (ClientsListViewPreview) demonstrando o toggle.",
          "Tipos exportados: `DataTableListConfig`, `DataTableListRenderState`.",
        ],
      },
      {
        type: "changed",
        items: [
          "crud-builder (repo + CLI) + list-builder: roteamento atualizado — \"tabela + lista no mesmo lugar (toggle)\" usa `viewMode:\"list\"` do DataTable, não um `<DataList>` paralelo + toggle na mão.",
          "DataTable/USAGE.md: seção \"View Lista (table ⇄ list)\".",
        ],
      },
    ],
  },
  {
    version: "0.17.1",
    date: "2026-06-26",
    tag: "patch",
    title: "DataTable: footer compacto + autoFit fluido no 1º paint",
    summary:
      "Ajustes de consistência da tabela vindos do consumo real. O footer de totalizadores (`showTotalizers`) fica menor e semibold (`text-body-xs`/600) — hierarquia mais limpa, peso alinhado ao header. O `autoFit` passa a medir o container por content-box (`clientWidth`) já no primeiro paint, igual ao ResizeObserver — antes a 1ª medição usava border-box (incluía a scrollbar vertical) e as colunas saíam largas demais quando havia scroll-Y no mount (ex.: com `showTotalizers`). A skill `crud-builder` (repo + template do CLI) ganhou padrões explícitos de célula e de detail panel espelhando o exemplo Finance.",
    changes: [
      {
        type: "fixed",
        items: [
          "DataTable: footer (totalizers) agora `text-body-xs font-semibold` (12px/600) — antes `body-md`/500, pesado e destoante do header.",
          "DataTable: `autoFit` mede content-box (`clientWidth`) no 1º paint, alinhado ao `contentRect` do ResizeObserver. Corrige colunas largas demais quando há scroll-Y no mount (`showTotalizers`/altura forçada).",
        ],
      },
      {
        type: "changed",
        items: [
          'crud-builder (repo + CLI): padrões de CÉLULA explícitos (Avatar size="md", status/badges via <Chip soft pill sm>, coluna primária com avatar + nome + secundária + ícone abrir-detalhe, tabular-nums) e de DETAIL PANEL (FloatingPanel + Section por categoria + Field em lista) — espelhando o exemplo Finance como referência de consistência visual.',
        ],
      },
    ],
  },
  {
    version: "0.17.0",
    date: "2026-06-26",
    tag: "release",
    title:
      "Toolbar: slot de ações custom (button/dropdown/input) com colapso mobile",
    summary:
      "Novo slot de ações no toolbar do TableToolbar — exposto em DataTable (`toolbar.actions`) e DataList (`toolbarActions`). Aceita ações `button`, `dropdown` (ex.: seletor de período/mês) e `input`. No desktop renderizam inline (entre Filtros e ⋯); no mobile colapsam automaticamente num único ⋯ (no DataList, junto com os `moreActions`, via `extraItems`) pra manter a responsividade. Componente `<ToolbarActions>` exportado do TableToolbar. Exemplo vivo no showcase `#/list-standard` (seletor de Período).",
    changes: [
      {
        type: "added",
        items: [
          "TableToolbar: novo slot `actions` + componente `<ToolbarActions>` (tipos `ToolbarAction` / `ToolbarActionMenuItem`) — ações custom button/dropdown/input. Renderiza ANTES da busca (reload · ações · busca · filtro · …); dropdown aceita `hideChevron`.",
          "DataList: prop `toolbarActions` (colapsa no ⋯ no mobile junto com `moreActions`).",
          "DataList: chips de filtro aplicado agora são CLICÁVEIS — abrem o fast-filter do column-type pra editar o valor inline (paridade com o DataTable).",
          "DataTable: `toolbar.actions` (ToolbarAction[]) — inline no desktop, ⋯ próprio no mobile.",
          "Showcase: exemplo de seletor de Período (dropdown) no `#/list-standard`.",
        ],
      },
      {
        type: "changed",
        items: [
          "TableToolbar: novo `<ToolbarFilterButton>` (funil, icon-only) — fonte única do botão de Filtros, usado por DataTable e DataList (antes cada um montava o seu: DataList vinha com `SlidersHorizontal` + label 'Filtros'; DataTable com funil). Padroniza ícone/affordance no componente.",
        ],
      },
    ],
  },
  {
    version: "0.16.1",
    date: "2026-06-23",
    tag: "patch",
    title:
      "DataTable: actions sempre por último + auto-width robusto; crud-builder filtra todas as colunas",
    summary:
      'Correções vindas do consumo real via CLI. DataTable: a coluna type:"actions" agora ancora à direita e fica sempre por último na renderização por default (mesmo declarada no meio do array), com largura estreita fixa — e fica fora da distribuição flex do auto-width (antes podia esticar/empurrar o conteúdo). crud-builder (repo + template do CLI): reforço explícito de que todas as colunas de dados recebem enableColumnFilter (o funil só lista colunas filtráveis — antes a geração marcava só 2), que actions vai por último sem pinned/width, e que não se seta width nas colunas (autoFit distribui). Nota: o checkbox dos filtros está correto na fonte — se aparecer sem cor no consumidor, é cópia desatualizada → re-pull (igreen:add checkbox/data-table).',
    changes: [
      {
        type: "fixed",
        items: [
          "DataTable: coluna actions auto-ancorada à direita + sempre por último + largura estreita, e excluída do flex do auto-width (não estica mais nem empurra o conteúdo).",
          "crud-builder (repo + CLI): regra de coluna explícita — todas as colunas filtram (enableColumnFilter), actions por último sem pinned/width, sem width manual (autoFit distribui). Corrige 'filtra só 2 colunas' e '1ª coluna esticada'.",
        ],
      },
    ],
  },
  {
    version: "0.16.0",
    date: "2026-06-23",
    tag: "release",
    title: "Componente KPI (Kpi + KpiGroup + KpiDelta) + galeria de modelos",
    summary:
      "Novo componente template **KPI** composável: `Kpi` (card base — label + ícone por tone + valor + delta + hint + slot pra sparkline + footnote), `KpiGroup` (layout: `columns` 2–6 responsivo + `divided` = 1 card com divisórias) e `KpiDelta` (pílula de variação sobre o Chip, tom semântico + seta). 100% sobre tokens do DS (theme-aware). A doc `#/kpi` traz Primitivos (exemplos demarcados `kpi/<id>` pra referência), tabelas de API e uma seção **Examples** com 9 modelos prontos por categoria (inspirados em shadcnspace statistics-01/02/03/05, prints e o igreen-dashboard) — os que encaixam usam os primitivos, os mais específicos (brand/area, detail strip) são composição custom. Distribuído via `igreen:add kpi`.",
    changes: [
      {
        type: "added",
        items: [
          "Componente `Kpi` (`ui/Kpi`): `Kpi` + `KpiGroup` (columns/divided) + `KpiDelta`. Composável (slot pra sparkline via Chart), theme-aware. Doc `#/kpi` (Primitivos + API + Examples/9 modelos). Registry `igreen:add kpi`.",
        ],
      },
    ],
  },
  {
    version: "0.15.0",
    date: "2026-06-22",
    tag: "release",
    title: "Componente SingleMenuSidebar — navegação lateral de nível único",
    summary:
      "Nova sidebar template (App-level) como alternativa enxuta ao MenuSidebar: categoria → sub-itens em accordion (1 aberto por vez), sem rail nem múltiplos contextos. Seleção única (folha, sub-item ou pai aberto). Toggle + hover-to-expand (sem 'piscar' ao recolher). **Responsivo**: 100% da largura no mobile e some ao recolher (rail é só desktop). **Módulos com menu próprio** (`modules`): trocar no seletor atualiza o módulo ativo + as categorias. **Busca via Command** (⌘K) listando os itens do menu (customizável). 100% sobre tokens do DS, sem variantes. Showcase `#/single-menu-sidebar`; distribuído via `igreen:add single-menu-sidebar`.",
    changes: [
      {
        type: "added",
        items: [
          "Componente `SingleMenuSidebar` (`ui/SingleMenuSidebar`): navegação de nível único (accordion), seleção única, toggle + hover-to-expand, módulos com menu próprio (`modules`), busca via Command (⌘K, customizável) e rodapé de usuário com dropdown. Responsivo (100% no mobile, some ao recolher). Showcase `#/single-menu-sidebar` + registry (`igreen:add single-menu-sidebar`).",
        ],
      },
    ],
  },
  {
    version: "0.14.1",
    date: "2026-06-21",
    tag: "patch",
    title:
      "Mapa de Rede repaginado — card rico + conectores + filtros/abas/refresh",
    summary:
      "Polimento do exemplo Mapa de Rede (`#/mapa-rede` · `igreen:add example-mapa-rede`): muito mais dados (rede multi-raiz realista por regiões, ~30 consultores em vários níveis), card no estilo 'card rico' com ícones (GP, clientes, agregado da subárvore, região, última atividade) e graduação/PRO em chips. O nível (N1=líder, N2, N3…) vira um círculo neutro à esquerda — na altura de título+subtítulo —, no lugar do avatar de iniciais. Layout hierarchical com destaque de **conectores** (linhas de árvore), e toolbar completa: **abas** (visões PRO / Diretoria / Sudeste), busca, **filtros** (graduação / região / PRO) e botão de **refresh**. Painel de detalhe enriquecido (telefone, região, última atividade). Menu renomeado pra 'Mapa de Rede'.",
    changes: [
      {
        type: "improved",
        items: [
          "Exemplo Mapa de Rede: card rico (círculo de nível N1/N2/N3 + ícones + chips), conectores, mais dados (multi-raiz por região), abas/filtros/busca/refresh na toolbar e painel de detalhe enriquecido. Showcase + `example-mapa-rede` (registry) sincronizados.",
        ],
      },
    ],
  },
  {
    version: "0.14.0",
    date: "2026-06-20",
    tag: "release",
    title:
      "Componente DataList (lista inteligente) + builder de lista + tela Mapa de Rede",
    summary:
      "DataList é pro List o que o DataTable é pro Table: camada inteligente com toolbar enxuta (visões em ABAS · busca · filtros por campos com chips de filtro aplicado · ⋯), saved-views, persistência, seleção/bulk, server/async, virtualização ⊕ infinite-scroll, `fillHeight` (scroll no container, toolbar fixa) e — no layout hierarchical — `branchHighlight` (`none` conectores / `block` painéis aninhados / `active` ramo do último aberto), que destaca a 'família' em árvores grandes. Reusa o TableToolbar e o FilterModel da tabela. Acompanha 5 telas de exemplo (standard/grouped/hierarchical/selectable/card rico) + a tela **Mapa de Rede** (DataList hierárquico em árvore de consultores por níveis, estilo example-finance: AppShell + PageHeader + painel de detalhe + AlertModal). Distribuído via `igreen:add data-list` e `igreen:add example-mapa-rede`. Pipeline ganhou a skill irmã `list-builder` (`/ds-create-list`) + front-door `/ds-create-screen` que desambigua tabela-vs-lista, e os hooks de segurança foram reparados (estavam cegos no Windows).",
    changes: [
      {
        type: "added",
        items: [
          "Componente `DataList` (`ui/DataList`): toolbar (abas de visão · busca · filtros + chips · ⋯), saved-views, persistência, seleção/bulk, server/async, virtualização, infinite-scroll, `fillHeight`. Showcase `#/data-list` + registry (`igreen:add data-list`).",
          "`branchHighlight` no List/DataList hierarchical: `block` (painéis aninhados = 1 bloco por família) e `active` (só o ramo do último nó aberto recebe o painel + trilha) — pra não se perder em árvores grandes.",
          "5 telas de exemplo do DataList (standard · grouped+DnD · hierarchical · selecionável · card rico) + a tela **Mapa de Rede** (`#/mapa-rede` e `?app=mapa-rede`) — árvore de consultores por níveis. Exemplo distribuível `igreen:add example-mapa-rede`.",
          "Pipeline: skill `list-builder` + commands `/ds-create-list` e `/ds-create-screen` (front-door que desambigua tabela-vs-lista de cards), no repo e no consumidor (ds-kit roteia ambos).",
        ],
      },
      {
        type: "fixed",
        items: [
          "List hierarchical: guia (treeview) do último nó não era desenhada (off-by-one no connector, mascarado nos roots não-últimos) — corrigido (L-045). Nós-folha não reservam mais espaço de chevron.",
          "Hooks de segurança do pipeline estavam cegos (jq ausente + path Windows com `\\`) → rodavam mas pulavam tudo; reparados com fallback node + normalização de separador (L-044).",
        ],
      },
      {
        type: "improved",
        items: [
          "Lições L-044..L-048 + auditoria do pipeline (rede de segurança, DoD de skill builder).",
        ],
      },
    ],
  },
  {
    version: "0.13.0",
    date: "2026-06-20",
    tag: "release",
    title:
      "Componente List (cards) — standard / grouped+DnD / hierarchical + shadows dark-aware",
    summary:
      'Novo primitivo de listagem em cards `List` (como o `Table` é o primitivo de tabela; a versão com toolbar/busca/filtros, `DataList`, vem depois). 3 layouts: standard (lista plana), grouped (seções colapsáveis com drag-and-drop via @hello-pangea/dnd, físico/suave, + painel por grupo via `groupSurface`) e hierarchical (árvore-como-lista colapsável com linhas de conexão contínuas e contagem por nível, entidades mistas). Conteúdo do card por slots (leading/title/subtitle/description/meta-colunas/trailing) ou `renderItem` (cards ricos — ex.: orders com avatares, meta com ícones e footer de progresso). Seleção e colapso controlados-ou-não; DnD burro (emite onMove/onReorder, consumer commita). Registrado no registry (`igreen:add list`). Inclui um fix FOUNDATIONAL de elevação: as sombras agora são dark-aware de verdade — antes o Tailwind v4 inlinava o valor light na utility e o `.dark` não pegava (md virava um "halo claro"); agora via `@theme inline` + indireção (L-043), corrigindo o dark em todo o DS.',
    changes: [
      {
        type: "added",
        items: [
          "Componente `List` (`ui/List`): 3 layouts (standard · grouped+DnD · hierarchical), card por slots ou `renderItem`, seleção/colapso controlado-ou-não, estados loading/empty, densidade. Showcase `#/list` + registry (`igreen:add list`).",
          "Layout grouped: drag-and-drop com @hello-pangea/dnd (displacement suave + placeholder), realce da dropzone e elevação do card; `groupSurface` (painel por grupo).",
          "Layout hierarchical: árvore-como-lista com colapso, linhas de conexão contínuas e indicador de quantidade por nível.",
        ],
      },
      {
        type: "fixed",
        items: [
          'Shadows dark-aware (FOUNDATIONAL): Tailwind v4 inlinava o valor light da sombra na utility, então `.dark { --shadow-* }` não tinha efeito (md = "halo claro" no dark). Corrigido via `@theme inline` + vars de indireção `--ds-sh-*` em :root/.dark (L-043). Afeta todo componente que usa `shadow-sh-*` no dark.',
        ],
      },
      {
        type: "improved",
        items: [
          "Pipeline: lição L-043 (gotcha de shadow no Tailwind v4) + resumo em ds-standards.",
        ],
      },
    ],
  },
  {
    version: "CLI 0.13.7 + pipeline",
    date: "2026-06-19",
    tag: "patch",
    title:
      "Toast no catálogo do CLI + garantia de completude das superfícies do componente (L-042)",
    summary:
      "Fecha os gaps que apareceram logo após o lançamento do Toast (v0.12.0). O catálogo que o CLI injeta nos projetos scaffoldados passou a listar o `toast` (CLI republicado 0.13.7) — antes, um projeto novo não sabia que o componente existia. E o pipeline ganhou uma garantia para a IA prever TODAS as superfícies de um componente novo, não só código+USAGE: o hook `ds-inventory-check` agora acusa, na hora da edição, quando o componente está no registry mas fora do catálogo do CLI, ou quando a DocPage existe mas não está registrada no `App.tsx`/`DOC_PAGES`+nav (o clássico render em branco). Mais a tabela “Definição de Pronto” (7 superfícies) no handoff e a lição L-042. Defesa em profundidade: hook na edição → checklist no fechamento → pre-commit/release antes de distribuir.",
    changes: [
      {
        type: "improved",
        items: [
          "Hook `ds-inventory-check`: além de USAGE/inventory/registry, agora acusa (1) componente no registry mas fora do catálogo do CLI e (2) DocPage criada sem rota no `App.tsx`/`DOC_PAGES`+nav (render em branco). Cobre 5 das 7 superfícies automaticamente, na edição.",
          "Skill `handoff-pr`: tabela “Definição de Pronto” com as 7 superfícies de um componente (código · USAGE · inventory · showcase · registry · catálogo CLI · changelog) + cadência (1–4 no PR; 5/6/7 no /ds-release). L-042.",
          "`pre-commit-check` e `release` passam a cobrar o catálogo do CLI (qualquer toque em `cli/**` → bump + publish).",
        ],
      },
      {
        type: "fixed",
        items: [
          "Toast ausente no catálogo do CLI: adicionado aos composites + nota em Feedback; CLI republicado (`@snksergio/create-design-system` 0.13.6 → 0.13.7). Projetos novos agora conhecem o `toast`.",
        ],
      },
    ],
  },
  {
    version: "0.12.0",
    date: "2026-06-19",
    tag: "preview",
    title:
      "Componente Toast (card sobre o Sonner) + política de USAGE pro shadcn",
    summary:
      "Novo composto `Toast` (ui/Toast) que consome o Sonner via `toast.custom` — mantém todo o nativo (agrupamento, empilhamento, slide, swipe, posições) e adiciona uma API ergonômica: `toast.success/.error/.warning/.info({ title, description, icon, action, cancel, onClose, meta })` + neutro `toast({...})`. O status muda SÓ o icon-chip (bg fraco `-muted` + ícone forte `fg-*`) — o card continua neutro (surface), com texto de alto contraste. Layout em coluna: linha principal centralizada (ícone · título+descrição · meta/ação-inline/close) e, quando há 2 botões, rodapé à direita com gap 4px. Registrado no registry (consumível via `igreen:add toast`). O Sonner volta ao neutro (a 1ª tentativa de tingir o toast inteiro por status foi revertida). Pipeline: índice único `shadcn/USAGE.md` (só gotchas, não 1 arquivo por primitivo) + regra de quando documentar, e garantia de handoff via PR no fluxo de componente (Regra 8 / L-041).",
    changes: [
      {
        type: "added",
        items: [
          "Componente `Toast` (`ui/Toast`): card de notificação sobre o Sonner via `toast.custom`. API espelha o Sonner (`toast.success/.error/.warning/.info({...})` + neutro), props `title/description/icon/action/cancel/onClose/meta`, passthrough de `promise/dismiss/custom/loading`. Showcase `#/toast` com preview estático (anatomia) + exemplos vivos. Registrado no registry (`igreen:add toast`).",
          "Índice `src/components/shadcn/USAGE.md`: doc única de gotchas dos primitivos shadcn (setup no root, dep extra, receita flutuante, z-index) — em vez de 1 USAGE por arquivo.",
        ],
      },
      {
        type: "changed",
        items: [
          "Sonner revertido pro neutro: o status volta a trocar SÓ o ícone (sem tingir fundo/borda do toast inteiro). Cards ergonômicos/coloridos agora são feitos pelo composto `Toast`.",
          "Toast — status no icon-chip: bg fraco (`bg-{status}-muted`) + ícone forte (`fg-{status}`); superfície neutra; texto `fg-default` (alto contraste em light/dark).",
        ],
      },
      {
        type: "improved",
        items: [
          "Pipeline — política de USAGE pro shadcn: `impl-shadcn` (decisão “tem gotcha? 1 linha : nada”), `pre-commit-check` (valida cobertura + reprova USAGE por-arquivo) e `ds-standards` (regra auto-carregada).",
          "Pipeline — handoff via PR garantido no fluxo de componente (Regra 8 / L-041): branch + commit descritivo + PR no mirror + link pro gate humano; a IA para no merge. Skill `ds-dev/handoff-pr` + commands de componente + orchestrator.",
        ],
      },
    ],
  },
  {
    version: "0.11.0",
    date: "2026-06-19",
    tag: "milestone",
    title:
      "Expansão do catálogo: 16 componentes shadcn + ícones de marca + padronização dos flutuantes",
    summary:
      "Maior expansão de componentes do DS. Fecha as lacunas do catálogo shadcn com 16 primitivos/compostos novos (Tooltip, Skeleton, Sonner, Collapsible, Scroll Area, Date Picker, Toggle, Toggle Group, Input OTP, Context Menu, Hover Card, Menubar, Navigation Menu, Carousel, Aspect Ratio, Drawer) — todos tokenizados iGreen, documentados no showcase e registrados no registry (consumíveis via `igreen:add`). Documenta Combobox e Sheet (já existiam sem doc). Adiciona o set de ícones oficiais de marca `igreen-*` (9: green/livre/placas/club/solar/telecom/licenciado/seguro/clientes) com suporte a multi-path no Icon. Corrige bugs estruturais: alinhamento header/footer da DataTable por column-type (L-038), borda branca/preta no Tailwind v4 (L-039) e padroniza TODOS os flutuantes na receita única do DS (L-040). Pipeline reforçado pra não reincidir (lessons + ds-standards + skills crud/impl-shadcn).",
    changes: [
      {
        type: "added",
        items: [
          "16 componentes shadcn tokenizados + DocPages + registry: Tooltip, Skeleton, Sonner, Collapsible, Scroll Area, Date Picker, Toggle, Toggle Group, Input OTP, Context Menu, Hover Card, Menubar, Navigation Menu, Carousel, Aspect Ratio, Drawer.",
          "DatePicker composto (`ui/DatePicker`): Popover + Calendar + trigger estilo input do DS.",
          "Ícones oficiais de marca `igreen-*` (9) no componente Icon, com suporte a multi-path (`igreen-club`).",
          "Docs de showcase pra Combobox e Sheet (componentes que já existiam sem documentação).",
        ],
      },
      {
        type: "fixed",
        items: [
          "DataTable: alinhamento de header/footer não herdava o `defaultAlign` do column-type (currency/number/percentage saíam desalinhados no consumidor) — resolvido na fonte única `effectiveColumns` (L-038).",
          "Borda branca/preta no Tailwind v4: classe `border` crua = só largura → `currentColor`; trocada por `border-border-default` nos flutuantes (L-039).",
        ],
      },
      {
        type: "changed",
        items: [
          "Padronização dos componentes flutuantes (Context Menu, Menubar, Navigation Menu, Hover Card) na receita única do DS (bg-bg-dropdown frosted + border-default + radius 12 + shadow-lg + outline-float; itens/separator/label/shortcut por token) — consistência com DropdownMenu/Popover (L-040).",
          "Tooltip e Hover Card: delay default reduzido (200ms) — o default do Radix (700ms) era lento.",
          "Skill crud-builder reforçada: força perguntar colunas + oferecer views; + estados (loading/vazio/sem-resultado), confirmação de exclusão, campos do form e views do usuário.",
        ],
      },
      {
        type: "improved",
        items: [
          "Pipeline anti-reincidência: lições L-038/L-039/L-040 (lessons.md + ds-standards.md auto-carregada) + skill impl-shadcn (exceções de borda e receita de flutuante).",
          "Pipeline garante handoff via PR (L-041 / Regra 8): todo trabalho de componente fecha com branch + commit descritivo + PR no mirror + link pro gate humano; a IA para no merge (merge/publish só autorizado). Nova skill `ds-dev/handoff-pr` + commands de componente + orchestrator atualizados.",
        ],
      },
    ],
  },
  {
    version: "CLI 0.13.1",
    date: "2026-06-18",
    tag: "patch",
    title: "Tela inicial do scaffold redesenhada + tema “Sistema”",
    summary:
      "Refino da experiência de primeiro contato no projeto scaffoldado pelo `@snksergio/create-design-system`. A tela de boas-vindas passa a usar `PageHeader` (no mesmo modelo das páginas de exemplo), ganha seção de tokens de cor (swatches que trocam sozinhos light/dark), bloco de prompt de bootstrap copy-paste pra dar contexto à IA, e a vitrine do kit de construção (ds-kit + crud-builder + skills + protect-ds). Os prompts viram lista (1 coluna) e o “Como funciona” vira timeline vertical — leitura mais harmônica. O App gerado passa a oferecer o tema “Sistema” (default, segue `prefers-color-scheme`): quem usa o SO em dark abre o scaffold em dark (antes nascia branco). Inclui também o fix do `--overwrite` no `igreen:add`/`igreen:update` (sem mais prompt interativo travando a instalação de exemplos/tabelas/cruds).",
    changes: [
      {
        type: "added",
        items: [
          "Tema “Sistema” no App gerado (`Theme = light|dark|system`, default `system`) com observer de `prefers-color-scheme` — OS dark abre o scaffold em dark.",
          "Tela inicial: seção “Cores do sistema” (swatches de tokens semânticos), bloco de prompt de bootstrap pra IA e vitrine do kit (ds-kit, crud-builder, skills, protect-ds).",
        ],
      },
      {
        type: "improved",
        items: [
          "Welcome consome `PageHeader` (+ Badge) no padrão das páginas de exemplo; prompts em formato de lista; “Como funciona” em timeline vertical; espaçamentos calibrados (gap entre seções, título↔subtítulo justos) e padding de página (cards não cortam nas bordas).",
        ],
      },
      {
        type: "fixed",
        items: [
          "`igreen:add`/`igreen:update` passam `--overwrite` ao `shadcn add` → fim do prompt interativo `overwrite? (y/N)` que travava a instalação de exemplos/tabelas/cruds com deps compartilhadas.",
        ],
      },
    ],
  },
  {
    version: "0.10.0",
    date: "2026-06-17",
    tag: "milestone",
    title:
      "Distribuição completa: registry + CLI + kit de construção no consumidor",
    summary:
      "Marco da distribuição. O DS vira consumível ponta-a-ponta: registry shadcn privado (copy-in) com 56 itens — incl. 6 telas-exemplo extraídas 1:1 dos showcases (clientes, finance, dashboard, order-detail, edit-page, chat) — + o CLI `@snksergio/create-design-system` que scaffolda projeto pronto (banner, tela de boas-vindas/tutorial, exemplos navegáveis no menu) + um KIT embutido no consumidor (orquestrador `ds-kit` + skills crud-builder/page-edit/page-detail/dashboard/charts/chat/drawers/cards + DESIGN.md + regras auto-carregadas) pra IA montar telas por intenção. Integridade protegida por hook. Pipeline do DS ganha cobertura (hooks de registry/tokens, drift-check examples↔showcase, CI) e o bug do DataTable (react-virtual ausente no item) foi corrigido.",
    changes: [
      {
        type: "added",
        items: [
          "Registry shadcn privado completo (56 itens) + 6 telas-exemplo (`example-clientes/finance/dashboard/order-detail/edit-page/chat`) extraídas 1:1 dos showcases (conteúdo de página, sem shell).",
          "CLI `@snksergio/create-design-system`: banner, tela de boas-vindas/tutorial, prompt pra instalar exemplos no menu, AppShell com hash-routing. Fontes Geist embutidas no template.",
          "Kit de construção no consumidor (`.claude/`): orquestrador `ds-kit` (intenção→rota), skills focadas (crud-builder, page-edit, page-detail, dashboard, charts, chat, drawers, cards), `DESIGN.md` enxuto, regras auto-carregadas e hook `protect-ds` (bloqueia edição de tema/tokens/fundação).",
          "Pipeline DS: `registry-check.mjs` (consistência paths+embed), `examples-drift-check.mjs` (examples↔showcase), CI GitHub Actions (tsc+test+consistência+drift), hooks `ds-tokens-check` e cobertura de registry no `ds-inventory-check`.",
        ],
      },
      {
        type: "fixed",
        items: [
          "Item `@igreen/data-table` não declarava `@tanstack/react-virtual` → DataTable crashava (Invalid hook call) em consumidor limpo. Corrigido.",
          "Template do CLI: fonte Geist não carregava (caía em system-ui) — `@font-face` + woff2 + `--font-sans` adicionados.",
        ],
      },
      {
        type: "improved",
        items: [
          "Auditoria de saúde: remoção de órfão (ChartComingSoonDoc), docs de path corrigidas, `TabelaTeste` fora do barrel público, placeholder do registry-add-item.",
        ],
      },
    ],
  },
  {
    version: "0.9.0",
    date: "2026-06-11",
    tag: "release",
    title:
      "Responsividade mobile + CRUD builder + filtros boolean/select robustos",
    summary:
      "Consolidação pós-0.8.0. A DataTable e o app shell ganham comportamento mobile de primeira classe (menu drawer, default tabela com toggle de exibição, paginação/chips/busca adaptados); o Header passa a usar Popover (vira bottom-sheet no mobile); e os filtros de chip boolean/select foram refeitos pra abrir, posicionar e fechar corretamente. Soma o construtor guiado de telas CRUD (skill crud-builder + /ds-create-crud), o showcase ClientesFinanceiro reformulado (CRUD + Kanban) e a sincronização ampla de docs (inventory + 19 USAGE + lições L-029..L-031).",
    changes: [
      {
        type: "added",
        items: [
          "Skill `crud-builder` + comando `/ds-create-crud` — entrevista guiada que gera tela CRUD/tabela consumindo a DataTable.",
          'DataTable: toggle **"Exibição" (Linhas/Cards)** no mobile via nova prop `mobileDisplayToggle` da ToolbarSettingsMenu — usuário força tabela ou cards abaixo do `cardBreakpoint`.',
          "Showcase ClientesFinanceiro reformulado: CRUD completo + Kanban + `EditarFinanceDrawer` com campos reais da row (selects, chips, switch).",
          "README: tutorial de como produzir telas e CRUDs com IA usando o DS como subprojeto.",
        ],
      },
      {
        type: "changed",
        items: [
          "DataTable no mobile: **default agora é tabela** (antes virava card automaticamente) — densidade primeiro; cards viram opção via toggle.",
          "Header: notificações e mensagens migradas de dropdown custom pra `<Popover>` do DS — viram bottom-sheet no mobile (`mobileSheet`).",
          "Fast-filter de chip boolean/select renderiza lista direta (`FastSingleSelectList`) em vez de `<Select open>` aninhado — posiciona certo e fecha no clique-fora (L-029).",
          "Mobile-sheet (Popover/DropdownMenu) sobe pra z-60 (wrapper) + z-[55] (backdrop); DropdownMenu dentro de drawer usa `modal={false}` — corrige menu que abria atrás/sumia (L-030, L-031).",
        ],
      },
      {
        type: "fixed",
        items: [
          "Filtro boolean: valor selecionado não aparecia (boolean cru → Radix Select exige string, `toBoolStr()`) e o popover do chip não fechava — ambos resolvidos.",
          "AppShell: menu mobile abre no hambúrguer e ocupa 100vw×100vh.",
          "Menu do usuário (avatar) abre de forma confiável no mobile — corrida open/close do modo modal do Radix.",
          "Calendar: dias alinhados com as colunas dos weekdays (`flex-1`).",
          "Mobile: busca dá blur no Enter/Esc, chips de filtro com scroll horizontal, paginação centralizada com range oculto, multiSelect sem mobileSheet.",
          "Pinned/sticky cell: bg correto no hover/seleção (token sólido, sem vazar conteúdo) + afordância de abrir detalhe; footer com menos padding.",
          "Query builder: purga linha em branco ao fechar e o badge conta só filtros ativos.",
        ],
      },
      {
        type: "improved",
        items: [
          "Docs sincronizados com o código: inventory + 19 USAGE.md (auditoria v0.8.0), depois USAGEs (Header/TableToolbar/DataTable) + lições L-029/L-030/L-031 dos novos patterns de fast-filter e overlays mobile.",
        ],
      },
    ],
  },
  {
    version: "0.8.0",
    date: "2026-06-09",
    tag: "release",
    title:
      "DataTable + TableToolbar: toolbar opinionated canônica + auditoria profunda (premium/escalável)",
    summary:
      "Release de consolidação do par DataTable + TableToolbar. A `<TableToolbar>` opinionated (busca + filtros + ações + views) passa a ser a CANÔNICA — vira o default integrado ao DataTable e a versão antiga (dumb) foi removida junto com os opt-outs. Em cima disso, uma auditoria profunda (5 revisores) tornou o componente premium/escalável: vocabulário de operador único ponta a ponta, ponto de extensão único via columnTypeRegistry, dedup de utils triplicados, SQL parser round-trip-safe e a row memoizada como barreira de re-render. Breaking em 0.x: as props `deprecatedToolbar` e `simpleFilter.enabled` foram removidas — o default novo já cobre o caso.",
    changes: [
      {
        type: "added",
        items: [
          "`<TableToolbar>` opinionated integrada ao DataTable — busca, controle de filtros (split button: drawer simples + query builder avançado), ações em massa e saved views num único componente. DataTable consome via 1 wire; consumers standalone usam direto.",
        ],
      },
      {
        type: "changed",
        items: [
          "A `<TableToolbar>` opinionated agora é a CANÔNICA (default). A versão antiga (dumb/sem opinião) foi renomeada e depois removida — não há mais escolha por prop; o DataTable renderiza a opinionated direto.",
          'Vocabulário de operador de filtro UNIFICADO — ids longos (`equals`/`contains`/`isAnyOf`/`between`/…) ponta a ponta, do FilterModel ao chip. O dual-namespace curto↔longo (`utils/operator-mapping.ts`, eq↔equals) foi DELETADO. Resolve a classe de bug do operador "É" resetar pra "contém".',
          "Operador default de cada filtro agora é DERIVADO do `columnTypeRegistry` (`registry.get(typeId).operators[0]`) em vez de switch hardcoded por filterType — adicionar tipo de coluna/filtro novo não exige mais editar a inferência.",
          "`filterType` virou união ABERTA (`string & {}`) — consumers registram tipos custom no registry sem alterar o union fechado do core.",
          "`gte`/`lte` implementados em number/currency/percentage/date/datetime + no SQL parser (antes só gt/lt).",
        ],
      },
      {
        type: "improved",
        items: [
          "Consolidação de utils internos do DataTable: `utils/filter-ops.ts` (`genFilterId`, `filterValueIsEmpty`, `promoteOperatorForColumn` — eram triplicados/quadruplicados), `utils/aggregate.ts` (`computeAggregate`/`renderAggregate`), `utils/resolve-value.ts` (dot-path) e `data-table.constants.ts` (breakpoint, overscan, larguras, density heights) centralizados.",
          "`column-types/_shared.ts` — `toNumber`, helpers de data e `resolveChipColor` extraídos (dedup entre os tipos de coluna). Diferenças reais de normalize/operators/renderCell preservadas (sem factory prematura).",
          "Naming/consistência dos hooks SRP: `*Return` → `*Result`, `exportHook` → `exporter`, return types explícitos e fronteira standalone documentada nos `useToolbar*`.",
          "SQL-like filter parser reescrito ROUND-TRIP-SAFE — bracket syntax pra operadores de lista/intervalo (`in [a,b]`, `between [x,y]`); `parseSqlFilter`/`entriesToSql` preservam o modelo ida-e-volta (12/12 casos).",
          "Perf: `<DataTableRow>` memoizada (`React.memo` + latest-ref pattern) — vira barreira de re-render. Foco em outra row, abrir popover ou refresh não repintam rows não-afetadas. Handlers via ref estável lidos no call-time evitam stale closure (L-028).",
        ],
      },
      {
        type: "removed",
        items: [
          "`TableToolbarDeprecated/` (componente + branch `deprecatedToolbar` + DocPage) — ~1.700 LOC duplicadas eliminadas.",
          "Prop `deprecatedToolbar` do `DataTableProps` (opt-out da toolbar antiga — não há mais toolbar antiga).",
          "Sub-prop `simpleFilter.enabled` — o split button de filtros agora é sempre o comportamento da toolbar canônica (dead-code do flag removido).",
          "`utils/operator-mapping.ts` — mapa curto↔longo de operador (vocabulário agora é único).",
        ],
      },
      {
        type: "breaking",
        items: [
          "Quem passava `deprecatedToolbar` no DataTable: remover a prop — o default agora é a toolbar opinionated (que já cobre o caso da antiga).",
          "Quem passava `simpleFilter={{ enabled: true }}`: remover o `enabled` — o controle de filtros split button é o padrão da toolbar canônica.",
        ],
      },
    ],
  },
  {
    version: "0.7.1",
    date: "2026-06-09",
    tag: "preview",
    title:
      "Mobile sheet nos overlays + CardCheckbox + token formGap + Avatar WCAG + showcase Financeiro",
    summary:
      "Release que padroniza o comportamento mobile (<md) dos overlays como sheet bottom-up colado nas bordas do device (Panel, FloatingPanel e DropdownMenu), adiciona deep-linking via hash no preview, o componente `<CardCheckbox>`, o token `formGap` (gap-form-gap), o util `getContrastTextColor` (contraste WCAG no Avatar) e a tela exemplo standalone ClientesFinanceiroShowcase. Bump também faz o catch-up do package.json (estava em 0.6.0, atrás da timeline que já tinha 0.7.0).",
    changes: [
      {
        type: "added",
        items: [
          'Componente `<CardCheckbox>` em `src/components/ui/CardCheckbox/` — checkbox apresentado como card clicável (área grande, label + description visíveis, ícone opcional à esquerda). Mesma estética dos radio cards (bg-success-muted + border-brand no selected). `<label htmlFor>` nativo wrap (não `<button>`) preserva acessibilidade + form integration (L-025). Uso atual: SacarDialog aba "Outra conta".',
          "Token `formGap` (20px = scale[5]) em `tokens/.../components/spacing.ts` → CSS var `--spacing-form-gap` → classe `gap-form-gap`. Spacing dedicado entre FormField units em forms/drawers/modais (vertical ou grid 2-col). Substitui o uso ad-hoc de `gap-gp-lg`/`gap-gp-xl` (L-024).",
          "Util `getContrastTextColor(hex)` em `src/utils/color-contrast.ts` — calcula `white` vs `black` por luminância + contrast ratio WCAG 2.x. Pra componentes com bg dinâmico/externo (lookup de marca, persona, status custom).",
          "Prop `mobileSheet` em `DropdownMenuContent` (default `true`) — em telas <md o menu vira sheet bottom-up colado nas bordas, full-width, com backdrop suave (toque fora fecha via dismiss do Radix). Wrapper do Radix Popper reposicionado via globals.css (`[data-radix-popper-content-wrapper]:has([data-mobile-sheet])`). `false` mantém popover ancorado no trigger.",
          "Deep-linking no preview app (`App.tsx`) — a navegação sincroniza com a URL via hash (`#/<id>`): `pushState` por página, `popstate`/`hashchange` pra back/forward + edição manual, init valida o hash contra a lista de páginas. Sem libs novas; funciona com o build estático do Vite.",
          'Tela exemplo `ClientesFinanceiroShowcase` (standalone via `?app=finance`) — KPIs no pattern Dashboard, tabela financeira, `SacarDialog` (saldo + form "Outra conta") e 2 preset views (Digitais · Alto valor ≥ R$ 5k).',
        ],
      },
      {
        type: "improved",
        items: [
          "Panel + FloatingPanel: em mobile (<md) viram sheet bottom-up colado nas bordas do device — flush nas laterais + bottom, só cantos superiores arredondados (`rounded-b-none`), sem outline/shadow, `max-height: 92vh`. Body com `min-h-0` (scroll automático robusto, header/footer fixos). FloatingPanel ganha backdrop suave (`md:hidden`, desktop segue non-modal); Panel já tinha backdrop modal (SheetOverlay) e agora tem `slideAnimation` responsivo (direcional no desktop, bottom-up no mobile).",
          "Footer fluido em Panel + FloatingPanel — `flex-wrap` + `[&>*]:flex-1 [&>*]:min-w-[140px]`: botões crescem lado a lado e empilham quando não cabem. Não precisa passar `fullWidth` nos Buttons.",
          "Avatar: cor de texto sobre `colorHex` agora é escolhida por contraste WCAG via `getContrastTextColor` (era `text-white` cego). Caso real: BB #FAE128 + branco = 1.29:1 (fail AA) → agora preto 16.3:1 (AAA). Migração das avatares de banco (L-027).",
        ],
      },
      {
        type: "fixed",
        items: [
          "Panel mobile: removido `inset-y-auto` que o `tailwind-merge` tratava como superset de `bottom` e zerava a âncora `bottom-0` — o painel colapsava sem âncora vertical. `top-auto` + `bottom-0` já sobrescrevem o `inset-y-pad-4xl` do desktop via media query.",
          'Table: header right-aligned só reserva `pr-[60px]` quando sort ativo (era sempre que `sortable || headMenu`, deslocando o texto de colunas `align="right"` como Saldo). Ícones hover-only usam stack absolute mascarado. Coluna `actions` 40px (L-026).',
          "DropdownMenu: backdrop renderizado em Portal próprio — cada Portal Radix aceita 1 filho (Presence/Slot), evitando `React.Children.only`.",
          'SacarDialog: form "Outra conta" usa `<FormField>` do DS em vez de `<label>` raw — peso/cor corretos e dark-mode-aware (L-023). Saldo maior + label strong.',
        ],
      },
    ],
  },
  {
    version: "0.7.0",
    date: "2026-06-08",
    tag: "preview",
    title:
      "ButtonGroup + DataTable simpleFilter (opt-IN) — split button com drawer lateral + advanced popover",
    summary:
      "2 features grandes. (1) Novo componente `<ButtonGroup>` — split button (Primary + Chevron) que usa o `<Button>` próprio do DS via composição. (2) DataTable ganha prop opt-IN `simpleFilter` que transforma o botão Filtros em split button: Primary abre drawer lateral com lista vertical de TODOS os filtros (aplicação LIVE, operator inferido do filterType); Chevron abre o query builder avançado (FilterPopover atual). TableToolbar passa a ser o dono completo do controle de filtros via novo `<ToolbarFilterControl>` (parts/) + `useToolbarFilterControl` (hooks/) + `<ToolbarSimpleFilterDrawer>` (parts/). DataTable consome via 1 componente, sem montar manualmente. Default OFF mantém compatibilidade 100% com consumers atuais.",
    changes: [
      {
        type: "added",
        items: [
          "Novo componente `<ButtonGroup>` em `src/components/ui/ButtonGroup/` — compound `<Primary>` + `<Chevron>`. Wrapper inline-flex com radius colapsado entre slots. Chevron quadrado (size-form-*) alinhado com altura do Primary. color/variant/size propagam via Context; override individual permitido via prop. ChevronDown default; customizável via `icon` prop. `aria-label` obrigatório no Chevron (TypeScript enforça — icon-only requer descrição). Page de docs em `/button-group` com 8 examples cobrindo Variants/Colors/Sizes/Disabled/Loading/Custom icon/Override.",
          "Prop `simpleFilter?: { enabled, hiddenFields, title, size }` no `DataTableProps` — opt-IN (default false). Quando `enabled: true`, o botão Filtros vira split button (ButtonGroup) com Primary abrindo drawer lateral `<ToolbarSimpleFilterDrawer>` e Chevron abrindo `<FilterPopover>` advanced. Drawer renderiza lista vertical com TODOS os filtros (1 linha por coluna, widget do registry, aplicação LIVE sem botão Aplicar). Operator inferido do filterType (multiSelect → isAnyOf, text → contains, etc). `hiddenFields` permite ocultar filtros que só fazem sentido no advanced.",
          "Novo `<ToolbarFilterControl>` em `src/components/ui/TableToolbar/parts/toolbar-filter-control.tsx` — orquestrador único de filtros. Encapsula ButtonGroup + ToolbarSimpleFilterDrawer + FilterPopover via composição. DataTable consome 1 componente em vez de montar manualmente. Consumers de TableToolbar standalone podem usar diretamente. State via `useToolbarFilterControl` (interno por default; consumer pode passar `controlState` externo pra deep-link/programatic).",
          "Hook `useToolbarFilterControl` em `TableToolbar/hooks/` — encapsula state dos 2 modos (simpleDrawerOpen + advancedPopoverOpen) com handlers `openSimple()` / `toggleAdvanced()` / `closeAll()`. Importado standalone pra consumer customizar abertura programaticamente (atalho teclado, query param, etc).",
          'Componente `<ToolbarSimpleFilterDrawer>` em `TableToolbar/parts/` — drawer FloatingPanel side="right" com lista vertical de filtros. Aplicação LIVE (cada toggle atualiza filterModel direto). Operator inferido inline via switch do filterType. Preserva posição original dos items no array (reconstrução in-place — não empurra pro fim ao editar).',
          "Nova prop `anchor?: ReactNode` em `FilterPopover` — posiciona o popover sem disparar abertura via click. Usado pelo split button (popover controlled via state). Resolve race condition do PopoverTrigger asChild + ButtonGroup wrapper. Quando `anchor` undefined, mantém `trigger` como PopoverTrigger padrão.",
        ],
      },
      {
        type: "fixed",
        items: [
          "ButtonGroupRoot agora usa `forwardRef` — necessário pra Radix `PopoverAnchor asChild` conseguir obter o DOM node ref. Sem isso, popover ficava posicionado em top=-506 (fora do viewport).",
          "Chevron do ButtonGroup agora é QUADRADO (width = height alinhado com size-form-*) — antes era width compacta (~32px no md) que ficava acanhado vs altura 40px do Primary. Pattern alinhado com Shadcn/Linear/Notion.",
          "Drawer `<ToolbarSimpleFilterDrawer>` ganhou padding interno `px-[18px] py-[14px]` alinhado com header/footer do FloatingPanel. O body do FloatingPanel é genérico (sem padding default); cada consumer define o seu.",
          "Gap entre filtros no drawer aumentado de gp-xl (12px) pra gp-2xl (16px) — campos respiram visualmente sem inflar demais a altura do drawer.",
          'Altura do ButtonGroup no DataTable alinhada com ToolbarToolButton (size="md" = 40px) — antes estava sm (36px) e gerava discrepância visual com Exportar/Ordenar/Cols na toolbar.',
        ],
      },
      {
        type: "changed",
        items: [
          "DataTable simplificou wire de filtros — antes montava manualmente `<FilterPopover>` + `<ButtonGroup>` + `<DataTableSimpleFilterDrawer>` separados com state local (~100 linhas). Agora instancia `<ToolbarFilterControl>` único (~30 linhas) passando config. State (drawer/popover open) mora no hook interno do ToolbarFilterControl.",
          "Drawer movido de `DataTable/parts/data-table-simple-filter-drawer.tsx` → `TableToolbar/parts/toolbar-simple-filter-drawer.tsx` (renomeado `DataTableSimpleFilterDrawer` → `ToolbarSimpleFilterDrawer`). TableToolbar passa a ser o dono completo do controle de filtros. Coupling-aceita TableToolbar → DataTable (`columnTypeRegistry`, `FilterModel` types) — mesmo pattern de `<FilterPopover>` que já importava `ColumnOption`. Coupling reverso (DataTable → TableToolbar) **continua proibido**.",
          'USAGE.md atualizados — DataTable ganhou seção "Filtros — split button + drawer simple (v0.7.0+, opt-IN)"; TableToolbar adicionou seção "3-pre. ToolbarFilterControl" + entries Compound + hook example. Inventory.md (`.ai/context/components/inventory.md`) adicionou ButtonGroup como 7º componente principal + nota sobre v0.7.0 do DataTable + ToolbarFilterControl.',
        ],
      },
    ],
  },
  {
    version: "0.6.0",
    date: "2026-06-07",
    tag: "preview",
    title:
      "DataTable — prop showEmptyFilterChips (chips de filtro vazios pré-ativos) + harden de filtros + 5 novos operators",
    summary:
      "Release maior em funcionalidade e correção de filtros. Highlight: nova prop opt-in `showEmptyFilterChips?: string[]` lista fields que aparecem como chips placeholder na toolbar mesmo sem valor (use case: dashboards com filtros pré-abertos esperando user preencher). Combine com `filterModel` controlado pra ter chips placeholder visíveis desde o load. Nova página de exemplo `ClientsPreFilteredPreview` demonstra o pattern. Plus: harden completo do sistema de filtros (auto-promote operator escalar→multi, normalização defensiva de operator legado, popover Filtros agora respeita operators column-aware, 5 novos operators expressivos no query builder).",
    changes: [
      {
        type: "added",
        items: [
          "Prop `showEmptyFilterChips?: string[]` em `DataTableProps` — array de field names que renderizam como chips placeholder na toolbar (visíveis desde o load, prontos pra preencher). Cada chip mostra APENAS o nome da coluna; click ativa popover com widget correto pra cada `filterType` (multiSelect/text/date/number). Filterstype-agnostic — `inferOperatorFromFilterType` resolve o operator correto a partir do `ColumnTypeRegistry`. Placeholders vivem em state local do componente (não poluem `filterModel`).",
          "Nova página de exemplo `ClientsPreFilteredPreview` (`src/preview/pages/ClientsPreFilteredPreview.tsx`) demonstrando o pattern com 6 chips placeholder cobrindo filterTypes diversos (multiSelect: Status/Categoria/Atribuído · text: Email · date: Criado em · number: Valor).",
          "5 novos operators de query builder no `FilterOperator` type: `notContains`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty`. `TextColumnType` agora expõe 8 operators no popover Filtros (era 3). `isEmpty`/`isNotEmpty` adicionados também em `SelectColumnType` e `MultiSelectColumnType` — operator se basta, sem precisar de input.",
          "Nova prop `getOperatorsForColumn?: (column) => FilterPopoverOperator[]` em `FilterPopover` — consumer decide quais operators aparecem no dropdown baseado na coluna. DataTable passa automaticamente consultando o `ColumnTypeRegistry`, restringindo o dropdown ao subset relevante por `filterType` (ex: multiSelect mostra só `isAnyOf`/`isNoneOf`/`isEmpty`/`isNotEmpty`, não os 10 globais).",
          "Helper `normalizeFilterModelForColumns(filterModel, columns)` em `useDataTableController` — normaliza operator escalar (equals/neq) pra multi (isAnyOf/isNoneOf) quando `filterType=multiSelect`. Aplicado em 2 pontos: hidratação inicial via `persistedInitial.filterModel` (resolve workspaces antigos persistidos no localStorage) + `applyViewState` quando user troca de view/preset.",
        ],
      },
      {
        type: "fixed",
        items: [
          "Filtros aplicados via preset/savedView com `operator: 'equals'` em coluna `filterType='multiSelect'` agora renderizam corretamente no popover Filtros (Select de operador mostrava VAZIO porque 'equals' não está em `MultiSelectColumnType.operators`). Fix em 3 camadas: (1) `normalizeFilterModelForColumns` na hidratação do controller; (2) `FilterRowEditor` faz fallback defensivo via `effectiveOp` + auto-corrige via `useEffect → onChange` quando filter.op não está nos operators atuais; (3) `getOperatorsForColumn` callback wire no DataTable.",
          "Multi-select dropdown não fecha mais a cada checkbox click no popover Filtros — `filterPopoverEntries` agora usa `id` estável `${field}|${operator}` (era `items[0].id` que mudava a cada spread no `handleFiltersChange`, causando unmount/remount do FilterRowEditor → o Popover interno do MultiSelectFieldDropdown perdia state).",
          "Chips de filtro mantêm posição original ao editar valor — `updateGroupValue` substitui in-place preservando ordem (era empurrado pro fim do array, fazendo o chip pular de posição quando user toggla valores). `filterPopoverEntries` agrupa multi-items na 1ª ocorrência (não no fim).",
          "Auto-promote operator escalar → multi quando widget multi passa array no `handleFiltersChange` E `updateGroupValue`. Resolve cenário: preset declara `operator: 'equals'` (default do builder) + column é multiSelect → ao togglar 2º valor, operator é promovido pra `isAnyOf` automaticamente.",
          "Chip toolbar mostra value friendly (`Status é Ativo`) em vez de raw (`Status é active`) — adapter `appliedFilters` agora passa `col.filterOptions` pro `renderChipValue` resolver value→label.",
          "Múltiplos chips do mesmo field renderizam corretamente quando operators diferentes (ex: `Email contém X` + `Email = Y`) — `enhancedAppliedFilters` usa `Map<field, chip[]>` (era Map<field, 1chip> que descartava extras).",
          "Placeholder de `showEmptyFilterChips` não some quando user adiciona condição vazia do mesmo field via popover Filtros — `fieldsWithFilter` ignora items com value vazio. Placeholder só some quando há filtro real com valor preenchido.",
          "`MultiSelectColumnType.renderFilterInput`/`renderFastFilterInput` agora aceitam value escalar (preset/savedView com `value: 'active'` em vez de `['active']`) via helper `toArray` interno. Sem isso, o widget renderizava placeholder 'Selecione...' mesmo com valor presente.",
          "`SelectColumnType` faz `toScalar(value)` defensivo (aceita escalar OU array). `BadgeColumnType.matchesFilter` e `UserColumnType.matchesFilter` aceitam value escalar em `isAnyOf` (normalizam pra `[v]`).",
          "`MultiSelectColumnType.operators` labels alinhados com `DEFAULT_OP_LABELS` do `ToolbarApplied` — `isAnyOf` agora é 'é' (era 'é um de'), `isNoneOf` é 'não é' (era 'não é nenhum de'). Chip e popover Filtros mostram o MESMO label.",
          "`DEFAULT_OP_LABELS` no `ToolbarApplied` expandido com `notContains` ('não contém'), `startsWith` ('começa com'), `endsWith` ('termina com'). `eq`/`neq` agora são textuais ('é'/'não é') em vez de símbolos ('='/'≠') — consistente com isAnyOf.",
        ],
      },
      {
        type: "changed",
        items: [
          "`FilterPopover.addRow` (botão 'Adicionar condição') agora insere no TOPO da lista (era no fim) — visibilidade imediata pra escolher o campo, sem scroll. Select de Campo abre automaticamente via `pendingOpenFieldId` + nova prop `autoOpenField` no `FilterRowEditor`. Default operator da nova condição é resolvido via `getOperatorsForColumn(firstCol)` (era sempre `operators[0]` global).",
          "Documentação atualizada em `DataTable/USAGE.md` (nova seção '⚠️ filterModel controlado — operator correto por filterType' com tabela completa e exemplo errado vs correto) e `TableToolbar/USAGE.md` (nova seção '3b. FilterPopover com operators column-aware').",
        ],
      },
    ],
  },
  {
    version: "0.5.1",
    date: "2026-06-05",
    tag: "patch",
    title:
      "Fix crítico de types no npm + transferência de repo + pipeline drift",
    summary:
      "Patch que destrava o consumo TypeScript do pacote. Versões v0.1.0 até v0.5.0 publicavam .d.ts referenciando paths fora do tarball (vite-plugin-dts preservava estrutura de source, mas o `files` do package.json não incluía `dist-lib/src/**` nem `dist-lib/tokens/**`). Consumers TypeScript instalavam mas não tinham IntelliSense — import retornava `any`. Bug silencioso por 4 releases. Plus: repositório transferido pra organização `igreenlab/igreen-desingsystem-admin`, licença declarada explicitamente (UNLICENSED), engines.node >=20.0.0 documentado. CLI bootstrap (@snksergio/create-design-system) também subiu pra v0.1.4 com template alinhado: pin atualizado pra ^0.5.1, classes de tipografia migradas pro novo schema (typography rewrite 2026-05-19), Geist font carregada via @font-face. Pipeline interno auditado: 14 arquivos de skills/rules/context tinham presets removidos (`text-label-*`, `text-paragraph-*`) ainda como pattern canônico — corrigidos.",
    changes: [
      {
        type: "fixed",
        items: [
          "Types TypeScript funcionando — tarball agora inclui `dist-lib/src/**` e `dist-lib/tokens/**` (era o bug crítico que afetou v0.1.0-v0.5.0). Consumers ganham IntelliSense completo ao instalar (L-017)",
          "Template do CLI bootstrap (@snksergio/create-design-system@0.1.4) alinhado com lib atual: classes `text-paragraph-sm`/`text-label-md` substituídas pelos presets atuais (text-body-sm, text-caption-md font-semibold), AlertModal `tone='critical'` corrigido pra `tone='danger'`, strings JSX exibindo versão atualizadas pra @0.5.1 (L-018)",
          "Pipeline interno auditado — 14 arquivos de skills/rules/context guides tinham presets typography removidos (rewrite 2026-05-19) ainda como pattern canônico. Próximos componentes criados via /ds-create-component agora seguem o schema atual (L-019)",
        ],
      },
      {
        type: "changed",
        items: [
          "Repositório transferido de `snksergio/igreen-desingsystem-admin` para `igreenlab/igreen-desingsystem-admin` (organização). package.json (lib + CLI), README.md e InstallationDoc atualizados",
          'Licença declarada explicitamente: `"license": "UNLICENSED"` (antes ausente — npm exibia "Proprietary" como default)',
          'Engines declarado: `engines.node: ">=20.0.0"`',
          'CLI template default agora pinha `"geist": "^1.7.0"` explicitamente (antes era transitive via design-system) — fonte Geist carregada via @font-face no index.css apontando pro node_modules/geist',
        ],
      },
      {
        type: "added",
        items: [
          "L-017 em lessons.md — files do package.json deve incluir paths emitidos por vite-plugin-dts",
          "L-018 em lessons.md — release minor/major da lib exige bump do template CLI bootstrap",
          "L-019 em lessons.md — remover/renomear token exige grep em TODOS os scopes (não só src/)",
        ],
      },
    ],
  },
  {
    version: "0.5.0",
    date: "2026-05-20",
    tag: "preview",
    title:
      "DataTable — fluid auto-fit + persistência completa do workspace Default",
    summary:
      "Duas features grandes na DataTable, opt-in zero (default ligado, sem breaking change). (1) Auto-fit de colunas em 3 camadas: type heuristics + canvas measureText nos primeiros 20 rows + distribuição flex do espaço sobrando. ResizeObserver mantém widths sincronizados quando o container muda. Resolve o caso 'tabela com poucas colunas e espaço vazio à direita' que pesava em vários showcases. (2) Persistência completa do workspace Default: filterModel/search/currentPage agora também persistem em localStorage (schema v4) junto com sort/density/widths. Quando user aplica view custom, snapshot da Default fica congelado; voltar para Default restaura tudo intacto. Limpeza só manual.",
    changes: [
      {
        type: "added",
        items: [
          "Prop `autoFit?: boolean` em `DataTableProps` — default `true`. Quando ligado, observa o container via ResizeObserver e calcula widths em 3 layers (type defaultWidth, canvas measureText nos primeiros 20 rows, flex distribution do espaço sobrando). Precedência: resize manual > autoFit > col.width > typeDef.defaultWidth. Inspirado em padrões de DataGrids modernos (AG Grid / TanStack) e na referência `design-tabela/` analisada antes do design",
          "Hook `useColumnAutoWidth` — observa container ref via ResizeObserver, coalesce eventos via rAF, atualiza state apenas quando widths efetivamente mudam (skip re-render)",
          "Utility `calculateColumnWidths` (3 layers) — exposta para reuso futuro fora do hook",
          "Utility `measureTextWidth` — canvas singleton (zero overhead em re-uso), fonte default alinhada com body-sm do DS (13px Geist), SSR-safe (retorna 0 sem `document`)",
          "Schema v4 da persistência DataTable — adiciona `filterModel`, `search`, `currentPage` ao workspace Default persistido em localStorage. Schema antigo (v3) é descartado silenciosamente (não quebra)",
          "Hidratação de `useDataTableSearch` (`initialSearch`) e `useDataTablePagination` (`initialPage`) — agora aceitam estado inicial vindo do localStorage",
          "Logic: `persistedSnapshotForSave` usa `defaultSnapshotRef` quando view custom está ativa — view custom NUNCA polui o snapshot Default no localStorage",
          "`applyDefault` (transição para Default) agora restaura `filterModel`/`search`/`currentPage` do snapshot — workspace pessoal completo intacto",
        ],
      },
      {
        type: "improved",
        items: [
          "DataTable em todas as DocPages/showcases (CRUD, Dashboard, Clientes, etc) agora preenche todo o container — sem espaço vazio à direita. Validado via Chrome DevTools MCP: containerWidth === scrollWidth (overflow 0px) em Example: CRUD e Example: Column types",
          "Selection column (checkbox 56px) é descontada do cálculo de auto-fit via `reservedWidth` no hook — evita overflow de 56px que apareceria sem o ajuste",
          "`scrollContainerRef` movido do `data-table.tsx` para o `useDataTableController` — compartilhado entre `Table.scrollRef` (scroll y/x) e `useColumnAutoWidth` (medição contentRect.width). Reduz uma `useRef` duplicada",
        ],
      },
      {
        type: "fixed",
        items: [
          'Comportamento de persistência inconsistente reportado pelo user: "alguns filtros salvam outros não". Causa: por design v3, `filterModel/search/page` eram excluídos do save (`/** Subset persistido — exclui filters, search, page (volátil entre sessões). */`). Agora persistem no schema v4 com lógica de Default snapshot que isola do state de views custom',
        ],
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-19",
    tag: "preview",
    title: "Typography rewrite — 6 roles / 23 presets + pre-commit gate",
    summary:
      "Reescrita enxuta da tipografia do DS. 32 presets em 8 namespaces → 23 presets em 6 roles (display / heading / title / body / caption / code). Body é o role central — substitui paragraph + label legados. Title default weight passou de 500 → 600 (alinhado com uso real). Override convencional via Tailwind nativo (font-bold/leading-none/tracking-wider). Migração executada em 14 ondas com validação visual e zero regressão. Bug crítico descoberto e fixado durante validação: tailwind-merge removia silenciosamente classes de presets não registrados em tv.ts e lib/utils.ts — lição L-016 + nova skill ds-reviewer/pre-commit-check pra capturar essa classe de sincronia em commits futuros.",
    changes: [
      {
        type: "breaking",
        items: [
          "typography.ts — removidos presets `paragraph-*` (6), `label-*` (7), `subheading-*` (6). Consumers externos do package precisam migrar nomes (`paragraph-sm` → `body-md`, `label-sm` → `body-md font-medium`, etc) — tabela de mapeamento completa em .ai/specs/typography-rewrite-2026-05-19.md",
          "title-sm/md/lg passam de weight 500 → 600 (semibold) default. Consumers que esperavam 500 precisam adicionar `font-medium` override",
          "caption-md muda significado: era 13/400, agora é 12/400. Quem usava `text-caption-md` esperando 13px precisa migrar para `text-body-sm font-normal`",
        ],
      },
      {
        type: "added",
        items: [
          "Role `body` (6 presets): body-xs (12/500), body-sm (13/500), body-md (14/400), body-lg (16/400), body-xl (18/400), body-2xl (24/400). Substitui paragraph + label legados — overrides de weight via Tailwind nativo (font-bold/semibold/medium/normal)",
          "Preset caption-xs (10/400) — tier 10px com weight regular, substitui o uso disperso de subheading-strong-sm",
          "Skill ds-reviewer/pre-commit-check.md — gate amplo invocado antes de commit significativo. Valida: USAGE.md atualizado em todos os componentes UI tocados; DocPages do showcase refletindo mudanças de tokens; sincronia 1:1 tv.ts ↔ lib/utils.ts ↔ typography.ts (L-016); pipeline-state.md com entry CONCLUÍDO; memory pointers; nova lição registrada em ds-standards.md",
          "Regra 7 em .claude/rules/ds-standards.md: 'Gate de pre-commit obrigatório antes de commit significativo'",
          "Audit retroativo .ai/audits/typography-inventory-2026-05-18.md (pré-rewrite) e .ai/audits/typography-inventory-2026-05-19.md (pós-Ondas)",
          "Spec do rewrite .ai/specs/typography-rewrite-2026-05-19.md com tabela completa antigo → novo + decisões",
          "Lição L-016 — novo preset em typography.ts exige registro 1:1 em src/utils/tv.ts e src/lib/utils.ts (twMergeConfig). Sem isso, tailwind-merge confunde com text-fg-X (color) e remove a classe silenciosamente",
        ],
      },
      {
        type: "changed",
        items: [
          "Escala discreta tipográfica em px: 10/11/12/13/14/16/18/20/24 — eliminados decimais (10.5, 11.5, 12.5, 13.5, 14.5) e órfãos (15, 17, 22, 26) que pulularam ao longo dos componentes",
          "body-sm (13/500) é agora o body default do projeto — usado em buttons, dropdowns, inputs, table cells. Texto corrido 13px usa `text-body-sm font-normal` (override regular)",
          "body-xs/sm têm weight default 500 (medium) por serem interactive; body-md+ têm weight default 400 (regular) por serem corridos",
          "TypographyDoc.tsx reescrita refletindo os 6 roles novos + overview cards por role + seção 'Overrides convencionais' + aviso L-016",
          ".ai/context/tokens/typography.md atualizado com nova escala + tabela cruzada antigo → novo + regras de override",
          "src/utils/tv.ts twMergeConfig sincronizado 1:1 com typography.ts (23 presets)",
          "src/lib/utils.ts extendTailwindMerge (segunda fonte que afeta shadcn cn()) sincronizado 1:1",
        ],
      },
      {
        type: "improved",
        items: [
          "Eliminadas 199 ocorrências de `text-[Npx]` literal em componentes — substituídas por presets DS. 4 exceções justificadas: ícones Unicode (text-[2rem], text-[20px] em ✦/✅) e DocHeader h1 fluid",
          "TypographyDoc agora tem overview grid com 6 cards (1 por role) explicando tier + weight default + uso típico — facilita onboarding",
          "USAGE.md de PageHeader, Kanban, Avatar, TableToolbar atualizados com nomes de presets novos",
          "Comentários internos de label.tsx, FiltersColumn, ConversationListItem limpos de referências a presets legados",
          "Regra 'antes de commit significativo invocar pre-commit-check' adicionada ao resumo em ds-standards.md",
          ".claude/skills/ds-dev/release.md Passo 1.5 agora invoca pre-commit-check em vez de greps direto — gate mais amplo cobrindo USAGE/DocPage/memory/sync, não só L-001..L-007",
        ],
      },
      {
        type: "fixed",
        items: [
          "Bug crítico do tailwind-merge — após adicionar `text-body-sm` ao typography.ts mas esquecer de registrar em src/utils/tv.ts, o merge removia a classe silenciosamente. Componentes perdiam font-size/lh/weight/tracking e caíam no default do browser (16px). Sem erro de tsc/build. Detectado via Chrome DevTools MCP inspecionando button.styles.ts. Documentado como L-016 + criada skill pre-commit-check pra prevenir reincidência",
          "src/lib/utils.ts twMergeConfig estava com nomes legados (paragraph/label/subheading/overline) + entries fantasmas (body-lg-medium etc que não existiam). Sincronizado com typography.ts atual",
        ],
      },
    ],
  },
  {
    version: "0.3.1",
    date: "2026-05-19",
    tag: "patch",
    title: "Pipeline governance — autonomia + auditoria retroativa v0.3.0",
    summary:
      "Patch grande de governança. Fecha duas frentes: (1) auditoria retroativa da v0.3.0, que passou sem o pipeline formal DS Designer → Gate → Dev → Reviewer; (2) autonomia automática do pipeline via hooks PostToolUse + skill consolidada de spec-token + auto-review no /ds-release. Resultado: o pipeline deixa de depender de invocação manual em cada Edit — anti-patterns são sinalizados automaticamente enquanto o componente está sendo editado.",
    changes: [
      {
        type: "added",
        items: [
          "Hook ds-lint-styles.sh (PostToolUse) — grep automático de L-001/L-002/L-003/L-004/L-005/L-007 + import de tv em arquivos *.styles.{ts,tsx} dentro de src/components/. Warning em stderr (não bloqueia), Claude vê e corrige na hora",
          "Hook ds-inventory-check.sh (PostToolUse) — alerta quando componente em src/components/ui/<Nome>/ não tem USAGE.md ou não consta no inventory.md (L-016 vira automação)",
          "Skill ds-designer/spec-token.md consolidada — substitui spec-token-{color,spacing,sizing,typography}.md em 1 router único com argumento tipo. Os 4 antigos viraram aliases que apontam pra ela",
          "Passo 1.5 em ds-dev/release.md — auto-review do diff desde a última entry antes do bump. Violações aparecem no preview do gate; usuário decide se corrige, aceita débito ou cancela",
          "Skill ds-dev/release.md — orquestra release completa em 7 passos (verificações → auto-review → coletar → classificar/bump → preview gate → aplicar mudanças → publicar via git/gh → handoff)",
          "Comando /ds-release [tag] — entry point pra release ponta-a-ponta",
          "Lições L-015 e L-016 em pipeline-state.md — gate informal exige registro retroativo (L-015); inventory.md no mesmo commit do componente (L-016)",
          "Entry retroativa de FloatingPanel, PageHeader e container.main-content-max em pipeline-state.md (seção Auditoria retroativa v0.3.0) com triads DESIGNER+DEV+REVIEWER completas",
          "Token container.main-content-max (1368px) registrado em .ai/context/tokens/sizing-shape-elevation.md",
        ],
      },
      {
        type: "improved",
        items: [
          "Inventário .ai/context/components/inventory.md atualizado pra refletir v0.3.0: FloatingPanel + PageHeader (Templates) adicionados, AppShell estendido (user/layout/mobileEdgeToEdge), DataTable com toolbar responsiva e auto-card mobile",
          "Settings.json carrega os 3 hooks PostToolUse (format + ds-lint-styles + ds-inventory-check) automaticamente",
          "Fallback node nos hooks (jq não disponível no Git Bash do Windows) — parsing JSON de stdin funciona em qualquer ambiente que tenha node",
          "ds-standards.md ganhou seção 'Hooks automáticos (autonomia do pipeline)' descrevendo cada hook + auto-review na release",
          "CLAUDE.md ganhou seção 'Hooks automáticos (pipeline autônomo)' acima da arquitetura de tokens",
          "ds-add-token.md aponta pro spec-token.md consolidado com argumentos por tipo",
        ],
      },
      {
        type: "changed",
        items: [
          "spec-token-{color,spacing,sizing,typography}.md viraram aliases curtos — fonte única passa a ser spec-token.md com arg tipo. Reduz 4 arquivos de ~80 linhas cada pra 1 router de 200 linhas + 4 stubs de 15 linhas",
          "Workflow de release: agora orquestrado via /ds-release com auto-review antes do bump (antes era 100% manual)",
          "ds-standards.md atualizada pra L-001..L-016 (era L-001..L-014)",
        ],
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-05-19",
    tag: "preview",
    title: "FloatingPanel + PageHeader + DataTable responsivo + CLI bootstrap",
    summary:
      "Release grande consolidando 2 componentes DS novos (FloatingPanel non-modal e PageHeader template), DataTable inteiramente responsivo (auto-switch table↔card em mobile, toolbar colapsável em <xl, skeleton pagination), AppShell com user menu + layout switcher, e a CLI @snksergio/create-design-system pra bootstrap. Também várias melhorias de cross-component (useTheme global sincronizado, hover tokens, dark mode contrast).",
    changes: [
      {
        type: "added",
        items: [
          "Componente FloatingPanel — drawer card flutuante non-modal com resize horizontal, maximize toggle e auto sheet bottom-up em mobile",
          "Componente PageHeader (Templates) — title + description + badge + actions + slot children, mobile-ready (esconde texto e CTA vira fluido por default)",
          "AppShell user menu — avatar do rail vira DropdownMenu com nome/email + layout (Fluido/Compacto) + tema (Sistema/Claro/Escuro) + Configurações + Sair",
          "AppShell layout prop ('fluid' | 'compact') — modo compact limita body em var(--container-main-content-max) centralizado",
          "AppShell mobileEdgeToEdge prop — zera padding mobile do body (chat-like screens)",
          "DataTable auto-card mode em mobile — abaixo de cardBreakpoint (default 768px) cada row vira <TableCardRow> automaticamente; coluna isPrimary vira título do card",
          "DataTable toolbar responsiva — sort/cols/density/export/moreMenu colapsam num icon-button dropdown via ToolbarMobileDialog em viewports <xl (1280px)",
          "FooterTableSkeleton — skeleton silhouette pro footer durante isLoading do DataTable (server mode sem flash 1-página)",
          "ClientesShowcase CRUD completo — NovoClienteDrawer (form), DetailDrawer (FloatingPanel) e AlertModal pro fluxo de delete (row action + bulk + drawer)",
          "DashboardShowcase — KPIs primary/quality, charts (Volume stacked + Visits donut), tabela Traffic, padrão completo de admin dashboard",
          "CLI @snksergio/create-design-system — bootstrap CLI pra criar novo projeto a partir do template default",
          "Setup npm package (build de library) com multi-entry exports",
          "Token container-main-content-max (1368px) — max-width canônico de body em modo compact",
        ],
      },
      {
        type: "improved",
        items: [
          "Hook useTheme com 3 valores (light/dark/system) e sincronização entre instâncias via CustomEvent + storage (cross-tab)",
          "DataTable row focused: bg-bg-table-row-selected + outline brand (mesmo visual do row selected via checkbox)",
          "Hover token bg-input-hover consumido por Input/Select/Textarea/InputGroup (visível no light, alpha no dark)",
          "DropdownMenu RadioItem com state checked: bg-bg-brand-subtle + text-fg-brand + Check icon (antes era Circle bullet)",
          "Header title vertical alignment: leading-none no breadcrumb-item (antes empurrava pra cima)",
          "Slider e Progress track: bg-bg-emphasis (light) / bg-bg-accent (dark) — antes era invisível no light",
          "ShowcasePageV2: masonry layout via CSS columns, max-w 1660px centralizado, tabs FAQ fluid, dropdowns shadow-sh-xl no dark",
          "DashboardShowcase: KPIs 1-por-linha no mobile, badges shape='pill', Volume IA cor brand-subtle, traffic +1 row Referral, header migrado pra PageHeader",
        ],
      },
      {
        type: "changed",
        items: [
          "Token bg-input-hover light: gray[100] (0.94) → gray[50] (0.973) — hover mais sutil",
          "ClientesShowcase refatorado em folder structure (pattern ChatV2): components/NovoClienteDrawer, components/DetailDrawer, mocks/types/styles separados",
          "DataTable coluna type='actions': sem ícone no head e remove border-right da cell anterior (via data-purpose CSS sibling)",
          "AppShell exports: tipos AppShellUser e AppShellLayoutOption expostos via index",
          "DropdownMenu RadioItem indicator: Circle → Check (consistente com CheckboxItem)",
          "ToolbarMobileDialog: prop desktopBreakpoint (md/lg/xl/2xl) controla quando o trigger esconde",
        ],
      },
      {
        type: "fixed",
        items: [
          "CLI: usa cross-spawn pra resolver EINVAL no Windows",
          "CLI: copy template robusto e args não quebram com shell:true no Windows",
          "Tela branca causada por import inexistente em sidebar-rail.tsx (sidebarRailUserDefault)",
          "DataTable bulk delete: cast selectedIds.map(String) pra evitar mismatch GridRowId vs string",
        ],
      },
      {
        type: "removed",
        items: [
          "Showcase v1 (ShowcasePage.tsx) — substituído por Showcase (antigo V2, renomeado)",
          "Chat v1 (ChatShowcase.tsx) — substituído por Chat (antigo V2, renomeado)",
          "@deprecated tag em ToolbarMobileDialog/Sheet (agora consumido oficialmente pelo DataTable)",
        ],
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-18",
    tag: "preview",
    title: "Docs refresh + Updates timeline",
    summary:
      "Atualização ampla da documentação interna, criação da seção Pipeline Infra, página Tokens Overview, novo README focado em SaaS CRM, e esta própria página de Updates para acompanhar o crescimento do DS.",
    changes: [
      {
        type: "added",
        items: [
          "Página Updates (esta) — timeline de versões e features",
          "Página Tokens Overview em Foundations (hierarquia 3-tier, prefixos anti-collision, naming V3)",
          "Página Installation em Get Started (requirements, scripts, troubleshooting)",
          "Seção Pipeline Infra: Skills, Commands, Hooks, Output Styles, MCP Servers, Memory System",
          "Visão estrutural hierárquica na página Pipeline (4 camadas + diagrama de fluxo)",
          "Hook block-sensitive-edit.sh (PreToolUse — bloqueia .env, secrets, migrations, credentials)",
        ],
      },
      {
        type: "improved",
        items: [
          "README reescrito com foco em SaaS CRM, admin panels e dashboards (stack canônica explícita)",
          "Páginas Introduction, Structure e Transform Tokens refletem o estado atual do projeto",
          "Hook format-on-save loga em .ai/scratch/hook-log.txt (debug visível)",
          "DS Reviewer checklist agora valida atualização do inventory.md (dupla verificação)",
        ],
      },
      {
        type: "changed",
        items: [
          "Package name: @igreen/design-system-v2 → @igreen/design-system (drop v2 suffix)",
          'HTML <title>: "iGreen DS v2 — Preview" → "iGreen Design System — Preview"',
          "Pipeline Simulator renomeado para Pipeline (com visão estrutural acima do simulador)",
          "Padronização de naming: critical → danger em todos os pipeline .md (alinha com tokens CSS reais)",
        ],
      },
      {
        type: "fixed",
        items: [
          "Inconsistência critical/danger em 7 arquivos do pipeline (token --color-*-danger é o real)",
          "Script sync:agents apontava para .js mas arquivo era .cjs",
          "Bug pego pelo critique genuína do DS Reviewer durante teste do pipeline (NotificationBanner)",
        ],
      },
      {
        type: "removed",
        items: [
          "Referências a outros design systems (Material 3, Carbon, Spectrum) no README e docs",
          'Framing de Tailwind/Shadcn como "adapters opcionais" — agora são dependências diretas declaradas',
          'Sufixo v2 e wording "stack-agnostic" das páginas visíveis ao usuário',
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-18",
    tag: "milestone",
    title: "Initial commit — v1 baseline",
    summary:
      "Primeiro commit do iGreen Design System. Captura o estado pré-publicação com tokens, componentes, pipeline AI e infra organizacional consolidados.",
    changes: [
      {
        type: "added",
        items: [
          "Arquitetura de tokens 3-tier (primitives → semantic → component) em tokens/brands/default/",
          "Transforms: to-tailwind-v4 (primary), to-css-vars, to-dtcg, to-js-theme",
          "Componentes iGreen custom em src/components/ui/ usando tv() de @/utils/tv",
          "Componentes Shadcn adaptados em src/components/shadcn/ com Radix preservado",
          "Pipeline AI com 4 agentes: orchestrator, ds-designer, ds-dev, ds-reviewer",
          "Skills atômicas por agente em .claude/skills/",
          "Slash commands: /ds-create-component, /ds-create-composite, /ds-add-shadcn, /ds-add-token, /ds-extract-figma",
          "Output style terse aplicado a toda sessão",
          "Memory system 4 camadas (user, project, audit log, lessons)",
          "MCP servers integrados: Figma, igreen-workspace, chrome-devtools, pencil",
          "Preview app com docs navegáveis em todas as seções",
        ],
      },
      {
        type: "improved",
        items: [
          "Anti-collision prefixes (gp-, sp-, pad-, radius-, sh-, form-, icon-, container-) para coexistir com Tailwind nativo",
          "Dark mode com hierarquia bg crescente + shadows/rings amplificados (L-008..L-011)",
          "WCAG 2.5.5 — touch targets ≥ 44px (min-h-form-xl)",
        ],
      },
    ],
  },
];
