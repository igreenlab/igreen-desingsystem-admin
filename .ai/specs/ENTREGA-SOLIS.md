---
titulo: Entrega Sólis (SOLIS-238) — o que saiu, como validar, e o que fica com vocês
status: ENTREGUE 2026-11-05
criado: 2026-11-05
---

# Entrega — SOLIS-238

**Versão:** `@snksergio/design-system@0.71.0` · CLI `@snksergio/create-design-system@0.25.41`

```bash
npm i @snksergio/design-system@0.71.0
```

Dos **45 pedidos**: **30 entregues** · **9 não feitos, com motivo** · **5 que são do projeto de vocês** · **1 que não conseguimos ler**.

> **A régua que guiou tudo:** o DS não muda comportamento de quem não pediu. Correção entra; adição entra como **opt-in**; o que mudaria o que já funciona em outros projetos só entra com decisão explícita. Dessa régua saíram 5 mudanças visíveis — todas listadas na seção ⚠️ no fim.

> **Onde validar:** o showcase roda em `npm run dev`, porta **3100**. As rotas abaixo são `http://localhost:3100/#/<rota>`.

---

# ✅ Entregues (30)

## Filtros

| # | O que vocês pediram | Como validar |
|---|---|---|
| **1** | o `ownsMulti` entregava só o primeiro valor | `#/filter-chips-lab` — registre um tipo com `ownsMulti`, selecione 3 valores: os 3 chegam no `filterModel` |
| **2** | o drawer reescrevia o operador ao editar o valor | `#/clients-crud` → abra **Filtros**, escolha `começa com`, mexa no texto: o operador fica |
| **9c** | o chip de faixa repetia o operador | `#/clients-crud` → filtre um valor por faixa: sai `Valor entre R$ 10 e R$ 50`, não `está entre entre` |
| **13** | exportar o `MultiSelectFieldDropdown` | `import { MultiSelectFieldDropdown } from "@snksergio/design-system"` |
| **17v-a** | o carregamento do multi assíncrono | `#/clients-crud` → abra um filtro com `loadOptions`: o estado de carga fica centrado, sem empurrar as opções |
| **17v-b** | o "Limpar" aparecia antes de haver o que limpar | mesmo lugar: enquanto carrega, não há "Limpar" |
| **18** | o drawer "Filtros" não fechava por fora | `#/clients-crud` → abra **Filtros** e clique fora. Para controlar pela tela: **`simpleFilter.open`** + **`onOpenChange`** |
| **18v** | lista curta com espaço vazio no popover | filtro com 2 opções: o popover encolhe |
| **19v** | o popover do chip mudava de largura ao digitar | `#/clients-crud` → digite num filtro de texto: a largura fica |
| **16** | o chip com valor não se distinguia do vazio | **opt-in**: `highlightAppliedFilterChips` no `DataTable`. Sem a prop, nada muda |
| **27** | o `3 selecionados` era fixo, em português, com gênero fixo | **`typeOptions: { countLabel: (n) => n + " usinas selecionadas" }`** na coluna. É **por coluna**: o substantivo é da coluna, não da tabela |

## Tabela

| # | O que vocês pediram | Como validar |
|---|---|---|
| **5a** | o esqueleto piscava a cada página | **`loadingMode="keep"`** → `#/clients-crud-server`. As linhas anteriores ficam, com **uma régua verde no topo** avisando que estão defasadas. Quem quiser outro sinal lê **`isKeepingPreviousRows`** do `useDataTableContext` |
| **5b** | (diagnóstico de vocês, confirmado) | um comentário no código afirmava o contrário do que o código fazia; corrigido e datado |
| **6** | `valueFormatter` da coluna era ignorado | `#/clients-typed` — vale em **`number`, `currency` e `percentage`** |
| **7** | as ações do cabeçalho transbordavam em coluna estreita | `#/clients-crud` → estreite uma coluna: o título não trunca mais; a largura mínima passou a incluir o cabeçalho inteiro |
| **8** | modo servidor com dados controlados | **`processingMode="server"`** → `#/clients-server-rows`. A tela pagina e filtra, a tabela só mostra |
| **14** | ligar/desligar os ícones de tipo | **`showTypeIcons`** → `#/data-table` |
| **15** | o filtro no cabeçalho | **`enableHeaderFilter`** → `#/data-table` |
| **17** | o menu oferecia ordenar em coluna não-ordenável | `#/clients-crud` → menu de uma coluna com `sortable: false`: a opção sumiu |
| **19** | expansão condicional por linha | **`isRowExpandable`** → `#/clients-expandable`. A linha sem detalhe perde o chevron **e** o clique |
| **9a** | unidade (`kWh`, `m²`) no campo e no chip | **`typeOptions: { prefix, suffix }`** → `#/clients-typed` |
| **9b** | `between` do `currency` também no chip | `#/clients-typed` → filtre moeda por faixa |
| — | **a busca que falha era muda** | **`onError`** no `DataTable`. Sem ela, o rodapé anunciava a página nova sobre as linhas velhas **para sempre**; agora ele para de mentir mesmo sem a prop |

## Lista (`DataList`)

| O que estava errado | Como validar |
|---|---|
| filtros do mesmo campo combinavam por **AND**; na tabela, por **OR** — dois filtros `equals` no mesmo campo **não devolviam ninguém** | `#/data-list` → ponha dois valores no mesmo campo: agora soma, como na tabela |
| desmarcar o último valor **desmontava o chip** no meio da edição, e o popover fechava sozinho | `#/data-list` → abra um chip multi e desmarque tudo: o popover fica aberto |
| editar um chip o jogava **para o fim da barra** | `#/data-list` → com 3 chips, edite o do meio: ele fica no lugar |

## Fora da tabela

| # | O que vocês pediram | Como validar |
|---|---|---|
| **3** | os filtros de data falavam inglês | `#/date-picker` e `#/calendar` — tudo em pt-BR |
| **4** | "hoje" indistinguível do dia selecionado | `#/calendar` — hoje é **anel**, selecionado é **preenchido** |
| **24** | legenda de 2 linhas achatava a plotagem | **opt-in**: `keepPlotHeight` no `ChartContainer` → `#/chart-bar`. E o **`ChartLegendContent`** passou a ser exportado, usável fora |
| **28** | estado de vazio no gráfico | **`emptyState`** no `ChartContainer` → `#/chart-showcase` |
| **29** | exportar o `CardAction` | `#/card`. ⚠️ **Chega por copy-in e submódulo, não pelo pacote npm** — o barrel do npm só exporta Badge, Input e InputGroup de `shadcn/` |
| **30** | o "?" de ajuda avulso | componente novo **`HelpTip`** → `#/help-tip` |
| **32** | o tooltip sumia sobre card em hover | `#/tooltip` — media **1,10:1**; virou superfície invertida, com token próprio e dark-aware |
| **33** | o botão desabilitado não se explicava | **`disabledReason`** no `Button` → `#/button` |

**De quebra, sem vocês pedirem:** o chip de filtro existia **três vezes** copiado no código (toolbar, Gantt, Scheduler) e virou um componente só, **`FilterChip`**, agora exportado. Era a cópia não-exportada que produzia as três.

---

# ❌ Não feitos (9) — com o caminho de como fazer aí

> Nenhum destes está bloqueado. **Em todos, o DS dá as peças** — o que não damos é a regra de negócio, porque ela é de vocês.

| # | O que vocês pediram | Por que não entrou | Como montar no projeto de vocês |
|---|---|---|---|
| **25** | a barra de filtro **fora** da tabela, governando a tela inteira (KPIs, gráficos e tabela) | **o contrato de reação é do produto, não do DS.** Nós sabemos o que `Status é Ativo` significa como *dado*; não sabemos o que "filtrado" significa para um KPI, um mapa, ou um componente que vocês criem mês que vem. Amarrar caso a caso faria o DS virar motor de configuração | ⚠️ **isto já funciona hoje.** O `DataTable` aceita **`filterModel`** controlado e emite **`onFilterModelChange`** — a tela é dona do estado, põe a barra onde quiser e a tabela obedece, nos dois sentidos. Para a barra em si: **`TableToolbar`** + **`ToolbarApplied`** + **`FilterChip`** + **`columnTypeRegistry`**, os quatro exportados |
| **26** | rodapé no popover de filtro (botões, contagem, ação extra) | seria prop da barra do item 25; sem ela vira prop do `DataTable` descendo 4 níveis | registre um tipo próprio no **`columnTypeRegistry`**: o **`renderFastFilterInput`** dele desenha o popover do chip **inteiro**, rodapé incluso. ⚠️ Vale para o popover do chip, não para o painel avançado |
| **2b** | `number` abrir em `between` em vez de `equals` | mudaria o default para todo projeto que usa colunas numéricas — é mudança de comportamento, não correção | tipo próprio no **`columnTypeRegistry`** com a ordem de `operators` que vocês querem |
| **20** | `mode="range"` no `MonthYearPicker` | é **componente novo**, não prop — precisa de desenho antes | dois **`MonthYearPicker`** lado a lado; a regra "de ≤ até" fica com vocês |
| **21** | data **com hora** | idem — componente novo | **`DatePicker`** + um campo de hora ao lado |
| **22** | barras empilhadas **prontas** | exige decidir antes se o DS passa a encapsular o Recharts com API de props. É mudança de postura, não feature | **`ChartContainer`** é exportado e o **`recharts`** vem junto como dependência do DS: monte o gráfico dentro dele e herde tema, tokens (`chart-1`..`chart-5`), grid e tooltip |
| **23** | ranking horizontal **pronto** | idem | idem — `ChartContainer` + Recharts |
| **30′** | donut **pronto** | espera um **segundo projeto** pedindo: é o teste de "serve mais de um" | idem |
| **31′** | linha **pronta** | idem | idem |

---

# 📦 Do projeto de vocês (5)

São regra de negócio ou composição — o DS dá a peça, a decisão é de vocês.

| # | O que vocês pediram | Como montar aí |
|---|---|---|
| **10** | clique substitui / Ctrl+clique soma | tipo próprio no **`columnTypeRegistry`**: o `renderFastFilterInput` dele recebe o clique e decide. É regra de interação de um app, não do sistema |
| **11** | texto da busca do multi acessível | composição: use **`MultiSelectFieldDropdown`**, que foi exportado no item 13, e componha o rótulo que vocês querem |
| **12** | colar lista (`bulkPaste`) | mesmo caminho do 10 — o tipo próprio controla o widget inteiro |
| **29b** | `ChartCard` | composição de **`Card`** + **`CardHeader`** / **`CardTitle`** / **`CardDescription`** + **`ChartContainer`**. ⚠️ Se virem `Panel` e `CardHead` nos exemplos do showcase, são **helpers locais dele**, forks antigos do `Card` — em card novo use o `Card`, que cobre o que eles faziam |
| **31** | menu de visão do gráfico | regra de produto: monte com **`DropdownMenu`** trocando o que o `ChartContainer` renderiza |

---

# ❓ O item 34

Ele aparece **uma única vez** no material que recebemos, numa lista de agrupamento, e nunca mais: sem descrição, sem contexto.

**Não conseguimos ler o que era.** Se ainda faz falta, nos mandem o texto dele e entra na próxima rodada.

---

# ⚠️ O que muda de aparência quando vocês subirem

Cinco coisas, todas decididas sabendo do impacto. **Vale olhar antes de subir em produção.**

| o que muda | por quê |
|---|---|
| **todo tooltip** vira superfície invertida | media **1,10:1** sobre card em hover — era ilegível |
| **o "hoje" do calendário** vira anel | era indistinguível do dia selecionado |
| **o vazio filtrado** para de dizer *"Nenhum dado cadastrado"* e devolve o **Limpar filtros** | dizia que não existe nada quando existe, e escondia a única saída. ⚠️ Afeta quem usa `fetchData` |
| **o chip de faixa** para de repetir o operador | `entre entre R$ 10 e R$ 50` |
| **o carregamento do multi-select** vira estado centrado | era linha de texto empurrando as opções |

**E duas que NÃO mudam nada sem vocês pedirem** — eram default e viraram prop depois de avaliadas na tela: o destaque do chip aplicado (`highlightAppliedFilterChips`) e a altura da legenda do gráfico (`keepPlotHeight`).

---

# Um detalhe que vale para o dia a dia

A IA de vocês tem o kit do DS instalado (`_claude/`). Ele **já sabe** de tudo que entrou nesta versão — as props novas, as raias do kanban, a união aberta do `filterFields.type`. Rode o `npx @snksergio/create-design-system@latest --only-kit` para atualizar o kit e peça direto a ela.

Uma regra que vale repetir: **customizem na composição, não nos internos do DS.** Embrulhar nosso componente no projeto de vocês sobrevive a upgrade; copiar nossos internos vira dívida que não acompanha as versões.
