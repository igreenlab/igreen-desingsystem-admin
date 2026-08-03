# Brand `#0fff00` — handoff para o iGreen DS

Extraída de `https://uicolors.app/generate/0fff00?ref=uiuxshowcase.com` lendo o DOM, as CSS
custom properties computadas, as regras de origem dos stylesheets e o painel Export.

**OKLCH é a fonte de verdade.** Os 22 valores de cor foram verificados por round-trip: cada
string OKLCH pintada num canvas 1×1 no Chrome devolve o hex indicado byte a byte em cada
canal. O hex existe só como equivalente sRGB derivado, para conferência e fallback.

---

## As três camadas deste pacote

| Camada | Conteúdo | O DS deve |
|---|---|---|
| **1 · Primitivas** | 11 shades brand + 11 neutral em OKLCH, tipografia, radius, spacing | **consumir** |
| **2 · Semântica** | Composição estilo shadcn, 100% em `var()`, zero literais | ler como contexto |
| **3 · Componentes** | Reprodução da aba Cards com o mapeamento real de shades | ler como art direction |

A camada 2 existe para documentar a *intenção de uso* de cada primitiva. Ela é escrita sem
nenhum valor literal de propósito: se viesse com valores, competiria com a camada semântica
que o iGreen DS já tem (`--color-bg-*`, `--color-fg-*`, `--color-border-*`, `--color-ring-*`,
`--color-chart-*`) servindo várias brands, e o handoff viraria conflito de tokens.

---

## Camada 1 · Escala brand

Gerada de `#0fff00`, âncora no shade 400. O hue fica travado em ~142.4 na escala inteira —
141.03 a 143.47, 2.5° de deriva. A croma é que faz o trabalho: sobe de 0.043 no 50, atinge
0.294 no 400 e volta a cair.

| Token | OKLCH (fonte) | hex (derivado) | L | C | H |
|---|---|---|---|---|---|
| `--color-brand-50` | `oklch(0.9761 0.0429 141.03)` | `#e8ffe4` | 0.9761 | 0.0429 | 141.03 |
| `--color-brand-100` | `oklch(0.9493 0.0945 141.72)` | `#cbffc4` | 0.9493 | 0.0945 | 141.72 |
| `--color-brand-200` | `oklch(0.9125 0.1746 142.08)` | `#9aff90` | 0.9125 | 0.1746 | 142.08 |
| `--color-brand-300` | `oklch(0.8818 0.2530 142.13)` | `#5cff50` | 0.8818 | 0.2530 | 142.13 |
| **`--color-brand-400`** | **`oklch(0.866993 0.294055 142.3546)`** | **`#0fff00`** | 0.8670 | 0.2941 | 142.35 |
| `--color-brand-500` | `oklch(0.8018 0.2721 142.38)` | `#0ae600` | 0.8018 | 0.2721 | 142.38 |
| `--color-brand-600` | `oklch(0.6783 0.2304 142.42)` | `#04b800` | 0.6783 | 0.2304 | 142.42 |
| `--color-brand-700` | `oklch(0.5518 0.1876 142.46)` | `#018b00` | 0.5518 | 0.1876 | 142.46 |
| `--color-brand-800` | `oklch(0.4645 0.1539 142.59)` | `#076d07` | 0.4645 | 0.1539 | 142.59 |
| `--color-brand-900` | `oklch(0.4138 0.1317 142.94)` | `#0b5c0d` | 0.4138 | 0.1317 | 142.94 |
| `--color-brand-950` | `oklch(0.2820 0.0929 143.47)` | `#003403` | 0.2820 | 0.0929 | 143.47 |

## Camada 1 · Escala neutra — acromática

O uicolors **não define** neutra custom — a aba Neutral está vazia e o preview cai no Zinc, que
carrega viés azul-violeta em hue ~286. Esta escala substitui aquela: **croma exatamente 0** em
todos os 11 shades, ancorada em `#242424` = `oklch(0.2603 0 0)` no shade 800. Croma 0 implica
R=G=B, por isso todo hex sai como par repetido.

| Token | OKLCH (fonte) | hex (derivado) | L |
|---|---|---|---|
| `--color-neutral-50` | `oklch(0.9850 0 0)` | `#fafafa` | 0.9850 |
| `--color-neutral-100` | `oklch(0.9670 0 0)` | `#f4f4f4` | 0.9670 |
| `--color-neutral-200` | `oklch(0.9200 0 0)` | `#e4e4e4` | 0.9200 |
| `--color-neutral-300` | `oklch(0.8710 0 0)` | `#d4d4d4` | 0.8710 |
| `--color-neutral-400` | `oklch(0.7120 0 0)` | `#a2a2a2` | 0.7120 |
| `--color-neutral-500` | `oklch(0.5520 0 0)` | `#727272` | 0.5520 |
| `--color-neutral-600` | `oklch(0.4420 0 0)` | `#535353` | 0.4420 |
| `--color-neutral-700` | `oklch(0.3510 0 0)` | `#3b3b3b` | 0.3510 |
| **`--color-neutral-800`** | **`oklch(0.2603 0 0)`** | **`#242424`** | 0.2603 |
| `--color-neutral-900` | `oklch(0.2050 0 0)` | `#171717` | 0.2050 |
| `--color-neutral-950` | `oklch(0.1600 0 0)` | `#0d0d0d` | 0.1600 |

### Como a rampa foi construída

Desenhada, não convertida. Os shades 50–600 mantêm a luminosidade do Zinc (deriva ≤ 0.0004 em L)
para preservar as relações de contraste já validadas; só o rabo escuro (700–950) foi refeito para
passar exatamente pela âncora e suavizar o passo.

| Passo | ΔL | | Passo | ΔL |
|---|---|---|---|---|
| 50→100 | 0.0180 | | 500→600 | 0.1100 |
| 100→200 | 0.0470 | | 600→700 | **0.0910** |
| 200→300 | 0.0490 | | 700→800 | **0.0907** |
| 300→400 | 0.1590 | | 800→900 | 0.0553 |
| 400→500 | 0.1600 | | 900→950 | 0.0450 |

No Zinc, `600→700` e `700→800` eram 0.0716 e 0.0964 — irregulares. Agora são praticamente
idênticos.

### Encaixe nos neutros que o DS já usa

Os valores acromáticos em produção no iGreen DS caem quase em cima desta escala:

| Token do DS | OKLCH | hex | Nesta escala |
|---|---|---|---|
| `--background` | `oklch(20.5% 0 0)` | `#171717` | **idêntico** a `neutral-900` |
| `--border` | `oklch(26.45% 0 0)` | `#252525` | 1 byte de `neutral-800` |
| `--card` | `oklch(22.5% 0 0)` | `#1c1c1c` | entre 900 e 800 |
| `--muted-foreground` | `oklch(70.25% 0 0)` | `#9f9f9f` | ≈ `neutral-400` |
| `--foreground` | `oklch(98% 0 0)` | `#f8f8f8` | ≈ `neutral-50` |

Adotar esta escala **não muda a temperatura da UI** — ela já era acromática. O ganho é ter os 11
degraus nomeados em vez de valores soltos.

Contraste dos pares semânticos, todos com folga:

| Par | WCAG |
|---|---|
| dark · `100` sobre `950` | 17.67:1 |
| dark · `100` sobre `800` | 14.11:1 |
| dark · `300` sobre `900` | 12.09:1 |
| dark · `400` sobre `900` | 7.02:1 |
| light · `950` sobre branco | 19.44:1 |
| light · `700` sobre branco | 11.20:1 |
| light · `600` sobre branco | 7.69:1 |

---

## Cinco decisões que precisam de humano antes do import

### 1. O shade 400 está na borda do gamut sRGB

Medido, não estimado. Fixando `L 0.866993` e `H 142.3546` e varrendo a croma:

| Croma | Renderiza |
|---|---|
| 0.294 | `#0fff00` |
| 0.32 | `#00ff00` |
| 0.36 | `#00ff00` |
| 0.40 | `#00ff00` |

Consequência: **não há espaço para derivar hover/active mais saturados a partir do 400.** Só
dá para andar em luminosidade, o que aponta para 500 e 600 — exatamente o que o uicolors faz
nas bordas dos cards. E uma escala secundária harmônica nesse hue já nasce comprimida.

### 2. `fg-on-brand` não pode ser branco

`brand-400` tem **1.37:1** contra branco. Nos componentes do uicolors ele é sempre superfície,
com `brand-950` por cima (10.27:1). Se o `--color-fg-on-brand` do DS hoje é branco ou
near-white, ele precisa virar `brand-950` — ou o `--color-bg-brand` precisa descer para 700/800.

### 3. A regra de pareamento é consistente e vale virar norma

Lida dos `style` inline de cada `.ui-card`: **todo card de marca usa borda um shade acima do
fundo e `brand-950` como texto**, qualquer que seja o fundo.

| Superfície | Borda | Texto | WCAG |
|---|---|---|---|
| `brand-200` | `brand-300` | `brand-950` | 11.44:1 |
| `brand-300` | `brand-400` | `brand-950` | 10.64:1 |
| `brand-400` | `brand-500` | `brand-950` | 10.27:1 |
| `brand-800` | — | `brand-100` | 5.83:1 |

Pior caso 10.27:1 — folga de AAA.

### 4. A neutra vira nomeada, mas os valores do DS mudam de encaixe

Esta é a única mudança que toca as brands existentes, então precisa de decisão. A escala é
acromática como a do DS, e três dos cinco valores em produção caem praticamente em cima dela
(`--background` idêntico ao 900, `--border` a 1 byte do 800). Mas dois ficam entre degraus:
`--card` `#1c1c1c` fica entre 900 e 800, e `--foreground` `#f8f8f8` fica um pouco abaixo do 50.

Duas saídas: arredondar esses dois para o degrau mais próximo (muda 1–4 bytes na UI de todas as
brands) ou manter os dois como valores semânticos fora da escala. A primeira é mais limpa, a
segunda é zero-risco. **Não decida sozinho.**

### 5. É uma troca de energia, não de matiz

| | OKLCH | hex | Croma | Hue | L |
|---|---|---|---|---|---|
| iGreen DS hoje | `oklch(0.7289 0.1571 162.3)` | `#0fc589` | 0.157 | 162.3 | 0.729 |
| Brand nova (400) | `oklch(0.866993 0.294055 142.3546)` | `#0fff00` | 0.294 | 142.35 | 0.867 |
| Delta | | | **+87%** | **−20°** | **+0.138** |

O primary atual é um verde-teal com folga confortável até a borda do gamut. A brand nova é
verde-puro encostado no limite.

---

## Camada 2 · Composição semântica (contexto)

Aliases puros. A coluna da direita é proposta de encaixe nos nomes que o DS já tem — a decisão
é do DS.

| Papel | dark | light | Token no iGreen DS |
|---|---|---|---|
| canvas | `neutral-950` | `white` | `--color-bg-canvas` |
| surface | `neutral-900` | `white` | `--color-bg-surface` |
| surface elevated | `neutral-800` | `neutral-50` | `--color-bg-surface-elevated` |
| muted | `neutral-800` | `neutral-100` | `--color-bg-muted` |
| fg default | `neutral-100` | `neutral-950` | `--color-fg-default` |
| fg muted | `neutral-300` | `neutral-700` | `--color-fg-muted` |
| fg subtle | `neutral-400` | `neutral-600` | `--color-fg-subtle` |
| border default | `neutral-700` | `neutral-300` | `--color-border-default` |
| border subtle | `neutral-800` | `neutral-200` | `--color-border-subtle` |
| bg brand | `brand-400` | `brand-400` | `--color-bg-brand` |
| bg brand hover | `brand-500` | `brand-500` | `--color-bg-brand-hover` |
| bg brand subtle | `brand-950` | `brand-100` | `--color-bg-brand-subtle` |
| fg on brand | `brand-950` | `brand-950` | `--color-fg-on-brand` |
| fg brand | `brand-400` | `brand-800` | `--color-fg-brand` |
| border brand | `brand-500` | `brand-500` | `--color-border-brand` |
| ring brand | `brand-400` | `brand-500` | `--color-ring-brand` |
| chart 1 · 2 · 3 | `brand-400` / `300` / `200` | idem | `--color-chart-1..3` |
| chart 4 · 5 | `brand-600` / `800` | idem | `--color-chart-4..5` |

---

## Tipografia

- Base e Heading: **Inter** — seleção custom de fontes é Pro no uicolors, então a paleta ficou
  no default.
- Sizes / line-heights: `xs .75/1.333` · `sm .875/1.429` · `base 1/1.5` · `lg 1.125/1.556` ·
  `xl 1.25/1.4` · `2xl 1.5/1.333` · `3xl 1.875/1.2` · `4xl 2.25/1.111` · `5xl 3/1` · `6xl 3.75/1` ·
  `8xl 6/1` (rem)
- Weights: 300 / 400 / 500 / 600 / 700 / 800
- Tracking: `tighter -.05em` · `tight -.025em` · `normal 0` · `wide .025em` · `widest .1em`
- Radius: `xs .125rem` · **default `.5rem`** · `xl .75rem` · `2xl 1rem` · `3xl 1.5rem` · `4xl 2rem`
- Spacing base: `.25rem`
- Transição default: `.15s cubic-bezier(.4,0,.2,1)`

---

## A pegadinha do OKLCH no DevTools

Inspecionando o uicolors aparecem valores `oklch(...)`. Eles **não** são da paleta gerada.

Varredura de `document.styleSheets` procurando `oklch` e `color-mix` nas regras dos
componentes: **zero ocorrências**. Zero também em qualquer `style` inline, `fill`, `stroke` ou
`stop-color`. A paleta gerada é injetada como hex/rgb inline.

O que existe é a página carregar as variáveis base do Tailwind v4, que são em OKLCH, sob o
prefixo `--color-*`, em paralelo com o namespace hex da paleta gerada:

```
--color-green-500: oklch(72.3% .219 149.579)   /* green DEFAULT do Tailwind */
--green-500:       #0ae600                     /* o green GERADO, hex inline */
```

Hue 149.6 é o esmeralda de fábrica. A paleta de `#0fff00` vive em hue ~142.4. **Quem copia o
oklch do inspetor pega a cor errada.**

---

## Procedência

| Dado | Fonte |
|---|---|
| Hex dos 11 shades brand | Painel Export do uicolors, output Tailwind 4 |
| OKLCH brand e neutral | Conversão sRGB → linear → OKLab → OKLCH, round-trip verificado em canvas 1×1 |
| Limite de gamut | Varredura de croma com L e H fixos, medindo o clip |
| Mapeamento por componente | `style` / `fill` / `stroke` / `stop-color` de cada `.ui-card` |
| Tokens semânticos do preview | `getComputedStyle(document.documentElement)` nas duas variantes |
| Convenção do iGreen DS | App em produção: 379 custom properties, 128 em OKLCH |
| Matriz WCAG | Calculada localmente (a do uicolors é Pro) |

**Não recuperável:** APCA Lc de todos os shades exceto o 400 (`87 / 17 / 20 / 87`) e a Contrast
matrix do uicolors — ambos no paywall.

Nota sobre precisão: o único OKLCH que o uicolors mostra destravado é o do 400,
`oklch(0.870 0.294 142)`. Esse valor devolve `#1fff00`, não `#0fff00` — é arredondamento de
display, não um valor utilizável.

---

## Arquivos

| Arquivo | Uso |
|---|---|
| [BRIEF.md](BRIEF.md) | **Ponto de entrada para agente.** Normativo: autoridade dos arquivos, invariantes, o que não fazer, verificação |
| [index.html](index.html) | Página de referência: 3 camadas, matriz de contraste, comparação com o primary atual do DS |
| [theme.css](theme.css) | Tailwind v4 — `@theme` com primitivas OKLCH + camada semântica de exemplo + 5 notas |
| [tailwind.config.js](tailwind.config.js) | Tailwind v3 — primitivas com `<alpha-value>` para os modificadores de opacidade |
| [tokens.json](tokens.json) | W3C Design Tokens — primitivas em OKLCH, semântica como aliases, hex em `$extensions` |

### O que passar para o Design System

Se a brand nova mantém esta paleta: **`tokens.json` + este arquivo**. O primeiro é a fonte
legível por máquina; o segundo são as regras e as cinco decisões acima. Adicione `theme.css`
se o alvo for Tailwind v4, ou `tailwind.config.js` se for v3.

Não passe `index.html` como spec — ele não é fonte de nada, é a mesma Camada 1 mais markup de
demonstração. Vale só como referência visual, e nesse caso diga explicitamente que é art
direction, não tokens.

### Tailwind v4

```bash
printf '@import "tailwindcss";\n@import "./theme.css";\n' > app.css
```
