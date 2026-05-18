# Button

Componente interativo para ações. Suporta 5 cores, 4 variantes e 4 tamanhos.

## Variantes

| color + variant    | Quando usar |
|--------------------|-------------|
| primary + filled   | Ação principal da tela, CTA — único por contexto |
| primary + outline  | Ação secundária com destaque de marca |
| primary + soft     | Ação com peso visual reduzido, fundo tonal |
| primary + ghost    | Ação terciária, sem peso visual |
| secondary + filled | Ação de destaque sem conotação de marca (settings, filtros) |
| secondary + outline| Ação neutra com borda — uso geral |
| secondary + soft   | Ação neutra com fundo sutil |
| secondary + ghost  | Ação neutra sem peso visual |
| critical + filled  | Ação destrutiva ou irreversível (deletar, remover) |
| critical + outline | Ação destrutiva com menos peso |
| critical + soft    | Ação destrutiva em contexto de lista |
| critical + ghost   | Ação destrutiva terciária |
| success + filled   | Confirmação positiva, ação concluída com sucesso |
| success + outline  | Feedback positivo com menos peso |
| success + soft     | Feedback positivo em contexto de lista |
| success + ghost    | Feedback positivo terciário |
| warning + filled   | Ação que requer atenção ou cautela |
| warning + outline  | Alerta com menos peso visual |
| warning + soft     | Alerta em contexto de lista |
| warning + ghost    | Alerta terciário |

## Tamanhos

| size | Height | Uso |
|------|--------|-----|
| `xxs` | 28px (`formHeight.xs`) | Toolbars compactas, inline actions |
| `xs` | 32px (`formHeight.sm`) | Formulários densos, filtros |
| `sm` | 36px (`formHeight.md`) | Padrão desktop |
| `md` | 40px (`formHeight.lg`) | Padrão mobile / CTA — touch-friendly |

Para WCAG touch target (44px), usar `formHeight.lg` via className override.

## Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `color` | `"primary" \| "secondary" \| "critical" \| "success" \| "warning"` | `"primary"` | Cor/intenção semântica |
| `variant` | `"filled" \| "outline" \| "soft" \| "ghost"` | `"filled"` | Estilo visual |
| `size` | `"xxs" \| "xs" \| "sm" \| "md"` | `"md"` | Tamanho |
| `fullWidth` | `boolean` | `false` | Ocupa 100% da largura do container |
| `disabled` | `boolean` | `false` | Estado desabilitado |
| `loading` | `boolean` | `false` | Mostra spinner e desabilita |
| `iconLeft` | `ReactNode` | — | Ícone antes do texto |
| `iconRight` | `ReactNode` | — | Ícone após o texto |
| `className` | `string` | — | Override de classes (tw-merge resolve conflitos) |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | Tipo HTML — default "button" para evitar submit acidental |

## Fazer / Não fazer

- Usar `color="critical"` para ações destrutivas (deletar, remover)
- Usar `variant="ghost"` para ações de baixa prioridade
- Usar `fullWidth` para CTAs em mobile ou modais
- Máximo 1 botão `filled` por grupo de ações
- Padrão de grupo: 1 filled + 1 ghost (ou outline)
- Não usar `filled` para cancelar — usar `ghost`
- Não usar `disabled` para esconder funcionalidade — apenas quando ação não está disponível
- Não misturar `primary` e `critical` filled no mesmo grupo

## Exemplo de uso

```tsx
import { Button } from "@/components/ui/Button";

// Ação principal
<Button color="primary" variant="filled">
  Salvar
</Button>

// Ação secundária
<Button color="primary" variant="ghost">
  Cancelar
</Button>

// Ação destrutiva
<Button color="critical" variant="filled" iconLeft={<TrashIcon />}>
  Excluir
</Button>

// Ação neutra com loading
<Button color="secondary" variant="outline" loading>
  Processando...
</Button>

// Grupo de ações (padrão)
<div className="flex gap-gp-md">
  <Button color="primary" variant="ghost">Cancelar</Button>
  <Button color="primary" variant="filled">Confirmar</Button>
</div>

// Botão full-width
<Button color="primary" variant="filled" fullWidth>
  Botão full-width
</Button>
```

## Fonte de verdade

- Estilos: `button.styles.ts` (tv())
- Lógica: `button.tsx`
- Tipos: `button.types.ts`
