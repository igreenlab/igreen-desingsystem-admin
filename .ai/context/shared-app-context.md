# Contexto compartilhado — iGreen App

> 🚧 **AGUARDANDO FLUXO DE DESENVOLVIMENTO**
>
> Este arquivo será preenchido quando o time iniciar o desenvolvimento de telas.
> A estrutura existe para que os agentes App Designer e App Dev React
> tenham um contexto consistente do produto.
>
> Não remover — preencher progressivamente conforme o app evolui.

---

## O que é o iGreen App

> ⚠️ Preencher: descrição do produto, objetivo, público-alvo

```
Tipo: app desktop (não mobile)
Stack: Vite + React + TypeScript + Tailwind v4
DS: iGreen DS (todos os componentes em src/components/)
```

---

## Layout padrão do app

> ⚠️ Preencher: confirmar estrutura real após primeira tela implementada

```tsx
// Proposta — confirmar com o time
<div className="flex min-h-screen bg-bg-canvas">

  {/* Sidebar */}
  <aside className="w-[var(--container-sidebar-md)] bg-bg-surface
                    border-r border-border-main flex flex-col shrink-0">
    {/* Logo */}
    {/* Nav items */}
    {/* User area */}
  </aside>

  {/* Main */}
  <main className="flex-1 flex flex-col overflow-hidden">

    {/* Top bar */}
    <header className="min-h-layout-navbar bg-bg-surface
                       border-b border-border-main px-pad-page-base
                       flex items-center justify-between shrink-0">
    </header>

    {/* Page content */}
    <div className="flex-1 overflow-auto p-pad-page-base">
      <div className="max-w-container-xl mx-auto">
        {/* conteúdo da página */}
      </div>
    </div>

  </main>
</div>
```

---

## Inventário de páginas

> ⚠️ Preencher quando as telas forem definidas

| Página | Rota | Status | Componentes DS usados |
|--------|------|--------|----------------------|
| — | — | — | — |

---

## Convenções de rota

> ⚠️ Preencher: definir padrão de roteamento (React Router, TanStack Router, etc.)

```
/               → Dashboard
/[entidade]     → Listagem
/[entidade]/:id → Detalhe
/settings       → Configurações
```

---

## Padrões de tela recorrentes

> ⚠️ Preencher conforme telas forem implementadas

### Página de listagem
```
Header (título + ação primária)
Filtros / busca
Tabela ou grid de cards
Paginação
```

### Página de detalhe / edição
```
Breadcrumb
Header (título + ações)
Formulário ou painel de informações
Rodapé com ações (salvar, cancelar)
```

### Modal de confirmação
```
Dialog com título descritivo
Mensagem curta
Ação destrutiva (critical) + cancelar (ghost)
```

---

## Regras para App Dev React

1. **Nunca criar componentes** — usar sempre `src/components/` do DS
2. Se precisar de componente inexistente → sinalizar Orchestrator → pipeline DS
3. Zero hardcode — todos os valores via tokens DS
4. Layout base via tokens: `w-[var(--container-sidebar-md)]`, `p-pad-page-base`, etc.
5. Dark mode automático via CSS vars — sem lógica condicional

---

## Cascata cross-domínio — regra crítica

```
App Designer identifica que tela precisa de <ComponenteX>
  ↓
ComponenteX existe em component-inventory.md?
  Sim → continuar spec da tela
  Não → sinalizar Orchestrator
         ↓
         Orchestrator pausa Domínio App
         Aciona pipeline DS completo para criar ComponenteX
         ↓
         Após DS Reviewer aprovar ComponenteX
         Orchestrator retoma Domínio App
```
