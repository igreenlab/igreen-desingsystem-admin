import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataList } from "../../components/ui/DataList";
import { ExamplePageLayout } from "../components/example-page-layout";
import { makeOrders, ORDER_FILTER_FIELDS, renderOrderCard } from "./_list-example-data";

export default function ListRichPreview() {
  const orders = useMemo(() => makeOrders(20), []);

  return (
    <ExamplePageLayout
      category="List Examples"
      title="Card rico (renderItem)"
      description="DataList com renderItem: o miolo do card é totalmente custom (id + nome + status, avatares, meta com ícones, footer com progresso e data) — o wrapper (card, hover, click, menu) continua do List. 20 pedidos com busca + filtros por Status/Categoria."
      code={CODE}
    >
      <div className="flex flex-1 min-h-0 flex-col overflow-auto scrollbar-thin">
        <DataList
          title="Pedidos"
          items={orders}
          renderItem={renderOrderCard}
          searchable
          searchPlaceholder="Buscar pedido..."
          filterFields={ORDER_FILTER_FIELDS}
          onItemClick={() => {}}
          getMenuItems={() => [
            { label: "Editar", icon: <Pencil />, onClick: () => {} },
            { separator: true },
            { label: "Excluir", icon: <Trash2 />, destructive: true, onClick: () => {} },
          ]}
          persistKey="list-example-rich"
        />
      </div>
    </ExamplePageLayout>
  );
}

const CODE = `import { DataList } from "@snksergio/design-system";

<DataList
  title="Pedidos"
  items={orders}                       // 20 pedidos
  renderItem={(item) => <OrderCard order={item.data} />}   // miolo custom
  searchable
  filterFields={[{ id: "status", label: "Status", type: "select", accessor, options }, ...]}
  onItemClick={(id) => open(id)}
  getMenuItems={() => [{ label: "Editar", onClick }, { label: "Excluir", destructive: true, onClick }]}
/>;`;
