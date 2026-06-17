import { useEffect, useState } from "react";
import { LayoutGrid, Boxes, Palette, Table2, Component, Rocket, Sun, Moon } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

type Theme = "light" | "dark";

const CONTEXTS = [
  {
    id: "overview",
    label: "Visão geral",
    icon: LayoutGrid,
    items: [
      { name: "Início", icon: Rocket, href: "#inicio" },
      { name: "Componentes", icon: Component, href: "#componentes", badge: "50" },
      { name: "Tokens", icon: Palette, href: "#tokens" },
    ],
  },
  {
    id: "data",
    label: "Dados",
    icon: Boxes,
    items: [
      { name: "Tabelas", icon: Table2, href: "#tabelas" },
      { name: "Dashboards", icon: LayoutGrid, href: "#dashboards" },
    ],
  },
];

const THEME_OPTIONS = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
];

export default function App() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <AppShell
      contexts={CONTEXTS}
      defaultActiveContextId="overview"
      defaultActiveItemHref="#inicio"
      breadcrumb={[{ label: "iGreen DS" }, { label: "Visão geral" }]}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={THEME_OPTIONS}
      user={{ name: "Sergio Vieira", email: "sergio@igreen.com", initials: "SV" }}
    >
      <div className="flex flex-col gap-gp-xl p-sp-xl max-w-container-lg">
        <header className="flex flex-col gap-gp-xs">
          <div className="flex items-center gap-gp-sm">
            <h1 className="text-heading-md font-semibold text-fg-default">iGreen Design System</h1>
            <Badge color="success" variant="soft">via registry</Badge>
          </div>
          <p className="text-body-sm text-fg-muted">
            Esta tela é o próprio <code className="text-code-sm">AppShell</code> do DS (sidebar + header + troca de
            tema), consumido por copy-in. Tudo aqui é código seu, puxado de <code className="text-code-sm">@igreen/*</code>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gp-md">
          <Card>
            <CardHeader>
              <CardTitle>Copy-in</CardTitle>
              <CardDescription>Componentes viram código seu</CardDescription>
            </CardHeader>
            <CardContent className="text-body-sm text-fg-muted">
              <code className="text-code-sm">npm run igreen:add -- button card</code> copia o componente pro seu
              projeto. Sem dependência de runtime do DS.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tema por token</CardTitle>
              <CardDescription>OKLCH, light + dark</CardDescription>
            </CardHeader>
            <CardContent className="text-body-sm text-fg-muted">
              Troque o tema no header (sol/lua). As cores mudam pelas CSS vars — os componentes são theme-aware, sem
              lógica condicional.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drift check</CardTitle>
              <CardDescription>Versão sob controle</CardDescription>
            </CardHeader>
            <CardContent className="text-body-sm text-fg-muted">
              <code className="text-code-sm">npm run igreen:drift</code> acusa edição local ou defasagem vs o registry,
              componente a componente.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Componentes em ação</CardTitle>
            <CardDescription>Button (cores × variantes) + Badge (status)</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-gp-md">
            <div className="flex flex-wrap items-center gap-gp-sm">
              <Button color="primary" variant="filled">Primary</Button>
              <Button color="critical" variant="filled">Critical</Button>
              <Button color="secondary" variant="outline">Secondary</Button>
              <Button color="primary" variant="soft">Soft</Button>
              <Button color="primary" variant="filled" loading>Loading</Button>
            </div>
            <div className="flex flex-wrap items-center gap-gp-sm">
              <Badge color="success" variant="soft">Ativo</Badge>
              <Badge color="warning" variant="soft">Pendente</Badge>
              <Badge color="critical" variant="soft">Cancelado</Badge>
              <Badge color="primary" variant="outline">Novo</Badge>
            </div>
          </CardContent>
        </Card>

        <p className="text-caption-sm text-fg-subtle">
          Puxe mais com <code className="text-code-sm">npm run igreen:add -- data-table form-field dialog</code> · 50
          componentes disponíveis no registry.
        </p>
      </div>
    </AppShell>
  );
}
