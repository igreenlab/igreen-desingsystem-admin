# AlertModal — USAGE

Modal de confirmação destrutiva com tone semântico (danger/warning/success/neutral).

## Quando usar
- Confirmar ação destrutiva (excluir, arquivar, revogar)
- Pedir confirmação de decisão crítica antes de executar

## Import
```tsx
import { AlertModal } from "@/components/ui/AlertModal";
```

## Props essenciais
| Prop | Tipo | Default | Função |
|---|---|---|---|
| `open` | boolean | — | Controla visibilidade |
| `onOpenChange` | (open: boolean) => void | — | Callback de fechamento |
| `tone` | "default" \| "neutral" \| "danger" \| "warning" \| "success" | "default" | Cor semântica |
| `title` | string | — | Título do modal |
| `description` | string | — | Texto explicativo |
| `confirmLabel` | string | "Confirmar" | Texto do botão primary |
| `cancelLabel` | string | "Cancelar" | Texto do botão secondary |
| `onConfirm` | () => void | — | Ação ao confirmar |
| `loading` | boolean | false | Trava interação durante async |
| `icon` | ReactNode | — | Ícone customizado (default por tone) |

## Exemplo mínimo
```tsx
<AlertModal
  open={confirmDelete}
  onOpenChange={setConfirmDelete}
  tone="danger"
  title="Excluir cliente?"
  description="Esta ação não pode ser desfeita"
  onConfirm={handleDelete}
/>
```

## Cuidados / Gotchas
- Quando `loading=true`, modal **não fecha automaticamente** — consumer chama `onOpenChange(false)` após async terminar
- `tone="danger"` aplica cor critical ao botão de confirm
- Pra "alert" não-destrutivo, prefira `<Modal>` simples
