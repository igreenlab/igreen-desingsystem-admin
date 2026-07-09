# Kpi

**O que é** — Primitivos composáveis pra cards de KPI/estatística.
**Categoria**: Templates / App-level. Doc viva: `#/kpi`.

3 peças que compõem qualquer card de métrica:

| Peça       | Papel                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------- |
| `Kpi`      | card base: label + ícone (por tone) + valor + delta + hint + slot (sparkline) + footnote |
| `KpiGroup` | layout: `columns` (2–6, responsivo) + `divided` (vira 1 card com divisórias)             |
| `KpiDelta` | pílula de variação (sobre o `Chip`): tom semântico + seta                                |

## Quando usar

Métricas de dashboard (rows de KPI, quad, cards com sparkline). Pra layouts
muito específicos (card de marca preenchido, faixa de detalhe), componha à mão —
veja as **Composições** em `#/kpi`.

## Props

### `Kpi`

| Prop       | Tipo                                                   | Default                      |
| ---------- | ------------------------------------------------------ | ---------------------------- |
| `label`    | `string`                                               | — (obrigatório)              |
| `value`    | `ReactNode`                                            | — (obrigatório)              |
| `delta`    | `ReactNode` (use `<KpiDelta>`)                         | —                            |
| `hint`     | `ReactNode` (sublabel, ex.: "vs ontem")                | —                            |
| `icon`     | `ReactNode`                                            | —                            |
| `tone`     | `brand·success·warning·info·danger·neutral`            | `neutral`                    |
| `size`     | `sm·md·lg·xl` (preset `stat-*` do valor: 20/24/30/34px) | `md` (24px)                 |
| `footnote` | `ReactNode` (com divisória acima)                      | —                            |
| `children` | `ReactNode` (slot p/ sparkline/chart, abaixo do valor) | —                            |
| `surface`  | `card · plain`                                         | herda do `KpiGroup` (`card`) |

### `KpiGroup`

| Prop      | Tipo                              | Default |
| --------- | --------------------------------- | ------- |
| `columns` | `2·3·4·5·6`                       | `4`     |
| `divided` | `boolean` (1 card com divisórias) | `false` |

### `KpiDelta`

| Prop        | Tipo                         | Default              |
| ----------- | ---------------------------- | -------------------- |
| `value`     | `ReactNode`                  | —                    |
| `tone`      | `success · danger · neutral` | `success`            |
| `direction` | `up · down` (mostra seta)    | —                    |
| `signed`    | `boolean` — deriva tom+seta do sinal do `value` | `false` |

## Exemplo

```tsx
import { Kpi, KpiGroup, KpiDelta } from "@/components/ui/Kpi";
import { Phone } from "lucide-react";

// Row com divisórias (1 card único)
<KpiGroup columns={4} divided>
  <Kpi
    label="Em atendimento"
    value="12"
    icon={<Phone />}
    tone="success"
    delta={<KpiDelta value="+3" />}
    hint="vs ontem"
  />
  {/* ...mais Kpi */}
</KpiGroup>

// Card com sparkline (slot)
<Kpi label="Total Income" value="$6,280" delta={<KpiDelta value="+18%" />}>
  <ChartContainer config={cfg} className="h-[64px]"> ... </ChartContainer>
</Kpi>
```

## Gotchas

- **`tone` é decisão do consumidor.** "Subir" nem sempre é positivo (tempo de
  espera ↑ é ruim) → escolha o `KpiDelta tone` certo, não derive cego da direção.
  Atalho: `<KpiDelta value="+458" signed />` deriva verde/vermelho + seta do sinal
  — use SÓ quando o delta é literalmente +/- bom/ruim.
- **Composições de dashboard/lista** (Painel do Líder, fusão KPI+evolução,
  chart-card, card dividido, distribuição de tabela/lista) → receitas canônicas em
  `.ai/context/components/dashboard-patterns.md`. Doc viva: `#/dashboard-showcase`.
- **`divided` controla a superfície** dos `Kpi` filhos (viram `plain`); fora de um
  group `divided`, cada `Kpi` é um card. Override com a prop `surface` se preciso.
- **Valor do KPI usa preset `stat-*`** (`size`, default `md`=24px). Números
  grandes de dashboard → `size="lg"`/`"xl"`. Fora do `Kpi`, use `text-stat-*
  tabular-nums` direto — nunca `text-[Npx]` na unha. O preset já traz bold +
  leading tight; adicione só `tabular-nums`.
- **Sparkline via `Chart`** (Recharts) no slot `children` — id de `linearGradient`
  sem espaço/`&` (use índice), senão o `url(#...)` não resolve.
- Cores 100% por token (tones via `bg-bg-*-muted`/`fg-*`). Sem hardcode.
