# Dashboard Builder — Entrevista (fases 0–6)

Uma pergunta (ou grupo curto) por vez. Acumule as escolhas num rascunho mental —
**ZERO edição em disco** até o gate. Use `AskUserQuestion` pra escolhas fechadas.
Sempre que possível, proponha um default sensato ("normalmente aqui usamos X") e
deixe o usuário confirmar/ajustar. Ancore tudo nas receitas de
`dashboard-patterns.md` (§ citadas abaixo).

## Fase 0 — Intent + fonte

- Do que é o painel? (visão geral de quê, pra quem — ex.: painel do líder, resumo
  de categoria, financeiro consolidado).
- Dados: mock (demo) ou vindo de API? Se API, anote o shape aproximado — a geração
  cria o mock tipado espelhando o shape.
- Período/segmentação no topo? (quase sempre sim → **PeriodSelector** no `actions`
  do PageHeader, §0).

## Fase 1 — KPIs rápidos (KPI-group "Painel do Líder", §1)

- Quais métricas rápidas entram na faixa de KPIs? (liste label + valor + tom).
- Pra cada uma: **tom do ícone** (neutral/success/brand/info/warning/danger — colore
  só o círculo) e se tem **delta**. Delta: o sinal é literalmente bom/ruim? → `signed`.
  Senão, o "subir é bom"? → `tone`/`positive` explícito (ex.: tempo ↓ = success).
- Quantas colunas (4–6)? Vira `<KpiGroup columns={N} divided>`.
- ⚠️ Se for métrica com **evolução/sparkline + comparação** (não só número), talvez
  seja caso de LeadKpiCard (§3) ou chart-card (§2) — confirme.

## Fase 2 — Gráficos (chart-cards, §2)

- Quais gráficos? Pra cada um: tipo (barras/linha/área/pizza-donut), séries e o que
  comparam. (Detalhes/caveats de Recharts em `chart-patterns.md`.)
- Cada gráfico mora num **SectionCard** (head título+subtítulo discreto). Tem
  **big-number** liderando o card? Legenda/metric-rows abaixo?
- Donut com total no centro? (padrão §2/cross-cutting — `aspect-square w-[180px]`).
- 2 séries → verde(chart-1)+âmbar(chart-4); pizza → rampa da marca.

## Fase 3 — Ranking / fusão KPI+evolução (§3)

- Tem **ranking** (reconhecimento, top do mês) ou **linha de lista rica** que funde
  identidade + mini-KPIs em colunas + métrica headline com delta? (ex.: cidades,
  licenciados por status).
- Se sim: quais mini-KPIs (label+ícone+tom por coluna), qual a métrica headline à
  direita (com delta Chip) e qual o identificador (rank badge / nome / sub).
- Ranking simples (avatar + nome + valor) vs fusão completa (mini-KPIs + total).

## Fase 4 — Card dividido em 2 / mapa (§4)

- Tem seção que junta **dados + visual** lado a lado (ex.: barras por UF | mapa)?
  → card dividido em 2 (divisor no 2º painel, L-039).
- Precisa de **mapa**? (SVG por região/UF, com legenda). Anote as regiões/UFs.

## Fase 5 — Tabela / lista embutida (delegar §5/§6)

- O painel termina com uma **tabela** (grade densa) ou **lista** (cards) de detalhe?
- Se **tabela** → a geração delega a distribuição de colunas ao `crud-builder` (§5):
  identidade → status → categóricos → muted → moeda/data à direita; filtros nativos
  pré-aplicados (L-051).
- Se **lista/kanban** → delega ao `list-builder` (§6 slots): linha1 título+secundário,
  linha2 meta, status chip, valor à direita; sem botão de ação na linha.
- Se nenhuma → pula.

## Fase 6 — Layout das rows

- Ordem e agrupamento das seções em rows. Padrão canônico:
  1. (opcional) banner/hero + card de insight
  2. **KPI-group "Painel do Líder"** (§1) — faixa larga
  3. gráfico principal (2/3) + donut/resumo (1/3)
  4. (opcional) KPIs de qualidade / ranking / fusão
  5. listas/tabela resumo
- Regra: estreito → 1 card/row + coluna única (nunca lado-a-lado apertado). Rows
  2–3 col via `grid grid-cols-1 lg:grid-cols-{2,3} gap-gp-2xl items-stretch`.
  Categorias separadas por `SectionLabel` quando houver muitos blocos.

## Fim da entrevista

Resumir em 1 frase o que foi capturado e sinalizar:
`BLUEPRINT_PRONTO: <Painel> (dashboard) — aguardando gate` → carregar `blueprint.md`.
