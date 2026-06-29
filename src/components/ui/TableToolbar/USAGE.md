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
| `savedViews` | Abas de visões + adicionar (`<TableToolbarViews>` + `<ViewsPopover>`). `<TableToolbarViews allowCreate={false}>` (v0.23.0) esconde o "+" e o modal de nova visão → só as visões pré-definidas (read-only). No DataTable use a prop `allowCreateView`. |
| `refresh`    | Botão atualizar (`<ToolbarToolButton>`)                                                                                                                                         |
| `search`     | Campo de busca (`<ToolbarSearch>`)                                                                                                                                              |
| `filter`     | Filtro simples: use `<ToolbarFilterButton onClick isActive hasIndicator />` (funil, icon-only — **mesmo botão** no DataTable e DataList) → abre `<ToolbarSimpleFilterDrawer>`   |
| `actions`    | Ações custom: `<ToolbarActions actions={[...]} />` (`button`/`dropdown`/`input`). Inline no desktop; **colapsam no ⋯ no mobile** (passe `extraItems` p/ absorver o ⋯ existente) |
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
- **bulkBar substitui tudo**: passe `<BulkActionsBar>` (auto-some quando `count=0`)
  condicionalmente — `selectedIds.size > 0 ? <BulkActionsBar/> : undefined`.
- **Chips ficam fora** da toolbar: renderize `<ToolbarApplied>` como irmão abaixo.

## Acoplamento DataTable ↔ TableToolbar

O DataTable consome os parts do TableToolbar via composição e orquestra os slots
na ordem fixa. Mudar a ordem/conteúdo dos controles do DataTable é edição **no
DataTable**, não aqui. Coupling reverso (DataTable → TableToolbar para
`columnTypeRegistry`/`FilterModel`) é aceito; o inverso é proibido.
