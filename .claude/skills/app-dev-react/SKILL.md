---
name: app-dev-react-skill
status: PENDING — aguardando primeira tela real do app
description: >
  🚧 Skill do App Dev React. Não operacional.
  Será preenchida quando o time iniciar o desenvolvimento de telas.
---

# App Dev React Skill — 🚧 AGUARDANDO

## Router (a preencher após primeira tela)

| Tarefa | Sub-skill |
|--------|-----------|
| Implementar tela nova | `screen.md` (a criar) |
| Implementar feature com lógica | `feature.md` (a criar) |
| Implementar layout compartilhado | `layout.md` (a criar) |
| Editar tela existente | `screen.md` (a criar) |

## O que esta skill conterá quando operacional

- **screen.md** — estrutura de arquivo de tela, como importar componentes DS, padrões de composição
- **feature.md** — estrutura de feature com hooks e services
- **layout.md** — AppLayout, templates de página
- **data.md** — integração com backend, padrões de fetch e loading states

> ⚠️ Stack de dados a definir na primeira sessão de desenvolvimento real.

## Regra de ouro (já válida mesmo sem skill)

```
NUNCA criar componentes novos diretamente.
Se tela precisar de componente ausente no DS:
→ PARAR
→ Sinalizar AO ORCHESTRATOR: "CASCATA cross-domínio: componente [X] necessário para [tela]"
→ Aguardar pipeline DS completo → retomar tela
```

## Estrutura de arquivo esperada (provisória — confirmar na primeira tela)

```
src/
├── pages/
│   └── [nome]/
│       ├── index.tsx
│       ├── [nome].page.tsx
│       └── components/      ← componentes específicos desta página (não reutilizáveis)
├── features/
│   └── [nome]/
│       ├── index.ts
│       ├── [nome].hooks.ts
│       └── [nome].service.ts
└── layouts/
    ├── AppLayout.tsx
    └── AuthLayout.tsx
```

> ⚠️ Estrutura acima é proposta — confirmar e ajustar na primeira sessão.

## Tokens de layout a usar (já definidos)

```typescript
// Sidebar
"w-[var(--container-sidebar-md)]"   // 280px
"bg-bg-surface border-r border-border-main"

// Main content
"flex-1 p-pad-page-base overflow-auto"

// Page header
"flex items-center justify-between gap-gp-xl"

// Content max-width
"max-w-container-xl mx-auto"
```

## Como ativar esta skill

1. Construir primeira tela manualmente
2. Documentar padrões recorrentes em `shared-app-context.md`
3. Definir stack de dados e extrair para `data.md`
4. Extrair padrões de tela para sub-skills aqui
