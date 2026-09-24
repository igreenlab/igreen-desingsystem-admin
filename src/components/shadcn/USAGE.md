# Shadcn — USAGE (índice de gotchas)

Atalho IA pros primitivos shadcn tokenizados. **Não há USAGE.md por arquivo**
aqui (a API é a do shadcn/Radix, padrão e conhecida) — a doc viva por componente
é o **showcase** (`#/<nome>`, em https://igreen-desingsystem-admin.vercel.app). Este índice lista **só o que NÃO é óbvio**: setup
obrigatório, dependências extras e pegadinhas DS. Componente que não aparece na
tabela = API shadcn padrão, sem gotcha → use direto e veja o showcase.

> Regra de manutenção — **só pra quem desenvolve o DS** (consumindo, ignore): ao
> **adicionar/editar** um shadcn, só crie/edite uma linha aqui **se houver gotcha real**
> (setup, dep, receita, acessibilidade). Sem gotcha → não escrever nada (evita inchar o
> arquivo e estourar tokens). Detalhe em `.claude/skills/ds-dev/impl-shadcn.md`.

| Componente | Gotcha (o não-óbvio) |
|---|---|
| `sonner` | Monte `<Toaster/>` **1× no root**. Toast neutro (surface); status só troca o ícone. Self-contained (segue `.dark`, sem next-themes). **Pra card ergonômico (title/description/action/status), use o composto `ui/Toast`** — não estilizar status no Sonner. |
| `tooltip` | `<Tooltip>` já embrulha o próprio Provider — **não** precisa de um no root. `delayDuration` default = **0** (instantâneo); sobrescreva com `<Tooltip delayDuration={400}>`. ⚠️ Até 2026-08-24 esta linha dizia 200ms e o componente não passava nada, valendo o default do Radix (**700**). |
| `select` | **Nunca `<SelectItem value="">`.** `""` é a sentinela de "nada selecionado" do Radix (`shouldShowPlaceholder`): o rótulo da opção nunca aparece, e o item **lança** no 2.2.6 ("must have a value prop that is not an empty string") — erro que o 2.3.1 **removeu**, trocando quebra alta por silêncio. **E o valor controlado é ECOADO de volta**: dentro de um `<form>` o `SelectBubbleInput` faz `select.value = <valor>` e dispara `change`; sem `<option>` correspondente o DOM recusa e o eco volta `onValueChange("")` — apagando um valor que ninguém tocou. Morde sempre que as opções chegam DEPOIS do valor (lista assíncrona, ou opções derivadas do próprio formulário). **O `ui/FormField/FormFieldSelect` já trata os dois** (sentinela interna + guarda do eco, com testes em `valor-orfao.test.tsx`) — prefira-o a montar o primitivo na unha. |
| `hover-card` | `openDelay` default = 200ms. Segue a receita flutuante (L-040). |
| `context-menu`, `menubar`, `navigation-menu` | Superfície flutuante segue a **receita única** (L-040) — não reverter pros defaults shadcn. |
| `card` | **`CardHeader` usa `gap-gp-2xs` (2px), não os 6px do shadcn upstream** — título e subtítulo de card são uma unidade de leitura, não dois blocos. Divergência **deliberada** (2026-08-19): ao re-sincronizar o primitivo, não reverter (mesma classe de cuidado da L-040). **`size`** (`sm`/`md`/`lg` = 16/20/24px) escala o padding de TODAS as partes — declare **só no `<Card>`**, chega em Header/Content/Footer por contexto; repetir nas partes é o erro que deixa uma seção com densidade diferente. **`md` (20px) é o default e antes era 24** — card que dependia dos 24 passa `size="lg"`. Não existe 18px na escala de `pad`, então `sm` é 16. Tokens: `p-pad-card-sm|md|lg` — ⚠️ `p-pad-card-base` continua existindo como **alias de `md`** (era 24 até 2026-08-19, virou 20): nada quebra, mas quem já consumia `base` recebe o novo valor. Não usar em código novo. **Subtítulo** (`CardDescription`) é `text-caption-md` (12/400), não `body-md` (14) — entre os dois presets de 12px, `caption-md` mantém o peso 400 e o `body-xs` (12/500) exigiria `font-normal` por cima. **`CardHeader variant="banded"`** = faixa `bg-bg-subtle` + `border-b border-border-subtle`, encostada nas bordas (cancela o `py` do Card com `-mt-*` e usa `rounded-t-*`, não `overflow-hidden` no Card — clipar quebraria o que precisa vazar); ⚠️ **Ação à direita na faixa exige `className="flex …"`, não `flex-row`**: o `CardHeader` é `grid` por padrão e `flex-row` **não troca o display** — os filhos continuam empilhando (o botão cai embaixo do título). Com `flex`, o tailwind-merge substitui o `grid` porque estão no mesmo grupo. ⚠️ No **dark** o `bg-subtle` é 1% de branco sobre surface 0.225: faixa muito discreta **de propósito** — se precisar de presença, `bg-muted` é 3× e no light é idêntico. O `Card` carrega o padding **vertical** e cada parte o **horizontal**, então parte full-bleed (tabela encostando nas bordas) é só zerar o `px` dela. **Card clicável: `onClick`/`href` + `surfaceLabel` (obrigatório)** — não ponha `onClick` na div. O DS monta um `<button>`/`<a>` ESTICADO por cima (`ClickableSurface`) em vez de trocar a raiz: conteúdo de `<button>` é phrasing content, e um card tem `<div>`/parágrafos dentro. O alvo é vazio, daí o `surfaceLabel` — sem ele o leitor anuncia só "botão". Controle DENTRO do card (menu, botão secundário) precisa de `relative z-10`, senão o overlay o cobre. Com router, `renderLink` (L-068). **`surfaceClassName`** (2026-09-24) aponta pro ALVO esticado, não pro card: o anel de foco é `ring` externo e **some** quando o card está dentro de container com `overflow-hidden` ou `content-visibility` — nesse caso passe `surfaceClassName="ring-inset"`. O Card também repassa `aria-pressed` / `aria-current` / `aria-expanded` / `disabled` pro alvo, que é o que faz card de SELEÇÃO ser anunciado como selecionado em vez de só pintado. |
| `carousel` | Usa o **DS `Button`** interno (não o button shadcn). Dep extra: `embla-carousel-react`. `<CarouselDots />` = indicador de posição clicável: um ponto por **parada** (`scrollSnapList`), não por slide — com vários slides visíveis ou `slidesToScroll` os números divergem. Some sozinho quando há 1 parada. |
| `input-otp` | Dep extra: `input-otp`. **Irmão do `Input`**: mesmos `size` (`xxs`/`xs`/`sm`/`md` → form-xs/sm/md/lg) e `state` (default/error/warning/success), mesma superfície, foco por **borda verde + `shadow-sh-ring`** (não `ring-4`). `variant`: `connected` (default) · `outlined` · `filled` · `underline`. Declare no `<InputOTP>` — os slots herdam por contexto; repetir a prop em cada slot é o erro que deixa um slot de tamanho diferente no meio da fileira. |
| `drawer` | Dep extra: `vaul`. Mobile dentro de overlay z-50 → wrapper a **z-60** (L-030). |
| `tabs` | **Duas props no `<Tabs>`, propagadas por contexto — NÃO em List/Trigger.** `variant`: `"segmented"` (default, pill) = trocar conteúdo DENTRO de uma superfície (card, bloco, `Panel`, `FloatingPanel`, `Modal`, drawer) · `"line"` (underline) = navegar seções de uma PÁGINA, ou 2º nível abaixo de um segmented; nunca empilhe a mesma variante em dois níveis. **`fullWidth`**: abas ocupam a largura e se distribuem — use em superfície compacta (`Panel` 560px, `FloatingPanel` 320–720 e redimensionável, `Modal` até `lg`, card, bloco); **não** use em toolbar (o `DataTable` usa hug de propósito), página livre ou `Modal` `xl` (1100px). ⛔ Não escreva `w-full` no List nem `flex-1` nos triggers na mão: `w-full` só no List estica o container e agrupa as abas na esquerda — era o defeito de 6 dos 7 usos manuais do próprio DS. |
| `dialog` | **O card inteiro rola** — `DialogContent` tem teto `max-h-[calc(100dvh-2rem)]` + `overflow-y-auto`, então header e footer rolam junto com o corpo. Header/footer fixos com só o corpo rolando → use o composto **`ui/Modal`**; não ponha `max-h` + `overflow` num filho "por garantia" (vira scroll duplo quando o conteúdo passa da tela). **Clique dentro de overlay Radix portalado** (`[data-radix-popper-content-wrapper]`: Popover, Select, DropdownMenu) **não fecha** o dialog, e o seu `onPointerDownOutside` **não é chamado** nesse caso (o clique não conta como "fora"); nos demais ele é chamado e o `preventDefault()` continua bloqueando. `DialogHeader` reserva  **Largura: use `size`, não `className`.** `size="sm"` 480 · `"md"` 640 · `"lg"` **768 (default)** — a escala `modal-*` do DS. Um `max-w-*` sem variante NÃO vence o `sm:max-w-modal-*` da base (breakpoints diferentes, o merge não funde, a media query ganha acima de 640px) — era isso que obrigava a escrever `sm:max-w-…`. A largura NÃO mudou: a base era `sm:max-w-md`, que com a escala de container sobrescrita resolvia pra 768px — um valor que ninguém tinha escolhido e que não estava em token nenhum. Agora são os mesmos 768, ditos em voz alta. **Geometria do header (2026-09-23):** X em `right-4 top-4` (16px), título com `leading-none` (16px) e `DialogHeader` SEM reserva à direita — a geometria de sempre. A #333 tinha mudado as três (X em 24px com caixa de 24, entrelinha do preset em 24px, `pr-32px`), o que somava **+8px de header em todo diálogo de título curto**; revertido, mantendo as correções de rolagem e do popover portalado. ⚠️ Em troca: título de 2 linhas fica com as linhas encostadas (use `className="leading-tight"` no `DialogTitle`) e título de 1 linha muito longo passa sob o X (use `className="pr-pad-6xl"` no `DialogHeader`). Gate: `dialog-header-geometry.test.tsx`. |
| `sheet` | As mesmas duas regras do `dialog`: o **conteúdo rola dentro do painel** (`overflow-y-auto`; `top`/`bottom` com teto `max-h-dvh`, as laterais já têm `h-full`) e clique dentro de overlay Radix portalado **não fecha** o sheet nem chama o seu `onPointerDownOutside`. Painel lateral com header/footer fixos → composto **`ui/Panel`**. **Largura: `size`** — `"sm"` 320 · `"md"` 480 · `"lg"` **640 (default)**, escala `drawer-*`. Só vale em `side` left/right: em `top`/`bottom` o painel é full-width e um `max-w` o estreitaria em vez de mudar a altura. Mesma largura de antes (`sm:max-w-sm` resolvia 640) — mudou o nome, não o pixel. |
| `alert-dialog` | **ESC FECHA**, ao contrário do que o comentário do componente afirmava (medido no browser). Só o clique fora é bloqueado. Decisão inescapável exige `onEscapeKeyDown={(e) => e.preventDefault()}` — é o que o `ui/AlertModal` faz enquanto `loading`, porque o ESC é o único caminho de dismiss que não passa por um botão e escapava dos `disabled`. Header é **centralizado** (o do Dialog é à esquerda) e o Footer é `col-reverse` no mobile — ação em cima. No `sm+` o Footer **estica os filhos** (`sm:[&>*]:flex-1`): os botões dividem a largura toda, e você **não** precisa de `fullWidth` neles. Antes não esticava, e botão sem `fullWidth` ficava na largura do texto encostado à esquerda — o oposto do desenho; o `AlertModal` compensava passando `fullWidth` em cada Button. Pra confirmação comum use o composto **`ui/AlertModal`**, que já monta tom + ícone + botões. O card tem o mesmo teto e rolagem do `dialog` (`max-h-[calc(100dvh-2rem)]` + `overflow-y-auto`). Largura base é **`modal-xs` (420px)** — o MESMO valor de antes, que era o hardcode `sm:max-w-[420px]`. O degrau nasceu pra ele. |
| `input` | **`type="file"`** tem 2 desvios tratados por variante de atributo (`[&[type=file]]:…`): o UA aplica `align-items: baseline` e o conteúdo sobe na caixa de 40px → forçado `items-center`; e o texto do input vinha em `fg-default`, destoando do `placeholder:text-fg-muted` de todo input do DS → forçado `text-fg-muted`. **Efeito colateral aceito:** o CSS não distingue "vazio" de "arquivo escolhido" num file input, então o **nome do arquivo também fica muted**. Pra UX de upload de verdade (nome em destaque, remover, drag-and-drop) use o composto **`ui/FileUploadField`**, não o `<Input type="file">` cru. |
| `label` | **`weight`** — `semibold` (default, rótulo de CAMPO) · `regular` (rótulo de OPÇÃO dentro de grupo: checkbox, radio, switch). No grupo o destaque pertence à legenda; oito opções em 600 achatam a hierarquia que o 600 deveria criar. Até 2026-09-23 a saída era `className="font-normal"` — que a nossa própria doc do Checkbox usava em 2 linhas. **Não troque o default**: rótulo de campo é contraste de leitura (WCAG). |
| `textarea` | **`rows` agora diminui a altura.** O piso `min-h-[100px]` só se aplica quando `rows` NÃO vem; com `rows`, a altura é a nativa do elemento (linhas × line-height + padding). Antes o piso estava na base do cva e `rows={2}` não encolhia nada — o consumidor anulava na mão. |

**Padrão sem gotcha** (use direto, doc no showcase): `accordion`, `alert`,
`aspect-ratio`, `badge`, `breadcrumb`, `button`, `calendar`, `checkbox`,
`collapsible`, `command`, `dropdown-menu`, `label`, `popover`,
`progress`, `radio-group`, `scroll-area`, `separator`,
`skeleton`, `slider`, `switch`, `table`, `textarea`, `toggle`,
`toggle-group`, `combobox`.

> ⚠️ Id daqui **não pode** estar na tabela acima. `input` e `select` estavam nos dois
> (corrigido em 2026-09-15) — quem lesse só esta lista usava direto um `select` cuja
> sentinela `value=""` apaga valor em silêncio.

## Payload de injeção (lido pelo hook, não por você)

Os blocos abaixo são o que o `protect-ds.mjs` imprime quando a IA **escreve** aquele
primitivo. A tabela acima é a doc completa; aqui vai só o que decide, curto de propósito —
a célula do `tabs` tem 816 chars e não cabe num aviso. Primitivo sem bloco = silêncio.

<!-- ds:regras tabs
- `variant` default (segmented) dentro de superfície (card, bloco, Panel, Modal, drawer); `line` só pra seção de página
- `fullWidth` em superfície compacta; ⛔ nunca `w-full` no List nem `flex-1` no trigger na mão
-->

<!-- ds:regras drawer
- é bottom-sheet (vaul): mobile ou gesto de arrastar. Detalhe lateral em desktop → `Panel` (bloqueia) ou `FloatingPanel` (coexiste com a lista)
- painel de DETALHE → siga o bloco `dsgreen-paneldetail-1` (o **padrão**). `-2` (tarefa com abas) e `-3` (com tabela) só se o usuário citar o ID
-->

<!-- ds:regras select
- ⛔ nunca `<SelectItem value="">` — é a sentinela do Radix e apaga valor em silêncio
- em form, prefira `FormFieldSelect` (já trata a sentinela e o eco do valor)
-->

<!-- ds:regras card
- `size` (`sm`/`md`/`lg`) declare SÓ no `<Card>` — Header/Content/Footer herdam por contexto; repetir nas partes é o que deixa uma seção com densidade diferente
- `CardHeader variant="banded"` com ação à direita pede `className="flex …"`, NUNCA `flex-row`: o header é `grid` e `flex-row` não troca o display — o botão cai embaixo do título
-->

<!-- ds:regras alert-dialog
- confirmação comum → use o composto `ui/AlertModal` (já monta tom + ícone + botões); o primitivo cru só pra caso fora do padrão
- ⚠️ ESC FECHA (só o clique fora é bloqueado). Decisão inescapável exige `onEscapeKeyDown={(e) => e.preventDefault()}`
-->

<!-- ds:regras sonner
- `<Toaster/>` **1× no root**, senão o toast não aparece e não há erro
- card ergonômico (title/description/action) → use o composto `ui/Toast`
-->

> **`command`** — `CommandDialog` aceita `size` (sm 384 default · md 480 · lg 640),
> `contentClassName`, `commandProps` (repassadas ao cmdk: `shouldFilter`, `filter`,
> `loop`, `value`) e `title`. O `commandProps` é o que destrava **busca no servidor**:
> sem `shouldFilter={false}` o cmdk filtra do lado do cliente e esconde o que veio da
> API. `CommandLoading` agora é exportado pelo DS — não importe do `cmdk` direto, isso
> prende a versão dele no seu projeto.
