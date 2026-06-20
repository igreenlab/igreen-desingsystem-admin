import { useMemo } from "react";
import { User } from "lucide-react";
import { DataList } from "../../components/ui/DataList";
import { ExamplePageLayout } from "../components/example-page-layout";
import { makeOrg } from "./_list-example-data";

export default function ListHierarchicalPreview() {
  const org = useMemo(() => makeOrg(), []);
  // empresas + 1º manager de cada já expandidos no mount
  const expanded = useMemo(
    () => new Set(org.flatMap((c) => [c.id, `${c.id}-m0`])),
    [org],
  );

  return (
    <ExamplePageLayout
      category="List Examples"
      title="Hierarchical"
      description="DataList com layout='hierarchical': árvore-como-lista (empresa → manager → membro) com ~30 nós e linhas de conexão. Clique no chevron pra expandir/recolher cada nível. defaultExpandedIds abre as empresas e o 1º manager no load."
      code={CODE}
    >
      <DataList
        fillHeight
        className="flex-1 min-h-0"
        title="Organização"
        layout="hierarchical"
        items={org}
        defaultExpandedIds={expanded}
        searchable
        searchPlaceholder="Buscar empresa..."
        getMenuItems={() => [{ label: "Ver perfil", icon: <User /> }]}
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataList } from "@snksergio/design-system";

<DataList
  title="Organização"
  layout="hierarchical"
  items={org}                          // itens com children aninhados (empresa → manager → membro)
  defaultExpandedIds={new Set(["acme", "acme-m0", ...])}
  searchable
  getMenuItems={() => [{ label: "Ver perfil" }]}
/>;`;
