# ColorPicker

**Categoria:** composto (Popover + Input + FormField + Button + Separator). Seletor de cor **hex `#RRGGBB`** controlado, pensado para **Tags** e **Filas**.

## Quando usar

- Escolher uma cor de marca/identidade para uma entidade (tag, fila, etiqueta, status custom).
- Quando o usuário precisa **ver e digitar** o hex E ter atalho para uma **paleta curada**.

Não use para escolha semântica (sucesso/erro/aviso) — isso são tokens DS, não cor livre.

## Anatomia

```
[ swatch ]  [ Input hex (#RRGGBB) ]      ← trigger inline (swatch abre o popover)
            ▼ (clique no swatch)
┌─────────────────────────────┐
│  grid 10-col de presets      │          ← swatch selecionado = checkmark (contraste auto)
│  ───────── Separator ─────── │
│  Cor personalizada  [input]  │          ← allowCustomHex (default true)
│  [ Aplicar ]                 │
└─────────────────────────────┘
```

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `string` | — | **Obrigatório.** Hex controlado `#RRGGBB`. |
| `onValueChange` | `(hex: string) => void` | — | **Obrigatório.** Recebe sempre `#RRGGBB` maiúsculo normalizado. |
| `presets` | `string[]` | `DEFAULT_COLOR_PRESETS` | Cores do grid (paleta iGreen + neutras, ~26 hex). |
| `id` | `string` | auto | id do input hex (linka label externo via `htmlFor`). |
| `state` | `"default" \| "error" \| "warning" \| "success"` | `"default"` | Colore **só a borda** do trigger. **Não** é color variant. |
| `size` | `"sm" \| "md"` | `"md"` | `sm` = form-md (36px) · `md` = form-lg (40px). |
| `disabled` | `boolean` | `false` | Desabilita o seletor inteiro. |
| `allowCustomHex` | `boolean` | `true` | Mostra o input hex livre + botão Aplicar no popover. |
| `placeholder` | `string` | `"#RRGGBB"` | Placeholder dos inputs hex. |
| `open` / `onOpenChange` | — | — | Controle externo de abertura do popover. |
| `className` | `string` | — | className do container (root). |

## Exemplo mínimo

```tsx
import { ColorPicker } from "@snksergio/design-system";

const [color, setColor] = useState("#16A34A");

<FormField label="Cor da tag" id="tag-color">
  {({ id }) => (
    <ColorPicker id={id} value={color} onValueChange={setColor} />
  )}
</FormField>
```

## Variants

| Variant | Valores | Efeito |
|---------|---------|--------|
| `size` | `sm` · `md` | altura do trigger (swatch + input) |
| `state` | `default` · `error` · `warning` · `success` | cor da borda do swatch |
| `disabled` | — | último compoundVariant (L-006); desabilita tudo |

## Gotchas

- **Normalização:** aceita `3` ou `6` dígitos com/sem `#` (`fff`, `#FFF`, `00ff00`) → sempre emite `#RRGGBB` **maiúsculo**. Hex inválido no input inline restaura o `value` atual no blur.
- **bg dinâmico = exceção L-027:** o fundo do swatch e dos presets vem por `style={{ backgroundColor }}` (cor externa). É a única exceção de hardcode permitida; todo o resto é token DS.
- **Checkmark com contraste auto:** o preset selecionado usa `getContrastTextColor(hex)` para escolher branco/preto — não cor cega.
- **Anchor do Popover:** o swatch é `forwardRef` via `PopoverTrigger asChild` (L-021). O `ref` encaminhado vai para o botão do swatch.
- **Foco:** swatch + presets seguem Padrão 1 (botão, `ring-4 ring-ring-primary`); o input hex herda o foco animado do `Input` do DS (Padrão 2).
- Para parear visualmente com outros campos de um form, envolva em `<FormField>` (render-prop) — o `state` do ColorPicker espelha o do Input para casar a borda.
