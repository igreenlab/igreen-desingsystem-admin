import { useState } from "react";
import { Archive, Pencil, Trash2, User } from "lucide-react";
import { DataList, type FilterableField, type DataListView } from "../../components/ui/DataList";
import type { ListItemData } from "../../components/ui/List";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "construcao", label: "Construção" },
  { id: "examples", label: "Examples" },
  { id: "ex-completo", label: "Completo" },
  { id: "ex-virtual", label: "Virtualizado" },
  { id: "ex-infinite", label: "Infinite scroll" },
  { id: "api", label: "API Reference" },
];

function Avatar() {
  return (
    <span className="grid size-form-md place-items-center rounded-radius-full bg-bg-muted text-fg-muted [&>svg]:size-icon-sm">
      <User />
    </span>
  );
}
function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-body-sm text-fg-default">
      <span className="size-[8px] rounded-radius-full" style={{ background: color }} />
      {label}
    </span>
  );
}

type Person = { role: string; status: string };

const ROLE = { admin: "Admin", editor: "Editor", viewer: "Viewer" } as const;
const STATUS_COLOR: Record<string, string> = {
  active: "var(--color-fg-success)",
  pending: "var(--color-fg-warning)",
  inactive: "var(--color-fg-subtle)",
};
const STATUS_LABEL: Record<string, string> = { active: "Ativo", pending: "Pendente", inactive: "Inativo" };

function person(id: string, name: string, email: string, role: keyof typeof ROLE, status: string, seen: string): ListItemData {
  return {
    id, leading: <Avatar />, title: name, subtitle: email,
    data: { role, status } satisfies Person,
    meta: [
      { label: "Papel", value: ROLE[role] },
      { label: "Status", value: <StatusDot color={STATUS_COLOR[status]} label={STATUS_LABEL[status]} /> },
      { label: "Visto", value: seen, align: "end" },
    ],
  };
}

const PEOPLE: ListItemData[] = [
  person("alice", "Alice Smith", "alice@example.com", "admin", "active", "2 min"),
  person("bob", "Bob Jones", "bob@example.com", "editor", "active", "1 h"),
  person("charlie", "Charlie Davis", "charlie@example.com", "viewer", "pending", "—"),
  person("diana", "Diana Prince", "diana@example.com", "editor", "inactive", "2 dias"),
  person("ethan", "Ethan Hunt", "ethan@example.com", "viewer", "active", "5 min"),
  person("fiona", "Fiona Gallagher", "fiona@example.com", "admin", "pending", "3 h"),
];

const FILTER_FIELDS: FilterableField[] = [
  { id: "role", label: "Papel", type: "select", accessor: (i) => (i.data as Person).role,
    options: [{ label: "Admin", value: "admin" }, { label: "Editor", value: "editor" }, { label: "Viewer", value: "viewer" }] },
  { id: "status", label: "Status", type: "select", accessor: (i) => (i.data as Person).status,
    options: [{ label: "Ativo", value: "active" }, { label: "Pendente", value: "pending" }, { label: "Inativo", value: "inactive" }] },
];

const VIEWS: DataListView[] = [
  { id: "admins", label: "Admins", query: { search: "", filterModel: { logicOperator: "AND", items: [{ id: "va", field: "role", operator: "equals", value: "admin" }] } } },
  { id: "ativos", label: "Ativos", query: { search: "", filterModel: { logicOperator: "AND", items: [{ id: "vs", field: "status", operator: "equals", value: "active" }] } } },
];

// dataset grande pra virtualização
const BIG: ListItemData[] = Array.from({ length: 1000 }, (_, i) =>
  person(`u${i}`, `Usuário ${i + 1}`, `user${i + 1}@example.com`, (["admin", "editor", "viewer"] as const)[i % 3], ["active", "pending", "inactive"][i % 3], `${(i % 59) + 1} min`),
);

// pool finito pra demonstrar paginação por scroll
const POOL: ListItemData[] = Array.from({ length: 40 }, (_, i) =>
  person(`p${i}`, `Pessoa ${i + 1}`, `pessoa${i + 1}@example.com`, (["admin", "editor", "viewer"] as const)[i % 3], ["active", "pending", "inactive"][i % 3], `${(i % 59) + 1} min`),
);
const PAGE_SIZE = 8;

function InfiniteExample() {
  const [items, setItems] = useState<ListItemData[]>(() => POOL.slice(0, PAGE_SIZE));
  const [loadingMore, setLoadingMore] = useState(false);
  const hasMore = items.length < POOL.length;

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    // simula latência de rede; em produção seria o fetch da próxima página
    setTimeout(() => {
      setItems((prev) => POOL.slice(0, prev.length + PAGE_SIZE));
      setLoadingMore(false);
    }, 900);
  };

  return (
    <DataList
      title="Atividade"
      items={items}
      onLoadMore={loadMore}
      hasMore={hasMore}
      loadingMore={loadingMore}
    />
  );
}

export function DataListDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="List Components"
        title="DataList"
        description="Componente inteligente sobre o List (como DataTable é sobre o Table). Toolbar enxuta (Visões/título · refresh · search · filtro · ⋯) + busca + filtros por campos + saved-views + persistência + seleção/bulk + server/async + virtualização + lazy-load. Sem colunas/toggle de visão — é cards."
        dependency="@hello-pangea/dnd · @tanstack/react-virtual"
      />
      <DocSeparator />

      <SectionH2 id="construcao" title="Construção" />
      <p className="mb-gp-lg text-body-md text-fg-muted">
        <code className="text-fg-default">{"<DataList items={...} searchable filterFields={...} />"}</code> —
        o controller cuida de busca/filtros/views/persistência e passa os itens processados pro
        <code className="text-fg-default"> List</code> por baixo.
      </p>

      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-completo"
        plain
        title="Completo"
        description="Visões + busca + filtros (Papel/Status) + refresh + seleção com bulk bar. A busca e os filtros rodam client-side; selecione cards pra ver a barra de ações."
        code={`<DataList
  title="Membros" items={people} searchable
  filterFields={[{ id: "role", label: "Papel", type: "select", accessor, options }]}
  views={[{ id: "admins", label: "Admins", query }]}
  selectable bulkActions={[{ label: "Arquivar", onClick: (ids) => {} }]}
  onRefresh={refetch} persistKey="members"
/>`}
      >
        <DataList
          title="Membros"
          items={PEOPLE}
          searchable
          searchPlaceholder="Buscar membro..."
          filterFields={FILTER_FIELDS}
          views={VIEWS}
          onRefresh={() => {}}
          selectable
          bulkActions={[
            { label: "Editar", icon: <Pencil />, onClick: () => {} },
            { label: "Arquivar", icon: <Archive />, onClick: () => {} },
            { label: "Excluir", icon: <Trash2 />, destructive: true, onClick: () => {} },
          ]}
          moreActions={[{ label: "Exportar CSV", onClick: () => {} }]}
          persistKey="datalist-demo-membros"
        />
      </ExampleSection>

      <ExampleSection
        id="ex-virtual"
        plain
        title="Virtualizado (1.000 itens)"
        description="virtualized renderiza só os cards visíveis (layout standard). DnD fica desligado nesse modo. Busca/filtros continuam funcionando sobre os 1k."
        code={`<DataList items={big} virtualized searchable filterFields={...} />`}
      >
        <DataList
          items={BIG}
          virtualized
          searchable
          searchPlaceholder="Buscar entre 1.000..."
          filterFields={FILTER_FIELDS}
          title="Usuários"
        />
      </ExampleSection>

      <ExampleSection
        id="ex-infinite"
        plain
        title="Infinite scroll + skeleton"
        description="Ao chegar perto do fim da lista, onLoadMore dispara a próxima página (IntersectionObserver). Enquanto carrega, cards skeleton aparecem no fim. Role até embaixo pra ver."
        code={`function Example() {
  const [items, setItems] = useState(pool.slice(0, 8));
  const [loadingMore, setLoadingMore] = useState(false);
  const hasMore = items.length < pool.length;

  const loadMore = () => {
    setLoadingMore(true);
    fetchNextPage().then((next) => {
      setItems((prev) => [...prev, ...next]);
      setLoadingMore(false);
    });
  };

  return (
    <DataList items={items} onLoadMore={loadMore} hasMore={hasMore} loadingMore={loadingMore} />
  );
}`}
      >
        <InfiniteExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable
        items={[
          { name: "items / layout / groups", type: "repassados ao List (layout fixo)", defaultVal: "—" },
          { name: "title · searchable · filterFields · views · onRefresh · moreActions", type: "toolbar enxuta", defaultVal: "—" },
          { name: "filterFields", type: "{ id, label, accessor, type, options? }[]", defaultVal: "—" },
          { name: "mode + onQueryChange · loading · total", type: "server/async ('client' default)", defaultVal: '"client"' },
          { name: "onLoadMore + hasMore + loadingMore", type: "infinite scroll (sentinel + skeleton)", defaultVal: "—" },
          { name: "virtualized + estimateItemSize", type: "listas grandes (só standard; desliga DnD)", defaultVal: "false / 76" },
          { name: "onLoadChildren(id)", type: "lazy-load de filhos (hierarchical)", defaultVal: "—" },
          { name: "selectable + onSelectionChange + bulkActions", type: "seleção + bulk bar", defaultVal: "—" },
          { name: "enableDnD + onReorder/onMove", type: "DnD (passa pro List)", defaultVal: "false" },
          { name: "persistKey", type: "persiste query em localStorage", defaultVal: "—" },
        ]}
      />
    </DocLayout>
  );
}

export default DataListDoc;
