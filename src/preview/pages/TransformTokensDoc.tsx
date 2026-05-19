import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "pipeline", label: "Pipeline" },
  { id: "prefixes", label: "Anti-Collision Prefixes" },
  { id: "theme-css", label: "@theme Block" },
  { id: "dark-mode", label: "Dark Mode" },
  { id: "typography-utils", label: "Typography Utilities" },
  { id: "commands", label: "Commands" },
  { id: "consuming", label: "Consuming Tokens" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
      <pre className="whitespace-pre leading-relaxed">{children}</pre>
    </div>
  );
}

function PrefixRow({ token, cssVar, cssClass, avoids }: { token: string; cssVar: string; cssClass: string; avoids: string }) {
  return (
    <tr className="border-b border-border-subtle">
      <td className="py-pad-md pr-pad-xl text-body-xs text-fg-default font-mono">{token}</td>
      <td className="py-pad-md pr-pad-xl text-code-sm text-fg-brand font-mono">{cssVar}</td>
      <td className="py-pad-md pr-pad-xl text-code-sm text-fg-default font-mono">{cssClass}</td>
      <td className="py-pad-md text-body-md text-fg-muted">{avoids}</td>
    </tr>
  );
}

export function TransformTokensDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Transform Tokens"
        description="How tokens become usable CSS variables and Tailwind utility classes."
      />
      <DocSeparator />

      {/* Overview */}
      <SectionH2 id="overview" title="Overview" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Tokens are authored as plain TypeScript objects. A <strong className="text-fg-default">transform</strong> reads
          these objects and generates output for a target platform. The primary transform generates a
          Tailwind v4 theme CSS file that maps every token to a CSS custom property.
        </p>
        <p className="text-body-md text-fg-muted">
          This approach means tokens are the single source of truth — changing a value in{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">spacing.ts</code> automatically
          updates every Tailwind class that references it after running the transform command.
        </p>
      </div>

      {/* Pipeline */}
      <SectionH2 id="pipeline" title="Pipeline" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">The data flows in one direction:</p>
        <div className="flex items-center gap-gp-xl flex-wrap">
          <Badge color="secondary" variant="outline" size="md">Primitives (.ts)</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="secondary" variant="outline" size="md">Semantic (.ts)</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="primary" variant="soft" size="md">Transform</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="success" variant="soft" size="md">tailwind-theme.css</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="secondary" variant="outline" size="md">CSS vars</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="secondary" variant="outline" size="md">tv() classes</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="secondary" variant="outline" size="md">Component</Badge>
        </div>

        <p className="text-body-md text-fg-muted mt-gp-xl">
          The transform file <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">to-tailwind-v4.ts</code> imports
          all semantic token files, flattens nested objects into CSS variable names, and outputs three blocks:
        </p>
        <ul className="list-disc pl-sp-md flex flex-col gap-gp-md text-body-md text-fg-muted">
          <li><strong className="text-fg-default">@theme {"{ }"}</strong> — CSS vars that Tailwind v4 registers as utility classes</li>
          <li><strong className="text-fg-default">.dark {"{ }"}</strong> — Color and shadow overrides for dark mode</li>
          <li><strong className="text-fg-default">@utility text-* {"{ }"}</strong> — Composite typography presets</li>
        </ul>
      </div>

      {/* Prefixes */}
      <SectionH2 id="prefixes" title="Anti-Collision Prefixes" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Tailwind v4 automatically creates utility classes from CSS vars registered in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">@theme</code>.
          Without prefixes, our token names would override Tailwind built-ins (e.g.{" "}
          <code className="font-mono text-code-sm">--spacing-sm</code> would break{" "}
          <code className="font-mono text-code-sm">gap-sm</code>). Prefixes solve this.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-pad-md pr-pad-xl text-body-xs text-fg-default">Token</th>
                <th className="pb-pad-md pr-pad-xl text-body-xs text-fg-default">CSS Var</th>
                <th className="pb-pad-md pr-pad-xl text-body-xs text-fg-default">Class</th>
                <th className="pb-pad-md text-body-xs text-fg-default">Avoids collision with</th>
              </tr>
            </thead>
            <tbody>
              <PrefixRow token="gap" cssVar="--spacing-gp-*" cssClass="gap-gp-md" avoids="gap-4 (numeric)" />
              <PrefixRow token="space" cssVar="--spacing-sp-*" cssClass="p-sp-md" avoids="p-4 (numeric)" />
              <PrefixRow token="pad" cssVar="--spacing-pad-*" cssClass="px-pad-lg" avoids="px-3 (numeric)" />
              <PrefixRow token="radius" cssVar="--radius-radius-*" cssClass="rounded-radius-base" avoids="rounded-sm/md/lg" />
              <PrefixRow token="shadow" cssVar="--shadow-sh-*" cssClass="shadow-sh-md" avoids="shadow-sm/md/lg" />
              <PrefixRow token="form" cssVar="--spacing-form-*" cssClass="min-h-form-lg" avoids="—" />
              <PrefixRow token="icon" cssVar="--spacing-icon-*" cssClass="size-icon-md" avoids="—" />
              <PrefixRow token="container" cssVar="--container-*" cssClass="max-w-container-md" avoids="max-w-sm/md/lg" />
            </tbody>
          </table>
        </div>
      </div>

      {/* @theme block */}
      <SectionH2 id="theme-css" title="@theme Block" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">@theme</code> block
          registers CSS vars so Tailwind v4 generates utility classes automatically. Example output:
        </p>
        <CodeBlock>{`@theme {
  /* Colors (semantic v3: brand/danger/default) */
  --color-bg-brand: oklch(0.696 0.17 150.5);
  --color-bg-surface: oklch(1 0 0);
  --color-bg-danger: oklch(0.6368 0.2078 25.33);
  --color-fg-default: oklch(0.145 0 0);
  --color-fg-muted: oklch(0.556 0 0);
  --color-fg-on-brand: oklch(1 0 0);
  --color-ring-brand: color-mix(in oklch, oklch(0.696 0.17 150.5) 22%, transparent);

  /* Spacing (anti-collision prefixes) */
  --spacing-sp-md: 1rem;        /* → p-sp-md, m-sp-md */
  --spacing-gp-md: 0.5rem;      /* → gap-gp-md */
  --spacing-pad-xl: 0.625rem;   /* → px-pad-xl, py-pad-xl */

  /* Shape */
  --radius-radius-base: calc(0.625rem * 2.6);
  --radius-radius-sm: calc(0.625rem * 1);
  --radius-radius-lg: calc(0.625rem * 4);

  /* Shadows */
  --shadow-sh-md: 0 4px 6px -1px ...;

  /* Sizing */
  --spacing-form-lg: 2.5rem;    /* → min-h-form-lg */
  --spacing-icon-md: 1.25rem;   /* → size-icon-md */
}`}</CodeBlock>
      </div>

      {/* Dark Mode */}
      <SectionH2 id="dark-mode" title="Dark Mode" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Dark mode is a simple CSS class override. The same variable names get different values:
        </p>
        <CodeBlock>{`.dark {
  --color-bg-surface: oklch(0.205 0 0);
  --color-bg-brand: oklch(0.696 0.17 150.5);
  --color-fg-default: oklch(0.985 0 0);
  --color-fg-muted: oklch(0.708 0 0);
  --color-border-main: oklch(0.371 0 0);

  /* Shadows ≥ 2× light opacity, rings ≥ 1.5× alpha — L-011 */
  --shadow-sh-md: 0 4px 6px -1px oklch(0 0 0 / 0.4), ...;
  --color-ring-brand: color-mix(in oklch, oklch(0.696 0.17 150.5) 33%, transparent);
}`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Components don't need any dark mode logic — CSS vars resolve to the correct values automatically.
          Toggle by adding/removing the <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.dark</code> class on the root element.
        </p>
      </div>

      {/* Typography Utilities */}
      <SectionH2 id="typography-utils" title="Typography Utilities" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Typography presets are composite — they set font-size, line-height, weight, letter-spacing, and
          font-family in one class. These are generated as <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">@utility</code> blocks:
        </p>
        <CodeBlock>{`@utility text-body-md font-medium {
  font-size: 0.8125rem;
  line-height: 1.25rem;
  font-weight: 500;
  letter-spacing: 0em;
  font-family: 'Geist', sans-serif;
}

@utility text-body-md {
  font-size: 0.8125rem;
  line-height: 1.375rem;
  font-weight: 400;
  letter-spacing: 0em;
  font-family: 'Geist', sans-serif;
}

@utility text-heading-md {
  font-size: clamp(1.25rem, 0.893rem + 0.893vw, 1.5rem);
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: -0.01em;
  font-family: 'Geist', sans-serif;
}`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Use these instead of raw Tailwind typography classes. <code className="font-mono text-code-sm">text-body-md font-medium</code> replaces{" "}
          <code className="font-mono text-code-sm">text-sm font-medium</code>.
        </p>
      </div>

      {/* Commands */}
      <SectionH2 id="commands" title="Commands" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-[220px]">npm run tokens:tw4</code>
            <span className="text-body-md text-fg-muted">Generate Tailwind v4 theme CSS (primary)</span>
          </div>
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-[220px]">npm run tokens:css</code>
            <span className="text-body-md text-fg-muted">Generate vanilla CSS custom properties</span>
          </div>
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle">
            <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-[220px]">npm run tokens:dtcg</code>
            <span className="text-body-md text-fg-muted">Generate JSON tokens for Figma import</span>
          </div>
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl">
            <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-[220px]">npm run tokens:all</code>
            <span className="text-body-md text-fg-muted">Run all transforms at once</span>
          </div>
        </div>
      </div>

      {/* Consuming */}
      <SectionH2 id="consuming" title="Consuming Tokens" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          After running the transform, import the generated CSS in your app's stylesheet:
        </p>
        <CodeBlock>{`/* app.css */
@import "tailwindcss";
@import "@igreen/design-system/theme.css";`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          All DS utility classes are now available in your Tailwind markup:
        </p>
        <CodeBlock>{`<!-- Spacing -->
<div class="p-sp-md gap-gp-xl px-pad-3xl">

<!-- Colors -->
<p class="text-fg-default bg-bg-surface border-border-main">

<!-- Typography preset -->
<h2 class="text-heading-md">

<!-- Shape -->
<div class="rounded-radius-base shadow-sh-lg">

<!-- Sizing -->
<button class="min-h-form-xl">

<!-- Focus ring (per-color, never on base — L-001/L-003/L-004) -->
<button class="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand">`}</CodeBlock>
      </div>
    </DocLayout>
  );
}
