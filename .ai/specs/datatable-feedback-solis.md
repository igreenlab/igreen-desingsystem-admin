# DataTable — feedback Sólis item a item

> **Status:** ATIVA — implementada na branch `docs/showcase-filter-chips-lab`, em review no
> PR [igreenlab/igreen-desingsystem-admin#343](https://github.com/igreenlab/igreen-desingsystem-admin/pull/343).
> Vira `IMPLEMENTADA (<data do merge>)` quando entrar na `main`.
>
> **Para quem é este documento.** Para quem vai fazer o **segundo review** do PR sem ter
> participado da conversa (2026-10-21 → 2026-10-22). Ele diz o que foi pedido, o que foi
> feito, o que ficou de fora e por quê, e onde o risco mora. Leia antes da diff: várias
> decisões só fazem sentido com o contexto.
>
> **Como ver funcionando:** `gh pr checkout 343 && npm install && npm run dev` →
> `http://localhost:3100/#/filter-chips-lab`. A página tem um **navegador flutuante** no canto
> inferior direito com cada item e o passo exato de verificação.

---

## 1. Contexto

O time do **Sólis** (consumidor do DS) mandou uma lista de 20 itens: defeitos e pedidos de
recurso em DataTable, Kpi e Button. O mantenedor pediu **só o DataTable** — itens que não são
do DataTable nem reagem à tabela ficaram de fora (18, 19, 20).

### A filosofia acordada (guia todas as decisões abaixo)

O mantenedor levantou a pergunta certa no meio do trabalho: *"o DS não deveria dar meios
para o Sólis montar o próprio comportamento, em vez de a gente mapear cada caso?"*. A regra
que saiu dali:

> **O DS entrega DEFAULTS bons e BLOCOS públicos. Comportamento específico de um consumidor
> vira tipo registrado no `columnTypeRegistry`, não PR no DS.**

Na prática, cada pedido foi classificado em:

| Classe | Onde mora | Exemplo |
|---|---|---|
| **Defeito** | DS | select virando multiSelect no chip |
| **Recurso genérico** | DS | filtro sem coluna visível, opções do servidor |
| **Ponto de extensão** | DS (abre a porta) | `operator`/`onOperatorChange` no widget custom, blocos exportados |
| **Comportamento exclusivo** | **app**, via registry | "colar lista", "contém «texto»", clique substitui / Ctrl soma |

Duas lacunas contrariavam a regra e foram fechadas na própria branch:

1. **O chip multi-valor sequestrava o widget custom.** A promoção `useMulti` forçava o
   `MultiSelectDropdown` built-in sempre que o operador era `isAnyOf`/`isNoneOf`, mesmo com
   tipo custom registrado. Agora vale o `customOwnsMulti`: tipo custom que declara
   `isAnyOf`/`isNoneOf` nos próprios `operators` é **dono** do chip multi.
2. **O widget built-in não era componível.** `MultiSelectDropdown` agora é exportado como
   bloco: um tipo custom pode embrulhá-lo (busca, lista e seleção prontas) e somar as ações
   dele, em vez de reconstruir.

---

## 2. A lista do Sólis — status item a item

Legenda: ✅ feito · ◐ feito com diferença do pedido (ver nota) · 🔌 fica no app (registry) · ⛔ fora do escopo

| # | Pedido | Status | Como ficou |
|---|---|---|---|
| 1 | Filtro sem coluna visível (`filterFields` à parte) | ◐ | `ColumnDef.hidden: true` — **API diferente da pedida**, ver §3.1 |
| 2 | X do chip fixo limpa só o valor | ✅ | `showEmptyFilterChips: [{ field, dismissable: false }]` (eles sugeriram `pinnedRemovable: false`) |
| 3 | Escolha única no chip (`select`) | ✅ | defeito corrigido na promoção `useMulti` |
| 4 | "Limpar todos" avisa a tela | ✅ | `onFiltersClearAll` (nome diferente do sugerido, ver §3.4) |
| 5 | Nome do filtro ≠ título da coluna | ✅ | `ColumnDef.filterLabel` |
| 6 | Opções buscadas no servidor | ◐ | núcleo no DS; 3 extras ficam no app, ver §3.6 |
| 7 | Lista do multiSelect mais completa | ◐ | tudo pedido, com 2 diferenças de detalhe, ver §3.7 |
| 8 | "Incluindo / Excluindo" no chip | ◐ | feito; o chip diz "não é" em vermelho, não "Exceto …", ver §3.8 |
| 9 | "Limpar" dentro do chip | ◐ | feito; não volta o operador ao padrão na hora, ver §3.9 |
| 10 | Chip não fecha ao desmarcar o último | ✅ | exatamente a solução sugerida por eles |
| 11 | Linha vazia do painel não some | ✅ | — |
| 12 | Faixa numérica num chip só | ◐ | `between` no number; **sem `suffix` de unidade**, ver §3.12 |
| 13 | Modo avançado separado ou substituível | ◐ | toggle separado no DS; o slot pro montador próprio fica no app, ver §3.13 |
| 14 | Campo de filtro público | ✅ | exports no barrel (+1 que não foi pedido) |
| 15 | Troca de pageSize em modo controlado | ✅ | ⚠️ **mudança de comportamento** do `FooterTable`, ver §4 |
| 16 | Barra de seleção configurável | ✅ | `selectionConfig.bar/countLabel/clearLabel/totalSelected/onClearAll` |
| 17 | Configurações dentro da tela | ✅ | altura pelo espaço disponível real |
| 18 | Kpi: slot de ação no card | ⛔ | não é DataTable |
| 19 | Tooltip: contraste sobre card em hover | ⛔ | não é DataTable |
| 20 | Button: dica em botão desabilitado | ⛔ | não é DataTable |

---

## 3. Detalhe por item — o que, por quê e onde

### 3.1 · Item 1 — filtro sem coluna visível

- **Pedido:** uma prop `filterFields` à parte das colunas.
- **Feito:** `ColumnDef.hidden: true`. A coluna nasce oculta e o filtro continua valendo no
  chip, no funil e no builder avançado (colunas ocultas filtráveis entram no fim da lista).
- **Por que não `filterFields`:** a coluna já carrega tudo que um filtro precisa
  (`filterType`, `filterOptions`, `valueGetter`, `filterLabel`) e o processor **já filtrava
  por todas as columns**, visíveis ou não. Uma prop paralela duplicaria essa declaração e
  criaria duas fontes de verdade pro mesmo filtro. A coluna oculta é a declaração do filtro.
- **Mudança interna que viabiliza:** `colLabelMap` e `colsByField` (data-table.tsx) passaram
  de `effectiveColumns` (só visíveis) para `props.columns` (todas). O reviewer confirmou que
  é seguro: `effectiveColumns` só resolve atributos de render.
- ⚠️ **Limite conhecido:** com `persistId`, o snapshot salvo vence o default `hidden`. Uma
  coluna `hidden` adicionada a uma tela **que já existe** nasce **visível** pra quem tem
  estado persistido. Está documentado no USAGE; a mitigação é versionar o `persistId`.
- **Para avaliar:** o Sólis aceita `hidden` no lugar de `filterFields`? Se precisarem
  declarar filtro que **nunca** pode virar coluna (nem pelo popover de colunas), `hidden`
  não basta — aí `filterFields` volta a fazer sentido.

### 3.2 · Item 2 — chip fixo

- `showEmptyFilterChips` aceita `string` (comportamento antigo, descartável) **ou**
  `{ field, dismissable: false }` (fixo).
- Chip fixo **preenchido**: o X limpa o valor e o chip volta a placeholder.
- Chip fixo **vazio**: no lugar do X aparece um `CirclePlus` **decorativo** (`aria-hidden`,
  não é botão — o clique no chip inteiro abre o popover). O ícone foi pedido pelo
  mantenedor: sem ícone, o texto ficava desalinhado dos vizinhos.
- Base: `AppliedFilter.removable?: boolean` no `TableToolbar`.
- **Não-breaking:** array de strings continua idêntico.

### 3.3 · Item 3 — escolha única no chip

- **Causa:** a promoção `useMulti` (data-table.tsx) tratava `filterType: "select"` com
  opções como multiSelect.
- **Fix:** `select` saiu da promoção. Agora usa o widget single do próprio tipo e fecha ao
  escolher.
- **Fix de raiz que veio junto:** o widget single chama `onChange` e `onClose` no **mesmo
  clique**. Os dois `setFilterModel` partiam do mesmo estado stale, e o cleanup de "remover
  vazios" do `closeChip` apagava o valor recém-escolhido. O cleanup foi **adiado um tick**,
  lê o model por ref e é **escopado pelos IDs** que já estavam vazios no fechamento (ver §5).
- ⚠️ **Mudança perceptível:** qualquer consumidor que usava `select` no chip esperando
  checkbox múltiplo passa a ver escolha única. É a correção do defeito, mas muda o que a
  pessoa vê.

### 3.4 · Item 4 — "Limpar todos" avisa a tela

- `onFiltersClearAll` dispara **depois** de limpar o `filterModel` interno.
- Uso: o app limpa o filtro que é dele (no Sólis, o Filtro Avançado em SQL).
- **Nome diferente do sugerido** (`onClearAll`) porque `selectionConfig.onClearAll` (item
  16) já usa esse nome pra "limpar seleção de todas as páginas". Dois callbacks com o mesmo
  nome e papéis diferentes na mesma tabela confundiriam.

### 3.5 · Item 5 — `filterLabel`

- Vence o `headerName` no chip, no funil e no builder avançado.

### 3.6 · Item 6 — opções do servidor

- **No DS:** `ColumnDef.filterLoadOptions(search, page) → { options, hasMore }` +
  `filterValueLabel(value)`.
  - debounce de 300 ms na busca;
  - descarte de resposta velha (`reqSeq`; o reviewer confirmou que cobre busca × "carregar
    mais" concorrentes);
  - valores já marcados ficam **sempre no topo**, com rótulo resolvido mesmo fora da página
    carregada (também no texto do chip);
  - erro de rede mostra "Falha ao carregar" + "Tentar de novo";
  - funciona igual no **chip**, no **builder avançado** e no **drawer funil**
    (`FilterInputProps` ganhou `loadOptions`/`resolveValueLabel`).
- **Diferença:** o pedido falava em "carregar mais **ao rolar**". Foi feito como **botão**
  "Carregar mais" no fim da lista. Para avaliar se o Sólis aceita ou se quer scroll
  infinito.
- **Ficam no app** (comportamento exclusivo, via registry): "Contém «texto»" no topo,
  "Colar lista" (valores separados por linha, `,` `;` ou tab) e clique-substitui /
  Ctrl+clique-soma. Com o `customOwnsMulti` e o `MultiSelectDropdown` exportado, o Sólis
  monta isso num tipo próprio sem PR no DS.

### 3.7 · Item 7 — multiSelect completo

- Busca: aparece a partir de **10** opções (o pedido dizia "~8"; abaixo de 10 a busca só
  adiciona altura).
- `ColumnOption.pinned: true`: opção fixa numa seção própria no topo, fora da busca, da
  rolagem e do "Selecionar todos".
- Marcados primeiro: a ordem é **congelada na abertura** do popover, pra lista não pular a
  cada clique.
- "Selecionar todos" é aditivo sobre os **visíveis**: com busca ativa vira "Selecionar
  visíveis" e não desmarca o que está fora do resultado.
- Altura: o root do widget limita pelo espaço real que o Radix reporta
  (`--radix-popover-content-available-height`); a lista flexiona entre piso de 96 px
  (sempre visível e rolável) e teto de 240 px. Medido num viewport de 1366×520: o popover
  termina em 514 px, dentro da tela.
- **Visual decidido pelo mantenedor (2 rodadas):**
  - Incluindo/Excluindo virou `ToolbarSegmented` no **topo** (o mesmo componente do toggle
    de densidade/visualização). Antes eram dois botões soltos no rodapé.
  - "Selecionar todos" (esquerda) e "Limpar" (direita) são links compactos **junto da
    busca**, no idioma do "Limpar todos" dos chips.
  - **Sem contador** (`1/41`): não veio do pedido Sólis e, com filtro pré-carregado,
    confundia.
- ⚠️ **Mudança visual em todo consumidor:** isso vale pra **todo** chip multiSelect de
  qualquer DataTable, não só pro Sólis.

### 3.8 · Item 8 — Incluindo / Excluindo

- `FastFilterInputProps` ganhou `operator` e `onOperatorChange`. Tipo custom pode desenhar
  o próprio alternador.
- O widget built-in desenha o segmented. A troca re-aponta o `openChipKey` pra nova chave
  `field|operator`; sem isso o popover fechava no toggle.
- Se já existe um grupo no operador de destino (ex.: `uf isAnyOf [SP]` e `uf isNoneOf [MG]`
  criados no builder), o toggle **mescla** os dois com dedupe.
- Chip com `isNoneOf`: o texto do operador fica em vermelho (`text-fg-danger`).
- **Diferença:** o pedido sugeria o chip dizer "Exceto …". Ele diz "não é" (label do
  operador no registry), em vermelho. Para avaliar se o Sólis quer o texto "Exceto".

### 3.9 · Item 9 — "Limpar" dentro do chip

- Está na linha de ações do multiSelect e zera os valores sem fechar o popover.
- **Diferença:** o pedido dizia "volta o operador ao padrão". Hoje o operador **não** volta
  na hora: se a pessoa está em "Excluindo" e clica Limpar, continua "Excluindo". Ele só
  volta ao padrão depois que o popover fecha (o item vazio é removido) e o chip é reaberto.

### 3.10 · Item 10 — chip não fecha ao desmarcar o último

- `updateGroupValue` com valor vazio mantém **um item vazio** no lugar de remover o grupo.
  Remover desmontava o chip, que é a âncora do popover.
- O adapter mantém o grupo vazio renderizando enquanto o popover dele está aberto
  (`openChipKey`, mesma exceção que já existia pro atalho do header).
- O item vazio é inerte: o processor e a query de servidor ignoram filtro sem valor. O
  `closeChip` remove ao fechar.

### 3.11 · Item 11 — linha vazia do painel

- `handleFiltersChange`: entry multi sem valor gerava **zero** items e a linha sumia. Agora
  mantém um item vazio.

### 3.12 · Item 12 — faixa numérica

- `between` no `NumberColumnType`: mín e máx no mesmo chip ("10 – 500"), lado aberto vira
  "≥"/"≤", vírgula aceita como decimal.
- ❌ **Não feito:** `suffix` de unidade ("kWh"). Pendência pequena, candidata a follow-up.

### 3.13 · Item 13 — avançado separado

- `toolbar.enableAdvancedFilters`: liga/desliga **só** o builder avançado das
  Configurações. O default segue `enableFilters`.
- O slot pra pôr um montador próprio no lugar **não foi feito**: o montador SQL do Sólis
  mora no app. Com o toggle eles escondem o builder do DS e põem o deles onde quiserem.

### 3.14 · Item 14 — campo de filtro público

- Exportados no barrel do DataTable: `FILTER_FIELD_CLASS`, `FastSingleSelectList` e
  **`MultiSelectDropdown`** (este último não foi pedido — é a peça da filosofia do §1).
- O componente `<FilterField>` sugerido **não foi criado**: a classe exportada já resolve o
  visual.

### 3.15 · Item 15 — pageSize controlado

Ver §4 (mudança de comportamento).

### 3.16 · Item 16 — barra de seleção

- `selectionConfig.bar`: `"replace"` (default, comportamento antigo) · `"inline"` (a
  toolbar continua visível e a barra entra numa linha abaixo) · `"none"`.
- `countLabel`, `clearLabel`, `totalSelected` (contagem entre páginas, vinda da tela) e
  `onClearAll` ("limpar todas as páginas").
- O **estado** da seleção entre páginas continua no app; o DS só exibe.
- Base: `TableToolbar.bulkBarMode`.

### 3.17 · Item 17 — Configurações dentro da tela

- `max-h` trocado de `100vh - 80px` por
  `min(520px, var(--radix-popover-content-available-height))`.

---

## 4. Mudanças de comportamento que atingem consumidores existentes

Estas mudam o que **qualquer** consumidor vê ou recebe, não só o Sólis. Precisam ir em
destaque no changelog do `/ds-release`.

| Mudança | Quem é afetado | Detalhe |
|---|---|---|
| `FooterTable` não chama mais `onPageChange(1)` depois de `onPageSizeChange` | quem usa o `FooterTable` **fora** do DataTable | O segundo evento ia com o pageSize antigo e desfazia a troca em modo controlado. Agora **o handler é responsável por voltar à página 1**. Dentro do DataTable nada muda: o hook de paginação já emitia `{ page: 1, pageSize }`. USAGE e o demo `FooterTableDoc` foram atualizados |
| `scrollbar-gutter: stable` no container do `Table` | toda tabela | Reserva ~10 px pra barra vertical mesmo sem rolagem. Mata o "encolhe/alarga" ao filtrar. Tradeoff aceito |
| `filterType: "select"` no chip = escolha única | quem tinha `select` no chip | Correção do item 3 |
| Visual do popover multiSelect | todo chip multiSelect | Segmented Incluindo/Excluindo, busca ≥ 10 opções, links de ação |
| Item vazio transitório no `filterModel` | quem tem `filterModel` **controlado** | Com o popover do chip aberto, desmarcar o último valor emite um `onFilterModelChange` com um item de `value: undefined`. Já havia precedente (`handleActivatePlaceholder` cria item vazio). Consumidor que lê o model direto (fora do processor) deve ignorar itens sem valor |

---

## 5. Histórico do review (pipeline)

1. **DS Reviewer — 1ª rodada: REPROVADO.** 1 crítico, 2 altos, 4 médios, 4 baixos.
   - **[CRÍTICO]** `ColumnOption.pinned` era API morta: os dois adapters
     (`use-filter-popover-adapter.ts`) reconstruíam as opções descartando o campo. A demo
     mascarava o defeito porque "Sem BU" era o primeiro item do array — só a busca revelava.
   - **[ALTO]** USAGE do `FooterTable` ensinava o padrão que a mudança do item 15 quebrou.
   - **[ALTO]** `pipeline-state.md` sem entrada.
   - **[MÉDIO]** corrida do cleanup adiado do `closeChip` com model controlado lento e com
     unmount; `hidden` × `persistId`; `fetchPage` sem `.catch`; mesclagem sem dedupe no toggle
     de operador.
2. **Correções** (commits `e7519c4` e `83a9deb`):
   - `pinned` propagado nos dois caminhos + teste `pinned-options.test.tsx`, que monta as
     opções **pelo caminho de produção** (`renderHook` do adapter real) e foi provado
     **vermelho** contra o código sem o fix (L-064);
   - cleanup do `closeChip` escopado por ID, com timer único: fechar outro chip **executa**
     o cleanup pendente; unmount só cancela;
   - `.catch` + estado de erro; dedupe na mesclagem; aria-label legível; avisos no USAGE.
3. **DS Reviewer — 2ª rodada: APROVADO**, com verificação independente: re-rodou o teste,
   re-mediu no browser e varreu por um terceiro caminho de opções (não existe).

**Resíduo aceito (baixo):** parent controlado que adia a aplicação do model **além de um
macrotask** (ex.: debounce na aplicação) ainda pode perder uma escolha feita em chip
placeholder. O custo é re-escolher o valor. Está descrito no comentário do `closeChip`.

---

## 6. Onde o segundo review deve olhar

Em ordem de risco. São pontos que **eu** (autor) vejo como mais frágeis — a revisão não
precisa concordar.

1. **Ordem congelada no `MultiSelectDropdown`.** A ordem "marcados primeiro" é calculada
   uma vez, num `useState` inicializado na abertura (`ordemInicial`). Se as `options`
   mudarem **com o popover aberto** (rows atualizando em tempo real, por exemplo), as
   opções novas só aparecem ao reabrir. As fixas (`pinned`) são recalculadas a cada render;
   as demais não.
2. **Cleanup adiado do `closeChip`** (`data-table.tsx`, `chipCleanupRef`). `setTimeout(0)` +
   ref + escopo por ID. Ver o resíduo no §5.
3. **`customOwnsMulti`** (`data-table.tsx`): exige `typeDef.type === col.filterType`. O
   registry devolve o tipo `text` quando o tipo é desconhecido; a comparação evita que um
   typo vire "dono" por engano. Confirme que o critério é suficiente.
4. **Import direto de `TableToolbar/parts/toolbar-segmented`** em
   `multi-select-column-type.tsx`. É proposital: o barrel do `TableToolbar` puxa o
   `toolbar-simple-filter-drawer`, que importa `column-types` de volta. O ciclo estourava um
   erro de inicialização ("Cannot access MultiSelectColumnType before initialization")
   medido no browser. O reviewer confirmou que os dois arquivos estão no mesmo item
   `data-table` do registry, então o copy-in funciona.
5. **Cobertura de teste.** Só o `pinned` tem teste automatizado novo. O resto (itens 2, 3,
   6, 8, 10, 11, 15, 16) foi verificado **no browser, com cliques reais** — não há teste
   que reprove se alguém regredir. Candidatos naturais a teste: o toggle de operador com
   grupo preexistente, o item vazio do item 10 e o contrato do `FooterTable`.
6. **Diferenças de detalhe com o pedido** (§3.6, §3.7, §3.8, §3.9, §3.12): decidir com o
   Sólis se viram follow-up ou se ficam como estão.
7. **`hidden` no lugar de `filterFields`** (§3.1).

---

## 7. Arquivos tocados

| Área | Arquivos |
|---|---|
| DataTable — núcleo | `data-table.tsx`, `data-table.types.ts`, `index.ts` |
| DataTable — hooks | `hooks/use-filter-popover-adapter.ts`, `hooks/use-data-table-columns.ts`, `hooks/pinned-options.test.tsx` (novo) |
| DataTable — column types | `column-types/column-types.types.ts`, `column-types/index.ts`, `definitions/multi-select-column-type.tsx`, `definitions/number-column-type.tsx` |
| TableToolbar | `table-toolbar.tsx`, `table-toolbar.types.ts`, `parts/toolbar-applied.tsx`, `parts/toolbar-settings-menu.tsx`, `parts/toolbar-simple-filter-drawer.tsx`, `popovers/filter-popover.tsx` |
| FooterTable | `footer-table.tsx`, `footer-table.types.ts` |
| Table | `table.styles.ts` |
| Docs | `DataTable/USAGE.md`, `TableToolbar/USAGE.md`, `FooterTable/USAGE.md` |
| Showcase | `src/preview/pages/FilterChipsLabPreview.tsx` (novo), `FooterTableDoc.tsx`, `App.tsx`, `doc-nav-data.ts` |
| Pipeline | `.ai/status/pipeline-state.md`, este arquivo |

Commits (do mais antigo pro mais novo) começam em `69b24c9` e terminam em `83a9deb`. Cada
mensagem descreve o quê e o porquê da mudança.

---

## 8. O que falta depois do merge

1. `/ds-release`: timeline, bump, `registry:build` (recarimba DataTable, TableToolbar,
   FooterTable e Table) e vocabulário do consumidor (APIs novas que a IA do Sólis precisa
   conhecer). A mudança de comportamento do `FooterTable` vai em destaque no changelog.
2. `npm publish` (manual, do mantenedor).
3. Trocar o status deste documento para `IMPLEMENTADA (<data>)`.
