# Dashboard Builder — Geração

Só entra aqui **após o gate aprovado**. Abort-on-error.

## 1. Ler ANTES de montar (nunca de memória)

| Sempre | `.ai/context/components/dashboard-patterns.md` (as 6 receitas + class strings) |
| Sempre | `src/examples/dashboard/dashboard-screen.tsx` (referência runnable: KPI-group divided + chart-cards) |
| Se tem gráfico | `.ai/context/components/chart-patterns.md` + `src/components/ui/Chart/USAGE.md` |
| Se tem KPI | `src/components/ui/Kpi/USAGE.md` + `kpi.types.ts` |
| Se tem tabela embutida | `.claude/skills/crud-builder/generate.md` (§distribuição) + DataTable types |
| Se tem lista/kanban embutida | `.claude/skills/list-builder/generate.md` (§slots) + DataList types |

## 2. Montar a página (seção por seção, pela receita)

Esqueleto (shell §0):
```tsx
<div className="flex flex-col gap-gp-2xl">
  <PageHeader title="..." description="..." actions={<PeriodSelector/>} />
  {/* rows do blueprint, na ordem — cada seção pela sua § */}
  <div aria-hidden className="h-pad-3xl shrink-0" />
</div>
```

- **KPI-group** (§1): `<KpiGroup columns={N} divided>` + `<Kpi label value icon tone
  hint delta={<KpiDelta .../>} />`. `signed` só quando sinal = bom/ruim.
- **Chart-card** (§2): `SectionCard` (head discreto) + `<ChartContainer className="h-[160px]">`.
  Cor só por token. Big-number/legenda/metric-rows conforme a receita.
- **Ranking/fusão** (§3): `listConfig.renderItem` ou lista à mão com identidade +
  mini-KPIs (quadrado) + bloco headline `border-l` + delta Chip.
- **Card dividido** (§4): 1 surface + `grid lg:grid-cols-2`, divisor no 2º painel.
- **Tabela/lista embutida** (§5/§6): montar via crud/list-builder; filtros nativos
  pré-aplicados; sem form solto acima (L-051); sem botão de ação na linha de lista.

No **consumer**: primitivos vêm por `npm run igreen:add -- kpi chart panel data-table
data-list` (+ `example-dashboard` como base). Prefira **adaptar o example-dashboard**
a montar do zero.

## 3. Registro no preview (repo DS — 4 edits, âncoras TEXTUAIS)

1. **`src/App.tsx` — import**: junto aos showcases (`import DashboardShowcase ...`):
   `import <Nome>Showcase from "./preview/pages/<Nome>Showcase";`
2. **`src/App.tsx` — `DOC_PAGES`**: adicionar `"<page-id>"` (perto de `"dashboard-showcase"`).
3. **`src/App.tsx` — render**: `{activePage === "<page-id>" && <<Nome>Showcase />}`.
4. **`src/preview/components/doc-nav-data.ts`**: item na seção de exemplos/showcases
   (`{ label: "Example: <Nome>", href: "<page-id>" }`).

Deep-link `#/<page-id>` funciona automático (`ALL_VALID_PAGES` deriva de `DOC_PAGES`).
No **consumer**: registrar na rota do app do usuário (perguntar o router).

## 4. Sequência (abort-on-error)

1. Ler as fontes da matriz (§1, só as que se aplicam).
2. Montar a página seção por seção.
3. Registrar (§3).
4. `npx tsc --noEmit` → erro: corrigir e repetir.
5. Validação visual (recomendada): dev server 3100 → `#/<page-id>`:
   - [ ] KPI-group divided renderiza como card único com divisores; tom só no ícone
   - [ ] Gráficos com cor de token; donut com total centralizado
   - [ ] Ranking/fusão com divisor `border-l` e delta Chip; mini-stat quadrado
   - [ ] Card dividido: divisor no 2º painel, some/empilha no mobile
   - [ ] Tabela/lista embutida: filtros pré-aplicados, distribuição correta
   - [ ] Responsivo (estreito = 1 card/row) + dark mode
6. `.ai/status/pipeline-state.md` → `CONCLUÍDO` com Decisões + **Assumption**.

## 5. Checklist final (aprovado se TODOS true)

- [ ] Página compõe 2+ tipos de seção e espelha as receitas de dashboard-patterns.md
- [ ] KPI-group divided + KpiDelta (signed só onde cabe); ícone círculo vs quadrado certo
- [ ] Gráficos só com token; caveats Recharts respeitados
- [ ] Tabela/lista embutida via crud/list-builder (distribuição §5/§6)
- [ ] Zero Tailwind literal com equivalente DS · zero hardcode (números grandes só onde não há preset)
- [ ] Registro completo — deep-link funciona
- [ ] `npx tsc --noEmit` limpo

## Handoff

`DASHBOARD_PRONTO: <Painel> — #/<page-id>`
