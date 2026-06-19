import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuShortcut,
} from "../../components/shadcn/context-menu";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-basic", label: "Básico" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "ContextMenuTrigger", type: "área que abre no clique-direito", defaultVal: "—" },
  { name: "ContextMenuContent", type: "menu (mesma anatomia do DropdownMenu)", defaultVal: "—" },
  { name: "ContextMenuItem", type: "item; `disabled` opcional", defaultVal: "—" },
  { name: "ContextMenuLabel / Separator / Shortcut", type: "rótulo / divisor / atalho", defaultVal: "—" },
];

export function ContextMenuDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Context Menu"
        description="Menu de clique-direito (Radix). Mesma anatomia do DropdownMenu, aberto via contexto. Cores e foco vêm dos tokens do DS (bridge)."
        dependency="@radix-ui/react-context-menu"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Clique com o botão direito na área tracejada."
        code={`<ContextMenu>
  <ContextMenuTrigger>Clique direito aqui</ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Editar <ContextMenuShortcut>⌘E</ContextMenuShortcut></ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem>Excluir</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}
      >
        <ContextMenu>
          <ContextMenuTrigger className="grid h-32 w-full max-w-[420px] place-items-center rounded-radius-lg border border-dashed border-border-default bg-bg-surface text-body-sm text-fg-muted">
            Clique com o botão direito aqui
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>Ações</ContextMenuLabel>
            <ContextMenuItem>
              Editar <ContextMenuShortcut>⌘E</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              Duplicar <ContextMenuShortcut>⌘D</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem className="text-fg-danger">Excluir</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ContextMenuDoc;
