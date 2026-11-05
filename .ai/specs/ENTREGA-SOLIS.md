---
titulo: Entrega Sólis (SOLIS-238) — o que saiu, como validar, e o que fica com vocês
status: ENTREGUE 2026-11-05
criado: 2026-11-05
---

# Entrega — SOLIS-238

**Versão:** `@snksergio/design-system@0.71.0` · CLI `@snksergio/create-design-system@0.25.42`

```bash
npm i @snksergio/design-system@0.71.0
npx @snksergio/create-design-system@latest --only-kit   # atualiza o kit de IA
```

---

# O tamanho do que foi pedido

A lista de vocês tinha **45 pedidos**. Não era um bug report — era uma auditoria do Design System inteiro, feita por quem usa todos os dias, tocando **8 componentes diferentes**, o motor de filtro, o de carregamento, o de gráficos e a camada de distribuição.

Foi o maior lote de um único consumidor que este DS já recebeu.

## O que custou, medido

| | |
|---|---|
| **Pull requests** | **18** (`#355` → `#372`), cada um revisado e mergeado individualmente |
| **Commits** | **81**, fora os merges |
| **Arquivos alterados** | **166** |
| **Linhas** | **+19.624** / −1.157 |
| **Arquivos de código** (`src/`) | **121** |
| **Arquivos de documentação e kit de IA** | **35** |

## O que isso fez com a suíte de testes

| | antes | depois |
|---|---|---|
| **Arquivos de teste** | 108 | **142** (+34, **+31%**) |
| **Testes rodando** | — | **1.779 passando** |
| **Blocos de teste novos** | — | **421** |

**Nenhum PR entrou sem a suíte inteira verde.** Nem um.

## Outras superfícies tocadas

| | |
|---|---|
| **Componentes novos** | **2** — `HelpTip` e `FilterChip` |
| **Componentes alterados** | **8** — `DataTable`, `DataList`, `TableToolbar`, `Chart`, `Button`, `Kpi`, `Calendar`, `Tooltip` |
| **Props públicas novas** | **10** só no `DataTable`, mais as de `Chart`, `Button` e dos tipos de coluna |
| **Páginas de showcase atualizadas** | **17** |
| **Documentos `USAGE.md` atualizados** | **11** |
| **Auditorias independentes** | **2** — uma da lista item a item contra o código, outra das 8 superfícies de distribuição |

---

# O placar

```
45 pedidos

  ✅  30   entregues
  ❌   9   não feitos — com motivo E o caminho de como fazer aí
  📦   5   que são do projeto de vocês, não do DS
  ❓   1   que não conseguimos ler (o item 34)
```

> **A régua que guiou tudo:** o DS não muda comportamento de quem não pediu. Correção entra; adição entra como **opt-in**; o que mudaria o que já funciona em outros projetos só entra com decisão explícita. Dessa régua saíram **5 mudanças visíveis** — todas listadas na seção ⚠️ no fim, com o número que justificou cada uma.

> **Onde validar:** o showcase roda em `npm run dev`, porta **3100**. As rotas abaixo são `http://localhost:3100/#/<rota>`.

---

# ✅ Entregues (30)

## Filtros — onde o lote mais mexeu

| # | O que vocês pediram | Como validar |
|---|---|---|
| **1** | o `ownsMulti` entregava só o primeiro valor | `#/filter-chips-lab` — registre um tipo com `ownsMulti`, selecione 3 valores: **os 3** chegam no `filterModel` |
| **2** | o drawer reescrevia o operador ao editar o valor | `#/clients-crud` → **Filtros**, escolha `começa com`, mexa no texto: o operador **fica** |
| **9c** | o chip de faixa repetia o operador | `#/clients-crud` → filtre por faixa: sai `Valor entre R$ 10 e R$ 50`, não `está entre entre` |
| **13** | exportar o `MultiSelectFieldDropdown` | `import { MultiSelectFieldDropdown } from "@snksergio/design-system"` |
| **17v-a** | o carregamento do multi assíncrono | `#/clients-crud` → filtro com `loadOptions`: estado de carga **centrado**, sem empurrar as opções |
| **17v-b** | o "Limpar" aparecia antes de haver o que limpar | mesmo lugar: enquanto carrega, não há "Limpar" |
| **18** | o drawer "Filtros" não fechava por fora | `#/clients-crud` → abra **Filtros** e clique fora. Para controlar pela tela: **`simpleFilter.open`** + **`onOpenChange`** |
| **18v** | lista curta com espaço vazio no popover | filtro com 2 opções: o popover **encolhe** |
| **19v** | o popover do chip mudava de largura ao digitar | `#/clients-crud` → digite num filtro de texto: a largura **fica** |
| **16** | o chip com valor não se distinguia do vazio | **opt-in**: `highlightAppliedFilterChips` no `DataTable`. Sem a prop, **nada muda** |
| **27** | o `3 selecionados` era fixo, em português, com gênero fixo | **`typeOptions: { countLabel: (n) => n + " usinas selecionadas" }`** na coluna |

**Sobre o 1, que foi o achado central do lote:** o `ownsMulti` existe desde a rodada anterior **justamente** para que comportamento específico de um widget não vire PR no DS. Ele nunca funcionou — entregava só o primeiro valor desde o dia em que nasceu. Consertá-lo **dissolveu três pedidos de vocês** em composição do projeto, sem o DS crescer nada.

**Sobre o 27:** foi corrigido em **seis** lugares, não nos dois que pareciam. Num chip multi, os valores chegam ao adapter como N itens de 1 valor cada — então quem colapsa a contagem no uso normal é o adapter, não o tipo. Corrigir só os quatro óbvios deixaria a chave quase inerte justamente nos tipos mais comuns (`select`, `text`).

A configuração é **por coluna** de propósito: o substantivo é da coluna, não da tabela. Uma tela com clientes **e** usinas precisa dos dois ao mesmo tempo — uma prop única só saberia dizer um.

## Tabela

| # | O que vocês pediram | Como validar |
|---|---|---|
| **5a** | o esqueleto piscava a cada página | **`loadingMode="keep"`** → `#/clients-crud-server`. As linhas anteriores ficam, com **uma régua verde no topo** avisando que estão defasadas |
| **5b** | (diagnóstico de vocês, confirmado) | um comentário no código afirmava o contrário do que o código fazia; corrigido e datado |
| **6** | `valueFormatter` da coluna era ignorado | `#/clients-typed` — vale nos **três** tipos: `number`, `currency` e `percentage` |
| **7** | as ações do cabeçalho transbordavam em coluna estreita | `#/clients-crud` → estreite uma coluna: o título **não trunca**. A largura mínima passou a incluir o cabeçalho inteiro |
| **8** | modo servidor com dados controlados | **`processingMode="server"`** → `#/clients-server-rows` |
| **14** | ligar/desligar os ícones de tipo | **`showTypeIcons`** → `#/data-table` |
| **15** | o filtro no cabeçalho | **`enableHeaderFilter`** → `#/data-table` |
| **17** | o menu oferecia ordenar em coluna não-ordenável | `#/clients-crud` → menu de coluna com `sortable: false`: a opção sumiu |
| **19** | expansão condicional por linha | **`isRowExpandable`** → `#/clients-expandable`. A linha sem detalhe perde o chevron **e** o clique |
| **9a** | unidade (`kWh`, `m²`) no campo e no chip | **`typeOptions: { prefix, suffix }`** → `#/clients-typed` |
| **9b** | `between` do `currency` também no chip | `#/clients-typed` → filtre moeda por faixa |
| — | **a busca que falha era muda** | **`onError`** no `DataTable` |

**Sobre o 5a e a régua verde — o trabalho que ninguém pediu e que a correção exigiu.** Segurar as linhas antigas consertou o pisca e **criou um segundo problema**: por ~500ms a tela mostra a página anterior sem nada dizer isso, e o rodapé **já andou de página**. A tela inteira se comporta como se o lote novo tivesse chegado, menos as linhas.

O reflexo seria esmaecer as linhas. **Medimos, e esmaecer reprova a acessibilidade:**

```
opacidade 1,00 → 6,01:1 ✓      0,90 → 4,77:1 ✓      0,88 → 4,56:1 ✓
          0,85 → 4,27:1 ✗      0,80 → 3,83:1 ✗      0,60 → 2,57:1 ✗
```

**O piso para continuar no AA é 0,88** — e esmaecer 12% ninguém enxerga. O que se enxerga, reprova. Fundo também não servia (`bg-muted` resolve para o **mesmo hex** do hover nos dois temas) e animação também não (`animate-pulse` leva a régua a 2,12:1 no vale do ciclo).

A régua de 3px mede **5,06:1 no claro** e **7,63:1 no escuro**, e **não toca uma classe sequer das linhas** — travado por teste. Quem quiser outro sinal lê **`isKeepingPreviousRows`** do `useDataTableContext`.

**Sobre o `onError`:** sem ele, quando o `fetchData` rejeitava, o rodapé continuava anunciando a página nova sobre as linhas velhas — **permanentemente**, sem nada avisar. O rodapé agora para de mentir **mesmo sem a prop**, porque só é afetado quem tem o defeito.

## Lista (`DataList`)

| O que estava errado | Como validar |
|---|---|
| filtros do mesmo campo combinavam por **AND**; na tabela, por **OR** — dois filtros `equals` no mesmo campo **não devolviam ninguém**, em silêncio | `#/data-list` → dois valores no mesmo campo: agora soma, como na tabela |
| desmarcar o último valor **desmontava o chip** no meio da edição, e o popover fechava sozinho | `#/data-list` → abra um chip multi e desmarque tudo: o popover **fica aberto** |
| editar um chip o jogava **para o fim da barra** | `#/data-list` → com 3 chips, edite o do meio: ele **fica no lugar** |

**Sobre o OR — por que o óbvio estava errado.** O pedido era "alinhar à tabela". Medindo, o grão certo é **`campo|operador`**, não `campo`: OR por campo transformaria `nome contém "a"` + `nome não contém "b"` em algo **verdadeiro para qualquer registro**. Uma das mutações de teste — a do grão frouxo — matou **15 testes**, um deles em outro arquivo.

## Fora da tabela

| # | O que vocês pediram | Como validar |
|---|---|---|
| **3** | os filtros de data falavam inglês | `#/date-picker` e `#/calendar` — tudo em pt-BR |
| **4** | "hoje" indistinguível do dia selecionado | `#/calendar` — hoje é **anel**, selecionado é **preenchido** |
| **24** | legenda de 2 linhas achatava a plotagem | **opt-in**: `keepPlotHeight` → `#/chart-bar`. E o **`ChartLegendContent`** passou a ser exportado |
| **28** | estado de vazio no gráfico | **`emptyState`** → `#/chart-showcase` |
| **29** | exportar o `CardAction` | `#/card`. ⚠️ **Chega por copy-in e submódulo, não pelo npm** |
| **30** | o "?" de ajuda avulso | componente novo **`HelpTip`** → `#/help-tip` |
| **32** | o tooltip sumia sobre card em hover | `#/tooltip` — media **1,10:1**; virou superfície invertida |
| **33** | o botão desabilitado não se explicava | **`disabledReason`** → `#/button` |

**De quebra, sem vocês pedirem:** o chip de filtro existia **três vezes copiado** no código (toolbar, `Gantt`, `Scheduler`) e virou um componente só, **`FilterChip`**, agora exportado. Era a cópia não-exportada que produzia as três — peça inalcançável é peça recopiada.

Na unificação, o `Gantt` não mudou **um pixel** (medido no browser, nos dois temas, com a definição antiga lado a lado com a nova) e o `Scheduler` mudou: perdeu uma borda verde que era **acidente, não decisão** — nasceu antes de o chip ter variante de cor.

---

# Como sabemos que funciona

Este lote não foi testado só com "rodei e pareceu certo". A disciplina aplicada em cada PR:

**Prova vermelha antes do conserto.** Todo teste novo foi escrito **antes** da correção e visto **falhando**. Um teste que nasce verde não prova nada.

**Mutação com veredito declarado.** Depois de cada conserto, a linha corrigida era **quebrada de propósito** para confirmar que o teste morria — com o resultado esperado **escrito antes de rodar**. Só nos dois PRs maiores foram **31 mutações**, incluindo as que **deviam sobreviver** e sobreviveram.

Isso pegou coisas que nenhum teste verde pegaria. Um exemplo real: um teste do `loadingMode` passava **por ausência de alvo**, não por ausência de defeito — ele olhava um instante em que o elemento nem existia na tela. Foi a mutação que revelou.

**Medição no browser, nos dois temas**, com as transições desligadas antes de ler qualquer valor — porque medir durante animação devolve número errado.

**Duas auditorias independentes**, instruídas a **não confiar** nos documentos de acompanhamento. A primeira achou **6 pedidos que tinham sumido** dos documentos de estado. A segunda achou documentação que **se contradizia dentro de si mesma** — uma linha afirmando o oposto da linha seguinte sobre a mesma prop.

---

# ❌ Não feitos (9) — com o caminho de como fazer aí

> Nenhum destes está bloqueado. **Em todos, o DS dá as peças.** O que não damos é a regra de negócio, porque ela é de vocês.

| # | O que vocês pediram | Por que não entrou | Como montar no projeto de vocês |
|---|---|---|---|
| **25** | a barra de filtro **fora** da tabela, governando a tela inteira (KPIs, gráficos e tabela) | **o contrato de reação é do produto, não do DS.** Nós sabemos o que `Status é Ativo` significa como *dado*; não sabemos o que "filtrado" significa para um KPI, um mapa, ou um componente que vocês criem mês que vem. Amarrar caso a caso faria o DS virar motor de configuração | ⚠️ **isto já funciona hoje.** O `DataTable` aceita **`filterModel`** controlado e emite **`onFilterModelChange`** — a tela é dona do estado, põe a barra onde quiser e a tabela obedece, **nos dois sentidos**. Para a barra em si: **`TableToolbar`** + **`ToolbarApplied`** + **`FilterChip`** + **`columnTypeRegistry`**, os quatro exportados |
| **26** | rodapé no popover de filtro | seria prop da barra do item 25 | registre um tipo próprio no **`columnTypeRegistry`**: o **`renderFastFilterInput`** dele desenha o popover do chip **inteiro**, rodapé incluso |
| **2b** | `number` abrir em `between` | mudaria o default para **todo** projeto com coluna numérica — comportamento, não correção | tipo próprio no **`columnTypeRegistry`** com a ordem de `operators` que vocês querem |
| **20** | `mode="range"` no `MonthYearPicker` | é **componente novo**, não prop | dois **`MonthYearPicker`** lado a lado; a regra "de ≤ até" fica com vocês |
| **21** | data **com hora** | idem | **`DatePicker`** + um campo de hora ao lado |
| **22** | barras empilhadas **prontas** | exige decidir antes se o DS encapsula o Recharts com API de props. É mudança de postura, não feature | **`ChartContainer`** é exportado e o **`recharts`** vem junto como dependência: monte dentro dele e herde tema, tokens (`chart-1`..`chart-5`), grid e tooltip |
| **23** | ranking horizontal **pronto** | idem | idem |
| **30′** | donut **pronto** | espera um **segundo projeto** pedindo: é o teste de "serve mais de um" | idem |
| **31′** | linha **pronta** | idem | idem |

**Sobre o 25 — vale ler, porque é o mais mal-entendido do lote.** Vocês descreveram como *"o filtro está preso na tabela"*. Fomos ao código: ele **nunca esteve preso**. Está preso **apenas visualmente**. A tabela sempre soube receber e emitir o estado de filtro.

O que o item 25 entregaria é a barra **empacotada** em vez de montada — conveniência, não capacidade. E o custo seria tirar o `columnTypeRegistry` de dentro do `DataTable`, o componente mais usado do sistema. **Pagar refatoração de fundação para poupar uma montagem que já é possível é conta ruim.**

---

# 📦 Do projeto de vocês (5)

São regra de negócio ou composição — o DS dá a peça, a decisão é de vocês.

| # | O que vocês pediram | Como montar aí |
|---|---|---|
| **10** | clique substitui / Ctrl+clique soma | tipo próprio no **`columnTypeRegistry`**: o `renderFastFilterInput` recebe o clique e decide |
| **11** | texto da busca do multi acessível | use **`MultiSelectFieldDropdown`** (exportado no item 13) e componha o rótulo |
| **12** | colar lista (`bulkPaste`) | mesmo caminho do 10 — o tipo próprio controla o widget inteiro |
| **29b** | `ChartCard` | **`Card`** + **`CardHeader`**/**`CardTitle`**/**`CardDescription`** + **`ChartContainer`**. ⚠️ Se virem `Panel` e `CardHead` nos exemplos do showcase, são **helpers locais dele**, forks antigos do `Card` |
| **31** | menu de visão do gráfico | **`DropdownMenu`** trocando o que o `ChartContainer` renderiza |

---

# ❓ O item 34

Ele aparece **uma única vez** no material que recebemos, numa lista de agrupamento, e nunca mais: sem descrição, sem contexto.

**Não conseguimos ler o que era.** É o único dos 45 que não foi nem triado. Se ainda faz falta, mandem o texto e entra na próxima rodada.

---

# ⚠️ O que muda de aparência quando vocês subirem

Cinco coisas. **Todas decididas sabendo do impacto, com o número na mão.** Vale olhar antes de subir em produção.

| o que muda | o número que justificou |
|---|---|
| **todo tooltip** vira superfície invertida | media **1,10:1** sobre card em hover — era ilegível, não "pouco contrastado" |
| **o "hoje" do calendário** vira anel | era **visualmente idêntico** ao dia selecionado |
| **o vazio filtrado** para de dizer *"Nenhum dado cadastrado"* e devolve o **Limpar filtros** | dizia que não existe nada quando existe, **e escondia a única saída**. ⚠️ Afeta quem usa `fetchData` |
| **o chip de faixa** para de repetir o operador | `entre entre R$ 10 e R$ 50` |
| **o carregamento do multi-select** vira estado centrado | era linha de texto empurrando as opções |

**E duas que NÃO mudam nada sem vocês pedirem.** Eram default, e viraram prop depois de avaliadas na tela: o destaque do chip aplicado (`highlightAppliedFilterChips`) e a altura da legenda do gráfico (`keepPlotHeight`).

Essa reversão produziu a regra que hoje governa o DS inteiro:

> **Consertar um defeito não autoriza mudar quem não tinha o defeito.** Ao consertar algo, pergunte: *quem NÃO tem este defeito sente a correção?* Se sim, a correção nasce atrás de prop, e o default é o de hoje.

O destaque do chip, por exemplo, **só paga quando há chip vazio na mesma barra para contrastar**. Numa tela onde todo chip já está aplicado, ele só muda a cor de tudo. E o conserto da legenda mudaria a altura de **todo** gráfico com legenda — inclusive os de 1 linha, que nunca tiveram o problema.

---

# Um detalhe que vale para o dia a dia

A IA de vocês tem o kit do DS instalado (`_claude/`). Ele **já sabe** de tudo que entrou nesta versão — as props novas, as raias do kanban, a união aberta do `filterFields.type`. Atualize com:

```bash
npx @snksergio/create-design-system@latest --only-kit
```

E uma regra que vale repetir: **customizem na composição, não nos internos do DS.** Embrulhar nosso componente no projeto de vocês sobrevive a upgrade; copiar nossos internos vira dívida que não acompanha as versões.
