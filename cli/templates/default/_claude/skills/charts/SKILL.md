---
name: charts
description: >
  Monta gráficos (barras, linha, área, pizza/donut, radial) com o iGreen DS
  (componente Chart, sobre Recharts 3). Use quando o usuário pedir "gráfico",
  "chart", "gráfico de barras/linha/área/pizza", "visualização de dados".
  Ancora no Chart/USAGE.md + example-dashboard.
---

# charts — Gráficos (Chart / Recharts 3)

## Fluxo
1. `npm run igreen:add -- chart` (e `example-dashboard` se quiser gráfico em contexto de painel).
2. **Leia** `src/components/ui/Chart/USAGE.md` (API: `ChartContainer` + `ChartConfig`) + os gráficos em `src/examples/dashboard/dashboard-screen.tsx`.
3. Monte o gráfico dentro de `<ChartContainer config={...}>`; cor só por token.

## Padrão (resumo)
- Gráfico SEMPRE em `<ChartContainer config={...}>`; cor só por token (`chart-1..5` / chaves do config). 2 séries = verde (`chart-1`) + âmbar (`chart-4`); pizza = rampa monocromática da marca.
- Grid: `<CartesianGrid vertical={false} strokeDasharray="4 4" />` (token `chart-grid`, **sem** passar `stroke`).
- Card do gráfico: `Panel`/`Card` + título (`title`/`heading`).

## Caveats do Recharts 3 (quebram mudo — atenção)
1. `text-display-sm`/`display-xs` **não existem** → KPI usa `heading-sm`/`heading-xs`/`display-md`.
2. Pizza: sem `activeIndex`/`activeShape` → use `shape={(props,index)=><Sector/>}`.
3. Radial empilhado/gauge parcial → `<PolarAngleAxis type="number" domain={[0,total]} />`.
4. Eixo Y omite tick de borda (ex.: `0`) → `interval={0}`; `domain` máximo = maior tick (senão linha-guia duplicada no topo).
5. Não passar `stroke` no grid — o `ChartContainer` reescreve via token.

Aplique `DESIGN.md`. Handoff: `CHART_PRONTO: <tipo>`.
