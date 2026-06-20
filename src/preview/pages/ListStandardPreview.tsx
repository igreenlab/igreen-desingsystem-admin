import { useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataList } from "../../components/ui/DataList";
import { ExamplePageLayout } from "../components/example-page-layout";
import { makeTeam, PERSON_FILTER_FIELDS, PERSON_VIEWS } from "./_list-example-data";

export default function ListStandardPreview() {
  const team = useMemo(() => makeTeam(40), []);

  return (
    <ExamplePageLayout
      category="List Examples"
      title="Standard"
      description="DataList sobre o List plano: toolbar enxuta (visões em abas · busca · filtros Papel/Status · ⋯) sobre 40 membros. Cada card tem leading + título/subtítulo + meta em colunas + menu. Busca e filtros rodam client-side; click no card abre detalhe (onItemClick)."
      code={CODE}
    >
      <div className="flex flex-1 min-h-0 flex-col overflow-auto scrollbar-thin">
        <DataList
          title="Membros"
          items={team}
          searchable
          searchPlaceholder="Buscar membro..."
          filterFields={PERSON_FILTER_FIELDS}
          views={PERSON_VIEWS}
          onRefresh={() => {}}
          moreActions={[{ label: "Exportar CSV", onClick: () => {} }]}
          onItemClick={() => {}}
          getMenuItems={() => [
            { label: "Editar", icon: <Pencil />, onClick: () => {} },
            { separator: true },
            { label: "Remover", icon: <Trash2 />, destructive: true, onClick: () => {} },
          ]}
          persistKey="list-example-standard"
        />
      </div>
    </ExamplePageLayout>
  );
}

const CODE = `import { DataList } from "@snksergio/design-system";

<DataList
  title="Membros"
  items={team}                         // 40 membros
  searchable
  filterFields={[
    { id: "role",   label: "Papel",  type: "select", accessor: (i) => i.data.role,   options },
    { id: "status", label: "Status", type: "select", accessor: (i) => i.data.status, options },
  ]}
  views={[{ id: "admins", label: "Admins", query }, { id: "ativos", label: "Ativos", query }]}
  onItemClick={(id) => openDetail(id)}
  getMenuItems={() => [{ label: "Editar", onClick }, { label: "Remover", destructive: true, onClick }]}
  persistKey="members"
/>;`;
