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
4. Registre a rota/local onde o usuário indicar. `npx tsc --noEmit` limpo.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> o DS é consumido como **submódulo** (não copy-in): os componentes/exemplos JÁ estão no disco
> em `<dsPath>/src` e **não** há registry. Use `importBase` do config (ex.: `@ds/components/ui/Chart`)
> e leia `<dsPath>/src/components/ui/Chart/USAGE.md` + `<dsPath>/src/examples/dashboard/dashboard-screen.tsx`
> direto — **NÃO** rode `igreen:add`.

## Gotchas do tipo
- Gráfico SEMPRE em `<ChartContainer config={...}>`; cor só por token (`chart-1..5` / chaves do config). 2 séries = verde (`chart-1`) + âmbar (`chart-4`); pizza = rampa monocromática da marca.
- Grid: `<CartesianGrid vertical={false} strokeDasharray="4 4" />` (token `chart-grid`, **sem** passar `stroke` — o `ChartContainer` reescreve via token).
- Card do gráfico: `Panel`/`Card` + título (`title`/`heading`).
- **Caveats do Recharts 3 (quebram mudo):**
  1. `text-display-sm`/`display-xs` **não existem** → KPI usa `heading-sm`/`heading-xs`/`display-md`.
  2. Pizza: sem `activeIndex`/`activeShape` → use `shape={(props,index)=><Sector/>}`.
  3. Radial empilhado/gauge parcial → `<PolarAngleAxis type="number" domain={[0,total]} />`.
  4. Eixo Y omite tick de borda (ex.: `0`) → `interval={0}`; `domain` máximo = maior tick (senão linha-guia duplicada no topo).

Aplique `DESIGN.md`. Para uma TELA inteira de painel, use a skill `dashboard`. Handoff: `CHART_PRONTO: <tipo>`.
