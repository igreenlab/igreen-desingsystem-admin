import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { DataList } from "../../components/ui/DataList";
import type { ListItemData } from "../../components/ui/List";
import { ExamplePageLayout } from "../components/example-page-layout";
import { makeTasks, TASK_GROUPS } from "./_list-example-data";

export default function ListGroupedPreview() {
  const [tasks, setTasks] = useState<ListItemData[]>(() => makeTasks());

  const handleMove = (
    id: string,
    _from: string,
    to: string,
    toIndex: number,
  ) => {
    setTasks((prev) => {
      const moved = prev.find((t) => t.id === id);
      if (!moved) return prev;
      const without = prev.filter((t) => t.id !== id);
      const destItems = without.filter((t) => t.groupId === to);
      const updated = { ...moved, groupId: to };
      const target = destItems[toIndex];
      const insertAt = target ? without.indexOf(target) : without.length;
      const next = [...without];
      next.splice(insertAt, 0, updated);
      return next;
    });
  };

  const handleReorder = (id: string, toIndex: number) => {
    setTasks((prev) => {
      const moved = prev.find((t) => t.id === id);
      if (!moved) return prev;
      const same = prev.filter((t) => t.groupId === moved.groupId);
      const without = prev.filter((t) => t.id !== id);
      const target = same.filter((t) => t.id !== id)[toIndex];
      const insertAt = target ? without.indexOf(target) : without.length;
      const next = [...without];
      next.splice(insertAt, 0, moved);
      return next;
    });
  };

  return (
    <ExamplePageLayout
      category="List Examples"
      title="Grouped + Drag and Drop"
      description="DataList com layout='grouped': seções colapsáveis por status (To Do / In Progress / Done) sobre 24 tarefas. Arraste cards (handle no hover) entre grupos e reordene dentro — o consumer commita no onMove/onReorder. Busca filtra os cards mantendo os grupos."
      code={CODE}
    >
      <DataList
        fillHeight
        className="flex-1 min-h-0"
        title="Backlog"
        layout="grouped"
        items={tasks}
        groups={TASK_GROUPS}
        groupSurface
        enableDnD
        onMove={handleMove}
        onReorder={handleReorder}
        searchable
        searchPlaceholder="Buscar tarefa..."
        defaultExpandedIds={new Set(["todo", "doing", "done"])}
        getMenuItems={() => [
          { label: "Editar", icon: <Pencil />, onClick: () => {} },
          { separator: true },
          {
            label: "Excluir",
            icon: <Trash2 />,
            destructive: true,
            onClick: () => {},
          },
        ]}
      />
    </ExamplePageLayout>
  );
}

const CODE = `import { useState } from "react";
import { DataList } from "@snksergio/design-system";

const [tasks, setTasks] = useState(initialTasks);   // 24 tarefas, 3 grupos

<DataList
  title="Backlog"
  layout="grouped"
  items={tasks}
  groups={[{ id: "todo", label: "To Do" }, { id: "doing", label: "In Progress" }, { id: "done", label: "Done" }]}
  groupSurface
  enableDnD
  onMove={(id, from, to, toIndex) => commitMove(...)}
  onReorder={(id, toIndex) => commitReorder(...)}
  searchable
/>;`;
