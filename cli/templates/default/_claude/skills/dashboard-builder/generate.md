# Dashboard Builder (consumidor) — Geração

Só após o gate aprovado. Abort-on-error.

## 1. Puxar + ler ANTES de montar (nunca de memória)

```bash
npm run igreen:add -- example-dashboard kpi chart panel
# + data-table (se tabela embutida) / data-list (se lista embutida)
```
Ler `src/examples/dashboard/dashboard-screen.tsx` (referência runnable) + `Kpi/USAGE.md`
+ `Chart/USAGE.md`. Catálogo visual: **https://igreen-desingsystem-admin.vercel.app** (`#/dashboard-showcase`).
**Prefira adaptar o example-dashboard** a montar do zero.

## 2. Receitas canônicas (as 6 — resumo; o example-dashboard tem o código completo)

**Shell**: `<div className="flex flex-col h-full min-h-0 gap-gp-2xl">` + `PageHeader`
(actions = PeriodSelector) + rows.

**§1 KPI-group "Painel do Líder"** (faixa de KPIs rápidos):
```tsx
<KpiGroup columns={N} divided>
  <Kpi label="..." value="..." icon={<Icon />} tone="success|brand|info|warning|danger|neutral"
       hint="..." delta={<KpiDelta value="+34" signed />} />
</KpiGroup>
```
Tone colore SÓ o ícone (círculo `size-form-lg rounded-radius-full`); valor default (só KPI de
alerta ganha cor). `signed` deriva verde/vermelho + seta do sinal; use tom explícito quando
"subir" não é bom (tempo ↓ = success).

**§2 Chart-card**: SectionCard (`flex flex-col gap-gp-2xl p-pad-3xl bg-bg-surface border
border-border-subtle rounded-radius-xl shadow-sh-sm`) com head discreto (título `text-body-md
font-medium`, subtítulo `text-body-xs text-fg-muted`, gap `gap-[2px]`) + `<ChartContainer
className="h-[160px]">`. Cor só por token. Big-number liderando: `text-[30px] font-bold
leading-none tabular-nums`. Legenda/metric-row: ícone-**quadrado** `size-comp-xl rounded-radius-base`
+ label/sub + valor à direita, sob `border-t border-border-subtle`.

**§3 Fusão KPI+evolução / ranking** (linha rica): identidade (rank badge `size-comp-sm
rounded-radius-full` + nome) · mini-KPIs em colunas (`hidden sm:flex gap-gp-6xl`, cada = quadrado
`size-comp-lg rounded-radius-base` tonal + valor `text-body-md font-semibold tabular-nums` +
label `text-caption-sm text-fg-muted`) · bloco headline à direita `ml-auto shrink-0 border-l
border-border-subtle pl-gp-3xl` (valor `text-title-lg font-bold` + delta Chip `shape="rounded"`,
seta 180° se negativo + micro-label `uppercase tracking-[0.04em]`).

**§4 Card dividido em 2**: 1 surface SEM padding + `grid lg:grid-cols-2`; cada painel `p-pad-3xl`
com ColHead; divisor no **2º painel**: `border-t border-border-subtle ... lg:border-l lg:border-t-0`.

**§5 Tabela embutida** → delega ao `crud-builder`: ordem identidade → status → categóricos →
muted → moeda/data à direita (`align:"right" tabular-nums`); primário `isPrimary`+`minWidth`+
`font-medium`; status `Chip variant="soft" size="sm" shape="rounded"`; filtros nativos
pré-aplicados (`defaultViews`/`presetView`), sem form solto acima.

**§6 Lista/kanban embutida** → delega ao `list-builder`: linha1 título bold `body-md` + `·`
secundário muted · linha2 meta muted `caption-md` (lugar · pessoa · data) · status Chip soft pill ·
valor à direita fixo `font-semibold tabular-nums`. **Sem botão de ação na linha.**

## 3. Registro
Registrar a página no roteador do app (perguntar ao usuário onde/como). Página órfã = incompleto.

## 4. Sequência (abort-on-error)
1. `igreen:add` dos itens + ler o example-dashboard.
2. Montar seção por seção (as § acima; adaptar o exemplo).
3. Registrar rota.
4. `npx tsc --noEmit` → erro: corrigir e repetir.
5. (recomendado) rodar o app e conferir: KPI-group divided, gráficos com token, ranking com
   `border-l`, card dividido, tabela/lista embutida, responsivo + dark.

## 5. Checklist final
- [ ] Compõe 2+ tipos de seção espelhando o example-dashboard
- [ ] KPI-group divided + KpiDelta (signed só onde cabe); ícone círculo vs quadrado certo
- [ ] Gráficos só com token; tabela/lista via crud/list-builder
- [ ] Zero Tailwind literal com equivalente DS · zero hardcode
- [ ] Registro completo · `npx tsc --noEmit` limpo

## Handoff
`DASHBOARD_PRONTO: <Painel>` (+ onde foi registrada)
