# ButtonGroup — Guia de uso

Componente composto **split button** — um botão principal + um chevron lateral compacto pra ações secundárias. Pattern típico: ação default + dropdown de variantes.

> Não confundir com **toolbar/segmented control**. ButtonGroup hoje cobre **split button (2 slots)**. Pra agrupar 3+ botões em "linked toolbar" (Day/Week/Month), criar componente próprio futuro.

---

## Imports

```tsx
import { ButtonGroup } from "@/components/ui/ButtonGroup";
```

---

## Quick start

```tsx
<ButtonGroup color="primary" variant="filled" size="md">
  <ButtonGroup.Primary onClick={handlePrimary} iconLeft={<Save />}>
    Salvar
  </ButtonGroup.Primary>
  <ButtonGroup.Chevron
    onClick={openDropdown}
    aria-label="Mais opções de salvamento"
  />
</ButtonGroup>
```

Visual:

```
┌────────────┬──┐
│ 💾 Salvar  │ ⌄│
└────────────┴──┘
```

---

## Props

### `<ButtonGroup>` (wrapper)

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `color` | `"primary" \| "secondary" \| "critical" \| "success" \| "warning"` | `"primary"` | Cor herdada do `<Button>`. Propaga aos slots via context. |
| `variant` | `"filled" \| "outline" \| "soft" \| "ghost"` | `"filled"` | Estilo visual. Propaga aos slots. |
| `size` | `"2xs" \| "xs" \| "sm" \| "md" \| "lg"` | `"md"` | Altura. Propaga aos slots. **Icon sizes (`icon-*`) não suportados** — o Chevron já é icon-only quadrado, com dimensão derivada da size do group. |
| `disabled` | `boolean` | `false` | Desabilita os 2 slots simultaneamente. Override individual permitido. |
| `children` | `ReactNode` | — | `<ButtonGroup.Primary>` + `<ButtonGroup.Chevron>` |
| `className` | `string` | — | Override do wrapper externo. |

### `<ButtonGroup.Primary>` (slot principal)

Aceita **todas as props do `<Button>`** exceto `shape` e `fullWidth`. Color/variant/size vêm do group por context — pode dar override passando explicitamente.

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `onClick` | `(e) => void` | — | Handler da ação principal. |
| `iconLeft` / `iconRight` | `ReactNode` | — | Ícone inline. |
| `loading` | `boolean` | `false` | Mostra spinner + desabilita. |
| `disabled` | `boolean` | herda do group | Override individual. |
| `color`/`variant`/`size` | — | herda do group | Override individual permitido. |

### `<ButtonGroup.Chevron>` (slot secundário)

Icon button **quadrado** (width = height) — espelha a size do Primary, como um "split" da mesma proporção: `2xs`→28×28, `xs`→32×32, `sm`→36×36, `md`→40×40 (`size-form-lg`), `lg`→44×44. Mesma dimensão de um icon button `icon-*` equivalente do Button. Renderiza `<ChevronDown />` por default.

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `onClick` | `(e) => void` | — | Handler do toggle (geralmente abre dropdown). |
| `aria-label` | `string` | **obrigatório** | Descrição pro leitor de tela (icon-only). |
| `icon` | `ReactNode` | `<ChevronDown />` | Customize se precisar (ex: `<MoreVertical />` pra kebab). |
| `disabled` | `boolean` | herda do group | Override individual. |
| `color`/`variant`/`size` | — | herda do group | Override permitido. |

---

## Exemplos

### 1. Split button com dropdown

```tsx
import { useState } from "react";
import { ButtonGroup } from "@/components/ui/ButtonGroup";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/shadcn/popover";

function SaveSplit() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ButtonGroup variant="filled">
        <ButtonGroup.Primary onClick={() => save()}>
          Salvar
        </ButtonGroup.Primary>
        <PopoverTrigger asChild>
          <ButtonGroup.Chevron aria-label="Opções de salvamento" />
        </PopoverTrigger>
      </ButtonGroup>
      <PopoverContent align="end">
        <button onClick={() => saveAndClose()}>Salvar e fechar</button>
        <button onClick={() => saveAsTemplate()}>Salvar como template</button>
      </PopoverContent>
    </Popover>
  );
}
```

### 2. Variants

```tsx
{/* Outline secondary (estilo "Follow" do print) */}
<ButtonGroup color="secondary" variant="outline" size="sm">
  <ButtonGroup.Primary onClick={follow}>Follow</ButtonGroup.Primary>
  <ButtonGroup.Chevron onClick={openMenu} aria-label="Mais ações" />
</ButtonGroup>

{/* Critical filled */}
<ButtonGroup color="critical" variant="filled">
  <ButtonGroup.Primary onClick={deleteItem}>Deletar</ButtonGroup.Primary>
  <ButtonGroup.Chevron onClick={openMenu} aria-label="Outras opções de deletar" />
</ButtonGroup>

{/* Override individual: primary=brand, chevron=secondary */}
<ButtonGroup variant="filled">
  <ButtonGroup.Primary color="primary">Salvar</ButtonGroup.Primary>
  <ButtonGroup.Chevron color="secondary" aria-label="Mais" />
</ButtonGroup>
```

### 3. Disabled / loading

```tsx
{/* Group inteiro desabilitado */}
<ButtonGroup disabled>
  <ButtonGroup.Primary>Salvar</ButtonGroup.Primary>
  <ButtonGroup.Chevron aria-label="..." />
</ButtonGroup>

{/* Só o primary disabled (chevron continua clicável) */}
<ButtonGroup>
  <ButtonGroup.Primary disabled>Salvar</ButtonGroup.Primary>
  <ButtonGroup.Chevron aria-label="Outras opções" />
</ButtonGroup>

{/* Loading no primary */}
<ButtonGroup>
  <ButtonGroup.Primary loading>Salvando</ButtonGroup.Primary>
  <ButtonGroup.Chevron aria-label="..." disabled />
</ButtonGroup>
```

---

## Gotchas

- **`aria-label` é obrigatório** no `<ButtonGroup.Chevron>` — TypeScript reclama se omitir. Icon-only sem label viola WCAG 4.1.2.
- **`shape="pill"` não funciona** com ButtonGroup — radius interno é forçado retangular pra encostar os 2 slots. Pra pill, use `<Button>` standalone.
- **Icon sizes (`icon-*`)** não suportadas no group — o Chevron já é quadrado com dimensão derivada da size do group. Se quiser group "icon-only", use 2 `<Button>` standalone.
- **Border duplicado entre slots** — colapsado via `-ml-px` no Chevron. Funciona em filled/soft/ghost. Em **outline**, o efeito visual pode ter 1px de overlap; teste no contexto antes de promover.
- **Override de `size` em slot individual** quebra alinhamento vertical — passe `size` só no group, não nos slots.
