# Icon — USAGE

Biblioteca de ícones própria da iGreen. O SVG é fixo; só o `d` do path muda via
prop `name` (mapa de tokens em `icons.ts`). Categoria: data-display / foundation.
⚠️ `<Icon name>` carrega o mapa inteiro no bundle — ver "Peso no bundle".

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
<Icon name="fill-user" size="lg" tone="brand" />
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

- Prefixo `line-*` → contorno (viewBox `0 0 18 18` no set legado, senão 24).
- Prefixo `fill-*` → preenchido (viewBox `0 0 24 24`).
- Prefixo `igreen-*` → **ícones oficiais de marca** (produtos: green, livre, placas,
  club, solar, telecom, licenciado, seguro, clientes). viewBox 24, herdam
  `currentColor`/`tone` como qualquer ícone (sem cor fixa).
- O `viewBox` é inferido automaticamente pelo prefixo.

## Adicionar um ícone novo

1. Adicionar a entrada `"line-foo": "M…"` (ou `"fill-foo"` / `"igreen-foo"`) em `icons.ts`.
2. O `IconName` atualiza sozinho (deriva das chaves). Sem mais nada.
3. **Multi-path**: o valor pode ser `string` (1 path) **ou** `string[]` (vários paths
   sobrepostos — ex.: `igreen-club`). Remova `fill=` hardcoded do SVG (herda `currentColor`).

## Peso no bundle — quem paga o mapa

`<Icon name>` resolve por **nome** (`icons[name]`), e bundler nenhum poda chave de objeto:
quem importa o `Icon` leva o mapa **inteiro** (2.404 ícones, ~4,3 MB de path, ~1 MB
gzip). É o contrato da API por nome — e por isso ela é **opt-in**: só paga quem usa.

Quem paga hoje: uso direto de `<Icon name>` e o `DateSeparatorChip` (a prop `icon` dele é
um `IconName` escolhido pelo consumidor). **Nenhum outro componente do DS** — gate em
`icon-poda.test.tsx`.

## ⛔ Daqui pra baixo é só para quem DESENVOLVE este repositório

> **Consome o Design System (npm, copy-in, submódulo)?** Pare aqui. Sua API é
> `<Icon name="...">`, já descrita acima, e ela não mudou. **Não copie o código desta
> seção**: `IconSvg` e `icon-glyphs` são peças **internas**, ficam fora do barrel, e
> `import { IconSvg } from "@/components/ui/Icon/icon-svg"` **não resolve** num projeto
> que instalou o pacote — o caminho não existe lá.
>
> Esta ressalva vem antes do exemplo de propósito: o `USAGE.md` é copiado inteiro para
> `dist-lib/ai/componentes/Icon.md` (`build-ai-bundle.mjs`), que é o que a IA do
> consumidor lê. Ressalva depois do bloco de código chega tarde — agente copia o
> exemplo antes de ler o rodapé.

**Ícone fixo dentro de um componente deste repositório** (`src/components/**`) → nunca
`<Icon name>`. Desenhe com `IconSvg` + a constante de `icon-glyphs.ts` (mesmas props do
`Icon`, com `glyph` no lugar de `name`):

```tsx
// ⚠️ uso INTERNO do repositório do DS — indisponível para quem consome o pacote
import { IconSvg } from "@/components/ui/Icon/icon-svg";
import { lineBin } from "@/components/ui/Icon/icon-glyphs";

<IconSvg glyph={lineBin} size="sm" />   {/* = <Icon name="line-bin" size="sm" /> */}
```

Ícone que ainda não está em `icon-glyphs.ts`: **mova** o path do `icons.ts` pra lá e troque
a entrada do mapa pela referência (`"line-foo": lineFoo.d`). O path mora num lugar só; o
teste confere que mapa e constante batem e que os dois desenham o mesmo svg.

## Gotchas

- `size` arbitrário aplica `width`/`height` inline (não usa token) — prefira os presets.
- Decorativo por padrão (`aria-hidden`); passe `title`/`aria-label` quando o ícone
  carregar significado sozinho.
- Catálogo navegável (busca + copiar nome): doc `#/icon`.
