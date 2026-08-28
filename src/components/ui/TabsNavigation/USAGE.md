# TabsNavigation

<!-- ds:regras
- aba de NAVEGADOR (sessão que abre/fecha: conversa, chamado, registro) → `<TabsNavigation>`; filtro de conteúdo dentro da tela → `tabs` do shadcn
- `<TabsNavigation>` é SEMPRE controlado (`value` + `onValueChange`) e NÃO hospeda conteúdo — o painel pode morar fora, e aí a aba leva `panelId`
- `surface` = a superfície do conteúdo ABAIXO da tira (`surface` num card, `canvas` na página). Errar quebra a união da aba ativa, que é o componente
- `actions` na aba SUBSTITUI o `⋯`+`×` — é por ele que entram ✓/✗ de aceitar/recusar; sem `actions` e sem `onClose` a aba não tem ação
-->

Tira de abas de **navegação**, estilo navegador: cada aba é uma **sessão aberta** — com
identidade, status e ações próprias — que o usuário abre, troca e fecha.

## Quando usar

| Situação | Componente |
|---|---|
| Conversas, chamados, registros abertos ao mesmo tempo; o usuário abre e fecha | **`TabsNavigation`** |
| Alternar seções DENTRO de uma tela (Detalhes / Anexos / Histórico) | `tabs` (shadcn) |
| Alternar visão de uma mesma lista (Tabela / Kanban) | `toggle-group` ou o `viewMode` do DataTable |

Os dois convivem: uma aba de conversa pode conter um `Tabs` de Mensagens/Notas dentro.

## Import

```tsx
import { TabsNavigation } from "@/components/ui/TabsNavigation";
```

## Exemplo mínimo

```tsx
const [ativa, setAtiva] = useState("c1");

<TabsNavigation value={ativa} onValueChange={setAtiva} aria-label="Conversas abertas" onNewTab={abrir}>
  <TabsNavigation.Tab
    value="c1"
    leading={<Avatar size="sm" colorHex="#2563EB">MS</Avatar>}
    status="success"
    badge={3}
    onClose={() => fechar("c1")}
  >
    <TabsNavigation.Title>Maria Silva</TabsNavigation.Title>
    <TabsNavigation.Subtitle>Fatura de julho</TabsNavigation.Subtitle>
  </TabsNavigation.Tab>
</TabsNavigation>
```

## O conteúdo mora onde você quiser

O componente é a **tira**, não o roteador: ele diz qual aba está ativa e você troca o que
quiser, onde quiser.

```tsx
{/* tira aqui… */}
<TabsNavigation value={id} onValueChange={setId}>
  <TabsNavigation.Tab value="c1" panelId="painel-detalhe">…</TabsNavigation.Tab>
</TabsNavigation>

{/* …e o conteúdo em outra coluna, outra rota, outro componente */}
<section id="painel-detalhe">{conteudoDe(id)}</section>
```

- **Painel FORA** → `panelId` na aba (emite `aria-controls`).
- **Painel DENTRO** → `<TabsNavigation.Panel value="c1">`, que faz o par `role="tabpanel"` +
  `aria-labelledby` e renderiza só a ativa.
- Sem nenhum dos dois o componente **não inventa** wiring — fica só `role="tab"` +
  `aria-selected`, que é honesto.

## Props — `TabsNavigation`

| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `value` / `onValueChange` | `string` / `(v) => void` | — | sempre controlado |
| `surface` | `surface \| canvas` | `surface` | superfície do **conteúdo abaixo** — a aba ativa é pintada com ela |
| `density` | `comfortable \| compact` | `comfortable` | 48px com subtítulo · 40px sem |
| `fill` | `boolean` | `false` | aba ocupa a faixa inteira; a tira perde a régua |
| `actionsMode` | `hover \| persistent` | `hover` | ações reveladas no hover ou sempre visíveis |
| `chrome` | `boolean` | `true` | pinta o fundo recuado da tira |
| `onNewTab` | `() => void` | — | rende o `+` fora do trilho |
| `aria-label` | `string` | — | rótulo do conjunto |

## Props — `TabsNavigation.Tab`

| Prop | Tipo | Descrição |
|---|---|---|
| `value` | `string` | volta em `onValueChange` |
| `leading` | `ReactNode` | Avatar, `Icon`, imagem — qualquer nó |
| `status` | `success \| warning \| danger \| info \| neutral \| ReactNode` | ponto pronto, ou o seu |
| `badge` | `number \| ReactNode` | some na aba ativa |
| `actions` | `ReactNode` | **substitui** as ações padrão |
| `onClose` | `() => void` | sem `actions`, liga o `⋯` + `×` |
| `menu` | `ReactNode` | itens extras do `⋯` |
| `panelId` | `string` | id do container externo |
| `actionsAlwaysVisible` | `boolean` | ações fixas só nesta aba |

Peças: `TabsNavigation.Title` · `TabsNavigation.Subtitle` (some sozinho em `compact`) · `TabsNavigation.Action`
(botão de 24px, já com `stopPropagation`) · `TabsNavigation.Actions` (ações globais à direita) ·
`TabsNavigation.Panel`.

## Gotchas / cuidados

- **`surface` é a cor do que está EMBAIXO, e é o erro clássico.** A aba ativa precisa ser a
  mesma superfície do conteúdo — é isso que as une. Num card `surface`; se o conteúdo for a
  página, `canvas`. Com o token errado a aba parece pousada em cima de outra coisa.
- **`fill` troca o mecanismo da união, não só a altura.** No modo pousado a aba desce 1px e
  apaga a régua; em `fill` a tira **não tem régua** e a união é por continuidade de cor.
  Medido: manter o truque em `fill` deixava a aba 2px antes da régua — uma fresta, pior que
  linha nenhuma.
- **O fundo recuado usa dois tokens, um por modo** (`bg-subtle` no claro, `bg-canvas` no
  escuro) — medido: no claro `canvas` é branco igual à `surface`, no escuro `subtle` é branco
  a 1% sobre o card. Cada modo tem o seu token de recuo; não procure um único.
- **⛔ Não envolva a tira num wrapper com padding.** O respiro do topo é do componente, e é
  isso que a torna independente da superfície: quando o padding vinha de fora, aquela faixa
  acima das abas ficava com a cor do container enquanto a tira ficava com o recuo — duas cores
  na mesma banda, e a aba inativa parecia um botão de outra cor pousado num fundo diferente.
  **A única coisa com fundo próprio é a aba ativa**, e ela é a superfície do conteúdo. Se o
  container já pinta o recuo, desligue com `chrome={false}` em vez de compensar por fora.
- **Ação que exige decisão não vai no hover.** `hover` é certo pra `⋯`/`×`; pra aceitar/recusar
  um chamado use `actions` + `actionsAlwaysVisible` — o usuário precisa **ver** pra decidir, e
  recusar por engano tem custo.
- **As ações não reservam espaço** (coluna de grid `0fr → 1fr`): em repouso o título usa a aba
  inteira. Se você passar `actions`, mantenha-as pequenas — a coluna abre por cima do título.
- **`density="compact"` é escolha de conteúdo.** Sem subtítulo, duas conversas do mesmo cliente
  ficam idênticas.
- **As setas de overflow somem, não desabilitam.** Cada uma só existe enquanto houver o que
  rolar naquele sentido; com a fila inteira visível não aparece nenhuma, e a lista `⌄` também
  some. Botão apagado ocupa espaço e ainda lê como "tem algo aqui" — desabilitar faz sentido
  quando a ação volta a valer no mesmo lugar, e aqui o gatilho é a largura da tira.
- **Teclado:** ←/→/Home/End movem seleção e foco juntos; só a aba ativa fica na ordem de
  tabulação. Não recrie isso por fora.
- **jsdom não tem `ResizeObserver`** — o componente checa antes de instanciar, então ele não
  derruba a suíte de quem consome. Em teste, os controles de overflow ficam ocultos (não há
  medição de layout); teste o comportamento, não a seta.
