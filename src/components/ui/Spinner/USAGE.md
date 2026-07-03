# Spinner

**Categoria:** iGreen (tv()). Indicador de **loading** (SVG que gira).

## Quando usar

- Estado de carregamento inline: dentro de botões (`Salvando…`), ao lado de um label, em placeholders de área que ainda vai popular.
- Para um bloco de página inteiro carregando, componha com o seu próprio layout (ex.: centralizar `<Spinner size="lg" />`).

Não é barra de progresso determinística — para isso use `Progress`.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Tamanho via `size-icon-sm/md/lg`. |
| `color` | `"current" \| "default" \| "muted" \| "brand" \| "on-brand"` | `"muted"` | Cor via `text-fg-*`. `current` herda a cor do texto do pai. |
| `label` | `string` | `"Carregando"` | Rótulo acessível (`role="status"`). |
| `className` | `string` | — | Overrides (o SVG é o próprio nó — aceita `ref` para `SVGSVGElement`). |

Aceita qualquer prop de `<svg>` (menos `color`, sobrescrita pela variante).

## Variantes

| Variante | Valores |
|----------|---------|
| `size` | `sm` · `md` · `lg` |
| `color` | `current` · `default` · `muted` · `brand` · `on-brand` |

## Exemplo mínimo

```tsx
import { Spinner } from "@snksergio/design-system";

// standalone, neutro
<Spinner />

// dentro de um botão primário (herda o branco do texto do botão)
<Button disabled>
  <Spinner size="sm" color="current" aria-hidden />
  Salvando…
</Button>

// destaque de marca, maior
<Spinner size="lg" color="brand" label="Carregando ranking" />
```

## Gotchas

- **Respeita `prefers-reduced-motion`**: quando o usuário pede menos movimento, a rotação para (`motion-reduce:animate-none`) — o spinner fica estático mas ainda comunica "carregando" via `role="status"`.
- **Decorativo dentro de botões**: passe `aria-hidden` — aí o `label`/`role="status"` são omitidos (o texto do botão já anuncia o estado) e evita anúncio duplicado no leitor de tela.
- O traço usa `currentColor`; `color="current"` é o caminho para casar com a cor do container.
