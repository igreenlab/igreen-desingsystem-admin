# FooterTable — USAGE

Footer de tabela com paginação + page-size select + range display + selection count.

## Quando usar
- Rodapé de qualquer `<Table>` ou `<DataTable>` (já é embutido no DataTable)
- Listas paginadas com seleção múltipla

## Import
```tsx
import { FooterTable } from "@/components/ui/FooterTable";
```

## Props essenciais
| Prop | Tipo | Default | Função |
|---|---|---|---|
| `totalCount` | number | — | Total de registros |
| `page` | number | — | Página atual (1-indexed) |
| `pageSize` | number | — | Tamanho da página atual |
| `onPageChange` | (page: number) => void | — | Callback de paginação |
| `onPageSizeChange` | (size: number) => void | — | Callback de troca de page-size |
| `pageSizeOptions` | number[] | [10, 25, 50, 100] | Opções do select |
| `selectionCount` | number | 0 | Quantos selecionados (mostra "X selecionados") |
| `hidePageSize` | boolean | false | Esconde select de page-size |
| `hideRange` | boolean | false | Esconde "1-10 de 87" |
| `hideFirstLast` | boolean | false | Esconde botões « » |

## Exemplo mínimo
```tsx
<FooterTable
  totalCount={87}
  page={currentPage}
  pageSize={10}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
  selectionCount={selectedIds.length}
/>
```

## Cuidados / Gotchas
- Calcula range "1–10 de 87" automaticamente
- Empilha vertical em mobile (`flex-col <sm`) — layout fixo, sem custom
- `selectionCount > 0` mostra texto à esquerda; senão range aparece ali
- Pra usar fora de tabela, pode ser standalone — props são puramente paginação
