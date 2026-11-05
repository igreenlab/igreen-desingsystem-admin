---
titulo: Backlog do lote Sólis — tudo que não foi feito, numa tabela só
status: ATIVO 2026-11-04
criado: 2026-11-04
---

# Backlog Sólis

> **Só o lote Sólis.** Separado de propósito do [`BACKLOG.md`](../status/BACKLOG.md) do
> projeto, que tem assunto de outra natureza misturado.
>
> **23 linhas: tudo que não foi feito**, venha da lista original do Sólis ou tenha aparecido
> durante o trabalho. Nada aqui é "esquecido" — cada linha tem motivo, recomendação e o que
> custaria fazer.

**Como ler as colunas:**

| coluna | o que responde |
|---|---|
| **O que seria** | a funcionalidade em si, para você reconhecer do que se trata |
| **Por que não foi feito** | o motivo real, não a desculpa |
| **Faço?** | **SIM** ou **NÃO**, com o porquê em uma linha |
| **Impacto** | `ADIÇÃO` (nasce nova, nada muda) · `MUDA O QUE EXISTE` (mexe em quem já usa) · `INTERNO` (não chega à tela) |
| **Esforço** | simples · médio · complexo |
| **O projeto consegue sozinho?** | ⭐ **a coluna que mais importa.** Se o DS já dá as peças para o time do Sólis montar isso no projeto deles, sem o DS mudar |

---

# A tabela

| # | O que seria | Por que não foi feito | Faço? | Impacto | Esforço | O projeto consegue sozinho? |
|---|---|---|---|---|---|---|
| **34** | **desconhecido** — nunca foi lido | nunca foi triado: aparece **uma vez** numa lista de agrupamento e nunca mais | ⚠️ **primeiro descobrir** — não dá para recomendar o que ninguém leu | ? | ? | ? |
| **6 (resto)** | o tipo `percentage` honrar o `valueFormatter` da coluna, como `number` e `currency` já honram | ficou registrado que entraria no mesmo escopo, e **evaporou** entre duas tarefas | ✅ **SIM** — é metade de um item que você já aprovou, e o DS está discordando de si mesmo no terceiro tipo | MUDA O QUE EXISTE (só para quem passa `valueFormatter` numa coluna `percentage` e hoje é ignorado) | **simples** — 1 linha | ✅ **SIM** — `col.render` tem precedência sobre o `renderCell` do tipo, então dá para contornar hoje [¹](#notas) |
| **27** | texto de contagem configurável no **contexto de filtro** ("3 selecionados") | foi encerrado apontando para `selectionConfig.countLabel`, que é de **outra superfície** (a barra de seleção de linhas). A pergunta ao Sólis não foi feita | ✅ **SIM, depois de perguntar** — não dá para resolver sem saber qual tela ele quer | ADIÇÃO | **simples** | ✅ **SIM** — tipo próprio no `columnTypeRegistry` com o texto dele |
| **P6** | teste cobrindo a transição controlado ⇄ não-controlado do filtro | a proteção **existe e funciona** (medido). Falta só o teste | ✅ **SIM, quando sobrar fôlego** — teste não muda pixel, então nunca compete com rodada de prazo | INTERNO | **simples** | — (interno) |
| **2b** | `number` abrir em `between` em vez de `equals` | reclassificado de B para **C**: trocar o default reordena `def.operators` e muda **4** comportamentos visíveis | ❌ **NÃO** — é mudança de comportamento, não correção. Bate de frente com a sua regra | MUDA O QUE EXISTE | simples de código, **caro de consequência** | ✅ **SIM** — registrar tipo próprio no `columnTypeRegistry` com a ordem de operadores dele |
| **20** | `mode="range"` no `MonthYearPicker` — escolher de/até | é **componente novo**, não prop. Precisa de spec | ❌ **NÃO agora** — inventar desenho que ninguém decidiu é como nascem APIs que ninguém usa | ADIÇÃO | **médio** | ✅ **SIM** — dois `MonthYearPicker` lado a lado; a regra de "de ≤ até" fica no projeto |
| **21** | data **com hora** (`withTime` / `DateTimePicker`) | idem — componente novo | ❌ **NÃO agora** — mesmo motivo | ADIÇÃO | **médio** | ✅ **SIM** — `DatePicker` + um campo de hora ao lado |
| **22** | **barras empilhadas** prontas | exige decidir antes se o DS passa a **encapsular Recharts com API de props**. É mudança de postura, não feature | ❌ **NÃO** — a decisão de arquitetura vem primeiro | ADIÇÃO | **médio** | ✅ **SIM** — `ChartContainer` é exportado e `recharts` é **dependência do DS**, não peer: o projeto monta dentro do contêiner [²](#notas) |
| **23** | **ranking horizontal** pronto | idem | ❌ **NÃO** — mesma decisão pendente | ADIÇÃO | **médio** | ✅ **SIM** — idem |
| **30′** | **donut** pronto | espera **um segundo consumidor** pedir — é o teste de "serve mais de um projeto" | ❌ **NÃO** — um pedido não faz componente de DS | ADIÇÃO | **médio** | ✅ **SIM** — idem |
| **31′** | **linha** pronta | idem | ❌ **NÃO** | ADIÇÃO | **médio** | ✅ **SIM** — idem |
| **25** | `FilterBar` **fora** do `DataTable` | decisão de arquitetura grande: muda **onde mora** o `columnTypeRegistry`, o `ToolbarApplied` e o estado de filtro | ❌ **NÃO** — é refatoração de fundação, não item de lote | MUDA O QUE EXISTE (estrutura) | **complexo** | ⚠️ **PARCIAL** — o `FilterChip` **passou a ser exportado**, mas o motor mora dentro do `DataTable`: o projeto reconstrói a lógica de estado [³](#notas) |
| **26** | `filterFooter` no popover de filtro | é **prop da `FilterBar`**; sem ela, vira remendo no drawer | ❌ **NÃO** — depende do 25 | ADIÇÃO | simples sozinho, **preso ao 25** | ❌ **NÃO** — o popover é interno, sem ponto de extensão |
| **P5** | `defaultOpen` no filtro simples — nascer aberto **sem** assumir o controle | adição barata e opt-in, mas **ninguém pediu ainda** | ❌ **NÃO agora** — a prop nasce mais certa quando existe o caso real | ADIÇÃO (opt-in) | **simples** | ✅ **SIM** — controlar `open` no projeto. É o caminho de hoje, só com mais código |
| **P10** | `loadingMode` no `DataList` — segurar as linhas antigas enquanto carrega | o `DataList` **não tem `fetchData`**: sem paginação por servidor, não existe "página anterior" para segurar | ❌ **NÃO** — é responder a um cenário que ainda não existe | ADIÇÃO | **médio** | ✅ **SIM** — o `loading` é do projeto; ele segura as linhas no estado dele |
| **P15** | export com `fetchData` **e** `rows` entregar o conjunto completo | o conserto mexe nos **dois caminhos de servidor** e arrisca quem está bem | ❌ **NÃO** — conserto desproporcional ao sintoma | MUDA O QUE EXISTE (risco) | **médio** | ✅ **SIM** — não passar `rows` junto de `fetchData`, que é o que a doc já manda em 4 lugares |
| **4 tipos sem saída** (`select`, `boolean`, `badge`, `user`) | poder **esvaziar** o filtro pelo funil, não só trocá-lo | **já existe caminho** no DS | ❌ **NÃO** — inventar um terceiro desenho de "limpar" onde já há escolha é o DS crescendo um motor | ADIÇÃO | **médio** | ✅ **SIM** — `filterType: "multiSelect"` na coluna já tem "Selecionar todos" e "Limpar" [⁴](#notas) |
| **P14 + N1** | subir o contraste do `fg-brand` (4,36:1) e do par `danger` (**3,14:1**) para passar no AA | **sua decisão de hoje**: *"essas coisas de cor podemos ignorar"* | ❌ **NÃO** — decisão sua, registrada. Só volta se nascer um gate de contraste [⁵](#notas) | MUDA O QUE EXISTE (cor em 4 componentes) | **médio** | ✅ **SIM** — sobrescrever a cor no projeto |
| **P13** | renomear `renderEmpty` → `emptyState`, para bater com os outros dois componentes | renomear é **quebra**; a doc está alinhada e o erro não apareceu na prática | ❌ **NÃO** — fica para uma versão major, onde quebrar nome é esperado | QUEBRA | simples de código | — (é nome, não função) |
| **P7** | deps de um `useCallback` usarem `isControlled` em vez do valor | hoje custa **zero render** — o drawer não é memoizado | ❌ **NÃO** — otimizar antes de o caso existir é adivinhar | INTERNO | **simples** | — (interno) |
| **P4** | preservar os ids dos filtros que não mudaram | **nada** indexa por id — procurado e confirmado | ❌ **NÃO** — defeito hipotético | INTERNO | **simples** | ✅ **SIM** — comparar por campo/operador/valor, que são estáveis |
| **N3** | apagar o export morto `toolbarAppliedTagClass` | foi deixado **de propósito**, como alias, para não quebrar quem importe o nome antigo | ❌ **NÃO** — ganha uma linha e arrisca um consumidor invisível daqui | INTERNO | **simples** | — (interno) |
| **N4** | tirar o `waitFor` sobre debounce de 250ms de `chip-multi-valor.test.tsx` | caiu **uma vez** sob carga e passou sozinho em ~8 execuções | ❌ **NÃO agora** — só se voltar a cair | INTERNO | **simples** | — (interno) |

---

# O que a última coluna está dizendo

De 23 linhas, **15 o projeto consegue montar sozinho hoje**, consumindo peças que o DS já
exporta. Isso não é acaso — é a regra que você fixou funcionando:

> *O DS entrega a peça e o ponto de extensão; a composição é do consumidor. Quando o pedido
> começa a pedir variante de variante, a resposta é o consumidor **embrulhar** o nosso
> componente no projeto dele — não o DS crescer um motor de configuração.*

As três rotas de escape que aparecem repetidas na tabela:

| rota | serve para | o que o DS dá |
|---|---|---|
| **`columnTypeRegistry`** | qualquer comportamento de coluna específico de um app | registrar um tipo próprio, com operadores, widget de filtro e render dele |
| **`ChartContainer` + Recharts** | qualquer gráfico que o DS não tenha pronto | o contêiner com tema, tokens e tooltip; o `recharts` vem junto como **dependência**, não peer |
| **composição de primitivos** | campos compostos (range de mês, data com hora) | os dois lados já existem — falta só a regra, que é do projeto |

**Uma única linha o projeto NÃO consegue contornar:** o **26** (`filterFooter`), porque o
popover é interno e não tem ponto de extensão. O **25** fica **parcial** (a aparência dá, o
motor não), o **34** é incógnita até alguém ler, e **5 linhas são internas** (P6, P7, P13,
N3, N4) — não chegam à tela, então não há o que o projeto contorne.

---

# Notas

**¹ A precedência que salva o `percentage`.** A ordem de render de uma célula é
`1. edit cell · 2. actions · 3. col.render · 4. registry.renderCell`
(`data-table-row.tsx:161`). O `render` escrito na coluna **vence** o do tipo — então o
projeto formata a porcentagem dele hoje, sem esperar o conserto. Isso **não** torna o
conserto desnecessário: o defeito é o DS discordando de si mesmo em 1 de 3 tipos.

**² Recharts é dependência, não peer.** `package.json` declara `"recharts": "^3.8.1"` em
`dependencies`. O projeto que consome o DS recebe o Recharts junto e pode montar qualquer
gráfico **dentro** do `ChartContainer`, herdando tema, tokens de cor (`chart-1..5`) e grid.
As receitas estão em `.ai/context/components/chart-patterns.md`.

**³ O que o `FilterChip` resolve, e o que não resolve, no item 25.** Até hoje o chip existia
**três vezes** copiado no código, e por isso não dava para reusar. A unificação da P12 o
transformou em componente exportado (`src/components/index.ts:35`). Então a **aparência** de
uma barra de filtro fora da tabela já é reusável. O que continua dentro do `DataTable` é o
**motor**: o registro de tipos, o `ToolbarApplied` e o estado. O projeto consegue montar a
barra — mas escreve a lógica de filtro dele.

**⁴ A ressalva do `filterType: "multiSelect"`.** Ele é **independente** do `type` da coluna, e
troca a semântica de `equals` para `isAnyOf`. Filtrando por um valor o resultado é o mesmo,
mas é um filtro diferente — não só um widget diferente.

**⁵ O gatilho que reabriria o contraste.** Se um dia nascer um gate de contraste no DS, o par
`danger` é o **primeiro** a reprovar. Ou seja: criar o gate e arrumar o `danger` são, na
prática, a mesma decisão — não duas.

---

Visão completa do lote (o que foi feito, o que ficou aberto sem decisão, o que falta para
publicar): [`solis-fechamento.md`](./solis-fechamento.md).
