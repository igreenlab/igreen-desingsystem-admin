import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "../../components/shadcn/command";
import { Button } from "../../components/ui/Button/button";
import {
  Calculator,
  Smile,
  CreditCard,
  User,
  Settings,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Calendar,
  Folder,
  FileText,
  Home,
} from "lucide-react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default (palette)" },
  { id: "ex-shortcuts", label: "With Shortcuts" },
  { id: "ex-groups", label: "Multiple Groups" },
  { id: "ex-keywords", label: "Fuzzy Search (keywords)" },
  { id: "ex-inline", label: "Inline (sem Dialog)" },
  { id: "ex-hotkey", label: "Hotkey ⌘K" },
  { id: "api", label: "API Reference" },
  { id: "api-dialog", label: "<CommandDialog>" },
  { id: "api-parts", label: "Subcomponents" },
];

const PROPS_DIALOG = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
];

const PROPS_PARTS = [
  { name: "<Command>", type: "Container raiz (use direto pra modo inline)", defaultVal: "—" },
  { name: "<CommandDialog>", type: "Wrapper de modal (combina Dialog + Command)", defaultVal: "—" },
  { name: "<CommandInput>", type: "Campo de busca com search icon", defaultVal: "—" },
  { name: "<CommandList>", type: "Lista scrollável (max-h 300px)", defaultVal: "—" },
  { name: "<CommandEmpty>", type: "Estado vazio (quando search não casa)", defaultVal: "—" },
  { name: "<CommandGroup heading>", type: "Grupo de items com título", defaultVal: "—" },
  { name: "<CommandItem value? keywords? onSelect>", type: "Item selecionável (suporta fuzzy via keywords)", defaultVal: "—" },
  { name: "<CommandSeparator>", type: "Divider entre grupos", defaultVal: "—" },
  { name: "<CommandShortcut>", type: "Texto de atalho à direita do item", defaultVal: "—" },
];

/* ── Hotkey example ───────────────────────────────────────────────────────── */
function HotkeyExample() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex flex-col gap-gp-md">
      <p className="text-body-md text-fg-muted">
        Pressione <kbd className="inline-flex items-center justify-center h-[20px] px-pad-xs rounded-radius-xs bg-bg-canvas border border-border-subtle text-caption-xs font-semibold text-fg-muted">⌘K</kbd> ou{" "}
        <kbd className="inline-flex items-center justify-center h-[20px] px-pad-xs rounded-radius-xs bg-bg-canvas border border-border-subtle text-caption-xs font-semibold text-fg-muted">Ctrl+K</kbd> pra abrir.
      </p>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Acesso rápido">
            <CommandItem onSelect={() => setOpen(false)}>
              <Home /> <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <User /> <span>Perfil</span>
            </CommandItem>
            <CommandItem onSelect={() => setOpen(false)}>
              <Settings /> <span>Configurações</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export function CommandDoc() {
  const [openDefault, setOpenDefault] = useState(false);
  const [openShortcuts, setOpenShortcuts] = useState(false);
  const [openGroups, setOpenGroups] = useState(false);
  const [openKeywords, setOpenKeywords] = useState(false);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Command"
        description="Command palette com busca fuzzy, agrupamentos, atalhos e empty state. Construído sobre `cmdk` (Radix). Útil pra navegação rápida (⌘K), ações de teclado e auto-complete."
        dependency="cmdk"
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default — Command palette"
        description="Pattern básico: trigger externo abre o `<CommandDialog>` com input + lista. Esc fecha. Setas navegam, Enter seleciona."
        code={`const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Abrir</Button>

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Digite um comando..." />
  <CommandList>
    <CommandEmpty>Nenhum resultado.</CommandEmpty>
    <CommandGroup heading="Sugestões">
      <CommandItem onSelect={() => setOpen(false)}>
        <Calculator /> <span>Calculadora</span>
      </CommandItem>
      <CommandItem onSelect={() => setOpen(false)}>
        <Smile /> <span>Buscar emoji</span>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>`}
      >
        <Button
          color="secondary"
          variant="outline"
          size="sm"
          iconLeft={<Search className="size-4" />}
          onClick={() => setOpenDefault(true)}
        >
          Abrir command palette
        </Button>
        <CommandDialog open={openDefault} onOpenChange={setOpenDefault}>
          <CommandInput placeholder="Digite um comando..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Sugestões">
              <CommandItem onSelect={() => setOpenDefault(false)}>
                <Calculator /> <span>Calculadora</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpenDefault(false)}>
                <Smile /> <span>Buscar emoji</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpenDefault(false)}>
                <Calendar /> <span>Agenda</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </ExampleSection>

      {/* Shortcuts */}
      <ExampleSection
        id="ex-shortcuts"
        title="With Shortcuts"
        description="`<CommandShortcut>` renderiza texto à direita do item — typical pra mostrar atalhos de teclado."
        code={`<CommandItem onSelect={...}>
  <User /> <span>Perfil</span>
  <CommandShortcut>⌘P</CommandShortcut>
</CommandItem>`}
      >
        <Button
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => setOpenShortcuts(true)}
        >
          Abrir com atalhos
        </Button>
        <CommandDialog open={openShortcuts} onOpenChange={setOpenShortcuts}>
          <CommandInput placeholder="Digite um comando..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup heading="Configurações">
              <CommandItem onSelect={() => setOpenShortcuts(false)}>
                <User /> <span>Perfil</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpenShortcuts(false)}>
                <CreditCard /> <span>Faturamento</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpenShortcuts(false)}>
                <Settings /> <span>Configurações</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
              <CommandItem onSelect={() => setOpenShortcuts(false)}>
                <LogOut /> <span>Sair</span>
                <CommandShortcut>⇧⌘Q</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </ExampleSection>

      {/* Multiple Groups */}
      <ExampleSection
        id="ex-groups"
        title="Multiple Groups"
        description="Use `<CommandSeparator>` pra dividir grupos. Cada `<CommandGroup>` tem um heading próprio."
        code={`<CommandGroup heading="Sugestões"> ... </CommandGroup>
<CommandSeparator />
<CommandGroup heading="Configurações"> ... </CommandGroup>`}
      >
        <Button
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => setOpenGroups(true)}
        >
          Abrir com grupos
        </Button>
        <CommandDialog open={openGroups} onOpenChange={setOpenGroups}>
          <CommandInput placeholder="Digite um comando..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup heading="Sugestões">
              <CommandItem onSelect={() => setOpenGroups(false)}>
                <Calculator /> <span>Calculadora</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpenGroups(false)}>
                <Smile /> <span>Buscar emoji</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Navegação">
              <CommandItem onSelect={() => setOpenGroups(false)}>
                <Home /> <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpenGroups(false)}>
                <Folder /> <span>Projetos</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpenGroups(false)}>
                <FileText /> <span>Documentos</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Mensagens">
              <CommandItem onSelect={() => setOpenGroups(false)}>
                <Mail /> <span>Inbox</span>
              </CommandItem>
              <CommandItem onSelect={() => setOpenGroups(false)}>
                <MessageSquare /> <span>Conversas</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </ExampleSection>

      {/* Keywords (fuzzy search) */}
      <ExampleSection
        id="ex-keywords"
        title="Fuzzy Search com keywords"
        description='Passe `keywords` no `<CommandItem>` pra incluir palavras adicionais no índice de busca (não exibidas, apenas filtragem). Tente buscar por "nova" — vai casar com itens que têm keyword "criar".'
        code={`<CommandItem
  value="criar-cliente"
  keywords={["novo", "adicionar", "criar"]}
  onSelect={...}
>
  <Plus /> <span>Cliente</span>
</CommandItem>`}
      >
        <Button
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => setOpenKeywords(true)}
        >
          Abrir (buscar "nova" ou "criar")
        </Button>
        <CommandDialog open={openKeywords} onOpenChange={setOpenKeywords}>
          <CommandInput placeholder='Digite "nova", "criar", "perfil"...' />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup heading="Criar">
              <CommandItem
                value="novo-cliente"
                keywords={["novo", "adicionar", "criar"]}
                onSelect={() => setOpenKeywords(false)}
              >
                <Plus /> <span>Cliente</span>
              </CommandItem>
              <CommandItem
                value="novo-ticket"
                keywords={["nova", "adicionar", "criar", "suporte"]}
                onSelect={() => setOpenKeywords(false)}
              >
                <Plus /> <span>Ticket</span>
              </CommandItem>
              <CommandItem
                value="novo-projeto"
                keywords={["nova", "adicionar", "criar"]}
                onSelect={() => setOpenKeywords(false)}
              >
                <Plus /> <span>Projeto</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Acessar">
              <CommandItem
                value="perfil-usuario"
                keywords={["conta", "minha-conta"]}
                onSelect={() => setOpenKeywords(false)}
              >
                <User /> <span>Perfil</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </ExampleSection>

      {/* Inline (sem Dialog) */}
      <ExampleSection
        id="ex-inline"
        title="Inline (sem Dialog)"
        description="Use `<Command>` direto, sem wrapper Dialog, pra embed em qualquer lugar (sidebar de busca, dropdown custom, etc)."
        code={`<Command className="rounded-radius-base border border-border-default w-full max-w-md">
  <CommandInput placeholder="Buscar..." />
  <CommandList>
    <CommandGroup heading="Sugestões">
      <CommandItem><Calendar /> <span>Agenda</span></CommandItem>
      <CommandItem><Smile /> <span>Emoji</span></CommandItem>
    </CommandGroup>
  </CommandList>
</Command>`}
      >
        <Command className="rounded-radius-base border border-border-default w-full max-w-md">
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup heading="Sugestões">
              <CommandItem>
                <Calendar /> <span>Agenda</span>
              </CommandItem>
              <CommandItem>
                <Smile /> <span>Buscar emoji</span>
              </CommandItem>
              <CommandItem>
                <Calculator /> <span>Calculadora</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Configurações">
              <CommandItem>
                <User /> <span>Perfil</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings /> <span>Configurações</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </ExampleSection>

      {/* Hotkey */}
      <ExampleSection
        id="ex-hotkey"
        title="Hotkey ⌘K (atalho global)"
        description="Pattern típico de productivity apps: registrar listener global pra ⌘K/Ctrl+K abrir o palette de qualquer lugar."
        code={`useEffect(() => {
  const handler = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(o => !o);
    }
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);`}
      >
        <HotkeyExample />
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div id="api-dialog" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          {"<CommandDialog>"}
        </h3>
        <PropsTable items={PROPS_DIALOG} />
      </div>

      <div id="api-parts" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          Subcomponents
        </h3>
        <PropsTable items={PROPS_PARTS} />
      </div>
    </DocLayout>
  );
}
