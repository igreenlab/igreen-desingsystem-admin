# Projeto consome @snksergio/design-system

Bootstrappado via `npx @snksergio/create-design-system`. Este arquivo
fornece contexto pro Claude Code / Cursor / agentes AI gerarem UI usando
os padrões do iGreen Design System — sem precisar consultar fontes externas
pra cada decisão.

## Stack
- React 19 + Vite 6 + TypeScript 5.6
- Tailwind CSS v4 (oklch) + @tailwindcss/vite
- Design system: `@snksergio/design-system@^0.5.1`
- Fontes: Geist (sans + mono) via `@font-face` em `src/index.css`

## Como importar

```ts
import { Button, Chip, Avatar, FormField, AlertModal } from "@snksergio/design-system";
import { tokens } from "@snksergio/design-system/tokens";
// Theme CSS + @source pro Tailwind escanear o package já configurados em src/index.css
```

## Componentes principais

| Componente | Quando usar |
|---|---|
| `<Button>` | CTAs (5 colors × 4 variants × 5 sizes). `color="primary"` default. `iconLeft`/`iconRight` aceitam ReactNode |
| `<Chip>` | Status/tags. Mesma API color × variant do Button, sizes `sm`/`md`/`lg` |
| `<Avatar>` | Iniciais ou imagem. `size="xs\|sm\|md\|lg\|xl"`, `color`, `colorHex` (override hex direto) |
| `<Badge>` | Marcador visual pequeno (Shadcn restilizado). API color × variant |
| `<FormField>` | Composto: Label + Input + HelperText + Error. Use em vez de Input solto |
| `<Input>` / `<Textarea>` / `<Select>` | Controles individuais. Prefira via `FormField` |
| `<Card>` | Container com border + shadow padrão |
| `<Dialog>` | Modal padrão (Radix). Use `AlertModal` pra confirmações |
| `<AlertModal>` | Confirmação. `tone="default\|neutral\|danger\|warning\|success"` (NÃO use `"critical"` — é tone do Button, não do AlertModal) |
| `<DropdownMenu>` | Menu contextual |
| `<Tabs>` | Navegação tabular |
| `<DataTable>` | Tabela densa com filter/sort/virtualization/views — peça avançada |
| `<FloatingPanel>` | Drawer non-modal (sem backdrop, sem foco trap) — inspectors/sidebars |
| `<PageHeader>` | Cabeçalho: title + description + badge + actions + slot tabs/filtros |

## Anti-patterns proibidos

```ts
// ❌ Tailwind literal quando existe token DS
gap-4 → gap-gp-md          // (8px)
p-4 → p-sp-md              // (16px)
rounded-lg → rounded-radius-lg
shadow-md → shadow-sh-md

// ❌ Heights fixos
h-9 → min-h-form-md        // (36px)
h-10 → min-h-form-lg       // (40px — desktop default)
h-11 → min-h-form-xl       // (44px — WCAG mobile touch)

// ❌ Ring / focus
ring-ring-primary/30 → ring-ring-primary    // (token já tem alpha 20%)
ring-3 → ring-4                              // (ring-3 não existe no Tailwind)
outline-none → focus-visible:outline-none    // (acessibilidade)

// ❌ Tipografia avulsa
text-xs font-semibold → text-caption-sm font-semibold   // (11/600)
text-sm font-medium → text-body-sm font-semibold         // (13/600)
text-[14px] font-medium → text-body-md font-medium       // (preset + override)

// ❌ Presets REMOVIDOS no typography rewrite 2026-05-19
text-paragraph-* → text-body-*
text-label-* → text-body-* font-semibold OU text-title-*
text-subheading-* → text-title-*
```

## Padrões obrigatórios

```ts
// Focus rings — todo botão/select/chip
focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-{color}

// Form heights
min-h-form-xl   // 44px — WCAG mobile touch
min-h-form-lg   // 40px — desktop default

// Typography roles (6 roles, 23 presets)
text-display-*  // hero (display-2xl/xl/lg/md)
text-heading-*  // títulos de página (heading-xl/lg/md/sm/xs)
text-title-*    // títulos de card/section (title-lg/md/sm — weight 600 default)
text-body-*     // texto corrido + interactive (body-sm 13/500 é o default do projeto)
text-caption-*  // texto auxiliar (caption-md/sm/xs)
text-code-*     // monospace (code-md/sm)

// Override de weight via Tailwind nativo sobre preset
text-body-sm font-semibold  // ✅ (button label típico)
text-title-md font-bold     // ✅
```

## Dark mode

- CSS vars `--color-*` (light) + override em `.dark { }` (dark)
- Aplique `.dark` no `<html>` — componentes consomem via tokens automaticamente
- NÃO use lógica condicional (`theme === "dark"`) em componentes — eles já são theme-aware

## Pipeline completo do DS

Só o build do DS vem via npm. Pipeline de desenvolvimento completo
(6 agents Claude Code, ~24 skills, 5 hooks, rules auto-load, 20 lições
documentadas, audits/specs/histórico de decisões):

→ https://github.com/igreenlab/igreen-desingsystem-admin

Clone se você quer:
- Agents (orchestrator, ds-designer, ds-dev, ds-reviewer)
- Skills invocáveis (`/ds-add-token`, `/ds-create-component`, `/ds-release`)
- Hooks automáticos (lint styles, format-on-save)
- `lessons.md` completo com regras derivadas de erros reais
- Preview app navegável com docs vivas de cada componente
