---
name: dashboard
description: >
  Monta dashboards/painéis (KPIs + gráficos + listas resumo) com o iGreen DS. Use
  quando o usuário pedir "dashboard", "painel", "visão geral", "KPIs",
  "indicadores", "tela inicial com métricas". Ancora no example-dashboard.
---

# dashboard — Painel / KPIs + gráficos

## Fluxo
1. `npm run igreen:add -- example-dashboard` (traz a tela + `Chart`/Recharts, KPIs, `Card`, `Chip`).
2. **Leia** `src/examples/dashboard/dashboard-screen.tsx` + `src/components/ui/Chart/USAGE.md`.
3. Adapte KPIs, séries e listas aos dados do usuário.
4. Registre a rota. `npx tsc --noEmit` limpo.

## Gotchas do tipo
- Estrutura: `PageHeader` → grid de **KPI cards** (1 col mobile / 3–4 desktop, `gap-gp-md`) → bloco de gráficos (`ChartContainer`) → listas/tabela resumo.
- KPI: valor grande (`display-md`/`heading`), label `caption-md` em `fg-muted`, tendência via `Chip` (`success`/`warning`).
- Gráficos: cor SÓ por token (`chart-1..5` / config keys); 2 séries = verde+âmbar; pizza = rampa da marca. Para detalhes/caveats do Recharts 3, ver skill `charts`.
- Card estreito: `max-w` fixo + 1 card por linha; nunca lado-a-lado apertado.

Aplique `DESIGN.md`. Para gráfico isolado (sem dashboard), ver skill `charts`. Handoff: `DASHBOARD_PRONTO` + rota.
