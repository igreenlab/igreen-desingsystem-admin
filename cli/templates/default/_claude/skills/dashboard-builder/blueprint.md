# Dashboard Builder (consumidor) — Blueprint + GATE

Consolide a entrevista num preview de uma tela só e **pare** — ⛔ zero edição antes do "aprovar".

## Preview a apresentar

```
PAINEL: <nome>  ·  rota <definir com o usuário>  ·  fonte: mock | API(<shape>)

MAPA DE ROWS (top → bottom):
  Row 1 — [hero/insight?]                         (opcional)
  Row 2 — KPI-group "Painel do Líder" · N cols    (§1)  KPIs: <label · tom · delta(signed?)> …
  Row 3 — <gráfico principal> (2/3) + <donut/resumo> (1/3)   (§2)
  Row 4 — <ranking / fusão KPI+evolução?>         (§3)
  Row 5 — <card dividido / mapa?>                 (§4)
  Row 6 — <tabela | lista embutida?>              (§5/§6 → delega crud/list-builder)

Primitivos (igreen:add): kpi · chart · panel · <data-table|data-list?> · example-dashboard (base)
```

## Pré-validações
- [ ] É mesmo dashboard (2+ tipos de seção)? Senão → rotear pro builder certo.
- [ ] Cada gráfico com tipo + séries; cabe no padrão (skill `charts`).
- [ ] KPI delta: `signed` só onde sinal = bom/ruim; senão tom explícito.
- [ ] Ícone: KPI-group = círculo; mini-stat/legenda = quadrado.
- [ ] Tabela/lista embutida delega a crud/list-builder; distribuição correta.
- [ ] Layout estreito não coloca cards lado-a-lado apertados; zero hardcode.

## Gate
Apresentar mapa de rows + pré-validações numa tela só. Aguardar `aprovar` → `generate.md`;
`ajustar X` → re-montar; `cancelar` → abortar (zero edits). **Não tocar em arquivo antes do aprovar.**
