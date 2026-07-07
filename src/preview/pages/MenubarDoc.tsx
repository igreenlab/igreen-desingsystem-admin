import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from "../../components/shadcn/menubar";
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
  { name: "Menubar", type: "barra raiz (horizontal)", defaultVal: "—" },
  { name: "MenubarMenu", type: "um menu (ex.: Arquivo)", defaultVal: "—" },
  { name: "MenubarTrigger / MenubarContent", type: "gatilho + painel do menu", defaultVal: "—" },
  { name: "MenubarItem / Separator / Shortcut", type: "item / divisor / atalho", defaultVal: "—" },
];

export function MenubarDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Menubar"
        description="Barra de menus estilo app desktop (Arquivo / Editar / …). Radix; cores e foco via tokens do DS. Para navegação do app prefira o MenuSidebar/Header do DS."
        dependency="@radix-ui/react-menubar"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Clique num menu pra abrir; navegue entre eles."
        code={`<Menubar>
  <MenubarMenu>
    <MenubarTrigger>Arquivo</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Novo <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}
      >
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Arquivo</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Novo <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
              <MenubarItem>Abrir <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Sair</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Editar</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Desfazer <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
              <MenubarItem>Refazer <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Ver</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>Zoom +</MenubarItem>
              <MenubarItem>Zoom −</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default MenubarDoc;
