---
name: app-designer-skill
status: PENDING — aguardando primeira tela real do app
description: >
  🚧 Skill do App Designer. Não operacional.
  Será preenchida quando o time iniciar o desenvolvimento de telas.
---

# App Designer Skill — 🚧 AGUARDANDO

## Router (a preencher após primeira tela)

| Tarefa | Sub-skill |
|--------|-----------|
| Nova tela do app | `screen.md` (a criar) |
| Novo fluxo de navegação | `flow.md` (a criar) |
| Redesign de tela existente | `screen.md` (a criar) |
| Layout de página | `layout.md` (a criar) |

## O que esta skill conterá quando operacional

- **screen.md** — como especificar uma tela: layout, hierarquia, estados (vazio, loading, erro, sucesso)
- **flow.md** — como especificar fluxos de navegação e transições
- **layout.md** — estrutura de página desktop (sidebar, main, header, panels)
- **components.md** — como verificar e referenciar componentes DS existentes na spec

## Referência de estrutura de página (provisória)

```typescript
// Layout base do app desktop — confirmar com o time na primeira tela
<div className="flex min-h-screen bg-bg-canvas">
  <aside className="w-[var(--container-sidebar-md)] bg-bg-surface border-r border-border-main" />
  <main className="flex-1 flex flex-col overflow-hidden">
    <header className="min-h-layout-navbar bg-bg-surface border-b border-border-main px-pad-page-base" />
    <div className="flex-1 overflow-auto p-pad-page-base">
      <div className="max-w-container-xl mx-auto">{/* conteúdo */}</div>
    </div>
  </main>
</div>
```

## Como ativar esta skill

1. Construir primeira tela manualmente
2. Documentar decisões de layout em `shared-app-context.md`
3. Extrair padrões recorrentes para sub-skills aqui
