# Dashboard Builder — Blueprint + GATE

Consolide a entrevista num preview de uma tela só e **pare** — ⛔ zero edição em
disco antes do "aprovar".

## Preview a apresentar

```
PAINEL: <nome>  ·  rota #/<page-id>  ·  fonte: mock | API(<shape>)
Ambiente: DS (src/preview/pages) | consumer (<PAGES_DIR>)

MAPA DE ROWS (top → bottom):
  Row 1 — [hero/insight?]                         (§ / opcional)
  Row 2 — KPI-group "Painel do Líder" · N cols    (§1)
          KPIs: <label · tom · delta(signed?)> …
  Row 3 — <gráfico principal> (2/3) + <donut/resumo> (1/3)   (§2)
  Row 4 — <ranking / fusão KPI+evolução?>         (§3)
  Row 5 — <card dividido / mapa?>                 (§4)
  Row 6 — <tabela | lista embutida?>              (§5/§6 → delega crud/list-builder)

Primitivos: Kpi/KpiGroup/KpiDelta · Chart · Panel · <DataTable|DataList?>
Receitas usadas: §1 §2 §3 §4 §5 §6 (as que se aplicam)
```

## Pré-validações (rodar antes de mostrar o gate)

- [ ] É mesmo dashboard (2+ tipos de seção)? Se virou 1 tabela/lista/gráfico só →
  avisar e rotear pro builder certo.
- [ ] Cada gráfico tem tipo + séries definidos e cabe no padrão de `chart-patterns.md`.
- [ ] KPI delta: `signed` só onde sinal = bom/ruim; senão tom explícito (checar os
  casos "tempo ↓ é bom").
- [ ] Ícone: KPI-group = círculo; mini-stat/legenda = quadrado (não trocar).
- [ ] Tabela/lista embutida tem builder delegado (crud/list) e distribuição §5/§6.
- [ ] `page-id` não colide com `DOC_PAGES` (App.tsx) / rotas existentes.
- [ ] Layout estreito não coloca cards lado-a-lado apertados.
- [ ] Nenhuma cor/tamanho hardcoded fora dos literais permitidos.

## Gate

Apresentar o mapa de rows + pré-validações numa tela só e aguardar:
- `aprovar`/`ok`/`pode gerar` → carregar `generate.md`.
- `ajustar X` → re-montar o preview com o ajuste (continua sem tocar disco).
- `cancelar` → abortar (zero edits).

Registrar `PAUSADO (gate)` em `.ai/status/pipeline-state.md` (com Assumption central:
"as seções escolhidas cobrem a visão que o usuário precisa e cabem nas receitas
canônicas"). **Não tocar em arquivo nem git antes do aprovar.**
