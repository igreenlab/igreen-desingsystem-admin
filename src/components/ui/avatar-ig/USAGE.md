# Avatar

<!-- ds:regras
- vários avatares juntos → `<AvatarGroup>`, nunca `-ml-*` + `ring` na mão: ele resolve sobreposição por tamanho, cor do anel e excedente
- `<AvatarGroup surface="...">` = a superfície ATRÁS do grupo (`table` numa linha de tabela). Errar isso põe um halo claro em volta de cada avatar
- `max` + `total`: o `+N` conta pelo `total` (o do servidor), senão uma lista paginada mostra `+0` tendo 40 pessoas
- `colorHex` escolhe a cor do texto por contraste WCAG (L-027) — nunca `text-white` na unha
- foto de pessoa → `<Avatar src="…">` com as iniciais em `children` (são o fallback da URL que falha), nunca `<img>` solto nem o compound do shadcn dentro do grupo
-->

Circular badge displaying user initials. Supports semantic colors and per-person hex overrides.
Para **vários avatares juntos**, use `AvatarGroup` (seção no fim).

## Basic usage

```tsx
import { Avatar } from "@/components/ui/avatar-ig";

// Semantic color (default: muted)
<Avatar size="md" color="brand">MS</Avatar>

// Person-specific hex color
<Avatar size="sm" colorHex="#8754ec">CO</Avatar>

// Foto — as iniciais continuam sendo o FALLBACK
<Avatar size="lg" src="/fotos/maria.jpg" aria-label="Maria Silva">MS</Avatar>
```

## Foto (`src`, v0.53.0+)

A imagem cobre o círculo (`object-cover`, sem distorcer) e escala pelos mesmos `size` das
iniciais — inclusive dentro do `AvatarGroup`, que propaga o tamanho por contexto.

- **Mantenha as iniciais em `children`.** Elas são o fallback quando a URL falha; sem elas,
  uma foto quebrada deixa um buraco na fila. O fallback herda a cor (`color`/`colorHex`).
- **Trocar a `src` depois de uma falha tenta de novo** — o componente guarda *qual* URL
  falhou, não um booleano.
- **Não há prop `alt`.** A imagem interna é `alt=""` e o nome mora no `aria-label` do avatar;
  dois rótulos no mesmo elemento fazem o leitor de tela anunciar a pessoa duas vezes.
- **Quando usar o compound do shadcn** (`avatar`, com `AvatarImage`/`AvatarFallback`): quando
  o fallback não é iniciais (ícone, skeleton) ou você precisa do estado de carregamento. Pra
  foto de pessoa no DS — e sempre dentro de `AvatarGroup` — o certo é este.

## Sizes

| Size | Pixels | Typography preset |
|------|--------|-------------------|
| `xs` | 20px   | caption-sm (11px) |
| `sm` | 24px   | caption-sm (11px) |
| `md` | 28px   | caption-sm (11px) |
| `lg` | 32px   | body-sm font-normal (13px) |
| `xl` | 40px   | body-md font-medium (14px) |

## Colors

| Color      | Background         | Foreground          |
|------------|--------------------|--------------------|
| `brand`    | `bg-bg-brand`      | `fg-on-brand`      |
| `success`  | `bg-bg-success`    | `fg-on-success`    |
| `warning`  | `bg-bg-warning`    | `fg-on-warning`    |
| `critical` | `bg-bg-danger`     | `fg-on-danger`     |
| `info`     | `bg-bg-info`       | `fg-on-info`       |
| `muted`    | `bg-bg-muted`      | `fg-muted`         |

## colorHex override + auto contrast (v0.7.1+)

When `colorHex` is provided (string starting with `#`), the background is set
via inline style and **a cor de texto é escolhida automaticamente** pra ter
o maior contraste WCAG entre `white` ou `black`. O prop `color` é ignorado.

| Hex bg               | Texto auto-pickado | Motivo (WCAG ratio)                    |
|----------------------|--------------------|----------------------------------------|
| `#FAE128` (BB)       | `black`            | white 1.29 vs black 16.3 → preto vence |
| `#820AD1` (Nubank)   | `white`            | white 6.2 vs black 3.4 → branco vence  |
| `#EC7000` (Itaú)     | `black`            | white 2.7 vs black 7.8 → preto vence   |
| `#CC092F` (Bradesco) | `white`            | white 6.5 vs black 3.2 → branco vence  |
| `#FFFFFF`            | `black`            | óbvio                                   |
| `#000000`            | `white`            | óbvio                                   |

A escolha vem de `getContrastTextColor()` em `@/utils/color-contrast.ts`
(WCAG 2.x relative luminance + contrast ratio).

```tsx
<Avatar colorHex="#FAE128">BB</Avatar>      // texto preto auto
<Avatar colorHex="#820AD1">NU</Avatar>      // texto branco auto
```

**Override manual:** se precisar forçar uma cor específica (caso raro de
brand guideline), passe via `className`:

```tsx
<Avatar colorHex="#FAE128" className="text-white">BB</Avatar>
// (não recomendado — quebra WCAG AA)
```

## Accessibility

- With `aria-label`: renders `role="img"` (semantic avatar).
- Without `aria-label`: renders `aria-hidden="true"` (decorative).

```tsx
// Semantic — standalone avatar with meaning
<Avatar aria-label="Maria Silva">MS</Avatar>

// Decorative — inside a card/cell that already provides context
<Avatar colorHex="#8754ec">CO</Avatar>
```

## Props

| Prop         | Type                                                        | Default   |
|--------------|-------------------------------------------------------------|-----------|
| `size`       | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                     | `"md"`    |
| `color`      | `"brand" \| "success" \| "warning" \| "critical" \| "info" \| "muted"` | `"muted"` |
| `colorHex`   | `string` (hex starting with `#`)                            | —         |
| `src`        | `string` — foto; URL que falha volta pras iniciais           | —         |
| `children`   | `ReactNode` (initials) — também o fallback da foto           | —         |
| `className`  | `string`                                                    | —         |
| `aria-label` | `string`                                                    | —         |

---

# AvatarGroup

Pilha de avatares sobrepostos, com `size` propagado e excedente resumido em `+N`.

## Quando usar

Conjunto de pessoas onde **o grupo importa mais que cada uma**: responsáveis de uma tarefa,
participantes, membros de um time. Para 2 avatares que devem ser lidos individualmente, use
`flex gap-gp-sm` comum — a sobreposição comunica "muitos".

## Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `size` | `xs \| sm \| md \| lg \| xl` | `md` | **propagado por contexto** a todos os filhos |
| `max` | `number` | — | acima disso, corta e mostra `+N` |
| `total` | `number` | nº de filhos | contagem REAL, pro `+N` refletir o servidor |
| `surface` | `surface \| canvas \| subtle \| muted \| table` | `surface` | superfície **atrás** do grupo — define a cor do anel |
| `aria-label` | `string` | — | rótulo do grupo, ex.: `"12 responsáveis"` |

## Exemplo

```tsx
import { Avatar, AvatarGroup } from "@/components/ui/avatar-ig";

{/* foto e iniciais misturadas: o size vem do container, ninguém sai de escala */}
<AvatarGroup size="sm" max={3} total={12} aria-label="12 responsáveis">
  <Avatar src="/fotos/ana.jpg" aria-label="Ana">AN</Avatar>
  <Avatar src="/fotos/bruno.jpg" aria-label="Bruno">BR</Avatar>
  <Avatar colorHex="#7C3AED" aria-label="Júlia">JS</Avatar>
  <Avatar colorHex="#0891B2" aria-label="Tiago">TK</Avatar>
</AvatarGroup>
```

## Gotchas / cuidados

- **`surface` é a cor do que está ATRÁS, e é o erro clássico.** O anel separa um avatar do
  outro pintando a cor da superfície de trás; com o token errado ele deixa de separar e vira um
  halo. Sobre `bg-bg-muted` ou `bg-bg-canvas`, declare o token correspondente.
  ⚠️ **`table` e `surface` resolvem pro mesmo valor hoje** — `oklch(1 0 0)` no claro e
  `oklch(0.225 0 0)` no escuro (medido). Dentro de tabela a escolha é **semântica**, não
  visual: declare `table` mesmo assim, pra que a pilha continue certa se um dia os dois
  divergirem, sem ninguém ter que caçar o call site.
- **`total` não é opcional quando a lista é paginada.** Sem ele o `+N` conta só o que foi
  renderizado — 4 filhos com `max={2}` mostram `+2`, mesmo que existam 40 pessoas.
- **`size` no filho vence o do grupo.** É escape hatch pra destacar um avatar; sem passar nada,
  todos herdam o do grupo.
- **A sobreposição escala com o tamanho** (~25% do diâmetro): `xs` desloca 4px e `xl` desloca
  10px. Não é constante de propósito — 6px num avatar de 20px é 30% de sobreposição e num de
  40px é 15%, que são arranjos visuais diferentes.
- **O primeiro fica por cima** (z-index decrescente), invertendo o empilhamento natural do DOM.
  A leitura é da esquerda pra direita e o primeiro é o principal.
- **O grupo fala, os avatares calam.** O container é `role="group"` com `aria-label`; o `+N` é
  `aria-hidden` porque a contagem real já está no rótulo. Sem o `aria-label`, o leitor de tela
  lê N nomes soltos sem dizer que são um conjunto.
- **Foto e iniciais convivem na mesma pilha.** A foto obedece ao mesmo `size` de contexto, e o
  anel importa mais com foto: sem ele, duas fotos escuras encostadas viram uma mancha só.
- **O anel mora no wrapper, não no `Avatar`.** `ring` acompanha o `border-radius` do elemento —
  num wrapper quadrado traçaria um quadrado. `Avatar` fora de grupo continua sem anel.
