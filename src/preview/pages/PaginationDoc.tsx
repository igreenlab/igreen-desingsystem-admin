import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from "../../components/shadcn/pagination";
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
  { id: "ex-basic", label: "Basic (controlled)" },
  { id: "ex-many", label: "Many pages + ellipsis" },
  { id: "ex-no-edges", label: "Sem first/last" },
  { id: "ex-disabled", label: "Disabled states" },
  { id: "ex-helper", label: "Helper getPaginationRange" },
  { id: "api", label: "API Reference" },
];

const PARTS = [
  {
    name: "Pagination",
    type: "nav wrapper",
    defaultVal: "—",
  },
  {
    name: "PaginationContent",
    type: "ul container segmented (bg-muted)",
    defaultVal: "—",
  },
  {
    name: "PaginationItem",
    type: "li wrapper",
    defaultVal: "—",
  },
  {
    name: "PaginationLink",
    type: "button da página",
    defaultVal: "isActive?: boolean",
  },
  {
    name: "PaginationFirst / Last",
    type: "« »",
    defaultVal: "—",
  },
  {
    name: "PaginationPrevious / Next",
    type: "‹ ›",
    defaultVal: "—",
  },
  {
    name: "PaginationEllipsis",
    type: "…",
    defaultVal: "—",
  },
];

function ControlledPagination({ total }: { total: number }) {
  const [page, setPage] = useState(1);
  const pages = getPaginationRange(page, total);

  return (
    <Pagination>
      <PaginationFirst
        onClick={() => setPage(1)}
        disabled={page === 1}
      />
      <PaginationPrevious
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
      />
      <PaginationContent>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === page}
                onClick={() => setPage(p)}
                aria-label={`Página ${p}`}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
      </PaginationContent>
      <PaginationNext
        onClick={() => setPage((p) => Math.min(total, p + 1))}
        disabled={page === total}
      />
      <PaginationLast
        onClick={() => setPage(total)}
        disabled={page === total}
      />
    </Pagination>
  );
}

export function PaginationDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Navigation"
        title="Pagination"
        description="Navegação entre páginas. Composição de partes (Pagination + Content + Item + Link + nav buttons). Pra paginação completa com page-size select e range '1–10 de 87' → use FooterTable."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Basic (controlled)"
        description="9 páginas — mostra todas (sem ellipsis até 7). Estado controlado pelo consumidor."
        code={`const [page, setPage] = useState(1);
const total = 9;
const pages = getPaginationRange(page, total);

<Pagination>
  <PaginationFirst onClick={() => setPage(1)} disabled={page === 1} />
  <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} />
  <PaginationContent>
    {pages.map((p, i) =>
      p === "ellipsis" ? (
        <PaginationItem key={\`e-\${i}\`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={p}>
          <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
            {p}
          </PaginationLink>
        </PaginationItem>
      )
    )}
  </PaginationContent>
  <PaginationNext onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page === total} />
  <PaginationLast onClick={() => setPage(total)} disabled={page === total} />
</Pagination>`}
      >
        <ControlledPagination total={9} />
      </ExampleSection>

      <ExampleSection
        id="ex-many"
        title="Many pages + ellipsis"
        description="20 páginas — helper insere '…' nos gaps. Tente ir pra página 10 e ver as bordas."
        code={`<ControlledPagination total={20} />`}
      >
        <ControlledPagination total={20} />
      </ExampleSection>

      <ExampleSection
        id="ex-no-edges"
        title="Sem botões « »"
        description="Em UIs compactas, omita PaginationFirst/Last — só prev/next."
        code={`<Pagination>
  <PaginationPrevious disabled={page === 1} />
  <PaginationContent>...</PaginationContent>
  <PaginationNext disabled={page === total} />
</Pagination>`}
      >
        <CompactPagination total={10} />
      </ExampleSection>

      <ExampleSection
        id="ex-disabled"
        title="Disabled states"
        description="Nav buttons mostram opacity 35% quando disabled. PaginationLink usa opacity 50%."
        code={`<PaginationFirst disabled />
<PaginationPrevious disabled />
<PaginationLink isActive disabled>5</PaginationLink>`}
      >
        <Pagination>
          <PaginationFirst disabled />
          <PaginationPrevious disabled />
          <PaginationContent>
            <PaginationItem>
              <PaginationLink isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>3</PaginationLink>
            </PaginationItem>
          </PaginationContent>
          <PaginationNext disabled />
          <PaginationLast disabled />
        </Pagination>
      </ExampleSection>

      <ExampleSection
        id="ex-helper"
        title="Helper getPaginationRange"
        description="Função pura que retorna o array de páginas com ellipsis. Útil pra montar a UI."
        code={`getPaginationRange(1, 5)
// [1, 2, 3, 4, 5]

getPaginationRange(5, 20)
// [1, 2, "ellipsis", 4, 5, 6, "ellipsis", 19, 20]

getPaginationRange(1, 20)
// [1, 2, "ellipsis", 19, 20]

getPaginationRange(20, 20)
// [1, 2, "ellipsis", 19, 20]`}
      >
        <div className="font-mono text-body-xs font-normal text-fg-muted bg-bg-muted rounded-radius-md p-pad-2xl">
          <div>getPaginationRange(1, 5) → [{getPaginationRange(1, 5).join(", ")}]</div>
          <div>getPaginationRange(5, 20) → [{getPaginationRange(5, 20).join(", ")}]</div>
          <div>getPaginationRange(1, 20) → [{getPaginationRange(1, 20).join(", ")}]</div>
          <div>getPaginationRange(20, 20) → [{getPaginationRange(20, 20).join(", ")}]</div>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PARTS} />
    </DocLayout>
  );
}

function CompactPagination({ total }: { total: number }) {
  const [page, setPage] = useState(1);
  const pages = getPaginationRange(page, total);

  return (
    <Pagination>
      <PaginationPrevious
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
      />
      <PaginationContent>
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink isActive={p === page} onClick={() => setPage(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
      </PaginationContent>
      <PaginationNext
        onClick={() => setPage((p) => Math.min(total, p + 1))}
        disabled={page === total}
      />
    </Pagination>
  );
}
