---
name: spec-component
description: >
  Especificar componente novo para o DS (variantes, sizes, estados).
  Gate obrigatório antes da implementação.
---

# DS Designer — Spec de componente

> **Leitura obrigatória.** Abra este arquivo com a tool **Read** — é sub-arquivo da skill `ds-designer`, e `ds-create-component` é um COMMAND, não uma skill: o Skill tool não resolve nenhum dos dois. ANTES de produzir qualquer spec — não confie em memória de sessão anterior. O template Strategist abaixo deve ser literalmente seguido.

## Antes de especificar

```
1. Verificar `.ai/context/components/inventory.md` — componente já existe?
   Sim → PARAR. Não duplicar.
2. Tem lógica interativa (modal, dropdown, foco, portal)? → Cenário 1 (Shadcn)
3. Tokens necessários existem?
   Não → criar tokens primeiro via `/ds-add-token` antes de especificar o componente
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
- sm: [min-h-form-* px-pad-* gap-gp-* rounded-radius-* text-body-sm font-semibold]
- md: [min-h-form-* px-pad-* gap-gp-* rounded-radius-* text-body-sm font-semibold]

⛔ **`text-label-*` NÃO existe** — removido no rewrite de tipografia de 2026-05-19 (L-019).
Os 7 roles atuais: `display` · `heading` · `title` · `body` · `caption` · `stat` · `code`.
Peso via override Tailwind sobre o preset (`text-body-sm font-semibold`).

> Este template prescreveu o preset morto até 2026-08-17 — quem o seguisse escrevia spec
> cujas classes não emitem CSS. O gate `dead-theme-classes` **não pega**: ele cobre classe
> de COR, e preset tipográfico não casa o padrão `text-fg-*`. Achado por dogfood.

**Estados visuais:**
- default: [classes DS]
- hover: [classes DS]
- focus: [ver padrão abaixo]
- disabled: `pointer-events-none opacity-50` (SEMPRE por último — L-006).
  Não existe `bg.disabled` nem `border.disabled`; só `fg.disabled`. O padrão do DS
  é opacidade, não paleta de desabilitado.

**Focus ring — especificar onde cada parte vai:**
- Botão/select/checkbox → Padrão 1:
  base:          focus-visible:outline-none
  color.primary: focus-visible:ring-4 focus-visible:ring-ring-brand
  color.danger: focus-visible:ring-4 focus-visible:ring-ring-danger
  (cada cor usa seu próprio ring token — ring NÃO vai no base)

- Input/textarea → Padrão 2:
  base:  ring-0 ring-ring-brand + transition-[...,box-shadow,...]
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
  bg-bg-subtle, border-border-default, text-fg-default, text-fg-muted
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
