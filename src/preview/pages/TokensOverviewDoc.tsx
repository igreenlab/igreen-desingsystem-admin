import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "Why Tokens" },
  { id: "tiers", label: "3 Tiers" },
  { id: "folders", label: "Folder Layout" },
  { id: "naming", label: "Naming Convention" },
  { id: "prefixes", label: "Anti-collision Prefixes" },
  { id: "aliases", label: "Aliases & on-* Pattern" },
  { id: "dark-mode", label: "Dark Mode" },
  { id: "flow", label: "Token-to-CSS Flow" },
];

function TierCard({
  num,
  label,
  files,
  desc,
  consumers,
  color,
}: {
  num: string;
  label: string;
  files: string[];
  desc: string;
  consumers: string;
  color: string;
}) {
  return (
    <div
      className="rounded-radius-base border border-border-subtle p-pad-3xl"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <div className="flex items-center justify-between gap-gp-md mb-gp-md">
        <p className="text-body-md font-medium font-semibold text-fg-default">
          <span style={{ color }}>Tier {num}</span> — {label}
        </p>
        <Badge color="secondary" variant="outline" size="sm">{consumers}</Badge>
      </div>
      <p className="text-body-md text-fg-muted mb-gp-md">{desc}</p>
      <div className="border-t border-border-subtle pt-pad-md">
        <p className="text-caption-sm text-fg-subtle mb-gp-sm">Files:</p>
        <div className="flex flex-wrap gap-gp-xs">
          {files.map((f) => (
            <code key={f} className="text-caption-sm font-mono bg-bg-subtle px-pad-sm py-pad-xs rounded-radius-sm text-fg-muted">{f}</code>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrefixRow({
  prefix,
  cssVar,
  cssClass,
  example,
  avoid,
}: {
  prefix: string;
  cssVar: string;
  cssClass: string;
  example: string;
  avoid: string;
}) {
  return (
    <tr className="border-b border-border-subtle">
      <td className="py-pad-md pr-pad-xl text-body-xs text-fg-default font-mono">{prefix}</td>
      <td className="py-pad-md pr-pad-xl text-code-sm text-fg-brand font-mono">{cssVar}</td>
      <td className="py-pad-md pr-pad-xl text-code-sm text-fg-default font-mono">{cssClass}</td>
      <td className="py-pad-md pr-pad-xl text-body-md text-fg-muted">{example}</td>
      <td className="py-pad-md text-caption-sm text-fg-subtle line-through">{avoid}</td>
    </tr>
  );
}

export function TokensOverviewDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Foundations"
        title="Tokens Overview"
        description="The complete token architecture: 3 tiers, anti-collision prefixes, dark mode contract, and the flow from .ts file to Tailwind utility class."
      />
      <DocSeparator />

      {/* Why */}
      <SectionH2 id="what" title="Why Tokens" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Tokens são a única fonte de verdade do visual. Cada cor, spacing, radius, shadow e tipografia é
          declarada uma vez em um arquivo TypeScript. O transform principal gera o tema Tailwind v4 — toda
          mudança em um token atualiza automaticamente cada classe consumida pelos componentes.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            { title: "Single source of truth", desc: "Mudar um valor em spacing.ts atualiza toda classe gerada após npm run tokens:tw4." },
            { title: "Designed for SaaS density", desc: "Escalas otimizadas pra admin panels: form heights min 28-44px, gap/pad por categoria, tipografia com presets composições rem + clamp." },
            { title: "Multi-brand ready", desc: "tokens/brands/default/ pode ser duplicado para outras marcas mantendo o mesmo contrato." },
            { title: "Reversible", desc: "Tokens em git. Auditoria de mudança é git log/blame — sem mistério." },
          ].map((p) => (
            <div key={p.title} className="rounded-radius-base border border-border-subtle p-pad-3xl">
              <p className="text-body-md font-medium text-fg-default mb-gp-sm">{p.title}</p>
              <p className="text-body-md text-fg-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <SectionH2 id="tiers" title="3 Tiers" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A arquitetura é estritamente hierárquica. Tier 1 nunca aparece em componente. Tier 2 é a API pública.
          Tier 2.5 cobre escalas component-specific (form, icon, container).
        </p>
        <div className="grid grid-cols-1 gap-gp-2xl">
          <TierCard
            num="1"
            label="Primitives (private)"
            color="#6366f1"
            consumers="Consumed by Tier 2"
            desc="Valores brutos: escalas OKLCH, sistema base-4 (sp(n) = n*4px), font stacks, easings. NUNCA importado por componente."
            files={["color-palette.ts", "scales.ts", "fonts.ts", "motion.ts"]}
          />
          <TierCard
            num="2"
            label="Semantic (public API)"
            color="#10b981"
            consumers="Consumed by components via CSS vars"
            desc="Nomes com significado: bg.brand, fg.default, border.subtle, gap.md, radius.base, shadow.md. Light + Dark com mesmo contrato."
            files={[
              "color-light.ts",
              "color-dark.ts",
              "spacing.ts",
              "sizing.ts",
              "shape.ts",
              "elevation.ts",
              "typography.ts",
            ]}
          />
          <TierCard
            num="2.5"
            label="Component Tokens"
            color="#f59e0b"
            consumers="Used by tv() styles"
            desc="Escalas específicas por componente: form.lg (40px), icon.md (20px), padCard.base. Não substituem semantic — complementam."
            files={["components/sizing.ts", "components/spacing.ts"]}
          />
        </div>
      </div>

      {/* Folders */}
      <SectionH2 id="folders" title="Folder Layout" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Tudo vive em <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">tokens/brands/default/</code>.
          A pasta <code className="font-mono text-code-sm">brands/</code> existe para multi-brand futuro — hoje só temos a default.
        </p>
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-loose">
          <p className="text-fg-default font-semibold">tokens/</p>
          <p className="ml-sp-md">brands/</p>
          <p className="ml-sp-2xl">default/                          <span className="text-fg-subtle">← Brand iGreen</span></p>
          <p className="ml-sp-2xl ml-[40px]">primitives/                <span className="text-fg-subtle">← Tier 1</span></p>
          <p className="ml-sp-2xl ml-[60px]">color-palette.ts</p>
          <p className="ml-sp-2xl ml-[60px]">scales.ts</p>
          <p className="ml-sp-2xl ml-[60px]">fonts.ts</p>
          <p className="ml-sp-2xl ml-[60px]">motion.ts</p>
          <p className="ml-sp-2xl ml-[40px]">semantic/                  <span className="text-fg-subtle">← Tier 2</span></p>
          <p className="ml-sp-2xl ml-[60px]">color-light.ts</p>
          <p className="ml-sp-2xl ml-[60px]">color-dark.ts</p>
          <p className="ml-sp-2xl ml-[60px]">spacing.ts</p>
          <p className="ml-sp-2xl ml-[60px]">sizing.ts</p>
          <p className="ml-sp-2xl ml-[60px]">shape.ts</p>
          <p className="ml-sp-2xl ml-[60px]">elevation.ts</p>
          <p className="ml-sp-2xl ml-[60px]">typography.ts</p>
          <p className="ml-sp-2xl ml-[40px]">components/                <span className="text-fg-subtle">← Tier 2.5</span></p>
          <p className="ml-sp-2xl ml-[60px]">sizing.ts</p>
          <p className="ml-sp-2xl ml-[60px]">spacing.ts</p>
          <p className="ml-sp-md">transforms/                        <span className="text-fg-subtle">← Adapters</span></p>
          <p className="ml-sp-2xl">to-tailwind-v4.ts                <span className="text-fg-subtle">← Primary</span></p>
          <p className="ml-sp-2xl">to-css-vars.ts</p>
          <p className="ml-sp-2xl">to-dtcg.ts</p>
          <p className="ml-sp-2xl">to-js-theme.ts</p>
          <p className="ml-sp-md">index.ts                           <span className="text-fg-subtle">← Re-export</span></p>
        </div>
      </div>

      {/* Naming */}
      <SectionH2 id="naming" title="Naming Convention (V3)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O DS usa nomenclatura V3: <strong className="text-fg-default">brand</strong> em vez de <code className="font-mono text-code-sm">primary</code>,{" "}
          <strong className="text-fg-default">danger</strong> em vez de <code className="font-mono text-code-sm">critical</code>,{" "}
          <strong className="text-fg-default">default</strong> em vez de <code className="font-mono text-code-sm">foreground</code>.
          A migração foi feita para alinhar primitivo, semantic e CSS gerado.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[160px_160px_1fr] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">V2 (obsoleto)</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">V3 (atual)</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Onde aparece</div>
          </div>
          {[
            { old: "primary", new: "brand", where: "Cor da marca (bg-bg-brand, ring-ring-brand, fg-on-brand)" },
            { old: "critical", new: "danger", where: "Feedback destrutivo (bg-bg-danger, fg-fg-danger). APIs antigas como Button.color='critical' permanecem por compat." },
            { old: "foreground", new: "default", where: "Texto base neutro (text-fg-default)" },
            { old: "subtle (suffix bg)", new: "muted", where: "bg.danger-muted, border.success-muted (fundo suave)" },
          ].map((r) => (
            <div key={r.old} className="grid grid-cols-[160px_160px_1fr] gap-0 border-t border-border-subtle">
              <div className="py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-subtle line-through">{r.old}</code></div>
              <div className="py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">{r.new}</code></div>
              <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">{r.where}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Prefixes */}
      <SectionH2 id="prefixes" title="Anti-collision Prefixes" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Tailwind v4 gera utility classes a partir de <code className="font-mono text-code-sm">@theme</code>.
          Sem prefixos, nossos tokens sobrescreveriam classes nativas (<code className="font-mono text-code-sm">gap-md</code>,{" "}
          <code className="font-mono text-code-sm">rounded-lg</code>). Os prefixos resolvem.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="pb-pad-md pr-pad-xl text-body-xs text-fg-default">Token</th>
                <th className="pb-pad-md pr-pad-xl text-body-xs text-fg-default">CSS Var</th>
                <th className="pb-pad-md pr-pad-xl text-body-xs text-fg-default">Class</th>
                <th className="pb-pad-md pr-pad-xl text-body-xs text-fg-default">Example</th>
                <th className="pb-pad-md text-body-xs text-fg-default">Avoids</th>
              </tr>
            </thead>
            <tbody>
              <PrefixRow prefix="gap" cssVar="--spacing-gp-*" cssClass="gap-gp-md" example="Flex/grid gap" avoid="gap-4" />
              <PrefixRow prefix="space" cssVar="--spacing-sp-*" cssClass="p-sp-md" example="Generic padding/margin" avoid="p-4" />
              <PrefixRow prefix="pad" cssVar="--spacing-pad-*" cssClass="px-pad-lg" example="Button/input padding" avoid="px-3" />
              <PrefixRow prefix="radius" cssVar="--radius-radius-*" cssClass="rounded-radius-base" example="Card radius" avoid="rounded-md" />
              <PrefixRow prefix="shadow" cssVar="--shadow-sh-*" cssClass="shadow-sh-md" example="Card elevation" avoid="shadow-md" />
              <PrefixRow prefix="form" cssVar="--spacing-form-*" cssClass="min-h-form-lg" example="Input/button height" avoid="h-10" />
              <PrefixRow prefix="icon" cssVar="--spacing-icon-*" cssClass="size-icon-md" example="Icon size" avoid="size-5" />
              <PrefixRow prefix="container" cssVar="--container-*" cssClass="max-w-container-md" example="Page container" avoid="max-w-md" />
            </tbody>
          </table>
        </div>
      </div>

      {/* Aliases */}
      <SectionH2 id="aliases" title="Aliases & on-* Pattern" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O DS tem dois padrões de "texto sobre fundo" — eles parecem similares mas resolvem problemas diferentes.
        </p>
        <div className="grid grid-cols-2 gap-gp-3xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md"><code className="font-mono text-code-sm">on-*</code> — texto sobre cor de marca</p>
            <p className="text-body-md text-fg-muted mb-gp-md">
              Quando o fundo É uma cor específica (bg.brand, bg.danger). Existe pra cada cor semântica.
            </p>
            <ul className="list-disc pl-sp-md flex flex-col gap-gp-xs text-body-md text-fg-muted">
              <li><code className="font-mono text-code-sm">fg.on-brand</code> → texto sobre bg.brand</li>
              <li><code className="font-mono text-code-sm">fg.on-danger</code> → texto sobre bg.danger</li>
              <li><code className="font-mono text-code-sm">fg.on-success</code> → texto sobre bg.success</li>
            </ul>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md"><code className="font-mono text-code-sm">*-inverted</code> — papel neutro invertido</p>
            <p className="text-body-md text-fg-muted mb-gp-md">
              Quando o papel é o mesmo mas o contexto inverteu (ex: tooltip escuro num tema light).
            </p>
            <ul className="list-disc pl-sp-md flex flex-col gap-gp-xs text-body-md text-fg-muted">
              <li><code className="font-mono text-code-sm">fg.default-inverted</code> → texto sobre surface invertida</li>
              <li><code className="font-mono text-code-sm">bg.surface-inverted</code> → tooltip, toast escuro</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dark Mode */}
      <SectionH2 id="dark-mode" title="Dark Mode" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Dark mode é só um override de CSS vars sob <code className="font-mono text-code-sm">.dark {"{}"}</code>.
          Componentes não precisam de lógica — CSS resolve sozinho.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`.dark {
  --color-bg-surface: oklch(0.205 0 0);
  --color-fg-default: oklch(0.985 0 0);
  --color-border-default: oklch(0.371 0 0);

  /* L-011: shadows ≥ 2× light opacity, rings ≥ 1.5× alpha */
  --shadow-sh-md: 0 4px 6px -1px oklch(0 0 0 / 0.4);
  --color-ring-brand: color-mix(in oklch, oklch(0.696 0.17 150.5) 33%, transparent);
}`}</pre>
        </div>
        <p className="text-body-md text-fg-muted">
          Regras críticas do dark (L-008 a L-011): hierarquia bg crescente (canvas {"<"} surface {"<"} subtle {"<"} muted),
          border ≥ surface + 6% lightness, shadows {"≥"} 2× light, rings {"≥"} 1.5× alpha.
        </p>
      </div>

      {/* Flow */}
      <SectionH2 id="flow" title="Token-to-CSS Flow" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O fluxo é unidirecional. Você edita um arquivo <code className="font-mono text-code-sm">.ts</code>,
          roda o transform, e o CSS gerado é importado pelo app.
        </p>
        <div className="flex items-center gap-gp-xl flex-wrap mb-gp-md">
          <Badge color="secondary" variant="outline" size="md">Primitives (.ts)</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="secondary" variant="outline" size="md">Semantic (.ts)</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="primary" variant="soft" size="md">Transform (tsx)</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="success" variant="soft" size="md">tailwind-theme.css</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="secondary" variant="outline" size="md">tv() classes</Badge>
          <span className="text-fg-subtle">→</span>
          <Badge color="secondary" variant="outline" size="md">Component</Badge>
        </div>
        <p className="text-body-md text-fg-muted">
          Para detalhes do transform e como o <code className="font-mono text-code-sm">@theme</code> block é gerado,
          veja <strong className="text-fg-default">Get Started → Transform Tokens</strong>.
        </p>
      </div>
    </DocLayout>
  );
}
