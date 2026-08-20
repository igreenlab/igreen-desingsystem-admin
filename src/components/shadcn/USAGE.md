# Shadcn — USAGE (índice de gotchas)

Atalho IA pros primitivos shadcn tokenizados. **Não há USAGE.md por arquivo**
aqui (a API é a do shadcn/Radix, padrão e conhecida) — a doc viva por componente
é o **showcase** (`#/<nome>`). Este índice lista **só o que NÃO é óbvio**: setup
obrigatório, dependências extras e pegadinhas DS. Componente que não aparece na
tabela = API shadcn padrão, sem gotcha → use direto e veja o showcase.

> Regra de manutenção (pipeline): ao **adicionar/editar** um shadcn, só crie/edite
> uma linha aqui **se houver gotcha real** (setup, dep, receita, acessibilidade).
> Sem gotcha → não escrever nada (evita inchar o arquivo e estourar tokens).
> Detalhe em `.claude/skills/ds-dev/impl-shadcn.md` (checklist).

| Componente | Gotcha (o não-óbvio) |
|---|---|
| `sonner` | Monte `<Toaster/>` **1× no root**. Toast neutro (surface); status só troca o ícone. Self-contained (segue `.dark`, sem next-themes). **Pra card ergonômico (title/description/action/status), use o composto `ui/Toast`** — não estilizar status no Sonner. |
| `tooltip` | Precisa de `<TooltipProvider>` ancestral (1× no root). `delayDuration` default = 200ms. |
| `hover-card` | `openDelay` default = 200ms. Segue a receita flutuante (L-040). |
| `context-menu`, `menubar`, `navigation-menu` | Superfície flutuante segue a **receita única** (L-040) — não reverter pros defaults shadcn. |
| `card` | **`CardHeader` usa `gap-gp-2xs` (2px), não os 6px do shadcn upstream** — título e subtítulo de card são uma unidade de leitura, não dois blocos. Divergência **deliberada** (2026-08-19): ao re-sincronizar o primitivo, não reverter (mesma classe de cuidado da L-040). **`size`** (`sm`/`md`/`lg` = 16/20/24px) escala o padding de TODAS as partes — declare **só no `<Card>`**, chega em Header/Content/Footer por contexto; repetir nas partes é o erro que deixa uma seção com densidade diferente. **`md` (20px) é o default e antes era 24** — card que dependia dos 24 passa `size="lg"`. Não existe 18px na escala de `pad`, então `sm` é 16. Tokens: `p-pad-card-sm|md|lg` — ⚠️ `p-pad-card-base` continua existindo como **alias de `md`** (era 24 até 2026-08-19, virou 20): nada quebra, mas quem já consumia `base` recebe o novo valor. Não usar em código novo. **Subtítulo** (`CardDescription`) é `text-caption-md` (12/400), não `body-md` (14) — entre os dois presets de 12px, `caption-md` mantém o peso 400 e o `body-xs` (12/500) exigiria `font-normal` por cima. **`CardHeader variant="banded"`** = faixa `bg-bg-subtle` + `border-b border-border-subtle`, encostada nas bordas (cancela o `py` do Card com `-mt-*` e usa `rounded-t-*`, não `overflow-hidden` no Card — clipar quebraria o que precisa vazar); ⚠️ **Ação à direita na faixa exige `className="flex …"`, não `flex-row`**: o `CardHeader` é `grid` por padrão e `flex-row` **não troca o display** — os filhos continuam empilhando (o botão cai embaixo do título). Com `flex`, o tailwind-merge substitui o `grid` porque estão no mesmo grupo. ⚠️ No **dark** o `bg-subtle` é 1% de branco sobre surface 0.225: faixa muito discreta **de propósito** — se precisar de presença, `bg-muted` é 3× e no light é idêntico. O `Card` carrega o padding **vertical** e cada parte o **horizontal**, então parte full-bleed (tabela encostando nas bordas) é só zerar o `px` dela. |
| `carousel` | Usa o **DS `Button`** interno (não o button shadcn). Dep extra: `embla-carousel-react`. |
| `input-otp` | Dep extra: `input-otp`. **Irmão do `Input`**: mesmos `size` (`xxs`/`xs`/`sm`/`md` → form-xs/sm/md/lg) e `state` (default/error/warning/success), mesma superfície, foco por **borda verde + `shadow-sh-ring`** (não `ring-4`). `variant`: `connected` (default) · `outlined` · `filled` · `underline`. Declare no `<InputOTP>` — os slots herdam por contexto; repetir a prop em cada slot é o erro que deixa um slot de tamanho diferente no meio da fileira. |
| `drawer` | Dep extra: `vaul`. Mobile dentro de overlay z-50 → wrapper a **z-60** (L-030). |
| `tabs` | 2 variantes via prop **`variant` no `<Tabs>`** (propagada por contexto — NÃO em List/Trigger): `"segmented"` (default, pill) · `"line"` (underline, aba ativa com `border-border-brand`). |
| `alert-dialog` | **ESC FECHA**, ao contrário do que o comentário do componente afirmava (medido no browser). Só o clique fora é bloqueado. Decisão inescapável exige `onEscapeKeyDown={(e) => e.preventDefault()}` — é o que o `ui/AlertModal` faz enquanto `loading`, porque o ESC é o único caminho de dismiss que não passa por um botão e escapava dos `disabled`. Header é **centralizado** (o do Dialog é à esquerda) e o Footer é `col-reverse` no mobile — ação em cima. No `sm+` o Footer **estica os filhos** (`sm:[&>*]:flex-1`): os botões dividem a largura toda, e você **não** precisa de `fullWidth` neles. Antes não esticava, e botão sem `fullWidth` ficava na largura do texto encostado à esquerda — o oposto do desenho; o `AlertModal` compensava passando `fullWidth` em cada Button. Pra confirmação comum use o composto **`ui/AlertModal`**, que já monta tom + ícone + botões. |
| `input` | **`type="file"`** tem 2 desvios tratados por variante de atributo (`[&[type=file]]:…`): o UA aplica `align-items: baseline` e o conteúdo sobe na caixa de 40px → forçado `items-center`; e o texto do input vinha em `fg-default`, destoando do `placeholder:text-fg-muted` de todo input do DS → forçado `text-fg-muted`. **Efeito colateral aceito:** o CSS não distingue "vazio" de "arquivo escolhido" num file input, então o **nome do arquivo também fica muted**. Pra UX de upload de verdade (nome em destaque, remover, drag-and-drop) use o composto **`ui/FileUploadField`**, não o `<Input type="file">` cru. |

**Padrão sem gotcha** (use direto, doc no showcase): `accordion`, `alert`,
`aspect-ratio`, `badge`, `breadcrumb`, `button`, `calendar`, `checkbox`,
`collapsible`, `command`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`,
`progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`,
`skeleton`, `slider`, `switch`, `table`, `textarea`, `toggle`,
`toggle-group`, `combobox`.
