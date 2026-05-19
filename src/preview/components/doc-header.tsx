import { ExternalIcon } from "./doc-icons";

export function DocHeader({ category, title, description, dependency }: {
  category: string;
  title: string;
  description: string;
  dependency?: string;
}) {
  return (
    <header className="mb-0">
      <p className="text-body-md font-medium text-fg-brand mb-gp-md">{category}</p>
      <h1 className="text-[2rem] font-semibold text-fg-default tracking-tight leading-tight mb-gp-md">{title}</h1>
      <p className="text-body-lg text-fg-muted mb-gp-2xl">{description}</p>
      {dependency && (
        <span className="inline-flex items-center gap-gp-sm px-pad-md py-pad-xs rounded-radius-lg bg-bg-muted text-body-xs text-fg-muted">
          {dependency}
          <ExternalIcon />
        </span>
      )}
    </header>
  );
}
