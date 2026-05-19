import { DocLayout, DocHeader, DocSeparator } from "../components";
import { Badge } from "../../components/shadcn/badge";
import { RELEASES, type ChangeType, type ReleaseTag } from "./updates-data";

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

const TOC = RELEASES.map((r) => ({
  id: `v-${r.version.replace(/\./g, "-")}`,
  label: `v${r.version}`,
}));

/* ── helpers ─────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
  // YYYY-MM-DD → DD/MM/YYYY (locale BR)
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
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

        <div className="flex flex-col gap-gp-6xl">
          {RELEASES.map((release) => {
            const anchorId = `v-${release.version.replace(/\./g, "-")}`;
            return (
              <article
                key={release.version}
                id={anchorId}
                className="relative pl-[36px] scroll-mt-6"
              >
                {/* Ponto da timeline */}
                <div
                  className="absolute left-0 top-2 w-4 h-4 rounded-full bg-bg-surface border-2 border-border-brand shadow-sh-sm"
                  aria-hidden="true"
                />

                {/* Header da release */}
                <header className="flex items-center flex-wrap gap-gp-md mb-gp-md">
                  <h2 className="text-title-lg font-semibold text-fg-default">
                    v{release.version}
                  </h2>
                  <Badge color={TAG_COLOR[release.tag]} variant="soft" size="md">
                    {TAG_LABEL[release.tag]}
                  </Badge>
                  <span className="text-caption-sm text-fg-muted">
                    {formatDate(release.date)}
                  </span>
                </header>

                {/* Título da release */}
                <p className="text-body-lg text-fg-default font-medium mb-gp-md">
                  {release.title}
                </p>

                {/* Summary opcional */}
                {release.summary && (
                  <p className="text-body-md text-fg-muted mb-gp-2xl">
                    {release.summary}
                  </p>
                )}

                {/* Grupos de mudanças */}
                <div className="flex flex-col gap-gp-3xl">
                  {release.changes.map((group) => (
                    <div
                      key={group.type}
                      className="rounded-radius-base border border-border-subtle bg-bg-surface p-pad-3xl"
                    >
                      <div className="flex items-center gap-gp-md mb-gp-md">
                        <Badge
                          color={CHANGE_COLOR[group.type]}
                          variant="soft"
                          size="sm"
                        >
                          {CHANGE_LABEL[group.type]}
                        </Badge>
                        <span className="text-caption-sm text-fg-subtle">
                          {group.items.length}{" "}
                          {group.items.length === 1 ? "item" : "items"}
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
              </article>
            );
          })}
        </div>
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
