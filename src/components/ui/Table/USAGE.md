# Table — primitiva burra de grid

`Table` é a **primitiva de baixo nível** que renderiza estrutura visual de grid: head, body, rows, cells. Sem lógica de dados. Use-a quando precisar de uma tabela leve sem o overhead do `DataTable` (smart wrapper que orquestra filtro/sort/pagination/virtualization).

## Anatomia

```tsx
<Table density="standard" cellBorders ariaLabel="Lista de itens">
  <TableHead>
    <TableHeadCell field="id" sortable sortDirection="asc" icon={Hash} width={120}>
      ID
    </TableHeadCell>
    <TableHeadCell field="name" sortable resizable width={240}>
      Nome
    </TableHeadCell>
  </TableHead>

  <TableBody>
    {rows.map((row) => (
      <TableRow key={row.id} selected={isSelected(row)} onClick={() => open(row)}>
        <TableCell field="id" width={120}>{row.id}</TableCell>
        <TableCell field="name" width={240} ellipsis>{row.name}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

## Componentes

| Componente | Responsabilidade |
|---|---|
| `Table` | Root grid container. Aceita `scrollRef` externa (pra virtualization). |
| `TableHead` | Sticky row group de headers. `sticky` toggle. `rootProps` pra HTMLAttributes. |
| `TableHeadCell` | Cell de header. `forwardRef`. Suporta sort, resize, icon, headMenu slot. |
| `TableBody` | Row group de body. `virtualized={{ totalHeight }}` ativa modo absolute layout. |
| `TableRow` | `forwardRef`. `selected`/`open`/`focused`/`clickable` variants. |
| `TableCell` | `forwardRef`. Cell de dados. `purpose="selection"` remove padding (checkbox). |
| `TableCardRow` | Modo card (mobile) — substitui TableRow inteira por card vertical. Pra auto-switch baseado em viewport, prefira `<DataTable cardBreakpoint={...}>` (faz o mapeamento automaticamente). |

## Hooks expostos

| Hook | Pra que serve |
|---|---|
| `useColumnWidths(columns)` | Calcula `widths` efetivos + `stickyOffsets` cumulativos pra colunas pinned. |
| `useColumnResize({ currentWidth, onResize, onResizeEnd, onResizeLiveDOM })` | Drag-to-resize handle. 3 callbacks: live DOM (síncrono), onResize (mousemove), onResizeEnd (mouseup). |

## Constants

```ts
import { SELECTION_COLUMN_WIDTH, TABLE_HEADER_HEIGHT } from "@/components/ui/Table";

// SELECTION_COLUMN_WIDTH = 56 — usar em TableHeadCell/TableCell width
// TABLE_HEADER_HEIGHT    = 42 — alinhar skeletons, totalizers, group headers
```

## Patterns

### 1. Coluna de seleção (checkbox)

```tsx
import { SELECTION_COLUMN_WIDTH } from "@/components/ui/Table";

<TableHeadCell width={SELECTION_COLUMN_WIDTH} purpose="selection">
  <Checkbox checked={...} onCheckedChange={...} />
</TableHeadCell>

<TableCell width={SELECTION_COLUMN_WIDTH} purpose="selection">
  <Checkbox checked={...} onCheckedChange={...} />
</TableCell>
```

`purpose="selection"` remove `px-pad-2xl` interno pra checkbox ficar centralizado em 56px.

### 2. Resize column com state externo

```tsx
const [colWidths, setColWidths] = useState<Record<string, number>>({});

<TableHeadCell
  field="name"
  width={colWidths.name ?? 240}
  resizable
  // mousemove → side-effect (live DOM já é feito internamente pelo TableHeadCell)
  onResize={(w) => console.log("dragging:", w)}
  // mouseup → commit no state
  onResizeEnd={(w) => setColWidths((prev) => ({ ...prev, name: w }))}
>
  Nome
</TableHeadCell>
```

### 3. Virtualization (`@tanstack/react-virtual`)

```tsx
const scrollRef = useRef<HTMLDivElement | null>(null);
const virtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 56,
  overscan: 10,
});

<Table scrollRef={scrollRef}>
  <TableHead>{/* ... */}</TableHead>
  <TableBody virtualized={{ totalHeight: virtualizer.getTotalSize() }}>
    {virtualizer.getVirtualItems().map((vi) => (
      <TableRow
        key={rows[vi.index].id}
        rootProps={{
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: `${vi.size}px`,
            transform: `translateY(${vi.start}px)`,
          },
        }}
      >
        {/* cells */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 4. Card mode manual (TableCardRow + matchMedia)

Pro `<Table>` puro, o auto-switch row→card NÃO é automático — você decide via `matchMedia` ou ResizeObserver:

```tsx
import { useMediaQuery } from "@/components/ui/MenuSidebar/use-media-query";
import { TableCardRow } from "@/components/ui/Table";

const isMobile = useMediaQuery("(max-width: 767px)");

return isMobile ? (
  <div className="flex flex-col gap-gp-md">
    {rows.map((row) => (
      <TableCardRow
        key={row.id}
        header={<strong>{row.name}</strong>}
        items={[
          { label: "Email", value: row.email },
          { label: "Status", value: row.status },
        ]}
      />
    ))}
  </div>
) : (
  <Table>{/* ... */}</Table>
);
```

> Pra evitar o trabalho manual, use `<DataTable cardBreakpoint={768}>` — ele mapeia automaticamente as colunas (selection + primary + actions + items) e renderiza `<TableCardRow>` abaixo do breakpoint.

### 5. Sticky pinned columns

```tsx
const cols = [
  { field: "id", width: 120, pinned: "left" as const },
  { field: "name", width: 240, pinned: "left" as const },
  { field: "email", width: 240 },
];

const { widths, offsets } = useColumnWidths(cols);

<TableHeadCell field="id" width={widths.id} pinned="left" pinOffset={offsets.id}>
  ID
</TableHeadCell>
```

## Table vs DataTable — quando usar qual

| Use **Table** quando | Use **DataTable** quando |
|---|---|
| Tabela estática sem filtros/sort/paginação | CRM/admin com filtros, sort, etc |
| Lista simples controlada por estado próprio | Server mode ou client mode com mock |
| Quer composição máxima manual | Quer setup rápido via prop config |
| Tabela dentro de modal/drawer pequeno | Página inteira com toolbar + footer |

## Princípio dumb

`Table` **não armazena estado de dados**. Tudo é controlado externamente:
- Selection → consumer mantém `Set<id>` e passa pra cada `TableRow`
- Sort → consumer decide `sortDirection` por cell e implementa onClick
- Pagination → consumer fatia rows antes de mapear

O Table guarda **apenas** estado visual interno (resize hover, scroll detection) — via `TableContext` privado, nunca exposto.
