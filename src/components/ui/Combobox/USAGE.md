# Combobox

**Categoria:** composto (Popover + Command/cmdk). Select de escolha única com **busca (autocomplete)** e **lista rolável**.

## Quando usar

- Lista de opções **longa** onde o usuário precisa **digitar pra achar** (ex.: escolher 1 coluna entre 30, 1 país, 1 cliente).
- Quando um `Select` simples ficaria alto demais / sem scroll confortável e sem busca.

Para listas curtas (≤ ~8 itens) e sem necessidade de busca, prefira `FormFieldSelect` / `Select`.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `options` | `ComboboxOption[]` | — | `{ value, label, keywords? }`. Busca casa por `label` + `keywords` (que já inclui `value`). |
| `value` | `string` | — | Valor selecionado (controlado). |
| `onValueChange` | `(value: string) => void` | — | Recebe o `value` da opção escolhida. |
| `placeholder` | `ReactNode` | `"Selecione…"` | Texto do trigger vazio. |
| `searchPlaceholder` | `string` | `"Buscar…"` | Placeholder do input de busca. |
| `emptyMessage` | `ReactNode` | `"Nenhum resultado."` | Quando a busca não casa nada. |
| `open` / `defaultOpen` / `onOpenChange` | — | — | Controle de abertura (igual a um Select). |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alinhamento do dropdown. |
| `className` | `string` | — | Estiliza o **trigger** (aceita os mesmos overrides de um `SelectTrigger`). |
| `contentClassName` | `string` | — | Estiliza o **dropdown** (PopoverContent). |
| `disabled` | `boolean` | — | Desabilita o trigger. |

`ComboboxOption = { value: string; label: string; keywords?: string[] }`

## Exemplo mínimo

```tsx
import { Combobox } from "@snksergio/design-system";

<Combobox
  options={columns.map((c) => ({ value: c.key, label: c.label }))}
  value={field}
  onValueChange={setField}
  placeholder="Campo"
  searchPlaceholder="Buscar campo…"
  emptyMessage="Nenhum campo"
  aria-label="Campo"
/>
```

## Gotchas

- O trigger é um `<button role="combobox">` e espelha o `SelectTrigger` (mesma altura/borda/foco). Para parear com Selects irmãos num form, passe o mesmo `className` que você passaria ao `SelectTrigger`.
- A seleção **não** depende do argumento do `onSelect` do cmdk (que vem normalizado/lowercased) — o componente fecha via closure sobre `option.value`. Por isso `value`s com maiúsculas/acentos/espaços funcionam.
- O dropdown nasce com a **largura do trigger** (`--radix-popover-trigger-width`). Para largura própria, use `contentClassName="w-[...]"`.
- `label`s devem ser únicos (o cmdk indexa por `value`/label do item). Se houver rótulos repetidos, diferencie via `keywords`.

## Multi-seleção (2026-09-23)

`multiple` liga a escolha múltipla. `value` vira `string[]` e `onValueChange` recebe a
lista COMPLETA a cada toggle.

```tsx
<Combobox
  multiple
  options={status}
  value={selecionados}          // string[]
  onValueChange={setSelecionados}
  maxChips={2}                  // resume em "+N" a partir daqui
/>
```

Três diferenças de comportamento, todas por causa do fluxo real (escolher várias de uma
lista longa):

- o dropdown **não fecha** ao selecionar — fechar a cada clique custaria um reabrir e
  re-buscar por item;
- clicar numa opção marcada **desmarca**;
- o trigger mostra chips e resume em "+N" a partir de `maxChips` (default 2).
  `renderSummary` substitui esse conteúdo.

⚠️ **Os chips do trigger não têm ×.** O trigger é um `<button>`, e um botão de remover
ali dentro seria botão aninhado: HTML inválido, o navegador desaninha e o × passa a
abrir o dropdown. Pra dar remoção com ×, renderize `<Chip onRemove>` **abaixo** do
campo, a partir do mesmo estado.
