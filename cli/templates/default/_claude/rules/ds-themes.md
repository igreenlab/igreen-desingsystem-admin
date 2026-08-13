---
description: Temas de marca do iGreen DS — como trocar ou adicionar um tema neste projeto (npm, submódulo ou copy-in)
globs: ["**/*.css", "**/index.html", "**/*.tsx"]
alwaysApply: true
---

# Temas de marca (iGreen DS)

O DS tem 5 marcas. Cada marca não-default é um **overlay de cor** escopado em
`[data-theme="<id>"]` que sobrescreve **só o que difere** do tema-base — 87 vars em `blue` e
`green`, 125 em `vibrant`, 166 em `pay`, contra ~350 do base.

| id | marca | arquivo |
|---|---|---|
| `default` | iGreen (verde padrão) | — **é** o tema-base, não tem overlay |
| `blue` | Azul | `brand-blue.css` |
| `green` | Verde (grass) | `brand-green.css` |
| `pay` | iGreen Pay | `brand-pay.css` |
| `vibrant` | iGreen Vibrant (verde fluorescente) | `brand-vibrant.css` |

## ⛔ Antes de mexer: 2 fatos que causam 90% dos erros

1. **Importar o CSS não ativa nada.** O overlay é escopado — sem
   `data-theme="<id>"` no `<html>`, nenhuma regra casa e nada muda. Não existe erro:
   falha em silêncio.
2. **Ordem de import importa.** O overlay tem que vir **depois** do `tailwind-theme.css`.
   Antes, o tema-base ganha por ordem de fonte.

Marca e claro/escuro são **eixos independentes**: `data-theme` no `<html>` + classe
`.dark`. Combinam livremente.

```html
<html data-theme="vibrant" class="dark">   <!-- vibrant, escuro -->
<html data-theme="vibrant">                <!-- vibrant, claro  -->
<html>                                     <!-- default (sem atributo) -->
```

## Trocar o tema — identifique o modo PRIMEIRO

Existe `.claude/ds-config.json` com `"mode": "submodule"`?

### Modo SUBMÓDULO

O **CSS** já está no disco. Importe (ajuste o caminho pro `dsPath` do `ds-config.json`):

```css
@import "tailwindcss";
@import "../design-system/src/styles/theme/tailwind-theme.css";
@import "../design-system/src/styles/theme/brand-vibrant.css";
```

Não rode `igreen:add` — em modo submódulo ele não se aplica. Tema novo chega com
`git pull` no submódulo. **Não** precisa de `@source`: o submódulo fica dentro da raiz do
projeto e o Tailwind v4 já escaneia daí.

⚠️ **Duas coisas NÃO vêm com o submódulo**, e a segunda falha em silêncio:

1. **As dependências.** O submódulo entrega código-fonte, não pacote — `npm i` das libs que os
   componentes importam. O mínimo pra `Button` + `Modal`:
   `tailwind-variants tailwind-merge clsx lucide-react @radix-ui/react-dialog @radix-ui/react-slot`.
   O build quebra alto (`failed to resolve …`), então é fácil de achar.
2. **Os arquivos da fonte Geist.** O `@font-face` viaja no tema, mas aponta pra `/fonts/*.woff2`
   — raiz do **site**, não do submódulo. Copie:
   `mkdir -p public/fonts && cp design-system/public/fonts/*.woff2 public/fonts/`.
   Sem isso **não há erro**: o `font-family` segue dizendo `Geist`, o navegador recebe o
   `index.html` no lugar do arquivo, e os 27 presets caem em system-ui. Confira com
   `document.fonts.check("16px Geist")` — tem que ser `true`.

### Modo COPY-IN (scaffold do CLI)

Cada tema é item do registry. Traga com o mesmo comando dos componentes:

```bash
npm run igreen:add -- theme-vibrant     # copia src/styles/theme/brand-vibrant.css
```

Depois importe:

```css
@import "./styles/theme/tailwind-theme.css";
@import "./styles/theme/brand-vibrant.css";
```

⚠️ O scaffold **apaga** os overlays não escolhidos no prompt "Tema de cor?". Se o arquivo
não está em `src/styles/theme/`, é porque outro tema foi escolhido na criação — traga com
o `igreen:add` acima.

### Consumindo o DS por `npm install`

⚠️ **A diretiva `@source` é OBRIGATÓRIA e é o erro nº 1 deste canal.** O Tailwind v4 **não
escaneia `node_modules`** — sem ela **nenhuma** classe do DS é gerada e os componentes
renderizam **sem estilo nenhum**, sem erro no console e sem build quebrado. Fácil concluir
que "o pacote está quebrado".

```css
@import "tailwindcss";

/* Sem esta linha, zero classes do DS. Tem que cobrir `dist-lib/**`, não só o
   index.mjs — as classes dos componentes flutuantes vivem nos *chunks*. */
@source "../node_modules/@snksergio/design-system/dist-lib/**/*.mjs";

@import "@snksergio/design-system/theme.css";                 /* obrigatório */
@import "@snksergio/design-system/theme/brand-vibrant.css";    /* a marca */
```

Ajuste o caminho do `@source` à profundidade do seu CSS de entrada (de `src/index.css`, a
raiz do projeto é `../`).

**Copie as fontes Geist** — o `@font-face` viaja no tema, mas aponta pra `/fonts/*.woff2`,
raiz do **site**:

```bash
mkdir -p public/fonts
cp node_modules/@snksergio/design-system/dist-lib/fonts/*.woff2 public/fonts/
```

⚠️ Sem isso **não há erro**: o `font-family` segue dizendo `Geist`, o navegador recebe o
`index.html` no lugar do arquivo e os 27 presets caem em system-ui. Confira com
`document.fonts.check("16px Geist")` — tem que ser `true`.

Requer `@snksergio/design-system` **≥ 0.31.1** (antes disso o pacote levava só o tema-base);
as fontes só são publicadas a partir da **0.35.0**.

## Trocar em runtime (seletor de marca)

### Consumindo por `npm install` → use o hook `useBrand` (≥ 0.33.0)

Ele já resolve persistência, sincronia entre abas e a regra de que `default` significa
**remover** o atributo (o tema-base não tem overlay).

```tsx
import { useBrand } from "@snksergio/design-system";

// Passe SÓ as marcas cujo overlay você importou no CSS.
const MINHAS_MARCAS = [
  { id: "default", label: "iGreen",         swatch: "oklch(0.5248 0.1415 150.9)" },
  { id: "vibrant", label: "iGreen Vibrant", swatch: "#0fff00" },
];

function SeletorDeMarca() {
  const { brand, brands, current, setBrand } = useBrand({ brands: MINHAS_MARCAS });
  return (
    <select value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Marca">
      {brands.map((b) => (
        <option key={b.id} value={b.id}>{b.label}</option>
      ))}
    </select>
  );
}
```

⚠️ **O catálogo é o ponto todo.** Sem o argumento, `useBrand` usa as 5 marcas do DS — e o
seletor listaria temas cujo CSS não está no seu bundle. `data-theme` com id sem overlay é
**no-op silencioso**: a opção aparece, o usuário clica, nada acontece, e não há erro.
Declare só o que você importou. `current` devolve a entrada ativa (label + swatch) pronta,
sem `find()`.

Valor persistido fora do catálogo cai na primeira entrada — então um `localStorage` com
`"pay"` de outro app não deixa este num tema órfão.

### Copy-in / submódulo, ou sem o pacote npm

Escreve/remove o atributo na mão. `default` remove:

```ts
function aplicarMarca(id: string) {
  const root = document.documentElement;
  if (id === "default") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", id);
}
```

Mesma armadilha: só funciona pras marcas cujo CSS **está no bundle**. Se o app oferece N
marcas ao usuário, importe os N overlays — e valide o id contra a lista que você importou,
não contra as 5 do DS.

## Criar um tema novo

Marca muda **somente cor**. Spacing, sizing, radius, elevation e tipografia vêm sempre da
`default` — não há como uma marca alterá-los, por design. Se o pedido envolve mudar
espaçamento ou fonte "só nesta marca", **não é tema** — é outra coisa, pergunte.

Criar marca é trabalho no **repo do DS**, não aqui: 3 arquivos em `tokens/brands/<id>/`
(palette + color-light + color-dark, mesmo contrato de nomes da default) e
`npm run tokens:brand:<id>`. Neste projeto você **consome** o resultado. Se o usuário
quer uma marca que não existe, o caminho é abrir a demanda no DS — não improvisar CSS
sobrescrevendo tokens aqui (isso quebra o `protect-ds` e sai do sistema).

## Nunca faça

- Sobrescrever CSS var de tema na unha (`--color-bg-brand: ...`) pra "simular" uma marca.
  Use overlay; var solta divergem do dark, dos status e do resto do sistema.
- Duplicar o overlay dentro do projeto pra editar cor. Ele é gerado; edição some no
  próximo update.
- Aplicar `data-theme` num wrapper interno em vez do `<html>`. Os dois blocos do overlay
  (`[data-theme="x"]:not(.dark)` e `.dark[data-theme="x"]`) assumem marca e modo no MESMO
  elemento — em elementos diferentes o light vaza pro dark.
