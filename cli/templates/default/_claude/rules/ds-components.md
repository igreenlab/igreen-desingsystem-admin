---
description: Vocabulário de componentes do iGreen DS — QUAL usar pra cada tarefa, e por quê
globs: ["**/*.tsx", "**/*.styles.ts"]
alwaysApply: true
---

# Que componente usar (iGreen DS)

Os nomes abaixo são os **ids do registry**. Para trazer um: `npm run igreen:add -- <id>`
— exceto em **modo submódulo** (existe `.claude/ds-config.json` com `"mode": "submodule"`),
onde tudo já está no disco em `<dsPath>/src` e você só importa pelo `importBase`.

**Onde está a API** (não invente props — nenhuma das duas fontes é sua memória):

- **Compostos do iGreen** (`components/ui/<Nome>/`) vêm com **`USAGE.md` ao lado** — props,
  variants, gotchas. Leia antes de compor.
- **Primitivos** não têm USAGE por arquivo (a API é a padrão shadcn/Radix, e eles já chegam
  re-estilizados nos tokens do DS) — mas **têm índice de pegadinhas**:
  **`.claude/skills/ds-kit/shadcn-gotchas.md`**. Leia antes de montar `select`, `sonner`,
  `tabs`, `tooltip` e os flutuantes: são gotchas que não dão erro, só resultado errado.
  ⚠️ No copy-in eles caem em **`components/ui/` como arquivo solto** (`ui/badge.tsx`,
  `ui/input.tsx`, `ui/avatar.tsx`), não numa pasta `components/shadcn/` — os itens de
  COMPONENTE do registry apontam para `components/ui/` (os demais vão pra `src/lib`,
  `src/utils`, `src/styles/theme` e `examples/`). Importe `@/components/ui/badge`.
  ⚠️ Em **modo submódulo** o layout é OUTRO: você lê o repo do DS, onde os primitivos ficam
  em `<importBase-irmão>/components/shadcn/<nome>` (kebab) e só os compostos em
  `components/ui/<Nome>`. O `ds-config.json` traz os dois caminhos (`importBase` e
  `primitivesBase`).

Catálogo visual: **https://igreen-desingsystem-admin.vercel.app**.

> Não existe "componente shadcn" vs "componente iGreen" pra você: todos chegam por
> `@igreen/<nome>` e todos já seguem os tokens do DS. Escolha pela tarefa, não pela origem.

> **Escopo desta regra: QUAL componente.** Como estilizar (tokens, spacing, foco, cor,
> tipografia) está em `ds-design.md` — deliberadamente não repetido aqui, pra as duas
> regras não divergirem.

## Formulário

`form-field` é wrapper **obrigatório** de todo campo — nunca `<label>` cru (ele cuida de
label, helper, erro e do `htmlFor`).

| Precisa de | Use |
|---|---|
| texto curto / longo | `input` · `textarea` |
| escolher de uma lista | `select` — muitas opções + busca → `combobox` |
| liga/desliga | `switch` (aplica na hora) · `checkbox` (confirma no submit) |
| **escolha em CARD** (área grande, label + descrição) — plano, frete, permissão, lista de settings | **`card-option`** — o controle é prop: type = checkbox \| radio \| switch. **switch = efeito IMEDIATO, sem Salvar, e só com layout=list (Apple HIG: switch mora em linha de lista); tela com botão Salvar → type=checkbox.** Opções que se COMPARAM (plano, tier, preço, descrição longa) → cards espaçados; itens do mesmo tipo com rótulo curto (settings, permissões, meio de pagamento, endereço) → layout=list. On/off de UMA coisa nunca são 2 radios: é switch (imediato) ou 1 checkbox (com submit). Mais de ~5 opções → não é card-option: `select` ou `combobox`. type=radio exige CardOptionGroup em volta. Em lista o selecionado NÃO pinta por default (ali a borda do item é a divisória) — queira o pintado, ligue highlightSelected no grupo. Omita orientation, highlightSelected e size (derivam do type; md é o padrão) |
| escolha em bloco visual, só checkbox | `card-checkbox` — atalho de `card-option` com `type="checkbox"`; componente novo usa `card-option` |
| uma entre várias | `radio-group` (campo compacto) — em card, `card-option` com `type="radio"` |
| data | `date-picker` — `mode`: `single` (default) · `range` · `multiple` |
| só mês/ano | `month-year-picker` |
| agenda de EVENTOS (não é campo de data) | `scheduler` — ver o grupo de dados |
| CRONOGRAMA com dependência entre tarefas | `gantt` — ver o grupo de dados |
| arquivo | `file-upload-field` |
| código / OTP | `input-otp` — mesmos `size` (`xxs`/`xs`/`sm`/`md`) e `state` do `input`, então num form misto use o MESMO size dos dois. `variant`: `connected` (default) · `outlined` · `filled` · `underline` |
| cor | `color-picker` |
| faixa numérica | `slider` |
| prefixo, sufixo, ícone ou botão **dentro** do campo | `input-group` — não componha na mão |

## Abas e alternância de visão

- `tabs` — seções de conteúdo. Duas props no `<Tabs>` (propagadas por contexto, nunca no
  List/Trigger): **`variant`** `"segmented"` (default) dentro de superfície — card, bloco,
  Panel, FloatingPanel, Modal, drawer · `"line"` para seções de página. **`fullWidth`** em
  superfície compacta; hug em toolbar/página. ⛔ nunca `w-full`/`flex-1` na mão.
- `tabs-navigation` — **abas de NAVEGADOR**, não de conteúdo: cada aba é uma **sessão aberta**
  (conversa, chamado, registro) que o usuário abre, troca e fecha, com avatar/ícone, status e
  ações próprias. Critério: se o usuário **abre e fecha** as abas → `tabs-navigation`; se as seções
  são fixas dentro da tela → `tabs`. É controlado (`value`/`onValueChange`) e **não hospeda o
  conteúdo** — o painel pode morar em outra coluna ou rota (aí a aba leva `panelId`). ⛔ nunca
  monte a tira na mão com margem negativa: a união da aba ativa com o conteúdo é o componente.
- `button-group` — ações relacionadas lado a lado; uma dispara, **não guarda estado**.
- `toggle-group` — modo ou filtro que **persiste** · `toggle` para um só, on/off.
- ⚠️ Alternar tabela ↔ cards dos **mesmos dados** não é nenhum dos três: é `viewMode`
  do `data-table` (com `listConfig`). Não monte duas telas paralelas.

## Feedback e estado

| Situação | Use |
|---|---|
| notificação rica (title, description, ação) | `toast` — **prefira este** |
| toaster cru | `sonner` — monte `<Toaster/>` 1× no root; o `toast` roda sobre ele |
| aviso fixo dentro da página | `alert` |
| confirmar ação destrutiva | `alert-modal` — **obrigatório** antes de excluir, nunca delete direto |
| sem dados / primeira vez | `empty-state` |
| **página/área inteira carregando** (slot de conteúdo, card, section) | `screen-loader` — spinner centrado + título/subtítulo (default) ou `variant="skeleton"` genérico (skeletonLayout: page default · dashboard · kpis). Preenche o PAI (que precisa ter altura); omita size (md é o padrão). NÃO é overlay nem loading inline |
| carregando pedaço com layout conhecido / ação pontual | `skeleton` (silhueta custom composta na mão) · `spinner` (pontual, inline em botão) |
| progresso conhecido | `progress` |

## Sobreposição (o que cobre a tela)

| Quando | Use |
|---|---|
| clique, ancorado, conteúdo curto | `popover` |
| lista de ações a partir de um gatilho | `dropdown-menu` |
| clique com o botão direito | `context-menu` |
| hover: dica de 1 linha / prévia rica | `tooltip` · `hover-card` |
| explicar um RÓTULO — o "?" ao lado de um título, de um cabeçalho de grupo de campos ou de coluna (DS **vNEXT**+) | `help-tip` — botão de ícone + tooltip, com o nome acessível pronto a partir de ****about****. O texto vai em ****children****; largura por ****contentClassName**** (o teto é 256px). ⛔ **nunca dentro de um `<label>`** (conteúdo interativo ali é HTML inválido e o clique cai no campo) — vai no cabeçalho do grupo. Dentro do `kpi`, use ****helperText**** e não monte à mão |
| **bloqueia** a página, centralizado | `modal` (body já rola sozinho — não trate scroll no children) |
| **bloqueia**, lateral, mais espaço que o modal | `panel` (560px default) · `sheet` · `drawer` (mobile, gesto) |
| **não** bloqueia — coexiste com a lista atrás, resizável | `floating-panel` |
| **painel de DETALHE** (o que abre ao clicar na linha da tabela ou no card) | **use o bloco `dsgreen-paneldetail-1` — ele é o PADRÃO.** A estrutura já está resolvida ali: identidade no header, métricas em cards compactos, campos em seções colapsáveis por assunto, ação primária no footer, e sem aba (o colapso já é o mecanismo de esconder). Precisa de avatar/chip/ação no header → é `floating-panel`, porque no `panel` o header é só string.<br><br>**Variações são opt-in — só monte se o usuário citar o ID:** `dsgreen-paneldetail-2` (detalhe de TAREFA: título grande no corpo, propriedades em lista plana, abas pra anexo/comentário/log) · `dsgreen-paneldetail-3` (com TABELA dentro: ficha em 2 colunas + métricas + tabela compacta, e aí o painel vai a `xl` 720px). Não escolha entre as três por conta própria: sem o ID citado, o padrão é o `-1` |
| diálogo cru, sem o chrome do DS | `dialog` · `alert-dialog` |

Todo flutuante já segue a mesma receita visual (superfície frosted, radius 12,
`shadow-sh-lg`). Não re-estilize.

## Dados em grade e lista

| Precisa de | Use |
|---|---|
| grade com colunas: filtros, visões, seleção, kanban, virtualização | `data-table` — o completo |
| tabela simples, sem inteligência | `table` |
| rodapé de paginação/page-size/contagem | `footer-table` — já embutido no `data-table` |
| lista de **cards** com filtros, visões, hierarquia/árvore | `data-list` |
| lista de cards simples | `list` |
| quadro por status/etapa | `kanban` — ou `viewMode: "kanban"` do `data-table`. **Tem SEGUNDO eixo**: as colunas são o status, e dentro de cada uma os cards podem ficar em RAIAS (swimlanes) por épico, responsável, cliente. No `kanban` direto, passe a lista de grupos; no `data-table`, o eixo da raia é o próprio groupBy — o mesmo estado que agrupa linhas na tabela agrupa cards no board, então ele entra nas visões salvas sem código novo. Card sem valor cai numa raia de não-agrupados, sempre por último. **Arrastar move entre COLUNAS, nunca entre raias** — trocar de grupo é decisão de domínio, não gesto de board. Recolher uma raia recolhe em todas as colunas, porque ela é uma faixa horizontal. Sem grupo nenhum o board é plano |
| **eventos ao longo do TEMPO** (agenda, compromissos, reservas) | **`scheduler`** — 4 views numa prop só: `month` · `week` · `day` · `list`. Toolbar embutida (período, busca, filtros, seletor de view). **Não confundir com `calendar`/`date-picker`, que escolhem uma DATA num campo** — aqui o assunto são eventos. Dumb sobre mutação: arrastar emite `onEventMove`/`onEventResize` e QUEM APLICA é você (mesma gramática do `onCardMove` do kanban). Filtro é declarativo (`filterFields`) e abre num painel-COLUNA à direita, não em overlay. **O pai precisa ter altura** — o componente é `h-full`, e é a altura dele que decide quantos eventos cabem na célula do mês. Detalhe do evento é SEU: o componente só emite `onEventClick` e devolve `event.meta` intacto; monte o painel com o bloco `dsgreen-paneldetail-2`. `draggable`/`resizable` nascem `false` de propósito: ligados sem handler, o usuário arrasta e vê o evento voltar |
| **cronograma de PROJETO** (o que depende do quê, prazo, caminho crítico) | **`gantt`** — hierarquia com collapse à esquerda, eixo de tempo à direita, e **setas de dependência** entre as barras. É a seta que distingue: sem ela isto seria uma timeline, e timeline é o `scheduler`. Quatro tipos de vínculo (finish-to-start, start-to-start, finish-to-finish, start-to-finish) com espera/antecipação em dias. Linha agrupadora deriva o intervalo dos filhos; marco vira losango. **Dumb sobre mutação como o kanban**: arrastar emite evento e QUEM APLICA é você — o componente detecta conflito de prazo e sinaliza, mas nunca reagenda. **O pai precisa ter altura** (é `h-full`), e um cronograma legível pede ~900px de largura. A cor da barra diz CATEGORIA (qual frente), não status — status vai no slot livre da linha como `chip`. **REMARCAÇÃO de prazo é nativa**: dê a cada barra a lista dos prazos ANTERIORES (campo history, no formato antes era de X a Y) e o componente deriva o resto — cada data antiga vira uma marca no dia em que estava, ponto com trilha quando cai fora da barra atual e entalhe na borda quando cai dentro, mais clara quanto mais antiga, agrupada em contador quando o zoom aperta. NÃO desenhe barra fantasma nem uma segunda linha pro prazo velho. O botão Remarcações entra sozinho na toolbar e some quando nenhuma barra tem histórico. Detalhe da tarefa é SEU: o componente emite o clique e devolve o payload intacto. ⭐ **Antes de montar a tela, rode `igreen:add example-gantt`** — é a extração 1:1 do showcase do DS (20 linhas em 4 níveis, 16 vínculos, 2 conflitos, os 4 gestos APLICANDO, as 3 visões, filtro nos 6 kind, painel de detalhe e drawer). O `USAGE.md` descreve a API; o exemplo mostra o COMPORTAMENTO junto, que é onde a composição erra. Troque `_gantt-data.tsx` primeiro |
| paginar algo que não é tabela | `pagination` |

### ⛔ Filtro em tabela/lista → SEMPRE nativo, nunca form/select acima

"Filtrar por X" numa grade/lista **não** é montar select ou form acima da tabela — isso
empilha UI na unha, come espaço e foge do padrão. Filtro é **recurso reativo** do
`data-table`/`data-list`. Aplique esta hierarquia **sempre — inclusive em pedido em lote e
sem passar pela entrevista guiada** (é justamente aí que o erro aparece):

1. **X é uma coluna** (status, categoria, tipo, graduação… — o caso normal, ~90%):
   - Na coluna: `enableColumnFilter: true` + `filterType` + `filterOptions`.
   - **Deixe o filtro visível na tabela**: `showEmptyFilterChips={["status", …]}` — o chip
     nasce **vazio e clicável** já no load, o usuário vê a afordância sem abrir menu nenhum.
   - Abrir **já filtrado** → `defaultViews`/`presetView` com filtros pré-aplicados (`filterModel`) → chip aplicado.
   - Status é o **eixo de navegação** (poucos valores, muito usado) → **uma visão por valor**
     (`defaultViews`, ex.: "Ativos", "Pendentes"; `allowCreateView={false}` se forem fixas).
2. **X não é coluna, pequeno e simples** (período/mês, um toggle) → `toolbar.actions`
   (máx ~2, label curta). Período que afeta a página toda → `PageHeader.actions` (dropdown).
   **Precisa de um COMPONENTE na barra** (um `DatePicker mode="range"` de período)? →
   `toolbar.customLeft` do `data-table`, que renderiza entre o refresh e a busca —
   `toolbar.actions` não serve, seus kinds são `button/dropdown/input` e nenhum recebe
   componente. ⚠️ **Exige o DS `0.64.0` ou mais novo**: em `0.63.0` e anteriores a
   prop existe no tipo, o TS aceita e **nada renderiza** (era declarada e lida por nada).
   Confira sua versão antes de prometer o controle — e note que o `data-list` **não tem**
   esse slot, só `toolbarActions`.
3. **Muitos filtros, ou muito grandes** → drawer "Filtros" **nativo** do `data-table` + chips
   pré-aplicados. Nunca empilhar selects soltos.
   O funil **não oferece** escolha de operador (isso é do builder avançado), mas **preserva**
   o que você pré-aplicou: filtro que nasce `isNoneOf` ("Excluindo"), ****between**** ou
   `notContains` continua nele depois que o usuário mexe no valor ali dentro, e aparece com o
   widget certo (faixa com dois campos, por exemplo). Só o campo **ainda sem filtro** nasce
   com o operador default do tipo. ⚠️ **Exige o DS `vNEXT` ou mais novo**: antes disso os dois
   lados do drawer derivavam o operador do tipo da coluna, então editar o valor rebaixava o
   operador sem avisar — e pré-aplicar "Excluindo" não parava de pé.

   **Um botão da SUA tela abrindo o funil** (um "Filtrar" no cabeçalho da página, um
   atalho, um deep-link que já chega filtrando): ****simpleFilter.open**** +
   ****simpleFilter.onOpenChange**** no `data-table` (DS `vNEXT`+). Com ****open****
   presente a prop manda — o funil da toolbar, o X, o Esc e o backdrop passam a só
   **avisar**, e quem abre e fecha é você. Sem ****open****, o drawer continua se
   virando sozinho e ****onOpenChange**** apenas **observa** (dispara nos dois modos),
   que é o que você quer pra telemetria ou pra espelhar o estado num badge.
   ⛔ **Nunca passe ****open**** sem ****onOpenChange****:** o drawer fica preso no valor
   da prop, as três saídas do usuário viram cliques sem efeito e ele não tem como fechar
   (sai um `console.warn` em DEV dizendo isso). Não passar nenhuma das duas é o
   comportamento de sempre.
   ⚠️ O `data-list` **não tem** esse par — o funil dele segue só com estado interno.

> As exceções (2 e 3) são raras. Sempre que a informação já está numa coluna: **chip nativo
> primeiro**. Exemplo vivo do padrão: `example-clientes` (status/categoria pré-aplicados +
> chip vazio de "Atribuído"). Entrevista guiada completa em `/ds-create-crud`.

### O que o chip de filtro passou a aceitar (DS `0.69.0`+)

Oito saídas que antes obrigavam a montar o filtro por fora da tabela. Todas opcionais;
sem elas nada muda.

| quero | uso |
|---|---|
| filtrar por um campo **sem mostrar a coluna** | ****hidden: true**** na coluna — ela nasce oculta e o filtro continua no chip, no funil e no builder. ⚠️ com `persistId`, estado salvo vence o default: coluna nova nasce visível pra quem já tem snapshot (versione o `persistId`) |
| o chip **fixo**, que o X limpa em vez de remover | `showEmptyFilterChips={[{ field: "status", dismissable: false }]}` — array de string continua valendo |
| nome do filtro **diferente** do título da coluna | ****filterLabel**** na coluna |
| opções vindas do **servidor** | ****filterLoadOptions****`(busca, pagina)` → `{ options, hasMore }` + ****filterValueLabel**** pro rótulo do que já está marcado. Debounce de 300ms, resposta velha descartada, erro com "Tentar de novo" |
| uma opção **fixa no topo** da lista (ex.: "Sem responsável") | ****pinned: true**** na opção — fica fora da busca, da rolagem e do "Selecionar todos" |
| **avisar a tela** quando o usuário limpa tudo | ****onFiltersClearAll**** — dispara depois de limpar o filtro interno, pra você limpar o seu |
| faixa numérica **num chip só** | operador ****between**** no `filterType: "number"` — "10 – 500", lado aberto vira ≥/≤. ⚠️ **vNEXT:** o chip de faixa deixou de imprimir a palavra "entre" — o valor já lê como faixa, e antes saía "entre 10 – 500" (no lado aberto, "entre desde 01/01"). Vale pra ****number****, ****currency****, ****date**** e ****datetime****, e pra qualquer tipo seu com ****between****. Pra ter a palavra de volta é ****opLabels**** no `table-toolbar` montado à mão — a `data-table` e a `data-list` não repassam |
| a mesma faixa, com o valor **em R$ no chip** | operador ****between**** no `filterType: "currency"` — "R$ 10,00 → R$ 500,00". Desde a vNEXT o popover do chip abre mín/máx igual ao de número (antes abria um campo só e a faixa saía como o texto 10,500). ⚠️ o widget do chip é roteado por ****filterType****, não pelo ****type**** da coluna: moeda sem `filterType: "currency"` cai no widget de texto |
| esconder o **builder avançado** (você tem o seu) | `toolbar.enableAdvancedFilters={false}` — não desliga os chips |

⚠️ **vNEXT muda o pixel da barra de chips, em toda tabela e lista.** O chip com filtro
valendo passa a ter borda **sólida de marca** sobre fundo de marca sutil, com o valor em
verde; o chip **vazio** (o placeholder de ****showEmptyFilterChips****) continua tracejado e
neutro. Antes os dois eram o mesmo pixel e só o conteúdo diferia. **Não há prop nova** —
o estado sai do próprio chip. Medido: a borda do aplicado dá 5,06:1 contra a barra no
claro e 7,99:1 no escuro; o vazio fica em 1,45 e 1,24. No escuro o valor segue neutro de
propósito (o verde ali mede 4,36:1 e reprovaria o AA de texto). Não recrie esse destaque
na mão nem passe `className` pra imitá-lo.

**Barra de seleção configurável:** `selectionConfig.bar` = `"replace"` (default, o de
sempre) · `"inline"` (toolbar continua visível, barra entra numa linha abaixo) · `"none"`.
Com `countLabel`, `clearLabel`, `totalSelected` (contagem entre páginas, vinda de você) e
`onClearAll`. O **estado** da seleção entre páginas continua seu; o DS só exibe.

**Operador do SEU tipo que não pede valor** (um "mês corrente", um "tem anexo"):
marque ****noValue: true**** no item de ****operators**** (DS `vNEXT`+). O funil entende que
aquela linha não tem o que editar e dá a ela um "Limpar" próprio, que remove só aquele
campo — sem isso a única saída seria o "Limpar todos", que apaga os filtros de todos.
`isEmpty`/`isNotEmpty` já valem sem declarar. ⚠️ O campo existe na tipagem há muito tempo
mas **não fazia nada** antes da `vNEXT`: se você já declarou e não viu efeito, era isso.

**Widget de filtro próprio:** registre um tipo no `columnTypeRegistry` com
****ownsMulti: true**** e o chip multi inteiro passa a ser seu (colar lista,
clique-substitui, o que for) — em vez de pedir cada comportamento ao DS. O
`renderFastFilterInput` precisa ler `value` como **array** e chamar `onChange` com array;
se o seu widget for de valor único, **não** declare o flag. Blocos públicos pra embrulhar:
`MultiSelectDropdown`, `MultiSelectFieldDropdown`, `FastSingleSelectList`,
`FILTER_FIELD_CLASS`.

✅ **Vale nos DOIS** — chip do `DataTable` e chip do `DataList` — porque o registry é o
mesmo. No `DataList` o campo declara o id do seu tipo em `filterFields[].type`.

⚠️ **O ownsMulti só funcionou de verdade a partir da `vNEXT`.** Antes ele desligava o
modo multi por dentro e entregava ao seu widget **o primeiro valor**, não a lista: num
grupo de três opções o widget abria mostrando só a primeira, desmarcá-la limpava o grupo
inteiro, e marcar uma quarta apagava as outras duas. Se você tentou widget próprio antes
e desistiu, era isto — não o seu código.

### Ações do cabeçalho da coluna (DS `vNEXT`+)

Três controles moram no cabeçalho — o ícone do **tipo**, o **funil** e o **menu
3-pontos**. Desligam separadamente, e confundir os dois últimos é o erro comum:

| quero | uso |
|---|---|
| esconder **só o funil**, mantendo Fixar e Ocultar | ****enableHeaderFilter: false**** na coluna |
| esconder o **menu inteiro** (Fixar, Ocultar, Ordenar, extras) | ****enableColumnMenu: false**** na coluna |
| tirar o **ícone do tipo** de TODAS as colunas | ****showTypeIcons: false**** no DataTable (prop raiz) |

⛔ **Não use ****enableColumnMenu: false**** pra tirar o funil** — leva Fixar e Ocultar
junto. Era o único contorno possível antes da `vNEXT`, e é por isso que ele aparece em
código antigo.

**"Ordenar" só aparece em coluna ordenável** — e a ordenabilidade pode vir do **tipo**,
não só do que você escreveu na coluna: telefone, tags e URL nascem não-ordenáveis. Coluna
sem nada declarado é ordenável.

### Linha que não tem o que expandir (DS **vNEXT**+)

Ligou a expansão (****expandable: true**** numa coluna + ****renderRowExpansion****) e
**toda** linha ganhava chevron — inclusive a que abre um painel vazio.

| quero | uso |
|---|---|
| toda linha expande | **não passe nada** — é o default |
| só a linha que tem detalhe | ****isRowExpandable={(row) => row.itens > 0}**** no `data-table` |

A linha que o predicado recusa perde o chevron **e** a resposta ao clique, juntos. Isso é
a regra, não um detalhe: **chevron que não faz nada é pior que chevron ausente** — o
usuário clica, nada acontece, e ele não sabe se é defeito ou se não há nada ali.

✅ **O alinhamento está resolvido** — o espaço do chevron fica reservado na linha
recusada, então o texto da coluna não dança de linha pra linha. Não compense na mão com
padding.

✅ **Linha já aberta que passa a ser recusada fecha sozinha.** O predicado lê os dados da
row, então a recusa pode chegar depois (o item foi excluído, o lote foi refetchado) — e
painel aberto sem chevron pra fechar seria um estado sem saída. O id não é descartado: se
a linha voltar a aceitar, ela reabre.

⚠️ **Não é controle de permissão.** O predicado some com a affordance; ele não protege
dado. Linha que o usuário não pode ver não entra em ****rows****.

⚠️ Vale só pra row-expansion. Em ****groupBy**** e em ****getTreeDataPath**** quem decide
o chevron é a própria hierarquia.

### Trocar de página sem piscar (DS **vNEXT**+)

Tabela em **server mode** (você passa ****fetchData**** em vez de ****rows****) troca o
corpo **inteiro** pelo esqueleto a cada refetch — e o rodapé junto. Em tela onde o usuário
navega muito entre páginas, isso é o "pisca".

****loadingMode**** escolhe o que fica na tela durante o vôo da request:

| quero | uso |
|---|---|
| o de sempre (esqueleto no corpo e no rodapé) | **não passe nada** — o default é ****"skeleton"**** |
| as linhas da página **anterior** no lugar, até a próxima chegar | ****loadingMode="keep"**** no `data-table` |

Com ****"keep"**** o rodapé **também** fica, navegável. E o leitor de tela continua
avisado: a raiz ganha **aria-busy="true"** e uma região **sr-only** anuncia que as linhas
são do resultado anterior, calando quando a resposta chega. Isso não é enfeite — no modo
default quem avisa é o próprio esqueleto, que é uma live region; sem a compensação, o
****"keep"**** daria **menos** sinal justamente no caminho em que a tela engana mais.

✅ **A primeira carga não precisa de tratamento.** Não existe linha anterior pra manter, e
corpo vazio seria pior que esqueleto: o ****"keep"**** cai no esqueleto sozinho nesse caso
(e em qualquer refetch depois de uma resposta sem linhas). Não alterne a prop.

⚠️ **O rodapé é otimista — e o DS já trata.** A página muda no clique, as linhas só na
resposta. As setas e os números **não mentem**: dizem pra onde o clique leva. O **texto**
do intervalo ("76–100 de 100") mentiria sobre o corpo, então ele some durante o vôo e
volta na resposta. Nada a configurar — e não é defeito a "consertar" se você vir.

**Vale em client mode também** (você passa ****rows**** + ****loading****, sem
****fetchData****) — mesma tabela acima. ⚠️ **Só que aí quem guarda o lote anterior é
VOCÊ:** continue passando as linhas antigas em ****rows**** enquanto levanta o
****loading****. Se você zerar ****rows**** junto, não há o que manter e cai no esqueleto
— o critério é "existe linha pra manter?", não "o modo é server?". Com react-query ou SWR,
é o que o ****placeholderData**** / ****keepPreviousData**** já faz.

⚠️ O `data-list` **não tem** essa prop.

### Server mode: DOIS caminhos, escolha um (DS **vNEXT**+)

A pergunta que decide é **quem dispara a request**:

| sua tela | o caminho |
|---|---|
| **não** tem camada de dados própria — quer que a tabela busque | ****fetchData**** (sem ****rows****). O `data-table` chama a sua função a cada mudança de página/ordem/filtro/busca e renderiza a resposta |
| **já** tem react-query / SWR / RTK-Query dono do fetch, com cache e invalidação | ****processingMode="server"**** + ****rows**** + ****rowCount****. Você busca; a tabela só mostra |

Com ****processingMode="server"**** o `data-table` **não reprocessa nada**: não fatia, não
ordena, não filtra e não busca. Ele só **avisa** — ****onPaginationModelChange****,
****onSortModelChange****, ****onFilterModelChange****, ****onSearchChange**** — e espera
****rows**** novas. Declare os 4 pares controlados; sem eles o usuário clica e nada
acontece.

⚠️ **Sim, ela desliga mais do que o nome diz, e é de propósito.** Paginar no servidor e
continuar ordenando no cliente ordenaria as 25 linhas da tela como se fossem as 1.000, e o
filtro local apagaria linhas que o ****rowCount**** continua contando — o corpo mostra 7, o
rodapé diz "1–25 de 1.000", e nada na tela diz qual dos dois está errado.

Três coisas que você **precisa** acertar:

- ****rowCount**** é a única fonte do total. Sem ele o rodapé só conhece o lote que recebeu
  ("1–N de N") e não oferece página seguinte.
- ****initialPageSize**** tem que ser o ****pageSize**** da sua API. O texto do intervalo é
  aritmética sobre página × tamanho, **não** uma contagem do corpo: 25 declarado com um lote
  de 10 escreve "1–25" sob 10 linhas.
- **Desligue o Refresh** (****enableRefresh: false**** no toolbar). Ele só fala com o
  ****fetchData****; aqui quem recarrega é a sua tela. Sem isso sai um aviso no console em
  DEV — botão que gira e não recarrega é pior que botão ausente.

✅ Combina com ****loadingMode="keep"**** — e é o par natural do ****placeholderData**** /
****keepPreviousData**** do react-query/SWR.

⚠️ **Três limites conhecidos — leia antes de abrir bug:**

1. **O caso ESPELHADO não é atendido.** Filtrar e buscar no servidor mantendo paginação e
   ordenação locais é válido e comum, e ****processingMode="server"**** **não serve**: ele
   desliga os quatro de uma vez. Esse recorte sofre hoje um **double-filter silencioso**
   (com ou sem a prop): quem passa ****filterModel**** controlado e ****rows**** já
   filtradas vê o filtro local rodar de novo sobre o lote — no-op quando as semânticas
   coincidem, e **perde linha** quando divergem (busca de banco acento-insensível,
   ordenação do SQL ≠ a do JS, campo que a coluna não declara). Pendência conhecida.
2. **Filtro que zera o resultado mostra o vazio errado.** Em client mode dá "Nenhum dado
   encontrado" **com o botão de limpar filtros**; nos dois caminhos de server mode dá
   "Nenhum dado cadastrado" — *"não existe nada"* — **sem a saída de limpar**. Herdado do
   ****fetchData****. Saída: alterne ****renderEmpty**** pelo seu próprio
   ****filterModel****.
3. **Não passe ****rows**** junto com ****fetchData****.** O CSV sairia com as
   ****rows**** locais sob um rótulo dizendo "Página atual", enquanto o corpo mostra a
   resposta do servidor.

⚠️ Os dois caminhos **não se somam**: com ****fetchData**** presente o
****processingMode**** é ignorado. E em client mode puro (sem nenhum dos dois) o
****rowCount**** continua sendo **ignorado** — quem conta são as ****rows**** passadas.

⚠️ O `data-list` **não tem** essa prop (ele não pagina).

## Layout e chrome do app

- `app-shell` — a casca (rail de módulos + header + área de conteúdo). **Embutido em container com altura** (layout com footer, aba, preview) → passe `fillHeight`; sem isso ele mede 100vh, transborda e o conteúdo fica cortado na base.
- `header` — barra superior de 60px (breadcrumb, busca, tema, usuário) dentro do shell.
- **Menu lateral — a escolha depende de o app ter módulos, então PERGUNTE:**
  - **tem áreas separadas** (Comercial, Financeiro…), cada uma com menu próprio → `menu-sidebar` (rail + contextos). É o que o `app-shell` usa.
  - **sistema único**, um menu só → `single-menu-sidebar` (nível único). No `app-shell` passe `sidebar="single"` + `categories` + `sidebarLogo` + `sidebarTitle`. ⚠️ **Não** ligue `sidebarShowSearch` se o header já tem busca — o shell já entrega a da sidebar desligada. (Até o CLI 0.25.0 esta linha dizia que o `single-menu-sidebar` não encaixava no `app-shell`: era **falso**, ele tem colapso e mobile.)
  - Nas duas: item com destino declara `href` (vira `<a>`, então ctrl+clique e nova aba funcionam). Router próprio → `renderLink`.

  > 🧭 **O app tem router (react-router, Next, TanStack)? Passe `renderLink`.**
  > `<AppShell renderLink={({ href, ...p }) => <Link {...p} to={href} />} … />`
  >
  > O menu renderiza `<a href={item.href}>`. Sem `renderLink`, um `item.href` de **path**
  > (`/clientes`) fazia o browser **recarregar a página inteira** a cada clique — bug
  > reportado por consumidor e corrigido na v0.38.0. Alternativa: passar `onItemClick`
  > (aí o menu cancela a navegação nativa sozinho, preservando ctrl+clique, link externo
  > e `item.href` de hash). Detalhe: `MenuSidebar/USAGE.md` §Integração com router.
- `page-header` — título + ações + breadcrumb **dentro** do body.
- `card` — container de conteúdo · `separator` · `scroll-area` (scroll estilizado) ·
  `aspect-ratio`.
- Esconder/mostrar conteúdo: `accordion` (várias seções abrindo) · `collapsible` (uma) ·
  `carousel` (deslizar horizontal).

## Métrica e gráfico

- `kpi` — `Kpi` / `KpiGroup` / `KpiDelta` para cards de métrica e faixas de indicadores.
- `chart` — wrapper do Recharts (barras, linha, área, pizza, radar, radial). A altura do
  **className** é a do GRÁFICO: a legenda é renderizada fora dessa caixa e soma por fora, então
  legenda em 2 linhas cresce o bloco em vez de achatar a plotagem. Gráfico que carrega dado leva
  **emptyState** (vNEXT) — o nó que aparece no lugar dos eixos vazios quando nenhum número finito
  chega nas props **data** do gráfico e das séries (`0` é dado; sem a prop, nada muda).
- `choropleth-map` — mapa por região colorido por valor (traz `d3-geo` como dependência).

## Blocos — composições de referência (não são componentes)

Um **bloco** é um arranjo pronto, feito só com os componentes acima, que existe porque o arranjo é
o que a IA não inventa: você sabe as peças e os tokens, mas não a disposição que um designer
escolheu. Ele **não tem props nem versão própria** — você lê a estrutura e reconstrói com os dados
do usuário.

Cada bloco tem um código no formato `dsgreen-<categoria>-<n>`. **Quando o usuário citar um código,
não classifique intenção** — resolva o código (é o Passo 0 da skill ds-kit).

**A lista dos blocos NÃO está aqui**, de propósito: ela vive em
`.claude/skills/ds-kit/blocks-index.md`, que é **gerado** a partir dos arquivos e carregado **só
quando um código é citado**. Esta regra é `alwaysApply` — listar cada bloco aqui faria o custo de
contexto crescer a cada bloco novo, e o catálogo é feito pra crescer. Bloco só entra em jogo quando
o humano cita um ID, então não há caso em que você precise descobrir blocos sem ser provocada.

O catálogo **visual** fica na seção **Blocks** do showcase do DS — é de lá que o usuário tira o
código.

## Identidade, status e navegação

- `avatar` — compound Radix, pra fallback que NÃO é iniciais (ícone, skeleton) · `avatar-ig` — o avatar do DS: iniciais com presets de cor **e foto** (`src`, com as iniciais de `children` como fallback da URL que falha). Foto de pessoa → `avatar-ig`. **Vários avatares juntos → `AvatarGroup` (do mesmo item `avatar-ig`), nunca `-ml-*`+`ring` na mão:** ele resolve sobreposição por tamanho, cor do anel (`surface` = o que está ATRÁS) e excedente (`max`+`total`, sendo `total` a contagem do servidor)
  (escolhe preto/branco por contraste WCAG quando recebe hex).
- `badge` — rótulo estático · `chip` — pílula de status/tag/filtro, pode ser interativa.
- `icon` — ícones do DS, incluindo o set de marca `igreen-*`.
- `breadcrumb` — caminho de navegação. Em página de **detalhe**, o item do registro aberto
  pode virar seletor: `<BreadcrumbSwitcher>` (vem no mesmo item) transforma o nome do que está
  aberto em gatilho de uma lista com busca — quem está numa ficha quer pular pra outra, não
  voltar à lista. É controlado e **não navega** (`onValueChange` devolve o valor; rota é sua),
  e no `header` o item do breadcrumb vira seletor com `switcher`+`value`+`onValueChange`
  juntos. ⛔ escolher valor de formulário não é isto: é `combobox`.
- `menubar` (barra de menus estilo desktop) · `navigation-menu` (mega-menu).
- `label` — só fora de formulário; **dentro** de form quem cuida é o `form-field`.

## Comando e texto

- `command` — paleta de comandos / busca com teclado (⌘K).
- `markdown-text` — renderizar markdown (chat, descrições vindas de API).
- `calendar` — calendário inline; para **campo** de data use `date-picker`, para exibir EVENTOS use `scheduler`, e para CRONOGRAMA com dependência entre tarefas use `gantt`. ⚠️ **vNEXT muda o pixel**: **hoje** passa a ser um **anel** de marca sobre fundo transparente e só o dia **selecionado** fica preenchido — antes os dois eram o mesmo disco verde, indistinguíveis. Coincidindo, o preenchido vence. Vale também no `date-picker` e nos filtros de data da `data-table` e da `data-list`. Não recrie o destaque de hoje na mão.
- `button` — ação. Variações (cor, tamanho, ícone, loading) na própria API; ver o USAGE.
  Botão desabilitado cujo motivo o usuário precisa saber → ****disabledReason**** (DS
  **vNEXT**+), logo abaixo.

---

**Não achou o que precisa?** Antes de compor na unha, confira o catálogo visual. E para
**telas inteiras** não escolha componente a componente: use `/ds-create-crud` (tabela),
`/ds-create-list` (cards) ou `/ds-create-dashboard` (painel) — eles entrevistam e montam a
tela no padrão, e existem `example-*` prontos pra adaptar. Adaptar sempre ganha de escrever
do zero.

## Mudanças de API (2026-09-23)

Props novas que trocam um override por uma escolha. Nenhuma muda o default — mas se
você estava contornando algum destes na unha, pare de contornar.

| Quando você ia escrever | Use |
|---|---|
| um `×` no texto do chip, com o chip inteiro removendo | **`<Chip onRemove>`** — o × ganha alvo próprio, com `removeLabel` para nomeá-lo |
| `onClick` numa `<div>` de card | **`<Card onClick surfaceLabel>`** — vira alvo com foco e teclado; `onClick` na div não é alcançável |
| **react-select** para escolher vários | **`<Combobox multiple>`** — **value** vira `string[]`, o dropdown não fecha a cada escolha |
| validar data depois do clique | **`minValue`/`maxValue`** no `DatePicker` — desabilita o dia no calendário. E ****clearable**** para o × de limpar |
| `<table>` cru para "nenhum resultado" | **`<TableSpanRow>`** — linha de largura total (o `colSpan` que um grid de **div** não tem) |
| `className="font-normal"` num `<Label>` | **`weight="regular"`** — para rótulo de OPÇÃO em grupo (checkbox, radio, switch) |
| anular o **min-h** do `<Textarea>` | ****rows**** — agora encolhe de verdade |
| recriar o header porque o título trunca | **`titleWrap`** (default **true**) e **`descriptionLines`** no `PageHeader` |
| aceitar os textos em PT do upload | ****texts**** no `FileUploadField` — inclui ****texts.hint****, a dica menor, que sem ela é a lista de MIME crua do accept |
| reimplementar a paleta de busca | **`onOpen`** no `HeaderSearch` — o clique e o atalho chamam a SUA paleta |
| `sm:max-w-modal-lg` para vencer a base do overlay | ****size**** no `Dialog`/`Sheet`/`AlertDialog` |

⚠️ **Largura de página mudou de nome.** A escala do DS agora é `max-w-page-*`;
**max-w-lg** voltou a ser o Tailwind (512px, não 1024). Se um container ficou com o
dobro ou a metade do esperado, é isto. Overlay usa `max-w-modal-*`/`max-w-drawer-*`.

⚠️ **Importe `cn` e `tv` do DS**, não do seu projeto: a config de merge conhece os
tokens (escala de container, presets tipográficos, **pad-**/**gp-**/**sh-**…). Um `cn` de
fora resolve conflito errado e a classe perde em silêncio.

## Acessibilidade e saídas (v0.68.0)

| Quando você ia escrever | Use |
|---|---|
| card de SELEÇÃO pintando só a borda | ****aria-pressed**** (alternância) ou ****aria-current**** (item de um conjunto) no `Card`/`ClickableSurface` — sem isso a escolha existe só na cor |
| **ring-inset** na mão porque o anel some | **`surfaceClassName`** no `Card`: o alvo é esticado e o anel é externo; em container com **overflow-hidden** ele é cortado |
| proteger o handler porque o × do chip seguia clicável | ****disabled**** no `Chip` — agora alcança a label e o × (antes caía no `<span>`, onde não é atributo válido) |
| `Dialog` + `Command` na mão pra buscar no SERVIDOR | **`CommandDialog commandProps={{ shouldFilter: false }}`** — e **`CommandLoading`** sai do DS, não importe do **cmdk** |
| recriar o header por causa de um link no subtítulo | ****description**** do `PageHeader` aceita `ReactNode`; **`descriptionLines="none"`** solta a altura |
| date-range-picker próprio por causa do idioma | **`DatePicker`** já vem **pt-BR**; período de **um dia** é clicar duas vezes no mesmo |
| **react-select** por causa de grupo/descrição | **`Combobox`** com ****group**** e ****hint**** na opção; **`closeOnSelect={false}`** mantém aberto |
| **aria-label** fixo em português na busca do header | **`ariaLabel`** no `HeaderSearch`; **`hotkey={false}`** quando o app já tem o próprio ⌘K |
| tooltip nativo pra ler rótulo de KPI cortado | o `Kpi` já põe ****title** sozinho, e só quando corta**; ajuste o tooltip da ajuda com **`helperSide`** / **`helperMaxWidth`** |
| `className` pra largura de overlay | ****size**** — agora nos **três** (`Dialog`, `Sheet`, `AlertDialog`) |

⚠️ ****disabled** em `<a>` não existe.** O `ClickableSurface` traduz pra **aria-disabled** +
**pointer-events-none** + `tabIndex={-1}`. Não escreva **disabled** num link na mão.

## Botão desabilitado que se explica (DS **vNEXT**+)

| Quando você ia escrever | Use |
|---|---|
| um texto de ajuda ao lado do botão cinza, ou um `tooltip` embrulhando um `<span>` só pra driblar o **pointer-events-none** | ****disabledReason**** no `button` — o motivo em uma frase |

```tsx
<Button disabled disabledReason="Preencha o CNPJ antes de salvar">Salvar</Button>
```

Com a prop, o botão desabilitado troca o atributo **disabled** por **aria-disabled**:
volta a receber hover e foco, entra na ordem do Tab, e o motivo aparece numa tooltip.
Sem ela, **disabled** segue idêntico (**pointer-events-none**, fora do Tab, sem
explicação) — nada muda em botão nenhum que você já escreveu.

⚠️ **Não reproduza isso na mão.** **aria-disabled** escrito direto num `<button>` é
anúncio para o leitor de tela e **nada mais**: o clique dispara, o Enter dispara, e um
**type="submit"** submete o formulário. O `button` do DS trava as três coisas no próprio
handler. Um `<button aria-disabled>` seu não trava nenhuma.
