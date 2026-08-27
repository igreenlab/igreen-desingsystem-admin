import { useState } from "react";
import { Building2, FileText, Pencil, Receipt } from "lucide-react";
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
import { Kpi, KpiGroup } from "@/components/ui/Kpi";
import { Panel } from "@/components/ui/Panel";

export const BLOCK = {
  id: "dsgreen-paneldetail-1",
  nome: "Painel de detalhe do registro com métricas e abas",
  descricao:
    "Painel lateral aberto a partir de uma linha de tabela: identidade no header, métricas do registro, campos em seções colapsáveis, abas internas pros recortes profundos e ações no footer. Mesmo padrão dos painéis de detalhe do Virtual Office e do CRUD de clientes.",
  usa: [
    "Panel (side=\"right\", size=\"md\", title + description + footer)",
    "KpiGroup (columns=3, divided) + Kpi (size=\"sm\")",
    "FloatingPanelSection + FloatingPanelField",
    "Tabs (fullWidth, variante default)",
    "Chip · Button",
  ],
} as const;

/**
 * dsgreen-paneldetail-1 — painel de detalhe de um registro, aberto da linha da tabela.
 *
 * ## O que este bloco resolve
 *
 * Pedindo "abre um painel com o detalhe do cliente", sai uma pilha de `label: valor` —
 * correta e ilegível a partir do 12º campo. O que falta não é componente, é **ordem**, e
 * **onde cada coisa mora**: o painel tem header, corpo e footer com papéis distintos, e
 * jogar tudo no corpo é o erro que faz o resultado parecer improvisado.
 *
 * | zona | o que vai | por que |
 * |---|---|---|
 * | **header** (`title`/`description`) | nome do registro + identificador | é o que responde "de quem é este painel"; fica fixo no scroll |
 * | corpo, 1ª faixa | **métricas** do registro | responde "como este registro está?", que é a pergunta de quem abriu — vem antes dos campos, que respondem "quais são os dados dele" |
 * | corpo, 2ª faixa | campos em **seções colapsáveis** | é o colapso que permite ter 20 campos sem obrigar a rolar 20 |
 * | corpo, 3ª faixa | **abas internas** | depois do geral, porque aba esconde conteúdo: o que está sempre visível é o que sempre se olha |
 * | **footer** | Fechar + ação primária | ações do registro inteiro, sempre alcançáveis (o footer é sticky) |
 *
 * Isso espelha os painéis de detalhe reais: `MapaClienteDetailPanel` e `DetailPanel` do
 * Virtual Office, e o `DetailDrawer` do `clientes-showcase`. Nos três a identidade está no
 * header e as ações no footer — **nenhum** deles põe botão de ação solto no corpo.
 *
 * ## As três cascas, e por que esta usa `Panel`
 *
 * `Panel`, `FloatingPanel` e `Drawer` são todos superfície lateral; a diferença é
 * **comportamento**, não desenho — o corpo daqui é o mesmo nos três:
 *
 * | casca | comportamento | quando |
 * |---|---|---|
 * | **`Panel`** (esta) | modal, com backdrop | o detalhe é a tarefa; a lista atrás pode esperar |
 * | `FloatingPanel` | non-modal, resizável, maximizável | o usuário compara com a lista atrás, ou percorre linha por linha. Ganha `titleSlot` (avatar + chip no header) e `headerActions` |
 * | `Drawer` | bottom-sheet (vaul) | mobile-first, ou gesto de arrastar |
 *
 * Pra trocar pelo `FloatingPanel`: `bodyPadded={false}` no lugar do `-mx-pad-3xl` de baixo,
 * e a identidade sobe pro `titleSlot` (avatar + chip no header) com as ações de ícone em
 * `headerActions` — é o desenho do `MapaClienteDetailPanel`.
 *
 * ## A única classe de ajuste, e por que ela existe
 *
 * `-mx-pad-3xl` no bloco das seções. O `PanelBody` tem `py-pad-4xl px-pad-3xl` (24/20px),
 * calibrado pra **seções de formulário**; as seções de DETALHE
 * (`FloatingPanelSection`) trazem o próprio padding de 18px e uma **divisória de ponta a
 * ponta**, que dentro de um body com 20px pararia a 20px da borda. A margem negativa
 * devolve a borda pro limite do painel; as outras faixas (métricas, abas) ficam com o
 * padding do body, que é o que elas querem.
 *
 * ⚠️ **Não use composição manual (`PanelRoot`/`PanelContent`) pra resolver isso.** O
 * `<Panel>` all-in-one monta `SheetPrimitive.Content` direto, com as classes de container,
 * o mapa de largura e a animação de slide por `side` — reproduzir aquilo num bloco seria
 * copiar internals do componente, exatamente o que a §4.1 proíbe. É por esse motivo que o
 * `FloatingPanel` ganhou `bodyPadded` como prop: no `Panel` o equivalente é esta margem.
 *
 * ## Regras do DS que este bloco carrega (e que copiar sem elas quebra)
 *
 * - **Aba dentro de painel vem `fullWidth`, na variante default (`segmented`).** Regra
 *   declarada no `USAGE.md` do `Panel` e do `FloatingPanel`: em 560px o `line` vira um
 *   trilho curto que lê como fragmento, e sem `fullWidth` as abas se encolhem num canto.
 * - **`KpiGroup divided`, não três cards soltos.** O painel já é uma superfície; três cards
 *   dentro dele é card-dentro-de-card (a mesma L-050 que proíbe `PropsTable` dentro de
 *   `ExampleSection`). `divided` faz uma faixa só, com divisórias.
 * - **`Kpi size="sm"`** (valor em `stat-sm`, 20px). O `md` de dashboard tem 24px e briga com
 *   o título do header.
 * - **Métrica em painel vai SEM `delta`** — e isto é medido, não gosto. Em `size="md"` (560px)
 *   com `columns={3}`, cada célula fica com **172px** e `p-pad-3xl` de cada lado deixa
 *   **132px de conteúdo**: `R$ 3.180` + a pílula do delta não cabe e quebra pra segunda
 *   linha, enquanto `1.240` cabe — o resultado é uma faixa com alturas desiguais, que foi
 *   exatamente o que reprovou a primeira versão deste bloco. Quem precisa do delta usa
 *   **`columns={2}`**. A unidade vai no `hint`, que sempre cabe.
 * - ⚠️ **`KpiGroup columns` é responsivo ao VIEWPORT, não ao container.** As classes são
 *   `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` — breakpoint de tela. Dentro de um painel de
 *   560px em desktop, `columns={3}` continua dando 3 colunas: a estreiteza do painel é
 *   invisível pro grid. Não conte com adaptação automática aqui; escolha o número de colunas
 *   pela largura do PAINEL.
 * - **Número com `tabular-nums`** — sem isso os dígitos dançam entre as colunas do KPI e
 *   entre as linhas de fatura.
 * - **Status é `Chip`** dentro de um `FloatingPanelField`, igual ao `MapaClienteDetailPanel`.
 *   Não é texto colorido na unha.
 * - **Footer não precisa de `fullWidth` nos botões** — o `PanelFooter` já faz os botões
 *   crescerem lado a lado e empilharem quando não cabem.
 *
 * ## Cuidado ao adaptar
 *
 * - **O botão daqui é do EXEMPLO.** No seu CRUD quem abre o painel é a linha selecionada da
 *   tabela: `open={!!linhaSelecionada}` e `onOpenChange={(o) => !o && limparSelecao()}`.
 * - **As abas trocam conteúdo de verdade** (`TabsContent`), diferente do `dsgreen-chart-1`,
 *   onde eram só composição visual. Um recorte só → **remova as abas**: aba com um item é
 *   moldura sem função.
 * - **As métricas têm que ser do REGISTRO**, não da tela. "Total de clientes" não é métrica
 *   deste painel; "faturas em aberto deste cliente" é. Métrica de tela pertence ao dashboard
 *   ou ao topo da lista.
 * - **`FloatingPanelField` cai pra `—` quando o valor é vazio** — não escreva "N/A" nem
 *   condicione a linha; passe o valor e deixe o componente resolver.
 */

/** Fixture do bloco. Fica aqui de propósito: bloco é auto-contido, então quem copia vê a
 *  forma do dado esperado sem inferir do render. */
const REGISTRO = {
  nome: "Padaria Estrela do Sul",
  documento: "12.345.678/0001-90",
  desde: "Março de 2024",
};

const METRICAS = [
  { label: "Consumo médio", value: "1.240", hint: "kWh/mês" },
  { label: "Economia", value: "R$ 3.180", hint: "acumulada no ano" },
  { label: "Em aberto", value: "R$ 892", hint: "2 faturas" },
];

const FATURAS = [
  { competencia: "Ago/2026", valor: "R$ 446,20", situacao: "Em aberto", color: "warning" as const },
  { competencia: "Jul/2026", valor: "R$ 445,80", situacao: "Em aberto", color: "warning" as const },
  { competencia: "Jun/2026", valor: "R$ 431,10", situacao: "Paga", color: "success" as const },
];

const HISTORICO = [
  { quando: "24/08/2026", oque: "Fatura de julho gerada" },
  { quando: "02/08/2026", oque: "Titularidade confirmada pela distribuidora" },
  { quando: "18/07/2026", oque: "Plano alterado para Compensação 100%" },
];

export function PainelDeDetalheDoRegistro() {
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState("faturas");

  return (
    <>
      {/* No CRUD real este botão não existe: quem abre o painel é a linha selecionada. */}
      <Button variant="outline" color="secondary" onClick={() => setAberto(true)}>
        Ver detalhe do cliente
      </Button>

      <Panel
        open={aberto}
        onOpenChange={setAberto}
        side="right"
        size="md"
        title={REGISTRO.nome}
        description={`${REGISTRO.documento} · cliente desde ${REGISTRO.desde}`}
        titleIcon={Building2}
        footer={
          <>
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setAberto(false)}
            >
              Fechar
            </Button>
            <Button variant="filled" size="sm" iconLeft={<Pencil />}>
              Editar
            </Button>
          </>
        }
      >
        {/* 1. Métricas do REGISTRO — faixa única com divisórias, nunca 3 cards soltos */}
        <KpiGroup columns={3} divided>
          {METRICAS.map((m) => (
            <Kpi
              key={m.label}
              size="sm"
              label={m.label}
              value={<span className="tabular-nums">{m.value}</span>}
              hint={m.hint}
            />
          ))}
        </KpiGroup>

        {/* 2. Campos em seções colapsáveis — o padrão de detalhe do DS.
               `-mx-pad-3xl` cancela o padding horizontal do PanelBody: a divisória da seção
               é de ponta a ponta por desenho, e dentro do body padded ela pararia a 20px da
               borda. Ver o bloco "A única classe de ajuste" no JSDoc. */}
        <div className="-mx-pad-3xl border-t border-border-default">
          <FloatingPanelSection title="Dados do contrato">
            <FloatingPanelField
              label="Status"
              value={
                <Chip color="success" variant="soft" size="sm">
                  Ativo
                </Chip>
              }
            />
            <FloatingPanelField label="Plano" value="Compensação 100%" />
            <FloatingPanelField label="Distribuidora" value="Cemig" />
            <FloatingPanelField label="Titular" value="Marina Duarte" />
            <FloatingPanelField
              label="Início"
              value={<span className="tabular-nums">12/03/2024</span>}
            />
          </FloatingPanelSection>

          <FloatingPanelSection title="Endereço da unidade">
            <FloatingPanelField label="Logradouro" value="Rua das Acácias, 412" />
            <FloatingPanelField label="Bairro" value="Santa Efigênia" />
            <FloatingPanelField label="Cidade" value="Belo Horizonte — MG" />
            <FloatingPanelField
              label="CEP"
              value={<span className="tabular-nums">30240-070</span>}
            />
          </FloatingPanelSection>
        </div>

        {/* 3. Abas internas — DEPOIS do geral, porque aba esconde conteúdo */}
        <div>
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
                    <span className="truncate text-body-sm text-fg-default">
                      {f.competencia}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-gp-lg">
                    <span className="text-body-sm tabular-nums text-fg-default">
                      {f.valor}
                    </span>
                    <Chip color={f.color} variant="soft" size="sm">
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
                <span className="text-body-sm text-fg-default">
                  Nenhum documento anexado
                </span>
                <span className="text-caption-md text-fg-muted">
                  Contrato e conta de energia aparecem aqui quando enviados
                </span>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Panel>
    </>
  );
}
