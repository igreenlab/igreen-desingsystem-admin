/**
 * LandingDoc — porta de entrada do showcase (`#/landing`, default do `App.tsx`).
 *
 * Antes disso o showcase abria no `ButtonDoc`: quem chegava caía na doc de um
 * componente sem saber o que o sistema é, quantos componentes tem ou como instalar.
 *
 * ## O que esta página NÃO faz (e por quê)
 *
 * A origem foi um wireframe HTML autônomo entregue pelo mantenedor (não versionado
 * aqui — o registro do que ele trazia e do que foi descartado está na entrada de
 * 2026-08-11 do `pipeline-state.md`). A IA dele foi mantida; a implementação, não.
 *
 * - **Não redeclara cor.** O wireframe carregava as 5 marcas × 2 modos como CSS vars
 *   próprias, em `oklch` na mão. Aqui a troca de marca é o `useBrand()` real e a de
 *   modo o `useTheme()` real — então o switch do hero re-tinge componentes DE VERDADE,
 *   e não existe um 6º sistema de cor no repo pra sair de sincronia.
 * - **Não mantém lista de catálogo.** Vem do `getCatalog()`, derivado do `BASE_NAV`.
 *   O wireframe tinha 112 itens na mão quando o nav já tinha 137 — e a contagem do
 *   hero ("112 páginas") seria uma afirmação falsa no primeiro viewport. Aqui é
 *   `CATALOGO.length`.
 * - **Não linka pra produção.** No wireframe todo item ia pra
 *   `vercel.app/#/x` com `target="_blank"`; dentro do showcase isso abriria uma aba
 *   nova por clique em vez de navegar. Aqui é `useDocNav()`; item com `url` (app
 *   standalone `?app=…`) segue como link de documento, porque ele PRECISA recarregar.
 * - **Não finge componente.** As peças do palco são `Kpi`, `KpiDelta`,
 *   `ChartContainer`, `Table`, `Button`, `Chip`, `Switch` e `Badge` reais. Uma landing
 *   de design system que desenha os próprios componentes à mão mente sobre a única
 *   coisa que ela precisa provar.
 *
 * Efeitos ambientes (aura, beam, gradiente, reveal): `./landing.css` — o cabeçalho de
 * lá explica por que não moram no `globals.css` nem no tema gerado.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Blocks,
  Bot,
  Building2,
  Calendar,
  ChartColumn,
  ChevronDown,
  Check,
  Component,
  Copy,
  FlaskConical,
  Layers,
  LayoutDashboard,
  List as ListIcon,
  MessageSquare,
  MonitorPlay,
  MoreHorizontal,
  Moon,
  Package,
  Palette,
  Plus,
  Receipt,
  Rocket,
  Search,
  Split,
  Sparkles,
  Sun,
  Table as TableIcon,
  Target,
  Terminal,
  TriangleAlert,
  UserCheck,
  Users,
  Wallet,
  Workflow,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Kpi, KpiDelta, KpiGroup } from "../../components/ui/Kpi";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/Chart";
import { FormFieldInput } from "../../components/ui/FormField";
import { Switch } from "../../components/shadcn/switch";
import { Input } from "../../components/shadcn/input";
import { Badge } from "../../components/shadcn/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  useColumnWidths,
} from "../../components/ui/Table";
import { SingleMenuSidebar } from "../../components/ui/SingleMenuSidebar";
import {
  TableToolbar,
  TableToolbarViews,
  ToolbarFilterButton,
  ToolbarSearch,
} from "../../components/ui/TableToolbar";
import { BRANDS, useBrand } from "../../hooks/useBrand";
import { useTheme } from "../../hooks/useTheme";
import { getCatalog, getCatalogSections, useDocNav, type CatalogEntry } from "../components";
import "./landing.css";

type LucideIcon = ComponentType<{
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

/* ═════════════════════════════════════════════════════════════════════════════
   Dados

   Domínio de energia, igual aos outros exemplos do repo (kWh, franquia, licenciado).
   Palco de landing com "Lorem / Item 1" desperdiça o único lugar onde o visitante
   descobre pra que tipo de tela o sistema foi feito.
   ═════════════════════════════════════════════════════════════════════════════ */

const RECEITA = [
  { mes: "Fev", valor: 61 },
  { mes: "Mar", valor: 68 },
  { mes: "Abr", valor: 64 },
  { mes: "Mai", valor: 77 },
  { mes: "Jun", valor: 73 },
  { mes: "Jul", valor: 84 },
  { mes: "Ago", valor: 89 },
];

const RECEITA_CONFIG = {
  valor: { label: "Receita (R$ mil)", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

const CLIENTES = [
  { nome: "Solar Norte Ltda", doc: "12.345.678/0001-90", kwh: "4.201", status: "Ativo" },
  { nome: "Beta Energia ME", doc: "98.765.432/0001-10", kwh: "1.880", status: "Ativo" },
  { nome: "Gama Distribuidora", doc: "55.123.987/0001-44", kwh: "9.043", status: "Pendente" },
  { nome: "Delta Agro S/A", doc: "31.998.100/0001-72", kwh: "2.657", status: "Inativo" },
] as const;

const STATUS_COLOR = {
  Ativo: "success",
  Pendente: "warning",
  Inativo: "neutral",
  Análise: "warning",
  Pausado: "neutral",
} as const;

/** Linhas da tabela do dashboard do hero. */
const CONTRATOS = [
  { iniciais: "MR", cliente: "Marina Ribeiro", uc: "UC 4821-09", plano: "Solar 300", status: "Ativo", fatura: "R$ 412" },
  { iniciais: "JC", cliente: "João Carvalho", uc: "UC 1190-33", plano: "Solar 150", status: "Análise", fatura: "R$ 289" },
  { iniciais: "AL", cliente: "Ana Lima", uc: "UC 7734-02", plano: "Telecom 50", status: "Pausado", fatura: "R$ 0" },
  { iniciais: "RS", cliente: "Rafael Souza", uc: "UC 2206-71", plano: "Solar 500", status: "Ativo", fatura: "R$ 738" },
  { iniciais: "CB", cliente: "Camila Barros", uc: "UC 9013-44", plano: "Seguros", status: "Análise", fatura: "R$ 164" },
] as const;

/** A landing não se lista no próprio catálogo. */
const CATALOGO = getCatalog(["landing"]);
const SECOES = getCatalogSections(["landing"]);

/* ═════════════════════════════════════════════════════════════════════════════
   Primitivas locais de página
   ═════════════════════════════════════════════════════════════════════════════ */

/**
 * Entrou na viewport? Usado pelo reveal.
 *
 * ⚠️ Fail-open: sem `IntersectionObserver` (jsdom, browser antigo) o conteúdo aparece.
 * O caminho de falha de um reveal é a página em BRANCO — é a pior falha possível pra
 * uma porta de entrada, e é silenciosa.
 */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [dentro, setDentro] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setDentro(true);
      return;
    }
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            setDentro(true);
            io.unobserve(e.target);
          }
        }
      },
      // ⚠️ `-6%`, não `-12%`. Margem negativa encolhe a zona de interseção pelo
      // FUNDO, então um bloco perto do fim da página pode nunca alcançá-la: medido,
      // o footer ficava em `top: 825` com a zona terminando em 792 e a página já no
      // scroll máximo — `opacity: 0` permanente. Margem negativa grande precisa de
      // padding inferior que garanta o alcance; aqui vale os dois (ver `pb` da raiz).
      { rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, dentro };
}

/**
 * Escreve `--lp-p` (0→1) no elemento conforme ele sobe na tela — é o que "levanta" a
 * janela do hero. Os valores da curva vieram de medição no `projectise.framer.ai`
 * (ver o cabeçalho de `.lp-unfold` no landing.css).
 *
 * Escreve direto no `style` em vez de passar por state: é 1 propriedade CSS por frame,
 * e um `setState` a cada scroll re-renderizaria o dashboard inteiro do mockup.
 *
 * O container de scroll é o `<main>` do App, não o documento — daí o `closest`.
 */
function useUnfold<T extends HTMLElement>(distancia = 320) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--lp-p", "1");
      return;
    }

    const scroller: HTMLElement | Window =
      (el.closest("main") as HTMLElement | null) ?? window;

    let frame = 0;
    const medir = () => {
      frame = 0;
      const alvo = ref.current;
      if (!alvo) return;
      // Progresso pelo scroll ABSOLUTO do topo da página, não pela posição da janela
      // na viewport. Foi o que a medição do projectise mostrou: lá a janela está bem
      // dentro da viewport no scroll 0 e AINDA assim aparece deitada — ou seja, o
      // driver é "quanto a página desceu", não "quanto a peça subiu". Com o driver
      // por posição, esta janela (que fica ~700px abaixo do topo) já nascia 99,8%
      // de pé e a animação era invisível.
      const y = scroller instanceof Window ? window.scrollY : scroller.scrollTop;
      // `clamp` nas duas pontas: sem isso o overscroll devolve negativo e a janela
      // deita além do desenhado.
      alvo.style.setProperty("--lp-p", String(Math.max(0, Math.min(1, y / distancia))));
    };

    const agendar = () => {
      if (!frame) frame = requestAnimationFrame(medir);
    };

    medir();
    scroller.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, [distancia]);

  return ref;
}

/**
 * Escala o mockup pra caber na largura disponível, renderizando-o numa largura de
 * DESIGN fixa.
 *
 * É o que o pedido "mesmo estilo, porém com scale menor" exige de verdade: se eu
 * apenas apertasse o dashboard em 1180px, os componentes reagiriam ao container
 * (sidebar de 280px comendo 24% da largura, KPIs quebrando em 2 linhas) e o mockup
 * mostraria um layout que nenhum app real tem. Renderizando a 1440px e escalando,
 * cada componente mantém a proporção que teria num monitor — só menor. É também como
 * o projectise e o Flowtera fazem.
 *
 * Bônus: resolve o mobile sem `@media`. Num viewport de 390px o dashboard inteiro
 * encolhe em vez de refluir pra um layout quebrado.
 */
function useFitScale<T extends HTMLElement>(larguraDesign: number, escalaMinima = 1) {
  const ref = useRef<T | null>(null);
  const [escala, setEscala] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const medir = () => {
      const largura = el.clientWidth;
      if (largura <= 0) return;
      // O PISO é o que salva o mobile. Sem ele, num viewport de 390px a escala caía
      // pra 0,33 e o dashboard virava uma miniatura ilegível — pior que não mostrar.
      // Com piso, a janela CORTA a lateral (o app segue em tamanho legível e continua
      // além da moldura), que é exatamente o tratamento das referências.
      setEscala(Math.max(escalaMinima, Math.min(1, largura / larguraDesign)));
    };

    medir();
    // Sem ResizeObserver (jsdom) fica na escala medida no mount — degrada, não quebra.
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [larguraDesign, escalaMinima]);

  return { ref, escala };
}

/** Bloco que entra ao rolar. `i` escalona o delay via `--lp-i` (ver landing.css). */
function Reveal({
  i = 0,
  className,
  children,
}: {
  i?: number;
  className?: string;
  children: ReactNode;
}) {
  const { ref, dentro } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ "--lp-i": i } as CSSProperties}
      className={cn("lp-reveal", dentro && "is-in", className)}
    >
      {children}
    </div>
  );
}

/** Wrapper de largura — `main-content-max` (1368px) é o token de conteúdo do DS. */
function Wrap({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-lp-wrap className={cn("mx-auto w-full max-w-main-content-max px-pad-3xl", className)}>
      {children}
    </div>
  );
}

/**
 * Eyebrow + título + linha de apoio. Hierarquia por espaçamento, não por tamanho.
 *
 * `alinhamento` existe porque o wireframe usa os dois: a seção de tokens é centrada
 * (o seletor logo abaixo é o eixo da simetria), e instalação/prompt/catálogo são à
 * ESQUERDA — ali o conteúdo é uma leitura em duas colunas, e head centrado sobre
 * conteúdo assimétrico fica desalinhado.
 */
function SectionHead({
  eyebrow,
  title,
  em,
  alinhamento = "left",
  children,
}: {
  eyebrow: string;
  title: string;
  em?: string;
  alinhamento?: "left" | "center";
  children?: ReactNode;
}) {
  const centro = alinhamento === "center";
  return (
    <div className={cn("flex flex-col", centro && "items-center text-center")}>
      <span
        className="inline-flex w-fit items-center gap-gp-sm rounded-radius-full border border-border-brand-subtle
                   bg-bg-brand-subtle px-pad-lg py-pad-xs font-mono text-caption-xs uppercase
                   tracking-[0.12em] text-fg-brand"
      >
        <span className="size-[5px] rounded-radius-full bg-bg-brand" aria-hidden />
        {eyebrow}
      </span>
      <h2
        className={cn(
          "mt-gp-xl text-heading-lg font-semibold tracking-[-0.03em] text-fg-default",
          centro ? "max-w-[26ch]" : "max-w-[30ch]",
        )}
      >
        {title} {em && <em className="lp-grad not-italic">{em}</em>}
      </h2>
      {children && (
        <p className="mt-gp-lg max-w-[58ch] text-body-lg leading-relaxed text-fg-muted">
          {children}
        </p>
      )}
    </div>
  );
}

/** Botão de copiar com confirmação no próprio rótulo. */
function CopyButton({
  texto,
  label = "Copiar",
  className,
}: {
  texto: string;
  label?: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  const copiar = useCallback(() => {
    // Clipboard exige contexto seguro; sem ele o botão não pode mentir "Copiado".
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(texto).then(() => setCopiado(true));
  }, [texto]);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 1800);
    return () => clearTimeout(t);
  }, [copiado]);

  return (
    <Button
      color={copiado ? "success" : "secondary"}
      variant="outline"
      size="sm"
      onClick={copiar}
      iconLeft={copiado ? <Check /> : <Copy />}
      className={className}
    >
      {copiado ? "Copiado" : label}
    </Button>
  );
}

/** Bloco de terminal/código com header e botão de copiar. */
function CodeCard({ arquivo, codigo }: { arquivo: string; codigo: string }) {
  return (
    <div className="overflow-hidden rounded-radius-lg border border-border-subtle bg-bg-subtle">
      <div className="flex items-center justify-between gap-gp-md border-b border-border-subtle px-pad-xl py-pad-md">
        <span className="inline-flex items-center gap-gp-sm font-mono text-caption-sm text-fg-subtle">
          <Terminal className="size-icon-xs" aria-hidden />
          {arquivo}
        </span>
        <CopyButton texto={codigo} />
      </div>
      <pre className="scrollbar-thin overflow-x-auto px-pad-xl py-pad-lg font-mono text-code-sm leading-relaxed text-fg-muted">
        {codigo}
      </pre>
    </div>
  );
}

/** Card-seção padrão do DS (recipe de `dashboard-patterns.md` §2). */
function Card({
  titulo,
  subtitulo,
  acao,
  className,
  children,
}: {
  titulo?: string;
  subtitulo?: string;
  acao?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "lp-tint flex flex-col gap-gp-xl rounded-radius-xl border border-border-subtle",
        "bg-bg-surface p-pad-3xl shadow-sh-sm",
        className,
      )}
    >
      {(titulo || acao) && (
        <header className="flex items-start justify-between gap-gp-md">
          <div className="flex min-w-0 flex-col gap-[2px]">
            {titulo && <h3 className="m-0 text-body-md font-medium text-fg-default">{titulo}</h3>}
            {subtitulo && <p className="m-0 text-body-xs text-fg-muted">{subtitulo}</p>}
          </div>
          {acao && <div className="shrink-0">{acao}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Seletor de marca + modo

   Dois grupos segmentados lado a lado numa linha, no mesmo desenho de pílula —
   como no wireframe. O modo era um `Button` com ícone de sol/lua e ficava com peso
   visual diferente do seletor de marca, quebrando a leitura de "um controle só".
   ═════════════════════════════════════════════════════════════════════════════ */

/** Um item de grupo segmentado. Mesmo desenho pros dois grupos, de propósito. */
function SegItem({
  ativo,
  onClick,
  children,
  swatch,
}: {
  ativo: boolean;
  onClick: () => void;
  children: ReactNode;
  swatch?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "inline-flex min-h-form-md items-center gap-gp-sm rounded-radius-full px-pad-xl",
        "text-caption-md font-medium whitespace-nowrap transition-colors",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
        // Ativo = a cor da marca, cheia. Era `bg-bg-surface + shadow-sh-sm` sobre
        // `bg-bg-subtle`: a diferença entre os dois tokens é de poucos pontos de
        // luminância e o item selecionado praticamente não se distinguia.
        ativo
          ? "bg-bg-brand font-semibold text-fg-on-brand shadow-sh-sm"
          : "text-fg-muted hover:bg-bg-muted hover:text-fg-default",
      )}
    >
      {swatch && (
        <span
          aria-hidden
          className={cn(
            "size-[9px] shrink-0 rounded-radius-full ring-1 ring-inset",
            // Sobre o fundo brand cheio, o anel precisa de contraste próprio.
            ativo ? "ring-fg-on-brand/40" : "ring-border-default",
          )}
          style={{ background: swatch }}
        />
      )}
      {children}
    </button>
  );
}

function ThemeSwitcher() {
  const { brand, setBrand } = useBrand();
  const { isDark, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap items-center justify-center gap-gp-md">
      <div
        role="group"
        aria-label="Marca"
        className="flex flex-wrap items-center gap-gp-2xs rounded-radius-full border border-border-subtle bg-bg-subtle p-pad-2xs"
      >
        {BRANDS.map((b) => (
          <SegItem
            key={b.id}
            ativo={brand === b.id}
            onClick={() => setBrand(b.id)}
            swatch={b.swatch}
          >
            {b.id}
          </SegItem>
        ))}
      </div>

      <div
        role="group"
        aria-label="Modo"
        className="flex items-center gap-gp-2xs rounded-radius-full border border-border-subtle bg-bg-subtle p-pad-2xs"
      >
        <SegItem ativo={isDark} onClick={() => setTheme("dark")}>
          <Moon className="size-icon-xs" aria-hidden /> Escuro
        </SegItem>
        <SegItem ativo={!isDark} onClick={() => setTheme("light")}>
          <Sun className="size-icon-xs" aria-hidden /> Claro
        </SegItem>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Janela do hero — a peça principal

   O wireframe (e as 5 referências que o mantenedor trouxe: projectise, Flowtera,
   FXIFY, LyteNyte, reax) convergem no MESMO recurso: uma janela de app com bezel
   arredondado, um dashboard DE VERDADE dentro, cards flutuando nas bordas e o rodapé
   sumindo num fade. A 1ª versão desta landing tinha cards soltos sem dashboard — leu
   como peças desalinhadas, não como produto.

   Aqui o miolo é composto de componentes reais: `MenuSidebar` (o mesmo do AppShell),
   `Kpi`, `ChartContainer`, `Table`, `Chip`, `Badge`, `Button`, `Input`. Trocar a marca
   no seletor logo abaixo re-tinge tudo isto ao vivo.
   ═════════════════════════════════════════════════════════════════════════════ */

const KPIS_MOCK = [
  { label: "Clientes ativos", valor: "12.847", delta: "+8,2%", icone: Users },
  { label: "Faturamento", valor: "R$ 4,2M", delta: "+12,5%", icone: Wallet },
  { label: "Inadimplência", valor: "2,1%", delta: "-0,4%", icone: TriangleAlert },
  { label: "Ticket médio", valor: "R$ 327", delta: "+2,8%", icone: Receipt },
] as const;

const ENERGIA = [
  { mes: "set", kwh: 320 },
  { mes: "out", kwh: 412 },
  { mes: "nov", kwh: 388 },
  { mes: "dez", kwh: 455 },
  { mes: "jan", kwh: 470 },
  { mes: "fev", kwh: 505 },
  { mes: "mar", kwh: 690 },
  { mes: "abr", kwh: 520 },
  { mes: "mai", kwh: 545 },
];

const ENERGIA_CONFIG = {
  kwh: { label: "kWh injetados", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

/** Índice do mês corrente — barra destacada e tooltip aberto. */
const MES_DESTAQUE = 6;

const MIX = [
  { nome: "Solar", pct: 62 },
  { nome: "Telecom", pct: 21 },
  { nome: "Seguros", pct: 11 },
  { nome: "Consórcio", pct: 7 },
  { nome: "Energia B2B", pct: 4 },
  { nome: "Outros", pct: 2 },
];

/** Barra da chrome do browser — a "moldura" que faz o mockup ler como app real. */
function BrowserBar() {
  return (
    <div className="flex h-[34px] shrink-0 items-center gap-gp-md border-b border-border-subtle bg-bg-subtle px-pad-xl">
      <span className="flex items-center gap-gp-2xs" aria-hidden>
        {["bg-bg-danger", "bg-bg-warning", "bg-bg-success"].map((c) => (
          <span key={c} className={cn("size-[8px] rounded-radius-full opacity-70", c)} />
        ))}
      </span>
      <span className="mx-auto rounded-radius-full bg-bg-muted px-pad-xl py-[2px] font-mono text-caption-xs text-fg-subtle">
        app.igreen.com.br/operacao/dashboard
      </span>
    </div>
  );
}

/**
 * Sidebar do mockup — o `SingleMenuSidebar` REAL.
 *
 * Não é o `MenuSidebar`: aquele é rail + painel de contexto (medido: ~330px no
 * mockup), e ele esmagava o dashboard e mostrava um seletor de módulo do tamanho de
 * um card. O `SingleMenuSidebar` é o de nível único do próprio DS — 280px, lista
 * rotulada, exatamente a forma que o wireframe desenhou.
 */
const MODULO_MOCK = {
  id: "operacao",
  // O tamanho vem DAQUI: o SingleMenuSidebar renderiza o nó como recebido.
  icon: <Zap className="size-icon-sm" />,
  title: "Operação",
  subtitle: "MÓDULO ATIVO",
};

/**
 * ⚠️ `categories` vai como prop de TOPO, não dentro de `module`.
 *
 * O tipo aceita `categories` nos dois lugares, então o `tsc` passou — mas o
 * componente resolve `hasModules ? activeModule.categories : categories ?? []`, e
 * `hasModules` só é true quando existe `module.options` (caso multi-módulo). Passando
 * dentro de um `module` sem `options`, a lista caía no `?? []` e a sidebar renderizava
 * header + seletor + busca e **nenhum item**. Type-checked e errado; só o browser
 * mostrou.
 *
 * 10 entradas com 2 grupos expansíveis: com 6 a sidebar tinha metade da altura vazia
 * e o mockup parecia um app sem features.
 */
const CATEGORIAS_MOCK = [
    { id: "dashboard", icon: <LayoutDashboard />, label: "Dashboard", active: true },
    {
      id: "clientes",
      icon: <Users />,
      label: "Clientes",
      items: [
        { id: "carteira", label: "Carteira" },
        { id: "prospeccao", label: "Prospecção" },
      ],
    },
    {
      id: "contratos",
      icon: <Receipt />,
      label: "Contratos",
      items: [
        { id: "ativos", label: "Ativos" },
        { id: "analise", label: "Em análise" },
        { id: "encerrados", label: "Encerrados" },
      ],
    },
    { id: "faturas", icon: <Wallet />, label: "Faturas" },
    { id: "atendimento", icon: <MessageSquare />, label: "Atendimento" },
    { id: "licenciados", icon: <UserCheck />, label: "Licenciados" },
    { id: "usinas", icon: <Building2 />, label: "Usinas" },
    { id: "rateio", icon: <Split />, label: "Rateio" },
    { id: "relatorios", icon: <ChartColumn />, label: "Relatórios" },
    { id: "metas", icon: <Target />, label: "Metas" },
];

/**
 * ⚠️ A largura vem deste wrapper, não do componente — e é a MESMA armadilha que já
 * apareceu com o `MenuSidebar`: o que está dentro do mockup responde à **viewport**,
 * não à largura de design do mockup.
 *
 * O `SingleMenuSidebar` é `w-full md:w-[280px]`. Num celular (390px < 768) o `md:` não
 * casa, então o `w-full` resolvia pra 100% do container de 1280px e a sidebar comia o
 * mockup inteiro — o hero mobile mostrava só menu, sem dashboard. Medido no browser;
 * a matemática do `useFitScale` estava certa, quem mentia era o media query.
 *
 * Caixa de largura fixa: o `w-full` de dentro passa a resolver pra 280 em qualquer
 * viewport, sem `!important` e sem tocar o componente.
 */
function MockSidebar() {
  return (
    <div className="w-[280px] shrink-0 overflow-hidden">
      <SingleMenuSidebar
        logo={
          <span
            aria-hidden
            className="grid size-comp-lg place-items-center rounded-radius-base bg-bg-brand text-fg-on-brand"
          >
            <Zap className="size-icon-xs" />
          </span>
        }
        title="iGreen Admin"
        module={MODULO_MOCK}
        categories={CATEGORIAS_MOCK}
        user={{ name: "Sérgio Vieira", email: "sergio@igreen.com.br" }}
        activeItemId="dashboard"
      />
    </div>
  );
}

/* ── Dados dos KPIs com projeção ───────────────────────────────────────────── */

/** Séries das barras do KPI row — 7 pontos, a última é o mês corrente (destacada). */
const SERIE_A = [42, 51, 47, 62, 58, 71, 84];
const SERIE_B = [28, 44, 39, 52, 61, 57, 73];
const SERIE_C = [66, 58, 61, 49, 44, 39, 31];
const SERIE_D = [38, 46, 44, 55, 52, 63, 70];

const SPARK_B = [
  { v: 28 }, { v: 44 }, { v: 39 }, { v: 52 }, { v: 61 }, { v: 57 }, { v: 73 },
];
const DONUT_MIX = [
  { k: "solar", v: 62, fill: "var(--color-chart-1)" },
  { k: "telecom", v: 21, fill: "var(--color-chart-2)" },
  { k: "seguros", v: 11, fill: "var(--color-chart-4)" },
  { k: "outros", v: 6, fill: "var(--color-bg-muted)" },
];

const SPARK_CFG = {
  v: { label: "série", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

/**
 * KPI do dashboard — os QUATRO iguais, de propósito.
 *
 * A versão anterior dava um formato de mini-chart diferente pra cada um (barras, área,
 * linha, donut). Ficou parecendo uma vitrine de tipos de gráfico em vez de uma linha
 * de métricas: o olho compara os formatos em vez de comparar os números, que é o
 * trabalho de um KPI row.
 *
 * A anatomia é a do wireframe e a da página `#/kpi`: **label em caixa alta → valor →
 * sublabel de delta → barras**. Sem ícone.
 *
 * As barras são a mesma série, apagadas, com **uma** na cor da marca — o mês corrente.
 * Sinal de "onde estamos" sem legenda.
 */
function KpiCell({
  label,
  valor,
  delta,
  sublabel,
  descendo = false,
  serie,
}: {
  label: string;
  valor: string;
  delta: string;
  sublabel: string;
  descendo?: boolean;
  serie: number[];
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-2xl shadow-sh-sm">
      <p className="m-0 truncate text-caption-xs uppercase tracking-[0.06em] text-fg-subtle">
        {label}
      </p>
      <p className="m-0 mt-gp-sm text-stat-sm leading-none tabular-nums text-fg-default">
        {valor}
      </p>
      <p
        className={cn(
          "m-0 mt-gp-xs font-mono text-caption-sm",
          descendo ? "text-fg-danger" : "text-fg-success",
        )}
      >
        {descendo ? "▼" : "▲"} {delta}{" "}
        <span className="text-fg-subtle">{sublabel}</span>
      </p>
      <span aria-hidden className="mt-gp-md flex h-[22px] items-end gap-[3px]">
        {serie.map((h, i) => (
          <span
            key={i}
            className={cn(
              "flex-1 rounded-radius-sm",
              i === serie.length - 1 ? "bg-bg-brand" : "bg-bg-brand-subtle",
            )}
            style={{ height: `${h}%` }}
          />
        ))}
      </span>
    </div>
  );
}

function MockDashboard() {
  const colunas = useMemo(
    () => [
      { field: "cliente", headerName: "Cliente", width: 240 },
      { field: "uc", headerName: "Unidade", width: 140 },
      { field: "plano", headerName: "Plano", width: 130 },
      { field: "status", headerName: "Status", width: 120 },
      { field: "fatura", headerName: "Fatura", width: 110 },
    ],
    [],
  );
  const { widths } = useColumnWidths(colunas);

  return (
    // ⚠️ Sem altura forçada e sem `overflow-hidden`: a tela é montada COMPLETA, na
    // altura natural dela, e quem reduz é o `scale` de um nível acima. Foi o pedido
    // do mantenedor, e é o que conserta a classe de bug da versão anterior — eu
    // apertava o dashboard à mão e o resultado era KPI cortado no meio do glifo e
    // card de tabela passando por cima.
    <div className="flex min-w-0 flex-1 flex-col gap-gp-xl p-pad-4xl">
      {/* Header da página */}
      <header className="flex flex-wrap items-start justify-between gap-gp-lg">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <h3 className="m-0 text-heading-xs font-semibold text-fg-default">Visão geral</h3>
          <p className="m-0 text-body-sm text-fg-muted">
            Atualizado há 4 minutos · região Sudeste
          </p>
        </div>
        {/* Um botão de Período, não um segmentado Dia/Mês/Ano: esse segmentado não
            existe no DS (era desenho meu) e competia visualmente com o seletor de
            marca da própria landing. O recipe de period selector do
            `dashboard-patterns.md` §0 é exatamente Button outline + ícone de
            calendário + chevron. "Exportar" saiu — ação de export vive no `more` da
            toolbar, não no header. */}
        <div className="flex shrink-0 items-center gap-gp-md">
          <Button
            color="secondary"
            variant="outline"
            size="sm"
            iconLeft={<Calendar />}
            iconRight={<ChevronDown />}
          >
            Período
          </Button>
          <Button size="sm" iconLeft={<Plus />}>
            Novo contrato
          </Button>
        </div>
      </header>

      {/* KPI row — os quatro no MESMO formato (ver comentário do KpiCell) */}
      <div className="grid grid-cols-4 gap-gp-lg">
        <KpiCell label="Clientes ativos" valor="12.847" delta="8,2%" sublabel="vs. mês anterior" serie={SERIE_A} />
        <KpiCell label="Faturamento" valor="R$ 4,2M" delta="12,5%" sublabel="vs. mês anterior" serie={SERIE_B} />
        <KpiCell label="Inadimplência" valor="2,1%" delta="0,4%" sublabel="vs. mês anterior" descendo serie={SERIE_C} />
        <KpiCell label="Ticket médio" valor="R$ 327" delta="2,8%" sublabel="vs. mês anterior" serie={SERIE_D} />
      </div>
      {/* Chart-card + mix da carteira */}
      <div className="grid grid-cols-[1.7fr_1fr] gap-gp-xl">
        <Card titulo="Energia injetada" subtitulo="kWh · últimos 9 meses">
          {/* `YAxis hide tickCount`: o `CartesianGrid` desenha nas marcas do eixo Y, e
              sem eixo declarado o Recharts usa ~4 — as linhas ficavam muito espaçadas.
              O eixo entra escondido só pra densificar a grade. */}
          <ChartContainer config={ENERGIA_CONFIG} className="h-[180px] w-full">
            <BarChart data={ENERGIA} margin={{ left: 0, right: 0, top: 16, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <YAxis hide tickCount={6} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} tickMargin={8} />
              {/* Tooltip já ABERTO no mês corrente: um dashboard estático com tooltip
                  fechado não mostra que o gráfico é interativo. `defaultIndex` +
                  `active` fixam no índice do mês destacado. */}
              <ChartTooltip
                active
                defaultIndex={MES_DESTAQUE}
                cursor={false}
                content={<ChartTooltipContent />}
              />
              {/* Barras APAGADAS, uma na cor da marca — o mês corrente. Barra toda
                  colorida não diz nada; com uma destacada, a leitura é imediata. */}
              <Bar dataKey="kwh" radius={[4, 4, 0, 0]}>
                {ENERGIA.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === MES_DESTAQUE
                        ? "var(--color-chart-1)"
                        : "var(--color-bg-brand-subtle)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>

        <Card titulo="Mix da carteira" subtitulo="% da receita">
          <div className="flex flex-col gap-gp-lg">
            {MIX.map((m, i) => (
              <div key={m.nome} className="flex items-center gap-gp-md">
                <span
                  aria-hidden
                  className="size-[10px] shrink-0 rounded-radius-sm"
                  style={{ background: DONUT_MIX[i]?.fill }}
                />
                <span className="w-[70px] shrink-0 text-body-sm text-fg-muted">{m.nome}</span>
                <span className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-radius-full bg-bg-muted">
                  <span
                    className="block h-full rounded-radius-full"
                    style={{ width: `${m.pct}%`, background: DONUT_MIX[i]?.fill }}
                  />
                </span>
                <span className="w-[38px] shrink-0 text-right text-body-sm tabular-nums text-fg-default">
                  {m.pct}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tabela — a peça mais densa do DS */}
      <Card>
        {/* Header da tabela = o `TableToolbar` REAL do DS, não uma barra montada à
            mão. Layout dele é opinativo e fixo (abas de visão à esquerda; refresh,
            busca, filtro e configurações à direita), que é justamente a fidelidade
            pedida: a versão anterior era input + 2 chips soltos e não parecia com a
            toolbar que o DataTable de verdade renderiza. */}
        <TableToolbar
          savedViews={
            <TableToolbarViews
              // O campo é `name`, não `label` — e `owner: "preset"` é o que faz a
              // visão virar aba fixa sem botão de excluir (L-065).
              views={[
                { id: "ativos", name: "Ativos", owner: "preset" },
                { id: "analise", name: "Em análise", owner: "preset" },
              ]}
              activeViewId="ativos"
              allowCreate={false}
              onApply={() => {}}
              onApplyDefault={() => {}}
              onDelete={() => {}}
              onSave={() => {}}
            />
          }
          search={
            <ToolbarSearch
              value=""
              onChange={() => {}}
              placeholder="Buscar cliente, UC ou contrato…"
            />
          }
          filter={<ToolbarFilterButton isActive hasIndicator />}
        />

        <Table density="standard" ariaLabel="Contratos (exemplo)">
          <TableHead>
            {colunas.map((c) => (
              <TableHeadCell
                key={c.field}
                width={widths[c.field]}
                align={c.field === "fatura" ? "right" : "left"}
                sortable={c.field === "cliente"}
                sortDirection={c.field === "cliente" ? "asc" : null}
              >
                {c.headerName}
              </TableHeadCell>
            ))}
          </TableHead>
          <TableBody>
            {CONTRATOS.map((r) => (
              <TableRow key={r.uc}>
                <TableCell width={widths.cliente}>
                  <span className="flex min-w-0 items-center gap-gp-md">
                    <span
                      aria-hidden
                      className="grid size-comp-lg shrink-0 place-items-center rounded-radius-full bg-bg-brand-subtle text-caption-sm font-bold text-fg-brand"
                    >
                      {r.iniciais}
                    </span>
                    <span className="truncate font-medium text-fg-default">{r.cliente}</span>
                  </span>
                </TableCell>
                <TableCell width={widths.uc}>
                  <span className="font-mono text-fg-muted">{r.uc}</span>
                </TableCell>
                <TableCell width={widths.plano}>{r.plano}</TableCell>
                <TableCell width={widths.status}>
                  <Chip color={STATUS_COLOR[r.status]} variant="soft" size="sm">
                    {r.status}
                  </Chip>
                </TableCell>
                <TableCell width={widths.fatura} align="right">
                  <span className="tabular-nums">{r.fatura}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <footer className="flex items-center justify-between gap-gp-md pt-pad-md text-caption-md text-fg-muted">
          <span>1 selecionado · 431 registros</span>
          <span className="flex items-center gap-gp-2xs">
            {["1", "2", "3"].map((p) => (
              <span
                key={p}
                className={cn(
                  "grid size-comp-lg place-items-center rounded-radius-base",
                  p === "1" ? "bg-bg-brand text-fg-on-brand" : "text-fg-muted",
                )}
              >
                {p}
              </span>
            ))}
          </span>
        </footer>
      </Card>
    </div>
  );
}


/**
 * Tem margem lateral suficiente pra os flutuantes hangarem sem serem cortados?
 *
 * Substitui um breakpoint fixo, e a razão é que breakpoint aqui **não tem como estar
 * certo**: a largura disponível depende do sidebar de docs (260px), do `Wrap` e do teto
 * da janela — não só da viewport. Medido: com `2xl:block` os cards nunca apareciam num
 * monitor de 1440; baixando pra `lg:block` eles apareciam **cortados** em 1280, porque
 * o `<main>` é container de scroll e clipa em X.
 *
 * Medir a folga real resolve os dois casos e continua certo se o sidebar mudar de
 * largura amanhã.
 */
function useTemFolga<T extends HTMLElement>(folgaMinima: number) {
  const ref = useRef<T | null>(null);
  const [tem, setTem] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ⚠️ Contra o `Wrap`, não contra `parentElement`: o pai imediato da janela é o
    // próprio wrapper de 920px que ancora os flutuantes, então a folga media 1px e os
    // cards nunca entravam. A coluna que importa é a de conteúdo.
    const wrap = el.closest<HTMLElement>("[data-lp-wrap]");
    if (!wrap) return;

    const medir = () => {
      const folga = (wrap.clientWidth - el.clientWidth) / 2;
      setTem(folga >= folgaMinima);
    };

    medir();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(wrap);
    ro.observe(el);
    return () => ro.disconnect();
  }, [folgaMinima]);

  return { ref, tem };
}

/**
 * Card que flutua na BORDA da janela — a moldura, não a cobertura.
 *
 * A 1ª tentativa usava offsets de -8 a -24px e os cards caíam DENTRO da janela,
 * tapando os KPIs e o gráfico. Nas 5 referências eles ficam majoritariamente fora,
 * mordendo a borda: é isso que dá a sensação de profundidade em vez de bagunça.
 *
 * `hidden 2xl:block`: só aparecem quando existe margem lateral de verdade. Num
 * viewport apertado eles voltariam a cobrir o dashboard, que é o conteúdo.
 */
function FloatCard({
  className,
  i = 0,
  children,
}: {
  className?: string;
  i?: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{ "--lp-i": i } as CSSProperties}
      className={cn(
        "lp-bob lp-tint absolute z-20 w-[184px] rounded-radius-lg border border-border-default",
        "bg-bg-surface p-pad-lg shadow-sh-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Largura de DESIGN do mockup. O app é renderizado nela e escalado pra caber. */
const LARGURA_APP = 1280;
/**
 * Altura de DESIGN do app, e a altura VISÍVEL da janela.
 *
 * A janela é deliberadamente mais curta que o app: o rodapé do dashboard é cortado e
 * some no fade — é o que as 5 referências fazem, e o que faz o mockup parecer uma
 * tela que continua além da moldura.
 *
 * ⚠️ A 1ª versão derivava a altura do app de `ALTURA_JANELA / escala`, o que dava
 * exatamente a altura visível e fazia o conteúdo ser comprimido: os valores dos KPIs
 * cortavam no meio do glifo. Altura de design própria e generosa resolve — quem
 * recorta é a janela, não o layout.
 */
const ALTURA_APP = 880;
const ALTURA_JANELA = 560;

function HeroWindow() {
  const unfoldRef = useUnfold<HTMLDivElement>(360);
  const { ref: fitRef, escala } = useFitScale<HTMLDivElement>(LARGURA_APP, 0.52);
  // 96px = o maior offset dos flutuantes (-88) + respiro.
  const { ref: folgaRef, tem: temFolga } = useTemFolga<HTMLDivElement>(96);

  return (
    <div className="relative">
      <div className="lp-aura" aria-hidden />

      {/* ⚠️ Este wrapper de 920px é o que ANCORA os flutuantes.
          Na 1ª tentativa eles eram posicionados contra o `Wrap` (largura do conteúdo)
          e ficavam FORA dele — e o `<main>` do App, sendo container de scroll, clipa
          no eixo X: os cards apareciam cortados ao meio. Ancorados na janela, um
          offset de -76px cai dentro da margem lateral e some nada. */}
      <div className="relative mx-auto max-w-[920px]">
        {/* Bezel: outer radius 20 + padding 8 + inner radius 14 — proporção medida no
            projectise. A máscara de fade vem do `.lp-window`. */}
        <div
          ref={(el) => { unfoldRef.current = el; folgaRef.current = el; }}
          className="lp-unfold lp-window lp-beam lp-beam-slow relative z-10
                     rounded-[20px] border border-border-subtle bg-bg-subtle p-[8px] shadow-sh-lg"
        >
          <div className="overflow-hidden rounded-[14px] border border-border-default bg-bg-canvas">
            <BrowserBar />
            <div ref={fitRef} className="overflow-hidden" style={{ height: ALTURA_JANELA }}>
              {/* Largura E altura de design fixas + `scale`: os componentes veem um
                  monitor de 1280×700 e mantêm a proporção real — só menores. */}
              <div
                className="flex origin-top-left"
                style={{
                  width: LARGURA_APP,
                  height: ALTURA_APP,
                  transform: `scale(${escala})`,
                }}
              >
                <MockSidebar />
                <MockDashboard />
              </div>
            </div>
          </div>
        </div>

      {/* Flutuantes — emolduram a janela, como nas 5 referências */}
      {/* Sem folga medida, os flutuantes NÃO entram: cortados ao meio é pior que ausentes. */}
      {temFolga && (
      <>
      {/* 1. KPI de consumo — mini-bars em vez de barra chapada */}
      <FloatCard i={0} className="-left-[96px] top-[118px]">
        <div className="flex items-center gap-gp-sm">
          <span
            aria-hidden
            className="grid size-comp-lg shrink-0 place-items-center rounded-radius-base bg-bg-brand-subtle text-fg-brand"
          >
            <Zap className="size-icon-xs" />
          </span>
          <p className="m-0 min-w-0 flex-1 truncate text-caption-md text-fg-muted">
            Consumo do mês
          </p>
        </div>
        <p className="mt-gp-md text-stat-sm leading-none tabular-nums text-fg-default">
          1.284 <span className="text-caption-md font-normal text-fg-subtle">kWh</span>
        </p>
        <span aria-hidden className="mt-gp-md flex h-[26px] items-end gap-[3px]">
          {[38, 54, 46, 62, 55, 78, 96].map((h, idx) => (
            <span
              key={idx}
              className={cn(
                "flex-1 rounded-radius-sm",
                idx === 6 ? "bg-bg-brand" : "bg-bg-brand-subtle",
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </span>
        <p className="mt-gp-sm text-caption-sm text-fg-subtle">72% da franquia</p>
      </FloatCard>

      {/* 2. Receita — sparkline em área, com delta em Chip do DS */}
      <FloatCard i={1} className="-right-[104px] -top-[86px] w-[212px]">
        <div className="flex items-start justify-between gap-gp-sm">
          <p className="m-0 text-caption-md text-fg-muted">Receita recorrente</p>
          <Chip color="success" variant="soft" size="sm">
            +6,1%
          </Chip>
        </div>
        <p className="mt-gp-md text-stat-sm leading-none tabular-nums text-fg-default">
          R$ 89,4k
        </p>
        <div className="mt-gp-md h-[44px] w-full">
          <ChartContainer config={SPARK_CFG} className="h-[44px] w-full">
            <AreaChart data={SPARK_B} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
              <Area
                dataKey="v"
                type="natural"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </FloatCard>

      {/* 3. Card de KANBAN de verdade — a anatomia do `Kanban` do DS:
             título · descrição · chip de status · avatar no footerLeft · valor à
             direita. Antes era um card genérico com um badge solto. */}
      <FloatCard i={2} className="-left-[76px] bottom-[64px] w-[228px] p-pad-xl">
        <div className="flex items-start justify-between gap-gp-sm">
          <p className="m-0 min-w-0 text-body-sm font-semibold text-fg-default">
            Usina Solar — Lote 12
          </p>
          <MoreHorizontal className="size-icon-xs shrink-0 text-fg-subtle" aria-hidden />
        </div>
        <p className="mt-[2px] line-clamp-2 text-caption-sm leading-relaxed text-fg-muted">
          Homologação na concessionária, aguardando parecer de acesso.
        </p>
        <div className="mt-gp-md flex items-center gap-gp-sm">
          <Chip color="warning" variant="soft" size="sm">
            Em negociação
          </Chip>
          <span className="ml-auto text-body-sm font-semibold tabular-nums text-fg-default">
            R$ 48,2k
          </span>
        </div>
        <div className="mt-gp-md flex items-center gap-gp-sm border-t border-border-subtle pt-pad-md">
          <span
            aria-hidden
            className="grid size-comp-md shrink-0 place-items-center rounded-radius-full bg-bg-muted text-caption-xs font-bold text-fg-muted"
          >
            SV
          </span>
          <span className="min-w-0 flex-1 truncate text-caption-sm text-fg-muted">
            Sérgio Vieira
          </span>
          <span className="shrink-0 font-mono text-caption-xs text-fg-subtle">#4837</span>
        </div>
      </FloatCard>

      {/* 4. TOAST de verdade — a receita do `Toast`/Sonner do DS: superfície
             flutuante com ícone de status, título, descrição e o X de dispensar.
             Antes era um card com um check dentro, que não lia como notificação. */}
      <FloatCard i={3} className="-right-[74px] bottom-[132px] w-[304px] p-0">
        {/* Proporção RETANGULAR: ícone + texto numa linha só, ação à direita em vez
            de empilhada. Toast é largo e baixo; com a ação embaixo do texto o card
            ficava quase quadrado e lia como card, não como notificação. */}
        <div className="flex items-center gap-gp-md p-pad-lg">
          <span
            aria-hidden
            className="grid size-comp-lg shrink-0 place-items-center rounded-radius-full bg-bg-success-muted text-fg-success"
          >
            <Check className="size-icon-xs" strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body-sm font-semibold text-fg-default">
              Proposta aprovada
            </span>
            <span className="mt-[1px] block truncate text-caption-sm text-fg-muted">
              Contrato #4821 movido para Ativos.
            </span>
          </span>
          <span className="shrink-0 text-caption-sm font-medium text-fg-brand">Ver</span>
          <X className="size-icon-xs shrink-0 text-fg-subtle" aria-hidden />
        </div>
        {/* Barra de progresso do auto-dismiss — o detalhe que faz ler como toast. */}
        <span aria-hidden className="block h-[3px] w-full overflow-hidden rounded-b-radius-lg bg-bg-muted">
          <span className="block h-full w-[62%] bg-bg-success" />
        </span>
      </FloatCard>
      </>
      )}
      </div>
    </div>
  );
}


/* ═════════════════════════════════════════════════════════════════════════════
   Bento de componentes vivos

   ⚠️ Uma grade de 6 colunas com spans FIXOS — não um masonry com offsets. A 1ª versão
   desta landing usava `lg:mt-[38px]`/`lg:-mt-[10px]` pra "espalhar" as peças, e o
   resultado leu como coisa quebrada e desalinhada, não como composição. O wireframe
   acerta justamente aqui: 3 fileiras, tudo rente.

   Proporções medidas no wireframe: fileira 1 = 3 iguais (2+2+2) · fileira 2 = 3+3 ·
   fileira 3 = 2+4 (o DataTable pede largura).
   ═════════════════════════════════════════════════════════════════════════════ */

/** Card do bento: título + uma linha do que ele prova + o componente ao vivo. */
function BentoCard({
  titulo,
  descricao,
  href,
  className,
  children,
}: {
  titulo: string;
  descricao: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { onNavigate } = useDocNav();
  return (
    <div
      className={cn(
        "lp-tint group flex flex-col rounded-radius-xl border border-border-subtle bg-bg-surface",
        "p-pad-3xl shadow-sh-sm transition-colors hover:border-border-brand-subtle",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-gp-md">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <h3 className="m-0 text-title-sm font-semibold text-fg-default">{titulo}</h3>
          <p className="m-0 text-caption-md leading-relaxed text-fg-muted">{descricao}</p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate(href)}
          aria-label={`Abrir documentação de ${titulo}`}
          className="grid size-comp-md shrink-0 place-items-center rounded-radius-base text-fg-subtle
                     opacity-0 transition-all hover:bg-bg-muted hover:text-fg-brand
                     focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-4
                     focus-visible:ring-ring-brand group-hover:opacity-100"
        >
          <ArrowUpRight className="size-icon-xs" aria-hidden />
        </button>
      </div>
      <div className="mt-gp-xl flex min-w-0 flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

function Bento() {
  const linhasTabela = useMemo(
    () => [
      { id: "4821 · Solar", licenciado: "Marina R.", status: "Ativo", valor: "R$ 12.400" },
      { id: "4822 · Telecom", licenciado: "João C.", status: "Análise", valor: "R$ 3.190" },
      { id: "4823 · Seguros", licenciado: "Ana L.", status: "Pausado", valor: "R$ 890" },
    ],
    [],
  );

  return (
    <div className="grid grid-cols-1 gap-gp-xl md:grid-cols-2 lg:grid-cols-6">
      {/* ── Fileira 1: 2 + 2 + 2 ── */}
      <BentoCard
        titulo="Button"
        descricao="6 variants, 4 tamanhos, ícone opcional. Foco com ring por variant."
        href="button"
        className="lg:col-span-2"
      >
        <div className="flex flex-wrap items-center gap-gp-sm">
          <Button size="sm">Salvar</Button>
          <Button color="secondary" variant="outline" size="sm">
            Cancelar
          </Button>
          <Button color="secondary" variant="soft" size="sm">
            Duplicar
          </Button>
          <Button color="critical" variant="soft" size="sm">
            Excluir
          </Button>
        </div>
        <div className="mt-gp-lg flex flex-wrap items-center gap-gp-sm">
          {(["xs", "sm", "md"] as const).map((s) => (
            <Button key={s} color="secondary" variant="ghost" size={s}>
              {s}
            </Button>
          ))}
          <Button size="sm" loading>
            Salvando
          </Button>
        </div>
      </BentoCard>

      <BentoCard
        titulo="FormField"
        descricao="Label, hint, erro e estados — alvo de toque ≥ 44px."
        href="form-field"
        className="lg:col-span-2"
      >
        <div className="flex flex-col gap-form-gap">
          <FormFieldInput
            label="E-mail do licenciado"
            defaultValue="sergio@igreen.com.br"
          />
          <FormFieldInput label="Unidade consumidora" placeholder="UC 4821-09" />
        </div>
      </BentoCard>

      <BentoCard
        titulo="Chip & Badge"
        descricao="Semântica de status usando os tokens de feedback."
        href="chip"
        className="lg:col-span-2"
      >
        <div className="flex flex-wrap items-center gap-gp-sm">
          <Chip color="success" size="sm">
            Ativo
          </Chip>
          <Chip size="sm">Pendente</Chip>
          <Chip color="danger" variant="outline" size="sm">
            Cancelado
          </Chip>
          <Chip color="info" size="sm">
            Homologado
          </Chip>
        </div>
        <div className="mt-gp-lg flex flex-wrap items-center gap-gp-sm">
          <Badge color="success" variant="soft" size="sm">
            Pago
          </Badge>
          <Badge color="warning" variant="soft" size="sm">
            Vence hoje
          </Badge>
          <Badge color="secondary" variant="outline" size="sm">
            Arquivado
          </Badge>
        </div>
      </BentoCard>

      {/* ── Fileira 2: 3 + 3 ── */}
      <BentoCard
        titulo="Chart"
        descricao="Recharts com paleta derivada da marca ativa — a série acompanha o tema."
        href="chart-area"
        className="lg:col-span-3"
      >
        <ChartContainer config={RECEITA_CONFIG} className="h-[136px] w-full">
          <AreaChart data={RECEITA} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="4 4" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="valor"
              type="natural"
              stroke="var(--color-chart-1)"
              fill="var(--color-chart-1)"
              fillOpacity={0.18}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </BentoCard>

      {/* Antes aqui estava um card de SWATCHES de token. Saiu por pedido do
          mantenedor: era o único card sem componente de verdade dentro — seis
          retângulos coloridos não demonstram nada que o resto da página já não
          prove, e ficava visualmente pobre ao lado dos outros. A regra dos 3 tiers
          continua dita no texto do hero e tem página própria. */}
      <BentoCard
        titulo="Chart — pizza"
        descricao="Rampa monocromática derivada da marca ativa. Troque a marca acima e a série acompanha."
        href="chart-pie"
        className="lg:col-span-3"
      >
        <div className="flex items-center gap-gp-2xl">
          <ChartContainer config={SPARK_CFG} className="h-[136px] w-[136px] shrink-0">
            <PieChart>
              <Pie
                data={DONUT_MIX}
                dataKey="v"
                nameKey="k"
                innerRadius={40}
                outerRadius={62}
                strokeWidth={0}
              >
                {DONUT_MIX.map((d) => (
                  <Cell key={d.k} fill={d.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="m-0 flex min-w-0 flex-1 list-none flex-col gap-gp-md p-0">
            {MIX.map((m, i) => (
              <li key={m.nome} className="flex items-center gap-gp-md">
                <span
                  aria-hidden
                  className="size-[10px] shrink-0 rounded-radius-sm"
                  style={{ background: DONUT_MIX[i]?.fill }}
                />
                <span className="min-w-0 flex-1 truncate text-body-sm text-fg-muted">
                  {m.nome}
                </span>
                <span className="shrink-0 text-body-sm font-semibold tabular-nums text-fg-default">
                  {m.pct}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </BentoCard>

      {/* ── Fileira 3: 2 + 2 + 2 ── */}
      <BentoCard
        titulo="Kpi"
        descricao="Label, valor, delta semântico e projeção em barras — o mesmo recipe do dashboard do hero."
        href="kpi"
        className="lg:col-span-2"
      >
        <div className="flex flex-col gap-gp-md">
          <KpiCell
            label="Clientes ativos"
            valor="12.847"
            delta="8,2%"
            sublabel="vs. mês anterior"
            serie={SERIE_A}
          />
          <KpiCell
            label="Inadimplência"
            valor="2,1%"
            delta="0,4%"
            sublabel="vs. mês anterior"
            descendo
            serie={SERIE_C}
          />
        </div>
      </BentoCard>

      <BentoCard
        titulo="Switch & Toggle"
        descricao="Estados controlados, acessíveis por teclado."
        href="switch"
        className="lg:col-span-2"
      >
        <div className="flex flex-col divide-y divide-border-subtle">
          {[
            ["Notificar por e-mail", true],
            ["Resumo semanal", false],
            ["Modo compacto", true],
            ["Colunas fixas na tabela", false],
          ].map(([label, on], i) => (
            <div key={String(label)} className="flex items-center justify-between gap-gp-md py-pad-md">
              <label htmlFor={`lp-bento-sw-${i}`} className="text-body-sm text-fg-muted">
                {label}
              </label>
              <Switch id={`lp-bento-sw-${i}`} defaultChecked={Boolean(on)} />
            </div>
          ))}
        </div>
      </BentoCard>

      <BentoCard
        titulo="DataTable"
        descricao="Virtualização, agrupamento, tree-data, kanban view e toolbar de filtros — a peça mais densa do DS."
        href="data-table"
        className="lg:col-span-2"
      >
        <div className="overflow-hidden rounded-radius-base border border-border-subtle">
          <div className="grid grid-cols-[1.5fr_1fr_88px_86px] gap-gp-md border-b border-border-subtle bg-bg-table-head px-pad-xl py-pad-md font-mono text-caption-xs uppercase tracking-[0.08em] text-fg-subtle">
            <span>Contrato</span>
            <span>Licenciado</span>
            <span>Status</span>
            <span className="text-right">Valor</span>
          </div>
          {linhasTabela.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[1.5fr_1fr_88px_86px] items-center gap-gp-md border-b border-border-subtle px-pad-xl py-pad-md text-body-sm last:border-b-0"
            >
              <span className="truncate font-medium text-fg-default">{r.id}</span>
              <span className="truncate text-fg-muted">{r.licenciado}</span>
              <span>
                <Chip color={STATUS_COLOR[r.status as keyof typeof STATUS_COLOR]} variant="soft" size="sm">
                  {r.status}
                </Chip>
              </span>
              <span className="text-right tabular-nums text-fg-default">{r.valor}</span>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Instalação — os 4 canais

   Comandos conferidos contra a página Installation, não escritos de memória. O
   wireframe apontava o submódulo pro FORK pessoal (`snksergio/…`); o remote
   canônico é `igreenlab/igreen-desingsystem-admin` (Regra 8 / L-069).
   ═════════════════════════════════════════════════════════════════════════════ */

const CANAIS = [
  {
    id: "create",
    label: "npm create · projeto novo",
    arquivo: "terminal",
    passos: [
      {
        titulo: "Rode o CLI",
        desc: "Ele pergunta nome do projeto, package manager e qual tema de marca você quer.",
      },
      {
        titulo: "Entre e suba",
        desc: "Em ~30 segundos você tem Vite + React 19 + Tailwind v4 rodando em localhost:3200.",
      },
      {
        titulo: "Já vem pronto",
        desc: "Tema light/dark, exemplos navegáveis, CLAUDE.md de onboarding e o kit de IA (ds-kit + skills de tela).",
      },
    ],
    codigo: `# projeto novo, tudo configurado
npm create @snksergio/design-system my-app
cd my-app
npm run dev
# → http://localhost:3200`,
  },
  {
    id: "submodulo",
    label: "submódulo git",
    arquivo: "terminal + tsconfig.json",
    passos: [
      {
        titulo: "Adicione o submódulo",
        desc: "Aponta pro remote canônico. É o canal mais usado internamente, porque você acompanha o DS de perto.",
      },
      {
        titulo: "Aponte o alias",
        desc: "@ds/* → design-system/src/* no tsconfig E no bundler. Sem os dois, o TS resolve e o build não.",
      },
      {
        titulo: "Rode o ds:link",
        desc: "Projeta skills/commands do DS pro .claude/ do seu projeto — o Claude Code não desce até <submódulo>/.claude sozinho.",
      },
    ],
    codigo: `git submodule add https://github.com/igreenlab/igreen-desingsystem-admin design-system
git submodule update --init --recursive
npm --prefix design-system install

# o kit de IA no SEU .claude/
npm --prefix design-system run ds:link

// tsconfig.json
{ "compilerOptions": { "paths": { "@ds/*": ["design-system/src/*"] } } }`,
  },
  {
    id: "npm",
    label: "npm install",
    arquivo: "src/index.css",
    passos: [
      {
        titulo: "Instale o pacote",
        desc: "Modelo evergreen: npm update sempre puxa a última. React 19 + Tailwind v4 como pré-requisito.",
      },
      {
        titulo: "Declare o @source",
        desc: "Obrigatório. O Tailwind v4 não escaneia node_modules — sem essa linha os componentes vêm SEM spacing e radius, e não dá erro nenhum.",
      },
      {
        titulo: "Ative a marca",
        desc: "O overlay entra DEPOIS do tema base, e o data-theme tem que estar no <html>. Importar o CSS sozinho é no-op silencioso.",
      },
    ],
    codigo: `npm install @snksergio/design-system

/* src/index.css */
@import "tailwindcss";
@source "../node_modules/@snksergio/design-system/dist-lib/**/*.{mjs,cjs,js}";
@import "@snksergio/design-system/theme.css";

<html lang="pt-BR" data-theme="vibrant">`,
  },
  {
    id: "copyin",
    label: "copy-in / registry",
    arquivo: "terminal",
    passos: [
      {
        titulo: "Adicione por item",
        desc: "Padrão shadcn: o arquivo entra no SEU repo e passa a ser código seu, editável.",
      },
      {
        titulo: "Deps vêm junto",
        desc: "Cada item do registry declara as dependências reais — inclusive as de tipo.",
      },
      {
        titulo: "Customize na composição",
        desc: "Não nos tokens nem no cn/tv: o hook protect-ds avisa se você mexer no que é fundação.",
      },
    ],
    codigo: `npx shadcn add @igreen/data-table
npx shadcn add @igreen/app-shell

# o arquivo agora é SEU — customize na composição,
# não nos tokens (o hook protect-ds avisa)`,
  },
] as const;

/**
 * Seção de instalação no desenho do wireframe: head à ESQUERDA, tabs com sublinhado
 * (não pílula) e duas colunas — passos numerados | terminal.
 *
 * A 1ª versão era um card centrado com só o bloco de código: o "quando usar cada
 * canal" ficava numa linha de subtítulo e a decisão — que é o trabalho desta seção —
 * não tinha onde acontecer.
 */
function InstalacaoSection() {
  const [ativo, setAtivo] = useState<string>(CANAIS[0].id);
  const canal = CANAIS.find((c) => c.id === ativo) ?? CANAIS[0];

  return (
    <div className="flex flex-col gap-gp-2xl">
      {/* Tabs com sublinhado — a borda inferior corre por toda a largura e o item
          ativo a "quebra" com a cor da marca. */}
      <div role="tablist" aria-label="Canal de instalação" className="flex flex-wrap border-b border-border-subtle">
        {CANAIS.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={ativo === c.id}
            onClick={() => setAtivo(c.id)}
            className={cn(
              "-mb-px border-b-2 px-pad-xl py-pad-lg text-body-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
              ativo === c.id
                ? "border-border-brand font-medium text-fg-default"
                : "border-transparent text-fg-muted hover:text-fg-default",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-gp-2xl lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ol className="m-0 flex list-none flex-col gap-gp-2xl p-0">
          {canal.passos.map((p, i) => (
            <li key={p.titulo} className="flex gap-gp-lg">
              <span
                aria-hidden
                className="mt-[2px] grid size-comp-md shrink-0 place-items-center rounded-radius-full
                           border border-border-subtle bg-bg-subtle font-mono text-caption-xs
                           font-bold text-fg-muted"
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-body-md font-medium text-fg-default">{p.titulo}</span>
                <span className="mt-[2px] block text-body-sm leading-relaxed text-fg-muted">
                  {p.desc}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <CodeCard arquivo={canal.arquivo} codigo={canal.codigo} />
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Prompts — o atalho de quem usa Claude Code

   Dois trabalhos diferentes, dois prompts: INSTALAR (uma vez) e CONSTRUIR (sempre).
   Os nomes de classe aqui são os REAIS, com prefixo dobrado (`bg-bg-canvas`,
   `text-fg-default`, `ring-ring-brand`). O wireframe ensinava `bg-canvas` /
   `fg-default` / `ring-brand`, que não emitem CSS: um prompt errado aqui vira
   classe morta no projeto de quem colar.
   ═════════════════════════════════════════════════════════════════════════════ */

const PROMPT_INSTALAR = `Instale o iGreen Design System neste projeto como submódulo git e configure tudo. Não me pergunte nada que você possa verificar no repositório.

1. Adicione o submódulo e as dependências:
   git submodule add https://github.com/igreenlab/igreen-desingsystem-admin design-system
   git submodule update --init --recursive
   npm --prefix design-system install

2. Configure o alias "@ds" apontando pra design-system/src em DOIS lugares:
   - tsconfig.json → compilerOptions.paths: { "@ds/*": ["design-system/src/*"] }
   - bundler (vite.config.ts → resolve.alias, ou o equivalente do meu setup)
   Se o projeto já usa outro alias pra isso, mantenha o dele e me diga qual.

3. Importe o tema UMA vez no CSS de entrada, DEPOIS do @import "tailwindcss":
   @import "../design-system/src/styles/theme/tailwind-theme.css";
   Não precisa de @source: o submódulo está dentro da raiz, então o scan do
   Tailwind já o alcança.

4. Se eu for usar marca diferente da default, importe também o overlay
   design-system/src/styles/theme/brand-<id>.css DEPOIS do tema base, e aplique
   data-theme="<id>" no <html>. Importar o CSS sem o atributo é no-op silencioso.

5. Rode o ds-link, que é o que dá kit de IA pro projeto:
   npm --prefix design-system run ds:link
   Ele copia skills/commands/rules pro .claude/ daqui e escreve
   .claude/ds-config.json com mode:"submodule". Depois disso /ds-create-crud,
   /ds-create-list e /ds-create-dashboard existem neste projeto.

6. VALIDE antes de dizer que acabou: importe { Button } from "@ds/components/ui/Button",
   renderize numa rota, suba o dev server e confirme que o botão tem cor E
   spacing/radius. Se só a cor aparecer, o tema não foi importado.

Regras: nunca edite arquivos dentro de design-system/ — é submódulo, e customização
acontece na composição, no meu projeto. Ao atualizar (git pull --recurse-submodules),
re-rode o ds:link.`;

const PROMPT_CONSTRUIR = `Você vai construir telas com o iGreen Design System (React 19 + TypeScript + Tailwind v4). Trate estas regras como autoritativas.

IMPORTS
- Componentes pelo alias do projeto (ex.: "@ds/components/ui/Button") ou por
  { Button, DataTable, Kpi } from "@snksergio/design-system" no canal npm.
- tv() vem de "@/utils/tv" — nunca de "tailwind-variants" direto.
- Ícones: lucide-react. Fonte: Geist (já vem no tema).

TOKENS — é aqui que quase todo mundo erra
- Zero cor literal (#0fc589, bg-green-500) e zero paleta nativa do Tailwind.
- As classes DOBRAM o prefixo. É bg-bg-canvas, não bg-canvas:
    fundo   → bg-bg-canvas · bg-bg-surface · bg-bg-subtle · bg-bg-muted · bg-bg-brand
    texto   → text-fg-default · text-fg-muted · text-fg-subtle · text-fg-brand · text-fg-on-brand
    borda   → border-border-default · border-border-subtle · border-border-brand
    foco    → ring-ring-brand (o token já tem alpha — nunca /30)
- Tom sutil depende da família: status usa -muted (bg-bg-success-muted); brand usa
  -subtle (bg-bg-brand-subtle); papel neutro usa -subtle sem cor (bg-bg-subtle).
- Primitives (--color-brand-400) são API privada. Componente não importa primitive.

PREFIXOS ANTI-COLISÃO — obrigatórios
  gap-gp-md (não gap-4) · p-sp-md (não p-4) · px-pad-lg (não px-3)
  rounded-radius-base (não rounded-md) · shadow-sh-md (não shadow-md)
  min-h-form-lg = 40px · min-h-form-md = 36px · min-h-form-xl = 44px
  size-icon-md (não size-5)

TIPOGRAFIA
- 27 presets em 7 papéis: display / heading / title / body / caption / stat / code.
- Valor de KPI ou métrica → text-stat-{sm|md|lg|xl} + tabular-nums. Nunca text-[30px].
- Body padrão do projeto é text-body-sm (13/500).

FORMULÁRIO
- Sempre <FormField> (ou FormFieldInput/Select/Textarea). Nunca <label> na mão.
- Espaço entre campos: gap-form-gap (20px), não gap-gp-*.

DENSIDADE — o que este DS é
- Feito pra SaaS admin denso: tabela grande, filtro, form complexo, kanban, modal
  multi-step. Prefira DataTable a montar tabela na mão, e AppShell + MenuSidebar +
  PageHeader pro esqueleto.
- Filtro de tabela/lista é NATIVO do componente (enableColumnFilter, filterFields,
  defaultViews). Não gere selects soltos acima da grade.
- Componente de navegação com roteador: passe renderLink pro MenuSidebar/AppShell,
  senão o clique de menu recarrega a página inteira.

ACESSIBILIDADE
- Alvo de toque ≥ 44px (min-h-form-xl) — WCAG 2.5.5.
- focus-visible:outline-none + focus-visible:ring-4 ring-ring-{cor}. Nunca outline-none só.

ANTES DE CODAR
Liste os componentes do DS que você vai usar e confirme que cada um existe no
catálogo. Faltando algum, componha com os que existem — não crie componente novo
sem me perguntar.`;

const PROMPTS = [
  {
    id: "instalar",
    label: "Instalar o DS",
    resumo: "Cole uma vez, no projeto vazio",
    texto: PROMPT_INSTALAR,
  },
  {
    id: "construir",
    label: "Construir telas",
    resumo: "Cole no começo de cada sessão",
    texto: PROMPT_CONSTRUIR,
  },
] as const;

function PromptSection() {
  const [ativo, setAtivo] = useState<string>(PROMPTS[0].id);
  const atual = PROMPTS.find((p) => p.id === ativo) ?? PROMPTS[0];

  return (
    <Card className="lp-beam lp-beam-slow overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-gp-lg">
        <div
          role="tablist"
          aria-label="Prompt"
          className="flex items-center gap-gp-2xs rounded-radius-full border border-border-subtle bg-bg-subtle p-pad-2xs"
        >
          {PROMPTS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={ativo === p.id}
              onClick={() => setAtivo(p.id)}
              className={cn(
                "min-h-form-sm rounded-radius-full px-pad-xl text-body-sm font-medium",
                "transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
                ativo === p.id
                  ? "bg-bg-surface text-fg-default shadow-sh-sm"
                  : "text-fg-muted hover:text-fg-default",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <CopyButton texto={atual.texto} label="Copiar prompt" />
      </div>

      <p className="text-body-sm text-fg-subtle">{atual.resumo}</p>

      <pre
        className="scrollbar-thin max-h-[380px] overflow-auto rounded-radius-lg border border-border-subtle
                   bg-bg-subtle px-pad-3xl py-pad-xl font-mono text-code-sm leading-relaxed
                   whitespace-pre-wrap text-fg-muted"
      >
        {atual.texto}
      </pre>
    </Card>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Catálogo — derivado do nav
   ═════════════════════════════════════════════════════════════════════════════ */

/**
 * Ícone por SEÇÃO, não por item.
 *
 * O mantenedor pediu os cards do `#/components-overview`, que têm ícone por
 * componente. Ali a lista é escrita à mão (com `icon:` em cada linha) e cobre só
 * componentes; aqui o catálogo é **derivado** do nav e tem 137 itens, incluindo
 * tokens, agentes, pipeline e exemplos. Mapear 137 ícones à mão recriaria exatamente
 * a lista paralela que este catálogo existe pra não ter — e a próxima página nova
 * entraria sem ícone.
 *
 * Ícone por seção dá o mesmo ganho visual com zero manutenção: página nova herda o
 * ícone da seção dela automaticamente.
 */
const ICONE_SECAO: Record<string, LucideIcon> = {
  "Get Started": Rocket,
  Agents: Bot,
  "Pipeline Infra": Workflow,
  Foundations: Palette,
  Components: Blocks,
  Charts: ChartColumn,
  "Data Table Components": TableIcon,
  "List Components": ListIcon,
  Templates: LayoutDashboard,
  Examples: MonitorPlay,
  Demos: FlaskConical,
};

const ICONE_FALLBACK = Component;

function CatalogoCard({ item }: { item: CatalogEntry }) {
  const { onNavigate } = useDocNav();
  const Icone = ICONE_SECAO[item.section] ?? ICONE_FALLBACK;

  const conteudo = (
    <>
      <span
        aria-hidden
        className="grid size-comp-lg shrink-0 place-items-center rounded-radius-base bg-bg-muted
                   text-fg-muted transition-colors group-hover:bg-bg-brand-subtle
                   group-hover:text-fg-brand [&_svg]:size-icon-sm"
      >
        <Icone strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-fg-default transition-colors group-hover:text-fg-brand">
        {item.label}
      </span>
      {item.url && (
        <ArrowUpRight
          className="size-icon-xs shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-[2px] group-hover:text-fg-brand"
          aria-hidden
        />
      )}
    </>
  );

  const classe = cn(
    "group flex w-full items-center gap-gp-sm rounded-radius-base border border-border-subtle",
    "bg-bg-surface p-pad-sm text-left transition-colors",
    "hover:border-border-brand hover:bg-bg-muted",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
  );

  // App standalone (`?app=…`) ou build separado (`/demo/`) precisa de navegação de
  // DOCUMENTO — não dá pra roteá-los pelo hash router.
  return item.url ? (
    <a href={item.url} className={classe}>
      {conteudo}
    </a>
  ) : (
    <button type="button" onClick={() => onNavigate(item.href)} className={classe}>
      {conteudo}
    </button>
  );
}

function Catalogo() {
  const [termo, setTermo] = useState("");

  /** Agrupado por seção, na ordem do nav — como o `#/components-overview`. */
  const grupos = useMemo(() => {
    const t = termo.trim().toLowerCase();
    return SECOES.map((secao) => ({
      secao,
      itens: CATALOGO.filter(
        (i) =>
          i.section === secao &&
          (!t || i.label.toLowerCase().includes(t) || i.href.includes(t)),
      ),
    })).filter((g) => g.itens.length > 0);
  }, [termo]);

  const total = grupos.reduce((n, g) => n + g.itens.length, 0);

  return (
    <div className="flex flex-col gap-gp-2xl">
      <div className="flex flex-wrap items-center gap-gp-lg">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-pad-xl top-1/2 size-icon-sm -translate-y-1/2 text-fg-subtle"
            aria-hidden
          />
          <Input
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar componente, token, exemplo…"
            aria-label="Buscar no catálogo"
            className="min-h-form-xl pl-[42px]"
          />
        </div>
        <p className="shrink-0 font-mono text-caption-md text-fg-subtle" aria-live="polite">
          {total} {total === 1 ? "item" : "itens"}
        </p>
      </div>

      {grupos.length === 0 ? (
        <p className="py-pad-4xl text-center text-body-md text-fg-muted">
          Nada com esse termo. Tente “table”, “chart” ou “token”.
        </p>
      ) : (
        grupos.map((g) => (
          <section key={g.secao} className="flex flex-col gap-gp-lg">
            <header className="flex items-center gap-gp-md">
              <h3 className="m-0 text-title-sm font-semibold text-fg-default">{g.secao}</h3>
              <span className="h-px min-w-0 flex-1 bg-border-subtle" aria-hidden />
              <span className="shrink-0 font-mono text-caption-sm text-fg-subtle">
                {g.itens.length}
              </span>
            </header>
            <ul className="grid list-none grid-cols-1 gap-gp-md p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {g.itens.map((item) => (
                <li key={item.href}>
                  <CatalogoCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════════
   Página
   ═════════════════════════════════════════════════════════════════════════════ */

export function LandingDoc() {
  const { onNavigate } = useDocNav();
  const instalacaoRef = useRef<HTMLDivElement>(null);
  const catalogoRef = useRef<HTMLDivElement>(null);

  // `scrollIntoView`, não `href="#id"`: o App usa o hash como router (`#/landing`) e
  // reescreve `window.location.hash` num efeito. Âncora de fragmento entraria em
  // conflito direto com isso.
  const irPara = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    // `pb` generoso não é estética: garante que o último bloco alcance a zona de
    // interseção do reveal (ver o comentário do `rootMargin` no `useInView`).
    <div className="relative isolate overflow-hidden bg-bg-canvas pb-[128px]">
      <div className="lp-grid" aria-hidden />
      <div className="lp-glow" aria-hidden />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Wrap className="relative pt-[72px] lg:pt-[104px]">
        <div className="flex flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-gp-sm rounded-radius-full border border-border-default bg-bg-muted px-pad-xl py-pad-xs text-caption-md text-fg-muted">
              <span
                aria-hidden
                className="size-[6px] rounded-radius-full bg-bg-brand ring-4 ring-ring-brand"
              />
              <strong className="font-medium text-fg-default">
                {CATALOGO.length} páginas
              </strong>
              no catálogo · React 19 · Tailwind v4
            </span>
          </Reveal>

          <Reveal i={1}>
            <h1 className="mt-gp-2xl max-w-[19ch] text-display-lg font-semibold leading-[1.03] tracking-[-0.038em] text-fg-default">
              O design system dos{" "}
              <em className="lp-grad not-italic">SaaS internos da iGreen.</em>
            </h1>
          </Reveal>

          <Reveal i={2}>
            <p className="mt-gp-2xl max-w-[56ch] text-body-xl leading-relaxed text-fg-muted">
              Componentes, tokens em 3 tiers e telas prontas pra CRM, dashboard e painel
              denso de dados. Instala por npm, submódulo ou copy-in — e vem com kit de IA
              pra montar tela por intenção.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-[34px]">
            <div className="flex flex-wrap items-center justify-center gap-gp-md">
              <Button size="lg" onClick={() => irPara(instalacaoRef)} iconRight={<Package />}>
                Instalar
              </Button>
              <Button
                color="secondary"
                variant="outline"
                size="lg"
                onClick={() => irPara(catalogoRef)}
                iconRight={<Blocks />}
              >
                Ver componentes
              </Button>
            </div>
          </Reveal>

          <Reveal i={4} className="mt-[30px]">
            {/* Só números que a página pode provar. A versão anterior anunciava
                "44px alvo mínimo (WCAG 2.5.5)" e os chips de filtro do catálogo, na
                MESMA página, têm 28px — afirmação de garantia que o próprio artefato
                contradizia (L-060). O token de toque de 44px existe
                (`min-h-form-xl`), mas isso é fato do sistema, não desta tela. */}
            <dl className="flex flex-wrap items-center justify-center gap-x-[26px] gap-y-gp-md font-mono text-caption-md text-fg-subtle">
              {[
                ["4", "canais de consumo"],
                ["5", "marcas"],
                ["2", "modos"],
                ["3", "tiers de token"],
              ].map(([n, t]) => (
                <div key={t} className="flex items-center">
                  <dt className="sr-only">{t}</dt>
                  <dd className="flex items-center gap-gp-sm">
                    <strong className="font-medium text-fg-muted">{n}</strong>
                    <span>{t}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="mt-[64px]">
          <HeroWindow />
        </div>
      </Wrap>

      {/* ── Tokens vivos: seletor PRIMEIRO, componentes DEPOIS ───────────────
          A ordem é o pedido explícito do mantenedor, e faz sentido: o seletor é a
          causa e o bento é o efeito. Ver o seletor depois das peças invertia a
          leitura. */}
      {/* `relative` + `lp-section-glow`: o wireframe põe aura aqui também, e faz
          sentido — é a seção que FALA de cor. Sem ela a área fica chapada. */}
      <div className="relative pt-[112px]">
        <div className="lp-section-glow" aria-hidden />
        <Wrap className="relative">
          <Reveal>
            <SectionHead
              eyebrow="Tokens vivos"
              title="Uma base."
              em="Cinco marcas, dois modos."
              alinhamento="center"
            >
              Os componentes não conhecem cor — consomem a camada semantic via CSS vars.
              Trocar de marca é trocar um atributo no <code className="font-mono text-code-sm">&lt;html&gt;</code>.
              Experimente:
            </SectionHead>
          </Reveal>

          <Reveal i={1} className="mt-[36px]">
            <ThemeSwitcher />
          </Reveal>

          <Reveal i={2} className="mt-[40px]">
            <Bento />
          </Reveal>
        </Wrap>
      </div>

      {/* ── Instalação ───────────────────────────────────────────────────── */}
      <div ref={instalacaoRef} className="scroll-mt-[24px] pt-[112px]">
        <Wrap>
          <Reveal>
            <SectionHead eyebrow="Instalação" title="Quatro canais." em="Nenhum depreciado.">
              O mesmo sistema chega por quatro caminhos, e a escolha é sobre quanto do
              código você quer no seu repo — não sobre qual é o moderno.
            </SectionHead>
          </Reveal>

          <Reveal i={1} className="mt-[44px]">
            <InstalacaoSection />
          </Reveal>

          <Reveal i={2} className="mt-gp-2xl">
            <p className="text-caption-md text-fg-subtle">
              Passo a passo completo, pré-requisitos e troubleshooting na página{" "}
              <button
                type="button"
                onClick={() => onNavigate("installation")}
                className="font-medium text-fg-brand underline decoration-border-brand-subtle underline-offset-4
                           transition-colors hover:decoration-border-brand focus-visible:outline-none
                           focus-visible:ring-4 focus-visible:ring-ring-brand"
              >
                Installation
              </button>
              .
            </p>
          </Reveal>
        </Wrap>
      </div>

      {/* ── Prompts ──────────────────────────────────────────────────────── */}
      <div className="pt-[112px]">
        <Wrap>
          <Reveal>
            <SectionHead
              eyebrow="Kit de IA"
              title="Cole no Claude Code"
              em="e ele faz o resto."
            >
              Dois prompts com trabalhos diferentes: um instala o sistema no projeto, o
              outro ensina a construir dentro das regras. Nenhum dos dois inventa
              comando — saíram da doc deste repo.
            </SectionHead>
          </Reveal>

          <Reveal i={1} className="mt-[44px]">
            <PromptSection />
          </Reveal>

          <Reveal i={2} className="mt-gp-2xl">
            <p className="text-caption-md text-fg-subtle">
              Como o pipeline de agentes funciona por dentro:{" "}
              <button
                type="button"
                onClick={() => onNavigate("agents-overview")}
                className="font-medium text-fg-brand underline decoration-border-brand-subtle underline-offset-4
                           transition-colors hover:decoration-border-brand focus-visible:outline-none
                           focus-visible:ring-4 focus-visible:ring-ring-brand"
              >
                Agents → Overview
              </button>
              .
            </p>
          </Reveal>
        </Wrap>
      </div>

      {/* ── Catálogo ─────────────────────────────────────────────────────── */}
      <div ref={catalogoRef} className="scroll-mt-[24px] pt-[112px]">
        <Wrap>
          <Reveal>
            <SectionHead eyebrow="Catálogo" title="Tudo que existe," em="numa busca só.">
              Cada item abre a página de documentação com exemplos, props e código. A
              lista é derivada da navegação — não há segunda cópia pra sair de sincronia.
            </SectionHead>
          </Reveal>

          <Reveal i={1} className="mt-[44px]">
            <Catalogo />
          </Reveal>
        </Wrap>
      </div>

      {/* ── Fechamento ───────────────────────────────────────────────────── */}
      <div className="pt-[112px]">
        <Wrap>
          <Reveal>
            <div className="lp-beam relative overflow-hidden rounded-radius-xl border border-border-subtle bg-bg-surface px-pad-3xl py-[56px] text-center shadow-sh-md">
              <div className="lp-aura" aria-hidden />
              {/* `relative` no CONTEÚDO, não só no primeiro filho: a aura é
                  `position:absolute`, e elemento posicionado pinta acima de irmão
                  estático — sem este wrapper o título e os botões ficam ATRÁS dela. */}
              <div className="relative">
              <span className="inline-flex items-center gap-gp-sm font-mono text-caption-xs uppercase tracking-[0.12em] text-fg-brand">
                <Sparkles className="size-icon-xs" aria-hidden />
                Próximo passo
              </span>
              <h2 className="mx-auto mt-gp-lg max-w-[22ch] text-heading-lg font-semibold tracking-[-0.03em] text-fg-default">
                Pronto pra montar <em className="lp-grad not-italic">a próxima tela?</em>
              </h2>
              <p className="mx-auto mt-gp-lg max-w-[52ch] text-body-lg leading-relaxed text-fg-muted">
                Comece pelos KPIs e gráficos de um dashboard real, ou vá direto pro
                DataTable — o componente que a maior parte das telas daqui usa.
              </p>
              <div className="mt-[28px] flex flex-wrap items-center justify-center gap-gp-md">
                <Button size="lg" onClick={() => onNavigate("dashboard-showcase")} iconRight={<Layers />}>
                  Ver dashboard
                </Button>
                <Button
                  color="secondary"
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate("data-table")}
                  iconRight={<Blocks />}
                >
                  Ver DataTable
                </Button>
              </div>
              </div>
            </div>
          </Reveal>

          <Reveal i={1} className="mt-[48px]">
            <div className="flex flex-wrap items-center justify-center gap-x-[22px] gap-y-gp-md border-t border-border-subtle pt-pad-3xl text-caption-md text-fg-subtle">
              <span className="inline-flex items-center gap-gp-sm font-medium text-fg-muted">
                <span aria-hidden className="size-[14px] rounded-radius-sm bg-bg-brand" />
                iGreen Design System
              </span>
              <a
                href="https://www.npmjs.com/package/@snksergio/design-system"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg-default"
              >
                npm
              </a>
              <a
                href="https://github.com/igreenlab/igreen-desingsystem-admin"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-fg-default"
              >
                GitHub
              </a>
              <button
                type="button"
                onClick={() => onNavigate("updates")}
                className="transition-colors hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
              >
                Changelog
              </button>
              <span>Uso interno iGreen · modelo evergreen</span>
            </div>
          </Reveal>
        </Wrap>
      </div>
    </div>
  );
}
