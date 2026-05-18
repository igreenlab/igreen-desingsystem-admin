# iGreen Design System

Token-first. Stack-agnostic. Agent-ready.

---

## Filosofia

Este design system foi estruturado para funcionar com **ou sem** Tailwind, **com ou sem** Shadcn.
Tailwind e Shadcn são adapters opcionais na camada `transforms/`, não a fundação.

A arquitetura segue o padrão de mercado de 2025 (Material 3, Carbon IBM, Adobe Spectrum, DTCG 2025.10):
três tiers de tokens + camada de transformação plugável.

---

## Estrutura de 3 tiers

```
tokens/brands/default/
│
├── primitives/          Tier 1 — valores raw (API privada)
│   ├── color-palette    Escalas OKLCH: brand, neutral, feedback, alpha
│   ├── scales           Escala espacial: sp(n) = n × 4px
│   ├── fonts            Escala tipográfica: BASE=16, ratio=1.25 (major third)
│   └── motion           Duração + easing
│
├── semantic/            Tier 2 — intenção (API pública)
│   ├── color-light      bg.*, fg.*, border.*, ring.*, overlay.*
│   ├── color-dark       Mesmo contrato, valores dark
│   ├── spacing          space, gap, pad, inset, stack, inline
│   ├── sizing           componentHeight, formHeight, contentGap, iconSize, avatarSize, containerWidth
│   ├── shape            radius.*, borderWidth.*, outline, divider
│   ├── elevation        shadow.light/dark, opacity, blur
│   └── typography       Presets compostos (rem + clamp): display → label → code
│
└── transforms/          Adapters plugáveis (não fazem parte dos tokens)
    ├── to-css-vars      → CSS Custom Properties (sem framework)
    ├── to-tailwind      → tailwind.config v3 + tw-merge-config
    ├── to-tailwind-v4   → CSS @theme tokens (Tailwind v4)
    ├── to-js-theme      → theme object (styled-components, Emotion)
    └── to-dtcg          → .tokens.json (Figma, Tokens Studio, Penpot)
```

---

## Setup por stack

### Sem Tailwind (CSS puro / Next.js / Astro)
```bash
npx ts-node tokens/transforms/to-css-vars.ts > src/styles/tokens.css
```
Importar `tokens.css` no `layout.tsx` ou `globals.css`.
Usar classes como `var(--color-bg-surface)`.

### Com Tailwind v3
```typescript
// tailwind.config.ts
import { buildTailwindTheme } from "@igreen/design-system/transforms/tailwind";
export default { theme: { extend: buildTailwindTheme() } };
```

### Com Tailwind v4
```css
/* globals.css */
@import "./tokens.css";  /* gerado por to-css-vars */
@import "tailwindcss";
@theme {
  --color-bg-surface: var(--color-bg-surface);
  /* ... registrar vars como tokens Tailwind */
}
```

### Com styled-components / Emotion
```typescript
import { lightTheme, darkTheme } from "@igreen/design-system/transforms/js-theme";
// <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
```

### Exportar para Figma
```bash
npx ts-node tokens/transforms/to-dtcg.ts > tokens.tokens.json
# Importar no Tokens Studio (Figma plugin)
```

---

## Agentes de IA

Configurados em `.claude/agents/` (Claude Code) e `.cursor/rules/` (Cursor).

| Agente | Responsabilidade | Modelo |
|--------|-----------------|--------|
| `orchestrator` | Classifica e delega | Sonnet |
| `ds-designer` | Especifica tokens e componentes | Sonnet |
| `ds-dev` | Implementa tokens e componentes | Opus |
| `ds-reviewer` | Valida antes do merge | Sonnet |

Slash commands: `/add-token`, `/create-component`, `/extract-figma`

### Component styles

Componentes usam **Tailwind Variants** (`tv()`) para mapear variantes e estados em classes Tailwind.
Arquivo `*.styles.ts` exporta a função `tv()` configurada; o `.tsx` consome via `buttonVariants({ variant, size })`.

---

## Referências

- [DTCG 2025.10](https://www.designtokens.org/tr/drafts/format/) — formato de tokens
- [Material Design 3](https://m3.material.io/foundations/design-tokens) — sistema de tokens
- [Carbon Design System](https://carbondesignsystem.com/) — nomenclatura e hierarquia
- [WCAG 2.5.5](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) — touch targets
