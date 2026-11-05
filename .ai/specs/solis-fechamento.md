---
titulo: Fechamento do lote Sólis (SOLIS-238) — tudo que foi pedido, contra tudo que aconteceu
status: ATIVO 2026-11-04
criado: 2026-11-04
---

# Fechamento do lote Sólis

> **Este é o documento único.** Os outros cinco do lote continuam existindo como detalhe,
> mas **nenhum deles dá a visão inteira** — e é justamente isso que este resolve.
>
> Ele foi escrito depois de uma **auditoria independente** da lista original contra o código
> da `main` e o histórico do git. A auditoria foi instruída a **não confiar** nos meus
> documentos de acompanhamento — e fez bem: ela achou **seis pedidos que sumiram** deles.
> Isso está na seção 🔴, que é a primeira por ser a que importa.

---

# O placar

```
45 pedidos no SOLIS-238

  ✅  28   FEITOS, na main
  ◐    1   FEITO PELA METADE          ← precisa da sua atenção
  📦   5   DEVOLVIDOS ao projeto Sólis (não são do DS)
  ❌  10   NÃO FEITOS, com decisão     ← mas 6 delas você nunca viu
  ⚠️   1   NUNCA NEM FOI LIDO          ← precisa da sua atenção

 +  2   feitos AGORA, em PR aberto (P8 e o chip que pulava)
 +  9   achados no caminho, todos decididos por você hoje
```

⚠️ **Uma ressalva honesta sobre o número 45.** A conta fecha em 45, mas por uma inferência:
a triagem classificou **42** pedidos, e os 3 restantes são justamente os que não têm classe
nenhuma — o item 34 e dois gráficos cuja numeração colide (detalhe no 🔴 nº 5). **Se a
leitura certa for a outra, o total é 43 e faltam 2 pedidos que ninguém localizou.** Só o
ticket original do Sólis desempata.

---

# 🔴 PRECISA DE VOCÊ — o que ficou aberto sem decisão sua

Esta é a seção que você pediu: *"se você encontrar algum que ficou aberto sem a minha
aprovação, sem explicação do porquê, deixe também separado"*. Encontrei **cinco coisas**.

## 1. O item 34 nunca foi lido por ninguém

Ele aparece **uma única vez** em todo o material, numa lista de agrupamento
(`solis-pedidos-2-analise.md:105`), e **nunca mais**: sem caso a caso, sem classe, sem
menção no plano, no ledger, na folha de decisão ou na resposta ao Sólis.

**Não sei o que é o item 34.** É o único pedido do lote que nunca foi nem triado.

> **O que fazer:** pedir ao Sólis o texto do item 34. Qualquer outra coisa é adivinhação.

## 2. O `percentage` ficou de fora de uma correção que você aprovou

O **item 6** era: *"`number` e `currency` ignoram o `valueFormatter` da coluna"*. Durante o
trabalho, ficou registrado no ledger que **o `percentage` tem o mesmo defeito** e que seria
incluído no mesmo escopo:

> *"o tipo `percentage` tem o MESMO defeito (renderCell ignora valueFormatter). Corrigir 2 de
> 3 deixa o DS discordando de si mesmo no terceiro… Adicionado ao escopo da Task 15"*

**A Task 15 rodou e não tocou o `percentage`.** Conferido no código agora:

```tsx
// percentage-column-type.tsx:76  — ignora column.valueFormatter
renderCell: ({ value, column }) => {
  const opts = column?.typeOptions as PercentageTypeOptions | undefined;
  return <span className="tabular-nums">{toPercent(value, opts)}</span>;
}

// number-column-type.tsx:170  — honra
renderCell: ({ value, column }) => {
  if (column?.valueFormatter) return <span className="tabular-nums">{column.valueFormatter(value)}</span>;
  ...
}
```

**Não é pedido novo — é metade de um que você já aprovou.** O argumento que o justificou
("o DS discordando de si mesmo") continua valendo no terceiro tipo, e o conserto é uma linha.

> **Minha recomendação: terminar.** Mas não fiz por conta: você está justamente tentando
> recuperar visibilidade, e acrescentar mudança não pedida agora trabalharia contra isso.

## 3. Seis pedidos sumiram de todos os documentos de estado

Os itens **20, 21, 22, 23, 25 e 26** foram adiados — mas a decisão vive **só** numa seção de
um documento de planejamento (`solis-rodadas-plano.md`, seção *"Fora deste plano"*), escrita
**antes** das rodadas começarem e que ninguém mais abriu desde então.

Eles **não** estão na folha de decisão. **Não** estão no backlog. **Não** estão no documento
das nove. E, pior: o documento das três listas se apresenta como *"o que **ninguém** fez
ainda"* e lista só os 15 P-itens.

**Quem lesse a folha de decisão hoje concluiria que o lote acabou.** Não acabou.

| # | o que é | por que foi adiado |
|---|---|---|
| **25 + 26** | `FilterBar` fora do `DataTable`, e `filterFooter` no popover | extrair o motor é **decisão de arquitetura** — muda onde mora o `columnTypeRegistry`, o `ToolbarApplied` e o estado de filtro |
| **22 + 23** | barras empilhadas e ranking horizontal **prontos** | é a decisão de o DS passar a **encapsular Recharts com API de props**. Falta decidir se entra |
| **20 + 21** | `mode="range"` no `MonthYearPicker` e data **com hora** | são **componentes novos**, não props |

> **O que fazer:** os três pares são decisões de verdade, não esquecimento. Mas estavam
> esperando você sem você saber. Os seis agora estão no
> [`backlog-solis.md`](./backlog-solis.md), cada um com motivo, esforço e se o projeto
> consegue montar sozinho — ou você decide agora.

## 4. O item 27 foi encerrado apontando para a prop errada

O item 27 pedia **texto de contagem configurável**. Foi fechado no plano com *"`selectionConfig.countLabel` já existe desde a v0.69.0"*.

**Essa prop é de outra superfície.** Ela vive em `DataTableSelectionConfig` e é consumida
pela **barra de seleção de linhas** (`bulk-actions-bar.tsx:56`). O item 27 está na seção
*"Filtros fora da tabela"* da triagem — e a contagem do **contexto de filtro** continua
literal no código:

```tsx
`${labels.length} selecionados`   // multi-select-column-type.tsx:478 e :552
```

O plano previa **perguntar ao Sólis qual tela é**. Não achei registro dessa pergunta ter
sido feita.

> **O que fazer:** perguntar antes de considerar resolvido.

## 5. O item 30 tem dois significados vivos ao mesmo tempo

O documento de triagem diz, em dois lugares diferentes, que o item 30 é (a) um **"?" de ajuda
avulso** e (b) um **gráfico donut pronto**. Os dois caminhos foram seguidos: o "?" **foi
feito** (virou o componente `HelpTip`), e o donut **foi adiado**.

Não dá para saber, pelos documentos, se donut e linha são dois pedidos reais do Sólis ou um
erro de numeração. É esta ambiguidade que torna o total 45 ou 43.

> **O que fazer:** conferir no ticket original. É a mesma consulta do item 34.

---

# ✅ O QUE FOI ENTREGUE — 28 pedidos, todos na `main`

Dez PRs, todos mergeados. Nenhum deles mudou comportamento de quem não pediu.

| PR | o que fechou |
|---|---|
| **#355** | Rodada 1 — 6 correções |
| **#356** | Rodada 2 — a região do cabeçalho (itens 17, 15, 14, 7) |
| **#358** | paridade do `ownsMulti` e o filtro multi que esvaziava a lista |
| **#360** | o drawer preserva o operador + `simpleFilter.open` (itens 2 e 18) |
| **#361** | Rodada 5 — as 9 tarefas restantes + os 4 itens C aprovados |
| **#362** | o chip destacado e a legenda do `Chart` **viram opt-in** |
| **#363** | o motor de filtro do `DataList` + o chip unificado |
| **#364** | o estado das pendências |

### Por grupo, para você reconhecer o que pediu

**Filtros que mentiam ou travavam** — itens 1, 2, 17v-a, 17v-b, 18, 18v, 19v
O `ownsMulti` entregava **só o primeiro valor** · o drawer **reescrevia o operador** ao editar
o valor · o "Limpar" aparecia antes de haver o que limpar · o popover do chip mudava de
largura · o drawer "Filtros" não fechava por fora.

**Cabeçalho e colunas** — itens 7, 14, 15, 17
Ações transbordavam em coluna estreita · `showTypeIcons` · `enableHeaderFilter` · o menu
oferecia "ordenar" em coluna que não ordena.

**Formatação de célula** — itens 6, 9a, 9b, 9c
`valueFormatter` honrado em `number` e `currency` (⚠️ **não** em `percentage` — ver 🔴 nº 2) ·
`prefix`/`suffix` · `between` do `currency` no chip · chip de faixa sem o rótulo do operador.

**Carregamento e dados** — itens 5a, 5b, 8, 19
`loadingMode="keep"` mata o pisca da paginação · `processingMode: "client" | "server"` ·
expansão condicional por linha.

**Datas** — itens 3, 4
Os filtros de data falavam **inglês** · "hoje" era indistinguível do dia selecionado.

**Fora da tabela** — itens 13, 28, 29, 30, 32, 33
`MultiSelectFieldDropdown` exportado · `emptyState` no `ChartContainer` · `CardAction`
exportado · o `HelpTip` (o "?" de ajuda) · o tooltip sumia sobre card em hover ·
`Button.disabledReason`.

**Legenda do gráfico** — item 24
A legenda de 2 linhas achatava a plotagem. ⚠️ Virou a prop `keepPlotHeight` depois que você
viu na tela — ver a seção 🆕.

---

# 📦 DEVOLVIDOS AO PROJETO — 5 pedidos que não são do DS

São os classificados **D**: composição, estilo ou regra de negócio do Sólis. Cada um foi
devolvido **com o caminho das pedras**, não com um "não".

| # | o que é | por que é do projeto |
|---|---|---|
| **10** | clique substitui / Ctrl+clique soma | regra de interação de **um** app; o DS dá o ponto de extensão |
| **11** | texto da busca do multi acessível | composição |
| **12** | colar lista (`bulkPaste`) | comportamento exclusivo → tipo registrado no `columnTypeRegistry` |
| **29b** | `ChartCard` | composição de `Panel` + `ChartContainer`, receita já documentada |
| **31** | menu de visão do gráfico | regra de produto |

A resposta pronta para mandar ao time está em
[`solis-resposta-itens-do-projeto.md`](./solis-resposta-itens-do-projeto.md).

---

# ❌ NÃO FEITOS, COM DECISÃO — 10

> ⚠️ **Seis destes você está vendo pela primeira vez** — são os do 🔴 nº 3.

| # | o que é | decisão |
|---|---|---|
| **2b** | `number` deveria abrir em `between` | **reclassificado para C**: mudar o default reordena `def.operators` e muda 4 comportamentos visíveis. É mudança de comportamento, não correção |
| **20** | `mode="range"` no `MonthYearPicker` | componente novo, não prop — espera spec |
| **21** | data com hora (`DateTimePicker`) | idem |
| **22** | barras empilhadas prontas | exige decidir se o DS encapsula Recharts com API de props |
| **23** | ranking horizontal pronto | idem |
| **25** | `FilterBar` fora do `DataTable` | decisão de arquitetura: muda onde mora o motor de filtro |
| **26** | `filterFooter` no popover | é prop da `FilterBar` — planejar antes seria remendo no drawer |
| **27** | texto de contagem configurável | ⚠️ **decisão frágil** — ver 🔴 nº 4 |
| **30′** | donut pronto | espera um **segundo consumidor** pedindo: é o teste de "serve mais de um projeto" |
| **31′** | linha pronta | idem |

---

# 🆕 O QUE APARECEU NO CAMINHO — 9 achados, todos decididos hoje

Nada disto estava na lista do Sólis. **Foram encontrados enquanto o trabalho acontecia** —
uns porque as mudanças os expuseram, outros simplesmente porque alguém olhou de perto.

## Feitos

| o quê | por que foi feito |
|---|---|
| **O `DataList` combinava filtros por AND**, a tabela por OR — dois filtros no mesmo campo **não devolviam ninguém** | os dois lados do DS discordavam. ⚠️ O grão certo é `field\|operator`, não `field` |
| **Desmarcar o último valor desmontava o chip** no meio da edição, e o popover fechava sozinho | o chip é a **âncora** do popover |
| **A busca que falhava era muda** e o rodapé mentia para sempre | ganhou `onError`, e o rodapé parou de mentir |
| **O chip de filtro existia três vezes** no código (toolbar, Gantt, Scheduler) | virou o componente `FilterChip`. ⚠️ O `Scheduler` mudou de aparência — perdeu uma borda verde que era **acidente**, não decisão |
| **O chip pulava de posição** ao ser editado | 🔵 **em PR aberto agora** — [#365](https://github.com/igreenlab/igreen-desingsystem-admin/pull/365) |
| **As linhas mantidas pelo `keep` não tinham sinal visual** | 🔵 **em PR aberto agora** — [#366](https://github.com/igreenlab/igreen-desingsystem-admin/pull/366) |

## A reversão que você pediu, e que mudou o lote inteiro

Depois de ver na tela, você decidiu que **o item 16** (chip de filtro destacado) e **a legenda
do `Chart`** (item 24) deveriam ser **props**, não default. Isso virou o PR
[#362](https://github.com/igreenlab/igreen-desingsystem-admin/pull/362) e a regra que hoje está
escrita no `ds-standards.md`:

> **Consertar um defeito não autoriza mudar quem não tinha o defeito.** Ao consertar algo,
> pergunte: *"quem NÃO tem este defeito sente a correção?"* Se sim, a correção nasce atrás de
> prop, e o default é o de hoje.

⚠️ **Mas quatro itens C continuam ligados por default**, e isso merece um olhar seu: os itens
**4** (o "hoje" do calendário), **9c** (chip de faixa sem operador), **17v-spinner** e **32**
(token do tooltip). Os itens 16 e 24 voltaram a ser opt-in; estes quatro não. Todos foram
aprovados por você na época — a assimetria é de forma, não de autorização.

## Decididos contra, e guardados

As outras três coisas que apareceram — um par de cor que reprova o contraste (3,14:1, pior
que o que motivou a P14), um export morto e um teste instável — você decidiu ignorar hoje.
Estão preservadas, com o motivo de cada uma, em
[`backlog-solis.md`](./backlog-solis.md) — junto de **todas** as 23 que não foram feitas.

---

# ⏸️ O QUE FALTA PARA FECHAR

```
PR #365   chip preserva posição          aguardando seu merge
PR #366   sinal das linhas defasadas     aguardando seu merge
───────────────────────────────────────────────────────────────
Release v0.71.0                          aguardando DUAS autorizações suas
```

⚠️ **Nada do lote está no changelog, e a release não foi cortada.** O `package.json` ainda
diz `0.70.1` e o topo da timeline é a entrada de 23/10. **As 28 entregas estão na `main` e
fora da timeline** — ou seja, quem olhar a página de Updates não vê nada disto.

**As duas autorizações que eu não posso assumir das rodadas anteriores:**

1. **O bump** de `package.json.version` para `0.71.0`
2. **O `npm publish`** — nesta conta ele pede **o seu OTP, no seu terminal**

---

# Onde eu começaria

1. **Mandar as duas perguntas ao Sólis** — o que é o item 34, e se donut/linha são pedidos
   reais. São as duas únicas coisas que nenhum esforço daqui resolve.
2. **Terminar o `percentage`** — uma linha, de um item que você já aprovou pela metade.
3. **Decidir os seis que você nunca viu** — ou mandá-los ao backlog formalmente.
4. **Publicar.** O time usa isto todo dia; o feedback deles reordena o resto melhor do que eu.

---

## Os outros documentos do lote

| arquivo | para quê |
|---|---|
| [`solis-pedidos-2-analise.md`](./solis-pedidos-2-analise.md) | **a lista original** e a triagem A/B/C/D de cada pedido |
| [`solis-para-avaliar.md`](./solis-para-avaliar.md) | as 9 achadas no caminho, com o porquê de cada veredito |
| [`solis-resposta-itens-do-projeto.md`](./solis-resposta-itens-do-projeto.md) | o texto pronto para mandar ao time sobre os 5 devolvidos |
| [`solis-rodadas-plano.md`](./solis-rodadas-plano.md) | o plano de execução e o ritual de prova |
| [`backlog-solis.md`](./backlog-solis.md) | **as 23 que não foram feitas**, com motivo, recomendação, impacto, esforço e se o projeto monta sozinho |

⚠️ **A [folha de decisão](./solis-folha-de-decisao.md) e o
[documento das três listas](./solis-o-que-sai-e-o-que-fica.md) estão incompletos** — foi a
auditoria que mostrou isso. Eles cobrem só os P-itens e não mencionam os seis do 🔴 nº 3.
**Use este arquivo, não aqueles.**
