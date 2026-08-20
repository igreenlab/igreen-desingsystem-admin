import { Cell, Pie, PieChart } from "recharts";
// Import por ARQUIVO, não pelo barrel `@/components/shadcn` — o barrel (`index.ts`) não é
// distribuído por nenhum item do registry, então um bloco que o importasse chegaria no
// consumidor de copy-in com import que não resolve. O gate `registry-imports` pega isso; foi
// ele que reprovou a primeira versão deste arquivo (L-037).
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/shadcn/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Chip } from "@/components/ui/Chip";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/Chart";

/**
 * dsgreen-chart-1 — donut de distribuição + lista de rateio no mesmo card.
 *
 * ## O que este bloco resolve
 *
 * A composição que a IA não monta sozinha: donut com **total no centro** e, abaixo,
 * a **lista das mesmas fatias** onde a cor é a chave que liga linha ↔ setor. Pedindo
 * "gráfico de pizza com os valores", sai o donut e uma legenda genérica ao lado; a
 * leitura boa é esta — o olho vai ao total, depois desce a lista e usa a cor pra
 * voltar ao setor.
 *
 * ## Regras do DS que este bloco carrega (e que copiar sem elas quebra)
 *
 * - **Cor só por token de chart** (`--color-chart-1..5`). Nunca hex, nunca paleta
 *   nativa do Tailwind. 5 fatias = as 5 chaves, na ordem.
 * - **`fg-danger` NÃO entra como cor de categoria.** Ele é semântico de erro/queda
 *   (`chart-patterns.md` §2: "Status/uptime → down"). Usar vermelho de perigo numa
 *   categoria normal faz o leitor inferir problema onde não há.
 * - **Valor numérico com `tabular-nums`**, senão os dígitos dançam entre linhas.
 * - **Superfície = `Card` do DS.** Não recriar `<section>` com bg/shadow na unha.
 *
 * ## Cuidado ao adaptar
 *
 * As abas são **de composição visual**: elas mostram que o card cabe num contexto de
 * 2+ recortes, mas não trocam dado nenhum aqui. Se o seu caso tem dois recortes de
 * verdade, ligue-as a estado e troque o `data`; se tem um só, **remova-as** — controle
 * que não faz nada é pior que controle ausente.
 */
export const BLOCK = {
  id: "dsgreen-chart-1",
  nome: "Donut de distribuição com rateio",
  descricao:
    "Donut com total no centro + lista das fatias abaixo, onde a cor liga linha e setor. Para distribuição de um total por 3–5 categorias nomeadas.",
  usa: ["Card (size=\"md\")", "Tabs", "Chip", "ChartContainer", "PieChart (recharts)"],
} as const;

/**
 * Fixture do bloco. Fica aqui de propósito: bloco é auto-contido, então quem copia
 * vê a forma do dado esperado sem ter que inferir do gráfico.
 */
type BudgetRow = { readonly grupo: string; readonly valor: number; readonly cor: string };

const BUDGET: readonly BudgetRow[] = [
  { grupo: "Engenharia", valor: 950, cor: "var(--color-chart-1)" },
  { grupo: "Marketing", valor: 680, cor: "var(--color-chart-2)" },
  { grupo: "Comercial", valor: 520, cor: "var(--color-chart-3)" },
  { grupo: "Operações", valor: 310, cor: "var(--color-chart-4)" },
  { grupo: "RH & Admin", valor: 195, cor: "var(--color-chart-5)" },
];

const TOTAL = BUDGET.reduce((soma, linha) => soma + linha.valor, 0);

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const share = (valor: number) => `${((valor / TOTAL) * 100).toFixed(1)}%`;

export function BudgetBreakdownBlock() {
  // `size` cuida do padding de TODAS as partes do card — não escrever `px-*`/`p-0` na
  // mão (era o que este bloco fazia antes do `Card` ganhar a prop, em 2026-08-19).
  return (
    <Card size="md" className="w-full max-w-[450px]">
      <CardHeader>
        <CardTitle>Distribuição de custo</CardTitle>
        <CardDescription>
          Rateio do gasto por área e categoria de custo.
        </CardDescription>
      </CardHeader>

      {/* Cada seção vai em `CardContent` porque é ELE que carrega o padding
          horizontal — o `Card` só carrega o vertical. `<div>` cru como filho direto
          do Card encosta nas bordas, que é o que este bloco fazia por engano. */}
      <CardContent>
        {/* Ver o JSDoc: abas de composição. Ligue a estado ou remova. */}
        <Tabs defaultValue="area">
          <TabsList className="w-full">
            <TabsTrigger value="area" className="flex-1">
              Por área
            </TabsTrigger>
            <TabsTrigger value="categoria" className="flex-1">
              Por categoria
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>

      {/* Donut + total no centro. O overlay é pointer-events-none pra não roubar o
          hover do setor — sem isso o tooltip do Recharts não abre no meio. */}
      <CardContent className="relative mx-auto flex items-center justify-center">
        <ChartContainer config={{}} className="aspect-square h-[210px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="grupo" />}
            />
            <Pie
              data={BUDGET as BudgetRow[]}
              dataKey="valor"
              nameKey="grupo"
              innerRadius={64}
              outerRadius={92}
              paddingAngle={3}
              strokeWidth={0}
            >
              {BUDGET.map((linha) => (
                <Cell key={linha.grupo} fill={linha.cor} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-title-lg font-bold tabular-nums text-fg-default">
            {brl.format(TOTAL)}
          </span>
          <span className="text-caption-sm text-fg-muted">gasto total</span>
        </div>
      </CardContent>

      <CardContent>
        <div className="mb-pad-md flex items-center justify-between text-caption-md text-fg-muted">
          <span>ÁREA</span>
          <span>VALOR / PARTICIPAÇÃO</span>
        </div>
        <div className="flex flex-col">
          {BUDGET.map((linha) => (
            <div
              key={linha.grupo}
              className="flex items-center gap-gp-md border-b border-border-subtle py-pad-lg last:border-0"
            >
              {/* A barrinha de cor é o que liga esta linha ao setor do donut. */}
              <span
                aria-hidden
                className="h-[16px] w-[3px] rounded-radius-full"
                style={{ background: linha.cor }}
              />
              <span className="flex-1 text-body-sm font-medium text-fg-default">
                {linha.grupo}
              </span>
              <span className="text-body-sm font-semibold tabular-nums text-fg-default">
                {brl.format(linha.valor)}
              </span>
              <Chip color="neutral" variant="soft" size="sm" shape="pill">
                {share(linha.valor)}
              </Chip>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
