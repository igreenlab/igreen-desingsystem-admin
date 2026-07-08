import { useMemo, useState } from "react";
import { User } from "lucide-react";
import { DataList } from "../../components/ui/DataList";
import { Button } from "../../components/ui/Button";
import { ExamplePageLayout } from "../components/example-page-layout";
import { makeOrg } from "./_list-example-data";

type Branch = "block" | "active" | "none";

const MODES: { id: Branch; label: string }[] = [
  { id: "block", label: "Bloco/painel" },
  { id: "active", label: "Ramo ativo" },
  { id: "none", label: "Conectores" },
];

export default function ListHierarchicalPreview() {
  const org = useMemo(() => makeOrg(), []);
  const [mode, setMode] = useState<Branch>("block");
  // empresas + 1º manager de cada já expandidos no mount
  const expanded = useMemo(
    () => new Set(org.flatMap((c) => [c.id, `${c.id}-m0`])),
    [org],
  );

  return (
    <ExamplePageLayout
      category="List Examples"
      title="Hierarchical"
      description="DataList com layout='hierarchical': árvore-como-lista (empresa → manager → membro) com ~30 nós. A prop branchHighlight troca o destaque de 'família': Bloco/painel (filhos dentro de um painel = 1 família), Ramo ativo (só o ramo do último nó aberto recebe o painel + trilha) ou Conectores (elbow lines clássicas). Clique no chevron pra abrir; no modo Ramo ativo, o último aberto vira o ativo."
      code={CODE}
    >
      <div className="flex flex-1 min-h-0 flex-col gap-gp-xl">
        <div className="flex shrink-0 items-center gap-gp-sm">
          <span className="text-body-sm text-fg-muted">
            Destaque de família:
          </span>
          {MODES.map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={mode === m.id ? "soft" : "ghost"}
              color={mode === m.id ? "primary" : "secondary"}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <DataList
          fillHeight
          className="flex-1 min-h-0"
          title="Organização"
          layout="hierarchical"
          items={org}
          branchHighlight={mode}
          defaultExpandedIds={expanded}
          searchable
          searchPlaceholder="Buscar empresa..."
          getMenuItems={() => [{ label: "Ver perfil", icon: <User /> }]}
        />
      </div>
    </ExamplePageLayout>
  );
}

const CODE = `import { DataList } from "@/components/ui/DataList";

<DataList
  title="Organização"
  layout="hierarchical"
  items={org}                          // itens com children aninhados
  branchHighlight="block"              // "none" | "block" | "active"
  defaultExpandedIds={new Set(["acme", "acme-m0", ...])}
  searchable
  getMenuItems={() => [{ label: "Ver perfil" }]}
/>;

// branchHighlight:
//   none   → conectores (elbow lines) clássicos
//   block  → filhos de um nó aberto dentro de um painel sutil (1 bloco = 1 família)
//   active → só o ramo do último nó aberto recebe o painel + trilha (foco em "onde estou")`;
