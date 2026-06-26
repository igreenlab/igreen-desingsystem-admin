# Documentation Pages — Guide

> Context file for creating new doc pages in the preview app.
> Load when: creating a new doc page, adding examples to existing page, or creating a foundation/agent doc page.

---

## Architecture

```
src/preview/
  components/         <- Shared building blocks (DocLayout, ExampleSection, etc.)
    index.ts          <- Barrel export
    doc-layout.tsx    <- Template: content + TOC (sidebar handled by App.tsx)
    doc-sidebar.tsx   <- Persistent sidebar with theme toggle
    doc-header.tsx    <- Category + title + description + dependency badge
    doc-section.tsx   <- SectionH2 + DocSeparator
    doc-example.tsx   <- Preview/Code tabs for component examples
    doc-props-table.tsx <- API reference table
    doc-toc.tsx       <- Scroll-spy table of contents
    doc-nav-data.ts   <- Shared nav with getDocNav() and getDocNavByHref()
    doc-context.tsx   <- DocNavProvider for cross-page navigation
  pages/              <- One file per doc page
    ButtonDoc.tsx
    ColorsDoc.tsx
    AgentsOverviewDoc.tsx
    ...
```

## Creating a new doc page

### Step 1 — Create the file

```tsx
// src/preview/pages/[Name]Doc.tsx
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable, getDocNav } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "size", type: '"sm" | "md" | "lg"', defaultVal: '"md"' },
  { name: "disabled", type: "boolean", defaultVal: "false" },
];

export function [Name]Doc() {
  return (
    <DocLayout toc={TOC}>  {/* NO sidebar prop — App.tsx handles it */}
      <DocHeader
        category="Form Controls"
        title="[Name]"
        description="Brief description."
        dependency="@radix-ui/react-[name]"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic usage."
        code={`<Component />`}
      >
        {/* Live preview */}
        <Component />
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
```

### Step 2 — Register in nav

Add entry to `src/preview/components/doc-nav-data.ts` in the correct section:

```ts
{ label: "[Name]", href: "[page-id]" },
```

### Step 3 — Register in App.tsx

1. Add import: `import { [Name]Doc } from "./preview/pages/[Name]Doc";`
2. Add to `DOC_PAGES` array: `"[page-id]"`
3. Add render: `{activePage === "[page-id]" && <[Name]Doc />}`

### Step 4 — Type check

```bash
npx tsc --noEmit
```

## Page types

### Component doc page

Uses ExampleSection with live previews + code snippets + PropsTable.

- Each example: unique `id` starting with `ex-`
- `code` prop: string showing the JSX snippet
- Preview area: component rendered live inside the card
- End with PropsTable for API reference

#### ⚠️ API Reference — padrão obrigatório (não aninhar)

`PropsTable` **já tem superfície própria** (ring/card). Renderize-o **direto**,
nunca dentro de `ExampleSection` (que é o card de _preview_) — senão vira
**card-dentro-de-card** (visual quebrado). Veja `SliderDoc`:

```tsx
<SectionH2 id="api-reference" title="API Reference" />;

{
  /* 1 tabela → direto */
}
<PropsTable items={PROPS} />;

{
  /* 2+ tabelas → cada uma num wrapper com espaçamento + sub-título h3 */
}
<div className="mb-gp-4xl" id="api-<nome>">
  <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Nome</h3>
  <p className="text-body-md text-fg-muted mb-gp-3xl">descrição</p>
  <PropsTable items={PROPS_X} />
</div>;
```

Regras:

- **1 só** `SectionH2 "API Reference"` (heading-xs + border-bottom). Sub-tabelas usam
  `h3 text-title-lg`, **não** outro `SectionH2`.
- `SectionH2` tem `mb-12` mas **sem margin-top** → tabelas consecutivas coladas. Por isso
  cada bloco de tabela precisa do wrapper `mb-gp-4xl` (espaçamento entre seções de API).
- `PropsTable` espera `{ name, type, defaultVal }[]` — passe um const de módulo (evita
  excess-property check).

### Foundation doc page (tokens)

Shows token values with visual indicators (color swatches, spacing bars, etc.).

- No ExampleSection — uses custom visualizations
- Shows token name, CSS var, CSS class, value
- Uses Badge for token labels

### Agent doc page

Uses consistent patterns:

- **Agent Hero Card**: colored left border (4px), dot icon, name + model badge + description
- **Feature Grid**: 2-column grid of cards with title + description
- **Content Card**: `rounded-radius-base border border-border bg-bg-surface shadow-sh-sm p-pad-card-base`
- **Info Row**: label (uppercase, w-[120px]) + value, separated by border-subtle
- **Signals Table**: compact table with Input/Output/Files rows
- **Checklist Card**: left accent border + checkmark items
- **Warning Card**: critical border/bg + cross-mark items

Agent accent colors (inline style only):

- Orchestrator: `#6366f1`
- Designer: `#f59e0b`
- Dev: `#10b981`
- Reviewer: `#3b82f6`

## Shared visual patterns

### Content Card (padding: p-pad-card-base = 24px)

```tsx
<div className="rounded-radius-base border border-border bg-bg-surface shadow-sh-sm p-pad-card-base">
  ...
</div>
```

### Content Card — compact (padding: p-pad-card-sm = 16px)

```tsx
<div className="rounded-radius-base border border-border bg-bg-surface shadow-sh-sm p-pad-card-sm">
  ...
</div>
```

### Feature Grid

```tsx
<div className="grid grid-cols-2 gap-gp-2xl">
  <div className="rounded-radius-base border border-border bg-bg-surface shadow-sh-sm p-pad-card-sm">
    <p className="text-body-sm font-semibold text-fg-foreground mb-gp-xs">
      Title
    </p>
    <p className="text-body-sm text-fg-muted">Description</p>
  </div>
</div>
```

### Table

```tsx
<div className="rounded-radius-base border border-border overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="bg-bg-subtle">
        <th className="text-left text-caption-sm font-semibold text-fg-muted font-medium py-pad-md px-pad-xl">
          Header
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-t border-border-subtle">
        <td className="py-pad-md px-pad-xl text-body-sm text-fg-foreground">
          Value
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Treeview (file structure)

```tsx
<div className="font-mono text-code-sm leading-loose">
  {[
    { depth: 0, name: "folder/", isDir: true },
    { depth: 1, name: "file.ts", desc: "description" },
  ].map((f, i) => (
    <div
      key={i}
      className="flex items-center gap-gp-xl"
      style={{ paddingLeft: f.depth * 20 }}
    >
      <span className="text-fg-subtle shrink-0">{f.isDir ? "📁" : "├─"}</span>
      <span
        className={
          f.isDir ? "text-fg-foreground font-semibold" : "text-fg-primary"
        }
      >
        {f.name}
      </span>
      {f.desc && <span className="text-fg-subtle">— {f.desc}</span>}
    </div>
  ))}
</div>
```

### Signals Table (compact)

```tsx
<div className="rounded-radius-base border border-border overflow-hidden">
  <table className="w-full">
    <tbody>
      <tr className="border-b border-border-subtle">
        <td className="text-caption-sm font-semibold text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl w-[100px]">
          Input
        </td>
        <td className="text-body-sm text-fg-foreground py-pad-md px-pad-xl">
          Value
        </td>
      </tr>
      <tr className="border-b border-border-subtle">
        <td className="text-caption-sm font-semibold text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">
          Output
        </td>
        <td className="text-body-sm py-pad-md px-pad-xl">
          <code className="font-mono text-code-sm text-fg-primary">SIGNAL</code>
        </td>
      </tr>
      <tr>
        <td className="text-caption-sm font-semibold text-fg-muted font-medium uppercase tracking-wider py-pad-md px-pad-xl">
          Files
        </td>
        <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-muted">
          file1.md, file2.md
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Section spacing

Every section follows this pattern:

```tsx
<SectionH2 id="section-id" title="Section Title" />
<div className="flex flex-col gap-gp-2xl mb-14">
  {/* section content */}
</div>
```

The `mb-14` ensures consistent spacing between sections (Tailwind literal — no DS equivalent exists for this margin).

## Rules

- **NO sidebar prop** on DocLayout — App.tsx renders the sidebar externally (persistent across pages)
- **All text in English**
- **DS classes only** — never raw Tailwind where a DS token exists
  - Padding: use `p-pad-card-base` (24px) or `p-pad-card-sm` (16px) for cards — NOT `p-pad-4xl` (doesn't exist)
  - Gap: use `gap-gp-*` classes
  - Typography: use `text-label-*`, `text-paragraph-*`, `text-code-*` presets
- **ExampleSection ids** start with `ex-`
- **code prop** is a string, not JSX
- **useState** for controlled examples — extract to named sub-components to keep hooks valid
- **Shadow on cards** — all content cards use `shadow-sh-sm`
- **TOC array** must match section ids exactly
