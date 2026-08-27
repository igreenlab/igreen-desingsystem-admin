# CardOption

<!-- ds:regras
- `type="radio"` EXIGE `<CardOptionGroup type="radio">` em volta; checkbox e switch funcionam soltos
- omita `orientation` e `highlightSelected`: derivam do type (switch = direita, sem destaque)
- lista (settings, permissões, planos) → `<CardOptionGroup layout="list">`; vale pros 3 tipos
- em lista o selecionado NÃO pinta por default (a borda ali é a divisória) — queira pintado? `highlightSelected` no grupo
- omita `size`: `md` é o padrão calibrado
-->

**O que é** — controle de formulário apresentado como **card clicável** (área grande, label +
descrição visíveis), com o controle trocável por prop: `checkbox`, `radio` ou `switch`.
**Categoria**: Form Controls.

**Quando usar** — opção destacada que merece área de clique grande e texto de apoio: escolha
de plano/frete, lista de permissões, painel de configurações. Para campo compacto em
formulário, use `FormFieldCheckbox` / `RadioGroup` cru. Para um único toggle inline, `Switch`
direto.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `type` | `"checkbox" \| "radio" \| "switch"` | herda do grupo, ou `"checkbox"` | qual controle o card embrulha |
| `value` | `string` | — | **obrigatório com `type="radio"`** |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 8 / 12 / 16px de padding |
| `orientation` | `"left" \| "right"` | **derivado do `type`** | lado do controle |
| `highlightSelected` | `boolean` | do `type`; **em lista: `false`** | fundo + cor de borda no selecionado |
| `label` | `ReactNode` | — | obrigatório |
| `description` | `ReactNode` | — | texto de apoio |
| `icon` | `ReactNode` | — | **sempre à esquerda**, mesmo com `orientation="right"`. Piso de 20×20px |
| `checked` / `onCheckedChange` | | — | controlado (no radio, quem manda é o grupo) |
| `disabled` | `boolean` | — | |

### `CardOptionGroup`

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `type` | igual ao item | `"checkbox"` | `"radio"` faz o grupo **ser** o `RadioGroup` do Radix |
| `layout` | `"spaced" \| "list"` | `"spaced"` | `list` = contorno no grupo + divisória entre linhas, sem gap. Vale pros **3 tipos** |
| `highlightSelected` | `boolean` | — | liga/desliga o destaque em todos os filhos de uma vez |
| `size` / `orientation` | | | aplicados a todos os filhos |
| `value` / `defaultValue` / `onValueChange` / `name` | | — | só `type="radio"` |

## Exemplo mínimo

```tsx
// checkbox solto
<CardOption
  label="Salvar essa conta pra usar depois"
  description="Aparece na lista de contas favoritas"
  checked={salvar}
  onCheckedChange={setSalvar}
/>

// radio — o grupo é obrigatório
<CardOptionGroup type="radio" value={frete} onValueChange={setFrete}>
  <CardOption value="standard" label="Standard" description="4 a 10 dias úteis" />
  <CardOption value="express" label="Express" description="2 a 3 dias úteis" />
</CardOptionGroup>

// lista de settings — switch, à direita, sem destaque de selecionado
<CardOptionGroup type="switch" layout="list">
  <CardOption label="Wi-Fi" description="Conectar a redes sem fio" checked={wifi} onCheckedChange={setWifi} />
  <CardOption label="Bluetooth" description="Permitir conexões Bluetooth" checked={bt} onCheckedChange={setBt} />
</CardOptionGroup>
```

## Gotchas / cuidados

- **`type="radio"` sem `CardOptionGroup` não funciona direito.** É o `RadioGroup` do Radix que
  dá navegação por seta e agrupamento por `name`. Checkbox e switch são autônomos.
- **Não passe `orientation` nem `highlightSelected` sem motivo.** Eles derivam do `type`, e o
  default é a convenção: switch fica **à direita** (linha de configuração) e **sem destaque de
  selecionado**, porque switch é *estado*, não seleção — uma lista de settings toda pintada de
  verde é ruído. Foi por isso que o exemplo antigo do Card Toggle não tinha estado visual.
- **`layout="list"` não é exclusivo do switch.** Com radio vira seletor de linha única; com
  checkbox, lista de permissões. No modo lista o contorno é do grupo e a divisória é a borda
  de baixo de cada item (a última suprimida) — não force borda no item.
- **Em lista, o destaque de selecionado vem desligado — inclusive em checkbox e radio.** É
  consequência de onde a borda mora: em lista a única borda do item é a de baixo, ou seja a
  **divisória**, então o `border-brand` não contorna o selecionado — pinta a linha que o separa
  do vizinho — e o fundo vira faixa colorida no meio da lista (medido em 2026-08-27, antes do
  ajuste: linha verde com divisória verde). Quem quer o pintado liga `highlightSelected` no
  grupo ou no item; a prop vence nas duas direções, e em lista a sombra do destaque sai (dentro
  do `overflow-hidden` do grupo ela não eleva, só vaza).
- **O ícone fica sempre à esquerda**, inclusive com `orientation="right"`: o `order-last` move
  só o controle. Ele identifica a opção e pertence ao lado do texto. Piso de 20×20px.
- **É um `<label htmlFor>` nativo, nunca `<button>` (L-025).** Não embrulhe em outro botão nem
  ponha `onClick` no card: o clique já chega ao controle real pelo label, e trocar isso quebra
  o leitor de tela ("button" em vez de checkbox) e o submit nativo.
- **O anel de foco é do CARD**, via `has-[:focus-visible]`. O `CardCheckbox` antigo declarava
  `focus-visible:ring-4` no próprio `<label>` — inerte, porque label não recebe foco (medido
  em 2026-08-27: o único anel visível era o do controle de 16px).
- **`CardCheckbox` continua existindo** como atalho de `type="checkbox"`. Componente novo
  deve usar `CardOption`.
