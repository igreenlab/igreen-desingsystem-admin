# Fase 2 — Derivação de cor

Instrumento desta fase: `node scripts/brand-contrast.mjs <cor> <cor> [normal|large|ui|raw]`.
Aceita OKLCH e hex, e avisa quando a cor está fora do gamut sRGB.

⚠️ Este script mede os valores que você **escolheu** nos `.ts`. Não diz o que a tela
mostra — isso é a Fase 5. Na `vibrant` a medição aqui passou 10/10 enquanto a tela
estava quebrada (L-066).

## 2.1 — A rampa da marca (11 shades)

`50 · 100 · 200 · 300 · 400 · 500 · 600 · 700 · 800 · 900 · 950`
(a `default` tem um `150` extra; **não** é obrigatório — a `vibrant` não tem)

Se o usuário deu **hex único**, derive mantendo o hue e variando L/C. Se deu rampa
pronta, use verbatim — e **meça**, porque geradores online não olham contraste.

**O teto de gamut é real e vale descobrir cedo.** Cor fluorescente já está na borda
do sRGB: pedir mais chroma não muda nada na tela, o browser clampa. O script avisa.
Consequência prática na `vibrant`: não havia espaço pra um `brandContrast` mais
escuro-e-mais-saturado, então ele virou **alias de `brand`** — melhor um alias
honesto que um valor que finge ser diferente.

Anote no comentário de cada shade com papel semântico o **hex** e o **ratio** medido.
Não é decoração: é o registro independente que o teste do script confere, e é o que
te diz depois por que aquele shade foi escolhido.

## 2.2 — `border.brand`: meça o papel DOMINANTE, não o papel que você imaginou

Erro que cometi: coloquei `border.brand = brand[500]` porque "é a cor da marca".
Medido: **1.70:1** contra fundo branco e **1.24:1** contra o preenchimento neon —
falha nos **dois** papéis. Movido pra `brand[700]`: 4.47:1 e 3.26:1.

O método que resolveu foi contar os usos reais:

```bash
grep -rho 'border-border-brand[a-z-]*\|ring-ring-brand[a-z-]*' src/components/ | sort | uniq -c | sort -rn
```

Medido hoje: **88 usos em 43 arquivos** — 50 `border-border-brand`, 33
`ring-ring-brand`, 5 `-subtle`. Todos são **fronteira**: sublinhado de aba, anel de
foco, chip outline, borda de card selecionado. Nenhum é "borda de botão preenchido".

Isso decide o limiar: **SC 1.4.11, 3:1** (`modo ui`), não 4.5:1. E decide contra
**qual fundo** medir — canvas claro, não o preenchimento da marca.

## 2.3 — `fg.on-brand`: escolha por medição, e saiba o que NÃO é problema de cor

```bash
node scripts/brand-contrast.mjs "#ffffff" "<bg.brand>"
node scripts/brand-contrast.mjs "#000000" "<bg.brand>"
```

Na `vibrant`, branco reprova feio (1.37:1) e preto dá **15.32:1** → `fg.on-brand = black`.

**Pegadinha perceptual que vai ser reportada como bug de peso.** Texto escuro sobre
fundo claro e muito saturado **parece mais fino** do que o mesmo texto sobre fundo
escuro — é irradiação/halation, propriedade do olho, não do CSS. O mantenedor
reportou exatamente isso ("o texto ficou fraco... mudou o peso nessa brand?").

Resposta correta: **não**, e não dá pra consertar aqui. Um overlay de marca é
**só cor** — `--font-weight-*` não está no diff, e não deveria: peso por marca faria
a mesma classe DS renderizar diferente entre temas, que é o oposto do que um DS faz.
Confirme medindo (o peso computado é idêntico nos dois temas) e explique o efeito.
Se a legibilidade realmente não servir, o caminho é **escurecer o `bg.brand`**, não
engrossar a fonte.

## 2.4 — Neutros: duas rampas, não uma

Se a marca tinge neutros, quase sempre você precisa de **`gray` (light)** e
**`grayDark` (dark)** separadas. A `vibrant` faz isso.

**Light** — um tico de chroma no hue da marca dá coesão. Mas **distribua por área de
tela**: quanto maior a superfície, menor o chroma. `bg.canvas` cobre a tela inteira,
então chroma alto ali vira "o app está esverdeado". Bordas e texto aguentam mais.

**Dark** — se o pedido é "cinza de verdade", **chroma exatamente 0**. Meio-chroma no
dark lê como sujeira, não como cor. Ancore num shade concreto que o usuário aprovou
(`#242424` → `oklch(0.2603 0 0)` na `vibrant`) e derive o resto pra cima e pra baixo.

Hierarquia obrigatória no dark (**L-008**), e ela é de aparência, não de número de
shade: `canvas < surface < subtle < muted`. Na `vibrant`, `canvas = gray[900]`
(#171717) e `surface = gray[800]` (#242424) — a âncora é a **superfície**, e o canvas
é mais escuro que ela.

### A hierarquia de texto some sem você notar

Três vezes na `vibrant` eu comprimi a distância entre `fg.default` e `fg.muted`, e o
mantenedor pegou: *"título e subtítulo estão quase na mesma cor"*. Cada nível passava
AA contra o fundo — o que quebrou foi a distância **entre eles**.

```bash
node scripts/brand-contrast.mjs "<fg.default>" "<fg.muted>" raw
```

Referência é a marca `default`: **~2.50:1** no dark. Ficar muito abaixo disso achata
tabela, card e formulário de uma vez. (`raw` não dá veredito porque a WCAG não define
limiar pra texto-vs-texto — inventar um seria afirmar garantia inexistente.)

## 2.5 — Bordas no dark: força, não só L%

**L-009** pede `L% ≥ surface + 6%`, e é o piso. O que o mantenedor de fato avalia é
"forte demais / fraca demais", e isso pediu 3 rodadas de ajuste fino na `vibrant`.

Duas coisas que aprendi ali:

1. **Borda de input ≠ borda de divisor.** Input quer ser visível (é affordance);
   divisor quer desaparecer. Na `vibrant` ficaram `input 0.3750` vs `default 0.3400`
   vs `subtle 0.3090` — em L achromático, os três calibrados separadamente.
2. **Ao trocar `gray` por `grayDark`, os literais achromáticos preservam a força
   calibrada.** Se você re-referenciar shades da rampa nova, a força muda junto e
   você perde a calibragem que o usuário aprovou. Escreva o literal e comente de que
   força ele veio.

## 2.6 — Status colors

Se harmonizadas: **mesmo movimento de energia, identidade preservada**. Empurrar
chroma pra perto do pico do hue mantém "amarelo é amarelo" e ainda casa com uma marca
vibrante. Na `vibrant`: `danger` +13% de chroma vs default, `warning`/`info` no pico
do próprio hue.

`success = brand` quando a marca já é verde. **Alias, não rampa duplicada.**

⚠️ **Baixar L pra maximizar chroma quebra AA no dark.** Foi o que aconteceu:
`fg.danger` caiu pra 3.42:1 e `fg.info` pra 2.88:1 em badge no dark. Conserto: no
dark use um shade **mais claro** (`danger[400]`, `info[300]`) — o dark precisa de
shade claro pra texto, mesmo quando a rampa foi ajustada pensando no light.

## 2.7 — Tints com `color-mix`

Seleção de linha, hover de tabela, estados sutis. Marca saturada precisa de
percentual **menor** que a default — na `vibrant`, 14%→10% e 22%→16%.

⛔ **Nunca faça isso com replace em massa.** Um `14% → 10%` global meu deixou
`table-row-selected-hover` **idêntico** ao estado repousado: o hover sumiu, e nada
acusou. Se os dois valores da escada colidem, a escada deixou de existir. Ajuste um
por um, e confira que a ordem se mantém.

## Saída da fase → GATE

Leve pro gate:

- a rampa (11 shades, com hex + ratio nos que têm papel)
- as duas rampas de neutro, se houver
- **a tabela de medições** dos pares que importam: `fg.on-brand`, `border.brand` nos
  dois papéis, `fg.default`↔`fg.muted`, status em badge dark
- o que a marca **não** muda (fica igual à default)
- **Assumption central** — ex.: *"a marca é usada principalmente como fronteira sobre
  canvas claro, não como preenchimento grande"*. É isso que o reviewer vai conferir
  depois, e o que te diz qual premissa quebrou quando aparecer problema.

⛔ **PARE e aguarde "sim".** Regra 4 do CLAUDE.md: marca nova é token novo.
