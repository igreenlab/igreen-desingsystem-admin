/**
 * Exemplo distribuível — Finance (extrato financeiro: KPIs + DataTable).
 * Puxe: npm run igreen:add -- example-finance   (traz data-table + card + page-header + button)
 * Renderize <FinanceScreen />. Referência pra telas de extrato/financeiro.
 */
import { useMemo, useState } from "react";
import {
  DataTable,
  textColumn,
  currencyColumn,
  dateColumn,
  statusColumn,
  type DataTableColumnDef,
} from "@/components/ui/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

interface Tx {
  id: number;
  description: string;
  category: "entrada" | "saida";
  status: "settled" | "pending";
  amount: number;
  date: string;
}

const TX: Tx[] = [
  { id: 1, description: "Comissão — Solar SP", category: "entrada", status: "settled", amount: 4200.0, date: "2026-05-02" },
  { id: 2, description: "Saque conta BB", category: "saida", status: "settled", amount: -1500.0, date: "2026-05-04" },
  { id: 3, description: "Comissão — Telecom RJ", category: "entrada", status: "pending", amount: 980.5, date: "2026-05-08" },
  { id: 4, description: "Taxa plataforma", category: "saida", status: "settled", amount: -75.0, date: "2026-05-10" },
  { id: 5, description: "Comissão — Seguros MG", category: "entrada", status: "settled", amount: 2310.75, date: "2026-05-12" },
];

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function FinanceScreen() {
  const [rows] = useState<Tx[]>(TX);
  const entradas = TX.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const saidas = TX.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const saldo = entradas + saidas;

  const columns = useMemo<DataTableColumnDef<Tx>[]>(
    () => [
      textColumn<Tx>("description", "Descrição", { width: 280, sortable: true }),
      statusColumn<Tx>("category", "Tipo", [
        { value: "entrada", label: "Entrada", color: "success" },
        { value: "saida", label: "Saída", color: "muted" },
      ], { width: 120 }),
      currencyColumn<Tx>("amount", "Valor", { width: 150, currency: "BRL" }),
      dateColumn<Tx>("date", "Data", { width: 130 }),
      statusColumn<Tx>("status", "Status", [
        { value: "settled", label: "Liquidado", color: "success" },
        { value: "pending", label: "Pendente", color: "warning" },
      ], { width: 130 }),
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-bg-canvas p-sp-xl flex flex-col gap-gp-lg">
      <PageHeader
        title="Financeiro"
        description="Exemplo @igreen/example-finance — KPIs + extrato (DataTable)."
        actions={<Button color="primary" variant="filled">Sacar</Button>}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gp-md">
        <Card>
          <CardHeader><CardTitle className="text-caption-md text-fg-muted uppercase tracking-wider">Saldo</CardTitle></CardHeader>
          <CardContent className="text-display-md font-semibold text-fg-default">{brl(saldo)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-caption-md text-fg-muted uppercase tracking-wider">Entradas</CardTitle></CardHeader>
          <CardContent className="text-display-md font-semibold text-fg-success">{brl(entradas)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-caption-md text-fg-muted uppercase tracking-wider">Saídas</CardTitle></CardHeader>
          <CardContent className="text-display-md font-semibold text-fg-default">{brl(saidas)}</CardContent>
        </Card>
      </div>
      <DataTable<Tx>
        rows={rows}
        columns={columns}
        toolbar={{ enableSearch: true, enableFilters: true }}
        paginationConfig={{ enabled: true, initialPageSize: 25 }}
      />
    </div>
  );
}

export default FinanceScreen;
