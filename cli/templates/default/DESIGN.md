# DESIGN.md — guia de construção de telas (iGreen DS)

> Guia **enxuto** pra montar telas no padrão dos showcases do iGreen DS. Você
> (consumidor) **já tem os componentes** em `src/components/ui/` — então este
> arquivo NÃO re-documenta API de componente (isso é o `USAGE.md` ao lado de cada
> um). Aqui ficam as decisões de **composição, espaçamento, cor e
> responsividade** que não cabem num USAGE isolado.
>
> **Para a IA:** ao montar qualquer tela → siga este arquivo + o `USAGE.md` do
> componente + o **exemplo** mais próximo. O orquestrador `.claude/skills/ds-kit`
> escolhe a rota. Nunca invente API, cor ou espaçamento.

---

## Regra de ouro

1. **Não comece do zero.** Puxe o exemplo mais próximo (`npm run igreen:add -- example-<x>`) e adapte — são extrações 1:1 dos showcases de produção.
2. **Leia o `USAGE.md`** do componente antes de usar (variantes, props, gotchas).
3. **Classe DS antes de Tailwind literal** (ver Do/Don't).
4. **Não edite tokens** — consuma via classe semântica (`bg-bg-brand`, `text-fg-default`, `gap-gp-md`).

---

## 1. Atmosfera

CRM/operações vestindo uniforme de energia sustentável: telas **densas** (tabelas, forms, kanban), canvas branco, **verde de marca** `#00803C` como acento que sinaliza "ação" (usado com parcimônia — o sistema é majoritariamente cinza). Fonte **Geist**; corpo interativo **13px/500** (`body-sm`) — lê mais "encorpado" que texto de leitura, é o que dá a densidade confiante. Radius padrão 10px. **Sem gradiente, sem glass, sem animação decorativa, sem `scale()` no clique.** Workspace, não landing page.

---

## 2. Anatomia de uma tela (o que mais importa)

Toda página segue este esqueleto (veja `FinanceScreen`/`ClientesScreen`):

```tsx
// Conteúdo da página vive dentro do seu AppShell/layout, que dá a altura.
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
| Entre cards / KPIs | `gap-gp-md` / `gap-gp-lg` | 8–12px |
| Padding interno de card | `p-pad-card-base` / `p-pad-2xl` | 24px |
| Seção major | `gap-gp-6xl` | 32px |
| Ícone → texto | `gap-gp-xs` / `gap-gp-sm` | 4–6px |

> Densa, **não apertada**: 24px é o respiro padrão entre blocos; 8px entre label e input. Espaçamento sempre via token, nunca px avulso. Divisória (`border-border-subtle`) entre seções heterogêneas (toolbar/tabela/footer); whitespace puro entre homogêneas (lista de cards).

### Tokens de componente (use o ESPECÍFICO, não valor genérico)

O DS tem tokens orientados a composição — prefira-os a `h-10`/`gap-4`/`size-5`. Caia no genérico (`gp`/`sp`/`pad`) só pro que não tem token de componente.

| Família | Classes | Quando usar |
|---|---|---|
| **Altura de form** | `min-h-form-xs`(28) `sm`(32) `md`(36) `lg`(40 ⭐) `xl`(44) | Botões, inputs, selects, chips. `lg`=desktop default · `xl`=touch WCAG mobile. Nunca `h-9`/`h-10`. |
| **Gap de form** | `gap-form-gap`(20) | Entre fields de um formulário (vertical ou grid). Nunca `gap-gp-*` em form. |
| **Ícone** | `size-icon-2xs`(8) `xs`(12) `sm`(16) `md`(20 ⭐) `lg`(24) `xl`(32) `2xl`(40) | Tamanho de ícone. Nunca `size-5`/`w-4 h-4`. |
| **Padding de card** | `p-pad-card-base`(24 ⭐) `p-pad-card-sm`(16) | Padding interno de Card/Panel/Modal/Drawer. |
| **Gutter de página** | `px-pad-page-sm`(16, mobile) `base`(24) `lg`(40, wide) | Margem lateral do conteúdo (o AppShell normalmente já aplica). |
| **Altura de chrome** | `h-layout-navbar`(64) `h-layout-toolbar`(48) `h-layout-tab-bar`(56) `h-layout-header-{sm,md,lg}` | Topbar, toolbar de tabela, tab-bar mobile, hero de página. |
| **Largura/container** | `max-w-container-{lg,xl,2xl}`(1024/1280/1440) · `max-w-container-drawer-{sm,md,lg}` · `max-w-container-dropdown-*` | Cap de conteúdo / largura de drawer/dropdown. Nunca `max-w-md`. |
| **Genéricos** | `gap-gp-*` (gaps) · `p-sp-*` (margin/offset) · `px-pad-*` (padding) | Só quando não há token de componente acima. |

Regra: **se existe token de componente pra aquilo (form/icon/padCard/padPage/layout/container), use ele**; o genérico é fallback.

---

## 3. Cores e tokens

Tokens já vivem em `src/styles/theme/tailwind-theme.css`. Use pelos nomes semânticos — **nunca hex**. Dark mode é automático (tokens trocam sob `.dark`; sem lógica condicional de tema).

**Contrato de 4 papéis** (marca e cada status seguem o mesmo): `{cor}` · `{cor}-subtle` · `{cor}-hover` · `{cor}-subtle-hover`. Não invente tinta intermediária.

| Intenção | Classe |
|---|---|
| Ação principal / CTA | `bg-bg-brand text-fg-on-brand` (hover `bg-bg-brand-hover`) |
| Texto de marca / ghost | `text-fg-brand` · ativo/seleção `bg-bg-brand-subtle` |
| Texto | padrão `text-fg-default` · secundário `text-fg-muted` · sutil `text-fg-subtle` |
| Superfície | card `bg-bg-surface` · página `bg-bg-canvas` (separação por borda+sombra, não por bg) |
| Borda | `border-border-default` · sutil `border-border-subtle` · input `border-border-input` |
| Destrutivo | `bg-bg-danger`/`text-fg-danger` — **na API de componentes a cor chama `critical`** |
| Sucesso / aviso / info | `*-success` / `*-warning` / `*-info` |
| Foco | `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-{color}` (ring já tem alpha) |

- **Sem azul no sistema.** `info` é **roxo** de propósito (mensagens informativas) — não use azul pra nada.
- `warning` é claro → texto sobre ele é preto (`fg-on-warning`).

---

## 4. Tipografia

- **`text-body-sm` (13/500) é o default interativo** — botões, inputs, células, dropdowns.
- 6 papéis: `display-*` / `heading-*` / `title-*` / `body-*` / `caption-*` / `code-*`. Title default = 600; body de leitura = 400; interativo = 500.
- Tracking sempre negativo/zero. Override de peso via Tailwind (`text-title-md font-bold`). **Nunca** invente preset nem use `text-xs font-semibold` avulso → use o preset (`text-body-xs`, `text-caption-md`).

---

## 5. Profundidade

- Sombras em **2 camadas** (ambiente + chave); `shadow-sh-{sm,md,lg,xl,2xl}`. Modal = `2xl`. Drawer lateral = `sh-aside` (direcional).
- **Dark mode troca sombra por borda hairline** — não force sombra no escuro.
- Foco é `ring` (box-shadow), não muda layout. Ring já vem com alpha — nunca `/30`, nunca `ring-3`.

---

## 6. Mapa intenção → o que puxar / qual skill

A IA roteia isso automaticamente via `.claude/skills/ds-kit`. Resumo:

| O usuário quer… | Rota | Âncora |
|---|---|---|
| tabela / lista / crud / grid de dados | **skill `crud-builder`** (`/ds-create-crud`, entrevista guiada) | `example-clientes` |
| tela de edição / cadastro / formulário | skill `page-edit` | `example-edit-page` + `FormField` |
| detalhe / detalhamento / ficha (abas) | skill `page-detail` | `example-order-detail` |
| dashboard / painel / KPIs | skill `dashboard` | `example-dashboard` |
| gráfico (barras/linha/área/pizza) | skill `charts` | `Chart/USAGE.md` + `example-dashboard` |
| financeiro / extrato / saldo | (exemplo direto) | `example-finance` |
| chat / inbox / conversas | skill `chat` | `example-chat` |
| drawer de criar/editar/detalhe | skill `drawers` | drawers do `example-finance` |
| cards / blocos / painéis soltos | skill `cards` | `Card`/`Panel` + showcase hospedado |
| cabeçalho de página | componente | `PageHeader` |
| shell / menu lateral / topbar | componentes | `app-shell` / `menu-sidebar` / `header` |

Puxe com `npm run igreen:add -- <item>`. Catálogo visual: **https://igreen-desingsystem-admin.vercel.app**.

---

## 7. ✅ Do / ❌ Don't

```
❌ gap-4        → ✅ gap-gp-md           ❌ p-4      → ✅ p-sp-md / p-pad-2xl
❌ rounded-lg   → ✅ rounded-radius-lg   ❌ shadow-md→ ✅ shadow-sh-md
❌ h-9 / h-10   → ✅ min-h-form-md / min-h-form-lg (36/40px) · 44px = min-h-form-xl (WCAG mobile)
❌ ring-3 / ring-ring-brand/30 → ✅ ring-4 / ring-ring-brand (alpha já embutido)
❌ outline-none → ✅ focus-visible:outline-none
❌ text-[14px] / text-sm font-medium → ✅ text-body-md font-medium (preset)
❌ <label> cru em form → ✅ <FormField> (label + erro + helper + dark-mode corretos)
❌ scale(0.95) no clique → ✅ feedback por mudança de bg/border
❌ cor hex / #fff em className → ✅ token semântico
❌ segunda cor de marca / azul → ✅ verde é a marca; info é roxo
```

- Form 2+ campos → `<FormField>` + `gap-form-gap`.
- CTA único por contexto = único `filled`; destrutivo = `<Button color="critical">`.
- Pai que precisa de altura (tabela `flex-1`) → wrapper `flex flex-col h-full min-h-0`.

---

## 8. Responsividade

- Mobile <640px: gutter 16px; FloatingPanel/Sheet vira sheet full; PageHeader empilha ações em overflow; DataTable rola horizontal; CTA primário = `min-h-form-xl` (44px, WCAG).
- Desktop default = `min-h-form-lg` (40px). Containers: `max-w-container-lg`(1024)/`xl`(1280) conforme densidade.
- Os exemplos já são responsivos — herde o comportamento ao adaptar.

---

## 9. Filosofia (decisões por intenção, não por omissão)

- **Flat por escolha** — sem gradiente/glass/neumorfismo. Profundidade = sombra 2-camadas (light) ou borda (dark).
- **Verde é carga, não decoração** — acento de ação, com restraint. Cinza domina.
- **Densidade confiante** — `body-sm` 13/500, 24px entre blocos, sem transform no clique.
- **Tokens, sempre** — zero hex em código; cor por papel semântico; derivação por `color-mix` já está nos tokens.

---

## Como crescer este guia

Novo padrão de tela recorrente → seção curta aqui + (se for fluxo guiado) skill em `.claude/skills/` + 1 linha no mapa (seção 6) e no `ds-kit`. Mantenha cada peça pequena: **este arquivo = composição · `USAGE.md` = API · exemplo = referência viva.**
