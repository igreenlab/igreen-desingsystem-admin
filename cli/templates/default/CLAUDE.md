# Projeto consome o iGreen Design System (via registry shadcn)

Bootstrappado via `npx @snksergio/create-design-system`. Contexto pro Claude
Code / Cursor / agentes gerarem UI nos padrões do iGreen DS.

## Modelo de consumo — registry shadcn (copy-in), NÃO npm

Os componentes do DS são **copiados pro seu projeto** via `shadcn add @igreen/<nome>`
(viram código seu, em `src/components/ui/`). NÃO existe `import ... from "@snksergio/design-system"`.

```bash
# 1. token do registry privado no .env.local (peça ao mantenedor)
cp .env.local.example .env.local   # cole o IGREEN_TOKEN

# 2. puxe componentes sob demanda — PREFIRA o wrapper (mantém o manifesto):
npm run igreen:add -- button form-field card badge dialog
#   (equivale a `npx shadcn add @igreen/<x>` + registra rev/hash no manifesto)

# 3. valide integridade/defasagem (use em CI):
npm run igreen:drift
```

> **Manifesto + drift:** `npm run igreen:add` grava cada componente (rev + hash) em
> `.igreen-ds/manifest.json` (commite-o). `npm run igreen:drift` falha (exit 1) se
> algum componente foi **editado localmente** e avisa se está **defasado** vs o registry.
> `npm run doctor` valida o `cn`/`tv` contra o registry. Pode usar `npx shadcn add`
> direto, mas aí o manifesto não acompanha (o drift acusaria como não-gerenciado).

```tsx
// import sempre via alias @/ (copy-in), nunca de package npm
import { Button } from "@/components/ui/Button";
import { FormFieldInput } from "@/components/ui/FormField";
```

### Já vem configurado (não mexa sem motivo)
- `src/lib/utils.ts` (`cn`) e `src/utils/tv.ts` (`tv`) — **configurados pros prefixos
  DS** (pad/sp/gp/radius/sh/form) + presets tipográficos (L-016). Se sobrescrever pelo
  cn padrão do shadcn, a resolução de classe quebra em silêncio. `npm run doctor` valida.
- `src/styles/theme/tailwind-theme.css` — tokens OKLCH, importado no `index.css` ANTES
  dos componentes.
- `components.json` — registry `@igreen` + Bearer já apontados.

### Catálogo de componentes (`@igreen/<nome>`)
Primitivos: `button` `input` `label` `textarea` `select` `card` `badge` `separator`
`checkbox` `accordion` `alert` `alert-dialog` `avatar` `breadcrumb` `calendar` `command`
`dialog` `dropdown-menu` `input-group` `pagination` `popover` `progress` `radio-group`
`sheet` `slider` `switch` `tabs`.
Composites: `form-field` `alert-modal` `button-group` `floating-panel` `modal` `panel`
`footer-table` `kanban` `combobox` `card-checkbox` `chip` `icon` `page-header` `avatar-ig`.
App-level: `chart` `table` `menu-sidebar` `header` `app-shell`.

## Anti-patterns proibidos

```ts
// ❌ Tailwind literal quando existe token DS
gap-4 → gap-gp-md          p-4 → p-sp-md
rounded-lg → rounded-radius-lg   shadow-md → shadow-sh-md
// ❌ Heights fixos
h-9 → min-h-form-md   h-10 → min-h-form-lg   h-11 → min-h-form-xl (WCAG mobile)
// ❌ Ring / focus
ring-ring-primary/30 → ring-ring-primary   ring-3 → ring-4
outline-none → focus-visible:outline-none
// ❌ Tipografia avulsa
text-sm font-medium → text-body-sm font-semibold
text-[14px] → text-body-md
```

## Padrões obrigatórios

```ts
focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-{color}
min-h-form-lg   // 40px desktop default · min-h-form-xl 44px mobile
// Typography (6 roles): display / heading / title / body / caption / code
// body-sm (13/500) = default do projeto · title weight 600 default
text-body-sm font-semibold   // override de weight sobre preset
```

## Dark mode
CSS vars `--color-*` (light) + `.dark { }` (dark). Aplique `.dark` no `<html>` —
componentes consomem tokens, sem lógica condicional de tema.

## Pipeline completo do DS
→ https://github.com/snksergio/igreen-admin-desingsystem
