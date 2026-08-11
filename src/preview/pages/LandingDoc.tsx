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
  type CSSProperties,
  type ReactNode,
} from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ArrowUpRight,
  Blocks,
  Check,
  Copy,
  Layers,
  Package,
  Search,
  Sparkles,
  Sun,
  Moon,
  Terminal,
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
import { chipCount } from "../../components/ui/Chip";
import { Switch } from "../../components/shadcn/switch";
import { Input } from "../../components/shadcn/input";
import { Badge } from "../../components/shadcn/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/shadcn/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  useColumnWidths,
} from "../../components/ui/Table";
import { BRANDS, useBrand } from "../../hooks/useBrand";
import { useTheme } from "../../hooks/useTheme";
import { getCatalog, getCatalogSections, useDocNav } from "../components";
import "./landing.css";

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
} as const;

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
    <div className={cn("mx-auto w-full max-w-main-content-max px-pad-3xl", className)}>
      {children}
    </div>
  );
}

/** Eyebrow + título + linha de apoio. Hierarquia por espaçamento, não por tamanho. */
function SectionHead({
  eyebrow,
  title,
  em,
  children,
}: {
  eyebrow: string;
  title: string;
  em?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className="inline-flex items-center gap-gp-sm rounded-radius-full border border-border-brand-subtle
                   bg-bg-brand-subtle px-pad-lg py-pad-xs font-mono text-caption-xs uppercase
                   tracking-[0.12em] text-fg-brand"
      >
        <span className="size-[5px] rounded-radius-full bg-bg-brand" aria-hidden />
        {eyebrow}
      </span>
      <h2 className="mt-gp-xl max-w-[24ch] text-heading-lg font-semibold tracking-[-0.03em] text-fg-default">
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
   Palco do hero — a assinatura da página

   O switch de marca/modo fica ENCOSTADO nas peças, não numa seção separada lá
   embaixo: o que precisa ser entendido é "mexi aqui, mudou ali". São os hooks
   reais, então a troca vale pro showcase inteiro (persiste em localStorage).
   ═════════════════════════════════════════════════════════════════════════════ */

function ThemeOrganism() {
  const { brand, setBrand } = useBrand();
  const { isDark, toggle } = useTheme();

  return (
    <div className="flex flex-col items-center gap-gp-lg">
      <div className="flex flex-wrap items-center justify-center gap-gp-md">
        <div
          role="group"
          aria-label="Marca"
          className="flex items-center gap-gp-2xs rounded-radius-full border border-border-subtle bg-bg-surface p-pad-2xs shadow-sh-sm"
        >
          {BRANDS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBrand(b.id)}
              aria-pressed={brand === b.id}
              className={cn(
                "inline-flex min-h-form-sm items-center gap-gp-sm rounded-radius-full px-pad-lg",
                "text-caption-md font-medium transition-colors focus-visible:outline-none",
                "focus-visible:ring-4 focus-visible:ring-ring-brand",
                brand === b.id
                  ? "bg-bg-brand-subtle text-fg-brand"
                  : "text-fg-muted hover:bg-bg-muted hover:text-fg-default",
              )}
            >
              <span
                aria-hidden
                className="size-[10px] rounded-radius-full ring-1 ring-inset ring-border-default"
                style={{ background: b.swatch }}
              />
              {b.label}
            </button>
          ))}
        </div>

        <Button
          color="secondary"
          variant="outline"
          size="sm"
          onClick={toggle}
          iconLeft={isDark ? <Sun /> : <Moon />}
        >
          {isDark ? "Claro" : "Escuro"}
        </Button>
      </div>

      <p className="max-w-[52ch] text-center text-caption-md text-fg-subtle">
        Marca troca <strong className="font-medium text-fg-muted">só cor</strong> — spacing,
        sizing, radius e tipografia vêm sempre da base. E vale pro showcase todo, não só
        pra esta página.
      </p>
    </div>
  );
}

/**
 * Uma peça do palco: card real + flutuação lenta + entrada escalonada.
 *
 * São TRÊS divs aninhadas de propósito, e a distinção importa: `className` posiciona
 * a peça na grade (col-span, offset vertical) no div de reveal; `conteudo` estiliza o
 * que está DENTRO do `lp-bob`, que é um block e engoliria um `flex` posto de fora.
 */
function StagePiece({
  i,
  className,
  conteudo,
  children,
}: {
  i: number;
  className?: string;
  conteudo?: string;
  children: ReactNode;
}) {
  const { ref, dentro } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ "--lp-i": i } as CSSProperties}
      className={cn("lp-reveal", dentro && "is-in", className)}
    >
      <div className={cn("lp-bob", conteudo)} style={{ "--lp-i": i } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}

/**
 * Card de receita. O gráfico só monta DEPOIS que o card entra na viewport.
 *
 * Não é lazy-load por peso — é pelo warning do Recharts. Montando junto com a página,
 * o `ResponsiveContainer` media o pai antes do grid resolver e reclamava
 * `width(-1) and height(-1)` duas vezes por load. Esperar o `useInView` dá layout
 * pronto na primeira medição, e de graça evita animar gráfico fora de tela.
 */
function ReceitaCard() {
  const { ref, dentro } = useInView<HTMLDivElement>();

  return (
    <div ref={ref}>
      <Card
        titulo="Receita recorrente"
        subtitulo="últimos 7 meses"
        acao={<KpiDelta value="+6,1%" signed />}
      >
        <p className="text-stat-lg leading-none tabular-nums text-fg-default">R$ 89,4k</p>
        {/* Altura reservada nos dois estados: sem isso o card pula quando o
            gráfico entra. */}
        <div className="h-[104px] w-full">
          {dentro && (
            <ChartContainer config={RECEITA_CONFIG} className="h-[104px] w-full">
              <AreaChart data={RECEITA} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  // Sem isto o Recharts descarta o tick da borda e a série começava
                  // em "Mar" com o dado de "Fev" desenhado — L-032, caveat 4.
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
          )}
        </div>
      </Card>
    </div>
  );
}

/**
 * Tabela do palco. O `Table` do DS é composto de divs com larguras resolvidas por
 * `useColumnWidths` — não é `<table>` nativo, e a largura vive na coluna, não no CSS.
 *
 * É `Table` e não `DataTable` de propósito: o `DataTable` quer altura própria,
 * paginação e toolbar, e dentro de um palco de hero ele briga com a página em vez de
 * demonstrá-la. O convite pro DataTable completo é o CTA de fechamento.
 */
function ClientesTable() {
  const colunas = useMemo(
    () => [
      { field: "nome", headerName: "Cliente", width: 190 },
      { field: "doc", headerName: "CNPJ", width: 170 },
      { field: "kwh", headerName: "kWh", width: 90 },
      { field: "status", headerName: "Status", width: 110 },
    ],
    [],
  );
  const { widths } = useColumnWidths(colunas);

  return (
    <Card
      titulo="Clientes"
      subtitulo="4 de 1.284"
      acao={
        <Badge color="primary" variant="soft" size="sm" className="font-mono">
          Table
        </Badge>
      }
    >
      <Table density="compact" ariaLabel="Clientes de exemplo">
        <TableHead>
          {colunas.map((c) => (
            <TableHeadCell
              key={c.field}
              width={widths[c.field]}
              align={c.field === "kwh" ? "right" : "left"}
            >
              {c.headerName}
            </TableHeadCell>
          ))}
        </TableHead>
        <TableBody>
          {CLIENTES.map((c) => (
            <TableRow key={c.doc}>
              <TableCell width={widths.nome}>
                <span className="font-medium text-fg-default">{c.nome}</span>
              </TableCell>
              <TableCell width={widths.doc}>
                <span className="font-mono text-fg-muted">{c.doc}</span>
              </TableCell>
              <TableCell width={widths.kwh} align="right">
                <span className="tabular-nums">{c.kwh}</span>
              </TableCell>
              <TableCell width={widths.status}>
                <Chip color={STATUS_COLOR[c.status]} variant="soft" size="sm">
                  {c.status}
                </Chip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function Stage() {
  return (
    <div className="relative">
      <div className="lp-aura" aria-hidden />
      <div
        className="relative grid grid-cols-1 gap-gp-xl sm:grid-cols-2 lg:grid-cols-12 lg:items-start"
        aria-label="Componentes reais do design system"
      >
        {/* Consumo — Kpi com barra de franquia no slot livre */}
        <StagePiece i={0} className="lg:col-span-4">
          <Kpi
            label="Consumo do mês"
            value="1.284"
            hint="kWh · 72% da franquia"
            icon={<Zap />}
            tone="brand"
            size="lg"
          >
            <div
              className="mt-gp-md flex h-[8px] gap-[2px] overflow-hidden rounded-radius-full bg-bg-muted"
              role="presentation"
            >
              <span className="rounded-radius-full bg-bg-brand" style={{ flex: 72 }} />
              <span style={{ flex: 28 }} />
            </div>
          </Kpi>
        </StagePiece>

        {/* Receita — chart-card */}
        <StagePiece i={1} className="lg:col-span-5 lg:mt-[38px]">
          <ReceitaCard />
        </StagePiece>

        {/* Feedback + estados.

            ⚠️ O `flex flex-col gap` vai NESTE wrapper interno, não no `className` do
            StagePiece: lá ele cairia no div de reveal, e o `lp-bob` no meio é um
            block — os dois cards apareceram colados. */}
        <StagePiece i={2} className="lg:col-span-3 lg:mt-[14px]" conteudo="flex flex-col gap-gp-xl">
          {/* Recipe de metric-row do `dashboard-patterns.md` §2 — ícone QUADRADO
              (`size-comp-xl rounded-radius-base`). Círculo é do KPI-group; são dois
              recipes diferentes e trocá-los é o erro mais comum aqui. */}
          <Card className="gap-gp-md">
            <div className="flex items-center gap-gp-md">
              <span
                aria-hidden
                className="grid size-comp-xl shrink-0 place-items-center rounded-radius-base bg-bg-success-muted text-fg-success"
              >
                <Check className="size-icon-sm" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body-md font-medium text-fg-default">
                  Proposta enviada
                </span>
                <span className="block text-caption-sm text-fg-muted">
                  O licenciado recebeu por e-mail.
                </span>
              </span>
            </div>
          </Card>

          <Card titulo="Notificações" className="gap-gp-lg">
            <div className="flex items-center justify-between gap-gp-md">
              <label htmlFor="lp-sw-consumo" className="text-body-sm text-fg-muted">
                Alerta de consumo
              </label>
              <Switch id="lp-sw-consumo" defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-gp-md">
              <label htmlFor="lp-sw-fatura" className="text-body-sm text-fg-muted">
                Fatura fechada
              </label>
              <Switch id="lp-sw-fatura" />
            </div>
          </Card>
        </StagePiece>

        {/* Ações + status */}
        <StagePiece i={3} className="lg:col-span-4 lg:-mt-[10px]">
          <Card titulo="Ações e status" subtitulo="Button · Chip">
            <div className="flex flex-wrap items-center gap-gp-md">
              <Button size="sm">Aprovar</Button>
              <Button color="secondary" variant="outline" size="sm">
                Revisar
              </Button>
              <Button color="critical" variant="ghost" size="sm">
                Recusar
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-gp-sm">
              <Chip color="success" size="sm">
                Ativo
              </Chip>
              <Chip color="warning" size="sm">
                Pendente
              </Chip>
              <Chip color="info" size="sm">
                Em análise
              </Chip>
              <Chip size="sm">Inativo</Chip>
            </div>
          </Card>
        </StagePiece>

        {/* Densidade — a tela que o DS existe pra fazer */}
        <StagePiece i={4} className="sm:col-span-2 lg:col-span-8 lg:mt-[8px]">
          <ClientesTable />
        </StagePiece>
      </div>
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
    label: "npm create",
    resumo: "Projeto novo do zero",
    quando: "Começando um app agora. Vite + React 19 + Tailwind v4 + tema já ligados.",
    arquivo: "terminal",
    codigo: `npm create @snksergio/design-system my-app
cd my-app
npm run dev
# → http://localhost:3200`,
  },
  {
    id: "submodulo",
    label: "submódulo git",
    resumo: "Consumo do código-fonte",
    quando:
      "Você quer acompanhar o DS de perto e editar nada dentro dele. É o canal mais usado internamente.",
    arquivo: "terminal + tsconfig.json",
    codigo: `git submodule add https://github.com/igreenlab/igreen-desingsystem-admin design-system
git submodule update --init --recursive
npm --prefix design-system install

# projeta as skills/commands do DS pro .claude/ deste projeto
npm --prefix design-system run ds:link

// tsconfig.json
{ "compilerOptions": { "paths": { "@ds/*": ["design-system/src/*"] } } }`,
  },
  {
    id: "npm",
    label: "npm install",
    resumo: "Pacote versionado",
    quando: "App externo que só consome. Modelo evergreen — `npm update` puxa a última.",
    arquivo: "src/index.css",
    codigo: `npm install @snksergio/design-system

/* @source é OBRIGATÓRIO: o Tailwind v4 não escaneia node_modules,
   e sem ele os componentes vêm sem spacing/radius — sem erro nenhum. */
@import "tailwindcss";
@source "../node_modules/@snksergio/design-system/dist-lib/**/*.{mjs,cjs,js}";
@import "@snksergio/design-system/theme.css";`,
  },
  {
    id: "copyin",
    label: "copy-in / registry",
    resumo: "O código entra no seu repo",
    quando: "Você quer o componente como código seu, editável, no padrão shadcn.",
    arquivo: "terminal",
    codigo: `npx shadcn add @igreen/data-table
npx shadcn add @igreen/app-shell

# o arquivo passa a ser SEU — customize na composição,
# não nos tokens (o hook protect-ds avisa)`,
  },
] as const;

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

function Catalogo() {
  const { onNavigate } = useDocNav();
  const [termo, setTermo] = useState("");
  const [secao, setSecao] = useState<string | null>(null);

  const lista = useMemo(() => {
    const t = termo.trim().toLowerCase();
    return CATALOGO.filter(
      (i) =>
        (!secao || i.section === secao) &&
        (!t || i.label.toLowerCase().includes(t) || i.href.includes(t)),
    );
  }, [termo, secao]);

  return (
    <div className="flex flex-col gap-gp-2xl">
      <div className="mx-auto w-full max-w-modal-lg">
        <div className="relative">
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
      </div>

      <div className="flex flex-wrap items-center justify-center gap-gp-sm">
        {/* `chipCount()` é o helper de estilo que o próprio Chip exporta pro badge
            numérico — não existe prop `count`. */}
        <Chip
          size="md"
          color={secao === null ? "primary" : "neutral"}
          variant={secao === null ? "soft" : "outline"}
          onClick={() => setSecao(null)}
        >
          Tudo <span className={chipCount()}>{CATALOGO.length}</span>
        </Chip>
        {SECOES.map((s) => (
          <Chip
            key={s}
            size="md"
            color={secao === s ? "primary" : "neutral"}
            variant={secao === s ? "soft" : "outline"}
            onClick={() => setSecao(s)}
          >
            {s} <span className={chipCount()}>{CATALOGO.filter((i) => i.section === s).length}</span>
          </Chip>
        ))}
      </div>

      <p className="text-center text-caption-md text-fg-subtle" aria-live="polite">
        {lista.length} {lista.length === 1 ? "item" : "itens"}
      </p>

      {lista.length === 0 ? (
        <p className="py-pad-4xl text-center text-body-md text-fg-muted">
          Nada com esse termo. Tente “table”, “chart” ou “token”.
        </p>
      ) : (
        <ul className="grid list-none grid-cols-1 gap-gp-md p-0 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((item) => {
            const conteudo = (
              <>
                <span
                  aria-hidden
                  className="grid size-comp-xl shrink-0 place-items-center rounded-radius-base
                             bg-bg-brand-subtle font-mono text-caption-xs font-bold text-fg-brand"
                >
                  {item.label.replace(/^(Ex|Ex:)\s*/i, "").slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-sm font-medium text-fg-default">
                    {item.label}
                  </span>
                  <span className="block truncate text-caption-sm text-fg-subtle">
                    {item.section}
                  </span>
                </span>
                <ArrowUpRight
                  className="size-icon-xs shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-[2px] group-hover:text-fg-brand"
                  aria-hidden
                />
              </>
            );

            const classe = cn(
              "group flex w-full items-center gap-gp-md rounded-radius-lg border border-border-subtle",
              "bg-bg-surface px-pad-xl py-pad-lg text-left transition-colors",
              "hover:border-border-brand-subtle hover:bg-bg-subtle",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand",
            );

            return (
              <li key={item.href}>
                {/* App standalone (`?app=…`) ou build separado (`/demo/`) precisa de
                    navegação de DOCUMENTO — não dá pra roteá-los pelo hash router. */}
                {item.url ? (
                  <a href={item.url} className={classe}>
                    {conteudo}
                  </a>
                ) : (
                  <button type="button" onClick={() => onNavigate(item.href)} className={classe}>
                    {conteudo}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
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
          <Stage />
        </div>

        <div className="mt-[40px]">
          <Reveal i={1}>
            <ThemeOrganism />
          </Reveal>
        </div>
      </Wrap>

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
            <Tabs defaultValue={CANAIS[0].id}>
              <TabsList className="mx-auto flex w-full max-w-modal-lg flex-wrap">
                {CANAIS.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="flex-1">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {CANAIS.map((c) => (
                <TabsContent key={c.id} value={c.id} className="mt-gp-2xl">
                  <Card titulo={c.resumo} subtitulo={c.quando}>
                    <CodeCard arquivo={c.arquivo} codigo={c.codigo} />
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </Reveal>

          <Reveal i={2} className="mt-gp-2xl">
            <p className="text-center text-caption-md text-fg-subtle">
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
            <p className="text-center text-caption-md text-fg-subtle">
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
