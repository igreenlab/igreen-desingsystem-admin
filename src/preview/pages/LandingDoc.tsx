/**
 * LandingDoc — porta de entrada do showcase (`#/inicio`, default do `App.tsx`).
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
import { PROMPTS } from "../data/install-prompts";
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
  ChartArea,
  ChartColumn,
  ChartLine,
  ChartPie,
  ChevronDown,
  Check,
  Component,
  Copy,
  ExternalLink,
  FlaskConical,
  LayoutDashboard,
  LoaderCircle,
  List as ListIcon,
  MessageSquare,
  Map as MapIcon,
  MonitorPlay,
  MoreHorizontal,
  Moon,
  Package,
  Palette,
  Plus,
  Radar,
  Receipt,
  Rocket,
  Search,
  SlidersHorizontal,
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
import { Button, buttonVariants } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Kpi, KpiDelta, KpiGroup } from "../../components/ui/Kpi";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../components/ui/Chart";
import { chipCount } from "../../components/ui/Chip";
import { FormFieldInput } from "../../components/ui/FormField";
import { Switch } from "../../components/shadcn/switch";
import { Input } from "../../components/shadcn/input";
import { Badge } from "../../components/shadcn/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/shadcn/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  useColumnWidths,
} from "../../components/ui/Table";
import { SidebarBrandIcon } from "../../components/ui/MenuSidebar";
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
import { COMPONENT_ICON_BY_HREF } from "./ComponentsOverviewDoc";
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
const CATALOGO_COMPLETO = getCatalog(["inicio"]);

/**
 * Seções do nav que são **componente**. O catálogo da landing lista só elas.
 *
 * Lista de INCLUSÃO, não de exclusão, e é uma escolha: com exclusão, uma seção nova de
 * pipeline/doc entraria no catálogo de componentes sem ninguém notar. Com inclusão, o
 * pior caso é uma seção nova de componente ficar de fora — e aí a contagem ao lado da
 * busca cai visivelmente, que é um sinal.
 *
 * Ficam fora: Get Started, Agents, Pipeline Infra (doc/processo), Foundations (tokens)
 * e Examples/Demos (telas montadas, não peças). Todas seguem alcançáveis pelo nav.
 */
const SECOES_COMPONENTE = [
  "Components",
  "Charts",
  "Data Table Components",
  "List Components",
  "Templates",
];

/**
 * URL do demo, derivada do nav — nao escrita a mao. Se o demo mudar de caminho, o CTA
 * do fim da pagina acompanha. Fallback so pra o caso de a entrada sair do nav.
 */
const URL_DEMO =
  CATALOGO_COMPLETO.find((i) => i.href === "demo-virtual-proposta")?.url ?? "/demo/";

/**
 * Rota do 2º CTA: o EXEMPLO de CRUD (uma tela real com DataTable), não a doc do
 * componente. Quem chega no fim da landing quer ver funcionando, não ler a tabela de
 * props — e a doc já está a um clique no catálogo logo acima.
 *
 * Derivada do nav pelo mesmo motivo da `URL_DEMO`: se a rota do exemplo mudar, o CTA
 * acompanha. O fallback é o `href` que a entrada tem hoje.
 */
const ROTA_EXEMPLO_CRUD =
  CATALOGO_COMPLETO.find((i) => i.href === "clientes-showcase")?.href ?? "clientes-showcase";

const CATALOGO = CATALOGO_COMPLETO.filter((i) => SECOES_COMPONENTE.includes(i.section));
const SECOES = getCatalogSections(["inicio"]).filter((s) => SECOES_COMPONENTE.includes(s));

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
 *
 * ## Monitor alto: a janela nasce DE PÉ, e isso não é exceção — é a regra
 *
 * O gesto só significa algo se houver algo a revelar. Num monitor alto (medido: 1249px de
 * viewport útil) a janela do hero cabe INTEIRA na tela sem rolar um pixel — então ela
 * chegava tombada e ficava tombada, porque o `--lp-p` nunca saía de 0. O efeito virava
 * uma distorção permanente da peça mais importante da página.
 *
 * A decisão é por MEDIÇÃO, não por media query de largura: um monitor 2560×720
 * (ultrawide baixo) precisa do gesto, e um 1440×1440 não — o que decide é a ALTURA
 * disponível contra a altura da peça, e nenhum breakpoint de largura sabe isso.
 *
 * Reavaliado no `resize` junto com o resto: quem arrasta a janela do browser pra metade
 * da tela passa a precisar do gesto, e quem maximiza deixa de precisar.
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

      const y = scroller instanceof Window ? window.scrollY : scroller.scrollTop;
      const alturaVisivel =
        scroller instanceof Window ? window.innerHeight : scroller.clientHeight;

      // Base da janela a partir do TOPO DA PÁGINA (não da viewport: rect é relativo a
      // ela, daí somar o scroll atual).
      //
      // ⚠️ Topo E altura saem do rect do PAI, nunca deste elemento: ele está transformado
      // e `getBoundingClientRect` devolve a caixa TRANSFORMADA — a medida dependeria da
      // inclinação que ela mesma decide, um laço. O rect do pai não inclui o transform do
      // filho, então é seguro.
      //
      // A altura vem do rect (não de `offsetHeight`) porque o pai agora carrega a
      // COMPRESSÃO da hero: num notebook ele está em `scale(0.88)`, e o `offsetHeight` —
      // que é layout puro — devolveria a altura CHEIA. Misturar posição comprimida com
      // altura cheia superestimava a base e fazia a janela se declarar "não cabe" mesmo
      // quando cabia.
      const caixa = (alvo.parentElement ?? alvo).getBoundingClientRect();
      const baseAbsoluta = caixa.top + y + caixa.height;
      if (baseAbsoluta <= alturaVisivel) {
        // Cabe inteira sem rolar → não há nada a revelar. De pé, e ponto.
        alvo.style.setProperty("--lp-p", "1");
        return;
      }

      // Progresso pelo scroll ABSOLUTO do topo da página, não pela posição da janela
      // na viewport. Foi o que a medição do projectise mostrou: lá a janela está bem
      // dentro da viewport no scroll 0 e AINDA assim aparece deitada — ou seja, o
      // driver é "quanto a página desceu", não "quanto a peça subiu". Com o driver
      // por posição, esta janela (que fica ~700px abaixo do topo) já nascia 99,8%
      // de pé e a animação era invisível.
      //
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

    // ⚠️ `ResizeObserver` além de `scroll`/`resize`, e não é redundância: a decisão
    // "cabe inteira?" depende do LAYOUT, e no mount o layout ainda não está assentado —
    // a fonte Geist e o PNG do mockup ainda vão chegar. Medido: sem isto a página abria
    // num monitor alto decidindo "não cabe" (tombada) e NUNCA reavaliava, porque sem
    // rolar nem redimensionar não há evento nenhum. Observa a peça e o container: a
    // primeira pega o assentamento, o segundo pega o container mudando de tamanho sem a
    // window mudar (sidebar colapsando, por exemplo).
    const ro = new ResizeObserver(agendar);
    ro.observe(el);
    if (scroller instanceof HTMLElement) ro.observe(scroller);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      ro.disconnect();
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
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const medir = () => {
      const l = el.clientWidth;
      if (l > 0) setLargura(l);
    };

    medir();
    // Sem ResizeObserver (jsdom) fica na largura medida no mount — degrada, não quebra.
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // O PISO é o que salva o mobile. Sem ele, num viewport de 390px a escala caía
  // pra 0,33 e o dashboard virava uma miniatura ilegível — pior que não mostrar.
  // Com piso, a janela CORTA a lateral (o app segue em tamanho legível e continua
  // além da moldura), que é exatamente o tratamento das referências.
  const escala =
    largura > 0 ? Math.max(escalaMinima, Math.min(1, largura / larguraDesign)) : 1;

  // ⚠️ `largura` sai junto de propósito: quem chama decide o `larguraDesign` A PARTIR
  // dela (no mobile o mock larga o menu, então o design encolhe). Isso NÃO é laço — a
  // largura medida é a da janela no layout, e não depende do `larguraDesign`.
  return { ref, escala, largura };
}

/**
 * Spotlight do bento: escreve a posição do cursor em CSS vars.
 *
 * Mora aqui e não em `src/hooks/`: aquela pasta é API do DS (o `useBrand`/`useTheme`
 * são exportados pro consumidor). Isto é atmosfera de uma página do showcase, então
 * fica junto das outras primitivas locais (`useInView`, `useUnfold`, `useFitScale`,
 * `useTemFolga`).
 *
 * ⚠️ Escreve direto no nó, nunca por `useState` — seria um re-render por pixel de
 * movimento do mouse, com a grade inteira (8 cards, 3 charts) remontando.
 */
function useSpotlight<T extends HTMLElement = HTMLDivElement>() {
  const gridRef = useRef<T | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    const glow = glowRef.current;
    if (!grid || !glow) return;
    // Sem cursor não há efeito — e sai antes de registrar listener nenhum.
    if (window.matchMedia?.("(hover: none)").matches) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>("[data-spotlight-card]"));
    let frame = 0;

    const aoMover = (e: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;

        // ⚠️ Relativo à CAMADA, não à grade. O `inset: -120px` do `.bento-spotlight__glow`
        // move a origem dela: medir o rect da grade desloca a luz em exatamente 120px
        // nos dois eixos, e o sintoma é a luz "adiantada na diagonal".
        const g = glow.getBoundingClientRect();
        glow.style.setProperty("--gx", `${e.clientX - g.left}px`);
        glow.style.setProperty("--gy", `${e.clientY - g.top}px`);

        // A borda acesa é POR CARD (cada um tem sua origem), mesmo a luz sendo uma só.
        for (const card of cards) {
          const r = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - r.left}px`);
          card.style.setProperty("--my", `${e.clientY - r.top}px`);
        }
      });
    };

    const acender = () => grid.style.setProperty("--lp-on", "1");
    const apagar = () => grid.style.setProperty("--lp-on", "0");

    grid.addEventListener("pointermove", aoMover);
    grid.addEventListener("pointerenter", acender);
    grid.addEventListener("pointerleave", apagar);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      grid.removeEventListener("pointermove", aoMover);
      grid.removeEventListener("pointerenter", acender);
      grid.removeEventListener("pointerleave", apagar);
    };
  }, []);

  return { gridRef, glowRef };
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

/**
 * Botão de copiar com confirmação no rótulo E no movimento.
 *
 * A troca pra "Copiado" (cor + ícone + texto) já existia, e é estática: acontece no lugar
 * onde o olho já não está, porque quem clica está olhando o cursor. O pulso do wrapper
 * (`.lp-copy`, ver `landing.css`) puxa a atenção de volta por meio segundo.
 *
 * O efeito mora no WRAPPER, não no `<Button>`: o componente do DS tem `box-shadow` e
 * `border-radius` próprios por variante, e animar isso nele significaria sobrescrever a
 * sombra da variante durante a animação. Assim o botão fica intocado.
 */
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
  // Contador de cliques, só pra reiniciar a animação. Clicar de novo DENTRO da janela de
  // 1.8s não reanimaria nada por conta própria: a classe `is-copied` já está aplicada, e
  // animação CSS não reinicia porque a classe "continua lá".
  const [pulso, setPulso] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  const copiar = useCallback(() => {
    // Clipboard exige contexto seguro; sem ele o botão não pode mentir "Copiado".
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setPulso((n) => n + 1);
    });
  }, [texto]);

  // Reinício IMPERATIVO, não `key={pulso}` no wrapper. Remontar resolveria a animação e
  // custaria o foco: quem acionou por teclado (Enter/Espaço) ficaria com o foco no body,
  // e o próximo Tab recomeçaria do topo da página. `subtree: true` alcança o `::after` do
  // anel, que é onde metade do efeito mora.
  useEffect(() => {
    if (!pulso) return;
    for (const a of ref.current?.getAnimations({ subtree: true }) ?? []) {
      // Só `@keyframes`. Medido: `getAnimations` devolve também as 9 TRANSIÇÕES do
      // `<Button>` (cor, borda, ring…), que são do DS e estão justamente rodando neste
      // instante — cancelá-las seria mexer no que não é meu.
      if (!(a instanceof CSSAnimation)) continue;
      a.cancel();
      a.play();
    }
  }, [pulso]);

  useEffect(() => {
    if (!copiado) return;
    const t = setTimeout(() => setCopiado(false), 1800);
    return () => clearTimeout(t);
  }, [copiado]);

  return (
    <span ref={ref} className={cn("lp-copy", copiado && "is-copied")}>
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
    </span>
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
        // `rounded-radius-md`, não `-full`: pílula 100% dentro de um container de
        // raio `lg` briga com o desenho do resto dos controles.
        "inline-flex min-h-form-md items-center gap-gp-sm rounded-radius-md px-pad-xl",
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
            // fg-on-brand = branco no light, PRETO no dark. Branco fixo aqui
            // dava ~1,4:1 sobre o verde claro do dark; o token acerta os dois modos.
            ativo ? "bg-fg-on-brand ring-fg-on-brand/30" : "ring-border-default",
          )}
          // Ativo não usa o swatch do catálogo: ver a nota acima.
          style={ativo ? undefined : { background: swatch }}
        />
      )}
      {children}
    </button>
  );
}

/**
 * Rampa de 3 cores por marca, lida do OVERLAY REAL em runtime.
 *
 * A alternativa era manter uma lista de 3 cores por marca aqui — a mesma classe de
 * lista paralela que o catálogo derivado desta página existe pra não ter (o `swatch`
 * do `BRANDS` já é um valor fixo e foi justamente ele que mostrou um verde diferente
 * do que a página usava no dark).
 *
 * Como funciona: cada overlay é escopado em `[data-theme="<id>"]:not(.dark)` (light) e
 * `.dark[data-theme="<id>"]` (dark) — ou seja, casa em QUALQUER elemento, não só no
 * `<html>`. Então uma sonda `display:none` com esses atributos resolve
 * `--color-bg-brand` da marca pedida, no modo atual. Medido nas 5 marcas.
 *
 * ⚠️ A sonda precisa replicar os DOIS eixos: sem a classe `dark` nela, o seletor
 * `:not(.dark)` casa e devolve o valor do LIGHT mesmo com a página no dark (é a
 * exclusão mútua da L-066 vista do outro lado).
 *
 * Os 3 tons saem do mesmo valor: escuro · base · claro. Só `bg-brand` e `chart-1`
 * variam entre as 5 marcas (medido) — usar chart-2/4 daria 2 quadrinhos idênticos em
 * 4 das 5 marcas. Rampa da própria marca sempre diferencia.
 */
function useRampasDeMarca(isDark: boolean) {
  const [rampas, setRampas] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (typeof document === "undefined") return;
    const proximo: Record<string, string[]> = {};

    for (const b of BRANDS) {
      const sonda = document.createElement("div");
      if (b.id !== "default") sonda.setAttribute("data-theme", b.id);
      if (isDark) sonda.classList.add("dark");
      sonda.style.display = "none";
      document.body.appendChild(sonda);

      const cor =
        getComputedStyle(sonda).getPropertyValue("--color-bg-brand").trim() || b.swatch;
      sonda.remove();

      proximo[b.id] = [
        `color-mix(in srgb, ${cor} 74%, black)`,
        cor,
        `color-mix(in srgb, ${cor} 58%, white)`,
      ];
    }

    setRampas(proximo);
  }, [isDark]);

  return rampas;
}

/** Os 3 quadrinhos que representam a marca. */
function Swatches({ cores }: { cores?: string[] }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center gap-[3px]">
      {(cores ?? ["transparent", "transparent", "transparent"]).map((c, i) => (
        <span
          key={i}
          className="size-[11px] rounded-[3px] ring-1 ring-inset ring-fg-default/10"
          style={{ background: c }}
        />
      ))}
    </span>
  );
}

/**
 * Seletor de marca (dropdown) + modo (segmentado).
 *
 * Era uma pílula com as 5 marcas em chips lado a lado. Virou dropdown por pedido do
 * mantenedor: 5 chips ocupam largura demais pra um controle secundário, e o nome da
 * marca ativa fica mais legível como rótulo do gatilho do que como chip selecionado.
 */
function ThemeSwitcher() {
  const { brand, setBrand } = useBrand();
  const { isDark, setTheme } = useTheme();
  const rampas = useRampasDeMarca(isDark);
  const atual = BRANDS.find((b) => b.id === brand) ?? BRANDS[0];

  return (
    <div className="flex flex-wrap items-center justify-center gap-gp-md">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            color="secondary"
            variant="outline"
            size="md"
            iconRight={<ChevronDown />}
            aria-label={`Marca: ${atual.label}`}
          >
            <Swatches cores={rampas[atual.id]} />
            <span className="text-body-md">
              <span className="text-fg-muted">Theme:</span> {atual.label}
            </span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" className="min-w-[232px]">
          <DropdownMenuLabel>Tema de marca</DropdownMenuLabel>
          {BRANDS.map((b) => (
            <DropdownMenuItem
              key={b.id}
              onSelect={() => setBrand(b.id)}
              className="gap-gp-md"
            >
              <Swatches cores={rampas[b.id]} />
              <span className="min-w-0 flex-1 truncate">{b.label}</span>
              {brand === b.id && (
                <Check className="size-icon-xs shrink-0 text-fg-brand" aria-hidden />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modo fica segmentado: são 2 estados, e dropdown pra binário é passo a mais.
          Altura casada com o gatilho (`min-h-form-lg`) pra os dois lerem como um par. */}
      <div
        role="group"
        aria-label="Modo"
        // Raio, borda e superfície iguais aos do botão de tema (`Button outline`), pra
        // os dois lerem como um par. Era `bg-bg-subtle` com pílula 100%.
        className="flex min-h-form-lg items-center gap-gp-2xs rounded-radius-lg border border-border-default bg-bg-surface p-pad-2xs"
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

/**
 * Mix da carteira — a cor vive na LINHA, não num array paralelo.
 *
 * Antes as cores vinham de `DONUT_MIX[i]`, que tem 4 entradas contra 6 daqui: as
 * duas últimas linhas recebiam `undefined` e renderizavam sem cor nenhuma.
 */
const MIX = [
  { nome: "Solar", pct: 62, cor: "var(--color-chart-1)" },
  { nome: "Telecom", pct: 21, cor: "var(--color-chart-2)" },
  { nome: "Seguros", pct: 11, cor: "var(--color-chart-3)" },
  { nome: "Placas", pct: 7, cor: "var(--color-chart-4)" },
  { nome: "Green", pct: 4, cor: "var(--color-chart-5)" },
  { nome: "Outros", pct: 2, cor: "var(--color-bg-muted)" },
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
          // Logo REAL da iGreen, a mesma do sidebar do showcase e do rail do AppShell —
          // era um ícone genérico de raio. `size` é a largura; 16 numa caixa de 36px
          // (`size-comp-lg`) mantém os ~45% do rail, então a marca lê igual, só menor.
          <span
            aria-hidden
            className="grid size-comp-lg place-items-center rounded-radius-base bg-bg-brand text-fg-on-brand"
          >
            <SidebarBrandIcon size={16} />
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
/** Série da pizza, derivada do MIX — uma fonte só de nome, valor e cor. */
const DONUT_MIX = MIX.map((m) => ({ k: m.nome, v: m.pct, fill: m.cor }));

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
              // Idem: tom opaco pra não deixar nada aparecer atrás.
              i === serie.length - 1 ? "bg-bg-brand" : "bg-border-default",
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
                content={<ChartTooltipContent className="min-w-[172px]" />}
              />
              {/* Barras APAGADAS, uma na cor da marca — o mês corrente. Barra toda
                  colorida não diz nada; com uma destacada, a leitura é imediata. */}
              {/* `fill` aqui NÃO pinta a barra (o `<Cell>` abaixo vence) — ele
                  alimenta `item.color` do tooltip, que é de onde vem o dot colorido
                  ao lado do valor. Sem isso o tooltip aparece sem a cor da série. */}
              <Bar
                dataKey="kwh"
                fill="var(--color-chart-1)"
                radius={[4, 4, 0, 0]}
                activeBar={{ fill: "var(--color-chart-1)" }}
              >
                {ENERGIA.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === MES_DESTAQUE
                        ? "var(--color-chart-1)"
                        : // Cinza neutro OPACO — e `border-default` é o único que serve.
                          //
                          // Medido no dark: `bg-subtle` = oklch(1 0 0 / .01) e
                          // `bg-muted` = oklch(1 0 0 / .03) são TRANSLÚCIDOS (a grade
                          // tracejada voltaria a aparecer através da barra);
                          // `bg-surface` é a própria cor do card (barra invisível) e
                          // `bg-canvas` é mais escuro que ele. `border-default`
                          // (oklch(0.2645 0 0)) é opaco, acromático e um degrau ACIMA
                          // da superfície — exatamente o contraste que "inativo" pede,
                          // e no light vira um cinza claro pelo mesmo motivo.
                          //
                          // Token de borda usado como fill é incomum, mas é o neutro
                          // opaco que o DS tem; qualquer `color-mix` de verde com a
                          // superfície puxa pro quente (ver a nota de ferrugem).
                          "color-mix(in srgb, var(--color-fg-default) 30%, var(--color-bg-surface))"
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
                  style={{ background: m.cor }}
                />
                <span className="w-[76px] shrink-0 truncate text-body-sm text-fg-muted">{m.nome}</span>
                <span className="h-[6px] min-w-0 flex-1 overflow-hidden rounded-radius-full bg-bg-muted">
                  <span
                    className="block h-full rounded-radius-full"
                    style={{ width: `${m.pct}%`, background: m.cor }}
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
              hideDivider
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
/**
 * Comprime o GRUPO da hero (janela + flutuantes) pra caber na coluna de conteúdo.
 *
 * ## O que isto substituiu, e por que o mecanismo antigo estava errado
 *
 * Antes era um booleano (`useTemFolga`): se a folga de cada lado batia 96px, os
 * flutuantes entravam em tamanho cheio; senão **desapareciam**. Medido nos notebooks que
 * o mantenedor usa:
 *
 * | viewport | coluna de conteúdo | folga/lado | flutuantes |
 * |---|---|---|---|
 * | 1919 | 1368 | 224 | ✅ 4 |
 * | 1366 | 1091 | **86** | ❌ 0 |
 * | 1280 | 1005 | **43** | ❌ 0 |
 *
 * Ou seja: a hero perdia metade da composição justamente na resolução mais comum, e o
 * "tudo ou nada" era a causa. Um booleano não tem meio-termo — mas o layout tem.
 *
 * Agora a pergunta deixa de ser "cabe inteiro?" e passa a ser "**por quanto** não cabe?".
 * O grupo inteiro é escalado por esse fator, o que resolve os três pedidos com UM
 * mecanismo: os flutuantes voltam, o dashboard fica menor, e o conjunto segue centrado.
 *
 * ## A compensação de layout não é detalhe
 *
 * `transform` não muda a caixa de layout: escalar pra 0.88 deixaria ~70px de espaço morto
 * embaixo, empurrando a seção seguinte. Daí a `margem` negativa devolvida junto — medida
 * do `offsetHeight` real, não estimada.
 *
 * ## Piso
 *
 * Abaixo de `PISO_GRUPO` os flutuantes saem de vez: um card a 60% é ilegível, e aí
 * ausente é melhor que miniatura. Só que isso agora acontece em tablet/mobile, não em
 * notebook.
 */
function useCompressaoHero<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [estado, setEstado] = useState({ escala: 1, margem: 0, mostrarFloats: true });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ⚠️ Contra o `Wrap`, não contra `parentElement`: o pai imediato é o próprio wrapper
    // que ancora os flutuantes. A coluna que importa é a de conteúdo.
    const wrap = el.closest<HTMLElement>("[data-lp-wrap]");
    if (!wrap) return;

    const medir = () => {
      const disponivel = wrap.clientWidth;
      if (disponivel <= 0) return;
      const bruta = Math.min(1, disponivel / LARGURA_GRUPO_HERO);
      const mostrarFloats = bruta >= PISO_GRUPO_HERO;
      // ⚠️ Comprimir só faz sentido ENQUANTO há flutuante pra caber. Sem eles nada
      // transborda: a janela é `max-w-[920px]` e encolhe sozinha.
      //
      // A 1ª versão aplicava o piso sempre — `max(PISO, bruta)` — e no mobile isso
      // comprimia o grupo a 0.72 sem motivo: medido num viewport de 390px, a janela caía
      // de 356 pra **256px**, deixando o mockup menor justamente onde ele já era o mais
      // apertado. O piso é o ponto em que os cards SAEM, não um mínimo de escala.
      const escala = mostrarFloats ? bruta : 1;
      setEstado({
        escala,
        // `offsetHeight` é layout puro: não inclui o transform deste próprio elemento,
        // então medir aqui não vira laço.
        margem: escala < 1 ? -Math.round((1 - escala) * el.offsetHeight) : 0,
        mostrarFloats,
      });
    };

    medir();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(wrap);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, ...estado };
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
        "lp-bob lp-tint lp-glass absolute z-20 w-[184px] rounded-radius-xl border",
        // `shadow-sh-xl` + ring interno: sem a sombra funda o card de vidro "cola"
        // no dashboard atrás e a profundidade desaparece.
        "p-pad-lg shadow-sh-xl ring-1 ring-inset ring-fg-default/5",
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

/** Largura do menu dentro do mockup (o `w-[280px]` do `MockSidebar`). */
const LARGURA_MOCK_SIDEBAR = 280;

/**
 * Largura que o GRUPO da hero precisa pra caber sem cortar flutuante.
 *
 * `920` (janela) + `96` (maior transbordo à esquerda) + `104` (à direita) + `24` de
 * respiro. Os dois transbordos são os offsets negativos reais dos `FloatCard`; se algum
 * mudar, este número muda com ele.
 */
const LARGURA_GRUPO_HERO = 920 + 96 + 104 + 24;

/** Abaixo disto o flutuante fica ilegível e sai de cena. Cai em tablet, não em notebook. */
const PISO_GRUPO_HERO = 0.72;

/**
 * Largura de janela abaixo da qual o mockup NÃO mostra o menu.
 *
 * Medido num iPhone de 390px: a janela dava 356px, o menu do mock ocupava **147px (41%)**
 * e o dashboard ficava com 198px — cortado, e o que se via da "tela de app" era
 * majoritariamente menu. Sem o menu, o design encolhe pra
 * `LARGURA_APP - LARGURA_MOCK_SIDEBAR`, o que ainda POR CIMA sobe a escala: o dashboard
 * aparece maior e inteiro.
 *
 * O limite é a largura da JANELA (não do viewport) porque é ela que define o recorte —
 * o viewport passa pelo sidebar do showcase, que existe em desktop e não em mobile.
 *
 * ⚠️ **560, não 700.** Com 700 o limite decidia na casa do pixel: medido num viewport de
 * 1024px (tablet), a janela dava **702px** e o menu saía por 2px de diferença. Comportamento
 * que vira do avesso com qualquer mudança de 1px no padding é frágil e imprevisível.
 * 560 fica longe dos dois casos reais — telefone mede ~340, tablet ~702 — então a decisão
 * é estável. No tablet o menu ocupa ~22% da janela, que ainda lê como "tela de app".
 */
const LARGURA_SEM_MOCK_SIDEBAR = 560;

function HeroWindow() {
  const unfoldRef = useUnfold<HTMLDivElement>(360);
  const { ref: grupoRef, escala: escalaGrupo, margem, mostrarFloats } =
    useCompressaoHero<HTMLDivElement>();

  // 1ª medição usa `LARGURA_APP`; se a janela for estreita, `semMenu` vira true e o
  // design encolhe no render seguinte. Converge de uma vez — `largura` é do layout da
  // janela e não depende do design.
  const { ref: fitRef, escala, largura } = useFitScale<HTMLDivElement>(LARGURA_APP, 0.52);
  const semMenu = largura > 0 && largura < LARGURA_SEM_MOCK_SIDEBAR;
  const larguraDesign = semMenu ? LARGURA_APP - LARGURA_MOCK_SIDEBAR : LARGURA_APP;
  const escalaApp =
    largura > 0 ? Math.max(0.52, Math.min(1, largura / larguraDesign)) : escala;

  return (
    <div className="relative">
      <div className="lp-aura" aria-hidden />

      {/* ⚠️ Este wrapper de 920px é o que ANCORA os flutuantes.
          Na 1ª tentativa eles eram posicionados contra o `Wrap` (largura do conteúdo)
          e ficavam FORA dele — e o `<main>` do App, sendo container de scroll, clipa
          no eixo X: os cards apareciam cortados ao meio. Ancorados na janela, um
          offset de -76px cai dentro da margem lateral e some nada. */}
      {/* `transform-origin: top center` mantém o grupo CENTRADO ao comprimir, e a margem
          negativa devolve o espaço morto que o `scale` deixaria embaixo (transform não
          encolhe caixa de layout). Sem `style` quando não há compressão: transform
          desnecessário cria containing block e camada de composição de graça. */}
      <div
        ref={grupoRef}
        className="relative mx-auto max-w-[920px]"
        style={
          escalaGrupo < 1
            ? {
                transform: `scale(${escalaGrupo})`,
                transformOrigin: "top center",
                marginBottom: margem,
              }
            : undefined
        }
      >
        {/* Bezel: outer radius 20 + padding 8 + inner radius 14 — proporção medida no
            projectise. A máscara de fade vem do `.lp-window`. */}
        <div
          ref={unfoldRef}
          className="lp-unfold lp-window lp-beam lp-beam-slow relative z-10
                     lp-glass outline-float rounded-[20px] p-[8px] shadow-sh-lg"
        >
          <div className="overflow-hidden rounded-[14px] border border-border-default bg-bg-canvas">
            <BrowserBar />
            <div ref={fitRef} className="overflow-hidden" style={{ height: ALTURA_JANELA }}>
              {/* Largura E altura de design fixas + `scale`: os componentes veem um
                  monitor de verdade e mantêm a proporção real — só menores.

                  `larguraDesign` encolhe quando o menu sai (mobile): é o que faz o
                  dashboard aparecer MAIOR justamente onde há menos espaço. */}
              <div
                className="flex origin-top-left"
                style={{
                  width: larguraDesign,
                  height: ALTURA_APP,
                  transform: `scale(${escalaApp})`,
                }}
              >
                {/* No mobile o menu sai. Ele não é o assunto do mockup — o dashboard é — e
                    com a janela estreita ele virava 41% do que se via, cortado no meio. */}
                {!semMenu && <MockSidebar />}
                <MockDashboard />
              </div>
            </div>
          </div>
        </div>

      {/* Flutuantes — emolduram a janela, como nas 5 referências. Agora eles ACOMPANHAM a
          compressão do grupo em vez de desaparecer; só saem sob o piso (tablet/mobile),
          onde um card a 60% seria ilegível. */}
      {mostrarFloats && (
      <>
      {/* 1. Consumo — anel de progresso + valor. O anel dá leitura de "quanto da
             franquia" num relance, o que a barra chapada não dava; e é `conic-gradient`,
             então acompanha a marca sem JS. */}
      <FloatCard i={0} className="-left-[96px] top-[118px] w-[196px]">
        <div className="flex items-center gap-gp-sm">
          <span
            aria-hidden
            // 24px (`comp-xs`) na escala 20/24/28/32/36/40. É o degrau que fica
            // proporcional ao label `caption-md` ao lado — em 32px a caixa pesava
            // mais que o próprio texto que ela acompanha.
            className="grid size-comp-xs shrink-0 place-items-center rounded-radius-sm bg-bg-brand-subtle text-fg-brand"
          >
            <Zap className="size-icon-xs" />
          </span>
          <p className="m-0 min-w-0 flex-1 truncate text-caption-md font-medium text-fg-muted">
            Consumo do mês
          </p>
        </div>

        <div className="mt-gp-lg flex items-center gap-gp-lg">
          <span
            aria-hidden
            className="relative grid size-[54px] shrink-0 place-items-center rounded-radius-full"
            style={{
              background:
                "conic-gradient(var(--color-bg-brand) 0 72%, color-mix(in srgb, var(--color-bg-brand) 18%, var(--color-bg-surface)) 72% 100%)",
            }}
          >
            <span className="grid size-[40px] place-items-center rounded-radius-full bg-bg-surface text-caption-sm font-bold tabular-nums text-fg-default">
              72%
            </span>
          </span>
          <span className="min-w-0">
            <span className="block text-stat-sm leading-none tabular-nums text-fg-default">
              1.284
            </span>
            <span className="mt-gp-xs block text-caption-sm text-fg-subtle">kWh injetados</span>
          </span>
        </div>

        <p className="mt-gp-md border-t border-border-subtle pt-pad-md text-caption-sm text-fg-muted">
          Franquia de <span className="tabular-nums text-fg-default">1.780</span> kWh
        </p>
      </FloatCard>

      {/* 2. Receita — gráfico SANGRANDO até a borda do card. Chart com padding em
             volta parece recorte; encostado na borda parece peça acabada. Daí os
             negativos que cancelam o padding do FloatCard. */}
      <FloatCard i={1} className="-right-[104px] -top-[86px] w-[228px] overflow-hidden">
        <div className="flex items-start justify-between gap-gp-sm">
          <p className="m-0 text-caption-md font-medium text-fg-muted">Receita recorrente</p>
          <Chip color="success" variant="soft" size="sm">
            +6,1%
          </Chip>
        </div>
        <p className="mt-gp-sm text-stat-sm leading-none tabular-nums text-fg-default">
          R$ 89,4k
        </p>
        <p className="mt-gp-xs text-caption-sm text-fg-subtle">
          MRR · <span className="tabular-nums">431</span> contratos
        </p>
        <div className="-mx-pad-lg -mb-pad-lg mt-gp-md h-[56px]">
          <ChartContainer config={SPARK_CFG} className="h-[56px] w-full">
            <AreaChart data={SPARK_B} margin={{ top: 2, bottom: 0, left: 0, right: 0 }}>
              <Area
                dataKey="v"
                type="natural"
                stroke="var(--color-chart-1)"
                fill="var(--color-chart-1)"
                fillOpacity={0.22}
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
      <FloatCard i={3} className="-right-[74px] bottom-[18px] w-[304px] overflow-hidden p-0">
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
      // `bg-bg-surface` FICA na lista: o `.bento-spotlight__card` (regra não-layerizada)
      // sobrepõe o background com o translúcido, e a classe segue como fallback caso o
      // CSS da página não carregue. `data-spotlight-card` é o que o hook consulta.
      data-spotlight-card
      className={cn(
        "bento-spotlight__card lp-tint group flex flex-col rounded-radius-xl",
        "border border-border-subtle bg-bg-surface",
        // Sem `hover:border-border-brand-subtle`: aquela borda verde acendia o card
        // INTEIRO no hover e anulava o spotlight, cujo ponto é acender só o trecho de
        // borda mais próximo do cursor. Com as duas, o efeito fino ficava invisível
        // dentro do efeito grosso.
        //
        // `transition-colors` saiu junto — só existia pra animar aquela borda. O
        // crossfade de troca de marca continua vindo do `lp-tint`.
        "p-pad-3xl shadow-sh-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-gp-md">
        <div className="flex min-w-0 flex-col gap-[2px]">
          <h3 className="m-0 text-title-sm font-semibold text-fg-default">{titulo}</h3>
          <p className="m-0 text-caption-md leading-relaxed text-fg-muted">{descricao}</p>
        </div>
        {/* O `Button` do DS, não um ícone solto: borda + fundo de secondary outline.
            Como ícone puro ele lia como decoração e não como alvo clicável. */}
        <Button
          color="secondary"
          variant="outline"
          size="icon-2xs"
          onClick={() => onNavigate(href)}
          aria-label={`Abrir documentação de ${titulo}`}
          className="shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
        >
          <ArrowUpRight aria-hidden />
        </Button>
      </div>
      <div className="mt-gp-xl flex min-w-0 flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

function Bento() {
  const linhasTabela = useMemo(
    () => [
      // Id curto de proposito: "4822 · Telecom" pedia 92px de conteudo numa celula de
      // 85px e gerava scroll horizontal DENTRO da celula. O card existe pra mostrar o
      // header e o ritmo de linha do DS, nao o dado — o hero mostra a tabela completa.
      { id: "#4821", licenciado: "Marina R.", status: "Ativo", valor: "R$ 12.400" },
      { id: "#4822", licenciado: "João C.", status: "Análise", valor: "R$ 3.190" },
      { id: "#4823", licenciado: "Ana L.", status: "Pausado", valor: "R$ 890" },
      { id: "#4824", licenciado: "Rafael S.", status: "Ativo", valor: "R$ 7.820" },
    ],
    [],
  );

  /**
   * Colunas do card DataTable — 3, não 4.
   *
   * O `Table` do DS respeita a largura declarada e rola quando não cabe. Com 4 colunas
   * (150+110+100+96 = 456px) num card de ~338px de miolo, "Valor" era cortado e
   * aparecia barra de scroll horizontal. 92+104+96 = 292 cabe com folga.
   *
   * "Licenciado" foi a que saiu: o card existe pra mostrar o HEADER e o ritmo de linha
   * do DS, e o dashboard do hero já exibe as 5 colunas numa largura de verdade.
   */
  const colunasBento = useMemo(
    () => [
      // Rotulo curto porque o header COMPETE com o icone de sort na largura: com
      // "Contrato" em 92px ele truncava pra "Cont". Valores sao `#4821`, entao "Nº" diz o
      // mesmo. (O DataTable com `autoFit` resolve isso sozinho — L-052b — mas aqui a
      // largura e declarada.)
      { field: "id", headerName: "Nº", width: 92 },
      // 104 e nao 90: o Chip "Analise" mais o padding da celula pedem 94px, e a
      // coluna estreita gerava 5px de scroll horizontal DENTRO da celula.
      { field: "status", headerName: "Status", width: 104 },
      { field: "valor", headerName: "Valor", width: 96 },
    ],
    [],
  );
  const { widths: wBento } = useColumnWidths(colunasBento);

  const { gridRef, glowRef } = useSpotlight<HTMLDivElement>();

  return (
    <div
      ref={gridRef}
      className="bento-spotlight grid grid-cols-1 gap-gp-xl md:grid-cols-2 lg:grid-cols-6"
    >
      {/* Camada de luz. É `position: absolute`, então NÃO vira célula da grade — e o
          bento não usa `:first-child`/`nth-child` nem `grid-auto-flow`, só `col-span`
          por card, então entrar como primeiro filho não desloca nada. */}
      <div ref={glowRef} className="bento-spotlight__glow" aria-hidden="true" />
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
                  style={{ background: m.cor }}
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
        {/* Subtítulo por linha: o card ficava com 4 labels de uma linha só e sobrava
            altura. O sub também é o padrão de `FormFieldSwitch` do DS — label diz o
            QUE é, sub diz a consequência. */}
        <div className="flex flex-col divide-y divide-border-subtle">
          {[
            ["Notificar por e-mail", "Resumo diário às 8h", true],
            ["Resumo semanal", "Toda segunda, com o consolidado", false],
            ["Modo compacto", "Mais linhas visíveis por tela", true],
            ["Colunas fixas", "Cliente e status sempre visíveis", false],
          ].map(([label, sub, on], i) => (
            <div
              key={String(label)}
              className="flex items-start justify-between gap-gp-md py-pad-lg"
            >
              <span className="min-w-0">
                <label
                  htmlFor={`lp-bento-sw-${i}`}
                  className="block text-body-sm font-medium text-fg-default"
                >
                  {label}
                </label>
                <span className="mt-[2px] block text-caption-sm text-fg-muted">{sub}</span>
              </span>
              <Switch id={`lp-bento-sw-${i}`} defaultChecked={Boolean(on)} className="mt-[2px]" />
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
        {/* O `Table` REAL do DS, não um grid montado à mão. O header hand-rolled não
            batia com o do DataTable (altura, tipografia, cor de fundo, sort) — e num
            card que se chama "DataTable" essa é justamente a coisa que precisa estar
            fiel. Sort ativo em "Contrato" pra o header mostrar o estado que existe. */}
        <Table density="compact" ariaLabel="Contratos (exemplo)">
          <TableHead>
            {colunasBento.map((c) => (
              <TableHeadCell
                key={c.field}
                width={wBento[c.field]}
                align={c.field === "valor" ? "right" : "left"}
                sortable={c.field === "id"}
                sortDirection={c.field === "id" ? "asc" : null}
              >
                {c.headerName}
              </TableHeadCell>
            ))}
          </TableHead>
          <TableBody>
            {linhasTabela.map((r) => (
              <TableRow key={r.id}>
                <TableCell width={wBento.id}>
                  <span className="truncate font-medium text-fg-default">{r.id}</span>
                </TableCell>
                <TableCell width={wBento.status}>
                  <Chip
                    color={STATUS_COLOR[r.status as keyof typeof STATUS_COLOR]}
                    variant="soft"
                    size="sm"
                  >
                    {r.status}
                  </Chip>
                </TableCell>
                <TableCell width={wBento.valor} align="right">
                  <span className="tabular-nums">{r.valor}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
npm create @snksergio/design-system@latest my-app
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
        titulo: "Aponte DOIS aliases",
        desc: "@ds (o que você usa) e @ (o que o DS usa internamente, em 700 imports) — os dois pra design-system/src, no tsconfig E no bundler. Sem o segundo, o build quebra no primeiro componente.",
      },
      {
        titulo: "Deps na RAIZ, nunca no submódulo",
        desc: "O submódulo entrega código-fonte, não pacote. Rodar npm install dentro dele cria uma segunda cópia de React — Invalid hook call em tudo que usa hook.",
      },
      {
        titulo: "Rode o ds:link",
        desc: "Projeta skills/commands do DS pro .claude/ do seu projeto — o Claude Code não desce até <submódulo>/.claude sozinho. Reinicie a sessão depois pra registrar os slash commands.",
      },
    ],
    codigo: `git submodule add https://github.com/igreenlab/igreen-desingsystem-admin design-system
git submodule update --init --recursive

# deps na RAIZ (nunca dentro do submódulo — React duplicado)
npm i tailwind-variants tailwind-merge clsx lucide-react

# fonte Geist: sem isso cai em system-ui, sem erro nenhum
mkdir -p public/fonts && cp design-system/public/fonts/*.woff2 public/fonts/

# o kit de IA no SEU .claude/ (reinicie o Claude Code depois)
npm --prefix design-system run ds:link

// tsconfig.json — paths RELATIVOS e sem baseUrl (removido no TS 7)
{ "compilerOptions": { "paths": {
  "@ds/*": ["./design-system/src/*"],
  "@/*":   ["./design-system/src/*"]
} } }`,
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
    codigo: `npm install @snksergio/design-system@latest

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
        {/* Timeline: o conector é um `::before` no `<li>`, não um elemento próprio —
            `last:before:hidden` corta a linha no último passo sem precisar de índice.
            O `pb` maior é o que dá o espaçamento pedido E o comprimento da linha. */}
        <ol className="m-0 flex list-none flex-col p-0">
          {canal.passos.map((p, i) => (
            <li
              key={p.titulo}
              className="relative flex gap-gp-xl pb-pad-5xl last:pb-0
                         before:absolute before:left-[15px] before:top-[30px] before:bottom-[6px]
                         before:w-px before:bg-border-subtle before:content-['']
                         last:before:hidden"
            >
              <span
                aria-hidden
                className="relative z-10 mt-[2px] grid size-form-sm shrink-0 place-items-center
                           rounded-radius-full border border-border-default bg-bg-surface
                           font-mono text-caption-sm font-bold text-fg-muted shadow-sh-sm"
              >
                {i + 1}
              </span>
              <span className="min-w-0 pt-[4px]">
                <span className="block text-body-md font-medium text-fg-default">{p.titulo}</span>
                <span className="mt-gp-sm block text-body-sm leading-relaxed text-fg-muted">
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


/**
 * Mascote 3D do Claude Code — atravessa por TRÁS do card de prompt.
 *
 * ⚠️ Correção de um diagnóstico meu que estava errado: eu havia concluído que o PNG
 * tinha fundo preto sólido e montei um palco escuro + `mix-blend-screen` pra "derrubar"
 * esse preto. O PNG é **RGBA com alpha 0 nos cantos** — medido por canvas
 * (`getImageData` nos 4 cantos: `a: 0`). O que me enganou foi o visualizador de imagem,
 * que compõe alpha sobre preto; eu li a composição como se fosse o arquivo.
 *
 * Sem fundo, sem blend, sem palco: só a imagem. E como ela fica ATRÁS do card
 * (`z-0` contra o `z-10` do card, que é `lp-glass`), o blur do vidro é que produz o
 * corte suave onde os dois se cruzam — o efeito do mockup sai do vidro, não de máscara.
 *
 * `absolute` porque precisa transbordar pra baixo, sobre o card; `aria-hidden` porque é
 * ornamento (o conteúdo da seção está no head e no card).
 *
 * ## Dois elementos, dois papéis (não é aninhamento gratuito)
 *
 * O wrapper carrega a POSIÇÃO e a ENTRADA (`.lp-mascote`, por transição); a imagem
 * carrega a FLUTUAÇÃO (`.lp-mascote-idle`, por animação infinita). Juntas no mesmo nó a
 * animação venceria o `transform` da transição e a entrada não aconteceria — o raciocínio
 * completo, incluindo as duas tentativas com overshoot que foram reprovadas, está no
 * cabeçalho das classes no `landing.css`.
 *
 * O `loading="lazy"` ficou: a entrada é disparada por `IntersectionObserver`, então a
 * imagem só precisa ter chegado quando a seção aparece — que é exatamente quando o lazy
 * a busca. Se a rede estiver lenta e o `is-in` chegar antes do byte, o resultado é a
 * imagem aparecendo sem a transição, não um buraco no layout (o wrapper já tem largura).
 */
function MascoteClaude() {
  const { ref, dentro } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={cn(
        // `top` calculado, não escolhido: a peça tem que cruzar o card de baixo em ~20%
        // da PRÓPRIA altura. Medido — o PNG é 1536×1024, então a altura é 2/3 da largura:
        //   xl (412px de largura) → 275px de altura → 20% = 55px → top 6 + 55 = 61px
        //   lg (340px)            → 227px          → 20% = 45px → top 14 + 45 = 59px
        // Antes eram 6/14px: a base do mascote encostava EXATAMENTE no topo do card
        // (medido: sobreposição de -1px), então não havia cruzamento nenhum.
        //
        // Os +10px em cima disso (71/69) são ajuste de olho do mantenedor sobre a conta —
        // a peça não é um retângulo cheio: as pernas são finas e há alpha em volta, então
        // 20% da CAIXA lê como menos de 20% de desenho cruzando.
        `lp-mascote pointer-events-none absolute top-[69px] right-0 z-0 hidden w-[340px]
         select-none lg:block xl:top-[71px] xl:w-[412px]`,
        dentro && "is-in",
      )}
    >
      {/* 3ª camada, só pro afundamento no clique do "Copiar prompt". Não cabe nas outras
          duas: na imagem a animação infinita venceria o `transform`, e no wrapper o
          afundamento herdaria a transição de 1.1s da entrada — reação de mais de um
          segundo pra um clique de 150ms. Quem aciona é `:has()` no CSS, sem estado. */}
      <span className="lp-mascote-press">
        <img
          aria-hidden
          alt=""
          src={`${import.meta.env.BASE_URL}claude-code-3d.png`}
          loading="lazy"
          decoding="async"
          className={cn(
            "block w-full select-none object-contain",
            // A flutuação só entra QUANDO a peça já está a caminho: a classe carrega
            // `animation-delay`, que conta a partir do momento em que ela é aplicada.
            dentro && "lp-mascote-idle",
          )}
        />
      </span>
    </div>
  );
}

function PromptSection() {
  const [ativo, setAtivo] = useState<string>(PROMPTS[0].id);
  const atual = PROMPTS.find((p) => p.id === ativo) ?? PROMPTS[0];

  return (
    // `lp-glass` = fundo translúcido + blur (o mesmo vidro do bezel do hero). Como o
    // mascote encosta na borda de cima do card, um fundo opaco cortava o glow dele
    // numa linha reta; com vidro o brilho atravessa.
    <Card className="lp-beam lp-beam-slow lp-glass overflow-hidden">
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
                "min-h-form-md rounded-radius-full px-pad-2xl text-body-sm font-medium",
                "transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
                // Ativo tem que ser OPACO e elevado: o card virou vidro translúcido, e
                // `bg-bg-surface + shadow-sh-sm` sobre ele ficava imperceptível.
                // `surface-elevated` + ring + sombra média destacam sem precisar de cor.
                ativo === p.id
                  ? "bg-bg-surface-elevated text-fg-default shadow-sh-md ring-1 ring-border-default"
                  : "text-fg-muted hover:bg-bg-muted hover:text-fg-default",
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
 * Ícone por COMPONENTE — os mesmos do `#/components-overview`.
 *
 * A fonte é o `COMPONENT_ICON_BY_HREF` exportado de lá (derivado do `CATALOG` daquela
 * página), não uma cópia: são 73 pares componente→ícone, e duas listas divergiriam no
 * primeiro componente novo.
 *
 * Os 25 hrefs que aquela página não cobre — os 7 gráficos, o `table-toolbar`, a
 * `tabela-teste` e os 15 exemplos `clients-*`/`list-*` — recebem ícone por FAMÍLIA
 * aqui. Eles não são componentes no índice de lá (são páginas de chart e de exemplo),
 * então não há de onde derivar; a lista abaixo é pequena e explícita de propósito.
 */
const ICONE_POR_FAMILIA: Array<[RegExp, LucideIcon]> = [
  [/^chart-area$/, ChartArea],
  [/^chart-bar$/, ChartColumn],
  [/^chart-line$/, ChartLine],
  [/^chart-pie$/, ChartPie],
  [/^chart-radar$/, Radar],
  [/^chart-radial$/, LoaderCircle],
  [/^chart-map$/, MapIcon],
  [/^chart-/, ChartColumn],
  [/^(clients-|tabela-teste)/, TableIcon],
  [/^list-/, ListIcon],
  [/^table-toolbar$/, SlidersHorizontal],
  [/^components-overview$/, Blocks],
];

function iconeDoItem(href: string): LucideIcon {
  const proprio = COMPONENT_ICON_BY_HREF[href];
  if (proprio) return proprio;
  for (const [padrao, icone] of ICONE_POR_FAMILIA) if (padrao.test(href)) return icone;
  return Component;
}

function CatalogoCard({ item }: { item: CatalogEntry }) {
  const { onNavigate } = useDocNav();
  const Icone = iconeDoItem(item.href);

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

/** Grade dos cards — 5 por linha nas resoluções grandes, como pedido. */
const GRADE_CATALOGO =
  "grid list-none grid-cols-1 gap-gp-md p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

function Catalogo() {
  const [termo, setTermo] = useState("");
  const [secao, setSecao] = useState<string | null>(null);

  /**
   * Duas formas de exibir, conforme o wireframe:
   *   - "Tudo" (`secao === null`) → agrupado por categoria, com header por grupo;
   *   - categoria escolhida → lista chapada, sem header (o chip já diz onde você está).
   */
  const grupos = useMemo(() => {
    const t = termo.trim().toLowerCase();
    const casa = (i: CatalogEntry) =>
      !t || i.label.toLowerCase().includes(t) || i.href.includes(t);

    if (secao) {
      return [{ secao, itens: CATALOGO.filter((i) => i.section === secao && casa(i)) }].filter(
        (g) => g.itens.length > 0,
      );
    }
    return SECOES.map((s) => ({
      secao: s,
      itens: CATALOGO.filter((i) => i.section === s && casa(i)),
    })).filter((g) => g.itens.length > 0);
  }, [termo, secao]);

  const total = grupos.reduce((n, g) => n + g.itens.length, 0);
  const porSecao = useMemo(
    () =>
      Object.fromEntries(
        SECOES.map((s) => [s, CATALOGO.filter((i) => i.section === s).length]),
      ),
    [],
  );

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
            placeholder="Buscar componente…"
            aria-label="Buscar componente"
            className="min-h-form-xl pl-[42px]"
          />
        </div>
        {/* O contador saiu daqui por pedido — a contagem já aparece no chip "Tudo" e
            em cada chip de categoria. `aria-live` foi pro chip pra a mudança de
            filtro continuar sendo anunciada. */}
      </div>

      {/* Chips de categoria — o filtro do wireframe. `Chip` do DS com contagem. */}
      <div className="flex flex-wrap items-center gap-gp-sm">
        <Chip
          size="md"
          color={secao === null ? "primary" : "neutral"}
          variant={secao === null ? "soft" : "outline"}
          onClick={() => setSecao(null)}
          aria-live="polite"
        >
          Tudo <span className={chipCount()}>{total}</span>
        </Chip>
        {SECOES.map((s) => (
          <Chip
            key={s}
            size="md"
            color={secao === s ? "primary" : "neutral"}
            variant={secao === s ? "soft" : "outline"}
            onClick={() => setSecao(s)}
          >
            {s} <span className={chipCount()}>{porSecao[s]}</span>
          </Chip>
        ))}
      </div>

      {grupos.length === 0 ? (
        <p className="py-pad-4xl text-center text-body-md text-fg-muted">
          Nada com esse termo. Tente “table”, “chart” ou “input”.
        </p>
      ) : secao ? (
        <ul className={GRADE_CATALOGO}>
          {grupos[0].itens.map((item) => (
            <li key={item.href}>
              <CatalogoCard item={item} />
            </li>
          ))}
        </ul>
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
            <ul className={GRADE_CATALOGO}>
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

  // `scrollIntoView`, não `href="#id"`: o App usa o hash como router (`#/inicio`) e
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
            <span
              className="lp-glass inline-flex items-center gap-gp-md rounded-radius-full border
                         px-pad-2xl py-pad-md text-body-sm text-fg-muted shadow-sh-sm"
            >
              <span
                aria-hidden
                className="size-[6px] rounded-radius-full bg-bg-brand ring-4 ring-ring-brand"
              />
              <strong className="font-medium text-fg-default">
                {/* `CATALOGO_COMPLETO`, não `CATALOGO`: o badge fala de PÁGINAS do
                    showcase (137), e o `CATALOGO` passou a ser só componente (98)
                    quando o catálogo foi filtrado. Trocar a fonte sem trocar a
                    palavra teria deixado o hero afirmando 98 páginas. */}
                {CATALOGO_COMPLETO.length} páginas
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
                // Derivado, não escrito: era "5", e a 6ª marca deixaria o número errado
                // sem quebrar nada — a mesma podridão que tirou a contagem dos títulos
                // das seções. O resto é fato estrutural que não muda com o catálogo.
                [String(BRANDS.length), BRANDS.length === 1 ? "marca" : "marcas"],
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

        <div className="mt-[64px] pb-[80px]">
          <HeroWindow />
        </div>
      </Wrap>

      {/* ── Tokens vivos: seletor PRIMEIRO, componentes DEPOIS ───────────────
          A ordem é o pedido explícito do mantenedor, e faz sentido: o seletor é a
          causa e o bento é o efeito. Ver o seletor depois das peças invertia a
          leitura. */}
      {/* `relative` + `lp-section-glow`: o wireframe põe aura aqui também, e faz
          sentido — é a seção que FALA de cor. Sem ela a área fica chapada.

          O `lp-grid-band` acrescenta a malha de fundo na FAIXA entre o hero e esta
          seção: sem ela havia um vazio chapado longo entre as duas, e a malha amarra
          as duas metades como um plano só. É a mesma malha do topo, mascarada nas
          duas pontas pra não ter borda dura. */}
      <div className="relative pt-[152px]">
        <div className="lp-grid-band" aria-hidden />
        <div className="lp-section-glow" aria-hidden />
        <Wrap className="relative">
          <Reveal>
            {/* ⚠️ "Cinco marcas, dois modos" saiu por PODRIDÃO PROGRAMADA: o título
                afirmava uma contagem que a 6ª marca invalidaria em silêncio — e o gate
                de doc não cobre copy de landing. "Múltiplos temas" continua verdadeiro
                em qualquer contagem. Mesmo motivo do badge do hero, que já lê
                `BRANDS.length` em vez de dizer 5. */}
            <SectionHead
              eyebrow="Tokens vivos"
              title="Uma base."
              em="Múltiplos temas."
              alinhamento="center"
            >
              Os componentes não conhecem cor — consomem a camada semantic via CSS vars.
              Trocar de tema é trocar um atributo no <code className="font-mono text-code-sm">&lt;html&gt;</code>,
              claro ou escuro. Experimente:
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
      <div ref={instalacaoRef} className="scroll-mt-[24px] pt-[152px]">
        <Wrap>
          <Reveal>
            {/* "Quatro canais. Nenhum depreciado." era jargão de mantenedor: dizia o
                que NÃO aconteceu com os canais em vez de dizer que existem vários e que
                a instalação é manual. E contava — mesma podridão do título dos tokens. */}
            <SectionHead
              eyebrow="Instalação"
              title="Vários canais de instalação."
              em="Todos suportados."
            >
              O mesmo sistema chega por npm, submódulo git, copy-in do registry ou
              scaffold da CLI. A escolha é sobre quanto do código você quer dentro do seu
              repo — nenhum caminho é legado, e todos são passo a passo, na sua mão.
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
      {/* `data-lp-kit` é o escopo do `:has()` que faz o mascote afundar quando o "Copiar
          prompt" está pressionado. Sem ele, qualquer botão de copiar da página (os
          `CodeCard` da instalação também têm um) mexeria no mascote de longe.

          Fica NESTE `<div>`, não no `<Wrap>`: o `Wrap` desestrutura só `className` e
          `children`, então um atributo extra passado a ele é descartado em silêncio — e o
          `tsc` não reclama. Verificado no DOM, não presumido. */}
      <div data-lp-kit className="pt-[152px]">
        {/* `relative` ancora o mascote, que é `absolute` e transborda pra baixo. O
            card vem DEPOIS com `z-10`, então a imagem passa por trás dele. */}
        <Wrap className="relative">
          <MascoteClaude />

          <Reveal>
            {/* `lg:pr` reserva a faixa do mascote pra o texto não correr por baixo. */}
            <div className="lg:pr-[340px] xl:pr-[400px]">
              {/* "Cole no Claude Code e ele faz o resto" descrevia a MÁGICA, não a
                  ação: quem chega aqui precisa saber o que fazer com o mouse. O título
                  novo é a instrução literal, na ordem em que ela acontece. */}
              <SectionHead
                eyebrow="Kit de IA"
                title="Instale com um prompt."
                em="Copie e cole no Claude Code."
              >
                Dois prompts com trabalhos diferentes: um instala o sistema no projeto, o
                outro é um pedido-exemplo — menu com 3 categorias e um CRUD completo —
                pra ver o sistema de pé em minutos. As regras técnicas a IA já recebe
                pelo kit instalado; você só descreve a tela.
              </SectionHead>
            </div>
          </Reveal>

          <Reveal i={1} className="relative z-10 mt-[44px]">
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
      {/* A faixa (`lp-band`) é o que separa esta seção do Kit de IA sem linha dura.
          Ela é `inset: 0` sobre este wrapper, então cobre o padding de topo também —
          é isso que faz a transição começar ANTES do conteúdo do catálogo. O `pb`
          fecha a faixa com respiro em vez de cortar no último card. */}
      <div ref={catalogoRef} className="relative scroll-mt-[24px] pt-[152px] pb-[72px]">
        <div className="lp-band" aria-hidden />
        <Wrap className="relative">
          <Reveal>
            {/* Terceira versão deste título; as duas anteriores erraram por motivos
                diferentes, e vale registrar os dois:
                  1. "Tudo que existe, numa busca só" — bonito, e não dizia O QUE está ali.
                  2. "Biblioteca de componentes. Busque e encontre." — o "busque" legendava
                     um campo de busca que está 40px abaixo. O conserto ("Inteira, nesta
                     página") ficou defensivo: respondia uma dúvida que o visitante não tem.
                Agora a segunda metade diz PRA QUÊ a biblioteca serve — a única coisa que
                nem o campo de busca nem a grade de cards comunicam sozinhos. */}
            <SectionHead
              eyebrow="Catálogo"
              title="Uma biblioteca de componentes"
              em="para construir experiências consistentes."
            >
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
      <div className="pt-[152px]">
        <Wrap>
          <Reveal>
            <div className="lp-beam relative overflow-hidden rounded-radius-xl border border-border-subtle bg-bg-surface px-pad-3xl py-[56px] text-center shadow-sh-md">
              <div className="lp-aura" aria-hidden />

              {/* Marca d'água — a logo da iGreen atravessando o card, cortada em cima e
                  embaixo pelo `overflow-hidden` que o card já tinha.

                  Fica ANTES do wrapper de conteúdo de propósito: os dois são posicionados
                  no mesmo stacking context, então quem vem depois no DOM pinta em cima. É
                  a mesma razão pela qual o wrapper `relative` abaixo existe.

                  Sem `absolute inset` genérico: `top-1/2 -translate-y-1/2` a ancora no
                  centro vertical e deixa o corte simétrico. À direita porque o conteúdo é
                  centrado — atrás do texto ela viraria ruído sob a leitura.

                  ⚠️ A suavidade NÃO é `opacity` — é a cor, via `.lp-marca-dagua` no
                  `landing.css`. `opacity` multiplica tudo que o elemento pinta, então
                  mataria o neon do contorno junto (um `drop-shadow` a 5,5% não existe). Com
                  o alpha na cor, o glow tem alpha próprio e o contorno fica perceptivelmente
                  mais claro que o miolo — que é o que faz ler como neon. */}
              {/* Posição calibrada em duas rodadas: uma tentativa com `rotate-[10deg]` foi
                  reprovada (a marca é orgânica, e girar deixou a folha "tombada" em vez de
                  discreta), e o ponto de repouso desceu e foi pra direita — `-96px` em vez
                  de `-56px`, e `-50% + 40px` no eixo Y.

                  O deslocamento vertical entra no PRÓPRIO `translate` (não num `mt`) pra não
                  criar uma segunda fonte de posição: o `-50%` é o que centra, e o `+40px` é
                  o ajuste sobre ele.

                  ⚠️ Medir isso contra o estado ROTACIONADO dá número errado: o
                  `getBoundingClientRect` de um elemento girado devolve o AABB, que é maior
                  que a caixa real, então a diferença aparecia como +84/+70. Contra o mesmo
                  layout sem rotação: 948 → 988 no X e −61 → −21 no Y, exatamente +40/+40. */}
              <span
                aria-hidden
                className="lp-marca-dagua pointer-events-none absolute top-1/2 right-[-96px]
                           translate-y-[calc(-50%+40px)] select-none"
              >
                <SidebarBrandIcon size={362} />
              </span>

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
                Veja um app real consumindo o DS de ponta a ponta, ou o DataTable numa
                tela de CRUD completa — o componente que a maior parte das telas daqui usa.
              </p>
              <div className="mt-[28px] flex flex-wrap items-center justify-center gap-gp-md">
                {/* `<a>` com o recipe `buttonVariants`, não `<Button>`: o demo é um
                    BUILD SEPARADO (`/demo/`), então precisa de navegação de documento —
                    e o `Button` do DS é `<button>` puro, sem `asChild`. Navegar por
                    `onClick` funcionaria, mas mataria ctrl/cmd+clique e botão do meio,
                    que é exatamente o defeito da L-068. Aplicar o `tv()` do próprio
                    Button mantém a verdade visual na fonte, sem copiar classe.

                    A URL vem do nav (`getCatalog`), não escrita à mão: se o demo mudar
                    de caminho, este botão acompanha. */}
                <a
                  href={URL_DEMO}
                  className={buttonVariants({ color: "primary", variant: "filled", size: "lg" })}
                >
                  Demo Virtual Office
                  <ExternalLink aria-hidden />
                </a>
                <Button
                  color="secondary"
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate(ROTA_EXEMPLO_CRUD)}
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
