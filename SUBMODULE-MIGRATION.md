# Guia de migração p/ consumidores (submódulo) — integração fork → mainline

> **Para quem consome o iGreen DS como submódulo** (`design-system/` com `@/` =
> `design-system/src`, importando `@/components/ui/*` e `@/components/shadcn/*`).
>
> **Leitura para IA**: se você bumpou o ponteiro do submódulo e algo quebrou, use a
> tabela **Erro → correção** abaixo. Cada item traz **antes → depois** e o ajuste exato.

Este update integra uma linhagem paralela do DS (fork que evoluiu DataTable, DataList,
Kpi, dashboard-builder, CLI, tabs, etc.) de volta na mainline. **É aditivo na quase
totalidade** — só **2 pontos** exigem ajuste no consumidor, ambos de 1 linha.

---

## TL;DR — o que pode quebrar (só 2)

| # | Mudança | Impacto | Correção |
|---|---------|---------|----------|
| 1 | **`Avatar` → `avatar-ig`** (pasta renomeada) | `import … from "@/components/ui/Avatar"` deixa de resolver | trocar o path para `@/components/ui/avatar-ig` (API idêntica) |
| 2 | **`ChoroplethMap` removido** | `import … from "@/components/ui/ChoroplethMap"` deixa de resolver | ver §"ChoroplethMap" (padrão de mapa SVG por token, ou vendorizar) |

Todo o resto é **aditivo/compatível** (novos componentes, novas props opcionais, novas
variantes). Nenhum token/classe foi removido; nenhum outro componente consumido sumiu.

---

## Erro → correção (para a IA aplicar direto)

```
ERRO: Cannot find module '@/components/ui/Avatar'
FIX : trocar por '@/components/ui/avatar-ig'
      (exports iguais: Avatar, AvatarProps, avatarVariants; props size/color/colorHex/children iguais)

ERRO: Cannot find module '@/components/ui/ChoroplethMap'
FIX : componente removido do DS. Opções:
      (a) usar o padrão "Maps" do DS (coroplético SVG por token) — ver #/chart-map no showcase
          e `.ai/context/components/dashboard-patterns.md` §4 (mapa por UF, rampa verde + legenda);
      (b) manter o ChoroplethMap antigo no PRÓPRIO app do consumidor (copiar o componente
          + instalar as deps d3-geo/topojson-client/geojson/topojson-specification).

ERRO: '"xl"'/'"full"' is not assignable to type 'ModalSize'
FIX : não deve ocorrer — este update MANTÉM `size="xl"` e `size="full"` no Modal.
      Se ocorrer, você está numa versão antiga do DS; bumpe o submódulo.

ERRO (comportamento): Tooltip parou de exigir <TooltipProvider> no root
FIX : esperado — o <Tooltip> agora auto-embrulha um Provider. Manter um <TooltipProvider>
      no root continua válido (Radix aninha sem problema). Nenhuma ação necessária.
```

---

## Antes → depois (por componente alterado)

### 1. Avatar → `avatar-ig`  ⚠️ ajuste de import
- **Antes**: `import { Avatar } from "@/components/ui/Avatar";`
- **Depois**: `import { Avatar } from "@/components/ui/avatar-ig";`
- **Por quê**: a pasta foi renomeada para `avatar-ig` (evita colisão com o primitivo shadcn `avatar`).
- **API**: **idêntica** — `Avatar`, `AvatarProps`, `avatarVariants`; props `size`/`color`/`colorHex`/`aria-label`/`children` iguais. Só o **caminho** muda.

### 2. ChoroplethMap  ⚠️ removido
- **Antes**: `import { ChoroplethMap } from "@/components/ui/ChoroplethMap";`
- **Depois**: **não existe mais** no DS.
- **Por quê**: dependia de `d3-geo`/`topojson-client`/`geojson`/`topojson-specification`, que
  nunca foram declaradas no `package.json` do DS (componente incompleto na origem).
- **Alternativa recomendada**: o novo padrão **Maps** (coroplético do Brasil em **SVG por token**,
  sem lib externa) — showcase `#/chart-map` + receita em
  `.ai/context/components/dashboard-patterns.md` §4. Se precisar do comportamento antigo
  exato (geo real via d3), copie o componente para o app do consumidor e instale as 4 deps.

### 3. Modal  ✅ sem quebra (superset)
- `ModalSize = "sm" | "md" | "lg" | "xl" | "full"` — os 5 tamanhos continuam válidos.
- Header usa `DialogTitle`/`DialogDescription` nativos do Radix (a11y). Sem mudança de API pública.

### 4. Tabs  ✅ aditivo
- Nova prop **opcional** `variant?: "segmented" | "line"` no `<Tabs>` (default `"segmented"` = comportamento anterior).
- `"line"` = abas underline (aba ativa com `border-border-brand`). `<TabsList>`/`<TabsTrigger>` sem mudança.

### 5. Tooltip  ✅ aditivo/compatível
- `<Tooltip>` agora **auto-embrulha** um `<TooltipProvider>` — funciona sem provider no root.
  Manter um `<TooltipProvider>` no root continua válido.
- Nova prop opcional `showArrow?: boolean` (default `true`).

### 6. Icon  ✅ aditivo
- Biblioteca expandida (multi-path). API (`name`/`size`/`tone`/`color`) inalterada.

---

## Novidades disponíveis (aditivo — adote se quiser)

Nenhuma ação necessária; use se fizer sentido no app:

- **DataList** — lista de cards inteligente (irmã do DataTable). Layouts standard/grouped/hierarchical.
- **Kpi / KpiGroup / KpiDelta** — cards de métrica ("Painel do Líder"); `KpiDelta` com `signed`.
- **Padrões de dashboard** — `.ai/context/components/dashboard-patterns.md` (KPI-group, chart-card,
  fusão KPI+evolução, card dividido, mapa por UF, distribuição de tabela/lista).
- **DatePicker, Toast, SingleMenuSidebar** — novos componentes.
- **DataTable** — muitas props novas **opcionais** (`viewMode`/`listConfig`, `allowCreateView`,
  `autoFit`, kanban…). Nada removido/renomeado.
- **Builders guiados** (`.claude/skills/`): `crud-builder`, `list-builder`, `dashboard-builder`
  (`/ds-create-crud|list|dashboard`) — se o app usa Claude Code.

---

## Contrato de consumo — o que foi verificado

- **Nenhum componente consumido removido** (checado contra o app de referência que usa o DS:
  Button, Chart, Chip, DataTable, FormField, Modal, PageHeader, Panel, Table + shadcn
  card/checkbox/dialog/input/progress/select/tabs — todos presentes).
- **Nenhum token/classe removido** (`bg-bg-*`, `gap-gp-*`, `text-body-*`, `min-h-form-*` etc. — superset).
- **`cn` (`@/lib/utils`) idêntico**.
- Únicos ajustes de consumidor: os 2 da tabela TL;DR.

---

## Como bumpar o submódulo com segurança

```bash
# no repo consumidor
cd design-system && git fetch && git checkout <novo-sha-ou-tag> && cd ..
pnpm typecheck          # (ou o typecheck do seu app) — acusa os 2 ajustes acima, se aplicáveis
# aplique os fixes da tabela "Erro → correção" se algo acusar
git add design-system && git commit -m "chore(ds): bump submódulo (integração mainline)"
```

- O submódulo é **pinado por SHA** — o bump é explícito; nada muda no app até você bumpar.
- Se algo der errado, `git checkout` no ponteiro anterior do submódulo reverte tudo.

---

## Detalhe técnico da integração (auditoria)

Duas linhagens divergentes reconciliadas (base comum `6c84816`):
- **Conflitos textuais (7)**: Modal (mantido `xl/full` + a11y), Tooltip (versão auto-provider),
  barrel `index.ts` (união de exports), `inventory.md`, Icon (auto-merge multipath).
- **Colisões de divergência (2)**: `ChoroplethMap` **excluído** (deps não declaradas);
  `Avatar` **unificado** em `avatar-ig` (chat repontado).
- **Preservado dos dois lados**: chat (MessageBubble/Composer/Ack/ConversationListItem/
  MarkdownText/DateSeparatorChip/EmptyState), ColorPicker, FileUploadField, MessageVariablesPicker,
  Spinner, MonthYearPicker + DataList, Kpi, DataTable, dashboard-builder, tabs, CLI/registry.
- `tsc --noEmit` = 0.
