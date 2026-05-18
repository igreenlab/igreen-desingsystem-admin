---
name: spec-component
description: >
  Especificar componente novo para o DS (variantes, sizes, estados).
  Gate obrigatório antes da implementação.
---

# DS Designer — Spec de componente

> **Skill obrigatória.** Carregue este arquivo via `SkillTool` (skill: `ds-create-component` no fluxo de spec) ANTES de produzir qualquer spec — não confie em memória de sessão anterior. O template Strategist abaixo deve ser literalmente seguido.

## Antes de especificar

```
1. Verificar component-inventory.md — componente já existe?
   Sim → PARAR. Não duplicar.
2. Tem lógica interativa (modal, dropdown, foco, portal)? → Cenário 1 (Shadcn)
3. Tokens necessários existem?
   Não → criar tokens primeiro via /add-token antes de especificar o componente
   Só após tokens aprovados → continuar com a spec do componente
```

## Estrutura da spec — adaptar ao componente

A spec não precisa ter 5 cores + 4 variantes obrigatoriamente.
Especificar apenas o que o componente realmente precisa.

```markdown
## Spec: [NomeComponente]

**Tipo:** iGreen ui/ | Shadcn shadcn/ | Composto ui/

**Variantes** (só as que fazem sentido):
- color: [listar apenas as relevantes, ou omitir se não se aplica]
- variant: [listar apenas as relevantes]
- size: [listar apenas as relevantes]

**Tamanhos** (tokens DS — NUNCA Tailwind literal):
- sm: [min-h-form-* px-pad-* gap-gp-* rounded-radius-* text-label-*]
- md: [min-h-form-* px-pad-* gap-gp-* rounded-radius-* text-label-*]

**Estados visuais:**
- default: [classes DS]
- hover: [classes DS]
- focus: [ver padrão abaixo]
- disabled: bg-bg-disabled text-fg-disabled (SEMPRE por último)

**Focus ring — especificar onde cada parte vai:**
- Botão/select/checkbox → Padrão 1:
  base:          focus-visible:outline-none
  color.primary: focus-visible:ring-4 focus-visible:ring-ring-primary
  color.danger: focus-visible:ring-4 focus-visible:ring-ring-danger
  (cada cor usa seu próprio ring token — ring NÃO vai no base)

- Input/textarea → Padrão 2:
  base:  ring-0 ring-ring-primary + transition-[...,box-shadow,...]
  focus: focus-visible:ring-4

**Perspectiva Strategist:** (obrigatório — usado pelo Orchestrator no gate)
- Alternativas descartadas: [ex: "Shadcn não tem base equivalente porque X"] ou "nenhuma — único caminho viável"
- Assumption central: [ex: "não existe composto existente que combine Input + Label desta forma"]
```

## Exemplos por tipo de componente

### Componente com múltiplas cores (Button, Badge)
```markdown
color: primary | secondary | danger | success | warning
variant: filled | outline | soft | ghost
```
Usar tabela de tokens por variant:

| variant | tokens |
|---------|--------|
| filled | `bg-bg-{cor}` + `text-fg-on-{cor}` + `hover:bg-bg-{cor}-hover` |
| outline | `bg-bg-surface` + `border-border-{cor}` + `text-fg-{cor}` |
| soft | `bg-bg-{cor}-subtle` + `text-fg-{cor}` |
| ghost | `bg-transparent` + `text-fg-{cor}` + `hover:bg-bg-{cor}-subtle` |

### Componente utilitário simples (Separator, Label, Avatar)
```markdown
variant: horizontal | vertical  (ou size: sm | md | lg)
Sem color variants — usar tokens neutros diretos:
  bg-border-main, text-fg-foreground, text-fg-muted
```

### Componente composto (FormField, SearchInput)
```markdown
Expor props: id, label, helperText, errorMessage, required
Estados: hasError (true/false) — via prop, não via color variant
Focus: herda do componente-base (Input usa Padrão 2)
Acessibilidade: htmlFor, aria-describedby, aria-invalid
```

## O que NÃO fazer na spec

- Não especificar código TypeScript
- Não usar Tailwind literal (`rounded-lg`, `gap-4`, `shadow-md`)
- Não usar `border.*` para focus ring — usar `ring.*`
- Não criar `*.tokens.ts` — descontinuado
- Não assumir que todo componente precisa de 5 cores
- Não listar tokens faltantes como "DS Dev vai resolver" — criar tokens antes de especificar
- Não especificar ring no base — ring vai em cada color variant (Padrão 1)
- Não omitir Perspectiva Strategist — é obrigatória para o gate funcionar
