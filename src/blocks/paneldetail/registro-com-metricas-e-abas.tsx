import { useState } from "react";
import { FileText, Pencil, Receipt, Trash2 } from "lucide-react";
// Import por ARQUIVO, não pelo barrel `@/components/shadcn` — o barrel (`index.ts`) não é
// distribuído por nenhum item do registry, então um bloco que o importasse chegaria no
// consumidor de copy-in com import que não resolve (L-037, gate `registry-imports`).
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import {
  FloatingPanelField,
  FloatingPanelSection,
} from "@/components/ui/FloatingPanel";
import { Kpi, KpiDelta, KpiGroup } from "@/components/ui/Kpi";

export const BLOCK = {
  id: "dsgreen-paneldetail-1",
  nome: "Detalhe do registro com métricas e abas internas",
  descricao:
    "Conteúdo de painel de detalhe aberto a partir de uma linha de tabela: identidade + ações, faixa de métricas do registro, campos gerais e abas internas pros recortes profundos. Serve em Panel, FloatingPanel ou Drawer — a casca muda o comportamento, não o arranjo.",
  usa: [
    "KpiGroup (columns=3, divided) + Kpi (size=\"sm\") + KpiDelta",
    "FloatingPanelSection + FloatingPanelField",
    "Tabs (fullWidth, variante default)",
    "Chip",
    "Button (variant ghost/outline, size sm)",
  ],
} as const;

/**
 * dsgreen-paneldetail-1 — o conteúdo do painel de detalhe de um registro.
 *
 * ## O que este bloco resolve
 *
 * Pedindo "abre um painel com o detalhe do cliente", sai uma pilha de `label: valor` —
 * correta e ilegível a partir do 12º campo. O que falta não é componente, é **ordem**:
 * o painel tem quatro faixas com papéis diferentes, e a sequência é a informação.
 *
 *   1. **identidade + ações** — quem é este registro e o que dá pra fazer com ele. Ações
 *      no topo, à direita: são do registro inteiro, não de nenhuma seção.
 *   2. **métricas** — o resumo numérico. Vem ANTES dos campos porque responde "como este
 *      registro está?", que é a pergunta de quem abriu o painel; os campos respondem
 *      "quais são os dados dele?", que é a segunda.
 *   3. **detalhamento geral** — os campos, em seções colapsáveis. Colapsável importa: é o
 *      que permite ter 20 campos sem obrigar a rolar 20 campos.
 *   4. **abas internas** — os recortes profundos (faturas, histórico, documentos). Ficam
 *      DEPOIS do detalhamento geral porque aba esconde conteúdo: o que está sempre visível
 *      é o que sempre se olha, e o que é eventual vai pra aba.
 *
 * ## As três casas onde este conteúdo mora
 *
 * `Panel`, `FloatingPanel` e `Drawer` são todos superfície lateral, e a diferença é
 * **comportamento**, não desenho — então o conteúdo é o mesmo nos três:
 *
 * | casca | comportamento | quando |
 * |---|---|---|
 * | `Panel` (`size="md"`, 560px) | modal, com backdrop | o detalhe é a tarefa; a lista atrás pode esperar |
 * | `FloatingPanel` (`size="lg"`, 560px) | non-modal, resizável, coexiste | o usuário compara com a lista atrás, ou percorre linha por linha |
 * | `Drawer` | bottom-sheet (vaul) | mobile-first, ou gesto de arrastar |
 *
 * Em qualquer um: `title`/`description`/`titleIcon` são props da casca — o header de
 * identidade daqui é o **corpo**, não o header do painel. Se a casca já mostra o nome no
 * título, corte a primeira linha deste bloco em vez de repetir.
 *
 * ## Regras do DS que este bloco carrega (e que copiar sem elas quebra)
 *
 * - **Aba dentro de painel vem `fullWidth`, na variante default (`segmented`).** É regra
 *   declarada no `USAGE.md` do `Panel` e do `FloatingPanel`: em 560px a variante `line`
 *   vira um trilho curto que lê como fragmento, e sem `fullWidth` as abas se encolhem num
 *   canto. `line` só se houver um `segmented` num nível acima.
 * - **`KpiGroup divided`, não três cards soltos.** O painel já é uma superfície; três
 *   cards dentro dele é card-dentro-de-card (a mesma L-050 que proíbe `PropsTable` dentro
 *   de `ExampleSection`). `divided` faz uma faixa só, com divisórias.
 * - **`Kpi size="sm"`** (valor em `stat-sm`, 20px). O `md` de dashboard tem 24px e some a
 *   hierarquia contra o nome do registro, que é `title`. Painel é estreito: 3 colunas de
 *   20px cabem, 3 de 24px começam a quebrar número.
 * - **Número com `tabular-nums`** — sem isso os dígitos dançam entre as três colunas e
 *   entre as linhas da tabela de faturas.
 * - **`tone` do delta é decisão sua, não do sinal.** Aqui `Em aberto` subindo é ruim, então o
 *   delta `+1` vai `tone="danger"`. `signed` derivaria o tom do sinal, pintaria verde e
 *   mentiria — o mesmo gotcha que o `USAGE.md` do `Kpi` registra ("subir nem sempre é bom").
 * - **Status é `Chip`**, não texto colorido na unha: ele já resolve tom, contraste e
 *   altura de linha.
 *
 * ## Cuidado ao adaptar
 *
 * - **As abas aqui trocam conteúdo de verdade** (`TabsContent`), diferente do
 *   `dsgreen-chart-1`, onde elas eram só composição visual. Se o seu caso tem um recorte
 *   só, **remova as abas** — aba com um item é moldura sem função.
 * - **As métricas têm que ser do REGISTRO**, não da tela. "Total de clientes" não é métrica
 *   deste painel; "faturas em aberto deste cliente" é. Métrica de tela pertence ao
 *   dashboard ou ao topo da lista.
 * - **Ligue ao estado real:** `open`/`onOpenChange` da casca vêm da linha selecionada da
 *   tabela, e `onEditar`/`onExcluir` são handlers seus. As `SECOES` e as métricas viram
 *   derivação do registro carregado. O `useState` daqui é só da aba ativa e sobrevive à
 *   adaptação.
 * - **`FloatingPanelField` cai pra `—` quando o valor é vazio** — não escreva "N/A" nem
 *   condicione a linha; passe o valor e deixe o componente resolver.
 */

/** Fixture do bloco. Fica aqui de propósito: bloco é auto-contido, então quem copia vê a
 *  forma do dado esperado sem inferir do render. */
const REGISTRO = {
  nome: "Padaria Estrela do Sul",
  documento: "12.345.678/0001-90",
  status: { label: "Ativo", tone: "success" as const },
  desde: "Março de 2024",
};

const METRICAS = [
  { label: "Consumo médio", value: "1.240", hint: "kWh/mês", delta: "+8%", tone: "success" as const },
  { label: "Economia", value: "R$ 3.180", hint: "acumulada", delta: "+12%", tone: "success" as const },
  { label: "Em aberto", value: "R$ 892", hint: "2 faturas", delta: "+1", tone: "danger" as const },
];

const SECOES = [
  {
    titulo: "Dados do contrato",
    campos: [
      { label: "Plano", value: "Compensação 100%" },
      { label: "Distribuidora", value: "Cemig" },
      { label: "Titular", value: "Marina Duarte" },
      { label: "Início", value: "12/03/2024" },
    ],
  },
  {
    titulo: "Endereço da unidade",
    campos: [
      { label: "Logradouro", value: "Rua das Acácias, 412" },
      { label: "Bairro", value: "Santa Efigênia" },
      { label: "Cidade", value: "Belo Horizonte — MG" },
      { label: "CEP", value: "30240-070" },
    ],
  },
];

const FATURAS = [
  { competencia: "Ago/2026", valor: "R$ 446,20", situacao: "Em aberto", tone: "warning" as const },
  { competencia: "Jul/2026", valor: "R$ 445,80", situacao: "Em aberto", tone: "warning" as const },
  { competencia: "Jun/2026", valor: "R$ 431,10", situacao: "Paga", tone: "success" as const },
];

const HISTORICO = [
  { quando: "24/08/2026", oque: "Fatura de julho gerada" },
  { quando: "02/08/2026", oque: "Titularidade confirmada pela distribuidora" },
  { quando: "18/07/2026", oque: "Plano alterado para Compensação 100%" },
];

export function RegistroComMetricasEAbas() {
  const [aba, setAba] = useState("faturas");

  return (
    // A largura é a da casca: `Panel size="md"` e `FloatingPanel size="lg"` dão 560px, e o
    // token mais próximo do DS é `drawer-lg` (640px). Dentro do painel real este wrapper
    // não existe — o conteúdo herda a largura de lá.
    <div className="flex w-full max-w-drawer-lg flex-col gap-gp-2xl rounded-radius-xl border border-border-default bg-bg-surface p-pad-3xl">
      {/* 1. Identidade + ações do registro inteiro */}
      <div className="flex flex-wrap items-start justify-between gap-gp-lg">
        <div className="flex min-w-0 flex-col gap-gp-xs">
          <div className="flex flex-wrap items-center gap-gp-md">
            <span className="text-title-md text-fg-default">{REGISTRO.nome}</span>
            <Chip color={REGISTRO.status.tone} size="sm">
              {REGISTRO.status.label}
            </Chip>
          </div>
          <span className="text-body-sm tabular-nums text-fg-muted">
            {REGISTRO.documento} · cliente desde {REGISTRO.desde}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-gp-md">
          <Button variant="outline" size="sm" iconLeft={<Pencil />}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" color="critical" iconLeft={<Trash2 />}>
            Excluir
          </Button>
        </div>
      </div>

      {/* 2. Métricas do REGISTRO — faixa única com divisórias, nunca 3 cards soltos */}
      <KpiGroup columns={3} divided>
        {METRICAS.map((m) => (
          <Kpi
            key={m.label}
            size="sm"
            label={m.label}
            value={<span className="tabular-nums">{m.value}</span>}
            hint={m.hint}
            delta={<KpiDelta value={m.delta} tone={m.tone} direction="up" />}
          />
        ))}
      </KpiGroup>

      {/* 3. Detalhamento geral — seções colapsáveis é o que deixa ter muitos campos */}
      <div className="flex flex-col">
        {SECOES.map((s) => (
          <FloatingPanelSection key={s.titulo} title={s.titulo}>
            {s.campos.map((c) => (
              <FloatingPanelField key={c.label} label={c.label} value={c.value} />
            ))}
          </FloatingPanelSection>
        ))}
      </div>

      {/* 4. Abas internas — DEPOIS do geral, porque aba esconde conteúdo */}
      <Tabs value={aba} onValueChange={setAba} fullWidth>
        <TabsList>
          <TabsTrigger value="faturas">Faturas</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="faturas" className="flex flex-col gap-gp-md pt-pad-xl">
          {FATURAS.map((f) => (
            <div
              key={f.competencia}
              className="flex items-center justify-between gap-gp-md border-b border-border-subtle pb-pad-md last:border-b-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-gp-md">
                <Receipt className="size-icon-sm shrink-0 text-fg-subtle" />
                <span className="truncate text-body-sm text-fg-default">{f.competencia}</span>
              </div>
              <div className="flex shrink-0 items-center gap-gp-lg">
                <span className="text-body-sm tabular-nums text-fg-default">{f.valor}</span>
                <Chip color={f.tone} size="sm">
                  {f.situacao}
                </Chip>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="historico" className="flex flex-col gap-gp-lg pt-pad-xl">
          {HISTORICO.map((h) => (
            <div key={h.quando} className="flex gap-gp-lg text-body-sm">
              <span className="shrink-0 tabular-nums text-fg-muted">{h.quando}</span>
              <span className="min-w-0 text-fg-default">{h.oque}</span>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="documentos" className="pt-pad-xl">
          <div className="flex flex-col items-center gap-gp-md py-pad-4xl text-center">
            <FileText className="size-icon-lg text-fg-subtle" />
            <span className="text-body-sm text-fg-default">Nenhum documento anexado</span>
            <span className="text-caption-md text-fg-muted">
              Contrato e conta de energia aparecem aqui quando enviados
            </span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
