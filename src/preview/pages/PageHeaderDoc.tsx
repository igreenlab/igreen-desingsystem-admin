import { useState } from "react";
import { MoreHorizontal, Plus, Download, Search } from "lucide-react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";
import { PageHeader } from "../../components/ui/PageHeader";
import { Button } from "../../components/ui/Button/button";
import { Chip } from "../../components/ui/Chip";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../components/shadcn/tabs";
import { Input } from "../../components/shadcn/input";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-minimal", label: "Mínimo (só título)" },
  { id: "ex-crud", label: "Pattern CRUD completo" },
  { id: "ex-tabs", label: "Com tabs abaixo" },
  { id: "ex-mobile-text", label: "Manter texto no mobile" },
  { id: "ex-children-only", label: "Só children (FAQ)" },
  { id: "api", label: "API Reference" },
  { id: "api-page-header", label: "<PageHeader>" },
];

const PROPS = [
  { name: "title", type: "string", defaultVal: "—" },
  { name: "description", type: "string", defaultVal: "—" },
  { name: "badge", type: "ReactNode", defaultVal: "—" },
  { name: "actions", type: "ReactNode", defaultVal: "—" },
  { name: "children", type: "ReactNode", defaultVal: "— (slot extra abaixo)" },
  { name: "hideTextOnMobile", type: "boolean", defaultVal: "true" },
  { name: "fluidPrimaryOnMobile", type: "boolean", defaultVal: "true" },
  { name: "className", type: "string", defaultVal: "—" },
];

export function PageHeaderDoc() {
  const [tab, setTab] = useState("day");

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Templates"
        title="PageHeader"
        description="Bloco de título reutilizável renderizado dentro do body do <AppShell>. Cobre o pattern title + description + badge + actions — com slot opcional pra tabs/filtros abaixo. Mobile-ready por default (esconde o texto e deixa o CTA fluido)."
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Mínimo */}
      <ExampleSection
        id="ex-minimal"
        title="Mínimo (só título)"
        description="Sem actions, sem children — útil pra páginas estáticas (Termos, FAQ, About)."
        code={`<PageHeader title="Configurações" />`}
      >
        <div className="w-full p-pad-3xl bg-bg-canvas rounded-radius-base ring-1 ring-border-subtle">
          <PageHeader title="Configurações" />
        </div>
      </ExampleSection>

      {/* Pattern CRUD */}
      <ExampleSection
        id="ex-crud"
        title="Pattern CRUD completo"
        description="Title + description + badge contador + actions (icon-button + CTA primary). É o pattern usado em todas as listagens do CRM iGreen."
        code={`<PageHeader
  title="Clientes"
  description="Gerencie sua base de clientes, status e atendimentos."
  badge={<Chip color="primary" variant="soft" size="sm" shape="rounded">87 registros</Chip>}
  actions={
    <>
      <Button variant="outline" color="secondary" size="icon-md" aria-label="Mais ações">
        <MoreHorizontal />
      </Button>
      <Button variant="filled" color="primary" iconLeft={<Plus />}>
        Novo cliente
      </Button>
    </>
  }
/>`}
      >
        <div className="w-full p-pad-3xl bg-bg-canvas rounded-radius-base ring-1 ring-border-subtle">
          <PageHeader
            title="Clientes"
            description="Gerencie sua base de clientes, status e atendimentos."
            badge={
              <Chip color="primary" variant="soft" size="sm" shape="rounded">
                87 registros
              </Chip>
            }
            actions={
              <>
                <Button
                  variant="outline"
                  color="secondary"
                  size="icon-md"
                  aria-label="Mais ações"
                >
                  <MoreHorizontal />
                </Button>
                <Button
                  variant="filled"
                  color="primary"
                  iconLeft={<Plus />}
                >
                  Novo cliente
                </Button>
              </>
            }
          />
        </div>
      </ExampleSection>

      {/* Tabs abaixo */}
      <ExampleSection
        id="ex-tabs"
        title="Com tabs abaixo"
        description="O slot `children` aceita qualquer conteúdo. Combine com Tabs/Filtros pra fluxos com múltiplas views."
        code={`<PageHeader
  title="Relatórios"
  description="Análise consolidada de vendas e leads."
  actions={<Button variant="outline" color="secondary" iconLeft={<Download />}>Exportar</Button>}
>
  <Tabs value={tab} onValueChange={setTab}>
    <TabsList>
      <TabsTrigger value="day">Hoje</TabsTrigger>
      <TabsTrigger value="week">Semana</TabsTrigger>
      <TabsTrigger value="month">Mês</TabsTrigger>
    </TabsList>
  </Tabs>
</PageHeader>`}
      >
        <div className="w-full p-pad-3xl bg-bg-canvas rounded-radius-base ring-1 ring-border-subtle">
          <PageHeader
            title="Relatórios"
            description="Análise consolidada de vendas e leads."
            actions={
              <Button
                variant="outline"
                color="secondary"
                iconLeft={<Download />}
              >
                Exportar
              </Button>
            }
          >
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="day">Hoje</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>
          </PageHeader>
        </div>
      </ExampleSection>

      {/* Manter mobile */}
      <ExampleSection
        id="ex-mobile-text"
        title="Manter texto no mobile"
        description="`hideTextOnMobile={false}` força o título/descrição a aparecer mesmo em mobile. Use quando NÃO houver AppShell global mostrando título no Header (ex: páginas standalone, login)."
        code={`<PageHeader
  title="Termos de uso"
  description="Última atualização: jan/2026"
  hideTextOnMobile={false}
/>`}
      >
        <div className="w-full p-pad-3xl bg-bg-canvas rounded-radius-base ring-1 ring-border-subtle">
          <PageHeader
            title="Termos de uso"
            description="Última atualização: jan/2026"
            hideTextOnMobile={false}
          />
        </div>
      </ExampleSection>

      {/* Só children */}
      <ExampleSection
        id="ex-children-only"
        title="Só children (com FAQ search)"
        description="Sem actions — útil pra FAQ/Help pages onde a interação acontece num input grande do `children`."
        code={`<PageHeader title="FAQ" description="Encontre respostas pras dúvidas mais comuns.">
  <div className="relative max-w-[500px]">
    <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 size-icon-sm text-fg-muted" />
    <Input placeholder="Buscar pergunta..." className="pl-[40px]" />
  </div>
</PageHeader>`}
      >
        <div className="w-full p-pad-3xl bg-bg-canvas rounded-radius-base ring-1 ring-border-subtle">
          <PageHeader
            title="FAQ"
            description="Encontre respostas pras dúvidas mais comuns."
          >
            <div className="relative max-w-[500px]">
              <Search className="absolute left-[12px] top-1/2 -translate-y-1/2 size-icon-sm text-fg-muted" />
              <Input placeholder="Buscar pergunta..." className="pl-[40px]" />
            </div>
          </PageHeader>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div id="api-page-header" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          {"<PageHeader>"}
        </h3>
        <PropsTable items={PROPS} />
      </div>
    </DocLayout>
  );
}
