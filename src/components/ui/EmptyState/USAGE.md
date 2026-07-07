# EmptyState

**Categoria:** composto (Icon/lucide + Button). Estado vazio genérico, reusável no app inteiro — sem dados, busca sem resultado, conversa não selecionada, lista/inbox vazia, erro de carregamento, etc.

## Quando usar

- Uma área não tem conteúdo a exibir e você quer comunicar o porquê + (opcional) uma ação para sair do vazio.
- Tela de chat sem conversa selecionada, tabela/lista sem itens, resultado de busca/filtro vazio.

Não use para erros bloqueantes de página inteira com retry de sistema (use um padrão de erro dedicado) nem para loading (use skeleton/spinner).

## Anatomia

```
        [ ícone ]        ← size-icon-xl (sm) / 2xl (md,lg), cor fg-subtle
        Título           ← text-title-sm (sm,md) / md (lg), fg-strong
   Descrição opcional    ← body-sm, fg-muted, max-w 360px
       [ Button ]        ← ação opcional (mt de respiro)
```

Tudo centralizado vertical e horizontalmente, texto centralizado.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `title` | `string` | — | **Obrigatório.** Título principal. |
| `icon` | `LucideIcon \| ReactNode` | — | Componente lucide (ex: `Inbox`) **ou** node (Icon do DS, ilustração). Componente é dimensionado pelo `size`; node herda o tamanho via `[&_svg]:size-full`. |
| `description` | `string` | — | Texto auxiliar sob o título. |
| `action` | `{ label, onClick, color?, variant? } \| ReactNode` | — | Objeto vira um `<Button>` do DS; ou passe um node custom (2 botões, link...). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamanho do ícone + tipografia do título + size do Button da ação. |
| `className` | `string` | — | className do container. |

## Variants

| `size` | Ícone | Título | Button da ação |
|--------|-------|--------|----------------|
| `sm` | `size-icon-xl` (32px) | `text-title-sm` | `sm` |
| `md` | `size-icon-2xl` (40px) | `text-title-sm` | `md` |
| `lg` | `size-icon-2xl` (40px) | `text-title-md` | `lg` |

## Exemplo mínimo

```tsx
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

// Lista vazia com ação
<EmptyState
  icon={Inbox}
  title="Nenhuma conversa selecionada"
  description="Selecione uma conversa ao lado para visualizar as mensagens."
  action={{ label: "Iniciar atendimento", onClick: handleStart }}
/>

// Só ícone + título (busca sem resultado)
<EmptyState size="sm" icon={Search} title="Nenhum resultado encontrado" />

// Ícone custom via Icon do DS + ação custom (node)
<EmptyState
  icon={<Icon name="line-mail" />}
  title="Caixa de entrada vazia"
  action={<MyCustomButtons />}
/>
```

## Gotchas / cuidados

- **`icon` aceita componente OU node.** Passe a referência do componente lucide (`icon={Inbox}`, sem `<>`), que ele é instanciado e dimensionado pelo `size`. Para um `<Icon>` do DS ou ilustração, passe o elemento (`icon={<Icon name="..." />}`) — o wrapper aplica cor `fg-subtle` e o SVG ocupa o tamanho via `[&_svg]:size-full`.
- **`action` é discriminada em runtime:** objeto plano com `label`+`onClick` vira Button; qualquer element React é renderizado como está. Para customizar a cor/variante do Button, use `{ label, onClick, color, variant }`.
- Componente declarativo de **display** — não tem foco próprio nem `disabled`. O único elemento interativo é o Button da ação (já traz o Padrão 1 de foco do DS).
- O título usa `<h3>`; garanta hierarquia de headings coerente na página que o consome.
