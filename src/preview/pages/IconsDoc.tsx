import { useState } from "react";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection } from "../components";
import { Badge } from "../../components/shadcn/badge";
import { Input } from "../../components/shadcn/input";
import {
  Search, Home, Settings, User, Bell, Mail, Heart, Star, Plus, Minus,
  Check, X, ChevronDown, ChevronRight, ChevronLeft, ChevronUp,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Eye, EyeOff, Lock, Unlock, Trash2, Edit3, Copy, Download, Upload,
  Sun, Moon, Zap, Shield, Globe, Phone, Calendar, Clock,
  AlertCircle, AlertTriangle, CheckCircle, Info, HelpCircle, XCircle,
  Loader2, RefreshCw, ExternalLink, Link, Share2,
  FileText, Folder, Image, Camera, Video, Mic,
  type LucideIcon,
} from "lucide-react";

const TOC = [
  { id: "usage", label: "Usage" },
  { id: "ex-basic", label: "Basic" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-colors", label: "Colors" },
  { id: "ex-button", label: "In Buttons" },
  { id: "ex-input", label: "In Inputs" },
  { id: "library", label: "Icon Library" },
  { id: "guidelines", label: "Guidelines" },
];

const ICON_GROUPS: { title: string; icons: { name: string; Icon: LucideIcon }[] }[] = [
  {
    title: "Navigation",
    icons: [
      { name: "Home", Icon: Home }, { name: "Search", Icon: Search }, { name: "Settings", Icon: Settings },
      { name: "ChevronDown", Icon: ChevronDown }, { name: "ChevronRight", Icon: ChevronRight },
      { name: "ChevronLeft", Icon: ChevronLeft }, { name: "ChevronUp", Icon: ChevronUp },
      { name: "ArrowRight", Icon: ArrowRight }, { name: "ArrowLeft", Icon: ArrowLeft },
      { name: "ArrowUp", Icon: ArrowUp }, { name: "ArrowDown", Icon: ArrowDown },
      { name: "ExternalLink", Icon: ExternalLink }, { name: "Link", Icon: Link },
    ],
  },
  {
    title: "Actions",
    icons: [
      { name: "Plus", Icon: Plus }, { name: "Minus", Icon: Minus }, { name: "Check", Icon: Check },
      { name: "X", Icon: X }, { name: "Edit3", Icon: Edit3 }, { name: "Trash2", Icon: Trash2 },
      { name: "Copy", Icon: Copy }, { name: "Download", Icon: Download }, { name: "Upload", Icon: Upload },
      { name: "Share2", Icon: Share2 }, { name: "RefreshCw", Icon: RefreshCw },
    ],
  },
  {
    title: "Status & Feedback",
    icons: [
      { name: "AlertCircle", Icon: AlertCircle }, { name: "AlertTriangle", Icon: AlertTriangle },
      { name: "CheckCircle", Icon: CheckCircle }, { name: "XCircle", Icon: XCircle },
      { name: "Info", Icon: Info }, { name: "HelpCircle", Icon: HelpCircle },
      { name: "Loader2", Icon: Loader2 },
    ],
  },
  {
    title: "User & Communication",
    icons: [
      { name: "User", Icon: User }, { name: "Bell", Icon: Bell }, { name: "Mail", Icon: Mail },
      { name: "Phone", Icon: Phone }, { name: "Heart", Icon: Heart }, { name: "Star", Icon: Star },
    ],
  },
  {
    title: "Security & Visibility",
    icons: [
      { name: "Eye", Icon: Eye }, { name: "EyeOff", Icon: EyeOff },
      { name: "Lock", Icon: Lock }, { name: "Unlock", Icon: Unlock },
      { name: "Shield", Icon: Shield },
    ],
  },
  {
    title: "Media & Files",
    icons: [
      { name: "FileText", Icon: FileText }, { name: "Folder", Icon: Folder },
      { name: "Image", Icon: Image }, { name: "Camera", Icon: Camera },
      { name: "Video", Icon: Video }, { name: "Mic", Icon: Mic },
    ],
  },
  {
    title: "Misc",
    icons: [
      { name: "Sun", Icon: Sun }, { name: "Moon", Icon: Moon }, { name: "Zap", Icon: Zap },
      { name: "Globe", Icon: Globe }, { name: "Calendar", Icon: Calendar }, { name: "Clock", Icon: Clock },
    ],
  },
];

function IconGrid({ icons, filter }: { icons: typeof ICON_GROUPS; filter: string }) {
  const lower = filter.toLowerCase();
  return (
    <div className="flex flex-col gap-gp-4xl">
      {icons.map((group) => {
        const filtered = group.icons.filter((i) => i.name.toLowerCase().includes(lower));
        if (filtered.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-xl">{group.title}</p>
            <div className="grid grid-cols-6 gap-gp-md">
              {filtered.map(({ name, Icon }) => (
                <div key={name} className="flex flex-col items-center gap-gp-xs p-pad-xl rounded-radius-base hover:bg-bg-muted/50 transition-colors cursor-default group">
                  <Icon className="size-5 text-fg-default" />
                  <span className="text-caption-xs text-fg-subtle group-hover:text-fg-muted truncate max-w-full">{name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function IconsDoc() {
  const [filter, setFilter] = useState("");

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Foundations"
        title="Icons"
        description="Lucide Icons is the standard icon library for the iGreen Design System. Tree-shakeable, consistent stroke width, MIT licensed."
        dependency="lucide-react"
      />
      <DocSeparator />

      {/* Usage */}
      <SectionH2 id="usage" title="Usage" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-2xl">Installation</p>
          <div className="rounded-radius-sm bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted">
            npm install lucide-react
          </div>
        </div>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-2xl">Import</p>
          <div className="rounded-radius-sm bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted leading-relaxed">
            <p>{"import { Search, Home, Settings } from \"lucide-react\";"}</p>
            <p className="mt-gp-xl text-fg-subtle">// Each icon is tree-shaken — only imported icons are bundled</p>
          </div>
        </div>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-2xl">Sizing with DS tokens</p>
          <div className="rounded-radius-sm bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted leading-relaxed">
            <p>{"<Search className=\"size-icon-sm\" />  // 16px"}</p>
            <p>{"<Search className=\"size-icon-md\" />  // 20px (default)"}</p>
            <p>{"<Search className=\"size-icon-lg\" />  // 24px"}</p>
            <p>{"<Search className=\"size-icon-xl\" />  // 28px"}</p>
            <p className="mt-gp-xl text-fg-subtle">// Or use Tailwind: size-4 (16px), size-5 (20px), size-6 (24px)</p>
          </div>
        </div>
      </div>

      {/* Examples */}
      <ExampleSection
        id="ex-basic"
        title="Basic"
        description="Icons inherit color from their parent. Use text-fg-* classes to control color."
        code={`<Home className="size-icon-md text-fg-default" />
<Home className="size-icon-md text-fg-muted" />
<Home className="size-icon-md text-fg-brand" />`}
      >
        <div className="flex items-center gap-gp-4xl">
          <div className="flex flex-col items-center gap-gp-md">
            <Home className="size-icon-md text-fg-default" />
            <span className="text-caption-sm text-fg-subtle">foreground</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <Home className="size-icon-md text-fg-muted" />
            <span className="text-caption-sm text-fg-subtle">muted</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <Home className="size-icon-md text-fg-subtle" />
            <span className="text-caption-sm text-fg-subtle">subtle</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <Home className="size-icon-md text-fg-brand" />
            <span className="text-caption-sm text-fg-subtle">brand</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <Home className="size-icon-md text-fg-success" />
            <span className="text-caption-sm text-fg-subtle">success</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <Home className="size-icon-md text-fg-danger" />
            <span className="text-caption-sm text-fg-subtle">danger</span>
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="Use DS icon tokens for consistent sizing across components."
        code={`<Search className="size-icon-sm" />  // 16px
<Search className="size-icon-md" />  // 20px
<Search className="size-icon-lg" />  // 24px
<Search className="size-icon-xl" />  // 28px`}
      >
        <div className="flex items-end gap-gp-4xl">
          {[
            { size: "size-icon-sm", label: "sm (16px)" },
            { size: "size-icon-md", label: "md (20px)" },
            { size: "size-icon-lg", label: "lg (24px)" },
            { size: "size-icon-xl", label: "xl (28px)" },
          ].map(({ size, label }) => (
            <div key={size} className="flex flex-col items-center gap-gp-md">
              <Search className={`${size} text-fg-default`} />
              <span className="text-caption-sm text-fg-subtle">{label}</span>
            </div>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-colors"
        title="Colors"
        description="Icons use text-fg-* tokens. Never hardcode hex colors on icons."
        code={`<AlertCircle className="size-icon-md text-fg-danger" />
<CheckCircle className="size-icon-md text-fg-success" />
<AlertTriangle className="size-icon-md text-fg-warning" />
<Info className="size-icon-md text-fg-info" />`}
      >
        <div className="flex items-center gap-gp-4xl">
          <div className="flex flex-col items-center gap-gp-md">
            <AlertCircle className="size-icon-lg text-fg-danger" />
            <span className="text-caption-sm text-fg-subtle">critical</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <CheckCircle className="size-icon-lg text-fg-success" />
            <span className="text-caption-sm text-fg-subtle">success</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <AlertTriangle className="size-icon-lg text-fg-warning" />
            <span className="text-caption-sm text-fg-subtle">warning</span>
          </div>
          <div className="flex flex-col items-center gap-gp-md">
            <Info className="size-icon-lg text-fg-info" />
            <span className="text-caption-sm text-fg-subtle">info</span>
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-button"
        title="In Buttons"
        description="Pass icons via the iconLeft or iconRight prop on our Button component."
        code={`import { Button } from "@/components/ui/Button/button";
import { Plus, Download } from "lucide-react";

<Button iconLeft={<Plus />}>Create</Button>
<Button iconRight={<Download />} variant="outline">Export</Button>`}
      >
        <div className="flex items-center gap-gp-xl">
          {/* Using the actual Button component would require importing it — keeping it simple with styled divs */}
          <div className="inline-flex items-center gap-gp-md min-h-form-lg px-pad-2xl rounded-radius-base bg-bg-brand text-fg-on-brand text-body-md font-medium">
            <Plus className="size-icon-md" />
            Create
          </div>
          <div className="inline-flex items-center gap-gp-md min-h-form-lg px-pad-2xl rounded-radius-base border border-border-brand text-fg-brand text-body-md font-medium shadow-sh-sm">
            Export
            <Download className="size-icon-md" />
          </div>
          <div className="inline-flex items-center gap-gp-md min-h-form-lg px-pad-2xl rounded-radius-base bg-bg-brand-subtle text-fg-brand text-body-md font-medium">
            <Search className="size-icon-md" />
            Search
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-input"
        title="In Inputs"
        description="Place icons inside input wrappers for search bars, password fields, etc."
        code={`<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-icon-md text-fg-subtle" />
  <Input className="pl-10" placeholder="Search..." />
</div>`}
      >
        <div className="flex flex-col gap-gp-xl w-full max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-icon-md text-fg-subtle" />
            <Input className="pl-10" placeholder="Search..." />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-icon-md text-fg-subtle" />
            <Input className="pl-10" placeholder="Email address" />
          </div>
        </div>
      </ExampleSection>

      {/* Library */}
      <SectionH2 id="library" title="Icon Library" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="flex items-center gap-gp-xl">
          <Input
            placeholder="Filter icons..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
          <span className="text-caption-sm text-fg-subtle">
            {ICON_GROUPS.flatMap((g) => g.icons).filter((i) => i.name.toLowerCase().includes(filter.toLowerCase())).length} icons
          </span>
        </div>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <IconGrid icons={ICON_GROUPS} filter={filter} />
        </div>
        <p className="text-caption-sm text-fg-subtle">
          This is a curated subset. Full library at{" "}
          <span className="text-fg-brand font-medium">lucide.dev/icons</span> — 1500+ icons available.
        </p>
      </div>

      {/* Guidelines */}
      <SectionH2 id="guidelines" title="Guidelines" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Sizing</p>
            <p className="text-body-md text-fg-muted">
              Use <code className="font-mono text-code-sm text-fg-brand">size-icon-md</code> (20px) as default.
              Use <code className="font-mono text-code-sm text-fg-brand">size-icon-sm</code> (16px) for compact UI.
              Never use raw px values.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Color</p>
            <p className="text-body-md text-fg-muted">
              Icons inherit color via <code className="font-mono text-code-sm text-fg-brand">text-fg-*</code> tokens.
              Never hardcode hex. Use <code className="font-mono text-code-sm">currentColor</code> when possible.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Accessibility</p>
            <p className="text-body-md text-fg-muted">
              Decorative icons: no extra attributes needed (Lucide hides them from screen readers).
              Meaningful icons without text: add <code className="font-mono text-code-sm text-fg-brand">aria-label</code> on the parent button.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-xs">Consistency</p>
            <p className="text-body-md text-fg-muted">
              Always use <Badge color="primary" variant="soft" size="sm">lucide-react</Badge> — never mix with other icon libraries
              (Heroicons, Phosphor, etc.). One library ensures uniform stroke width and style.
            </p>
          </div>
        </div>

        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-bg-subtle">
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">Do</th>
                <th className="text-left text-body-xs text-fg-muted font-medium py-pad-md px-pad-xl">Don't</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border-subtle">
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-success">size-icon-md</td>
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-danger">w-5 h-5</td>
              </tr>
              <tr className="border-t border-border-subtle">
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-success">text-fg-muted</td>
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-danger">text-gray-500</td>
              </tr>
              <tr className="border-t border-border-subtle">
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-success">{"import { X } from \"lucide-react\""}</td>
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-danger">{"import { XMarkIcon } from \"@heroicons/react\""}</td>
              </tr>
              <tr className="border-t border-border-subtle">
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-success">aria-label on icon-only button</td>
                <td className="py-pad-md px-pad-xl font-mono text-code-sm text-fg-danger">icon button without label</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DocLayout>
  );
}
