import { useEffect, useState } from "react";
import { Moon, Sun, Terminal, Package } from "lucide-react";

type Theme = "light" | "dark";

const STEPS: { cmd: string; note: string }[] = [
  { cmd: "cp .env.local.example .env.local", note: "cole o IGREEN_TOKEN (peça ao mantenedor)" },
  { cmd: "npx shadcn@latest add @igreen/button", note: "puxa Button + tv (registryDependency)" },
  { cmd: "npx shadcn@latest add @igreen/form-field", note: "composite obrigatório de forms" },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col gap-gp-xl p-sp-xl max-w-container-md mx-auto">
      <header className="flex items-center justify-between pt-sp-lg">
        <div className="flex items-center gap-gp-md">
          <div className="size-10 rounded-radius-lg bg-bg-brand text-fg-on-brand flex items-center justify-center font-bold">
            iG
          </div>
          <div>
            <h1 className="text-heading-md font-semibold text-fg-default">iGreen Design System</h1>
            <p className="text-body-sm text-fg-muted">consumido via registry shadcn (@igreen/*)</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          className="inline-flex items-center gap-gp-xs min-h-form-md px-pad-lg rounded-radius-base border border-border-default bg-bg-surface text-body-sm text-fg-default hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary"
        >
          {theme === "light" ? <Moon className="size-icon-sm" /> : <Sun className="size-icon-sm" />}
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </header>

      <section className="rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-2xl shadow-sh-sm flex flex-col gap-gp-md">
        <div className="flex items-center gap-gp-sm text-fg-brand">
          <Package className="size-icon-md" />
          <h2 className="text-title-md font-semibold text-fg-default">Projeto pronto</h2>
        </div>
        <p className="text-body-sm text-fg-muted">
          Tema (tokens OKLCH), <code className="text-code-sm">cn</code> e{" "}
          <code className="text-code-sm">tv</code> do DS já vêm configurados — este toggle de
          tema usa só classes de token, sem nenhum componente instalado ainda. Puxe os
          componentes sob demanda pelo registry:
        </p>
      </section>

      <section className="flex flex-col gap-gp-sm">
        <div className="flex items-center gap-gp-xs text-fg-default">
          <Terminal className="size-icon-sm" />
          <h3 className="text-caption-md font-semibold uppercase tracking-wider">Próximos passos</h3>
        </div>
        <ol className="flex flex-col gap-gp-sm">
          {STEPS.map((s, i) => (
            <li key={i} className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-lg">
              <code className="text-code-sm text-fg-default">{s.cmd}</code>
              <p className="text-caption-sm text-fg-subtle mt-gp-xs">{s.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-auto pt-sp-lg border-t border-border-subtle">
        <p className="text-caption-sm text-fg-subtle">
          Tema: <strong className="text-fg-default">{theme}</strong> · CSS vars trocam sob{" "}
          <code className="text-code-sm">.dark</code>. Rode <code className="text-code-sm">npm run doctor</code>{" "}
          pra validar a integridade do <code className="text-code-sm">cn</code>/<code className="text-code-sm">tv</code>.
        </p>
      </footer>
    </div>
  );
}
