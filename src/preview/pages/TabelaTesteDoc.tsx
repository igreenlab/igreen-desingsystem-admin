import { TabelaTeste } from "../../components/ui/TabelaTeste";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
} from "../components";

const TOC = [
  { id: "preview", label: "Preview" },
  { id: "notes", label: "Notas" },
];

export function TabelaTesteDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Templates"
        title="Tabela Teste"
        description="Réplica visual hardcoded da tabela do sandbox /design-and-table-v2. Sem props — 13 colunas fixas, 10 rows mock, densidade comfortable, cell-borders on. Serve como referência fixa de como tokens DS mapeiam pra esse layout."
      />

      <DocSeparator />

      <SectionH2 id="preview" title="Preview" />

      <ExampleSection
        id="ex-preview"
        title="Renderização"
        description="Click numa row pra ver o estado 'open' (mesmo visual de selected). Click no checkbox pra selecionar. Hover nas colunas mostra menu ⋮ + resize handle (linha brand 100vh projeta pra baixo)."
      >
        <div className="h-[640px] flex">
          <TabelaTeste />
        </div>
      </ExampleSection>

      <SectionH2 id="notes" title="Notas" />

      <div className="prose prose-sm text-fg-default max-w-none flex flex-col gap-gp-md">
        <p>
          Componente <strong>de referência</strong> — não destinado a uso direto em telas
          de produto. Pra tabela parametrizada com props/columns/rows, ver <code>Table</code>.
        </p>
        <p>
          <strong>Tokens consumidos:</strong>{" "}
          <code>bg.table</code>, <code>bg.table-head</code>, <code>bg.table-row-hover</code>,
          {" "}<code>bg.table-row-selected</code>, <code>bg.table-row-selected-hover</code>,
          {" "}<code>border.table</code>, <code>bg.brand</code>, <code>bg.brand-subtle</code>,
          {" "}<code>fg.on-brand</code>, <code>bg.surface</code>, <code>bg.muted</code>,
          {" "}<code>bg.input</code>, <code>border.input</code>, <code>border.brand</code>,
          {" "}<code>fg.default</code>, <code>fg.muted</code>, <code>fg.brand</code>,
          {" "}<code>fg.success/warning/info/danger</code>, <code>bg.&lt;status&gt;-muted</code>.
        </p>
        <p>
          <strong>Hex hardcoded permitido:</strong> apenas <code>avatarColor</code> de cada row
          (cor personalizada por entidade — não vai pra tokens).
        </p>
        <p>
          <strong>Spec completa:</strong>{" "}
          <code>Modelo/.ai/specs/table-replica-from-sandbox.md</code>.
        </p>
      </div>
    </DocLayout>
  );
}

export default TabelaTesteDoc;
