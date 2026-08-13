---
name: screen-composer
description: >
  Compõe uma PÁGINA DE NEGÓCIO inteira a partir de várias peças que CONVERSAM
  entre si (estado compartilhado): master-detail (clicar na linha abre o
  detalhe), cross-filter (um período/segmento que muda KPIs + gráfico + tabela
  juntos). Use quando o pedido combina 2+ peças com interação — "tabela + detalhe
  ao lado", "filtro no topo que muda tudo", "página com KPIs, gráfico e tabela
  que reagem juntos". Orquestra os builders + cabeia o estado.
---

# screen-composer — Página composta (estado compartilhado)

Não é um tipo de peça — é a **cola** entre peças. Cada peça vem de um builder
(crud/list/dashboard/drawers); aqui você monta o layout e **cabeia o estado que
elas compartilham**. A receita completa está logo abaixo, em "Os 2 padrões".

## Quando esta skill (vs os builders diretos)

- 1 peça só (uma tabela, uma lista, um dashboard) → vá direto no builder.
- **2+ peças que reagem entre si** (master-detail e/ou cross-filter) → **aqui**.

## Fluxo

1. **Decomponha** a página: quais peças (tabela / lista / KPIs+gráfico / detalhe /
   filtro global) e quais **interações** (clicar→detalhe? controle→filtra tudo?).
2. **Monte cada peça** pelo builder certo (crud/list/dashboard) OU puxe o exemplo
   composto: `npm run igreen:add -- example-finance` (master-detail: tabela +
   detail panel + drawers) / `example-order-detail`. **Leia** o exemplo.
3. **Cabeie o estado no nível da PÁGINA** — ver "Os 2 padrões" abaixo.
4. `npx tsc --noEmit` limpo.

## Os 2 padrões (cobrem quase toda página composta)

Estado que 2+ peças compartilham **não mora em cada peça**: sobe pro componente da
página (single source of truth) e desce por props.

### Master-detail — clicar num item abre o detalhe

```tsx
function ClientesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? findById(selectedId) : null;
  return (
    <div className="flex h-full min-h-0 gap-gp-2xl">
      <DataTable
        rows={rows}
        columns={cols}
        onRowClick={(row) => setSelectedId(row.id)}   // grade → estado
        className="flex-1 min-h-0"
      />
      {/* ao LADO = FloatingPanel/painel fixo · POR CIMA = Drawer/Sheet */}
      <DetailPanel item={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
```

Nunca duplique a linha no detalhe — passe só o `id`/objeto selecionado.

### Cross-filter — um controle alimenta várias peças

```tsx
function PainelPage() {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const data = useMemo(() => filtrar(base, periodo), [periodo]);  // 1 fonte
  return (
    <div className="flex flex-col gap-gp-2xl">
      <PageHeader actions={<PeriodSelector value={periodo} onChange={setPeriodo} />} />
      <KpiGroup>{/* lê `data` */}</KpiGroup>
      <ChartCard data={data} />
      <DataTable rows={data.rows} columns={cols} />
    </div>
  );
}
```

- **Um** `useMemo` deriva o dataset; todas as peças leem dele (não refazem fetch).
- Filtro por **coluna** continua nativo/pré-aplicado (chips) — ver `ds-components.md`.
  O cross-filter aqui é o **escopo global** (período/segmento), no `PageHeader.actions`.
- Os dois combinam: `selectedId` e `periodo` convivem no mesmo nível.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> NÃO rode `igreen:add` — leia os exemplos em `<dsPath>/src/examples/` e importe via `importBase`.

## Gotchas do tipo

- **Single source of truth**: estado que 2+ peças compartilham SOBE pra página, não
  fica duplicado em cada peça. Peça isolada mantém o seu.
- **Master-detail**: passe só `id`/objeto seleto pro detalhe (nunca remonte a linha).
  Ao lado = `FloatingPanel`/painel fixo; por cima = `Drawer`/`Sheet`.
- **Cross-filter**: um `useMemo(filtrar(base, filtro))` alimenta KPIs+gráfico+tabela;
  não refaça fetch por peça. Filtro por COLUNA continua nativo/pré-aplicado (L-051);
  o cross-filter é o escopo global (período/segmento), no `PageHeader.actions`.
- **Layout**: shell `flex flex-col gap-gp-2xl` (ou `flex gap` p/ master-detail lado a lado);
  `fillHeight`/`flex-1 min-h-0` nas peças que rolam.
- Conteúdo/estilo de cada peça = responsabilidade do builder dela; aqui é só layout + estado.

Aplique `DESIGN.md`. Handoff: `SCREEN_PRONTO: <página>` + rota.
