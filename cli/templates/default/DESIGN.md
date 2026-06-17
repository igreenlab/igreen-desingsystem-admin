# DESIGN.md — guia de construção de telas (iGreen DS)

> Guia **enxuto** pra montar telas neste projeto seguindo o padrão dos showcases
> do iGreen DS. Não re-documenta cada componente — pra API de um componente, leia
> o `USAGE.md` ao lado dele (`src/components/ui/<Nome>/USAGE.md`). Aqui ficam as
> decisões de **composição, espaçamento e responsividade** que não estão em
> nenhum USAGE isolado.
>
> **Para a IA:** ao montar qualquer tela, siga este arquivo + o `USAGE.md` do
> componente + o **exemplo** mais próximo. Nunca invente API nem espaçamento.

---

## Regra de ouro

1. **Não comece do zero.** Puxe o exemplo mais próximo (`npm run igreen:add -- example-<x>`) e adapte. Os exemplos são extrações 1:1 dos showcases de produção.
2. **Leia o `USAGE.md`** do componente antes de usar (variantes, props, gotchas).
3. **Classe DS antes de Tailwind literal** (ver Do/Don't).
4. **Não edite os tokens** — consuma via classes (`bg-bg-brand`, `text-fg-default`, `gap-gp-md`...).

---

## Atmosfera

iGreen é um **CRM/operações vestindo uniforme de energia sustentável**: telas densas (tabelas, forms, kanban), canvas branco, **verde de marca** (`#00803C`) como acento que sinaliza "ação", fonte **Geist**, corpo interativo em **13px/500** (`body-sm`). Cinza domina; verde é acento de carga. Sem gradiente, sem glass, sem animação decorativa. Workspace, não landing page.

---

## Anatomia de uma tela (o que mais importa)

Toda página segue este esqueleto. O exemplo é o `FinanceScreen`/`ClientesScreen`:

```tsx
// O conteúdo da página vive dentro do seu AppShell/layout, que dá a altura.
<div className="flex flex-col h-full min-h-0 gap-gp-2xl">
  <PageHeader title="..." description="..." badge={...} actions={...} />
  {/* 24px (gap-gp-2xl) entre o PageHeader e o próximo bloco — NUNCA grudado */}
  <DataTable ... className="flex-1 min-h-0" />   {/* ou Card / Tabs / grid de KPIs */}
</div>
```

**Ritmo de espaçamento (decorar):**

| Onde | Classe | Valor |
|---|---|---|
| PageHeader → conteúdo | `gap-gp-2xl` | 24px |
| Entre fields de um form | `gap-form-gap` | 20px |
| Entre cards / KPIs | `gap-gp-md` | 8–16px (use `gap-gp-md`/`gap-gp-lg`) |
| Padding interno de card | `p-pad-card-base` (ou `p-pad-2xl`) | 24px |
| Gutter da página | herdado do AppShell | — |
| Ícone → texto | `gap-gp-xs` / `gap-gp-sm` | 4–6px |

> A tela é **densa, não apertada**: 24px é o respiro padrão entre blocos; 8px entre label e input. Espaçamento sempre via token (`gap-gp-*`, `p-pad-*`), nunca px avulso.

---

## Cores e tokens (referência rápida)

Os tokens já estão no `src/styles/theme/tailwind-theme.css`. Use pelos nomes semânticos — nunca hex:

| Intenção | Classe |
|---|---|
| Ação principal / CTA | `bg-bg-brand text-fg-on-brand` |
| Texto de marca / ghost | `text-fg-brand` |
| Texto padrão | `text-fg-default` · secundário `text-fg-muted` · sutil `text-fg-subtle` |
| Superfície / card | `bg-bg-surface` · página `bg-bg-canvas` |
| Borda | `border-border-default` · sutil `border-border-subtle` · input `border-border-input` |
| Destrutivo | `bg-bg-danger` / `text-fg-danger` (na API de componentes a cor chama `critical`) |
| Sucesso / aviso / info | `*-success` / `*-warning` / `*-info` (info é roxo, **não** azul) |
| Foco | `focus-visible:ring-4 focus-visible:ring-ring-brand` (o ring já tem alpha) |

Dark mode é automático (os tokens trocam sob `.dark`). Não escreva lógica condicional de tema.

---

## Tipografia

- **`text-body-sm` (13/500) é o default interativo** — botões, inputs, células de tabela, dropdowns.
- Presets por papel: `display-*` / `heading-*` / `title-*` / `body-*` / `caption-*` / `code-*`. Title default = 600.
- Override de peso via Tailwind: `text-title-md font-bold`. **Nunca** invente preset nem use `text-xs font-semibold` avulso → use o preset (`text-body-xs`, `text-caption-md`).

---

## Mapa intenção → o que puxar

| O usuário quer… | Caminho |
|---|---|
| "tabela / lista / crud / grid de dados" | **Skill** `/ds-create-crud` (entrevista guiada) — ou puxar `example-clientes` e adaptar |
| "tela de edição / cadastro / formulário" | `example-edit-page` + componente `FormField` |
| "detalhamento / detalhe / ficha (com abas)" | `example-order-detail` |
| "dashboard / painel / KPIs / gráficos" | `example-dashboard` (+ `USAGE` do `Chart`) |
| "financeiro / extrato / saldo" | `example-finance` |
| "drawer de criar/editar/detalhe" | padrão dos drawers do `example-finance` (NovoClienteDrawer / FinanceDetailPanel) — ver `.claude/skills/ds-kit` |
| "cabeçalho de página" | componente `PageHeader` |
| "shell / menu lateral / topbar" | `app-shell` / `menu-sidebar` / `header` |

Puxe com `npm run igreen:add -- <item>`. A IA roteia isso automaticamente via o orquestrador (`.claude/skills/ds-kit`).

---

## ✅ Do / ❌ Don't (anti-patterns)

```
❌ gap-4        → ✅ gap-gp-md           ❌ p-4      → ✅ p-sp-md / p-pad-2xl
❌ rounded-lg   → ✅ rounded-radius-lg   ❌ shadow-md→ ✅ shadow-sh-md
❌ h-9 / h-10   → ✅ min-h-form-md / min-h-form-lg (36/40px) · 44px = min-h-form-xl (WCAG mobile)
❌ ring-3 / ring-ring-brand/30 → ✅ ring-4 / ring-ring-brand (alpha já embutido)
❌ outline-none → ✅ focus-visible:outline-none
❌ text-[14px] / text-sm font-medium → ✅ text-body-md font-medium (preset)
❌ <label> cru em form → ✅ <FormField> (label + erro + helper + dark-mode corretos)
❌ scale(0.95) no clique → ✅ feedback por mudança de bg/border (workspace, não app)
❌ cor hex em className → ✅ token semântico
```

- Form com 2+ campos → `<FormField>` + `gap-form-gap`.
- Botão destrutivo → `<Button color="critical">`. CTA único por contexto = único `filled`.
- Sempre que o pai precisa de altura (tabela com `flex-1`), o wrapper é `flex flex-col h-full min-h-0`.

---

## Responsividade

- Mobile <640px: gutter 16px; FloatingPanel/Sheet vira sheet full; PageHeader empilha ações em overflow; DataTable rola horizontal.
- Touch: CTA primário mobile = `min-h-form-xl` (44px). Desktop default = `min-h-form-lg` (40px).
- Containers: conteúdo capa em `max-w-container-lg` (1024) / `xl` (1280) conforme densidade.
- Os exemplos já são responsivos — herde o comportamento deles ao adaptar.

---

## Como crescer este guia

Novo padrão de tela recorrente → adicione uma seção curta aqui + (se for fluxo guiado) uma skill em `.claude/skills/` + 1 linha no mapa de intenção. Mantenha cada peça pequena: este arquivo é guia de composição, o `USAGE.md` é a API, o exemplo é a referência viva.
