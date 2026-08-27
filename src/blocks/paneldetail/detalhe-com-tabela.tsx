import { useState } from "react";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Mail,
  MapPin,
  Pencil,
  Phone,
  TrendingUp,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/components/ui/Table";

export const BLOCK = {
  id: "dsgreen-paneldetail-3",
  nome: "Detalhe largo com métricas e tabela",
  descricao:
    "Painel de detalhe LARGO (720px): identidade e propriedades em duas colunas no topo, faixa de métricas do período, e uma tabela curta escopada no registro (últimos lançamentos) com navegação de período e exportar. Pra quando o detalhe inclui uma série de linhas — em 560px isso viraria scroll horizontal.",
  usa: [
    "FloatingPanel (size=\"xl\" 720px, titleSlot + headerActions + maximizable + resizable)",
    "Table + TableHead/TableHeadCell/TableBody/TableRow/TableCell (o primitivo, NÃO o DataTable)",
    "Avatar · Chip (soft) · Button (icon-sm e sm)",
  ],
} as const;

/**
 * dsgreen-paneldetail-3 — detalhe largo, com métricas e tabela.
 *
 * ## Quando este, e não o `-1` nem o `-2`
 *
 * O que decide é **se o detalhe contém uma série de linhas**:
 *
 * | | conteúdo | largura |
 * |---|---|---|
 * | `-1` | registro com muitos campos, em seções colapsáveis | `lg` (560px) |
 * | `-2` | tarefa: poucas propriedades + abas de conteúdo que cresce | `lg` (560px) |
 * | **`-3`** (este) | **campos + métricas + TABELA** escopada no registro | **`xl` (720px)** |
 *
 * ⚠️ **A largura não é gosto, é requisito da tabela.** Cinco colunas de dados precisam de
 * ~640px úteis; em `lg` (560px, ~524 úteis) a mesma tabela entra em scroll horizontal — e
 * tabela que rola de lado dentro de painel é pior que abrir a tela cheia, porque o usuário
 * perde a coluna de referência ao rolar. Se não couber em `xl`, **o detalhe não é painel**: é
 * tela própria.
 *
 * ## Por que `Table` e não `DataTable`
 *
 * O `DataTable` traz toolbar, filtros, visões salvas, paginação e virtualização. Dentro de um
 * painel isso **compete com o painel**: dois níveis de filtro na tela, dois lugares de
 * paginação, e o toolbar dele encostado no header do painel. Aqui a tabela é um **recorte
 * curto e fechado** — os últimos N lançamentos do período — então o primitivo `Table` é o
 * certo.
 *
 * Corolário: **se você precisar de filtro, ordenação persistente ou paginação nessa tabela,
 * ela deixou de ser recorte.** Aí o lugar dela é uma tela com `DataTable`, e o painel volta a
 * ser só o detalhe.
 *
 * ## O topo em duas colunas só existe por causa do `xl`
 *
 * São duas colunas de propriedades **de igual peso** (4 + 4), cada uma com ~320px em 720px —
 * o que cabe rótulo de 104px + valor sem truncar. Não copie este arranjo pra um painel `lg`:
 * ali cada coluna cairia pra ~250px e os valores começariam a quebrar. Em `lg` o desenho certo
 * é o do `-2`: lista plana, uma propriedade por linha.
 *
 * ⚠️ E **nenhuma das duas leva card em volta.** Dado do mesmo nível não ganha superfície
 * própria — ver a nota no `PROPRIEDADES`.
 *
 * ## Regras do DS que este bloco carrega (e que copiar sem elas quebra)
 *
 * - **`width` do `TableHeadCell` e do `TableCell` da mesma coluna têm que ser IGUAIS.** O
 *   `Table` do DS posiciona por largura declarada, não por `<colgroup>`: divergir desalinha
 *   header e corpo silenciosamente. Aqui as larguras vivem numa constante única (`COLUNAS`),
 *   que é o que impede a divergência.
 * - **Faixa de métricas com `divide-x` + `divide-border-default`.** `divide-x` cru é só
 *   largura: sem classe de cor a divisória cai em `currentColor` (L-039 aplicada ao `divide`).
 * - **Ação de ícone é `variant="soft"` + `aria-label`.** O maximize e o close que o
 *   `FloatingPanel` renderiza são `soft`+`secondary`; `ghost` no meio da fileira fica sem
 *   container e lê como desabilitada.
 * - **Número e data com `tabular-nums`.** Numa tabela isso não é cosmético: sem ele os dígitos
 *   dançam entre as linhas e a coluna deixa de ser varrível.
 * - **Status é `Chip`**, nunca `<span>` estilizado.
 * - **Wrapper de `gap` é obrigatório no corpo.** O body do `FloatingPanel` **não tem gap entre
 *   filhos** (`row-gap: normal`, medido) — só padding. Sem o wrapper, topo, métricas e tabela
 *   ficam com 0px entre si. Não confunda com o `PanelBody` do `Panel`, que tem gap embutido.
 *
 * ## Cuidado ao adaptar
 *
 * - **O botão daqui é do EXEMPLO.** Na tela real quem abre o painel é a linha clicada.
 * - **A navegação de período não é decorativa.** Se `‹ ›` não trocam o dado, tire — controle
 *   que não controla é pior que ausência de controle.
 * - **`Exportar` exporta o RECORTE, não a base.** O usuário assume que o botão dentro do
 *   painel leva o que ele está vendo; exportar tudo é surpresa desagradável. Se o export é da
 *   base inteira, o botão pertence à tela, não ao painel.
 * - **Linha da tabela clicável?** Só se levar a algum lugar. `TableRow` tem `onClick` e
 *   variante `clickable` — cursor de mão numa linha inerte é promessa falsa.
 */

/** Fixture do bloco. Fica aqui de propósito: bloco é auto-contido, então quem copia vê a
 *  forma do dado esperado sem inferir do render. */
const LICENCIADO = {
  nome: "Marina Duarte",
  iniciais: "MD",
  hex: "#0F766E",
  codigo: "LIC-04812",
  papel: "Licenciada Green",
  status: "Ativa",
};

/**
 * Propriedades em DUAS colunas de igual peso — é o desenho de ficha, e é o que o painel `xl`
 * permite.
 *
 * ⚠️ A 1ª versão tinha um **card "Contato"** com borda e fundo à esquerda e a lista de
 * propriedades à direita. Ficou ruim, e a razão é estrutural: aquele card criava uma segunda
 * hierarquia visual pra dados do MESMO nível — e-mail não é mais importante que cargo. Card
 * dentro do topo só se justifica pra algo que se destaque de verdade (um saldo, um alerta).
 * Aqui e-mail e telefone são propriedades como as outras, com o mesmo ícone-rótulo-valor.
 */
const PROPRIEDADES: { icone: LucideIcon; label: string; valor: React.ReactNode }[][] = [
  [
    { icone: Briefcase, label: "Cargo", valor: "Licenciada Green" },
    { icone: Building2, label: "Escritório", valor: "Belo Horizonte — MG" },
    { icone: MapPin, label: "Atuação", valor: "Zona Sul e Centro" },
    { icone: CalendarDays, label: "Ativa desde", valor: <span className="tabular-nums">12/03/2024</span> },
  ],
  [
    {
      icone: Mail,
      label: "E-mail",
      valor: (
        <a
          href="mailto:marina.duarte@example.com"
          className="truncate text-fg-brand hover:underline"
        >
          marina.duarte@example.com
        </a>
      ),
    },
    {
      icone: Phone,
      label: "Telefone",
      valor: (
        <a
          href="tel:5531989012345"
          className="tabular-nums text-fg-brand hover:underline"
        >
          +55 31 98901-2345
        </a>
      ),
    },
    { icone: UserRound, label: "Gestor", valor: "Aline Castro" },
    { icone: FileText, label: "Contrato", valor: <span className="tabular-nums">CT-2024-0481</span> },
  ],
];

const METRICAS = [
  { icone: Users, label: "Clientes ativos", valor: "64", tom: "brand" as const },
  { icone: Zap, label: "kWh no mês", valor: "38.240", tom: "brand" as const },
  { icone: TrendingUp, label: "Comissão", valor: "R$ 4.812", tom: "brand" as const },
  { icone: CalendarDays, label: "Em análise", valor: "3", tom: "warning" as const },
];

/**
 * Larguras das colunas numa constante única — é isso que impede header e corpo de divergirem.
 *
 * Somam **678px**, que é exatamente a largura útil da linha num painel `xl`: 720 do painel
 * − 18 de gutter de cada lado − 1 de borda de cada lado do container. Medido, não calculado
 * de cabeça: a 1ª versão somava 644 e sobravam **34px vazios depois da coluna de Status**, que
 * lêem como coluna faltando.
 *
 * **A folga vai sempre pra coluna de TEXTO** (`cliente`), nunca pra uma de número: número tem
 * largura previsível e ganhar espaço não o ajuda; nome ganha caractere antes de truncar.
 */
const COLUNAS = {
  data: 92,
  cliente: 170,
  /* 128, não 112: a 112 o próprio HEADER truncava em "Distribuido…" — o rótulo é mais largo
     que os valores ("Cemig", "Energisa"). Dimensione a coluna pelo MAIOR entre header e
     conteúdo; header truncado lê como bug, não como economia de espaço. */
  distribuidora: 128,
  consumo: 80,
  comissao: 104,
  status: 104,
} as const;

const LANCAMENTOS = [
  { data: "02/09", cliente: "Padaria Estrela do Sul", distribuidora: "Cemig", consumo: "1.240", comissao: "R$ 186,00", status: "Pago", tom: "success" as const },
  { data: "05/09", cliente: "Mercearia Bom Preço", distribuidora: "Cemig", consumo: "890", comissao: "R$ 133,50", status: "Pago", tom: "success" as const },
  { data: "08/09", cliente: "Oficina do Marcos", distribuidora: "Cemig", consumo: "1.470", comissao: "R$ 220,50", status: "Pago", tom: "success" as const },
  { data: "11/09", cliente: "Auto Peças Duarte", distribuidora: "Energisa", consumo: "2.310", comissao: "R$ 346,50", status: "Em análise", tom: "warning" as const },
  { data: "14/09", cliente: "Pet Shop Amigo Fiel", distribuidora: "Cemig", consumo: "620", comissao: "R$ 93,00", status: "Pago", tom: "success" as const },
  { data: "17/09", cliente: "Studio Vitória", distribuidora: "Energisa", consumo: "540", comissao: "R$ 81,00", status: "Pago", tom: "success" as const },
  { data: "21/09", cliente: "Mercado Central 24h", distribuidora: "Cemig", consumo: "4.180", comissao: "R$ 627,00", status: "Pago", tom: "success" as const },
  { data: "23/09", cliente: "Clínica São Bento", distribuidora: "Cemig", consumo: "1.780", comissao: "R$ 267,00", status: "Em análise", tom: "warning" as const },
  { data: "26/09", cliente: "Escola Novo Saber", distribuidora: "Energisa", consumo: "2.940", comissao: "R$ 441,00", status: "Em análise", tom: "warning" as const },
  { data: "28/09", cliente: "Restaurante Aurora", distribuidora: "Cemig", consumo: "3.120", comissao: "R$ 468,00", status: "Atrasado", tom: "danger" as const },
];

const COR_DO_TOM = {
  brand: "text-fg-brand",
  warning: "text-fg-warning",
  danger: "text-fg-danger",
} as const;

/** Métrica compacta da faixa: ícone + valor na mesma linha, rótulo abaixo. */
function Metrica({
  icone: Icone,
  label,
  valor,
  tom,
}: {
  icone: LucideIcon;
  label: string;
  valor: string;
  tom: keyof typeof COR_DO_TOM;
}) {
  return (
    <div className="flex flex-col gap-gp-2xs p-pad-2xl">
      <div className={`flex items-center gap-gp-sm ${COR_DO_TOM[tom]}`}>
        <Icone className="size-icon-sm shrink-0" aria-hidden="true" />
        <span className="text-body-xl font-bold tabular-nums leading-none">{valor}</span>
      </div>
      <span className="text-caption-sm text-fg-muted">{label}</span>
    </div>
  );
}

export function DetalheComTabela() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* Na tela real este botão não existe: quem abre o painel é a linha clicada. */}
      <Button variant="outline" color="secondary" onClick={() => setAberto(true)}>
        Abrir detalhe da licenciada
      </Button>

      <FloatingPanel
        open={aberto}
        onOpenChange={setAberto}
        side="right"
        /* `xl` = 720px. Requisito da tabela, não preferência — ver o JSDoc. */
        size="xl"
        resizable
        maximizable
        resizableStorageKey="dsgreen-paneldetail-3.width"
        titleSlot={
          <div className="flex min-w-0 items-center gap-gp-md">
            <Avatar
              size="lg"
              colorHex={LICENCIADO.hex}
              className="shrink-0"
              aria-label={LICENCIADO.nome}
            >
              {LICENCIADO.iniciais}
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body-md font-semibold text-fg-default">
                {LICENCIADO.nome}
              </span>
              <span className="mt-[2px] flex items-center gap-gp-sm text-body-xs text-fg-muted">
                <span className="tabular-nums">{LICENCIADO.codigo}</span>
                <span className="opacity-50">·</span>
                <Chip color="success" variant="soft" size="sm">
                  {LICENCIADO.status}
                </Chip>
              </span>
            </div>
          </div>
        }
        headerActions={
          <Button variant="soft" color="secondary" size="icon-sm" aria-label="Editar licenciada">
            <Pencil />
          </Button>
        }
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
            <Button variant="filled" size="sm">
              Abrir ficha completa
            </Button>
          </>
        }
      >
        {/* Wrapper de gap OBRIGATÓRIO: o body do FloatingPanel não tem gap entre filhos. */}
        <div className="flex flex-col gap-gp-3xl">
          {/* 1. Ficha em duas colunas de igual peso — só cabe porque o painel é `xl`. Em `lg`
                 viraria lista plana de uma coluna (ver o `-2`). Sem card em volta: dado do
                 mesmo nível não ganha superfície própria. */}
          <div className="grid grid-cols-2 gap-x-gp-4xl">
            {PROPRIEDADES.map((coluna, i) => (
              <div key={i} className="grid grid-cols-[104px_1fr] items-center gap-x-gp-md">
                {coluna.map(({ icone: Icone, label, valor }) => (
                  <div key={label} className="contents">
                    {/* `min-h-form-sm` (32px) nas duas células: sem piso, a linha tem altura
                        do conteúdo e o ritmo da ficha fica irregular. */}
                    <div className="flex min-h-form-sm items-center gap-gp-sm text-body-sm text-fg-muted">
                      <Icone
                        className="size-icon-sm shrink-0 text-fg-subtle"
                        aria-hidden="true"
                      />
                      <span className="truncate">{label}</span>
                    </div>
                    <div className="flex min-h-form-sm min-w-0 items-center text-body-sm text-fg-default">
                      <span className="min-w-0 truncate">{valor}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* 2. Faixa de métricas do período. `divide-border-default` é obrigatório: `divide-x`
                 cru é só largura e a divisória cairia em `currentColor` (L-039). */}
          <div className="grid grid-cols-4 divide-x divide-border-default overflow-hidden rounded-radius-lg border border-border-default bg-bg-surface">
            {METRICAS.map((m) => (
              <Metrica key={m.label} {...m} />
            ))}
          </div>

          {/* 3. Tabela do recorte: cabeçalho de período + exportar, e a série. */}
          <div className="flex flex-col gap-gp-lg">
            <div className="flex flex-wrap items-center justify-between gap-gp-md">
              <div className="flex items-center gap-gp-md">
                <span className="text-body-md font-semibold text-fg-default">
                  Setembro 2026
                </span>
                {/* Se `‹ ›` não trocarem o dado de verdade, tire: controle que não controla é
                    pior que ausência de controle. */}
                <div className="flex items-center gap-gp-xs">
                  <Button
                    variant="soft"
                    color="secondary"
                    size="icon-xs"
                    aria-label="Mês anterior"
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="soft"
                    color="secondary"
                    size="icon-xs"
                    aria-label="Mês seguinte"
                  >
                    <ChevronRight />
                  </Button>
                </div>
              </div>
              {/* Exporta o RECORTE (o mês visível), não a base — ver "Cuidado ao adaptar". */}
              <Button variant="outline" color="secondary" size="sm" iconLeft={<Download />}>
                Exportar mês
              </Button>
            </div>

            {/* ⚠️ **Sem wrapper de borda aqui.** O `Table` do DS já É um card: ele traz
                `bg-bg-table`, `border border-border-default`, raio de **14px** e
                `overflow-hidden` no próprio container. Eu tinha envolvido ele num
                `rounded-radius-lg border` (10px), e o resultado eram **dois raios
                concêntricos** — 14px dentro de 10px — com o canto de dentro estourando o de
                fora. Lê como bug de render, e é card-dentro-de-card: a mesma L-050 que proíbe
                `PropsTable` dentro de `ExampleSection`.

                Antes de embrulhar qualquer componente do DS numa superfície, verifique se ele
                já tem a sua. */}
            {/* `density="compact"` = linha de **40px** contra 56 do `standard`. É prop do
                  componente, não fonte reduzida na mão: a tipografia da tabela já é
                  `text-body-sm` (13px), o menor body do projeto. Numa série curta dentro de
                  painel, compact é o certo — cabe mais linha sem o corpo do painel rolar. */}
              <Table density="compact" ariaLabel="Lançamentos do mês">
                <TableHead>
                  <TableHeadCell field="data" width={COLUNAS.data}>
                    Data
                  </TableHeadCell>
                  <TableHeadCell field="cliente" width={COLUNAS.cliente}>
                    Cliente
                  </TableHeadCell>
                  <TableHeadCell field="distribuidora" width={COLUNAS.distribuidora}>
                    Distribuidora
                  </TableHeadCell>
                  <TableHeadCell field="consumo" width={COLUNAS.consumo} align="right">
                    kWh
                  </TableHeadCell>
                  <TableHeadCell field="comissao" width={COLUNAS.comissao} align="right">
                    Comissão
                  </TableHeadCell>
                  <TableHeadCell field="status" width={COLUNAS.status}>
                    Status
                  </TableHeadCell>
                </TableHead>

                <TableBody>
                  {LANCAMENTOS.map((l) => (
                    <TableRow key={l.data}>
                      {/* ⚠️ O `width` de cada célula tem que ser o MESMO do head — o Table do
                          DS posiciona por largura declarada. Daí a constante `COLUNAS`. */}
                      <TableCell field="data" width={COLUNAS.data}>
                        <span className="tabular-nums">{l.data}</span>
                      </TableCell>
                      <TableCell field="cliente" width={COLUNAS.cliente} ellipsis>
                        {l.cliente}
                      </TableCell>
                      <TableCell field="distribuidora" width={COLUNAS.distribuidora} ellipsis>
                        {l.distribuidora}
                      </TableCell>
                      <TableCell field="consumo" width={COLUNAS.consumo} align="right">
                        <span className="tabular-nums">{l.consumo}</span>
                      </TableCell>
                      <TableCell field="comissao" width={COLUNAS.comissao} align="right">
                        <span className="tabular-nums">{l.comissao}</span>
                      </TableCell>
                      <TableCell field="status" width={COLUNAS.status}>
                        <Chip color={l.tom} variant="soft" size="sm">
                          {l.status}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        </div>
      </FloatingPanel>
    </>
  );
}
