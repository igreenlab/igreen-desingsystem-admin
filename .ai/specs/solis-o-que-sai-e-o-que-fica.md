---
titulo: O lote Sólis em três listas — o que sai agora, o que muda para todos, o que fica
status: PARA DECISÃO
criado: 2026-11-04
---

# O lote Sólis em três listas

> ## ⚠️ Leia isto antes das listas
>
> **As seções 1 e 2 são O MESMO TRABALHO, já feito e já na `main`.** Elas cortam as 23
> entregas por dois critérios diferentes:
>
> | seção | pergunta que ela responde | estado |
> |---|---|---|
> | **1** | o que entra na v0.71.0? | ✅ **feito** |
> | **2** | destas, quais o consumidor sente **sem ter pedido**? | ✅ **feito** — é subconjunto da 1 |
> | **3** | o que **ninguém** fez ainda? | ⬜ **pendente** |
>
> A seção 2 existe porque é a lista que o **changelog** precisa marcar com ⚠️. É
> informação para o release, **não** uma fila de trabalho.
>
> **Só a seção 3 não foi feita.**

Feito para responder três perguntas de uma vez: **o que sai agora**, **o que muda o
comportamento de quem já usa**, e **o que ficou esperando você**.

---

# 1. ✅ FEITO — sai na v0.71.0

Nada aqui precisa de decisão. São as 23 entregas, já mergeadas na `main`, esperando só o
release.

## 1a. Adição pura — prop ausente = exatamente o que era antes

**Estas oito não mudam nada para quem não as usa.** Cada uma tem teste de "caminho antigo" e
mutação provando que o default preserva o comportamento byte por byte.

| # | o quê | default |
|---|---|---|
| 5a/5b | `loadingMode` — a tabela para de piscar ao trocar de página | `"skeleton"` (o de hoje) |
| 11 | `processingMode` — a tela pagina, a tabela só mostra | `"client"` (o de hoje) |
| 19 | `isRowExpandable` — linha sem detalhe perde o chevron e o clique | ausente = toda linha expande |
| 18 | `simpleFilter.open` — abrir o funil por um botão da tela | ausente = estado interno |
| 33 | `Button.disabledReason` — o botão desabilitado se explica | ausente = `disabled` igual |
| 9a | `prefix`/`suffix` no número (kWh, %, /mês) | ausente = formato de hoje |
| 30 | `HelpTip` — o "?" do `Kpi` vira peça reutilizável | componente novo |
| — | `noValue` do operador passa a ter efeito | nenhum built-in declara |

## 1b. Correções — o DS prometia uma coisa e fazia outra

**São observáveis**, mas ninguém depende do defeito. Cada uma é o sistema discordando de si
mesmo.

| # | o quê | o que acontecia |
|---|---|---|
| 1 | `ownsMulti` entrega a lista | entregava **o primeiro valor** — nunca funcionou desde a v0.69.0 |
| — | chip multi do `DataList` | marcar 2 valores **esvaziava a lista** |
| 2 | drawer preserva o operador | editar o valor rebaixava `não é`/`entre` para o default, em silêncio |
| 6 | `valueFormatter` em `number`/`currency` | só `date` respeitava; os outros ignoravam |
| 3 | pt-BR no `Calendar` | filtros de data saíam em inglês |
| 9b | `between` do `currency` no chip | o `number` já tinha; o currency abria um campo só |
| 17, 15, 14, 7 | região do cabeçalho | "Ordenar" em coluna não-ordenável, funil sem como esconder sozinho, piso de largura |
| 29 | `CardAction` exportado | parte do shadcn nunca adaptada |
| 32 | contraste do tooltip | **1,10:1** sobre card em hover — invisível na prática |

---

# 2. ✅ FEITO — e destas, o consumidor SENTE mesmo sem ter pedido

> **Tudo nesta seção já está commitado na `main`** e repete, por outro recorte, itens da
> seção 1. Exemplo: o item 4 (o "hoje" do calendário) está no commit `e5fd772` desde
> ontem. **Nada aqui é proposta.**

É a lista que vira ⚠️ no changelog.

**Sua hipótese estava quase certa.** As adições são todas puras — **com uma exceção**, que
veio de carona.

## 2a. Os 4 que você aprovou (categoria C)

Sabidamente mudam o pixel de todo projeto. Foi por isso que ficaram esperando sua decisão.

| # | antes | depois |
|---|---|---|
| **4** | "hoje" e "selecionado" tinham **o mesmo** tratamento | "hoje" vira **anel**; selecionado continua preenchido |
| **16** | chip de filtro aplicado ≈ chip vazio | aplicado ganha borda e fundo de marca |
| **9c** | `"entre 100 – 500"` | `"100 – 500"` |
| **17v** | "Carregando…" no fim da lista | estado **centrado** |

Mais o **item 32** (tooltip invertido), que é correção mas muda todo tooltip do DS.

## 2b. ⚠️ A exceção: uma adição que mudou pixel

**`Chart` — item 28 e 24 vieram no mesmo commit, e o 24 não é opt-in.**

O `emptyState` é adição pura. Mas junto veio o conserto da **legenda**, que não tem prop:

| | antes | depois |
|---|---|---|
| gráfico **sem** legenda | — | **nada muda** (89 medidos) |
| gráfico **com** legenda | o `className` era a altura do bloco, e a legenda **comia** a plotagem | o `className` é a altura da **plotagem**; a legenda soma por fora (**10 medidos**) |

Concretamente: `h-[250px]` com legenda de 1 linha era **250px de bloco / 228px de gráfico**;
agora é **272px de bloco / 250px de gráfico**.

É o conserto do defeito que vocês relataram (legenda de 2 linhas achatava o gráfico) — mas
**quem tem legenda de 1 linha também sente**, e isso não estava separado em prop.

## 2c. Uma correção que mudou comportamento existente, por decisão

**O estado vazio filtrado** (`fetchData`): quem filtrava até zerar via *"Nenhum dado
cadastrado"* **sem o botão de limpar filtros** — a saída sumia exatamente quando era
necessária.

A correção muda o `fetchData`, que é comportamento que já existia. Escolhi assim (opção A)
em vez de consertar só atrás da prop nova, porque a alternativa faria os dois caminhos de
server divergirem. **Ninguém depende de um estado vazio que mente e prende.**

---

# 3. ⬜ NÃO FEITO — fica para sua avaliação

Nada aqui bloqueia o release. São 15, e estão todas em
[`solis-pendencias-para-validar.md`](./solis-pendencias-para-validar.md) com o detalhe.

## 3a. Decide logo, porque piora com o tempo

| # | o quê | por que urge |
|---|---|---|
| **P12** | `Gantt` e `Scheduler` **reproduzem** a gramática do chip por cópia, sem importar | com o item 16, eles vão **driftar**. Toda tela nova nasce com a pele antiga, e alinhar fica mais caro |
| **P13** | `renderEmpty` do `DataTable` é o **terceiro** nome do slot de vazio (`emptyState` nos outros dois) | renomear é **breaking** — a janela é num major |

## 3b. Decisão de design, não de código

| # | o quê |
|---|---|
| **4 tipos sem saída** | `select`, `boolean`, `badge`, `user`: filtro posto **se troca mas não se esvazia** pelo funil. ⚠️ **Não é conserto de uma linha** — o Radix proíbe opção vazia, então exige decidir a forma (item sentinela? botão na linha?) |
| **P14** | `fg-brand` como **texto** no escuro está na borda do AA (4,36:1) e **ninguém mede**. Candidato a gate |
| **P8** | linhas mantidas no `loadingMode="keep"` não têm sinal visual. A rota CSS existe; a **React** não |

## 3c. Defeitos pré-existentes que a auditoria achou

Nenhum nasceu neste lote. Todos estão nomeados com o mecanismo.

| # | o quê |
|---|---|
| **P1 / P2** | `ownsMulti` com operador escalar · `DataList` combina escalares por **AND** e `DataTable` por **OR**. São **a mesma pergunta**: grupo de filtros escalares é AND ou OR? O `DataTable` já respondeu OR |
| **P3** | desmarcar o último valor **desmonta o chip no meio da interação**. O `DataTable` se protege disso; o `DataList` não |
| **P11 / P15** | o `error` do `useDataTableQuery` **não é lido por ninguém** · o export com `fetchData` + `rows` entrega as rows locais com rótulo dizendo outra coisa |
| **P5 / P6 / P7** | não existe `defaultOpen` · a transição controlado⇄não-controlado não é testada · deps do `useCallback` usam o valor |
| **P10** | o `DataList` não tem `loadingMode` — a assimetria **é de hoje** |
| **P4** | churn de UUID a cada toggle do chip |

## 3d. Os 5 que são do time, não do DS

Não viram código: viram [documento de resposta](./solis-resposta-itens-do-projeto.md),
pronto para enviar.

Itens **10, 11, 12** (clique-substitui, busca acessível, colar lista) **deixaram de ser
pedido de DS** quando o `ownsMulti` foi corrigido — agora são composição que eles fazem.
Itens **31** e **29b** eles já montam com peças existentes.

---

## Sobre o `HelpTip` — você tem razão, e vale registrar

Você observou que a pessoa poderia ter feito na mão. É verdade: um botão com tooltip não é
difícil.

O que a extração compra não é o botão — é que **o "?" seja o mesmo em toda tela**. A peça
não aceita prop de ícone nem de tamanho, de propósito, e isso está escrito no `USAGE` como
ausência deliberada.

E ela carrega uma coisa que quem faz na mão erra: o `relative z-10`. Sem ele, o botão dentro
de um card clicável **existe e não clica** — o overlay do card o cobre, com hover e foco
parecendo corretos. Foi medido no browser, não suposto.

Dito isso: é a entrega de menor valor do lote, e você está certo em notar.
