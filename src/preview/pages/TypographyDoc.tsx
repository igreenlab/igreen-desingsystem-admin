import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "display", label: "Display" },
  { id: "heading", label: "Heading" },
  { id: "title", label: "Title" },
  { id: "body", label: "Body" },
  { id: "caption", label: "Caption" },
  { id: "stat", label: "Stat" },
  { id: "code", label: "Code" },
  { id: "overrides", label: "Overrides convencionais" },
];

/* ── Typography Sample ──────────────────────────────────────────────────── */
function TypeSample({ preset, label, size, weight, lineHeight, tracking, hint }: {
  preset: string; label: string; size: string; weight: string; lineHeight: string; tracking: string; hint?: string;
}) {
  return (
    <div className="mb-14 scroll-mt-6">
      <div className="flex items-center gap-gp-md mb-gp-xl">
        <p className="text-body-xs text-fg-brand">{label}</p>
        {hint && <span className="text-caption-sm text-fg-muted">— {hint}</span>}
      </div>
      <p className={`${preset} text-fg-default mb-gp-4xl`}>The quick brown fox jumps over the lazy dog.</p>
      <div className="flex flex-wrap gap-gp-md">
        <Badge color="secondary" variant="outline" size="sm">Class: {preset}</Badge>
        <Badge color="secondary" variant="outline" size="sm">Weight: {weight}</Badge>
        <Badge color="secondary" variant="outline" size="sm">Font Size: {size}</Badge>
        <Badge color="secondary" variant="outline" size="sm">Line Height: {lineHeight}</Badge>
        <Badge color="secondary" variant="outline" size="sm">Letter Spacing: {tracking}</Badge>
      </div>
      <div className="border-b border-border-subtle mt-gp-4xl" />
    </div>
  );
}

/* ── Role card (Overview) ──────────────────────────────────────────────── */
function RoleCard({ name, tiers, weight, use }: { name: string; tiers: string; weight: string; use: string }) {
  return (
    <div className="flex flex-col gap-gp-sm p-pad-2xl rounded-radius-lg border border-border-subtle bg-bg-surface">
      <p className="text-body-md font-semibold text-fg-default">{name}</p>
      <p className="text-caption-sm text-fg-muted">{tiers}</p>
      <p className="text-caption-sm text-fg-muted"><span className="font-medium">Weight default:</span> {weight}</p>
      <p className="text-body-md text-fg-default mt-gp-xs">{use}</p>
    </div>
  );
}

export function TypographyDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Foundations"
        title="Typography"
        description="7 roles, 27 presets. Cada preset combina font-size + line-height + font-weight + letter-spacing + font-family. Override de peso/leading/tracking via Tailwind nativo (font-bold, leading-none, tracking-wider, etc)."
      />

      <DocSeparator />

      {/* ── Overview ───────────────────────────────────────────────────── */}
      <div id="overview" className="scroll-mt-6">
        <SectionH2 id="overview" title="Overview" />
        <p className="text-body-md text-fg-muted mb-gp-4xl max-w-[680px]">
          O sistema é dividido em 7 roles. <span className="text-body-md font-semibold text-fg-default">Body</span> é
          o role central (texto corrido + interactive). <span className="text-body-md font-semibold text-fg-default">Display</span>{" "}
          e <span className="text-body-md font-semibold text-fg-default">Heading</span> escalam fluid via clamp().
          Os demais são estáticos em rem.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gp-2xl mb-gp-6xl">
          <RoleCard name="Display" tiers="md / lg / xl / 2xl (≥ 28px)" weight="600 / 700 conforme tier" use="Hero, landing pages, marketing." />
          <RoleCard name="Heading" tiers="xs (24px) / sm/md/lg/xl (fluid)" weight="500 (medium)" use="Títulos de página, modais grandes." />
          <RoleCard name="Title" tiers="sm (14) / md (16) / lg (20)" weight="600 (semibold)" use="Card titles, section titles, modal/panel headers." />
          <RoleCard name="Body" tiers="xs (12) / sm (13) / md (14) / lg (16) / xl (18) / 2xl (24)" weight="xs/sm = 500; md-2xl = 400" use="Texto corrido (md+) e interactive (xs/sm: button, dropdown, input, table cell)." />
          <RoleCard name="Caption" tiers="xs (10) / sm (11) / md (12)" weight="400 (regular)" use="Helpers, microlabels, timestamps, meta info." />
          <RoleCard name="Code" tiers="sm (13) / md (16)" weight="400 (mono)" use="Código inline e blocos." />
        </div>
      </div>

      <DocSeparator />

      {/* ── Display ────────────────────────────────────────────────────── */}
      <div id="display" className="scroll-mt-6">
        <SectionH2 id="display" title="Display" />
        <p className="text-body-md text-fg-muted mb-gp-4xl">Fluid clamp(). Hero sections, marketing pages. Viewport range: 375px → 1280px.</p>
        <TypeSample preset="text-display-2xl" label="Display / 2XL" size="clamp(2.5rem, 4.75rem)" weight="Bold / 700" lineHeight="1.1" tracking="-2%" />
        <TypeSample preset="text-display-xl" label="Display / XL" size="clamp(2.25rem, 3.81rem)" weight="Bold / 700" lineHeight="1.1" tracking="-2%" />
        <TypeSample preset="text-display-lg" label="Display / LG" size="clamp(2rem, 3.06rem)" weight="Semibold / 600" lineHeight="1.15" tracking="-1%" />
        <TypeSample preset="text-display-md" label="Display / MD" size="clamp(1.75rem, 2.44rem)" weight="Semibold / 600" lineHeight="1.15" tracking="-1%" />
      </div>

      {/* ── Heading ────────────────────────────────────────────────────── */}
      <div id="heading" className="scroll-mt-6">
        <SectionH2 id="heading" title="Heading" />
        <p className="text-body-md text-fg-muted mb-gp-4xl">Títulos de página e modais. sm–xl fluid; xs estático.</p>
        <TypeSample preset="text-heading-xl" label="Heading / XL" size="clamp(2.25rem, 3.5rem)" weight="Medium / 500" lineHeight="1.15" tracking="-1%" />
        <TypeSample preset="text-heading-lg" label="Heading / LG" size="clamp(2rem, 3rem)" weight="Medium / 500" lineHeight="1.2" tracking="-1%" />
        <TypeSample preset="text-heading-md" label="Heading / MD" size="clamp(1.75rem, 2.5rem)" weight="Medium / 500" lineHeight="1.2" tracking="-1%" />
        <TypeSample preset="text-heading-sm" label="Heading / SM" size="clamp(1.5rem, 2rem)" weight="Medium / 500" lineHeight="1.25" tracking="0" />
        <TypeSample preset="text-heading-xs" label="Heading / XS" size="1.5rem (24px)" weight="Medium / 500" lineHeight="2rem" tracking="0" hint="estático" />
      </div>

      {/* ── Title ──────────────────────────────────────────────────────── */}
      <div id="title" className="scroll-mt-6">
        <SectionH2 id="title" title="Title" />
        <p className="text-body-md text-fg-muted mb-gp-4xl">
          Card titles, section headers, modal/panel titles. Weight <span className="font-semibold text-fg-default">600 (semibold)</span> default.
        </p>
        <TypeSample preset="text-title-lg" label="Title / LG" size="1.25rem (20px)" weight="Semibold / 600" lineHeight="1.75rem" tracking="0" />
        <TypeSample preset="text-title-md" label="Title / MD" size="1rem (16px)" weight="Semibold / 600" lineHeight="1.5rem" tracking="-1.1%" />
        <TypeSample preset="text-title-sm" label="Title / SM" size="0.875rem (14px)" weight="Semibold / 600" lineHeight="1.25rem" tracking="-0.6%" />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <div id="body" className="scroll-mt-6">
        <SectionH2 id="body" title="Body" />
        <p className="text-body-md text-fg-muted mb-gp-4xl max-w-[680px]">
          Role central. <span className="font-semibold text-fg-default">body-sm (13/500)</span> é o body default do projeto —
          aparece em buttons, dropdowns, inputs, table cells. <span className="font-semibold text-fg-default">body-xs/sm</span> têm
          weight 500 (interactive); <span className="font-semibold text-fg-default">body-md+</span> têm weight 400 (corrido).
        </p>
        <TypeSample preset="text-body-2xl" label="Body / 2XL" size="1.5rem (24px)" weight="Regular / 400" lineHeight="2rem" tracking="-1.5%" />
        <TypeSample preset="text-body-xl" label="Body / XL" size="1.125rem (18px)" weight="Regular / 400" lineHeight="1.5rem" tracking="-1.5%" />
        <TypeSample preset="text-body-lg" label="Body / LG" size="1rem (16px)" weight="Regular / 400" lineHeight="1.5rem" tracking="-1.1%" />
        <TypeSample preset="text-body-md" label="Body / MD" size="0.875rem (14px)" weight="Regular / 400" lineHeight="1.25rem" tracking="-0.6%" />
        <TypeSample preset="text-body-sm" label="Body / SM" size="0.8125rem (13px)" weight="Medium / 500" lineHeight="1.125rem" tracking="-0.3%" hint="body default do projeto — interactive" />
        <TypeSample preset="text-body-xs" label="Body / XS" size="0.75rem (12px)" weight="Medium / 500" lineHeight="1rem" tracking="0" hint="interactive small (chip, sub-item)" />
      </div>

      {/* ── Caption ────────────────────────────────────────────────────── */}
      <div id="caption" className="scroll-mt-6">
        <SectionH2 id="caption" title="Caption" />
        <p className="text-body-md text-fg-muted mb-gp-4xl">Helpers, microlabels, timestamps, meta info. Weight 400 (regular).</p>
        <TypeSample preset="text-caption-md" label="Caption / MD" size="0.75rem (12px)" weight="Regular / 400" lineHeight="1rem" tracking="0" />
        <TypeSample preset="text-caption-sm" label="Caption / SM" size="0.6875rem (11px)" weight="Regular / 400" lineHeight="0.875rem" tracking="0" />
        <TypeSample preset="text-caption-xs" label="Caption / XS" size="0.625rem (10px)" weight="Regular / 400" lineHeight="0.75rem" tracking="0" hint="badge meta, micro caption" />
      </div>

      {/* ── Stat ───────────────────────────────────────────────────────── */}
      <div id="stat" className="scroll-mt-6">
        <SectionH2 id="stat" title="Stat" />
        <p className="text-body-md text-fg-muted mb-gp-4xl">Número de métrica/KPI. Estático (não encolhe no mobile), bold, leading apertado. Pareie com <code className="text-code-sm">tabular-nums</code>. Consumido pelo componente <code className="text-code-sm">Kpi</code> (prop <code className="text-code-sm">size</code>).</p>
        <TypeSample preset="text-stat-xl" label="Stat / XL" size="2.125rem (34px)" weight="Bold / 700" lineHeight="1.05" tracking="-2%" hint="KPI hero de dashboard" />
        <TypeSample preset="text-stat-lg" label="Stat / LG" size="1.875rem (30px)" weight="Bold / 700" lineHeight="1.1" tracking="-1.5%" hint="KPI prominente" />
        <TypeSample preset="text-stat-md" label="Stat / MD" size="1.5rem (24px)" weight="Bold / 700" lineHeight="1.15" tracking="-1%" hint="KPI padrão (Kpi default)" />
        <TypeSample preset="text-stat-sm" label="Stat / SM" size="1.25rem (20px)" weight="Bold / 700" lineHeight="1.2" tracking="-1%" hint="mini-stat, resumo compacto" />
      </div>

      {/* ── Code ───────────────────────────────────────────────────────── */}
      <div id="code" className="scroll-mt-6">
        <SectionH2 id="code" title="Code" />
        <p className="text-body-md text-fg-muted mb-gp-4xl">Mono regular. Código inline e blocos.</p>
        <TypeSample preset="text-code-md" label="Code / MD" size="1rem (16px)" weight="Regular / 400" lineHeight="1.6" tracking="0" />
        <TypeSample preset="text-code-sm" label="Code / SM" size="0.8125rem (13px)" weight="Regular / 400" lineHeight="1.6" tracking="0" />
      </div>

      <DocSeparator />

      {/* ── Overrides ──────────────────────────────────────────────────── */}
      <div id="overrides" className="scroll-mt-6">
        <SectionH2 id="overrides" title="Overrides convencionais" />
        <p className="text-body-md text-fg-muted mb-gp-4xl max-w-[680px]">
          Preset cobre size + lh + weight + tracking + family. Quando precisar diferente, use Tailwind nativo:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gp-2xl mb-gp-6xl">
          <div className="flex flex-col gap-gp-sm p-pad-2xl rounded-radius-lg border border-border-subtle bg-bg-surface">
            <p className="text-body-md font-semibold text-fg-default">Weight</p>
            <code className="text-code-sm text-fg-muted">font-bold</code>
            <code className="text-code-sm text-fg-muted">font-semibold</code>
            <code className="text-code-sm text-fg-muted">font-medium</code>
            <code className="text-code-sm text-fg-muted">font-normal</code>
            <p className="text-caption-sm text-fg-muted mt-gp-sm">
              Ex: <code className="text-code-sm">text-body-md font-semibold</code> = 14px / 600
            </p>
          </div>
          <div className="flex flex-col gap-gp-sm p-pad-2xl rounded-radius-lg border border-border-subtle bg-bg-surface">
            <p className="text-body-md font-semibold text-fg-default">Line-height</p>
            <code className="text-code-sm text-fg-muted">leading-none</code>
            <code className="text-code-sm text-fg-muted">leading-snug</code>
            <code className="text-code-sm text-fg-muted">leading-relaxed</code>
            <code className="text-code-sm text-fg-muted">leading-[1.45]</code>
            <p className="text-caption-sm text-fg-muted mt-gp-sm">
              Ex: <code className="text-code-sm">text-body-sm leading-none</code> = botão sem espaço vertical extra
            </p>
          </div>
          <div className="flex flex-col gap-gp-sm p-pad-2xl rounded-radius-lg border border-border-subtle bg-bg-surface">
            <p className="text-body-md font-semibold text-fg-default">Letter-spacing</p>
            <code className="text-code-sm text-fg-muted">tracking-wider</code>
            <code className="text-code-sm text-fg-muted">tracking-widest</code>
            <code className="text-code-sm text-fg-muted">tracking-tight</code>
            <code className="text-code-sm text-fg-muted">tracking-[0.06em]</code>
            <p className="text-caption-sm text-fg-muted mt-gp-sm">
              Ex: <code className="text-code-sm">text-caption-sm uppercase tracking-wider</code> = section header
            </p>
          </div>
        </div>

        <div className="p-pad-2xl rounded-radius-lg border border-border-warning-muted bg-bg-warning-muted/40">
          <p className="text-body-md font-semibold text-fg-default mb-gp-sm">⚠️ Atenção L-016</p>
          <p className="text-body-md text-fg-default">
            Ao adicionar novo preset em <code className="text-code-sm">typography.ts</code>, registrar IMEDIATAMENTE em
            <code className="text-code-sm"> src/utils/tv.ts</code> (<code className="text-code-sm">twMergeConfig.extend.classGroups["font-size"][0].text</code>).
            Senão o <code className="text-code-sm">tailwind-merge</code> remove a classe silenciosamente — visual quebra sem erro.
          </p>
        </div>
      </div>
    </DocLayout>
  );
}
