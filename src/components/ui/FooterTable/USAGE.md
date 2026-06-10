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
| `selectionCount` | number | 0 | Quantos selecionados (acrescenta "· N selecionado(s)" ao lado do range) |
| `pageSizeLabel` | string | "Linhas" | Label do select de page-size |
| `rowLabel` | string | "rows" | Sufixo do range (ex "registros") |
| `locale` | string | "pt-BR" | Locale pra formatar números do range |
| `hidePageSize` | boolean | false | Esconde select de page-size |
| `hideRange` | boolean | false | Esconde "1–10 de 87 rows" |
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

## FooterTableSkeleton
Estado loading do footer — usado pelo DataTable enquanto a primeira chamada de `fetchData` não retornou `totalCount`. Mantém a mesma silhueta do footer real pra evitar layout shift.

```tsx
import { FooterTableSkeleton } from "@/components/ui/FooterTable";

<FooterTableSkeleton pageButtonCount={5} />
```

| Prop | Tipo | Default | Função |
|---|---|---|---|
| `pageButtonCount` | number | 5 | Quantos botões de página simular |
| `className` | string | — | className extra no `<footer>` |

## Cuidados / Gotchas
- Calcula range "1–10 de 87 rows" automaticamente (sufixo customizável via `rowLabel`)
- Empilha vertical em mobile (`flex-col <sm`) — layout fixo, sem custom
- `selectionCount > 0` acrescenta "· N selecionado(s)" ao lado do range — NÃO substitui o range; pra esconder o range use `hideRange`
- Default `rowLabel = "rows"` produz texto misto ("1–10 de 87 rows") — passe `rowLabel="registros"` pra texto 100% pt-BR
- Pra usar fora de tabela, pode ser standalone — props são puramente paginação
