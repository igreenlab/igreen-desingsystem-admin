import { useState, useEffect, useRef, useCallback } from "react";
import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Button } from "../../components/ui/Button/button";
import { Badge } from "../../components/shadcn/badge";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Step { agent: string; title: string; detail: string; reads?: string[]; runs?: string[]; signal?: string; duration: number; }
interface Scenario { id: string; emoji: string; command: string; description: string; routeTag: string; activeAgents: string[]; steps: Step[]; }
interface AgentCfg { label: string; role: string; color: string; description: string; whenActivated: string; signalIn: string; signalOut: string; files: { group: string; items: string[] }[]; }

/* ═══════════════════════════════════════════════════════════════════════════
   AGENT CONFIG — agent colors are brand identity (intentionally hardcoded)
   ═══════════════════════════════════════════════════════════════════════════ */

const AG: Record<string, AgentCfg> = {
  orchestrator: {
    label: "Orchestrator", role: "Classifies · Delegates", color: "#6366f1",
    description: "Main agent. Receives any task, classifies the domain and delegates to the correct sub-agent. Detects dependencies between tasks. Never executes — always delegates.",
    whenActivated: "Always — entry point for every task.", signalIn: "(user task)", signalOut: "→ Delegating to [agent]",
    files: [{ group: "Always reads", items: ["CLAUDE.md", "component-inventory.md"] }],
  },
  "ds-designer": {
    label: "DS Designer", role: "Specifies · Tokens", color: "#f59e0b",
    description: "Specifies semantic tokens and component styles. Does NOT generate code. Defines variants, sizes, states. Delivers spec in markdown.",
    whenActivated: "When design/spec is involved: new token, new component, Figma extraction.", signalIn: "(delegation from Orchestrator)", signalOut: "SPEC_READY: [name]",
    files: [{ group: "Required", items: ["CLAUDE.md", "component-inventory.md"] }, { group: "Per task", items: ["tokens-color.md", "tokens-spacing.md", "tokens-sizing-shape-elevation.md", "tokens-typography.md", "component-guide.md"] }],
  },
  "ds-dev": {
    label: "DS Dev", role: "Implements · Code", color: "#10b981",
    description: "Implements the received spec. Creates tokens, components (tv() + semantic classes), adapters. Runs tokens:tw4 after changes.",
    whenActivated: "After Designer spec, or directly for Shadcn/composites/adapters.", signalIn: "SPEC_READY: [name]", signalOut: "IMPL_READY: [name]",
    files: [{ group: "Required", items: ["coding-standards.md"] }, { group: "Per task", items: ["component-guide.md", "shadcn-token-map.md", "architecture.md"] }],
  },
  "ds-reviewer": {
    label: "DS Reviewer", role: "Validates · Merge", color: "#3b82f6",
    description: "Validates tokens and components before merge. 4 checklists: token, Shadcn, iGreen, composite. Rejects with list of corrections.",
    whenActivated: "After DS Dev signals IMPL_READY.", signalIn: "IMPL_READY: [name]", signalOut: "REVIEW_OK / REVIEW_FAILED",
    files: [{ group: "Checklists", items: ["Semantic token (7)", "Shadcn (7)", "iGreen (11)", "Composite (7)"] }],
  },
};

const PIPE = ["orchestrator", "ds-designer", "ds-dev", "ds-reviewer"];
const SUBS = ["ds-designer", "ds-dev", "ds-reviewer"];

/* ═══════════════════════════════════════════════════════════════════════════
   SCENARIOS (8)
   ═══════════════════════════════════════════════════════════════════════════ */

const SC: Scenario[] = [
  { id: "create-component", emoji: "⚡", command: "/create-component Button", description: "Create iGreen component with color × variant × size", routeTag: "Full pipeline", activeAgents: ["orchestrator", "ds-designer", "ds-dev", "ds-reviewer"],
    steps: [
      { agent: "orchestrator", title: "Classifying domain", detail: "Create iGreen component. Route: Designer → Dev → Reviewer.", reads: ["CLAUDE.md"], duration: 1800 },
      { agent: "orchestrator", title: "Checking inventory", detail: "Button does not exist. Tokens available.", reads: ["component-inventory.md"], signal: "→ DS Designer", duration: 1500 },
      { agent: "ds-designer", title: "Specifying variants", detail: "5 colors × 4 variants × 4 sizes.", reads: ["component-guide.md", "tokens-color.md"], duration: 2000 },
      { agent: "ds-designer", title: "Accessibility rules", detail: "ring-4. Disabled last. Touch: min-h-form-xl.", reads: ["tokens-sizing-shape-elevation.md"], signal: "SPEC_READY: Button", duration: 2000 },
      { agent: "ds-dev", title: "Checking standards", detail: "tv @/utils/tv ✓  border-transparent ✓  disabled last ✓", reads: ["coding-standards.md"], duration: 1800 },
      { agent: "ds-dev", title: "Creating component", detail: "20 compoundVariants. .tsx .styles.ts .types.ts USAGE.md", runs: ["@/utils/tv", "20 compoundVariants"], signal: "IMPL_READY: Button", duration: 2400 },
      { agent: "ds-reviewer", title: "Checklist (11 items)", detail: "✓ tv ✓ Zero hardcode ✓ form-* ✓ ring-4 ✓ disabled ✓ type=button ✓ TS ✓ USAGE.md", reads: ["iGreen (11)"], signal: "REVIEW_OK: Button ✅", duration: 2600 },
    ],
  },
  { id: "add-token", emoji: "🎨", command: "/add-token bg.warning", description: "Add semantic color", routeTag: "Full pipeline", activeAgents: ["orchestrator", "ds-designer", "ds-dev", "ds-reviewer"],
    steps: [
      { agent: "orchestrator", title: "Classifying", detail: "Semantic color. Full route.", reads: ["CLAUDE.md"], duration: 1400 },
      { agent: "ds-designer", title: "Checking primitives", detail: "warning[50..950] available.", reads: ["tokens-color.md"], duration: 1800 },
      { agent: "ds-designer", title: "Specifying", detail: "bg.warning + subtle + muted + on-warning + border + ring", reads: ["tokens-color.md"], signal: "SPEC_READY: bg.warning", duration: 2000 },
      { agent: "ds-dev", title: "Editing tokens", detail: "6 tokens light + dark. Zero hex.", reads: ["coding-standards.md"], duration: 1800 },
      { agent: "ds-dev", title: "Regenerating CSS", detail: "Classes bg-bg-warning available.", runs: ["npm run tokens:tw4"], signal: "IMPL_READY: bg.warning", duration: 1800 },
      { agent: "ds-reviewer", title: "Token checklist (7)", detail: "✓ Naming ✓ No hex ✓ Dark ✓ on-* ✓ ring ✓ tw4 ✓ pipeline", reads: ["Semantic token (7)"], signal: "REVIEW_OK ✅", duration: 1800 },
    ],
  },
  { id: "add-shadcn", emoji: "📦", command: "/add-shadcn Dialog", description: "Install Shadcn (skips Designer)", routeTag: "Skips DS Designer", activeAgents: ["orchestrator", "ds-dev", "ds-reviewer"],
    steps: [
      { agent: "orchestrator", title: "Classifying", detail: "Portal, focus trap. Scenario 1 → Dev directly.", reads: ["CLAUDE.md", "component-inventory.md"], signal: "→ DS Dev", duration: 1400 },
      { agent: "ds-dev", title: "Installing", detail: "Moving to shadcn/. Vars map automatically.", reads: ["shadcn-token-map.md"], runs: ["npx shadcn@latest add dialog"], duration: 2000 },
      { agent: "ds-dev", title: "Focus ring", detail: "ring-2 offset → ring-4 no offset.", duration: 1600 },
      { agent: "ds-dev", title: "Exports", detail: "shadcn/index.ts + components/index.ts.", signal: "IMPL_READY: dialog", duration: 1600 },
      { agent: "ds-reviewer", title: "Shadcn checklist (7)", detail: "✓ shadcn/ ✓ Radix preserved ✓ Focus ring ✓ Exports", reads: ["Shadcn (7)"], signal: "REVIEW_OK ✅", duration: 1800 },
    ],
  },
  { id: "extract-figma", emoji: "🖼️", command: "/extract-figma", description: "Extract dashboard and map tokens", routeTag: "Full pipeline", activeAgents: ["orchestrator", "ds-designer", "ds-dev", "ds-reviewer"],
    steps: [
      { agent: "orchestrator", title: "Classifying", detail: "Figma extraction. Full route.", reads: ["CLAUDE.md"], duration: 1400 },
      { agent: "ds-designer", title: "Inventorying", detail: "Colors, spacings, typography, radius, shadows.", reads: ["tokens-color.md", "component-guide.md"], duration: 2000 },
      { agent: "ds-designer", title: "Mapping", detail: "brand → bg-bg-brand · 14px → text-body-md font-medium · 40px → min-h-form-lg", reads: ["tokens-sizing-shape-elevation.md"], duration: 2200 },
      { agent: "ds-designer", title: "Gaps", detail: "2 gaps + 2 warnings on fixed h-*.", signal: "SPEC_READY: dashboard", duration: 2000 },
      { agent: "ds-dev", title: "Creating tokens", detail: "color-light + elevation edited.", runs: ["npm run tokens:tw4"], duration: 1800 },
      { agent: "ds-dev", title: "Implementing", detail: "DashboardCard with tokens. Zero hardcode.", signal: "IMPL_READY: DashboardCard", duration: 2000 },
      { agent: "ds-reviewer", title: "Checklist", detail: "✓ Zero px ✓ Gaps resolved ✓ Dark ✓ USAGE.md", reads: ["iGreen (11)"], signal: "REVIEW_OK ✅", duration: 2000 },
    ],
  },
  { id: "fluid-typography", emoji: "✍️", command: "/add-token heading-sm", description: "Fluid preset with clamp()", routeTag: "Full pipeline", activeAgents: ["orchestrator", "ds-designer", "ds-dev", "ds-reviewer"],
    steps: [
      { agent: "orchestrator", title: "Classifying", detail: "Typographic preset. Full route.", reads: ["CLAUDE.md"], duration: 1400 },
      { agent: "ds-designer", title: "Fluid values", detail: "clamp(1.5rem, calc(1.293rem + 0.884vw), 2rem). lh: 1.25.", reads: ["tokens-typography.md"], signal: "SPEC_READY: heading-sm", duration: 2200 },
      { agent: "ds-dev", title: "Editing typography.ts", detail: "fontSize: clamp(...). Zero px.", reads: ["coding-standards.md"], duration: 1800 },
      { agent: "ds-dev", title: "Regenerating", detail: "@utility text-heading-sm generated.", runs: ["npm run tokens:tw4"], signal: "IMPL_READY: heading-sm", duration: 2000 },
      { agent: "ds-reviewer", title: "Typography checklist", detail: "✓ rem/clamp ✓ unitless lh ✓ tv.ts ✓ @utility", reads: ["Semantic token (7)"], signal: "REVIEW_OK ✅", duration: 1800 },
    ],
  },
  { id: "edit-component", emoji: "✏️", command: "/edit button.styles.ts", description: "Edit component visual (skips Designer)", routeTag: "Skips DS Designer", activeAgents: ["orchestrator", "ds-dev", "ds-reviewer"],
    steps: [
      { agent: "orchestrator", title: "Classifying", detail: "Visual edit. Dev directly.", reads: ["CLAUDE.md", "component-inventory.md"], duration: 1400 },
      { agent: "ds-dev", title: "Editing .styles.ts", detail: "compoundVariants changed. disabled last.", reads: ["coding-standards.md"], duration: 2000 },
      { agent: "ds-dev", title: "Verifying", detail: "tv ✓  No h-* ✓  TS ✓", signal: "IMPL_READY: Button update", duration: 1600 },
      { agent: "ds-reviewer", title: "Checklist", detail: "✓ tv ✓ Zero hardcode ✓ disabled last", reads: ["iGreen (11)"], signal: "REVIEW_OK ✅", duration: 1800 },
    ],
  },
  { id: "create-composite", emoji: "🧩", command: "/create-composite FormField", description: "Compose Input + Label + Helper", routeTag: "Skips DS Designer", activeAgents: ["orchestrator", "ds-dev", "ds-reviewer"],
    steps: [
      { agent: "orchestrator", title: "Classifying", detail: "Composite. Scenario 3 → Dev.", reads: ["CLAUDE.md", "component-inventory.md"], signal: "→ DS Dev", duration: 1400 },
      { agent: "ds-dev", title: "Checking bases", detail: "Input ✓  Label ✓", reads: ["component-guide.md"], duration: 1600 },
      { agent: "ds-dev", title: "Creating styles", detail: "tv() slots: root, label, wrapper, helper.", reads: ["coding-standards.md"], duration: 2000 },
      { agent: "ds-dev", title: "Full structure", detail: ".tsx .types.ts .styles.ts index.ts USAGE.md", signal: "IMPL_READY: FormField", duration: 2000 },
      { agent: "ds-reviewer", title: "Composite checklist", detail: "✓ tv ✓ Clean API ✓ aria-* ✓ USAGE.md", reads: ["Composite (7)"], signal: "REVIEW_OK ✅", duration: 1800 },
    ],
  },
  { id: "design-only", emoji: "🔍", command: "/extract-figma (spec)", description: "Map Figma only, no implementation", routeTag: "Designer only", activeAgents: ["orchestrator", "ds-designer"],
    steps: [
      { agent: "orchestrator", title: "Classifying", detail: "Spec extraction. Mapping only.", reads: ["CLAUDE.md"], duration: 1200 },
      { agent: "ds-designer", title: "Inventorying", detail: "Colors, spacings, typography.", reads: ["tokens-color.md", "component-guide.md"], duration: 2000 },
      { agent: "ds-designer", title: "Mapping", detail: "brand → bg-bg-brand · 14px → text-body-md font-medium", reads: ["tokens-sizing-shape-elevation.md", "tokens-typography.md"], duration: 2200 },
      { agent: "ds-designer", title: "Gaps", detail: "2 gaps + 2 warnings.", signal: "SPEC_READY: mapping complete", duration: 2000 },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   TOC
   ═══════════════════════════════════════════════════════════════════════════ */

const TOC = [
  { id: "structure", label: "Pipeline Structure" },
  { id: "hierarchy", label: "Hierarchy" },
  { id: "flow", label: "How a Task Flows" },
  { id: "scenarios", label: "Scenarios (Simulator)" },
  { id: "pipeline", label: "Pipeline Flow" },
  { id: "terminal", label: "Terminal" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */

export function AgentsPreview() {
  const [selId, setSelId] = useState(SC[0].id);
  const [curStep, setCurStep] = useState(-1);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const [running, setRunning] = useState(false);
  const [modal, setModal] = useState<{ agent: string; tab: "about" | "files" } | null>(null);
  const [readFiles, setReadFiles] = useState<Record<string, Set<string>>>({});
  const logRef = useRef<HTMLDivElement>(null);
  const tRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sc = SC.find((s) => s.id === selId)!;
  const finished = doneSteps.length === sc.steps.length;

  const reset = useCallback(() => {
    if (tRef.current) clearTimeout(tRef.current);
    setCurStep(-1); setDoneSteps([]); setRunning(false); setReadFiles({});
  }, []);
  const select = useCallback((id: string) => { reset(); setSelId(id); }, [reset]);

  const run = useCallback((idx: number, steps: Step[]) => {
    if (idx >= steps.length) { setRunning(false); setCurStep(-1); return; }
    setCurStep(idx);
    const s = steps[idx];
    const allF = [...(s.reads || []), ...(s.runs || [])];
    if (allF.length) setReadFiles((p) => ({ ...p, [s.agent]: new Set([...(p[s.agent] || []), ...allF]) }));
    tRef.current = setTimeout(() => { setDoneSteps((p) => [...p, idx]); run(idx + 1, steps); }, s.duration);
  }, []);

  const execute = useCallback(() => { reset(); setRunning(true); setTimeout(() => run(0, sc.steps), 300); }, [reset, run, sc.steps]);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [curStep, doneSteps]);
  useEffect(() => () => { if (tRef.current) clearTimeout(tRef.current); }, []);

  const activeAgent = curStep >= 0 && curStep < sc.steps.length ? sc.steps[curStep].agent : null;
  const doneAgents = new Set(doneSteps.map((i) => sc.steps[i]?.agent).filter(Boolean));
  const visible = sc.steps.slice(0, Math.max(curStep + 1, doneSteps.length));

  const routeParts = sc.activeAgents.map((a) => AG[a].label);
  const skipped = PIPE.filter((a) => !sc.activeAgents.includes(a));
  const routeLabel = routeParts.join(" → ") + (skipped.length ? ` · ${skipped.map((a) => AG[a].label).join(", ")} skipped` : "");

  const activeSubs = SUBS.filter((id) => sc.activeAgents.includes(id));

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Agents"
        title="Pipeline"
        description="Structural view of the multi-agent pipeline + interactive simulator. See how a task flows through Orchestrator, Designer, Dev and Reviewer."
      />
      <DocSeparator />

      {/* ── Section: Pipeline Structure ────────────────────────────── */}
      <SectionH2 id="structure" title="Pipeline Structure" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O pipeline iGreen é composto por <strong className="text-fg-default">4 camadas</strong> que cooperam em toda
          tarefa: Orchestrator no topo (decide a rota), Subagentes especialistas no meio (executam), Infra horizontal
          dando suporte (skills, hooks, commands, output styles, MCP, memory), e Memória persistindo decisões.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl">
            {/* Layer 1: Orchestrator */}
            <div>
              <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-md">Camada 1 — Orchestration</p>
              <div className="rounded-radius-base border border-border-subtle p-pad-3xl" style={{ borderLeftWidth: 4, borderLeftColor: "#6366f1" }}>
                <p className="text-body-md font-medium font-semibold mb-gp-xs" style={{ color: "#6366f1" }}>Orchestrator</p>
                <p className="text-body-md text-fg-muted">Recebe toda tarefa, classifica o domínio, escolhe a rota, segura o gate. Nunca executa diretamente.</p>
              </div>
            </div>

            {/* Layer 2: Specialists */}
            <div>
              <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-md">Camada 2 — Specialist Subagents</p>
              <div className="grid grid-cols-3 gap-gp-2xl">
                <div className="rounded-radius-base border border-border-subtle p-pad-3xl" style={{ borderTopWidth: 4, borderTopColor: "#f59e0b" }}>
                  <p className="text-body-md font-medium font-semibold mb-gp-xs" style={{ color: "#f59e0b" }}>DS Designer</p>
                  <p className="text-body-md text-fg-muted">Especifica tokens, components, Figma. Strategist perspective (alt + assumption).</p>
                </div>
                <div className="rounded-radius-base border border-border-subtle p-pad-3xl" style={{ borderTopWidth: 4, borderTopColor: "#10b981" }}>
                  <p className="text-body-md font-medium font-semibold mb-gp-xs" style={{ color: "#10b981" }}>DS Dev</p>
                  <p className="text-body-md text-fg-muted">Implementa spec aprovada. tv() + tokens. Cascata se token faltar.</p>
                </div>
                <div className="rounded-radius-base border border-border-subtle p-pad-3xl" style={{ borderTopWidth: 4, borderTopColor: "#3b82f6" }}>
                  <p className="text-body-md font-medium font-semibold mb-gp-xs" style={{ color: "#3b82f6" }}>DS Reviewer</p>
                  <p className="text-body-md text-fg-muted">Regression sweep + 3 checklists + critique genuína + Assumption check.</p>
                </div>
              </div>
            </div>

            {/* Layer 3: Pipeline Infra */}
            <div>
              <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-md">Camada 3 — Pipeline Infra (horizontal)</p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-gp-md">
                {[
                  { label: "Skills", desc: "Atomic procedures" },
                  { label: "Commands", desc: "/ds-*" },
                  { label: "Hooks", desc: "Pre/Post tool" },
                  { label: "Output Style", desc: "Terse" },
                  { label: "MCP Servers", desc: "Figma/FS/DevTools" },
                  { label: "Rules", desc: "Auto-loaded" },
                ].map((b) => (
                  <div key={b.label} className="rounded-radius-base border border-border-subtle p-pad-md">
                    <p className="text-caption-sm font-semibold text-fg-default mb-gp-xs">{b.label}</p>
                    <p className="text-caption-sm text-fg-muted">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Layer 4: Memory */}
            <div>
              <p className="text-body-xs text-fg-subtle uppercase tracking-wider mb-gp-md">Camada 4 — Memory (persistence)</p>
              <div className="grid grid-cols-4 gap-gp-md">
                {[
                  { label: "User Memory", desc: "~/.claude/.../memory/" },
                  { label: "Project Memory", desc: "memory/MEMORY.md" },
                  { label: "Audit Log", desc: ".ai/status/pipeline-state.md" },
                  { label: "Lessons", desc: ".ai/status/lessons.md" },
                ].map((b) => (
                  <div key={b.label} className="rounded-radius-base border border-border-subtle p-pad-md">
                    <p className="text-caption-sm font-semibold text-fg-default mb-gp-xs">{b.label}</p>
                    <p className="text-caption-sm text-fg-muted">{b.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section: Hierarchy ─────────────────────────────────────── */}
      <SectionH2 id="hierarchy" title="Hierarchy" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Quando o usuário envia uma tarefa, a hierarquia é estritamente top-down: Orchestrator escolhe,
          Subagentes executam carregando suas Skills, Hooks e MCP intervêm em pontos específicos, Memory
          grava o que aconteceu.
        </p>
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-loose overflow-x-auto">
          <pre className="whitespace-pre">{`User task
   │
   ▼
[Orchestrator]  ← classifica · escolhe rota · segura gate
   │
   ├─ if (token/component novo) → DS Designer
   │      │
   │      ├─ Skill: spec-token-* | spec-component | figma-extract
   │      └─ Signal: SPEC_READY  ──►  [GATE 👤 usuário aprova]
   │
   ├─ DS Dev  ← carrega spec aprovada
   │      │
   │      ├─ Skill: impl-igreen | impl-shadcn | impl-composite | impl-token
   │      ├─ Hook PreToolUse: block-sensitive-edit | block-rm-rf
   │      ├─ MCP: igreen-workspace.write_file | claude_ai_Figma.get_*
   │      ├─ Hook PostToolUse: format-on-save
   │      └─ Signal: IMPL_READY
   │
   └─ DS Reviewer  ← carrega resultado
          │
          ├─ Skill: review-component | SKILL (token review)
          ├─ Regression sweep (grep automatizado)
          ├─ Critique genuína (assumption check)
          └─ Signal: REVIEW_OK | REVIEW_FAILED
                │
                ▼
        Audit log + Lessons update`}</pre>
        </div>
      </div>

      {/* ── Section: How a task flows ──────────────────────────────── */}
      <SectionH2 id="flow" title="How a Task Flows" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Sequência canônica de um pipeline completo (componente novo). Cada passo deixa um traço auditável.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl">
            {[
              { step: "1", title: "Entry", desc: "User envia tarefa ou usa /ds-create-component <Name>." },
              { step: "2", title: "Classify", desc: "Orchestrator lê CLAUDE.md + inventory. Escolhe rota e delega." },
              { step: "3", title: "Spec", desc: "DS Designer carrega skill spec-component. Lista alternativas, declara assumption central." },
              { step: "4", title: "Gate", desc: "Orchestrator apresenta spec. PARA até usuário aprovar." },
              { step: "5", title: "Implement", desc: "DS Dev carrega skill impl-igreen. Cria 5 arquivos + USAGE.md. Hooks rodam em paralelo." },
              { step: "6", title: "Review", desc: "DS Reviewer roda regression sweep + 3 checklists + critique genuína." },
              { step: "7", title: "Persist", desc: "Entry append em pipeline-state.md com Assumption. Se erro novo: lesson L-NNN criada." },
            ].map((item) => (
              <div key={item.step} className="flex gap-gp-2xl">
                <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-body-md font-medium font-semibold bg-bg-brand text-fg-on-brand">
                  {item.step}
                </div>
                <div>
                  <p className="text-body-md font-medium text-fg-default mb-gp-xs">{item.title}</p>
                  <p className="text-body-md text-fg-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-body-md text-fg-muted">
          Não todo cenário roda os 7 passos. Rotas que pulam Designer (Shadcn, visual edit) começam direto
          no passo 5. Use o simulador abaixo pra ver as rotas alternativas em ação.
        </p>
      </div>

      {/* ── Section: Scenarios (Simulator) ─────────────────────────── */}
      <SectionH2 id="scenarios" title="Scenarios (Simulator)" />

      {/* Active scenario info card */}
      <div className="rounded-radius-base border border-border-subtle bg-bg-surface p-pad-3xl shadow-sh-sm mb-gp-2xl">
        <div className="flex items-center gap-gp-md mb-gp-md">
          <span className="text-body-md">{sc.emoji}</span>
          <span className="font-mono text-code-sm font-bold text-fg-default">{sc.command}</span>
          <Badge
            color={sc.routeTag.includes("Skip") || sc.routeTag.includes("only") ? "warning" : "success"}
            variant="soft"
            size="sm"
          >
            {sc.routeTag}
          </Badge>
        </div>
        <p className="text-body-md text-fg-muted mb-gp-md">{sc.description}</p>
        <div className="font-mono text-code-sm text-fg-subtle">
          {routeLabel}
        </div>
      </div>

      {/* Scenario pills */}
      <div className="flex flex-wrap gap-gp-md mb-14">
        {SC.map((s) => {
          const isSelected = selId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => select(s.id)}
              className={[
                "inline-flex items-center gap-gp-xs rounded-radius-2xl border px-pad-xl py-pad-sm text-body-xs font-semibold transition-all cursor-pointer",
                isSelected
                  ? "border-border-brand bg-bg-brand-subtle text-fg-brand shadow-sh-sm"
                  : "border-border-subtle bg-bg-surface text-fg-muted hover:border-border-main hover:text-fg-default",
              ].join(" ")}
            >
              <span>{s.emoji}</span>
              <span>{s.command.split(" ")[0].replace("/", "")}</span>
            </button>
          );
        })}
      </div>

      {/* ── Section: Pipeline Flow ─────────────────────────────────── */}
      <SectionH2 id="pipeline" title="Pipeline Flow" />

      <div
        className="relative rounded-radius-base border border-border-subtle bg-bg-canvas p-pad-4xl mb-14 overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-bg-moderate) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          minHeight: 400,
        }}
      >
        {/* ── Flow layout ── */}
        <div className="flex flex-col items-center">

          {/* Orchestrator (root node) */}
          <FlowNode
            id="orchestrator"
            isActive={activeAgent === "orchestrator"}
            isDone={doneAgents.has("orchestrator")}
            isInRoute
            isRoot
            onInfo={() => setModal({ agent: "orchestrator", tab: "about" })}
            onFiles={() => setModal({ agent: "orchestrator", tab: "files" })}
          />

          {/* SVG connections: Orchestrator → Sub-agents */}
          {activeSubs.length > 0 && (
            <svg
              width="100%"
              height="80"
              className="overflow-visible"
              style={{ maxWidth: activeSubs.length * 220 }}
            >
              {(() => {
                const count = activeSubs.length;
                const spacing = 220;
                const totalW = (count - 1) * spacing;
                const half = totalW / 2;
                const cx = "50%";
                const orchDone = doneAgents.has("orchestrator");
                const mainStroke = orchDone ? "var(--color-fg-success)" : "var(--color-border-main)";

                return (
                  <g>
                    {/* Vertical line from orchestrator down */}
                    <line
                      x1={cx} y1="0" x2={cx} y2="40"
                      stroke={mainStroke} strokeWidth={1.5}
                    />
                    {/* Horizontal bar */}
                    {count > 1 && (
                      <line
                        x1={`calc(50% - ${half}px)`} y1="40"
                        x2={`calc(50% + ${half}px)`} y2="40"
                        stroke={mainStroke} strokeWidth={1.5}
                      />
                    )}
                    {/* Vertical drops to each sub-agent */}
                    {activeSubs.map((id, i) => {
                      const xOff = -half + i * spacing;
                      const isDone = doneAgents.has(id);
                      const isAct = activeAgent === id;
                      const lineStroke = isDone
                        ? "var(--color-fg-success)"
                        : isAct
                          ? AG[id].color
                          : mainStroke;
                      const dash = (!isDone && !isAct && !orchDone) ? "6 4" : undefined;
                      return (
                        <line
                          key={id}
                          x1={`calc(50% + ${xOff}px)`} y1="40"
                          x2={`calc(50% + ${xOff}px)`} y2="80"
                          stroke={lineStroke} strokeWidth={1.5}
                          strokeDasharray={dash}
                        />
                      );
                    })}
                  </g>
                );
              })()}
            </svg>
          )}

          {/* Sub-agents row */}
          <div className="flex gap-gp-4xl items-start justify-center flex-wrap">
            {SUBS.map((id) => {
              const inRoute = sc.activeAgents.includes(id);
              const isAct = activeAgent === id;
              const isDn = !isAct && doneAgents.has(id);
              return (
                <FlowNode
                  key={id}
                  id={id}
                  isActive={isAct}
                  isDone={isDn}
                  isInRoute={inRoute}
                  onInfo={() => setModal({ agent: id, tab: "about" })}
                  onFiles={() => setModal({ agent: id, tab: "files" })}
                />
              );
            })}
          </div>

          {/* Finished banner */}
          {finished && (
            <div className="mt-gp-4xl rounded-radius-base bg-bg-success-subtle border border-border-success flex items-center gap-gp-md px-pad-3xl py-pad-xl">
              <span className="text-[20px]">✅</span>
              <div>
                <div className="text-body-md font-medium font-bold text-fg-success">Pipeline complete</div>
                <div className="text-caption-sm text-fg-muted">{sc.steps[sc.steps.length - 1]?.signal || "Done."}</div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-gp-md mt-gp-4xl">
            <Button color="primary" size="sm" onClick={execute} disabled={running}>
              {running ? "Running..." : finished ? "Run again" : "Execute"}
            </Button>
            <Button color="secondary" variant="outline" size="sm" onClick={reset}>
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* ── Section: Terminal ───────────────────────────────────────── */}
      <SectionH2 id="terminal" title="Terminal" />
      <div className="rounded-radius-base border border-border-subtle overflow-hidden mb-14">
        {/* Header bar */}
        <div className="flex items-center gap-gp-md bg-bg-subtle px-pad-xl py-pad-md border-b border-border-subtle">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: running
                ? "var(--color-fg-success)"
                : finished
                  ? "var(--color-fg-info)"
                  : "var(--color-fg-muted)",
            }}
          />
          <span className="font-mono text-code-sm font-semibold text-fg-muted">
            {running ? "RUNNING" : finished ? "COMPLETE" : "TERMINAL"}
          </span>
        </div>

        {/* Log area */}
        <div ref={logRef} className="bg-bg-canvas max-h-[480px] overflow-y-auto">
          {visible.length === 0 && (
            <div className="text-fg-subtle font-mono text-caption-sm text-center py-pad-4xl">
              $ awaiting execution...
            </div>
          )}
          <table className="w-full text-caption-sm font-mono">
            <tbody>
              {visible.map((s, i) => {
                const cfg = AG[s.agent];
                const isAct = i === curStep && !doneSteps.includes(i);
                const isDone = doneSteps.includes(i);
                return (
                  <tr
                    key={i}
                    className="border-b border-border-subtle transition-opacity duration-300 align-top"
                    style={{ opacity: isAct ? 1 : isDone ? 0.6 : 0.3 }}
                  >
                    {/* Agent badge */}
                    <td className="py-pad-md px-pad-xl w-[100px] shrink-0">
                      <span
                        className="inline-block px-pad-sm py-px rounded-radius-sm text-caption-xs font-bold whitespace-nowrap"
                        style={{ background: cfg.color + "18", color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    {/* Title + detail */}
                    <td className="py-pad-md pr-pad-xl">
                      <div className="flex items-center gap-gp-xs">
                        <span className="font-semibold text-fg-default">{s.title}</span>
                        {isAct && (
                          <span
                            className="inline-block w-2 h-2 rounded-full border-[1.5px] border-fg-muted animate-spin shrink-0"
                            style={{ borderTopColor: "var(--color-fg-foreground)" }}
                          />
                        )}
                        {isDone && <span className="text-fg-success text-caption-xs">✓</span>}
                      </div>
                      <span className="text-fg-subtle">{s.detail}</span>
                    </td>
                    {/* Files read / commands run */}
                    <td className="py-pad-md pr-pad-xl w-[200px] text-right">
                      {s.reads?.map((f) => (
                        <div key={f} className="text-fg-muted text-caption-xs">
                          <span className="text-fg-subtle">read</span> {f}
                        </div>
                      ))}
                      {s.runs?.map((r) => (
                        <div key={r} className="text-fg-success text-caption-xs">
                          <span className="text-fg-subtle">run</span> {r}
                        </div>
                      ))}
                      {s.signal && (
                        <div className="text-fg-brand text-caption-xs font-semibold mt-gp-xs">
                          → {s.signal}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <AgentModal
          agent={modal.agent}
          tab={modal.tab}
          onClose={() => setModal(null)}
          onTab={(t) => setModal({ ...modal, tab: t })}
        />
      )}
    </DocLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FLOW NODE CARD
   ═══════════════════════════════════════════════════════════════════════════ */

function FlowNode({ id, isActive, isDone, isInRoute, isRoot, onInfo, onFiles }: {
  id: string; isActive: boolean; isDone: boolean; isInRoute: boolean; isRoot?: boolean;
  onInfo: () => void; onFiles: () => void;
}) {
  const c = AG[id];

  return (
    <div
      className={[
        "rounded-radius-base border bg-bg-surface p-pad-3xl shadow-sh-sm transition-all duration-300",
        isRoot ? "w-[280px]" : "w-[200px]",
        isDone ? "border-border-success" : "border-border-subtle",
        !isInRoute ? "opacity-30 border-dashed" : "",
      ].join(" ")}
      style={{
        borderLeftColor: isActive ? c.color : undefined,
        borderLeftWidth: isActive ? "3px" : undefined,
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-gp-md">
          {/* Colored dot */}
          <span
            className={[
              "w-2.5 h-2.5 rounded-full shrink-0",
              isActive ? "animate-pulse" : "",
            ].join(" ")}
            style={{
              background: isDone ? "var(--color-fg-success)" : c.color,
              opacity: isInRoute ? 1 : 0.4,
            }}
          />
          <div>
            <span
              className="text-body-md font-medium font-bold"
              style={{
                color: isActive ? c.color : isDone ? "var(--color-fg-success)" : "var(--color-fg-foreground)",
              }}
            >
              {c.label}
            </span>
            {isDone && <span className="ml-gp-xs text-fg-success text-body-xs">✓</span>}
          </div>
        </div>

        {/* Action buttons */}
        {isInRoute && (
          <div className="flex gap-gp-xs">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onInfo(); }}
              className="bg-transparent border-none text-fg-subtle text-body-xs cursor-pointer p-px hover:text-fg-default transition-colors"
              title="Info"
            >
              ⓘ
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFiles(); }}
              className="bg-transparent border-none text-fg-subtle text-body-xs cursor-pointer p-px hover:text-fg-default transition-colors"
              title="Files"
            >
              📂
            </button>
          </div>
        )}
      </div>

      {/* Role in muted text */}
      <div className="text-caption-sm text-fg-subtle mt-gp-xs">{c.role}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════════════════════════════════════ */

function AgentModal({ agent, tab, onClose, onTab }: { agent: string; tab: "about" | "files"; onClose: () => void; onTab: (t: "about" | "files") => void }) {
  const c = AG[agent];
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[420px] max-h-[80vh] rounded-radius-base bg-bg-surface shadow-sh-lg ring-1 ring-foreground/5 overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex justify-between items-center px-pad-3xl py-pad-xl border-b border-border-subtle">
          <div className="flex items-center gap-gp-md">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: c.color }}
            />
            <span className="text-body-md font-medium font-bold" style={{ color: c.color }}>{c.label}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none text-fg-muted text-body-lg cursor-pointer hover:text-fg-default transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-subtle">
          {(["about", "files"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTab(t)}
              className="flex-1 py-pad-xl bg-transparent border-none text-body-xs font-semibold cursor-pointer transition-colors"
              style={{
                borderBottom: tab === t ? `2px solid ${c.color}` : "2px solid transparent",
                color: tab === t ? c.color : "var(--color-fg-muted)",
              }}
            >
              {t === "about" ? "ⓘ About" : "📂 Files"}
            </button>
          ))}
        </div>

        {/* Modal body */}
        <div className="px-pad-3xl py-pad-xl overflow-y-auto max-h-[60vh]">
          {tab === "about" ? (
            <div className="text-body-md text-fg-subtle leading-relaxed">
              <p className="mb-gp-xl">{c.description}</p>
              <div className="mb-gp-md">
                <span className="text-fg-default font-semibold">When activated: </span>{c.whenActivated}
              </div>
              <div className="mb-gp-md">
                <span className="text-fg-default font-semibold">Input: </span>
                <code className="bg-bg-muted px-pad-sm rounded-radius-sm text-code-sm">{c.signalIn}</code>
              </div>
              <div>
                <span className="text-fg-default font-semibold">Output: </span>
                <code className="bg-bg-muted px-pad-sm rounded-radius-sm text-code-sm">{c.signalOut}</code>
              </div>
            </div>
          ) : (
            <div className="text-body-md text-fg-subtle">
              {c.files.map((g) => (
                <div key={g.group} className="mb-gp-2xl">
                  <div className="text-caption-sm font-bold mb-gp-md" style={{ color: c.color }}>
                    📋 {g.group}
                  </div>
                  {g.items.map((f) => (
                    <div key={f} className="ml-sp-md mb-gp-xs flex items-center gap-gp-xs">
                      <span className="text-fg-subtle">├─</span>
                      <span className="font-mono text-code-sm">📄 {f}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
