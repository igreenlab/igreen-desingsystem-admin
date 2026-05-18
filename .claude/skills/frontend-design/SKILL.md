---
name: igreen-frontend
description: >
  Skill específica do iGreen DS. Substituiu a skill genérica frontend-design
  que conflitava com o DS (fonts não-Inter, gradients, layouts assimétricos).
  Ativar quando criar páginas, telas, blocos ou componentes dentro do iGreen DS.
---

# iGreen DS — Frontend Skill

Esta skill guia a criação de interfaces dentro do iGreen Design System.
Não usar para projetos externos ao iGreen.

## Princípio central

O iGreen DS é um CRM/admin. O objetivo é **clareza e consistência**, não originalidade visual.
Todo desvio estético precisa de justificativa funcional.

## Antes de qualquer código

1. Ler `CLAUDE.md` — arquitetura e regras
2. Ler `.ai/status/lessons.md` — erros já cometidos
3. Ler `.claude/rules/ds-standards.md` — regras resumidas
4. Verificar `.ai/context/components/inventory.md` — o que existe (não recriar)

## Tokens — usar sempre

```typescript
// Cores
bg-bg-primary        bg-bg-surface       bg-bg-muted
text-fg-foreground   text-fg-muted       text-fg-on-primary
border-border-main   border-border-primary

// Spacing
gap-gp-md     px-pad-lg     p-sp-md    p-pad-card-base

// Sizing
min-h-form-lg   min-h-form-xl   size-icon-md   rounded-radius-base

// Shadow
shadow-sh-sm   shadow-sh-md   shadow-sh-lg

// Typography — presets compostos
text-label-sm   text-paragraph-md   text-heading-sm   text-title-md
```

## O que NÃO fazer no iGreen DS

```typescript
// ❌ Fonts não-Inter/sistema
font-family: "Space Grotesk", "Satoshi", fontes decorativas

// ❌ Gradients decorativos
background: linear-gradient(135deg, ...)

// ❌ Layouts assimétricos, diagonal, "editorial"
// CRM precisa de grid previsível e denso

// ❌ Animações elaboradas
// Micro-interactions sim, page-load dramaticos não

// ❌ Hardcode de cor, tamanho, sombra
// Sempre via tokens DS
```

## Estrutura de página/tela

```tsx
// Página com sidebar + content
<div className="flex min-h-screen bg-bg-canvas">
  <aside className="w-[var(--container-sidebar-md)] bg-bg-surface border-r border-border-main" />
  <main className="flex-1 p-pad-page-base">
    <div className="max-w-container-xl mx-auto">
      {/* conteúdo */}
    </div>
  </main>
</div>

// Seção com card
<div className="p-pad-card-base bg-bg-surface rounded-radius-xl shadow-sh-sm border border-border-main">
  {/* conteúdo do card */}
</div>

// Header de seção
<div className="flex items-center justify-between gap-gp-xl mb-sp-lg">
  <h2 className="text-heading-2xs">Título</h2>
  <Button size="sm">Ação</Button>
</div>
```

## Hierarquia visual iGreen

```
bg-bg-canvas      ← fundo da página
bg-bg-surface     ← cards, painéis, sidebar
bg-bg-muted       ← inputs em repouso, áreas secundárias
bg-bg-subtle      ← hover states, faixas alternadas de tabela
```

## Componentes disponíveis

Verificar `.ai/context/components/inventory.md` antes de criar qualquer componente.
21 componentes implementados — usar sempre antes de criar do zero.

## Dark mode

Sempre verificar que layout funciona em dark mode via CSS vars.
Não adicionar lógica condicional de tema nos componentes.
