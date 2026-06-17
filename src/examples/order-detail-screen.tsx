/**
 * Exemplo distribuível — Order Detail (página de detalhamento com abas).
 * Puxe: npm run igreen:add -- example-order-detail  (traz tabs + card + badge + page-header + button)
 * Renderize <OrderDetailScreen />. Referência pra páginas de detalhe/detalhamento.
 */
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-gp-2xs">
      <span className="text-caption-sm text-fg-muted uppercase tracking-wider">{label}</span>
      <span className="text-body-md text-fg-default">{value}</span>
    </div>
  );
}

const ITEMS = [
  { name: "Plano Solar 12kWp", qty: 1, total: "R$ 15.200,00" },
  { name: "Instalação", qty: 1, total: "R$ 2.400,00" },
  { name: "Seguro anual", qty: 1, total: "R$ 480,00" },
];

export function OrderDetailScreen() {
  return (
    <div className="min-h-screen bg-bg-canvas p-sp-xl flex flex-col gap-gp-lg">
      <PageHeader
        title="Pedido #4821"
        description="Exemplo @igreen/example-order-detail — cabeçalho + abas + cards de detalhe."
        badge={<Badge color="success" variant="soft">Aprovado</Badge>}
        actions={<Button color="primary" variant="filled">Editar</Button>}
      />
      <Tabs defaultValue="overview" className="w-full max-w-container-lg">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle>Resumo</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-form-gap">
              <Field label="Cliente" value="Ana Lima" />
              <Field label="Criado em" value="18 de mar, 2026" />
              <Field label="Vendedor" value="Sergio Vieira" />
              <Field label="Total" value="R$ 18.080,00" />
              <Field label="Pagamento" value="Cartão · 12x" />
              <Field label="Status" value={<Badge color="success" variant="soft">Aprovado</Badge>} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader><CardTitle>Itens do pedido</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-gp-sm">
              {ITEMS.map((it) => (
                <div key={it.name} className="flex items-center justify-between border-b border-border-subtle pb-gp-sm last:border-0">
                  <span className="text-body-md text-fg-default">{it.name}</span>
                  <div className="flex items-center gap-gp-lg">
                    <span className="text-body-sm text-fg-muted">x{it.qty}</span>
                    <span className="text-body-md font-medium text-fg-default">{it.total}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-gp-sm text-body-sm text-fg-muted">
              <div>18/03 — Pedido criado por Sergio Vieira</div>
              <div>18/03 — Pagamento aprovado</div>
              <div>19/03 — Nota fiscal emitida</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default OrderDetailScreen;
