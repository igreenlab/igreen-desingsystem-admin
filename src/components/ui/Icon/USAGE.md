# Icon — USAGE

Biblioteca de ícones própria da iGreen. O SVG é fixo; só o `d` do path muda via
prop `name` (mapa de tokens em `icons.ts`). Categoria: data-display / foundation.

## Quando usar

- Ícones da identidade iGreen (não cobertos / divergentes do lucide).
- Quando precisar de um set controlado e versionado dentro do DS.
- Para ícones genéricos de UI, `lucide-react` continua válido — este componente é
  o set **próprio** da marca.

## Import

```tsx
import { Icon } from "@/components/ui/Icon";
```

## Exemplo mínimo

```tsx
<Icon name="line-user" />                      {/* md (20px), currentColor */}
<Icon name="fill-status" size="lg" tone="brand" />
<Icon name="line-edit" size={28} color="#0fc589" />
<span className="text-fg-danger"><Icon name="line-bin" /></span>  {/* herda via CSS */}
```

## Props

| Prop | Valor | Default |
|---|---|---|
| `name` | `IconName` (autocomplete da lib) | — |
| `size` | preset `xs\|sm\|md\|lg\|xl` (tokens `size-icon-*` = 12/16/20/24/32) **ou** arbitrário (`number`→px / string CSS) | `md` |
| `tone` | semântico → `text-fg-{default\|muted\|brand\|danger\|success\|warning\|info}` | — |
| `color` | qualquer cor CSS (override; vence `tone`/CSS) | — |
| `title` / `aria-label` | acessível → `role="img"` + `<title>`. Sem isso = decorativo (`aria-hidden`) | decorativo |

## Cor — 3 formas

1. **CSS** (recomendado): herda `currentColor`, controlável por classe — `<span className="text-fg-brand"><Icon name="..."/></span>`.
2. **`tone`**: token semântico do DS (`tone="danger"`).
3. **`color`**: valor CSS arbitrário (`color="#0fc589"` / `color="var(--x)"`).

## Convenção de nomes

- Prefixo `line-*` → contorno (viewBox `0 0 18 18`).
- Prefixo `fill-*` → preenchido (viewBox `0 0 24 24`).
- O `viewBox` é inferido automaticamente pelo prefixo.

## Adicionar um ícone novo

1. Adicionar a entrada `"line-foo": "M…"` (ou `"fill-foo"`) em `icons.ts`.
2. O `IconName` atualiza sozinho (deriva das chaves). Sem mais nada.
3. Path normalizado pro viewBox do prefixo (18 p/ line, 24 p/ fill).

## Gotchas

- `size` arbitrário aplica `width`/`height` inline (não usa token) — prefira os presets.
- Decorativo por padrão (`aria-hidden`); passe `title`/`aria-label` quando o ícone
  carregar significado sozinho.
- Catálogo navegável (busca + copiar nome): doc `#/icon`.
