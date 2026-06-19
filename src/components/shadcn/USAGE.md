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
| `carousel` | Usa o **DS `Button`** interno (não o button shadcn). Dep extra: `embla-carousel-react`. |
| `input-otp` | Dep extra: `input-otp`. Foco usa `ring-ring-brand` (não `-primary`). |
| `drawer` | Dep extra: `vaul`. Mobile dentro de overlay z-50 → wrapper a **z-60** (L-030). |

**Padrão sem gotcha** (use direto, doc no showcase): `accordion`, `alert`,
`aspect-ratio`, `badge`, `breadcrumb`, `button`, `calendar`, `checkbox`,
`collapsible`, `command`, `dialog`, `dropdown-menu`, `input`, `label`, `popover`,
`progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`,
`skeleton`, `slider`, `switch`, `table`, `tabs`, `textarea`, `toggle`,
`toggle-group`, `combobox`.
