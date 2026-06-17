/**
 * Exemplo distribuível — tela de Clientes (DataTable).
 * Puxe com: npm run igreen:add -- example-clientes   (traz data-table + page-header + button)
 * Renderize <ClientesScreen /> numa rota. Edite à vontade — é seu código (copy-in).
 */
import { useMemo, useState } from "react";
import {
  DataTable,
  textColumn,
  currencyColumn,
  dateColumn,
  statusColumn,
  actionColumn,
  type DataTableColumnDef,
} from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

interface Client {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  value: number;
  createdAt: string;
}

const CLIENTS: Client[] = [
  { id: 1, name: "Sergio Vieira", email: "sergio@igreen.com", status: "active", value: 1240.5, createdAt: "2026-01-12" },
  { id: 2, name: "Maria Andrade", email: "maria@acme.com", status: "active", value: 8990.0, createdAt: "2026-02-03" },
  { id: 3, name: "Pedro Ribeiro", email: "pedro@solis.com", status: "inactive", value: 320.9, createdAt: "2025-11-21" },
  { id: 4, name: "Ana Lima", email: "ana@telecom.com", status: "active", value: 15200.0, createdAt: "2026-03-18" },
  { id: 5, name: "Carlos Souza", email: "carlos@seguros.com", status: "inactive", value: 75.0, createdAt: "2025-09-30" },
  { id: 6, name: "Beatriz Nunes", email: "bia@acme.com", status: "active", value: 4310.75, createdAt: "2026-04-02" },
];

export function ClientesScreen() {
  const [rows] = useState<Client[]>(CLIENTS);

  const columns = useMemo<DataTableColumnDef<Client>[]>(
    () => [
      textColumn<Client>("id", "ID", { width: 70 }),
      textColumn<Client>("name", "Nome", { width: 220, sortable: true }),
      { field: "email", headerName: "Email", type: "email", width: 240 },
      currencyColumn<Client>("value", "Valor", { width: 150, currency: "BRL" }),
      dateColumn<Client>("createdAt", "Criado em", { width: 140 }),
      statusColumn<Client>(
        "status",
        "Status",
        [
          { value: "active", label: "Ativo", color: "success" },
          { value: "inactive", label: "Inativo", color: "muted" },
        ],
        { width: 130 },
      ),
      actionColumn<Client>({
        getActions: ({ row }) => [
          { id: "edit", label: "Editar", onClick: () => console.log("editar", row.id) },
          { id: "delete", label: "Excluir", onClick: () => console.log("excluir", row.id), destructive: true },
        ],
      }),
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-bg-canvas p-sp-xl flex flex-col gap-gp-lg">
      <PageHeader
        title="Clientes"
        description="Exemplo @igreen/example-clientes — DataTable com busca, sort, status e ações."
        actions={<Button color="primary" variant="filled">Novo cliente</Button>}
      />
      <DataTable<Client>
        rows={rows}
        columns={columns}
        toolbar={{ enableSearch: true, enableFilters: true }}
        paginationConfig={{ enabled: true, initialPageSize: 25 }}
        selectionConfig={{ enabled: true, enableGlobal: true }}
      />
    </div>
  );
}

export default ClientesScreen;
