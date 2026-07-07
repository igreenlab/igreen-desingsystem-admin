import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "../../components/shadcn/navigation-menu";
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
  { name: "NavigationMenu / List / Item", type: "raiz / lista / item", defaultVal: "—" },
  { name: "NavigationMenuTrigger", type: "abre um painel (dropdown de navegação)", defaultVal: "—" },
  { name: "NavigationMenuContent", type: "painel com links/cards", defaultVal: "—" },
  { name: "NavigationMenuLink + navigationMenuTriggerStyle()", type: "link simples no estilo do trigger", defaultVal: "—" },
];

const LINKS = [
  { title: "Solar", desc: "Geração fotovoltaica" },
  { title: "Telecom", desc: "Conectividade" },
  { title: "Seguros", desc: "Proteção e garantias" },
  { title: "Licenciados", desc: "Rede de parceiros" },
];

export function NavigationMenuDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Navigation Menu"
        description="Navegação com painéis (mega-menu). Radix; cores/foco via tokens do DS. Para a navegação lateral do app, use o MenuSidebar do DS."
        dependency="@radix-ui/react-navigation-menu"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Um trigger com painel + um link simples."
        code={`<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
      <NavigationMenuContent>…links…</NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">Docs</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}
      >
        <div className="flex min-h-[360px] w-full items-start justify-center pt-pad-md">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Produtos</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-gp-2xs p-pad-md">
                  {LINKS.map((l) => (
                    <li key={l.title}>
                      <NavigationMenuLink asChild>
                        <a href="#" className="flex items-baseline gap-gp-sm rounded-radius-md px-pad-lg py-pad-md hover:bg-bg-muted">
                          <span className="text-body-sm font-semibold text-fg-default">{l.title}</span>
                          <span className="text-caption-sm text-fg-muted">{l.desc}</span>
                        </a>
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="#">
                Documentação
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default NavigationMenuDoc;
