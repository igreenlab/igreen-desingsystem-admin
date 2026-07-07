import { useMemo, useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { DataList } from "../../components/ui/DataList";
import { ExamplePageLayout } from "../components/example-page-layout";
import {
  makeTeam,
  PERSON_FILTER_FIELDS,
  PERSON_VIEWS,
} from "./_list-example-data";

const PERIODOS = ["Junho de 2026", "Maio de 2026", "Abril de 2026"];

export default function ListStandardPreview() {
  const team = useMemo(() => makeTeam(40), []);
  const [periodo, setPeriodo] = useState(PERIODOS[0]);

  return (
    <ExamplePageLayout
      category="List Examples"
      title="Standard"
      description="DataList sobre o List plano: toolbar enxuta (visões em abas · busca · filtros Papel/Status · ação custom de Período · ⋯) sobre 40 membros. O seletor de Período usa `toolbarActions` (dropdown) — inline no desktop, colapsa no ⋯ no mobile. Cada card tem leading + título/subtítulo + meta em colunas + menu. Busca e filtros rodam client-side; click no card abre detalhe (onItemClick)."
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
        views={PERSON_VIEWS}
        onRefresh={() => {}}
        toolbarActions={[
          {
            kind: "dropdown",
            id: "periodo",
            label: periodo,
            icon: <CalendarDays />,
            items: PERIODOS.map((p) => ({
              label: p,
              active: p === periodo,
              onClick: () => setPeriodo(p),
            })),
          },
        ]}
        moreActions={[{ label: "Exportar CSV", onClick: () => {} }]}
        onItemClick={() => {}}
        getMenuItems={() => [
          { label: "Editar", icon: <Pencil />, onClick: () => {} },
          { separator: true },
          {
            label: "Remover",
            icon: <Trash2 />,
            destructive: true,
            onClick: () => {},
          },
        ]}
        persistKey="list-example-standard"
      />
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
  toolbarActions={[                       // ações custom no toolbar (colapsam no ⋯ no mobile)
    { kind: "dropdown", id: "periodo", label: periodo, icon: <CalendarDays />, items },
  ]}
  onItemClick={(id) => openDetail(id)}
  getMenuItems={() => [{ label: "Editar", onClick }, { label: "Remover", destructive: true, onClick }]}
  persistKey="members"
/>;`;
