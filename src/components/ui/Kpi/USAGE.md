# Kpi

<!-- ds:regras
- `tone` e `KpiDelta tone` são DECISÃO, não derivação: subir nem sempre é bom (tempo de espera ↑ é ruim). `signed` só quando o sinal é literalmente bom/ruim
- o valor sai do preset `stat-*` pela prop `size` (default `md`=24px) — nunca `text-[Npx]` na unha; fora do `Kpi`, `text-stat-* tabular-nums`
- `divided` no `KpiGroup` vira UM card com divisórias e os filhos viram `plain` — não empilhe card dentro de card pra conseguir isso
-->

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
  chart-card, card dividido, distribuição de tabela/lista) → receitas canônicas na
  rota `#/dashboard-showcase` do catálogo hospedado. (Fonte no repo do DS:
  `.ai/context/components/dashboard-patterns.md` — caminho **interno**, não existe
  em quem consome por npm ou copy-in.)
- **`divided` controla a superfície** dos `Kpi` filhos (viram `plain`); fora de um
  group `divided`, cada `Kpi` é um card. Override com a prop `surface` se preciso.
- **Valor do KPI usa preset `stat-*`** (`size`, default `md`=24px). Números
  grandes de dashboard → `size="lg"`/`"xl"`. Fora do `Kpi`, use `text-stat-*
  tabular-nums` direto — nunca `text-[Npx]` na unha. O preset já traz bold +
  leading tight; adicione só `tabular-nums`.
- **Sparkline via `Chart`** (Recharts) no slot `children` — id de `linearGradient`
  sem espaço/`&` (use índice), senão o `url(#...)` não resolve.
- Cores 100% por token (tones via `bg-bg-*-muted`/`fg-*`). Sem hardcode.

## Responsividade, estouro e drill-down (2026-09-23)

- **`KpiGroup` quebra por CONTAINER, não por viewport.** As colunas usam `@md:`/`@3xl:`/
  `@5xl:`, e o `@container` mora num wrapper em volta do grid (elemento não consulta o
  próprio tamanho). Antes era `sm:`/`lg:`, que lê a JANELA: ao lado de uma sidebar de
  280px, oito KPIs num viewport de 1280 recebiam 6 colunas num espaço de ~700px — o
  número passava da borda e o rótulo quebrava em 4 linhas.
- **Teto de 4 por linha** até o container passar de 1024px. `columns` aceita 2…8.
- **`divided` separa TODAS as fileiras.** Não usa `divide-x`/`divide-y`: aqueles aplicam
  borda por ORDEM DO DOM e não sabem nada de grid — num grid de 2 colunas × 3 fileiras
  desenhavam só as verticais, e as fileiras ficavam sem separação. Agora cada filho
  desenha borda à direita e embaixo, e o grid é puxado 1px pra fora pra o
  `overflow-hidden` do wrapper comer as externas. Funciona com qualquer nº de colunas e
  fileiras, e fileira incompleta não vira bloco pintado.
- **Rótulo e valor não estouram**: `line-clamp-2` no rótulo, `truncate` no valor,
  `min-w-0` na raiz e no corpo. Sem o `min-w-0`, item de grid tem largura mínima igual
  ao conteúdo e o card ESTOURA a coluna em vez de truncar.
- **`helperText`** vira um "?" ao lado do rótulo, com tooltip. Explique COMO a métrica é
  calculada; não repita o rótulo.
- **`onClick` / `href`** tornam o card inteiro alvo de drill-down. A raiz continua
  `<article>` e o alvo é um `<button>`/`<a>` esticado por cima: o conteúdo de `<button>`
  é phrasing content, e um `<h3>` dentro dele é HTML inválido — o leitor de tela perde o
  heading. O nome acessível sai do `label`.
- Com `href` + router, passe **`renderLink`** (render-prop, nunca `linkComponent` — L-068).

```tsx
<KpiGroup columns={8}>
  <Kpi
    label="Tickets abertos"
    value="1.284"
    helperText="Conta tickets sem resolução no fim do dia."
    href="/tickets?status=open"
    renderLink={(p) => <Link {...p} to={p.href} />}
  />
</KpiGroup>
```

## Texto cortado e tooltip (2026-09-24)

- **`title` automático** no rótulo e no valor quando são texto. Eles têm `line-clamp-2`
  e `truncate`; cortados, não havia NENHUMA forma de ler o resto.
- **`helperSide`** (default `top`) e **`helperMaxWidth`** no tooltip do `helperText` —
  texto de ajuda longo num tooltip de 320px vira coluna alta e ilegível.
- **`KpiDelta` anuncia a direção**: a seta é `aria-hidden` (decorativa), então sem isso
  "subiu" ou "caiu" existia só em cor e ícone. Agora há um `sr-only` antes do valor —
  "aumento de 18%", "queda de 12s".

⚠️ O `label` continua sendo `string`, e não `ReactNode`: ele é o nome acessível do alvo
de drill-down (`onClick`/`href`) e a fonte do `title`. Nó arbitrário quebra os dois.
