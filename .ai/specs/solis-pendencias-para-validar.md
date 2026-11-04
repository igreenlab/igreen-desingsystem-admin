---
titulo: Pendências do lote Sólis — o que NÃO foi corrigido, para validação
status: ABERTO
criado: 2026-11-03
relacionado:
  - solis-pedidos-2-analise.md
  - solis-rodadas-plano.md
---

# Pendências do lote Sólis — para você validar

Tudo que ficou **de fora** das rodadas, num lugar só. Nada aqui é recusa: é coisa que
precisa de decisão sua, porque mudaria comportamento de quem já consome o DS, ou porque
mora no projeto do consumidor e não no sistema.

A regra que governou o lote inteiro, e que explica cada linha abaixo:

> Só entra **correção** (o DS promete X e faz Y) ou **adição opt-in** (default preserva o
> comportamento de hoje). Mudança do que já funciona não entra pela porta de um consumidor —
> entra como decisão do DS.

Classificação final dos ~45 pedidos: **14 A** (correção) · **19 B** (adição) · **4 C**
(mudaria comportamento) · **5 D** (é do projeto).

---

## 1. As 4 que mudariam o que já funciona (categoria C)

Nenhuma é pedido ruim. Todas podem até ser a escolha certa — mas mudariam o pixel ou a
leitura em **todo** projeto que já consome o DS.

| # | Pedido | O que mudaria em todo projeto |
|---|---|---|
| **4** | "Hoje" com tom neutro no calendário | hoje o dia atual usa o **mesmo** tratamento do dia selecionado (`bg-bg-brand` + `text-fg-on-brand` + semibold, `calendar.tsx:147`). Dois estados, uma aparência. Atinge todo calendário, `DatePicker` e filtro de data |
| **16** | Destaque do filtro ativo na barra de chips | chip ativo passaria a borda e fundo de marca. Muda a barra de filtro de toda tabela |
| **9c** | Chip sem o rótulo do operador ("100 – 500 kWh" em vez de "entre 100 e 500") | muda como **todo** chip de faixa lê. Eles já têm `filterValueLabel` para fazer isso só no projeto deles |
| **17v** | Spinner centralizado no carregamento do multi | troca o "Carregando…" do fim da lista por estado centralizado, em todo multi assíncrono |

**Os itens 4, 16 e 17v são a mesma conversa.** São melhorias visuais plausíveis, de alcance
global, que chegaram misturadas a correções. Vale decidir as três juntas, olhando o sistema
— senão a régua vira "quem pediu", e qualquer consumidor passa a mudar o produto dos outros.

O **9c** é diferente: ali o caminho já existe e a resposta é devolver.

---

## 2. A que apareceu durante a execução (também C)

### Badge "1" em ordenação simples

Achado na re-revisão da Rodada 2. **Não é pedido do Sólis** — apareceu enquanto
corrigíamos um comentário.

```
data-table.tsx:1245   if (sort.sortModels.length < 2) return undefined;   ← a intenção
Table/table.tsx:277   sortIndex = 1,                  ← default dispara EM undefined
Table/table.tsx:395   {sortIndex !== undefined && …}  ← por isso nunca é falso
```

Default de parâmetro dispara **justamente** quando o valor é `undefined`, então o guard a
jusante nunca é falso. O código declara que não quer o badge em sort simples, e a tela
mostra o badge.

Medido no browser com uma única coluna ordenada: o container do sort vai a **34px** (badge
18 + gap 4 + seta 12) contra 12px em repouso.

- **Por que não corrigi:** é pré-existente (nenhum commit deste lote toca `Table/table.tsx`)
  e tirar o badge muda pixel para todo consumidor com uma coluna ordenada.
- **Correção:** 1 linha — `sortIndex,` sem o default.
- **Enquanto fica:** o piso de largura subestima 22px em coluna ordenada. Com `autoFit` a
  sobra absorve (medido: coluna 170 → 170 ao ordenar); aperta só na largura mínima.

---

## 3. As 5 que são do projeto, não do DS (categoria D)

**O DS já dá o caminho.** Não é recusa — é onde a peça mora.

| # | Pedido | O caminho |
|---|---|---|
| **10** | Clique substitui / Ctrl+clique soma no multi | tipo próprio no `columnTypeRegistry` com `ownsMulti: true`, montado com o `MultiSelectFieldDropdown` (exportado na Rodada 1) |
| **11** | Texto da busca do multi acessível | idem |
| **12** | Colar lista (`bulkPaste`) | idem — e tem regra de negócio dentro (conferir códigos no servidor, contar "6/10", listar não-encontrados). O `resolveValues` é chamada ao backend **deles** |
| **31** | Menu de visão do gráfico | `Button` + `DropdownMenu`. Eles mesmos marcam "(Opcional)" e dizem que já montam |
| **29b** | `ChartCard` | composição: `Panel` + `CardHead` + `Chart`. A receita está no `dashboard-patterns.md` |

⚠️ **Três dos cinco (10, 11, 12) só são "do projeto" porque o `ownsMulti` foi corrigido.**
Com o escape hatch quebrado eles não tinham como fazer — e aí o pedido seria legítimo.

**O que vale dizer a eles por escrito:** o `ownsMulti` existe desde a v0.69.0, pedido por
vocês, exatamente para que comportamento de widget não vire PR no DS. Ele estava quebrado —
isso é nosso, e corrigimos. Consertado, ele é a resposta para 10, 11 e 12.

---

## 4. Um item que não é implementação — é pergunta

**Item 4 da lista deles** (contador de seleção): o `selectionConfig.countLabel` **já
existe**. Antes de qualquer código, perguntar a qual tela eles se referem — pode ser que
estejam numa versão anterior, ou falando de outra coisa.

---

## 5. Furos conhecidos que o piso de largura não fecha

Levantados pelo implementador da Rodada 2, documentados, **fora do escopo**:

1. **Resize manual ignora o piso.** `useColumnResize` tem mínimo de 60px e `widthOverrides`
   têm a maior precedência — o usuário ainda arrasta abaixo de 84px e o stack volta a
   transbordar. O piso governa só a largura **calculada**.
2. **`autoFit={false}` não tem piso nenhum** (larguras estáticas). Opt-out legado.
3. **Alternar `enableHeaderFilter`/`enableColumnMenu` em runtime não recalcula** até um
   resize — o `useEffect` do `useColumnAutoWidth` observa nº de colunas, nº de rows e lista
   de `field`. Padrão **pré-existente** (`enableColumnFilter` é igual). O `showTypeIcons`
   entrou nas deps.

---

## 5b. O que a auditoria de compartilhados achou e NÃO corrigiu (Rodada 3)

Os quatro são **pré-existentes e inalterados** — apareceram porque fomos olhar o
`DataList`, não porque algo os criou. Todos no motor de filtro.

| # | O quê | Por que ficou |
|---|---|---|
| **P1** | `ownsMulti` com operador **escalar** ainda grava array num item só → `matchOp("equals", val, ["a","b"])` coage para `"a,b"` e nunca casa | consertar exige decidir se grupo escalar passa a combinar por **OR**. Isso é mudança de comportamento, não correção |
| **P2** | O `DataList` combina escalares do mesmo campo por **AND**; o `DataTable` por **OR** | dois `equals` no mesmo campo: a tabela devolve quem bate em qualquer um, a lista não devolve ninguém. Mesma família da P1 — provavelmente as duas se resolvem juntas |
| **P3** | Desmarcar o **último** valor remove o grupo e **desmonta o chip no meio da interação**, fechando o popover | o `DataTable` se protege disso de propósito, mantendo um item vazio (`use-filter-popover-adapter.ts:419`, com comentário sobre o mesmo sintoma). O `DataList` não tem essa proteção |
| **P4** | Todo toggle do chip regenera os UUIDs do grupo inteiro | inofensivo aqui (nada indexa `FilterItem` por id — procurado e confirmado), mas consumidor em `mode="server"` que faça diff por id verá substituição total a cada clique |

> **P1 e P2 são a mesma pergunta por dois lados:** o grupo de filtros escalares do mesmo
> campo deve ser AND ou OR? O `DataTable` já respondeu OR. Alinhar o `DataList` é a decisão
> — e ela muda resultado de filtro em tela que hoje funciona, então é sua.

---

## 5c. Quatro tipos cujo filtro você não consegue esvaziar (Rodada 4)

Pré-existente, medido, e **a decisão é sua** porque estender muda pixel em todo
consumidor do funil.

A Rodada 4 deu saída própria à linha que ficou sem nada a editar (`isEmpty`), fechando um
beco da L-070. Ao revisar, medimos que **quatro tipos built-in têm o mesmo beco por outro
motivo**:

| tipo | `SelectItem value=""` | clear | efeito |
|---|---|---|---|
| `select` · `boolean` · `badge` · `user` | **0** | **0** | filtro posto se **troca**, mas não se **esvazia** pelo funil |

A única saída é o **"Limpar todos"** do rodapé, que apaga os filtros de todos os campos.

**Por que o sinal atual não os alcança:** a saída por campo dispara quando o *operador*
não tem valor a editar. O operador desses quatro é `equals`, que **tem** valor — a linha é
editável, só não é esvaziável.

⚠️ **Não é uma linha de código.** O Radix proíbe `SelectItem` com `value=""`, então dar
saída a esses quatro exige decisão de design (item "Todos" sentinela? botão de limpar na
linha? ícone no próprio Select?), não um conserto mecânico.

O que **já foi feito**: o `TableToolbar/USAGE.md` parou de prometer que toda linha tem
saída, e nomeia os quatro.

---

## 5d. O `DataList` não deixa abrir o funil por fora (Rodada 4)

A Task 9 deu ao `DataTable` o par ****simpleFilter.open**** / ****onOpenChange****, para a
tela do consumidor abrir o drawer de filtros por um botão dela. O `DataList` tem **a mesma
lacuna** e não ganhou o par.

**Não é simetria barata**, e é por isso que ficou de fora: o `DataList` **não tem**
`simpleFilter` nenhum — nem `hiddenFields`, nem `title`, nem `size`. Dar a ele o par exige
escolher entre duas formas:

| forma | custo |
|---|---|
| criar o objeto `simpleFilter` inteiro em `DataListProps` e passá-lo pelo toolbar | simétrico com o `DataTable`, mas é API nova de verdade |
| duas props soltas na raiz | mais barato, e **assimétrico** — dois jeitos de configurar a mesma coisa em componentes irmãos |

Opt-in puro e sem risco nos dois casos. Mas é **API nova**, não correção, e o pedido do
Sólis (item 18) falava do `DataTable`. Fica para você decidir se vale e em qual forma.

Hoje o estado é `useState` privado em `data-list-toolbar.tsx:166`.

---

## 5e. Três arestas do `simpleFilter` controlado (Rodada 4)

Levantadas pela review da Task 9. Nenhuma é defeito; as três são escolhas que ficaram em
aberto.

| # | O quê | Por que ficou |
|---|---|---|
| **P5** | **Não existe `defaultOpen`.** O precedente do `Scheduler` oferece `defaultDate`/`defaultView`, e é por isso que o aviso dele consegue dizer *"use `defaultDate` para o não-controlado"*. Aqui o conselho é "omita `open`" | custa a possibilidade de **nascer aberto sem assumir o controle** — que é justamente o caso de deep-link que motivou a tarefa. É adição opt-in, barata; só não quis crescer o escopo da rodada |
| **P6** | **A transição não-controlado ⇄ controlado no meio da vida não é testada nem avisada.** O React avisa nesse caso em `<input>` | a guarda que lida com isso existe e **é observável** (a review mediu: largar o `open` depois de interagir muda o resultado), mas nenhum teste a cobre. Acrescentar um terceiro aviso para cenário sem evidência seria ruído (L-059) — o que falta é o **teste**, não o aviso |
| **P7** | As deps do `useCallback` usam o **valor** da prop, não um booleano `isControlled` como o `Scheduler` (`use-scheduler-state.ts:104`) | no modo controlado a identidade do handler troca a cada toggle. Inofensivo hoje porque o drawer não é memoizado — vira custo se alguém o memoizar |

> **P6 é a mais interessante das três:** a guarda está lá, faz a coisa certa, e nada prova
> que ela faz. É a forma invertida do que esta série vem achando — em vez de um verde que
> não prova nada, um comportamento correto que nenhum verde cobre.

---

## 5f. O que o `loadingMode` deixou em aberto (Rodada 5)

| # | O quê | Estado |
|---|---|---|
| **P8** | **Linhas mantidas não têm sinal visual.** Nem esmaecimento, nem opacidade | ⚠️ **A rota CSS existe hoje**: `props.className` e o `aria-busy` caem no **mesmo elemento**, então `.minha-tabela[aria-busy="true"] [role="rowgroup"] { opacity:.6 }` funciona sem tocar o DS. O que **não** existe é a rota **React** — o `DataTableContextValue` não carrega a flag, e `useDataTableContext` é público. Decidir se expõe |
| **P9** | **O rodapé segue otimista nos controles** — as setas e os números já apontam a página nova durante o vôo | O **texto do range**, que era a única afirmação falsa sobre a tela, passou a ser escondido (`hideRange`). Os controles não mentem: dizem para onde você vai. Fica como está salvo decisão em contrário |
| **P10** | **O `DataList` não tem `loadingMode`** | ⚠️ A assimetria **é de hoje**, não condicional: o `DataList` já tem `loading?: boolean` e o repassa ao `List`, que troca o corpo por esqueletos. Com o client mode do `DataTable` agora documentado e medido, os dois divergem em capacidade equivalente |
| **P11** | **`useDataTableQuery` devolve `error` e ninguém lê** (`:169`; grep no controller: zero) | Pré-existente e **fora** do lote. É o que torna o rodapé otimista **permanente** quando o fetch falha — nos **dois** modos, medido. Candidato a backlog próprio |

> **P11 explica P9.** A divergência rodapé↔corpo que parecia nascer com o `loadingMode`
> **já existia**: num fetch rejeitado o `isLoading` cai, os dados ficam, e o default
> renderiza linhas antigas com o rodapé na página nova — DOM idêntico. O `keep` não
> inventou a mentira; tornou **transitória e visível** uma que o default produz
> **permanentemente** e em silêncio.

---

## 6. Decisões reversíveis que tomei sozinho

Cada uma está no PR com o custo caso esteja errada. Listadas aqui para você discordar se
quiser:

| Decisão | Rodada | Se estiver errado |
|---|---|---|
| Piso de largura usa **`max`**, não soma | 2 | coluna com título longo **e** ações pode ficar 84px apertada em vez de título+84. Há teste travando o `max` contra a soma |
| Limiar do piso de **altura** do multi fica em **4**, não 3 | 1 | lista de 3 linhas em viewport baixo perde proteção que tem hoje |
| `CardAction` **não** entra no barrel raiz | 1 | o `Card` também não está lá; a família chega ao npm pelo subpath `/shadcn` |
| **Não** acrescentar linha ao bloco `ds:regras` do DataTable | 2 | já ocupa 5 das 8 linhas que o hook do consumidor imprime; quem desliga o menu descobre a perda ao ler o USAGE, não antes |
| `sortable` **opcional** (default `true`) no `DataTableColumnMenu` | 2 | preserva "prop ausente = comportamento de hoje" |

---

## 7. Uma falha de processo minha, registrada

A revisão da Task 7 (Rodada 2) voltou com **0 Critical, 0 Important e 6 Minor**. Decidi
corrigir 2 e deixar 4 parkeados — **e não anotei quais eram os 4**. O relatório veio como
mensagem, não como arquivo, e a decisão foi registrada só pelo número.

Então este documento **não consegue listá-los**, e eu prefiro dizer isso a reconstruir de
memória e arriscar inventar.

O que está preservado e cobre parte do mesmo terreno são as **Concerns do implementador**,
que viraram a seção 5 acima.

**Correção de processo:** a regra de decisão passa a ser *nomear cada achado ao decidir sobre
ele*, não contar quantos. Um achado que some entre a revisão e o registro é indistinguível
de um achado que nunca existiu.

> ✅ **Fechado estruturalmente em 2026-11-03**, depois de a falha acontecer uma terceira
> vez (a review da Task 7b registrou que não achou o relatório do implementador em
> disco — ele existia só como mensagem). Agora todo relatório de implementação e de
> review é gravado em `.superpowers/sdd/solis-rodadas-plano/` **antes** de a etapa
> seguinte ser despachada. As pendências da Rodada 3 acima já nasceram nomeadas.

---

## Ordem sugerida, quando você quiser atacar

1. **Item 4 (contador)** — é só uma pergunta ao Sólis, custo zero.
2. **Badge "1"** — 1 linha, e o código já declara a intenção. É a decisão C mais barata.
3. **Os três visuais juntos (4, 16, 17v)** — uma conversa só, olhando o sistema.
4. **9c** — devolver com o caminho (`filterValueLabel`).
5. **Os furos do piso (seção 5)** — só se alguém reclamar; hoje são teóricos.
