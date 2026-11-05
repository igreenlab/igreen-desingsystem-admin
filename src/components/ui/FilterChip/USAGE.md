# FilterChip — USAGE

**O que é:** o chip de filtro **aplicado** — a pílula que aparece numa fileira
abaixo de uma toolbar dizendo o que está ligado, com o `⊗` pra desligar sem
reabrir o controle que o produziu (L-051).

**Categoria:** peça de composição. Não é tela nem controle de entrada: ele só
**resume** um estado de filtro que alguém já produziu.

**Componente novo na `vNEXT`** — não existe em versão publicada.

> ⚠️ **Não confunda com `Chip`.** O `Chip` é a pílula genérica de status, tag e
> seleção. O `FilterChip` tem anatomia fixa (`⊗ · nome · operador · valor…`) e
> existe só pra representar um filtro aplicado.

---

## Quando usar

Quando a sua tela filtra uma coleção e precisa mostrar **o que está filtrado**
fora do controle que filtrou. Hoje: `TableToolbar`/`DataTable`, `DataList`,
`Gantt` e `Scheduler`.

Se o componente que você usa já tem a fileira pronta (`DataTable`, `DataList`,
`Gantt`, `Scheduler`), **não monte à mão** — ela já vem.

---

## Por que esta peça existe

Até 2026-11-04 a mesma gramática existia **três vezes**, escrita à mão:
`toolbarAppliedChip*` (`TableToolbar`, a origem), `schedulerFilterChip*` e
`ganttAppliedChip*`. As três já tinham divergido — `gap-gp-md` × `gap-gp-sm`,
`pl-pad-sm pr-pad-lg` × `pl-pad-lg pr-pad-md`, pílula de valor 22px × 20px.

A causa não era desleixo: **`toolbarAppliedChip` não era exportado**, nem do
`TableToolbar/index.ts` nem do barrel. Quem precisava do chip não tinha como
importá-lo. Peça inalcançável é peça recopiada — por isso ela agora é export
público, e por isso **o componente**, não só os `tv()`: compartilhar apenas os
estilos deixaria a anatomia livre, e foi exatamente aí que o `Scheduler`
divergiu (o `×` estava à direita, sem operador).

---

## Props essenciais

| Prop | Tipo | Default | O que faz |
|---|---|---|---|
| `name` | `ReactNode` | — | Nome do campo filtrado ("Status", "Frente") |
| `op` | `ReactNode` | — | Operador entre nome e valor ("é", "contém"). `null`/ausente não renderiza |
| `opClassName` | `string` | — | Classe extra só no operador (ex.: exclusão em `text-fg-danger`) |
| `values` | `readonly ReactNode[]` | `[]` | Uma pílula por item. Lista vazia = chip VAZIO (só o nome) |
| `active` | `boolean` | `false` | Destaque de marca — **opt-in**, ver abaixo |
| `interactive` | `boolean` | `false` | Cursor, hover e anel de foco. O clique é de quem chama |
| `removable` | `boolean` | `true` | `false` troca o `⊗` por um `⊕` decorativo |
| `onRemove` | `() => void` | — | Clique no `⊗`. Já vem com `stopPropagation` |
| `removeLabel` | `string` | `"Remover filtro"` | `aria-label` do `⊗` |

Aceita também qualquer prop de `<span>` (`role`, `tabIndex`, `onKeyDown`,
`aria-*`) — elas chegam ao elemento raiz.

---

## Variants

| Variant | Valores | Efeito |
|---|---|---|
| `interactive` | `false` \| `true` | `true` liga `cursor-pointer`, hover e `focus-visible:ring-4` |
| `active` | `false` \| `true` | `false` = tracejado neutro (**default**, o pixel de sempre). `true` = sólido de marca sobre `bg-brand-subtle`, valor em `fg-brand` no claro |

---

## Exemplo mínimo

```tsx
import { FilterChip, filterChipRow, filterChipClearLink } from "@/components/ui/FilterChip";

<div className={filterChipRow({ separator: true })}>
  {aplicados.map((f) => (
    <FilterChip
      key={f.id}
      name={f.label}
      op="é"
      values={[f.valorFormatado]}
      onRemove={() => limpar(f.id)}
      removeLabel={`Remover filtro ${f.label}`}
    />
  ))}
  <button type="button" className={filterChipClearLink()} onClick={limparTudo}>
    Limpar todos
  </button>
</div>
```

---

## Gotchas / cuidados

- **`active` não é sinônimo de "tem valor".** O destaque de marca existe pra
  contrastar com o chip **vazio** na mesma fileira. Numa fileira onde todo chip
  já está aplicado ele não distingue nada — só repinta tudo de verde. Ligue só
  quando houver vazio pra contrastar (é o que a prop
  `highlightAppliedFilterChips` do `DataTable`/`ToolbarApplied` faz, e o motivo
  de ela ser opt-in).
- **A pílula do valor não é tingida, nem no `active`.** Medido: marca sobre
  marca derruba o texto pra 3,14:1 no claro (AA de 12px pede 4,5). E no escuro
  o valor volta a `fg-default` — `fg-brand` ali mede 4,36:1. Quem carrega o
  estado no escuro é a borda.
- **O `⊗` fica à esquerda, e isso é a regra.** À direita ele vem depois de um
  valor de largura variável e "dança" entre chips; à esquerda os alvos ficam
  alinhados numa coluna.
- **`forwardRef` existe por necessidade (L-021).** O chip é usado como anchor de
  `<PopoverTrigger asChild>` em três lugares. Se você envolver o chip, preserve
  o ref e o spread de props.
- **Colapsar valores em "N selecionados" é decisão de quem chama**, não do chip.
  O `Gantt` colapsa acima de 3 porque o eixo horizontal dele disputa a mesma
  largura; a tabela não colapsa.
- **Não é item próprio do registry.** Os arquivos viajam dentro de `data-table`,
  `gantt` e `scheduler` — mesmo caminho do `TableToolbar`. Ao criar um item novo
  que use o `FilterChip`, acrescente os 5 arquivos ao `files[]` dele (o gate
  `registry-imports` reprova se esquecer).
