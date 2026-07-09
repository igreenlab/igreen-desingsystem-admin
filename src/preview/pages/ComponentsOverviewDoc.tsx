import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";

/**
 * ComponentsOverviewDoc — índice navegável de todos os componentes do DS.
 * Campo de busca (filtra por nome/descrição) + agrupamento por categoria.
 * Cada card leva pra DocPage do componente (hash router: `#/<href>`).
 */

type CompItem = { name: string; href: string; desc: string };
type CompGroup = { category: string; items: CompItem[] };

const CATALOG: CompGroup[] = [
  {
    category: "Ações",
    items: [
      { name: "Button", href: "button", desc: "Botão de ação (variantes filled/outline/soft/ghost)" },
      { name: "ButtonGroup", href: "button-group", desc: "Grupo/split button com ações combinadas" },
      { name: "Toggle", href: "toggle", desc: "Botão de alternância on/off" },
      { name: "Toggle Group", href: "toggle-group", desc: "Grupo de toggles (single/multiple)" },
    ],
  },
  {
    category: "Formulário & Entrada",
    items: [
      { name: "FormField", href: "form-field", desc: "Wrapper de campo — label, helper, erro/sucesso" },
      { name: "Input", href: "input", desc: "Campo de texto de linha única" },
      { name: "Input Group", href: "input-group", desc: "Input com addon/ícone/prefixo" },
      { name: "Input OTP", href: "input-otp", desc: "Entrada de código (one-time password)" },
      { name: "Textarea", href: "textarea", desc: "Campo de texto multilinha" },
      { name: "Label", href: "label", desc: "Rótulo de formulário acessível" },
      { name: "Select", href: "select", desc: "Seleção de opção em dropdown" },
      { name: "Combobox", href: "combobox", desc: "Select com busca/autocomplete" },
      { name: "Checkbox", href: "checkbox", desc: "Caixa de seleção" },
      { name: "Card Checkbox", href: "card-checkbox", desc: "Checkbox em formato de card selecionável" },
      { name: "Radio Group", href: "radio-group", desc: "Escolha exclusiva entre opções" },
      { name: "Switch", href: "switch", desc: "Interruptor liga/desliga" },
      { name: "Slider", href: "slider", desc: "Seletor de valor por arrasto" },
      { name: "Date Picker", href: "date-picker", desc: "Seletor de data (calendário em popover)" },
      { name: "Calendar", href: "calendar", desc: "Calendário inline de datas" },
      { name: "Month Year Picker", href: "month-year-picker", desc: "Seletor de mês/ano" },
      { name: "Color Picker", href: "color-picker", desc: "Seletor de cor hex com presets" },
      { name: "File Upload Field", href: "file-upload-field", desc: "Campo de upload (dropzone + accept/tamanho)" },
    ],
  },
  {
    category: "Exibição de dados",
    items: [
      { name: "Avatar", href: "avatar", desc: "Foto/iniciais de pessoa ou entidade" },
      { name: "Badge", href: "badge", desc: "Rótulo/contador compacto" },
      { name: "Chip", href: "chip", desc: "Tag/pílula (status, filtro, seleção)" },
      { name: "Card", href: "card", desc: "Contêiner de conteúdo com header/footer" },
      { name: "Accordion", href: "accordion", desc: "Seções expansíveis/colapsáveis" },
      { name: "Separator", href: "separator", desc: "Divisor visual horizontal/vertical" },
      { name: "Markdown Text", href: "markdown-text", desc: "Renderiza markdown como texto estilizado" },
      { name: "KPI", href: "kpi", desc: "Card de métrica (valor + delta + ícone)" },
      { name: "Table", href: "table", desc: "Tabela base (primitivo)" },
      { name: "DataTable", href: "data-table", desc: "Tabela completa (filtros, views, kanban, edit)" },
      { name: "Footer Table", href: "footer-table", desc: "Rodapé de paginação/totalizadores da tabela" },
      { name: "Kanban", href: "kanban", desc: "Quadro por colunas (funil/status)" },
      { name: "List", href: "list", desc: "Lista base de itens" },
      { name: "DataList", href: "data-list", desc: "Lista de cards (grupos, hierarquia, DnD)" },
    ],
  },
  {
    category: "Feedback & Status",
    items: [
      { name: "Alert", href: "alert", desc: "Aviso inline (info/sucesso/erro)" },
      { name: "Alert Modal", href: "alert-modal", desc: "Confirmação destrutiva em modal" },
      { name: "Toast", href: "toast", desc: "Notificação temporária rica (sobre Sonner)" },
      { name: "Sonner", href: "sonner", desc: "Toaster base (monte 1× no root)" },
      { name: "Progress", href: "progress", desc: "Barra de progresso" },
      { name: "Skeleton", href: "skeleton", desc: "Placeholder de carregamento (pulse)" },
      { name: "Spinner", href: "spinner", desc: "Indicador de loading circular" },
      { name: "Empty State", href: "empty-state", desc: "Estado vazio (ícone + título + CTA)" },
      { name: "Tooltip", href: "tooltip", desc: "Dica no hover/foco" },
    ],
  },
  {
    category: "Navegação",
    items: [
      { name: "Breadcrumb", href: "breadcrumb", desc: "Trilha de navegação hierárquica" },
      { name: "Tabs", href: "tabs", desc: "Abas (segmented ou line/underline)" },
      { name: "Pagination", href: "pagination", desc: "Navegação entre páginas" },
      { name: "Menubar", href: "menubar", desc: "Barra de menus (estilo app desktop)" },
      { name: "Navigation Menu", href: "navigation-menu", desc: "Menu de navegação com submenus" },
      { name: "Command", href: "command", desc: "Paleta de comandos (⌘K) com busca" },
      { name: "MenuSidebar", href: "menu-sidebar", desc: "Sidebar com rail + contextos" },
      { name: "SingleMenuSidebar", href: "single-menu-sidebar", desc: "Sidebar de nível único" },
    ],
  },
  {
    category: "Overlays & Flutuantes",
    items: [
      { name: "Dialog", href: "dialog", desc: "Diálogo modal base" },
      { name: "Modal", href: "modal", desc: "Modal do DS (sm/md/lg/xl/full)" },
      { name: "Drawer", href: "drawer", desc: "Painel deslizante (mobile-friendly)" },
      { name: "Sheet", href: "sheet", desc: "Painel lateral/superior" },
      { name: "Popover", href: "popover", desc: "Balão flutuante ancorado" },
      { name: "Hover Card", href: "hover-card", desc: "Prévia flutuante no hover" },
      { name: "Dropdown Menu", href: "dropdown-menu", desc: "Menu suspenso de ações" },
      { name: "Context Menu", href: "context-menu", desc: "Menu de clique-direito" },
      { name: "Floating Panel", href: "floating-panel", desc: "Painel de detalhe flutuante" },
    ],
  },
  {
    category: "Layout & Estrutura",
    items: [
      { name: "App Shell", href: "app-shell", desc: "Casca do app (sidebar + header + conteúdo)" },
      { name: "Header", href: "header", desc: "Topbar do app (busca, tema, usuário)" },
      { name: "Page Header", href: "page-header", desc: "Cabeçalho de página (título + ações)" },
      { name: "Panel", href: "panel", desc: "Contêiner de seção com head" },
      { name: "Aspect Ratio", href: "aspect-ratio", desc: "Mantém proporção de mídia" },
      { name: "Scroll Area", href: "scroll-area", desc: "Área rolável com scrollbar estilizada" },
      { name: "Carousel", href: "carousel", desc: "Carrossel de slides" },
    ],
  },
  {
    category: "Mídia & Ícones",
    items: [
      { name: "Icon", href: "icon", desc: "Biblioteca de ícones (lucide)" },
    ],
  },
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const TOTAL = CATALOG.reduce((n, g) => n + g.items.length, 0);
const TOC = CATALOG.map((g) => ({ id: slug(g.category), label: g.category }));

function ComponentCard({ item }: { item: CompItem }) {
  return (
    <a
      href={`#/${item.href}`}
      className="group flex flex-col gap-gp-2xs rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base transition-colors hover:border-border-brand hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary"
    >
      <span className="text-body-sm font-semibold text-fg-default group-hover:text-fg-brand">
        {item.name}
      </span>
      <span className="text-caption-md text-fg-muted">{item.desc}</span>
    </a>
  );
}

export function ComponentsOverviewDoc() {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.map((g) => ({
      ...g,
      items: g.items.filter(
        (i) => i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q),
      ),
    })).filter((g) => g.items.length > 0);
  }, [query]);

  const shown = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Todos os componentes"
        description={`${TOTAL} componentes do iGreen DS, agrupados por categoria. Busque pelo nome ou clique num card pra abrir a documentação.`}
      />
      <DocSeparator />

      {/* Busca */}
      <div className="mb-14 flex flex-col gap-gp-md">
        <label className="relative flex items-center">
          <Search
            className="pointer-events-none absolute left-pad-lg size-icon-sm text-fg-muted"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar componente…"
            aria-label="Buscar componente"
            className="min-h-form-lg w-full max-w-[420px] rounded-radius-base border border-border-default bg-bg-surface pl-[40px] pr-[40px] text-body-sm text-fg-default placeholder:text-fg-muted transition-[box-shadow,border-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute left-[388px] grid size-icon-lg place-items-center rounded-radius-full text-fg-muted hover:text-fg-default"
            >
              <X className="size-icon-sm" strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </label>
        <span className="text-caption-md text-fg-muted tabular-nums">
          {shown} de {TOTAL} componentes
        </span>
      </div>

      {groups.map((g) => (
        <section key={g.category} className="mb-14">
          <SectionH2 id={slug(g.category)} title={`${g.category} (${g.items.length})`} />
          <div className="grid grid-cols-1 gap-gp-md sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((i) => (
              <ComponentCard key={i.href} item={i} />
            ))}
          </div>
        </section>
      ))}

      {groups.length === 0 && (
        <div className="flex flex-col items-center gap-gp-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-3xl text-center">
          <span className="text-body-md font-medium text-fg-default">
            Nenhum componente encontrado
          </span>
          <span className="text-body-sm text-fg-muted">
            Tente outro termo — buscamos por nome e descrição.
          </span>
        </div>
      )}
    </DocLayout>
  );
}

export default ComponentsOverviewDoc;
