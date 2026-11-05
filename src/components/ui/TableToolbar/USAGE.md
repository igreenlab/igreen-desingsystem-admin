# TableToolbar — toolbar opinativa de tabela

Toolbar **padrão** (e única) do DataTable. Layout OPINATIVO: slots semânticos em
ordem fixa — o consumer não monta a ordem, impossível montar errado.

## Quando usar

- Você está montando uma toolbar de tabela custom (fora do DataTable) e quer o
  visual/UX canônico do DS.
- Dentro do DataTable é automático — não precisa instanciar à mão.

## Ordem renderizada (fixa)

```
Esquerda:  viewToggle · ⟨divider⟩ · savedViews
Direita:   refresh · actions · search · filter · settings · more
```

Em `< md`: o `refresh` some (o menu Configurações cobre o resto).

## Slots (props)

| Slot         | O que vai aqui                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `viewToggle` | Toggle Kanban/Lista (`<ToolbarSegmented>`)                                                                                                                                      |
| `savedViews` | Abas de visões + adicionar (`<TableToolbarViews>` + `<ViewsPopover>`). `<TableToolbarViews allowCreate={false}>` (v0.23.0) esconde o "+" e o modal de nova visão → só as visões pré-definidas (read-only). No DataTable use a prop `allowCreateView`. **`maxTabs`** (default `3`, **incluindo a aba "Default"**) limita quantas viram aba — o excedente é cortado por `.slice()`, sem overflow — mas em DEV sai um `console.warn` nomeando as visões engolidas e o valor que resolve (v0.43.1); no DataTable a prop equivalente é `maxViewTabs`. |
| `refresh`    | Botão atualizar (`<ToolbarToolButton>`)                                                                                                                                         |
| `search`     | Campo de busca (`<ToolbarSearch>`)                                                                                                                                              |
| `filter`     | Filtro simples: use `<ToolbarFilterButton onClick isActive hasIndicator />` (funil, icon-only — **mesmo botão** no DataTable e DataList) → abre `<ToolbarSimpleFilterDrawer>`   |
| `actions`    | Ações custom: `<ToolbarActions actions={[...]} />` (`button`/`dropdown`/`input`). Inline no desktop; **colapsam no ⋯ no mobile** (passe `extraItems` p/ absorver o ⋯ existente).<br><br>⚠️ **Este slot aceita qualquer nó** — `<ToolbarActions>` é só o uso comum. Pra um **componente** (um `DatePicker mode="range"` de período, um `Select` composto), passe-o direto aqui. Pelo `DataTable` o caminho é a prop `toolbar.customLeft`, que cai neste mesmo slot antes das `actions` — ela era **inerte até a v0.64.0** (declarada e lida por nada) |
| `settings`   | Configurações: sliders → drill-down (`<ToolbarSettingsMenu>` com Ordenação · Colunas · Filtros avançados · Densidade)                                                           |
| `more`       | Menu "⋯" (`<MoreMenu>`) — export + ações                                                                                                                                        |
| `bulkBar`    | Substitui a toolbar inteira pela barra de ações em massa                                                                                                                        |
| `className`  | —                                                                                                                                                                               |

## Exemplo mínimo

```tsx
import {
  TableToolbar,
  ToolbarSearch,
  ToolbarToolButton,
  ToolbarSettingsMenu,
  ToolbarSegmented,
  ToolbarApplied,
  MoreMenu,
  SortPanel,
  ColsPanel,
  FilterPanel,
} from "@/components/ui/TableToolbar";

<TableToolbar
  search={<ToolbarSearch value={q} onChange={(e) => setQ(e.target.value)} />}
  settings={
    <ToolbarSettingsMenu
      trigger={<ToolbarToolButton icon={<SlidersHorizontal />} aria-label="Configurações da tabela" />}
      sortPanel={(onBack) => <SortPanel ... onBack={onBack} />}
      colsPanel={(onBack) => <ColsPanel ... onBack={onBack} />}
      filterPanel={(onBack) => <FilterPanel ... onBack={onBack} />}
      density={<ToolbarSegmented items={DENSITY} ... />}
    />
  }
  more={<MoreMenu ... />}
/>
{/* Chips dos filtros aplicados LOGO ABAIXO */}
<ToolbarApplied filters={appliedFilters} onRemove={...} />
```

## Gotchas

- **Ordem é fixa** — não dá (nem precisa) reordenar. Cada controle tem seu slot semântico.
- **Mobile**: o `refresh` é escondido em `< md` via `hidden md:contents`; o
  `<ToolbarSettingsMenu>` expõe Visualização/Visões inline dentro do menu nesse breakpoint.
- **`mobileDisplayToggle?: ReactNode`** (ToolbarSettingsMenu): slot pro toggle
  **"Exibição" (Linhas/Cards)** — só renderiza em `< md`. O DataTable passa um
  `<ToolbarSegmented>` aqui quando a tela cabe em card mode; permite o usuário
  forçar tabela mesmo abaixo do `cardBreakpoint` (default mobile = **tabela**).
- **bulkBar substitui tudo** (default): passe `<BulkActionsBar>` (auto-some quando `count=0`)
  condicionalmente — `selectedIds.size > 0 ? <BulkActionsBar/> : undefined`.
- **`bulkBarMode="inline"`**: a toolbar CONTINUA visível e a barra entra numa linha
  abaixo — pra tela cujas ações em lote e filtros convivem (item 16 Sólis). No
  DataTable, controle via `selectionConfig.bar: "replace" | "inline" | "none"` +
  `countLabel`/`clearLabel`/`totalSelected` (contagem cross-page vinda da tela) /
  `onClearAll` ("limpar todas as páginas").
- **Chip fixo**: `AppliedFilter.removable: false` esconde o X do chip (o ToolbarApplied
  mostra um ⊕ decorativo no lugar — chip "de regra" que nunca sai).
- **Chip de `between` não imprime o rótulo do operador** (`v0.71.0`+). O valor já é
  auto-descritivo em todos os tipos que têm faixa (`100 – 500`, `R$ 10,00 → R$ 500,00`,
  `01/01 → 31/01`, e nos lados abertos `≥ 100` / `desde 01/01`), então o chip dizia o
  intervalo duas vezes — "entre 100 – 500", e no pior caso "entre desde 01/01". Pra ter a
  palavra de volta: `opLabels={{ between: "entre" }}`. ⚠️ `opLabels` é a ÚNICA saída, e
  nem `DataTable` nem `DataList` a repassam hoje — `AppliedFilter.opLabel` vem do registry
  do tipo e todos declaram "entre". `filterValueLabel` não serve: ela resolve o rótulo de
  **uma opção** e nem chega ao `renderChipValue` do `number`/`currency`.
- **Destacar o chip APLICADO é OPT-IN** — `highlightAppliedFilterChips` (`v0.71.0`+).
  **Sem a prop (default), todo chip é o tracejado neutro de sempre.** Com ela, o chip com
  valor ganha borda sólida de marca sobre `bg-brand-subtle` e o valor em `text-fg-brand`,
  enquanto o chip vazio (`AppliedFilter.isEmpty`) continua tracejado.
  **Ligue quando a barra tiver chip vazio** (o placeholder de `showEmptyFilterChips`): é
  contra o vazio que o destaque contrasta, e é só aí que ele paga — numa barra onde todo
  chip já está aplicado ele não distingue nada, só muda a cor de tudo. Medido: borda do
  aplicado contra a barra dá **5,06:1** no claro e **7,99:1** no escuro (o vazio fica em
  1,45 e 1,24).
  ⚠️ No escuro o valor volta a `fg-default`: o verde de marca sobre superfície escura dá
  **4,36:1** e reprovaria o AA de texto — mesma saída que o `bulkBarCount` já usava. E o
  **fundo da pílula do valor não é tingido**: com marca atrás, o texto caía pra 3,14:1 no
  claro.
  ⚠️ No `DataList` a prop existe mas **não tem par**: o `toAppliedFilters` dele descarta
  item sem valor, então lá não há chip vazio pra contrastar e o destaque pintaria 100% da
  barra. Por isso o `DataList` não repassa a prop hoje.
- **Chips ficam fora** da toolbar: renderize `<ToolbarApplied>` como irmão abaixo.
- **O chip em si é o `FilterChip`** (`v0.71.0`+), peça própria em `ui/FilterChip`,
  compartilhada com `Gantt` e `Scheduler`. Os nomes `toolbarAppliedChip*` seguem
  existindo como alias — a definição é uma só. **Zero pixel mudou aqui:** a única
  classe que o chip ganhou é `shrink-0`, que o `<div>` em volta de cada chip já
  aplicava (o `chip-filtro-ativo.test.tsx` nomeia essa única diferença e reprova
  qualquer outra).
  Precisa do chip numa tela que não usa `ToolbarApplied`? Importe `FilterChip` —
  **não** copie a gramática. Foi copiá-la que produziu três versões divergentes.
- **`<ToolbarSimpleFilterDrawer>` preserva o operador que já está no modelo** (`v0.71.0`+).
  Ele não oferece escolha de operador — isso é do builder avançado — mas campo com filtro
  vigente é **desenhado e reescrito com o operador dele** (`isNoneOf`, `between`,
  `notContains`). Só o campo **sem** filtro nasce com o default do tipo (e `multiSelect`
  segue promovido a `isAnyOf`). Antes os dois lados derivavam do tipo, e editar o valor
  rebaixava o operador em silêncio. **Duas guardas**, se você registra tipo próprio:
  (a) operador que o tipo **não declara** em `operators` cai no default — sem branch no
  `renderFilterInput`, preservá-lo escreveria um item que o `matchesFilter` ignora;
  (b) o drawer só **agrega** os N items do campo num array quando `operators[0]` do tipo
  é multi — é a forma pra qual o widget foi escrito. Tipo de valor único que declara
  `isAnyOf` (como `badge` e `user`) recebe o escalar e **mantém** o operador na escrita;
  pra receber a lista, declare um operador multi em `operators[0]`.
  Este drawer é compartilhado: a regra vale igual no `DataTable`, no `DataList` e em
  quem monta `<ToolbarFilterControl>` na mão.
- **Linha sem valor a editar tem saída PRÓPRIA.** `isEmpty`/`isNotEmpty` só chegam ao
  drawer pela preservação acima (nenhum tipo os tem como default), e o widget deles
  devolve "(sem valor)", sem `onChange`. Essa linha — **e só ela** — ganha um botão
  "Limpar" que remove os items **daquele campo**, preservando os dos outros. Sem ele a
  única saída seria o "Limpar todos" do rodapé, que apaga o filtro de todos os campos:
  preservar o operador teria trocado um defeito silencioso (digitar rebaixava `isEmpty`
  pra `contains`) por um beco sem saída nuclear — o que a **L-070** proíbe. Nenhuma outra
  linha muda de aparência.
  ⚠️ **Isto cobre a linha sem valor a editar, e NÃO é "toda linha tem saída".** Medido:
  `select`, `boolean`, `badge` e `user` renderizam um `<Select>` sem opção vazia e sem
  limpar — uma vez preenchido, o campo deles **só se esvazia pelo "Limpar todos"**. O
  sinal por operador não alcança esse caso (o operador é `equals`, que tem valor), e dar
  botão a toda linha muda pixel em todos os consumidores do drawer. Está anotado como
  pendência do mantenedor; até lá, **não** afirme que o funil esvazia qualquer campo.
- **Tipo registrado DECLARA o operador sem valor dele** com `noValue: true` no item de
  `operators` (`v0.71.0`+) — e aí a linha dele ganha a mesma saída. O sinal é o
  **operador**, não o widget: não dá pra perguntar ao `renderFilterInput` se ele trouxe
  `onChange`. `isEmpty`/`isNotEmpty` já valem sem declarar (`NO_VALUE_OPERATORS` em
  `DataTable/utils/filter-ops` é o fallback dos built-in); o campo é pro resto.
  ```tsx
  columnTypeRegistry.register({
    type: "periodoFixo",
    operators: [
      { id: "between", label: "entre" },
      { id: "equals", label: "mês corrente", noValue: true }, // ← ganha o "Limpar"
    ],
    // …
  });
  ```
  ⚠️ `ColumnTypeOperator.noValue` é exportado desde sempre e era **inerte** até a
  `v0.71.0`: declarar não fazia nada, sem erro e sem aviso (L-061). Foi **ligado**, não
  removido, por ser API pública — nenhum dos 16 built-in o declara, então nada mudou
  pra eles.

## Acoplamento DataTable ↔ TableToolbar

O DataTable consome os parts do TableToolbar via composição e orquestra os slots
na ordem fixa. Mudar a ordem/conteúdo dos controles do DataTable é edição **no
DataTable**, não aqui. Coupling reverso (DataTable → TableToolbar para
`columnTypeRegistry`/`FilterModel`) é aceito; o inverso é proibido.
