import { useMemo, useState, type ComponentType } from "react";
import {
  Search,
  X,
  MousePointerClick,
  Columns2,
  Columns3,
  ToggleLeft,
  ToggleRight,
  TextCursorInput,
  Type,
  Combine,
  RectangleEllipsis,
  Text,
  Tag,
  Tags,
  ChevronDown,
  SearchCheck,
  CheckSquare,
  ListChecks,
  CircleDot,
  SlidersHorizontal,
  CalendarDays,
  Calendar,
  CalendarRange,
  Palette,
  FileUp,
  CircleUser,
  Badge as BadgeIcon,
  CreditCard,
  ChevronsDownUp,
  SeparatorHorizontal,
  FileText,
  Gauge,
  Table,
  Table2,
  PanelBottom,
  LayoutGrid,
  List,
  LayoutList,
  AlertTriangle,
  ShieldAlert,
  BellRing,
  Bell,
  Percent,
  SquareDashed,
  LoaderCircle,
  Inbox,
  MessageSquare,
  ChevronRight,
  AppWindow,
  ArrowLeftRight,
  Menu,
  Navigation,
  Command,
  PanelLeft,
  PanelLeftClose,
  Maximize,
  PanelRight,
  MessageSquareMore,
  Contact,
  MoreHorizontal,
  MousePointer2,
  PictureInPicture2,
  LayoutDashboard,
  PanelTop,
  Heading,
  SquareStack,
  RectangleHorizontal,
  ScrollText,
  GalleryHorizontal,
  Shapes,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/shadcn/input-group";
import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";

/**
 * ComponentsOverviewDoc — índice navegável de todos os componentes do DS.
 * Campo de busca (filtra por nome/descrição) + agrupamento por categoria.
 * Cada card tem um ícone representativo e leva à DocPage (`#/<href>`).
 */

type LucideIcon = ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
type CompItem = { name: string; href: string; desc: string; icon: LucideIcon };
type CompGroup = { category: string; items: CompItem[] };

const CATALOG: CompGroup[] = [
  {
    category: "Ações",
    items: [
      { name: "Button", href: "button", desc: "Botão de ação (filled/outline/soft/ghost)", icon: MousePointerClick },
      { name: "ButtonGroup", href: "button-group", desc: "Grupo/split button", icon: Columns2 },
      { name: "Toggle", href: "toggle", desc: "Botão de alternância on/off", icon: ToggleLeft },
      { name: "Toggle Group", href: "toggle-group", desc: "Grupo de toggles", icon: Columns3 },
    ],
  },
  {
    category: "Formulário & Entrada",
    items: [
      { name: "FormField", href: "form-field", desc: "Wrapper de campo — label, helper, erro", icon: TextCursorInput },
      { name: "Input", href: "input", desc: "Campo de texto de linha única", icon: Type },
      { name: "Input Group", href: "input-group", desc: "Input com addon/ícone/prefixo", icon: Combine },
      { name: "Input OTP", href: "input-otp", desc: "Entrada de código (one-time password)", icon: RectangleEllipsis },
      { name: "Textarea", href: "textarea", desc: "Campo de texto multilinha", icon: Text },
      { name: "Label", href: "label", desc: "Rótulo de formulário", icon: Tag },
      { name: "Select", href: "select", desc: "Seleção em dropdown", icon: ChevronDown },
      { name: "Combobox", href: "combobox", desc: "Select com busca/autocomplete", icon: SearchCheck },
      { name: "Checkbox", href: "checkbox", desc: "Caixa de seleção", icon: CheckSquare },
      { name: "Card Checkbox", href: "card-checkbox", desc: "Checkbox em card selecionável", icon: ListChecks },
      { name: "Radio Group", href: "radio-group", desc: "Escolha exclusiva entre opções", icon: CircleDot },
      { name: "Switch", href: "switch", desc: "Interruptor liga/desliga", icon: ToggleRight },
      { name: "Slider", href: "slider", desc: "Seletor de valor por arrasto", icon: SlidersHorizontal },
      { name: "Date Picker", href: "date-picker", desc: "Seletor de data", icon: CalendarDays },
      { name: "Calendar", href: "calendar", desc: "Calendário inline", icon: Calendar },
      { name: "Month Year Picker", href: "month-year-picker", desc: "Seletor de mês/ano", icon: CalendarRange },
      { name: "Color Picker", href: "color-picker", desc: "Seletor de cor hex", icon: Palette },
      { name: "File Upload Field", href: "file-upload-field", desc: "Upload (dropzone)", icon: FileUp },
    ],
  },
  {
    category: "Exibição de dados",
    items: [
      { name: "Avatar", href: "avatar", desc: "Foto/iniciais de pessoa", icon: CircleUser },
      { name: "Badge", href: "badge", desc: "Rótulo/contador compacto", icon: BadgeIcon },
      { name: "Chip", href: "chip", desc: "Tag/pílula (status, filtro)", icon: Tags },
      { name: "Card", href: "card", desc: "Contêiner de conteúdo", icon: CreditCard },
      { name: "Accordion", href: "accordion", desc: "Seções expansíveis", icon: ChevronsDownUp },
      { name: "Separator", href: "separator", desc: "Divisor visual", icon: SeparatorHorizontal },
      { name: "Markdown Text", href: "markdown-text", desc: "Renderiza markdown", icon: FileText },
      { name: "KPI", href: "kpi", desc: "Card de métrica", icon: Gauge },
      { name: "Table", href: "table", desc: "Tabela base", icon: Table },
      { name: "DataTable", href: "data-table", desc: "Tabela completa (filtros, views)", icon: Table2 },
      { name: "Footer Table", href: "footer-table", desc: "Rodapé/paginação da tabela", icon: PanelBottom },
      { name: "Kanban", href: "kanban", desc: "Quadro por colunas (funil)", icon: LayoutGrid },
      { name: "List", href: "list", desc: "Lista base de itens", icon: List },
      { name: "DataList", href: "data-list", desc: "Lista de cards (grupos, árvore)", icon: LayoutList },
    ],
  },
  {
    category: "Feedback & Status",
    items: [
      { name: "Alert", href: "alert", desc: "Aviso inline", icon: AlertTriangle },
      { name: "Alert Modal", href: "alert-modal", desc: "Confirmação destrutiva", icon: ShieldAlert },
      { name: "Toast", href: "toast", desc: "Notificação temporária rica", icon: BellRing },
      { name: "Sonner", href: "sonner", desc: "Toaster base", icon: Bell },
      { name: "Progress", href: "progress", desc: "Barra de progresso", icon: Percent },
      { name: "Skeleton", href: "skeleton", desc: "Placeholder de carregamento", icon: SquareDashed },
      { name: "Spinner", href: "spinner", desc: "Indicador de loading", icon: LoaderCircle },
      { name: "Empty State", href: "empty-state", desc: "Estado vazio (ícone + CTA)", icon: Inbox },
      { name: "Tooltip", href: "tooltip", desc: "Dica no hover/foco", icon: MessageSquare },
    ],
  },
  {
    category: "Navegação",
    items: [
      { name: "Breadcrumb", href: "breadcrumb", desc: "Trilha de navegação", icon: ChevronRight },
      { name: "Tabs", href: "tabs", desc: "Abas (segmented ou line)", icon: AppWindow },
      { name: "Pagination", href: "pagination", desc: "Navegação entre páginas", icon: ArrowLeftRight },
      { name: "Menubar", href: "menubar", desc: "Barra de menus (app desktop)", icon: Menu },
      { name: "Navigation Menu", href: "navigation-menu", desc: "Menu com submenus", icon: Navigation },
      { name: "Command", href: "command", desc: "Paleta de comandos (⌘K)", icon: Command },
      { name: "MenuSidebar", href: "menu-sidebar", desc: "Sidebar com rail + contextos", icon: PanelLeft },
      { name: "SingleMenuSidebar", href: "single-menu-sidebar", desc: "Sidebar de nível único", icon: PanelLeftClose },
    ],
  },
  {
    category: "Overlays & Flutuantes",
    items: [
      { name: "Dialog", href: "dialog", desc: "Diálogo modal base", icon: MessageSquareMore },
      { name: "Modal", href: "modal", desc: "Modal do DS (sm→full)", icon: Maximize },
      { name: "Drawer", href: "drawer", desc: "Painel deslizante", icon: PanelBottom },
      { name: "Sheet", href: "sheet", desc: "Painel lateral/superior", icon: PanelRight },
      { name: "Popover", href: "popover", desc: "Balão flutuante ancorado", icon: MessageSquare },
      { name: "Hover Card", href: "hover-card", desc: "Prévia flutuante no hover", icon: Contact },
      { name: "Dropdown Menu", href: "dropdown-menu", desc: "Menu suspenso de ações", icon: MoreHorizontal },
      { name: "Context Menu", href: "context-menu", desc: "Menu de clique-direito", icon: MousePointer2 },
      { name: "Floating Panel", href: "floating-panel", desc: "Painel de detalhe flutuante", icon: PictureInPicture2 },
    ],
  },
  {
    category: "Layout & Estrutura",
    items: [
      { name: "App Shell", href: "app-shell", desc: "Casca do app (sidebar + header)", icon: LayoutDashboard },
      { name: "Header", href: "header", desc: "Topbar do app", icon: PanelTop },
      { name: "Page Header", href: "page-header", desc: "Cabeçalho de página", icon: Heading },
      { name: "Panel", href: "panel", desc: "Contêiner de seção", icon: SquareStack },
      { name: "Aspect Ratio", href: "aspect-ratio", desc: "Mantém proporção de mídia", icon: RectangleHorizontal },
      { name: "Scroll Area", href: "scroll-area", desc: "Área rolável estilizada", icon: ScrollText },
      { name: "Carousel", href: "carousel", desc: "Carrossel de slides", icon: GalleryHorizontal },
    ],
  },
  {
    category: "Mídia & Ícones",
    items: [
      { name: "Icon", href: "icon", desc: "Biblioteca de ícones (lucide)", icon: Shapes },
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
  const Icon = item.icon;
  return (
    <a
      href={`#/${item.href}`}
      className="group flex items-center gap-gp-sm rounded-radius-base border border-border-subtle bg-bg-surface px-pad-lg py-pad-sm transition-colors hover:border-border-brand hover:bg-bg-muted focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary"
    >
      <span className="grid size-comp-md shrink-0 place-items-center rounded-radius-sm bg-bg-muted text-fg-muted transition-colors group-hover:bg-bg-brand-subtle group-hover:text-fg-brand [&_svg]:size-icon-sm">
        <Icon strokeWidth={1.8} aria-hidden={true} />
      </span>
      <span className="text-body-sm font-medium text-fg-default group-hover:text-fg-brand truncate">
        {item.name}
      </span>
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

      {/* Busca — InputGroup do DS (foco animado padrão) */}
      <div className="mb-14 flex flex-col gap-gp-md">
        <InputGroup className="w-full">
          <InputGroupAddon align="inline-start">
            <Search className="size-icon-sm" strokeWidth={1.8} aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar componente…"
            aria-label="Buscar componente"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar busca"
              >
                <X className="size-icon-sm" strokeWidth={2} aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <span className="text-caption-md text-fg-muted tabular-nums">
          {shown} de {TOTAL} componentes
        </span>
      </div>

      {groups.map((g) => (
        <section key={g.category} className="mb-14">
          <SectionH2 id={slug(g.category)} title={`${g.category} (${g.items.length})`} />
          <div className="grid grid-cols-2 gap-gp-sm sm:grid-cols-3 lg:grid-cols-4">
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
