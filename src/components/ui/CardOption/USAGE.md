# CardOption

<!-- ds:regras
- switch = efeito IMEDIATO, sem Salvar, e só em `layout="list"`; tela com botão Salvar → `type="checkbox"`
- opções que se COMPARAM (plano, tier, preço, descrição longa) → cards espaçados; itens do mesmo tipo com rótulo curto (settings, permissões, pagamento, endereço) → `layout="list"`
- mais de ~5 opções → não é CardOption: `Select`/`Combobox`. E on/off de UMA coisa nunca são 2 radios
- `type="radio"` EXIGE `<CardOptionGroup type="radio">` em volta; checkbox e switch funcionam soltos
- em lista o selecionado NÃO pinta por default (a borda ali é a divisória) — queira pintado? `highlightSelected` no grupo
- omita `orientation`, `highlightSelected` e `size`: derivam do type · `md` é o calibrado
-->

**O que é** — controle de formulário apresentado como **card clicável** (área grande, label +
descrição visíveis), com o controle trocável por prop: `checkbox`, `radio` ou `switch`.
**Categoria**: Form Controls.

**Quando usar** — opção destacada que merece área de clique grande e texto de apoio: escolha
de plano/frete, lista de permissões, painel de configurações. Para campo compacto em
formulário, use `FormFieldCheckbox` / `RadioGroup` cru. Para um único toggle inline, `Switch`
direto. **Acima de ~5 opções, não use CardOption**: vira parede de cards — é `Select` ou
`Combobox` ([Soul DS](https://soul.emplifi.io/latest/components/in-progress/radio-button-card-Pnx3WsEU)).

## Escolhendo: duas perguntas

### 1. Qual `type`? — depende da DECISÃO, não da aparência

| Use | Quando | Fonte |
|---|---|---|
| `switch` | liga/desliga uma funcionalidade **com efeito imediato**, sem Salvar | [NN/g](https://www.nngroup.com/articles/toggle-switch-guidelines/) |
| `radio` | uma entre várias mutuamente exclusivas, e o usuário precisa **ver todas** pra decidir | [NN/g](https://www.nngroup.com/articles/checkboxes-vs-radio-buttons/) |
| `checkbox` | combinação livre (zero, uma ou várias) — **e** o substituto do switch quando há Salvar | idem |

Os dois erros que essa tabela evita, os dois de fonte externa:

- **Switch em tela com botão Salvar.** O switch promete efeito imediato — "should take
  immediate effect and should not require the user to click Save or Submit" (NN/g). Num form
  com submit, o usuário não sabe se já valeu. Ali o controle é `type="checkbox"`.
- **Dois radios pra on/off de uma coisa.** Um par "Ativado / Desativado" é um switch (se
  imediato) ou **um** checkbox (se tem submit) — nunca dois radios.

### 2. Lista ou cards espaçados? — depende de quanta COMPARAÇÃO a decisão pede

| Use | Quando |
|---|---|
| `layout="list"` | itens **do mesmo tipo**, rótulo curto, decisão já conhecida: configurações (switch), permissões (checkbox), meio de pagamento / endereço / forma de entrega (radio). Densidade > destaque |
| `spaced` (default) | cada opção precisa ser **comparada** — preço, descrição longa, ícone, badge: plano, tier, onboarding. O gap é o que separa as unidades de comparação |

**Switch vive em lista, não em card solto.** É literal na Apple HIG: *"Use the switch toggle
style only in a list row"* — e a razão é que o switch tem mais peso visual que um checkbox, o
que só se justifica quando a linha inteira lhe dá contexto
([HIG](https://developers.apple.com/design/human-interface-guidelines/components/selection-and-input/toggles/)).

Meio de pagamento é o caso clássico de **radio em lista**: alvo grande e indicador visível
resolvem o problema do radio nativo, e o logo/ícone entra à esquerda, junto do nome
([Baymard](https://baymard.com/blog/payment-method-selection)) — o que o `icon` do CardOption
já faz por construção.

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
