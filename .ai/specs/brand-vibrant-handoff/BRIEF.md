# BRIEF — implementar a brand `#0fff00` no iGreen Design System

Este arquivo é o ponto de entrada. Leia-o inteiro antes de abrir qualquer outro.

Você está adicionando **uma brand nova** a um design system multi-brand que já existe e já
funciona, e **nomeando a escala neutra** que hoje existe como valores soltos. Você **não** está
criando um design system nem redesenhando a camada semântica. O escopo é: trazer 22 primitivas
de cor e encaixá-las nos nomes que o DS já tem.

---

## Autoridade dos arquivos

| Arquivo | Autoridade | O que fazer |
|---|---|---|
| `BRIEF.md` | **normativo** | este arquivo; em conflito, ele vence |
| `tokens.json` → `color.brand.*` | **fonte de verdade** | implementar |
| `tokens.json` → `color.neutral.*` | **fonte de verdade** | implementar, mas ver §4.1 antes de mexer nos valores existentes |
| `tokens.json` → `typography`, `radius`, `spacing` | referência | comparar com o DS; provavelmente já existem |
| `tokens.json` → `semanticExample.*` | **contexto** | ler para entender intenção; **não** implementar |
| `tokens.json` → `notes.*` | normativo | são restrições, não curiosidades |
| `THEME.md` | contexto + procedência | ler; explica de onde cada número veio |
| `theme.css` | exemplo de formato | copiar **só** o bloco `@theme`; ver §5 |
| `tailwind.config.js` | exemplo de formato | só se o alvo for Tailwind v3 |
| `index.html` | **não é spec** | não implementar nada dele; é demo visual |

Se você só puder ler dois arquivos: este e `tokens.json`.

---

## 1. As primitivas

OKLCH é a fonte. O hex é o equivalente sRGB derivado — use apenas como fallback ou para
conferência, nunca como valor canônico.

### 1.1 Escala neutra — acromática, croma 0

Ancorada em `#242424` no shade 800. Croma exatamente 0 em todos os shades, por isso R=G=B e todo
hex é par repetido. Se algum valor seu sair com R≠G≠B, você errou em algum lugar.

```css
--color-neutral-50:  oklch(0.9850 0 0);  /* #fafafa */
--color-neutral-100: oklch(0.9670 0 0);  /* #f4f4f4 */
--color-neutral-200: oklch(0.9200 0 0);  /* #e4e4e4 */
--color-neutral-300: oklch(0.8710 0 0);  /* #d4d4d4 */
--color-neutral-400: oklch(0.7120 0 0);  /* #a2a2a2 */
--color-neutral-500: oklch(0.5520 0 0);  /* #727272 */
--color-neutral-600: oklch(0.4420 0 0);  /* #535353 */
--color-neutral-700: oklch(0.3510 0 0);  /* #3b3b3b */
--color-neutral-800: oklch(0.2603 0 0);  /* #242424 — âncora */
--color-neutral-900: oklch(0.2050 0 0);  /* #171717 */
--color-neutral-950: oklch(0.1600 0 0);  /* #0d0d0d */
```

Esta escala é compatível com os neutros que o DS já usa — os dois são acromáticos. `--background`
`oklch(20.5% 0 0)` é **idêntico** ao `neutral-900`, e `--border` `oklch(26.45% 0 0)` fica a 1
byte do `neutral-800`. Adotá-la não muda a temperatura da UI. Mas dois valores ficam entre
degraus — ver §4.1.

### 1.2 Escala brand

```css
--color-brand-50:  oklch(0.9761 0.0429 141.03);       /* #e8ffe4 */
--color-brand-100: oklch(0.9493 0.0945 141.72);       /* #cbffc4 */
--color-brand-200: oklch(0.9125 0.1746 142.08);       /* #9aff90 */
--color-brand-300: oklch(0.8818 0.2530 142.13);       /* #5cff50 */
--color-brand-400: oklch(0.866993 0.294055 142.3546); /* #0fff00 — âncora */
--color-brand-500: oklch(0.8018 0.2721 142.38);       /* #0ae600 */
--color-brand-600: oklch(0.6783 0.2304 142.42);       /* #04b800 */
--color-brand-700: oklch(0.5518 0.1876 142.46);       /* #018b00 */
--color-brand-800: oklch(0.4645 0.1539 142.59);       /* #076d07 */
--color-brand-900: oklch(0.4138 0.1317 142.94);       /* #0b5c0d */
--color-brand-950: oklch(0.2820 0.0929 143.47);       /* #003403 */
```

**Não re-arredonde.** A precisão de cada valor foi escolhida como a mínima que faz round-trip
exato. Cortar casas quebra a fidelidade: com 3 casas na croma os shades 400–800 erram até
3/255 por canal.

**Não converta para hex e volte.** Se o build precisa de hex, gere o fallback a partir do
OKLCH e mantenha o OKLCH como declaração primária.

---

## 2. Antes de escrever qualquer linha

1. Leia o arquivo de tokens de cor do repo. Descubra como as brands existentes são
   declaradas — nome do arquivo, nome dos tokens, se há um arquivo por brand, como o tema é
   trocado em runtime.
2. Espelhe esse padrão. Se as brands existentes usam `--color-<nome>-<shade>`, use o mesmo. Se
   há um registry/índice de brands, registre esta lá também.
3. O nome `brand` neste pacote é genérico de propósito. **Substitua pelo nome real da brand no
   DS.** Não introduza um token chamado `brand` se o DS nomeia brands por identificador.

Convenção observada no app em produção (379 custom properties, 128 em OKLCH) — o repo pode
organizar diferente, o repo manda:

- primitivas: `--color-<hue>-<shade>`
- semântica: `--color-bg-*`, `--color-fg-*`, `--color-border-*`, `--color-ring-*`,
  `--color-chart-*`, `--color-overlay-*`
- aliases shadcn por cima: `--primary`, `--primary-foreground`, `--background`, `--card`,
  `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--popover`
- alpha nativo em OKLCH: `oklch(100% 0 0 / .03)`
- neutros acromáticos: `oklch(20.5% 0 0)`, `oklch(26.45% 0 0)`

---

## 3. Invariantes — não negociáveis

### 3.1 `fg-on-brand` não pode ser branco

`brand-400` tem **1.37:1** contra branco. Reprova qualquer critério de contraste.

Se o `--color-fg-on-brand` desta brand resolver para branco ou near-white, está errado. Use
`brand-950` (10.27:1). Alternativa: descer `--color-bg-brand` para `brand-700`/`brand-800` e
aí sim usar texto claro.

### 3.2 O 400 está no teto do gamut sRGB

Medido: fixando `L 0.866993` e `H 142.3546`, croma `0.294` → `#0fff00`; `0.32`, `0.36` e `0.40`
→ todos `#00ff00`.

Portanto **não derive hover/active aumentando croma ou saturação** — o valor clipa e o estado
fica visualmente idêntico ao default. Derive descendo em luminosidade: `brand-500` para hover,
`brand-600` para active. É o que o próprio uicolors faz nas bordas dos cards.

### 3.3 A regra de pareamento

Lida dos componentes reais, consistente em todos: **superfície de marca usa borda um shade
acima do fundo e `brand-950` como texto.**

| Superfície | Borda | Texto | WCAG |
|---|---|---|---|
| `brand-200` | `brand-300` | `brand-950` | 11.44:1 |
| `brand-300` | `brand-400` | `brand-950` | 10.64:1 |
| `brand-400` | `brand-500` | `brand-950` | 10.27:1 |
| `brand-800` | — | `brand-100` | 5.83:1 |

### 3.4 Texto de marca sobre fundo claro

O primeiro shade com AA folgado contra branco é o **800** (6.56:1). O `700` dá 4.47:1 —
tecnicamente reprova AA (mínimo 4.5). Não use 700 como `--color-fg-brand` em tema claro.

---

## 4. Decisões que você NÃO deve tomar sozinho

Pare e pergunte ao humano nestes três pontos. Não escolha um default silenciosamente.

**4.1 Os dois valores neutros que ficam entre degraus.** Esta é a única mudança que toca as
brands existentes. Três dos cinco neutros em produção encaixam direto — `--background` é idêntico
ao `neutral-900`, `--border` fica a 1 byte do `neutral-800`, `--muted-foreground` fica perto do
`neutral-400`. Mas dois não:

| Token do DS | hex atual | Situação |
|---|---|---|
| `--card` | `#1c1c1c` | entre `neutral-900` (`#171717`) e `neutral-800` (`#242424`) |
| `--foreground` | `#f8f8f8` | um pouco abaixo de `neutral-50` (`#fafafa`) |

Duas saídas: **(a)** arredondar para o degrau mais próximo — mais limpo, mas muda 1–4 bytes na UI
de todas as brands; **(b)** manter os dois como valores semânticos fora da escala — zero risco,
mas a escala fica com duas exceções. Pergunte qual.

**Atenção ao offset de um degrau.** A composição de exemplo em `semanticExample.dark` mapeia
`bgCanvas → neutral-950` (`#0d0d0d`). O `--background` atual do DS equivale ao `neutral-900`
(`#171717`). Se você seguir o exemplo ao pé da letra, a UI fica um degrau mais escura do que hoje
— regressão silenciosa. O exemplo é ilustrativo; **o mapeamento do DS manda.** Na dúvida, mantenha
`bg-canvas → 900` e deixe o `950` disponível para superfícies mais profundas.

**4.2 Renomear ou coexistir com os neutros atuais?** Se o DS hoje declara os neutros como valores
literais na camada semântica (e não como uma escala primitiva nomeada), introduzir
`--color-neutral-*` cria uma fonte nova. Confirme se a intenção é migrar a semântica para
consumir a escala ou apenas registrar a escala e migrar depois.

**4.3 Esta brand substitui o primary atual ou coexiste?** O primary em produção é
`oklch(0.7289 0.1571 162.3)` / `#0fc589`. Delta para a brand nova: croma **+87%**, hue
**−20°**, L **+0.138**. É troca de energia, não de matiz — componentes calibrados para o teal
atual vão ficar visualmente mais agressivos. Se for substituição, isso precisa de aprovação
visual, não só técnica.

---

## 5. O que NÃO fazer

- **Não implemente a camada semântica deste pacote.** `semanticExample` no `tokens.json` e os
  blocos `[data-theme]` no `theme.css` existem só para documentar intenção de uso. O DS já tem
  a própria camada semântica servindo várias brands e segue dona dela. Se você criar
  `--bg-canvas`, `--fg-default` etc., criou tokens paralelos concorrentes.
- **Não copie CSS do `index.html`.** É markup de demonstração. Nada ali é spec.
- **Não pegue valores OKLCH do DevTools do uicolors.app.** Aqueles `oklch()` são as variáveis
  base do Tailwind v4 sob `--color-*`, não a paleta gerada. `--color-green-500:
  oklch(72.3% .219 149.579)` é o green de fábrica (hue 149.6); a paleta gerada vive em hue
  ~142.4 e é injetada em hex inline. Copiar do inspetor pega a cor errada.
- **Não use `oklch(0.870 0.294 142)` para o 400.** É o único valor que o uicolors mostra
  destravado e ele devolve `#1fff00`, não `#0fff00`. Arredondamento de display.
- **Não gere shades intermediários** (150, 250, 450...) sem pedir. A escala tem 11 posições por
  decisão da ferramenta e o hue tem só 2.5° de deriva na escala inteira.

---

## 6. Verificação antes de considerar pronto

**6.1 Round-trip das primitivas.** Cada valor OKLCH declarado deve resolver para o hex do
comentário. Rode no browser, com o CSS do DS carregado:

```js
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 1;
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const px = (css) => {
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = css;
  ctx.fillRect(0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return '#' + [d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, '0')).join('');
};

const expected = {
  brand: {
    50: '#e8ffe4', 100: '#cbffc4', 200: '#9aff90', 300: '#5cff50', 400: '#0fff00',
    500: '#0ae600', 600: '#04b800', 700: '#018b00', 800: '#076d07', 900: '#0b5c0d',
    950: '#003403',
  },
  neutral: {
    50: '#fafafa', 100: '#f4f4f4', 200: '#e4e4e4', 300: '#d4d4d4', 400: '#a2a2a2',
    500: '#727272', 600: '#535353', 700: '#3b3b3b', 800: '#242424', 900: '#171717',
    950: '#0d0d0d',
  },
};

const cs = getComputedStyle(document.documentElement);
const failures = [];

for (const [family, shades] of Object.entries(expected)) {
  for (const [shade, want] of Object.entries(shades)) {
    // ajuste o nome do token para o padrão do repo
    const declared = cs.getPropertyValue(`--color-${family}-${shade}`).trim();
    const got = px(declared);
    if (got !== want) failures.push({ family, shade, declared, got, want });
    // a neutra tem de ser acromática: R=G=B
    if (family === 'neutral') {
      const h = got.replace('#', '');
      if (h.slice(0, 2) !== h.slice(2, 4) || h.slice(2, 4) !== h.slice(4, 6)) {
        failures.push({ family, shade, got, problem: 'não acromático (R≠G≠B)' });
      }
    }
  }
}

console.log(failures.length === 0 ? 'OK — 22/22 exatos e neutra acromática' : failures);
```

**6.2 Contraste dos pares semânticos.** Para cada par `bg-brand` / `fg-on-brand` resolvido em
cada tema, o contraste WCAG deve ser ≥ 4.5. Com a regra §3.1 respeitada o pior caso é 10.27:1
— se der abaixo de 4.5, o `fg-on-brand` foi resolvido errado.

**6.3 Nenhum token paralelo.** Confirme que você não introduziu nomes semânticos novos.
Diff dos nomes de custom properties antes e depois: só devem aparecer as primitivas da brand
nova e, se aplicável, o registro dela no índice de brands.

**6.4 As outras brands não regrediram.** Renderize ao menos uma brand pré-existente e confirme
que nada mudou visualmente.

Exceção esperada: se o humano escolheu a saída **(a)** em §4.1, `--card` e `--foreground` mudam
1–4 bytes em todas as brands. Essa é a única diferença aceitável. Qualquer outra mudança em brand
pré-existente significa que o escopo foi ultrapassado — provavelmente você implementou a camada
semântica (§5).

---

## 7. Procedência

Extraído de `https://uicolors.app/generate/0fff00?ref=uiuxshowcase.com` via DevTools: painel
Export para os hex, conversão sRGB → linear → OKLab → OKLCH com round-trip verificado em canvas
para os OKLCH, varredura de croma com L e H fixos para o limite de gamut, leitura dos atributos
`style`/`fill`/`stroke`/`stop-color` de cada `.ui-card` para o mapeamento de uso.

Não recuperável (paywall): APCA Lc de todos os shades exceto o 400 (`87 / 17 / 20 / 87`) e a
Contrast matrix da ferramenta. As razões de contraste citadas aqui foram calculadas localmente
pela definição WCAG 2.1 (luminância relativa sRGB).

Detalhes completos em `THEME.md`.
