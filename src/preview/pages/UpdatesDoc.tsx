import { useState } from "react";
import { DocLayout, DocHeader, DocSeparator } from "../components";
import { Badge } from "../../components/shadcn/badge";
import { RELEASES, type ChangeType, type ReleaseTag } from "./updates-data";

/**
 * Quantas releases abrem expandidas. O resto vira linha compacta que expande no
 * clique — sem isto a página renderizava as 43 entries inteiras (335 bullets), o
 * TOC tinha 43 âncoras e nada disso era navegável. Nada é perdido: só fica fechado.
 */
const EXPANDIDAS = 3;

/* ── badge color mapping ────────────────────────────────────────── */

const CHANGE_LABEL: Record<ChangeType, string> = {
  added: "Adicionado",
  changed: "Alterado",
  improved: "Melhorado",
  fixed: "Corrigido",
  removed: "Removido",
  deprecated: "Depreciado",
  breaking: "Breaking",
};

const CHANGE_COLOR: Record<
  ChangeType,
  "success" | "primary" | "warning" | "critical" | "secondary" | "info"
> = {
  added: "success",
  changed: "primary",
  improved: "info",
  fixed: "warning",
  removed: "secondary",
  deprecated: "secondary",
  breaking: "critical",
};

const TAG_LABEL: Record<ReleaseTag, string> = {
  preview: "Preview",
  release: "Release",
  patch: "Patch",
  milestone: "Milestone",
};

const TAG_COLOR: Record<ReleaseTag, "primary" | "success" | "info" | "warning"> = {
  preview: "info",
  release: "success",
  patch: "warning",
  milestone: "primary",
};

/* ── TOC dynamic from data ───────────────────────────────────────── */

const anchorOf = (version: string) => `v-${version.replace(/\./g, "-")}`;

// Só as expandidas + o histórico: 43 âncoras planas não eram navegáveis, e cada
// uma custava uma leitura de layout por evento de scroll no TOC.
const TOC = [
  ...RELEASES.slice(0, EXPANDIDAS).map((r) => ({
    id: anchorOf(r.version),
    label: `v${r.version}`,
  })),
  { id: "historico", label: `Histórico (${Math.max(RELEASES.length - EXPANDIDAS, 0)})` },
];

/* ── helpers ─────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  // YYYY-MM-DD → DD/MM/YYYY (locale BR)
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Grupos de mudança de uma release — o miolo, renderizado só quando expandida. */
function ChangeGroups({ release }: { release: (typeof RELEASES)[number] }) {
  return (
    <div className="flex flex-col gap-gp-3xl">
      {release.changes.map((group) => (
        <div
          key={group.type}
          className="rounded-radius-base border border-border-subtle bg-bg-surface p-pad-3xl"
        >
          <div className="flex items-center gap-gp-md mb-gp-md">
            <Badge color={CHANGE_COLOR[group.type]} variant="soft" size="sm">
              {CHANGE_LABEL[group.type]}
            </Badge>
            <span className="text-caption-sm text-fg-subtle">
              {group.items.length} {group.items.length === 1 ? "item" : "items"}
            </span>
          </div>
          <ul className="flex flex-col gap-gp-sm pl-sp-md list-disc text-body-md text-fg-muted marker:text-fg-subtle">
            {group.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** Cabeçalho: versão + tag + data. Compartilhado pelos dois estados. */
function ReleaseMeta({ release }: { release: (typeof RELEASES)[number] }) {
  return (
    <>
      <Badge color={TAG_COLOR[release.tag]} variant="soft" size="sm">
        {TAG_LABEL[release.tag]}
      </Badge>
      <span className="text-caption-sm text-fg-muted shrink-0">{formatDate(release.date)}</span>
    </>
  );
}

/** Release expandida — o formato completo (as EXPANDIDAS mais recentes + as abertas no clique). */
function ReleaseFull({ release }: { release: (typeof RELEASES)[number] }) {
  return (
    <article id={anchorOf(release.version)} className="relative pl-[36px] scroll-mt-6">
      <div
        className="absolute left-0 top-2 w-4 h-4 rounded-full bg-bg-surface border-2 border-border-brand shadow-sh-sm"
        aria-hidden="true"
      />
      <header className="flex items-center flex-wrap gap-gp-md mb-gp-md">
        <h2 className="text-title-lg font-semibold text-fg-default">v{release.version}</h2>
        <ReleaseMeta release={release} />
      </header>
      <p className="text-body-lg text-fg-default font-medium mb-gp-md">{release.title}</p>
      {release.summary && (
        <p className="text-body-md text-fg-muted mb-gp-2xl">{release.summary}</p>
      )}
      <ChangeGroups release={release} />
    </article>
  );
}

/**
 * Linha compacta do histórico. Fechada renderiza 1 linha; aberta acrescenta o
 * summary + os grupos, inline, sem sair da página nem perder o lugar no scroll.
 */
function ReleaseRow({ release }: { release: (typeof RELEASES)[number] }) {
  const [aberta, setAberta] = useState(false);
  const total = release.changes.reduce((n, g) => n + g.items.length, 0);

  return (
    <div id={anchorOf(release.version)} className="relative pl-[36px] scroll-mt-6">
      <div
        className="absolute left-[5px] top-[13px] w-[6px] h-[6px] rounded-full bg-border-subtle"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        aria-expanded={aberta}
        className="group/row flex w-full items-center gap-gp-md py-pad-md text-left rounded-radius-md transition-colors hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
      >
        <span
          aria-hidden="true"
          className={[
            "text-fg-subtle transition-transform shrink-0 text-body-sm",
            aberta ? "rotate-90" : "",
          ].join(" ")}
        >
          ▸
        </span>
        <span className="text-body-md font-semibold text-fg-default shrink-0">
          v{release.version}
        </span>
        <ReleaseMeta release={release} />
        <span className="text-body-md text-fg-muted truncate min-w-0">{release.title}</span>
        <span className="text-caption-sm text-fg-subtle ml-auto shrink-0">
          {total} {total === 1 ? "item" : "items"}
        </span>
      </button>
      {aberta && (
        <div className="pt-pad-md pb-pad-2xl">
          {release.summary && (
            <p className="text-body-md text-fg-muted mb-gp-2xl">{release.summary}</p>
          )}
          <ChangeGroups release={release} />
        </div>
      )}
    </div>
  );
}

/* ── page ────────────────────────────────────────────────────────── */

export function UpdatesDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Updates"
        description="Timeline de releases, features e correções do iGreen Design System. Adicione novas entries em src/preview/pages/updates-data.ts."
      />
      <DocSeparator />

      {/* Intro */}
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Esta página é uma fonte amigável para acompanhar a evolução do DS sem precisar ler o histórico do git.
          Cada release agrupa as mudanças por tipo (adicionado, alterado, corrigido, etc).
          Para adicionar uma nova entry, edite{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">
            src/preview/pages/updates-data.ts
          </code>{" "}
          — o template está nos comentários do arquivo.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Linha vertical conectora */}
        <div
          className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-border-subtle"
          aria-hidden="true"
        />

        {/* As mais recentes, expandidas */}
        <div className="flex flex-col gap-gp-6xl">
          {RELEASES.slice(0, EXPANDIDAS).map((release) => (
            <ReleaseFull key={release.version} release={release} />
          ))}
        </div>

        {/* Histórico — linha por release, expande no clique */}
        {RELEASES.length > EXPANDIDAS && (
          <>
            <div id="historico" className="mt-20 mb-gp-2xl pl-[36px] scroll-mt-6">
              <div className="flex items-baseline gap-gp-md border-b border-border-subtle pb-pad-md">
                <h2 className="text-title-md font-semibold text-fg-default">Histórico</h2>
                <span className="text-caption-sm text-fg-muted">
                  {RELEASES.length - EXPANDIDAS} releases anteriores — clique pra abrir
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              {RELEASES.slice(EXPANDIDAS).map((release) => (
                <ReleaseRow key={release.version} release={release} />
              ))}
            </div>
          </>
        )}
      </div>
      {/* How to add */}
      <div className="mt-20 rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-4xl">
        <p className="text-body-md font-medium text-fg-default mb-gp-md">
          Como adicionar uma nova entry
        </p>
        <ol className="list-decimal pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
          <li>
            Abra{" "}
            <code className="font-mono text-code-sm bg-bg-surface px-pad-sm rounded-radius-sm">
              src/preview/pages/updates-data.ts
            </code>
          </li>
          <li>
            Adicione um objeto <code className="font-mono text-code-sm">ReleaseEntry</code>{" "}
            <strong className="text-fg-default">no topo</strong> do array{" "}
            <code className="font-mono text-code-sm">RELEASES</code> (mais recente primeiro)
          </li>
          <li>
            Defina <code className="font-mono text-code-sm">version</code>,{" "}
            <code className="font-mono text-code-sm">date</code>,{" "}
            <code className="font-mono text-code-sm">tag</code>,{" "}
            <code className="font-mono text-code-sm">title</code> e a lista de{" "}
            <code className="font-mono text-code-sm">changes</code> agrupadas por tipo
          </li>
          <li>
            Salve — esta página renderiza automaticamente a entry nova
          </li>
        </ol>
      </div>
    </DocLayout>
  );
}
