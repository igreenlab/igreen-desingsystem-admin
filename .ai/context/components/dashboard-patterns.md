# Dashboard / KPI / lista — padrões de composição

Fonte única das **composições canônicas** de telas de dado (dashboard, resumo,
análise, cidades/licenciados, tabelas, listas). Extraídas 1:1 das telas aprovadas
e validadas visualmente (L-034). Complementa `chart-patterns.md` (Recharts) e
`guide.md`. O `dashboard-builder`, o `crud-builder`/`list-builder` e o showcase
(`KpiDoc`, `DashboardShowcase`) referenciam este arquivo — não reinventar de memória.

> **Regra de ouro:** essas composições usam os **primitivos existentes** (`Kpi`,
> `KpiGroup`, `KpiDelta`, `Chart`, `Panel`, `DataTable`, `DataList`, `Chip`,
> `Avatar`). Não são componentes novos — são receitas de montagem. Cor 100% por
> token; os únicos literais deliberados são os tamanhos de número grande
> (`text-[24px]`/`text-[28px]`/`text-[30px]`) que não têm preset DS.

---

## 0. Shell de página (constante em toda tela de dado)

```tsx
<div className="flex flex-col gap-gp-2xl">
  <PageHeader title="..." description="..." actions={<PeriodSelector/>} />
  {/* seções */}
  <div aria-hidden className="h-pad-3xl shrink-0" /> {/* spacer de rodapé */}
</div>
```

**Period selector** (ação padrão do header, idêntico em todas):
`DropdownMenu` → `Button color="secondary" variant="outline" size="sm"
iconLeft={<Calendar/>} iconRight={<ChevronDown/>}`; item ativo
`bg-bg-brand-subtle text-fg-brand` com `<Check>` alternado por opacidade.

---

## 1. KPI-group "Painel do Líder" — card único com divisores

O formato **padrão** pra qualquer row de KPI informativo rápido (inativos, licença
a vencer, conexões ativas, carteira/mês, etc.). Equivale ao componente
`KpiGroup divided` + `Kpi`.

### Via componente DS (preferido)

```tsx
import { Kpi, KpiGroup, KpiDelta } from "@/components/ui/Kpi";

<KpiGroup columns={5} divided>
  <Kpi label="Inativos" value="14" icon={<UserX />} tone="danger" hint="+90 dias parados" />
  <Kpi label="Conexões ativas" value="1.204" icon={<Wifi />} tone="success"
       delta={<KpiDelta value="+34" signed />} hint="na rede" />
  {/* ... */}
</KpiGroup>
```

### Receita à mão (quando precisa do controle fino / cell clicável)

```tsx
// Container
<section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
  {/* Grid de divisores — mobile: divide-y; ≥lg: border-l por célula, cancelado no 1º (L-039) */}
  <div className="grid grid-cols-1 divide-y divide-border-subtle lg:grid-cols-5 lg:divide-y-0
                  [&>*]:border-border-subtle lg:[&>*]:border-l lg:[&>*:first-child]:border-l-0">
    {/* Célula */}
    <div className="flex flex-col gap-[2px] p-pad-3xl first:rounded-l-radius-xl last:rounded-r-radius-xl">
      <div className="flex items-start justify-between gap-gp-md">
        <p className="text-title-sm font-semibold text-fg-default">{label}</p>
        <span className={cn("grid size-form-lg shrink-0 place-items-center rounded-radius-full", KPI_ICON_BOX[tone])}>
          <Icon className="size-icon-sm" aria-hidden />
        </span>
      </div>
      <p className="text-[24px] font-bold leading-tight tabular-nums text-fg-default">{value}</p>
      {hint && (
        <p className="text-caption-md text-fg-muted">
          {delta && (
            <span className={cn("font-semibold", delta.trim().startsWith("-") ? "text-fg-danger" : "text-fg-success")}>
              {delta}{" "}
            </span>
          )}
          {hint}
        </p>
      )}
    </div>
  </div>
</section>
```

**Tone map canônico** (só colore o círculo do ícone; o valor fica `text-fg-default`
exceto KPI de alerta):
```ts
const KPI_ICON_BOX = {
  neutral: "bg-bg-muted text-fg-default",
  success: "bg-bg-success-muted text-fg-success",
  brand:   "bg-bg-brand-subtle text-fg-brand",
  info:    "bg-bg-info-muted text-fg-info",
  warning: "bg-bg-warning-muted text-fg-warning",
  danger:  "bg-bg-danger-muted text-fg-danger",
};
```

**Regras:**
- Row = 1 card `bg-bg-surface`; células separadas por **divisores, nunca por gap**.
- Célula: label (`text-title-sm font-semibold`) canto sup-esq + **círculo** de ícone
  (`size-form-lg rounded-radius-full` + tone) canto sup-dir; valor 24px bold tabular;
  hint `caption-md` muted.
- **Delta verde/vermelho por sinal**: começa com `-` → `text-fg-danger`, senão
  `text-fg-success`. No componente use `<KpiDelta signed />`.
- Colunas 4–5 no desktop; empilha no mobile (`divide-y`).

---

## 2. Chart-card (seção de dashboard com gráfico)

Toda seção de dashboard = 1 card `SectionCard`. Título **discreto** (a hierarquia
vem do espaçamento, não de heading grande).

```tsx
<section className="flex flex-col gap-gp-2xl rounded-radius-xl border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm">
  <header className="flex items-start justify-between gap-gp-md">
    <div className="flex min-w-0 flex-col gap-[2px]">
      <h3 className="m-0 text-body-md font-medium text-fg-default">{title}</h3>
      {subtitle && <p className="m-0 text-body-xs text-fg-muted">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>
  {/* conteúdo: chart, big-number, legendas... */}
</section>
```

- **Título** `text-body-md font-medium` · **subtítulo** `text-body-xs text-fg-muted`
  · gap entre eles `gap-[2px]` · card `p-pad-3xl` + `gap-gp-2xl`.
- **Chart** interno: `<ChartContainer className="h-[160px] w-full">`; cor SÓ por
  token (`var(--color-chart-*)`). Detalhes de eixo/grid/pizza em `chart-patterns.md`.
- **Big-number** liderando o card (opcional): `text-[30px] font-bold leading-none
  tabular-nums` + subtítulo `text-title-md font-semibold`, e uma linha de variação
  `text-caption-sm font-medium text-fg-success`.
- **Legenda / metric-row** (ícone-quadrado + label/sub + valor à direita), sob um
  `border-t border-border-subtle`:
  ```tsx
  <div className="flex items-center gap-gp-md py-pad-md">
    <span className="grid size-comp-xl shrink-0 place-items-center rounded-radius-base bg-bg-success-muted text-fg-success">
      <Icon className="size-icon-sm" aria-hidden />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-body-md font-medium text-fg-default">{label}</span>
      <span className="block text-caption-sm text-fg-muted">{sub}</span>
    </span>
    <span className="text-body-md font-semibold tabular-nums text-fg-success">{value}</span>
  </div>
  ```
- **Segment bar** (barra proporcional): `flex h-[8px] gap-[2px] rounded-radius-full
  bg-bg-muted` + segmentos `bg-chart-1/4/2` com `style={{ flex: value }}`.
- **Ranking / reconhecimento**: circle rank-badge (#1 = `bg-bg-warning-muted
  text-fg-warning` + `Award`; demais neutro numerado) + `Avatar` + nome truncado
  (flex-1) + pílula de valor; linhas separadas por `divide-y divide-border-subtle`.
- **Tabs internas**: `TabsList className="w-full"` + `TabsTrigger className="flex-1"`
  (abas iguais full-width).

> ⚠️ **Dois recipes de container de ícone — não confundir:**
> - KPI-group → **círculo** `size-form-lg rounded-radius-full`.
> - Legenda / mini-stat / status badge → **quadrado** `size-comp-lg/xl rounded-radius-base`.
> - Rank/count → **círculo pequeno** `size-comp-sm rounded-radius-full ... text-caption-md font-bold`.

---

## 3. Fusão KPI + evolução (linha de lista rica — Cidades / Licenciados)

Linha de `DataTable listConfig.renderItem` que funde identidade + mini-KPIs em
colunas + métrica headline com delta. Padrão pra rankings operacionais.

```tsx
<div className="flex w-full items-center gap-gp-xl">
  {/* 1. identidade (largura fixa) */}
  <div className="flex w-[180px] shrink-0 items-center gap-gp-md">
    <RankBadge rank={row.rank} />
    <div className="flex min-w-0 items-baseline gap-gp-xs">
      <span className="truncate text-body-md font-semibold text-fg-default">{row.cidade}</span>
      <span className="shrink-0 text-caption-md tabular-nums text-fg-muted">{row.uf}</span>
    </div>
  </div>

  {/* 2. mini-KPIs em colunas (some no mobile) */}
  <div className="hidden items-center gap-gp-6xl sm:flex">
    {STATUS_KPI.map((s) => (
      <div key={s.key} className="flex w-[96px] shrink-0 items-center gap-gp-sm">
        <span className={cn("grid size-comp-lg shrink-0 place-items-center rounded-radius-base [&>svg]:size-icon-sm", s.iconClass)}>
          <s.icon />
        </span>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="text-body-md font-semibold tabular-nums text-fg-default">{num(row[s.key])}</span>
          <span className="text-caption-sm text-fg-muted">{s.label}</span>
        </div>
      </div>
    ))}
  </div>

  {/* 3. bloco headline à direita (divisor border-l) */}
  <div className="ml-auto shrink-0 border-l border-border-subtle pl-gp-3xl">
    <div className="flex items-center gap-gp-sm">
      <span className="text-title-lg font-bold tabular-nums text-fg-default">{num(row.total)}</span>
      <Chip color={up ? "success" : "danger"} variant="soft" size="sm" shape="rounded">
        <TrendingUp className={cn("size-[12px]", !up && "rotate-180")} aria-hidden />
        {up ? `+${num(delta)}` : num(delta)}
      </Chip>
    </div>
    <span className="mt-gp-2xs block text-caption-sm uppercase tracking-[0.04em] text-fg-muted">Total</span>
  </div>
</div>
```

- `STATUS_KPI = { key, label, icon, iconClass: "bg-bg-<tone>-muted text-fg-<tone>" }[]`
  — cada mini-KPI é um **quadrado** de ícone tonal + valor + label. Largura fixa
  `w-[96px]`, gap entre colunas `gap-gp-6xl`.
- **RankBadge**: `grid size-comp-sm rounded-radius-full text-caption-md font-bold
  tabular-nums`; #1 = `bg-bg-warning-muted text-fg-warning`, demais neutro.
- **Bloco headline** SEMPRE `ml-auto shrink-0 border-l border-border-subtle
  pl-gp-3xl`: valor `text-title-lg font-bold tabular-nums` + Chip de delta
  (`shape="rounded"`, seta rotacionada 180° quando negativo) + micro-label
  `uppercase tracking-[0.04em]`.
- Variante Licenciados: identidade `w-[240px]` com status badge quadrado; bloco à
  direita = status Chip + linha de vencimento em vez de Total.
- **LeadKpiCard** do topo (3-up `grid-cols-1 md:grid-cols-3 gap-gp-2xl`): título
  `title-md` + valor `text-[30px] font-bold` + Chip de delta + sparkline
  `ChartContainer h-[64px] w-[150px]` + nota sob `border-t`.

---

## 4. Card dividido em 2 (Análise da Rede — dados | mapa)

Uma superfície partida em dois painéis; **o card não tem padding**, cada painel
tem o seu e abre com um `ColHead` (= head do SectionCard). O divisor vive no
**segundo painel** (L-039).

```tsx
<section className="rounded-radius-xl border border-border-subtle bg-bg-surface shadow-sh-sm">
  <div className="grid grid-cols-1 lg:grid-cols-2">
    {/* painel 1 — dados */}
    <div className="flex flex-col gap-gp-2xl p-pad-3xl">
      <ColHead title="PRO por UF" subtitle="..." />
      {/* bar-list, etc. */}
    </div>
    {/* painel 2 — visual/mapa (divisor aqui) */}
    <div className="flex flex-col gap-gp-2xl border-t border-border-subtle p-pad-3xl lg:border-l lg:border-t-0">
      <ColHead title="Por Região" subtitle="..." />
      <div className="flex flex-1 items-center justify-center">{/* mapa/visual */}</div>
    </div>
  </div>
</section>
```

Layout externo comum: donut (largura fixa) + card dividido lado a lado —
`grid grid-cols-1 gap-gp-2xl lg:grid-cols-[340px_minmax(0,1fr)]`.

---

## 5. Distribuição de infos em TABELA (ordem/roles das colunas)

Ordem canônica **esquerda → direita**: identidade → status → categóricos →
secundários muted → numéricos/datas à direita.

| Papel | Props-chave | Render |
|---|---|---|
| **Primário** (nome/identificador) | `isPrimary`, `minWidth` (não `width`), `icon`, `sortable`, `filterType:"text"` | `truncate font-medium text-fg-default` |
| **Status** | `width`, `icon`, `filterType:"select"` + `filterOptions` | `<Chip variant="soft" size="sm" shape="rounded">` cor por `STATUS_CHIP` |
| **Categórico/enum** | `width`, `filterType:"select"`; curto (uf) `align:"center" width:80` | default |
| **Secundário muted** (doc, cidade, pessoa) | `filterType:"text"` | `text-fg-muted` (+ `tabular-nums` p/ ids) |
| **Moeda (direita)** | `align:"right"`, `type:"currency"`, `aggregate:"sum"` + formatters | `tabular-nums font-medium text-fg-default` |
| **Data (direita)** | `align:"right"`, `sortable` | `tabular-nums text-fg-muted` |

- Toda coluna substantiva leva um `icon` lucide no header (uf trivial omite).
- Números/moeda/data sempre `tabular-nums`; muted p/ contexto, `text-fg-default`
  só no valor headline.
- **Filtros = nativos pré-aplicados (chips), nunca form acima** (L-051): `defaultViews`
  com `presetView(...)`.
- Defaults do `DataTable`: `getRowId`, `persistId`, `allowCreateView={false}` (abas
  fixas — L-054), `autoFit` (L-052b), `showTotalizers`, `paginationConfig
  {enabled, initialPageSize:25, pageSizeOptions:[10,25,50]}`, `className="mt-gp-xl
  max-h-[80vh]"`.

---

## 6. Distribuição de infos em LISTA / KANBAN (slots)

**Item de lista** (renderItem flat — ex.: faturas):
```tsx
<div className="flex w-full items-center gap-gp-lg">
  <div className="flex min-w-0 flex-1 flex-col gap-gp-2xs">
    <span className="flex items-center gap-gp-sm">
      <span className="truncate text-body-md font-semibold text-fg-default">{title}</span>
      <span className="shrink-0 text-caption-md tabular-nums text-fg-muted">· {secondary}</span>
    </span>
    <span className="truncate text-caption-md text-fg-muted">{cidade}/{uf} · {pessoa} · {data}</span>
  </div>
  <Chip color={s.color} variant="soft" size="sm" shape="pill">{s.label}</Chip>
  <span className="w-[96px] shrink-0 text-right text-body-sm font-semibold tabular-nums text-fg-default">{brl(valor)}</span>
</div>
```

**Slots:** linha1 = título bold `body-md` + `·` secundário muted · linha2 = 1 linha
muted `caption-md` juntando `lugar · pessoa · data` com `·` · status = Chip soft pill
(cor por mapa) · valor = moeda à direita, largura fixa, bold tabular. **Nunca botão
de ação** na linha.

**Kanban** — objeto de slots do `DataTable kanbanConfig.renderCard` (não montar JSX
à mão): `avatar` (md, iniciais) · `title` (nome) · `subtitle` (`cidade/uf`) · `chip`
(status soft pill) · `value` (moeda) · `footerLeft` (avatar xs + pessoa) ·
`footerRight` (`Clock` + data). Colunas por `groupByField` com `dotColor` de token
chart (`var(--color-chart-1..5)`). Paginação da lista flat: `listConfig.paginated:
true` quando puder ter muitas linhas (L-052).

---

## Checklist de composição (pra o builder / revisor)

- [ ] Shell: `flex flex-col gap-gp-2xl` + `PageHeader` + spacer de rodapé.
- [ ] KPI rápido → KPI-group divided (§1), tone só no ícone, delta por sinal.
- [ ] Seção com gráfico → SectionCard (§2), head discreto, chart `h-[160px]`, token.
- [ ] Ranking operacional → fusão KPI+evolução (§3) com bloco headline `border-l`.
- [ ] Dados + visual/mapa → card dividido em 2 (§4), divisor no 2º painel.
- [ ] Tabela → ordem de roles (§5), filtros nativos pré-aplicados.
- [ ] Lista/kanban → slots (§6), sem botão de ação na linha.
- [ ] Zero hardcode de cor; números grandes literais só onde não há preset.
