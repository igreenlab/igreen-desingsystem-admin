# Toast — USAGE

**O que é:** card de notificação consistente sobre o Sonner. _Categoria: Feedback._
Consome o Sonner via `toast.custom` → mantém **nativo**: agrupamento, empilhamento,
slide, swipe-to-dismiss e posições. Só troca o conteúdo por um card do DS.

**Quando usar:** feedback de ação (salvar, excluir, erro), avisos e convites com
título + subtexto + ações. Pra toast cru sem card, use o Sonner direto.

## Setup (1×)
`<Toaster />` no root (de `@/components/shadcn/sonner`) — já segue o tema do DS.

## Disparar
```tsx
import { toast } from "@/components/ui/Toast";

toast.success({ title: "Alterações salvas", description: "Perfil atualizado." });
toast.error({ title: "Falha no upload", action: { label: "Tentar de novo", tone: "danger" } });
toast({ title: "3 mensagens novas", icon: <Mail />, meta: "agora", action: { label: "Ver" } });
```

## Props (do card)
| Prop | Tipo | Nota |
|---|---|---|
| `title` | ReactNode | obrigatório |
| `description` | ReactNode | subtexto (fg-muted) |
| `status` | `default\|info\|success\|warning\|danger` | muda **só** o icon-chip; via `toast.success/.error/.warning/.info` |
| `icon` | ReactNode | override do ícone do chip |
| `meta` | ReactNode | texto curto à direita do título (ex.: "agora") |
| `action` | `{ label, onClick, tone?, iconLeft?, iconRight? }` | sozinho = inline à direita |
| `cancel` | `{ label, onClick }` | com `action` → rodapé (cancel ↔ action) |
| `onClose` | `() => void` | mostra o X e dá dismiss |
| `duration`/`position`/`id` | — | passthrough nativo do Sonner |

`tone` do action: `brand` (default) · `neutral` · `danger`.

## Status (cor)
Só o **icon-chip** muda: bg fraco (`bg-{status}-muted`) + ícone forte (`fg-{status}`).
A superfície do card é sempre neutra (`bg-surface`). Decisão de design: o feedback
vem do ícone, não de tingir o toast inteiro.

## Passthrough nativo
`toast.promise(...)`, `toast.dismiss(id)`, `toast.loading(...)`, `toast.custom(...)`
seguem disponíveis pelo mesmo `toast`.

## Gotchas
- Precisa do `<Toaster />` montado 1× (senão nada aparece).
- `action` sozinho fica inline no header; pra 2 botões em rodapé, passe `cancel` também.
- Pra conteúdo 100% livre (progress bar, avatar grande), use `toast.custom((id) => <…/>)`.
