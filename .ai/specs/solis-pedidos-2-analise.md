# Pedidos do Sólis ao DS (SOLIS-238) — análise caso a caso

> **Status:** ANÁLISE — nenhuma decisão implementada. Documento de triagem.
> **Base:** código da v0.70.1, conferido em 2026-11-03. Cada afirmação do pedido foi
> verificada no arquivo e na linha citados; onde o diagnóstico deles diverge do código,
> está anotado.
> **Antecedente:** [`datatable-feedback-solis.md`](./datatable-feedback-solis.md) (1ª rodada,
> v0.69.0).

---

## O critério

O mantenedor fixou a regra, e ela decide quase tudo:

> Não pode ter alteração que **mude comportamento** — só correção ou adição. Se hoje
> clicar em X faz Y e alguém quer Z, ou vira função nova **opt-in**, ou não é do DS.
> O Sólis é **um** dos projetos que consomem; ele não dita a regra dos outros.

Daí saem quatro veredictos:

| | O que é | O que acontece |
|---|---|---|
| **A — Correção** | o código contradiz o que ele mesmo promete, ou dois caminhos do DS discordam entre si | entra; não muda comportamento intencional de ninguém |
| **B — Adição opt-in** | API nova cujo default preserva o de hoje, e que serve mais de um projeto | entra |
| **C — Mudança de comportamento** | mudaria o que já funciona em outros projetos | **não entra como pedido**; só como opt-in explícito, ou não entra |
| **D — Projeto** | composição, estilo ou regra de negócio do Sólis | devolve com o caminho das pedras |

Contagem, recontada item a item: **14 A · 19 B · 4 C · 5 D**.
Soma mais que os ~45 porque **seis itens se dividem** — parte entra, parte não (o 5, o 9 e o
17v são os principais).

As duas listas que decidem o que **não** entra como pedido estão juntas, para leitura direta:

- [**C — as 4 que mudariam o que já funciona**](#c--as-4-que-mudariam-o-que-já-funciona)
- [**D — as 5 que são do projeto**](#d--as-5-que-são-do-projeto)

A e B estão distribuídos no caso a caso, porque cada um precisa do motivo técnico ao lado.

---

## O achado que muda o lote

**Corrigir o item 1 torna os itens 10, 11 e 12 desnecessários no DS.**

O `ownsMulti` foi criado na v0.69.0 — a pedido do próprio Sólis — exatamente para o
consumidor **substituir o widget multi inteiro** pelo dele, via `columnTypeRegistry`, em vez
de cada comportamento virar PR no DS. O JSDoc diz isso com todas as letras:

> *"É o que permite o consumidor substituir o popover multi inteiro pelo dele (colar lista,
> clique-substitui...) via registry, em vez de cada comportamento virar PR no DS."*

Só que ele **nunca funcionou**. Em `data-table.tsx:2066`, `customOwnsMulti` desliga o
`useMulti`, e três linhas adiante o `currentValue` só entrega o array quando `useMulti` é
verdadeiro — o widget do consumidor recebe `aggregateValues[0]`, um valor só.

O resultado: o Sólis tentou usar o escape hatch, ele quebrou, e os três comportamentos que
ele existia para absorver voltaram como pedido de feature no DS:

- **10.** clique substitui / Ctrl+clique soma
- **11.** texto da busca acessível
- **12.** colar lista (`bulkPaste`)

Esses três são **regra de interação do Sólis**, não do DS. Com o `ownsMulti` consertado +
o `MultiSelectFieldDropdown` exportado (item 13), eles montam o widget deles com as peças do
DS e nenhum outro projeto herda comportamento que não pediu.

**É a melhor relação custo/benefício do lote inteiro:** uma linha de correção + um export
resolvem quatro itens e fecham a porta para os próximos cinco do mesmo tipo.

---

## O que foi pedido solto e é uma coisa só

O pedido lista ~45 itens avulsos. Na prática são **seis frentes**. Tratar como 45 tarefas
gera PRs que se atropelam no mesmo arquivo.

### Frente 1 — O escape hatch do multi (itens 1, 10, 11, 12, 13)
Já explicado acima. **1 correção + 1 export**, e o resto sai do DS.

### Frente 2 — O motor de filtro fora do seu lugar (itens 2, 18, 25, 26, 27)
Todos tocam `toolbar-simple-filter-drawer.tsx` / `ToolbarApplied` / `columnTypeRegistry`:
o drawer reescreve o operador (2), o drawer não fecha no clique-fora (18), querem o motor
**fora** do DataTable (25), rodapé no popover (26) e texto de contagem configurável (27).

O item 25 (`FilterBar` avulsa) é o que dá sentido aos outros: se o motor sai do DataTable
como peça própria, 26 e 27 são props dela, não remendos no drawer. **Decidir o 25 primeiro
muda o desenho dos outros quatro.**

### Frente 3 — Gráficos prontos (itens 22, 23, 24, 28, 30, 31)
Não são seis pedidos: é **uma decisão arquitetural** — o DS passa a ter componentes de
gráfico com API de props, encapsulando o Recharts, em vez de receitas copiáveis.
É a maior decisão do lote e está detalhada na seção da Parte 2.

### Frente 4 — Estados de carregamento (itens 5, 8)
O skeleton que pisca (5) e o modo servidor controlado (8) são o mesmo assunto: **quem manda
no corpo da tabela durante uma busca**. Resolver 5 sem decidir 8 obriga a mexer duas vezes
no mesmo trecho de render.

### Frente 5 — Campos de data (itens 3, 4, 20, 21)
Locale ausente (3), "hoje" indistinguível (4), intervalo de meses (20), data com hora (21).
Os dois primeiros são correção no `Calendar`; os dois últimos são componentes novos. Mas os
quatro vão **revisar o mesmo `Calendar`** — vale uma frente só.

### Frente 6 — Avulsos de verdade (6, 7, 9, 14, 15, 16, 17, 19, 29, 32, 33, 34)
Esses são realmente independentes.

---

## Caso a caso — Parte 1 (DataTable e filtros)

### Correções

**1. `ownsMulti` recebe só o primeiro valor — A (CORREÇÃO, prioridade máxima)**

Verificado em `data-table.tsx:2060–2085`. O diagnóstico deles está **certo**, e a correção
proposta também (`useMulti || customOwnsMulti ? aggregateValues : aggregateValues[0]`).

Raio de impacto: **zero para quem não optou.** Nenhum tipo built-in declara `ownsMulti`
(conferido em `column-types/definitions/` — o `tags` tem só um comentário explicando por que
*não* declara). Só quem registra tipo próprio com a flag é atingido, e é atingido pelo bug.

> *Explicando o item, que ficou obscuro no texto deles:* num grupo de filtro com os valores
> `["A","B","C"]`, o widget do consumidor abre mostrando só `"A"`. Desmarcar `"A"` manda
> `onChange(undefined)` e limpa o grupo inteiro. Marcar `"D"` manda `onChange("D")`, que
> substitui a lista — `"B"` e `"C"` somem sem o usuário ter tocado neles.

**2. Drawer "Filtros" reescreve o operador — A (CORREÇÃO), com ressalva no diagnóstico**

O bug é real: `updateFieldValue` (`toolbar-simple-filter-drawer.tsx:123`) chama
`defaultOperatorForFilterType(filterType)` a cada mudança de valor, descartando o operador
que o usuário escolheu. Um filtro em "Excluindo" volta para "é" ao ser editado no drawer.

⚠️ **O diagnóstico deles está parcialmente errado:** eles afirmam que o drawer *"não passa
`operator`/`onOperatorChange` ao `renderFilterInput`"*. A linha 260 **passa** `operator:
filterOp`. O que falta é o `onOperatorChange` e, principalmente, o `updateFieldValue` parar
de recalcular. Vale corrigir o diagnóstico com eles para não gerarem um PR no lugar errado.

O sub-pedido *"o `number` deveria abrir em `between` como o `date`"* é **B (adição)**, não
correção: é preferência de default, e mudá-lo mexeria no que outros projetos já veem.

**3. Filtros de data em inglês — A (CORREÇÃO)**

Confirmado: nenhum dos `<Calendar>` em `date-column-type.tsx` (linhas 99, 114) e
`datetime-column-type.tsx` (81, 96, 112) recebe `locale`. O pt-BR entrou só no `DatePicker`.

**Correção, não personalização** — o DS é de uma empresa brasileira e o resto da superfície
já está em pt-BR. A escolha certa é a segunda que eles oferecem: **pt-BR como default do
`Calendar`**, com `locale` continuando override. Passar `locale` em cinco call-sites é
remendo que o sexto vai esquecer.

**6. `number`/`currency` ignoram o `valueFormatter` — A (CORREÇÃO)**

Confirmado, e é **inconsistência interna do DS**, que é o caso mais forte de correção: o
`datetime` respeita (`datetime-column-type.tsx:172`) e tem o comentário *"mesmo escape hatch
do `date`"*. Dois tipos honram o contrato e dois não. Não é pedido do Sólis — é o DS
discordando de si mesmo.

**7. Ações do cabeçalho em coluna estreita — A (CORREÇÃO), se reproduzir**

O mantenedor pediu: *"ajustar só se for bug; se for personalização, não."* **É bug** —
conteúdo transbordando o container não é preferência. Mas a correção certa é a segunda que
eles oferecem (**entrar no cálculo do `minWidth`**), não a primeira (juntar num botão só),
que mudaria o visual do cabeçalho em todos os projetos.

**17. Menu do cabeçalho oferece ordenar em coluna não-ordenável — A (CORREÇÃO)**

Confirmado: `DataTableColumnMenuProps` (`data-table-column-menu.tsx:29`) recebe
`sortDirection` mas **não recebe `sortable`**, e o menu renderiza "Ordenar crescente/
decrescente" incondicionalmente (linhas 114, 121).

Oferecer uma ação que o componente recusa é defeito claro. O contorno atual deles
(`enableColumnMenu: false`) custa "Fixar" e "Ocultar" junto — sintoma de que o defeito é real.

**5. Modo servidor pisca a cada página — A (CORREÇÃO) + B (adição), e o mantenedor tem razão na ressalva**

Aqui há um **comentário load-bearing falso**, que é o padrão da L-060.
`use-data-table-query.ts:58` afirma:

> *"Em-vôo: `isLoading=true`. Resultado anterior continua visível."*

**O hook cumpre:** `setIsLoading(true)` na linha 125 e as rows **não são limpas**. Quem não
cumpre é o render: `data-table.tsx:2182` troca o corpo inteiro pelo skeleton.

Ou seja: **o dado já está lá.** Não é um recurso a construir, é um render que joga fora o
que o hook preservou.

> **Sobre a ressalva do mantenedor** (*"é válido analisar o caso onde cada página faz
> refresh para não pesar — acho que é o nosso caso"*): não é o caso. O skeleton não evita
> trabalho nenhum — o fetch acontece igual, as rows antigas continuam em memória, e o
> skeleton é só uma árvore DOM diferente desenhada por cima. Trocar por manter as linhas
> **não pesa mais**; pesa marginalmente menos, porque não desmonta e remonta o corpo.

Mesmo assim, **corrigir direto mudaria o visual de todo consumidor em modo servidor.** Logo:
`loadingMode: "skeleton" | "keep"` com **`"skeleton"` como default** (preserva hoje) e o
comentário falso corrigido. O Sólis liga `"keep"`.

O caso do `ref.refresh()` com polling de 3 s fechando a linha expandida é o mesmo defeito,
e o `loadingMode: "keep"` resolve junto.

### Recursos

**8. Modo servidor com dados controlados — B (ADIÇÃO), menor do que parece**

O mantenedor suspeitou que já existe. **Meio certo:** as peças existem — `rowCount`,
`paginationModel`, `onPaginationModelChange`, `onSortModelChange`, `onFilterModelChange`
(`data-table.types.ts:598, 650, 653, 654, 662`). O que **não** existe é o modo: com `rows`,
a tabela fatia localmente, e o `rowCount` está documentado como *"server mode opcional"*,
válido só com `fetchData`.

Então é uma **flag que desliga o fatiamento local**, reusando props que já existem — não um
subsistema novo. Baixo custo, e o padrão MUI que eles citam é conhecido pelo mercado.

**9. Faixa numérica completa (`prefix`/`suffix`, `between` no chip, chip sem rótulo de operador) — B parcial, C parcial**

Dividir:
- `prefix`/`suffix` no campo e no chip → **B**, aditivo puro.
- `between` do `currency` também no chip → **B**, paridade com o `number`.
- **chip sem o rótulo do operador** (`"100 – 500 kWh"` em vez de `"entre 100 e 500"`) →
  **C**. Isso muda como o chip lê **em todos os projetos**. Se entrar, é como opção de
  formatação, não como novo default.

**10, 11, 12 — dissolvidos pelo item 1.** Ver "O achado que muda o lote".
Se o `ownsMulti` for corrigido e o item 13 entregue, estes **saem do DS**.

**13. Exportar o `MultiSelectFieldDropdown` — B (ADIÇÃO), e é o par do item 1**

O `MultiSelectDropdown` já é exportado (`DataTable/index.ts:60`); o `Field` não.
Sozinho é um export trivial. **Junto com o item 1, é o que torna o escape hatch utilizável.**

**14. Desligar o ícone do tipo no cabeçalho (`showTypeIcons`) — B (ADIÇÃO)**

Não existe hoje. Aditivo, default preserva. Serve qualquer projeto com cabeçalho denso.

**15. Desligar o funil do cabeçalho (`enableHeaderFilter`) — B (ADIÇÃO)**

Idem. E tem argumento extra: hoje a única saída é `enableColumnMenu: false`, que mata
"Fixar" e "Ocultar" junto — o mesmo sintoma do item 17.

### Visual

**16. Destaque do filtro ativo na barra de chips — C (MUDANÇA DE COMPORTAMENTO)**

Muda a aparência do chip em **todos** os projetos. Pode ser a decisão certa de DS, mas aí é
decisão de DS — avaliada pelo design do sistema, não acatada porque um consumidor pediu.
**Separar do lote** e tratar como proposta visual própria.

**17v. Carregamento assíncrono do `MultiSelectDropdown` (spinner centralizado) — A (CORREÇÃO fraca) / C**

"Carregando…" pequeno no fim de uma lista vazia é affordance ruim, mas funciona. O
"Limpar" escondido até haver opções **é** correção de coerência (o "Selecionar todos" já
some — de novo o DS discordando de si mesmo). O spinner centralizado é preferência visual.
**Aceitar o "Limpar"; o spinner vai junto da decisão 16.**

**18v. Lista curta com espaço vazio (`LISTA_MAX_H`) — A (CORREÇÃO)**

Altura fixa com 3 opções deixa buraco. Altura pelo conteúdo com piso só ao rolar é o
comportamento que a maioria dos popovers do DS já tem. Correção de coerência.

**19v. Largura estável do popover do chip — A (CORREÇÃO)**

Popover que muda de largura ao filtrar a lista é defeito de layout, não preferência.

### Fora do DataTable

**32. Tooltip sobre card em hover some no tema claro — A (CORREÇÃO)**

Contraste insuficiente é defeito de acessibilidade, e vale para qualquer tooltip sobre
superfície com hover — não só para o `Kpi` do Sólis. Mas a correção certa é no **token do
tooltip**, não no `Kpi`.

**33. `Button` com dica no desabilitado (`disabledReason` + `aria-disabled`) — B (ADIÇÃO) com mérito de acessibilidade**

Não existe hoje. `pointer-events-none` num botão desabilitado **impede hover, foco e
tooltip** — o usuário não tem como descobrir por que não pode clicar. É o mesmo modo de
falha da L-070 (`disabled` na raiz apagando a saída do estado).

Aditivo (`disabledReason` ausente = comportamento de hoje) e serve todo projeto.

---

## Caso a caso — Parte 2 (gráficos, card, filtros fora da tabela, datas)

### Gráficos prontos — a maior decisão do lote

**22, 23, 24, 28, 30, 31 — B (ADIÇÃO) se a decisão for tomada; é UMA decisão, não seis**

Hoje o DS entrega o `Chart` (contêiner, tooltip, legenda) e as variações são **receitas** que
o consumidor copia — `BarChartDoc`, `PieChartDoc`, `LineChartDoc`, `AreaChartDoc` e o bloco
`dsgreen-chart-1` importam `recharts` direto (confirmado).

**Separar os dois argumentos, porque só um é do DS:**

❌ *"A tela do Sólis não pode importar `recharts`"* — **regra do Sólis.** O DS não tem
obrigação de esconder dependência de ninguém, e aceitar isso como critério abre precedente
para toda dependência de todo consumidor.

✅ *"As receitas erram, e cada consumidor reimplementa os mesmos erros"* — **argumento do
DS, e forte.** Eles listam defeitos concretos e verificáveis das nossas receitas:

| Defeito da receita | Por que é do DS |
|---|---|
| raio fixo por barra erra com segmento vazio | a receita "Stacked + Legend" ensina errado |
| `stackId` fixo vira id de `clipPath` → um gráfico recorta o outro na mesma página | bug latente que **toda** cópia herda |
| `Label` só funciona em série única | a receita não avisa |
| trilho cinza some na barra zerada (Recharts descarta retângulo de tamanho 0) | ninguém descobre sozinho |
| legenda que quebra em linhas achata as barras com altura fixa | idem |

**Isso é a L-055 aplicada:** *"tela que converge num padrão → capture a receita; componentiza-se
só o gap de átomo"*. A diferença é que aqui a receita **tem defeito**, e receita defeituosa
não é captura — é armadilha replicada.

**Recomendação:** aceitar **dois** (barras empilhadas e ranking horizontal), que são os que
têm os defeitos listados e já existem implementados no Sólis como especificação executável.
Donut e linha (30, 31) **esperam** — entram quando houver um segundo consumidor pedindo, que
é o teste de "serve mais de um projeto".

O item 24 (legenda com altura reservada + `ChartLegendContent` utilizável fora) e o 28
(`empty` no `ChartContainer`) são **A (correção)** e **B (adição)** independentes — entram de
qualquer forma, sem depender da decisão maior.

### Card de gráfico e ajuda

**29. Exportar o `CardAction` — A (CORREÇÃO de lacuna)**

Não existe no nosso `shadcn/card.tsx`. É parte do shadcn oficial que não foi adaptada.
Export trivial.

A alternativa que eles oferecem (`ChartCard` com título/descrição/ação/esmaecido/vazio) é
**D (projeto)**: é composição de `Panel` + `CardHead` + `Chart`, que o
`dashboard-patterns.md` já ensina. Não vira componente.

**30. "?" de ajuda avulso — B (ADIÇÃO)**

Extrair o botão de ajuda do `helperText` do `Kpi` para uso em cabeçalho de card. Aditivo e
reusa peça existente.

**31. Menu de visão do gráfico — D (PROJETO)**

Eles mesmos marcam "(Opcional)" e dizem que **já montam com `Button` + `DropdownMenu` do
DS**. É exatamente o que o DS deve fazer: dar as peças. Devolver.

### Filtros fora da tabela

**25. `FilterBar` fora do DataTable — B (ADIÇÃO), e é a decisão que organiza a Frente 2**

O motor (`columnTypeRegistry`, Incluindo/Excluindo, `filterValueLabel`) já existe e é
genérico. Extraí-lo como peça própria é **aditivo** e serve qualquer tela com filtro fora de
grade — dashboard, relatório, tela de busca. Não é necessidade só do Sólis.

Custo real: médio-alto. Mas decidir isso **primeiro** muda o desenho dos itens 2, 26 e 27.

**26. Rodapé no popover do filtro (`filterFooter`) — B (ADIÇÃO)**

Slot aditivo. Se o 25 entrar, é prop da `FilterBar` também.

**27. Texto de contagem configurável ("N selecionadas") — A (CORREÇÃO)**

Texto fixo em português com gênero fixo é defeito de i18n, não personalização. Qualquer
projeto com substantivo feminino tem o mesmo problema.

### Campos de data

**20. Intervalo de meses no `MonthYearPicker` (`mode="range"`) — B (ADIÇÃO)**

Não existe. Eles citam **14 telas** usando intervalo de competências. Competência é conceito
do domínio de energia, que é o domínio da empresa inteira — não é específico do Sólis.
Aditivo (`mode` ausente = hoje), e o `DatePicker` já tem o precedente de range.

**21. Data com hora (`withTime` ou `DateTimePicker`) — B (ADIÇÃO)**

Não existe. 3 telas. Agendamento é necessidade genérica. Aditivo.

---

## Caso a caso — Parte 3 (histórico de ações)

**17. Menu do cabeçalho em coluna não-ordenável** — já coberto na Parte 1. **A.**

**18. Drawer "Filtros" fecha ao clicar fora — B (ADIÇÃO)**

Confirmado: `simpleFilter.closeOnOutsideClick` não existe, e o `open` é estado interno
(`v2FilterOpen`) — o consumidor não tem como fechar.

Das duas saídas que eles oferecem, **`open`/`onOpenChange` controláveis** é a melhor: é o
padrão de todo overlay do DS (o próprio `Gantt` acabou de ganhar isso com o `showHistory`), e
resolve o `closeOnOutsideClick` como caso particular — o consumidor fecha quando quiser.

`closeOnOutsideClick` sozinho traria a complicação que eles já anteciparam (ignorar cliques
nos popovers abertos **a partir do** drawer), que é justamente o motivo de o `FloatingPanel`
ser non-modal.

**19. Expansão condicional por linha (`isRowExpandable`) — B (ADIÇÃO)**

Não existe. Chevron em linha que não expande é affordance que promete e não entrega — o
mesmo modo de falha da L-070. Aditivo (`isRowExpandable` ausente = hoje) e genérico:
qualquer tabela de log/histórico tem linhas com e sem detalhe.

---

## Ordem recomendada

**Rodada 1 — correções baratas que fecham porta (1 release)**

1. **Item 1** (`ownsMulti`) + **item 13** (export) — dissolve 10, 11, 12
2. **Item 6** (`valueFormatter` no number/currency) — inconsistência interna
3. **Item 17** (menu não oferece ordenação em coluna não-ordenável)
4. **Item 3** (pt-BR como default do `Calendar`)
5. **Item 27** (texto de contagem configurável)
6. **Item 29** (exportar `CardAction`)
7. Os três visuais de coerência (`LISTA_MAX_H`, largura do popover, "Limpar" escondido)

Tudo A. Nenhum muda comportamento intencional. Fecha ~12 itens.

**Rodada 2 — adições de baixo risco (1 release)**

8. **Item 5** (`loadingMode`, default `"skeleton"`) + corrigir o comentário falso
9. **Item 8** (`paginationMode: "server"`)
10. **Itens 14, 15** (`showTypeIcons`, `enableHeaderFilter`)
11. **Item 18** (`simpleFilter.open`/`onOpenChange`)
12. **Item 19** (`isRowExpandable`)
13. **Item 33** (`disabledReason`)

**Rodada 3 — decisões que precisam de desenho**

14. **Frente 2** — decidir o item 25 (`FilterBar`) antes dos itens 2, 26
15. **Frente 3** — decidir gráficos prontos (22, 23); 24 e 28 entram antes, independentes
16. **Frente 5** — itens 20, 21 (intervalo de meses, data com hora)

**Fora do lote — decisão de design do sistema**

17. **Item 4** ("hoje" vs selecionado no `Calendar`)
18. **Item 16** (destaque do chip ativo)

Os dois são **C**: mudam pixel em todo projeto. São provavelmente melhorias legítimas, mas
decididas pelo DS como sistema, não acatadas porque um consumidor pediu.

---

## C — as 4 que mudariam o que já funciona

Nenhuma é pedido ruim. Todas podem até ser a escolha certa — mas **não entram pela porta do
Sólis**, porque mudariam o pixel ou a leitura em todo projeto que já consome o DS. Se
entrarem, entram como decisão do DS, avaliadas pelo sistema.

| # | Pedido | O que mudaria em TODO projeto | Saída |
|---|---|---|---|
| **4** | "Hoje" com tom neutro no calendário | hoje o dia atual usa `bg-bg-brand text-fg-on-brand font-semibold` — **o mesmo tratamento do dia selecionado** (`calendar.tsx:147`). Mudar altera todo calendário, `DatePicker` e filtro de data | **fora do lote.** O defeito é real (dois estados, uma aparência) e vale decidir — como proposta visual do DS, não como item do Sólis |
| **16** | Destaque do filtro ativo na barra de chips | chip ativo passaria a `border-border-brand bg-bg-brand-subtle` + valor em `text-fg-brand`. Muda a barra de filtro de toda tabela do DS | **fora do lote**, junto do 4 |
| **9c** | Chip sem o rótulo do operador (`"100 – 500 kWh"` no lugar de `"entre 100 e 500"`) | muda como **todo** chip de faixa lê, em qualquer projeto | **devolver.** Eles já têm `filterValueLabel` para formatar o valor do jeito deles. Se virasse default, os outros herdavam uma leitura que não pediram |
| **17v** | Spinner centralizado no carregamento do `MultiSelectDropdown` | troca o "Carregando…" no fim da lista por estado centralizado — aparência nova em todo multi assíncrono | **fora do lote**, junto do 4 e do 16. ⚠️ **Mas o irmão dele entra**: esconder o "Limpar" até haver opções é **A**, porque o "Selecionar todos" já some — é o DS discordando de si mesmo |

> **Os três "fora do lote" (4, 16, 17v) são a mesma conversa:** melhorias visuais plausíveis,
> de alcance global, que chegaram misturadas a correções. Vale tirá-las daqui e decidir
> juntas, olhando o sistema — senão a régua passa a ser "quem pediu", e aí qualquer
> consumidor muda o produto dos outros.

---

## D — as 5 que são do projeto

**O DS já dá o caminho.** Não é recusa — é onde a peça mora.

| # | Pedido | Por que é do projeto | O caminho |
|---|---|---|---|
| **10** | Clique substitui / Ctrl+clique soma no multi | regra de interação de uma tela — outro projeto pode querer o oposto | tipo próprio no `columnTypeRegistry` com `ownsMulti: true`, montado com o `MultiSelectFieldDropdown` exportado (item 13) |
| **11** | Texto da busca do multi acessível | idem | idem |
| **12** | Colar lista (`bulkPaste`) | idem, **e tem regra de negócio dentro**: conferir códigos no servidor, contar "6/10 selecionados", listar não-encontrados | idem — o `resolveValues` que eles descrevem é chamada ao backend **deles** |
| **31** | Menu de visão do gráfico | eles mesmos marcam "(Opcional)" e dizem que **já montam** com peças do DS | `Button` + `DropdownMenu`, como já fazem |
| **29b** | `ChartCard` (título/descrição/ação/esmaecido/vazio) | composição, não componente | `Panel` + `CardHead` + `Chart`; a receita já está no `dashboard-patterns.md`. O que **entra** é o item 29 (exportar o `CardAction`), que é a peça que falta |

> ⚠️ **Três dos cinco (10, 11, 12) só são "do projeto" porque o `ownsMulti` vai ser
> corrigido.** Hoje, com o escape hatch quebrado, eles não têm como fazer — e aí o pedido
> seria legítimo. É por isso que o item 1 é prioridade máxima: ele é o que transforma três
> pedidos de feature em três composições do consumidor.

> **O ponto que vale dizer a eles por escrito:** o `ownsMulti` existe **desde a v0.69.0**,
> pedido por vocês, exatamente para que comportamento de widget não vire PR no DS. Ele
> estava quebrado — isso é nosso, e corrigimos. Mas, consertado, ele é a resposta para 10,
> 11 e 12: o DS entrega as peças e a regra de interação é de vocês. Se a regra do Sólis
> virasse default do DS, os outros projetos herdariam uma interação que não pediram.

---

## Sobre a forma do pedido

Três coisas que valem combinar para a próxima rodada:

1. **O diagnóstico do item 2 aponta para o lugar errado** (o `operator` É passado; o problema
   é o `updateFieldValue` recalcular). Diagnóstico errado no pedido vira PR no arquivo errado.

2. **Itens interligados vieram soltos.** Os seis de gráfico são uma decisão; os cinco de
   filtro dependem do item 25. Pedido fatiado em 45 linhas esconde que são 6 frentes, e o
   custo real fica invisível dos dois lados.

3. **"Hoje faz X, eu quero Y" não é pedido de DS.** Quatro itens do lote têm essa forma. O
   que o DS aceita é "hoje não dá para fazer Y" (adição) ou "o DS promete Y e faz X"
   (correção). A diferença não é formalidade: é o que impede um consumidor de mudar o
   produto dos outros.
