import { useEffect, useState } from "react";
import { Sun, Moon, Sparkles, Heart, AlertTriangle, Check } from "lucide-react";
import {
  Button,
  Chip,
  AlertModal,
  Badge,
  Avatar,
} from "@snksergio/design-system";

type Theme = "light" | "dark";

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <div className="min-h-screen p-pad-6xl flex flex-col gap-gp-6xl max-w-container-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-gp-xl">
          <div className="w-10 h-10 rounded-radius-lg bg-bg-brand text-fg-on-brand flex items-center justify-center font-bold">
            iG
          </div>
          <div>
            <h1 className="text-heading-md text-fg-default m-0">Exemplo de Consumo</h1>
            <p className="text-body-sm text-fg-muted m-0">
              @snksergio/design-system instalado via npm
            </p>
          </div>
        </div>

        <Button
          color="secondary"
          variant="outline"
          size="md"
          iconLeft={theme === "light" ? <Moon /> : <Sun />}
          onClick={toggleTheme}
        >
          {theme === "light" ? "Dark mode" : "Light mode"}
        </Button>
      </header>

      {/* Info card */}
      <section className="rounded-radius-base border border-border-subtle bg-bg-surface p-pad-4xl shadow-sh-sm">
        <div className="flex items-start gap-gp-xl">
          <div className="shrink-0 mt-1">
            <Sparkles className="size-icon-md text-fg-brand" />
          </div>
          <div className="flex-1">
            <h2 className="text-title-md text-fg-default m-0 mb-gp-md">
              4 componentes do DS em ação
            </h2>
            <p className="text-body-sm text-fg-muted m-0">
              Tudo o que aparece aqui — incluindo o toggle de tema acima — vem do pacote
              <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm mx-gp-xs">
                @snksergio/design-system@0.5.1
              </code>
              consumido por <code className="font-mono text-code-sm">npm install</code>.
              O tema CSS está sendo carregado de
              <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm mx-gp-xs">
                @snksergio/design-system/theme.css
              </code>
              no <code className="font-mono text-code-sm">index.css</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 — Buttons */}
      <section className="flex flex-col gap-gp-2xl">
        <h3 className="text-caption-md font-semibold text-fg-default m-0 uppercase tracking-wider">
          1. Button (color × variant)
        </h3>
        <div className="flex flex-wrap items-center gap-gp-md">
          <Button color="primary" variant="filled">Primary filled</Button>
          <Button color="primary" variant="outline">Outline</Button>
          <Button color="primary" variant="soft">Soft</Button>
          <Button color="primary" variant="ghost">Ghost</Button>
          <Button color="critical" variant="filled" iconLeft={<AlertTriangle />}>
            Critical
          </Button>
          <Button color="secondary" variant="outline" disabled>
            Disabled
          </Button>
        </div>
      </section>

      {/* Section 2 — Chips */}
      <section className="flex flex-col gap-gp-2xl">
        <h3 className="text-caption-md font-semibold text-fg-default m-0 uppercase tracking-wider">
          2. Chip (status / tags)
        </h3>
        <div className="flex flex-wrap items-center gap-gp-sm">
          <Chip color="primary" variant="soft">Em produção</Chip>
          <Chip color="success" variant="soft" iconLeft={<Check />}>
            Aprovado
          </Chip>
          <Chip color="warning" variant="soft">Pendente</Chip>
          <Chip color="danger" variant="soft">Bloqueado</Chip>
          <Chip color="primary" variant="outline">v0.1.1</Chip>
        </div>
      </section>

      {/* Section 3 — Badges + Avatars */}
      <section className="flex flex-col gap-gp-2xl">
        <h3 className="text-caption-md font-semibold text-fg-default m-0 uppercase tracking-wider">
          3. Badge + Avatar (do shadcn restilizado)
        </h3>
        <div className="flex flex-wrap items-center gap-gp-xl">
          <div className="flex items-center gap-gp-md">
            <Avatar size="md" color="brand">SV</Avatar>
            <span className="text-body-sm text-fg-default">Sergio Vieira</span>
            <Badge color="primary" variant="soft">Admin</Badge>
          </div>
          <div className="flex items-center gap-gp-md">
            <Avatar size="md" color="success">MA</Avatar>
            <span className="text-body-sm text-fg-default">Maria Andrade</span>
            <Badge color="success" variant="soft">Online</Badge>
          </div>
          <div className="flex items-center gap-gp-md">
            <Avatar size="md" colorHex="#7c3aed">PR</Avatar>
            <span className="text-body-sm text-fg-default">Pedro Ribeiro</span>
            <Badge color="warning" variant="soft">Idle</Badge>
          </div>
        </div>
      </section>

      {/* Section 4 — AlertModal */}
      <section className="flex flex-col gap-gp-2xl">
        <h3 className="text-caption-md font-semibold text-fg-default m-0 uppercase tracking-wider">
          4. AlertModal (Radix dialog restilizado)
        </h3>
        <div className="flex items-center gap-gp-md">
          <Button
            color="critical"
            variant="filled"
            iconLeft={<Heart />}
            onClick={() => setModalOpen(true)}
          >
            Abrir confirmação
          </Button>
          <span className="text-body-sm text-fg-muted">
            Modal acessível com focus trap, Esc, backdrop click
          </span>
        </div>

        <AlertModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          tone="danger"
          title="Excluir cliente?"
          description="Essa ação não pode ser desfeita. Maria Hernandez será removida permanentemente."
          confirmLabel="Sim, excluir"
          cancelLabel="Cancelar"
          onConfirm={() => {
            setModalOpen(false);
            console.log("confirmado");
          }}
        />
      </section>

      {/* Footer */}
      <footer className="mt-auto pt-pad-3xl border-t border-border-subtle">
        <p className="text-caption-sm text-fg-subtle m-0">
          Tema atual: <strong className="text-fg-default">{theme}</strong> · Variáveis CSS
          mudam automaticamente sob{" "}
          <code className="font-mono text-code-sm">.dark</code>. Componentes não têm
          lógica de tema — só consomem tokens.
        </p>
      </footer>
    </div>
  );
}
