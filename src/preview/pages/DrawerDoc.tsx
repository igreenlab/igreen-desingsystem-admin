import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "../../components/shadcn/drawer";
import { Button } from "../../components/ui/Button";
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
  { name: "Drawer", type: "raiz — `open` / `onOpenChange` / `direction`", defaultVal: '"bottom"' },
  { name: "DrawerTrigger / DrawerClose", type: "abre / fecha (`asChild`)", defaultVal: "—" },
  { name: "DrawerContent", type: "painel (arrasta pra fechar)", defaultVal: "—" },
  { name: "DrawerHeader / Footer / Title / Description", type: "estrutura interna", defaultVal: "—" },
];

export function DrawerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Drawer"
        description="Painel que desliza da borda (Vaul), com gesto de arrastar — bom em mobile. Para drawer de criar/editar no padrão do DS, prefira o composto Panel; use o Drawer para o caso mobile/gesto."
        dependency="vaul"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Abre de baixo; arraste pra baixo ou clique fora pra fechar."
        code={`<Drawer>
  <DrawerTrigger asChild><Button>Abrir</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Título</DrawerTitle>
      <DrawerDescription>Descrição.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <DrawerClose asChild><Button>Fechar</Button></DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>`}
      >
        <Drawer>
          <DrawerTrigger asChild>
            <Button color="secondary" variant="outline">Abrir drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-container-sm">
              <DrawerHeader>
                <DrawerTitle>Confirmar saque</DrawerTitle>
                <DrawerDescription>Revise os dados antes de continuar.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button color="primary" variant="filled">Confirmar</Button>
                <DrawerClose asChild>
                  <Button color="secondary" variant="outline">Cancelar</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default DrawerDoc;
