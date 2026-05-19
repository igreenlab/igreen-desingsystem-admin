import { useState } from "react";
import { FooterTable } from "../../components/ui/FooterTable";
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
  { id: "ex-basic", label: "Basic" },
  { id: "ex-selection", label: "Com seleção" },
  { id: "ex-compact", label: "Compact (sem « »)" },
  { id: "ex-no-pagesize", label: "Sem page-size" },
  { id: "ex-large", label: "Muitas páginas" },
  { id: "ex-table", label: "Dentro de tabela" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "totalCount", type: "number", defaultVal: "—" },
  { name: "page", type: "number", defaultVal: "—" },
  { name: "pageSize", type: "number", defaultVal: "—" },
  { name: "onPageChange", type: "(page: number) => void", defaultVal: "—" },
  { name: "onPageSizeChange", type: "(size: number) => void", defaultVal: "—" },
  { name: "pageSizeOptions", type: "number[]", defaultVal: "[10, 25, 50, 100]" },
  { name: "selectionCount", type: "number", defaultVal: "0" },
  { name: "pageSizeLabel", type: "string", defaultVal: '"Linhas"' },
  { name: "rowLabel", type: "string", defaultVal: '"rows"' },
  { name: "locale", type: "string", defaultVal: '"pt-BR"' },
  { name: "hidePageSize", type: "boolean", defaultVal: "false" },
  { name: "hideRange", type: "boolean", defaultVal: "false" },
  { name: "hideFirstLast", type: "boolean", defaultVal: "false" },
];

function StatefulFooter({
  totalCount,
  initialPage = 1,
  initialPageSize = 10,
  selectionCount,
  ...rest
}: {
  totalCount: number;
  initialPage?: number;
  initialPageSize?: number;
  selectionCount?: number;
  hideFirstLast?: boolean;
  hidePageSize?: boolean;
  hideRange?: boolean;
}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  return (
    <FooterTable
      totalCount={totalCount}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      selectionCount={selectionCount}
      {...rest}
    />
  );
}

export function FooterTableDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Tables"
        title="Footer Table"
        description="Footer one-shot pra tabelas — combina page-size select + range '1–10 de 87 rows' + Pagination (« ‹ pages › »). Replica o `.tbl-footer` do design-and-table-v2."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Basic"
        description="87 registros, 10 por página = 9 páginas. Controle de estado fica com o consumidor."
        code={`const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

<FooterTable
  totalCount={87}
  page={page}
  pageSize={pageSize}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>`}
      >
        <div className="w-full">
          <StatefulFooter totalCount={87} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-selection"
        title="Com seleção"
        description="Quando `selectionCount > 0` mostra '· N selecionado(s)' depois do range."
        code={`<FooterTable
  totalCount={87}
  page={1}
  pageSize={10}
  selectionCount={3}
  onPageChange={...}
  onPageSizeChange={...}
/>`}
      >
        <div className="w-full">
          <StatefulFooter totalCount={87} selectionCount={3} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-compact"
        title="Compact (sem « »)"
        description="`hideFirstLast` esconde os botões de primeira/última página. Útil em UIs apertadas."
        code={`<FooterTable totalCount={87} ... hideFirstLast />`}
      >
        <div className="w-full">
          <StatefulFooter totalCount={87} hideFirstLast />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-no-pagesize"
        title="Sem page-size select"
        description="Quando o page-size é fixo. `hidePageSize` esconde o dropdown e mantém range + paginação."
        code={`<FooterTable totalCount={87} ... hidePageSize />`}
      >
        <div className="w-full">
          <StatefulFooter totalCount={87} hidePageSize />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-large"
        title="Muitas páginas (ellipsis)"
        description="500 registros / 10 por página = 50 páginas. Ellipsis aparece automático."
        code={`<FooterTable totalCount={500} ... />`}
      >
        <div className="w-full">
          <StatefulFooter totalCount={500} initialPage={25} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-table"
        title="Dentro de uma tabela"
        description="O caso real — footer abaixo de uma tabela. Border-top divide visualmente."
        code={`<div className="rounded-radius-lg border border-border-default">
  <table>...</table>
  <div className="border-t border-border-default px-pad-3xl py-pad-md">
    <FooterTable totalCount={87} ... />
  </div>
</div>`}
      >
        <div className="w-full rounded-radius-lg border border-border-default overflow-hidden">
          {/* Mock table */}
          <div className="bg-bg-muted border-b border-border-default px-pad-2xl py-pad-md text-body-xs font-semibold text-fg-muted uppercase tracking-wider">
            Tabela mock — apenas pra contexto visual
          </div>
          <div className="px-pad-2xl py-pad-3xl text-body-sm font-normal text-fg-muted">
            (linhas da tabela viriam aqui)
          </div>
          <div className="border-t border-border-default px-pad-2xl py-pad-md">
            <StatefulFooter totalCount={87} selectionCount={1} />
          </div>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
