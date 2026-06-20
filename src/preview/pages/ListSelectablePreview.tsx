import { useMemo } from "react";
import { Archive, Pencil, Trash2 } from "lucide-react";
import { DataList } from "../../components/ui/DataList";
import { ExamplePageLayout } from "../components/example-page-layout";
import { makeTeam, PERSON_FILTER_FIELDS } from "./_list-example-data";

export default function ListSelectablePreview() {
  const team = useMemo(() => makeTeam(40), []);

  return (
    <ExamplePageLayout
      category="List Examples"
      title="Selecionável (bulk)"
      description="DataList com selectable: checkbox por card + barra de ações em massa quando há seleção. Selecione cards pra ver a bulk bar (Editar / Arquivar / Excluir / Limpar). Busca e filtros Papel/Status continuam ativos sobre os 40 membros."
      code={CODE}
    >
      <DataList
        fillHeight
        className="flex-1 min-h-0"
        title="Membros"
        items={team}
        searchable
        searchPlaceholder="Buscar membro..."
        filterFields={PERSON_FILTER_FIELDS}
        selectable
        bulkActions={[
          { label: "Editar", icon: <Pencil />, onClick: () => {} },
          { label: "Arquivar", icon: <Archive />, onClick: () => {} },
          {
            label: "Excluir",
            icon: <Trash2 />,
            destructive: true,
            onClick: () => {},
          },
        ]}
        onSelectionChange={() => {}}
        persistKey="list-example-selectable"
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { DataList } from "@snksergio/design-system";

<DataList
  title="Membros"
  items={team}                         // 40 membros
  searchable
  filterFields={[{ id: "role", label: "Papel", type: "select", accessor, options }, ...]}
  selectable
  onSelectionChange={(ids) => setSelected(ids)}
  bulkActions={[
    { label: "Editar",   icon: <Pencil />,  onClick: (ids) => edit(ids) },
    { label: "Arquivar", icon: <Archive />, onClick: (ids) => archive(ids) },
    { label: "Excluir",  icon: <Trash2 />,  destructive: true, onClick: (ids) => remove(ids) },
  ]}
/>;`;
