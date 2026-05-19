import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "Why Memory Matters" },
  { id: "layers", label: "The 4 Layers" },
  { id: "user-memory", label: "User Memory" },
  { id: "project-memory", label: "Project Memory" },
  { id: "audit", label: "Audit Log + Assumption" },
  { id: "lessons", label: "Lessons" },
  { id: "lifecycle", label: "Lifecycle" },
];

function LayerCard({
  layer,
  loc,
  loaded,
  desc,
  example,
}: {
  layer: string;
  loc: string;
  loaded: string;
  desc: string;
  example: string;
}) {
  return (
    <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
      <div className="flex items-center justify-between gap-gp-md mb-gp-md">
        <p className="text-body-md font-medium text-fg-default">{layer}</p>
        <Badge color="secondary" variant="outline" size="sm">{loaded}</Badge>
      </div>
      <p className="text-caption-sm text-fg-subtle mb-gp-md"><code className="font-mono text-code-sm">{loc}</code></p>
      <p className="text-body-md text-fg-muted mb-gp-md">{desc}</p>
      <div className="border-t border-border-subtle pt-pad-md">
        <p className="text-caption-sm text-fg-subtle mb-gp-sm">Example entry:</p>
        <code className="text-caption-sm font-mono text-fg-muted">{example}</code>
      </div>
    </div>
  );
}

export function PipelineMemoryDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Pipeline Infra"
        title="Memory System"
        description="Four layers of persistence that turn the pipeline reversible: user preferences, project notes, append-only audit log, and learned lessons."
      />
      <DocSeparator />

      {/* Why */}
      <SectionH2 id="what" title="Why Memory Matters" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A single session of an agent has finite context. Without memory, every decision is forgotten —
          the same mistake repeats, the same assumption gets re-invented, and the same preferences must be
          restated. The iGreen pipeline keeps four layers of memory so every choice is grounded in what came
          before, and reversible if it turns out wrong.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          {[
            { title: "Reversible decisions", desc: "Every entry records the assumption that justified it. When it breaks, you know what to undo." },
            { title: "No lesson lost", desc: "Errors become L-NNN lessons loaded before every task — the system prevents its own bugs." },
            { title: "User preferences persist", desc: "Style, tone, scope preferences saved in user memory survive across conversations." },
            { title: "Project state visible", desc: "memory/MEMORY.md is the index — anyone (human or agent) opens it to find the current truth." },
          ].map((p) => (
            <div key={p.title} className="rounded-radius-base border border-border-subtle p-pad-3xl">
              <p className="text-body-md font-medium text-fg-default mb-gp-sm">{p.title}</p>
              <p className="text-body-md text-fg-muted">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Layers */}
      <SectionH2 id="layers" title="The 4 Layers" />
      <div className="grid grid-cols-1 gap-gp-2xl mb-14">
        <LayerCard
          layer="1. User Memory"
          loc="~/.claude/projects/&lt;hash&gt;/memory/"
          loaded="Always (auto)"
          desc="Preferências do usuário individual: tom, feedback, projetos ativos. Persiste entre conversas, fora do repo."
          example="user_role.md · feedback_genuine_evaluation.md · project_kanban_v1.md"
        />
        <LayerCard
          layer="2. Project Memory"
          loc="memory/ (in repo)"
          loaded="On demand"
          desc="Notas project-level commitadas no repo. Compartilhadas entre devs e agentes. MEMORY.md é índice."
          example="MEMORY.md · project_token_nomenclatura_v3.md"
        />
        <LayerCard
          layer="3. Audit Log"
          loc=".ai/status/pipeline-state.md"
          loaded="On demand"
          desc="Append-only. Toda decisão do pipeline (APROVADO/CONCLUÍDO/REPROVADO/PAUSADO) com campo Assumption."
          example="### 2026-05-16 | DS DEV | Kanban primitive | CONCLUÍDO ..."
        />
        <LayerCard
          layer="4. Lessons"
          loc=".ai/status/lessons.md"
          loaded="Before every task"
          desc="L-NNN entries — padrões de erro recorrentes capturados com fix canônico. Loop fechado de aprendizado."
          example="L-001: ring-ring-* já tem alpha. NUNCA usar /30 ou /20."
        />
      </div>

      {/* User Memory */}
      <SectionH2 id="user-memory" title="User Memory" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Vive fora do repo, em <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">~/.claude/projects/&lt;hash&gt;/memory/</code>.
          O agente pode escrever lá quando o usuário corrige um comportamento ou expressa preferência forte.
        </p>
        <div className="grid grid-cols-2 gap-gp-3xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">Quando o agente escreve</p>
            <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
              <li>Usuário corrige tom ("não é pra concordar comigo")</li>
              <li>Usuário expressa preferência forte</li>
              <li>Bug recorrente identificado</li>
              <li>Estado ativo de projeto longo</li>
            </ul>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">Quando NÃO escrever</p>
            <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
              <li>Fato técnico genérico (vai pra rules)</li>
              <li>Padrão de erro do projeto (vai pra lessons)</li>
              <li>Estado efêmero de uma sessão</li>
              <li>Conteúdo sensível (credentials, etc)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Project Memory */}
      <SectionH2 id="project-memory" title="Project Memory" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A pasta <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">memory/</code> na raiz
          do repo guarda notas que devem ser compartilhadas entre devs e agentes. O índice fica em{" "}
          <code className="font-mono text-code-sm">MEMORY.md</code>.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`# Memory index

- [project_token_nomenclatura_v3](project_token_nomenclatura_v3.md) — código usa V3 (brand/danger/default);
  docs .ai/context/tokens/color.md e CLAUDE.md estão V2 desatualizadas`}</pre>
        </div>
        <p className="text-body-md text-fg-muted">
          Cada entry no MEMORY.md aponta para um arquivo curto com contexto, próximo passo e quem é o owner.
        </p>
      </div>

      {/* Audit */}
      <SectionH2 id="audit" title="Audit Log + Assumption" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.ai/status/pipeline-state.md</code> é
          append-only. Toda transição do pipeline grava uma entry com Assumption — o que precisa ser
          verdade para a decisão funcionar. Quando algo quebra, você procura qual Assumption deixou de valer.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`### 2026-05-16 | DS DEV | Kanban primitive | CONCLUÍDO
- Arquivos: src/components/ui/Kanban/{kanban.tsx, kanban.styles.ts, USAGE.md}
- Tokens: bg-bg-canvas, border-border-subtle, radius-radius-base
- Assumption: "Cards do Kanban podem ser composables pelo consumidor; primitive é dumb."
- Próximo: integração com DataTable via viewMode (caminho D)

### 2026-05-16 | DS REVIEWER | Kanban primitive | APROVADO
- Critique: usa border-subtle dark fica invisível em mobile. Não bloqueia v1.
- Lição candidata: L-015 (em validação)`}</pre>
        </div>
      </div>

      {/* Lessons */}
      <SectionH2 id="lessons" title="Lessons" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          As lições registradas são carregadas antes de qualquer tarefa do agente. Cada lição é um padrão de erro
          identificado uma vez — e nunca mais repetido. Fonte canônica:{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.ai/status/lessons.md</code>.
          Resumo de 1 linha em <code className="font-mono text-code-sm">.claude/rules/ds-standards.md</code>.
        </p>
        <p className="text-body-md text-fg-muted">
          <strong className="text-fg-default">Snapshot abaixo</strong> reflete o estado atual. Novas lições são adicionadas
          pelo DS Reviewer quando um padrão de erro novo é identificado — consulte{" "}
          <code className="font-mono text-code-sm">.ai/status/lessons.md</code> para a versão sempre atualizada.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[100px_1fr] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">ID</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Lição</div>
          </div>
          {[
            { id: "L-001", t: "ring-ring-* já tem alpha. NUNCA /30 ou /20." },
            { id: "L-002", t: "Tailwind literal proibido se houver token DS." },
            { id: "L-003", t: "ring-3 não existe. Usar ring-4." },
            { id: "L-004", t: "outline-none sem focus-visible viola a11y." },
            { id: "L-005", t: "Shadcn bg-input/50 → bg-bg-surface (token DS)." },
            { id: "L-006", t: "disabled SEMPRE último em compoundVariants." },
            { id: "L-007", t: "text-xs font-semibold avulso → preset text-body-xs." },
            { id: "L-008", t: "Hierarquia bg crescente: canvas < surface < subtle < muted." },
            { id: "L-009", t: "Border no dark: L% ≥ surface + 6%." },
            { id: "L-010", t: "--input/--border .dark deve diferir do :root." },
            { id: "L-011", t: "Dark: shadows ≥ 2× light, rings ≥ 1.5× alpha." },
            { id: "L-012", t: "Radix data-state: has-[[data-state=checked]]." },
            { id: "L-013", t: "Slider Radix: N thumbs para N valores." },
            { id: "L-014", t: "Switch/Slider thumb bg-white literal — exceção válida." },
          ].map((l) => (
            <div key={l.id} className="grid grid-cols-[100px_1fr] gap-0 border-t border-border-subtle">
              <div className="py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">{l.id}</code></div>
              <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">{l.t}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifecycle */}
      <SectionH2 id="lifecycle" title="Lifecycle of a Lesson" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl">
            {[
              { step: "1", title: "Erro acontece", desc: "Agente entrega código com padrão errado (ex: ring-3)." },
              { step: "2", title: "Reviewer pega", desc: "Checklist mecânico ou critique genuína identifica o problema." },
              { step: "3", title: "Correção aplicada", desc: "DS Dev refaz com padrão correto, pipeline-state.md grava entry." },
              { step: "4", title: "Lição criada", desc: "Reviewer adiciona L-NNN em .ai/status/lessons.md + resumo em ds-standards.md." },
              { step: "5", title: "Próxima sessão", desc: "Lição auto-carrega antes da próxima tarefa. Erro nunca mais aparece." },
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
      </div>
    </DocLayout>
  );
}
