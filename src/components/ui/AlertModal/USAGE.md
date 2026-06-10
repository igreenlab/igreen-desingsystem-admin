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
| `title` | ReactNode | — | Título do modal |
| `description` | ReactNode | — | Texto explicativo |
| `confirmLabel` | ReactNode | "Confirmar" | Conteúdo do botão primary |
| `cancelLabel` | ReactNode | "Cancelar" | Conteúdo do botão secondary |
| `hideCancel` | boolean | false | Esconde o botão Cancel (modal de aviso só com OK) |
| `hideClose` | boolean | false | Esconde o botão X de fechar no canto superior direito |
| `onConfirm` | () => void | — | Ação ao confirmar |
| `loading` | boolean | false | Trava interação durante async |
| `icon` | ReactNode \| null | — | Ícone customizado; `null` esconde; omitir usa o default do tone |

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
- `icon={null}` esconde o ícone; **omitir** a prop usa o ícone default do tone (`tone="default"` não tem ícone)
- Pra forçar decisão explícita (sem escape pelo X), use `hideClose`; pra modal informativo só com OK, use `hideCancel`
- Pra "alert" não-destrutivo, prefira `<Modal>` simples
