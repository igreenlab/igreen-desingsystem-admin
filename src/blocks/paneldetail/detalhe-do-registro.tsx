import { useState } from "react";
import { Check, Circle, MessageCircle, Pencil, PiggyBank, Receipt } from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import {
  FloatingPanel,
  FloatingPanelField,
  FloatingPanelSection,
} from "@/components/ui/FloatingPanel";

export const BLOCK = {
  id: "dsgreen-paneldetail-1",
  nome: "Painel de detalhe do registro",
  descricao:
    "Painel lateral aberto a partir de uma linha de tabela: header com avatar + nome + código e status, ações de ícone e maximizar; métricas em cards compactos; e os dados em seções colapsáveis — inclusive as que não são label:valor (conta bancária com marca, métodos em chips, e-mail e telefone acionáveis, gestor com avatar). Ação primária no footer. Mesmo padrão dos painéis de detalhe do Virtual Office e do CRUD de clientes.",
  usa: [
    "FloatingPanel (side=\"right\", size=\"lg\", titleSlot + headerActions + maximizable + resizable + bodyPadded={false})",
    "FloatingPanelSection + FloatingPanelField",
    "MetricaCartoes — cards compactos próprios (ícone + valor + rótulo); NÃO o Kpi",
    "Avatar (colorHex, contraste WCAG automático)",
    "Chip (soft) · Button (icon-sm no header, sm no footer)",
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
 * | **header** (`titleSlot`) | avatar + nome + código · status | responde "de quem é este painel", e fica fixo no scroll |
 * | **header** (`headerActions`) | ações de ícone (editar, contatar) | ações frequentes e sem rótulo, à mão sem rolar |
 * | corpo, 1ª faixa | **métricas** do registro | responde "como este registro está?", que é a pergunta de quem abriu — vem antes dos campos, que respondem "quais são os dados dele" |
 * | corpo, resto | campos em **seções colapsáveis** por assunto | é o colapso que permite ter 20 campos sem obrigar a rolar 20 |
 * | **footer** | Fechar + ação primária | a ação que fecha a tarefa, sempre alcançável (footer é sticky) |
 *
 * **Não há abas.** Elas estavam aqui e saíram: aba esconde conteúdo, e num painel onde o corpo
 * já é uma pilha de seções colapsáveis, o colapso **é** o mecanismo de esconder. Ter os dois é
 * dizer a mesma coisa de duas formas, e o usuário passa a ter que descobrir em qual das duas o
 * dado está. Se um recorte for volumoso de verdade (extrato com 200 linhas), ele não é seção
 * nem aba: é outra tela.
 *
 * ## Por que `FloatingPanel` e não `Panel` — foi o HEADER que decidiu
 *
 * As duas primeiras versões deste bloco usaram `Panel`, e o header saía fora do padrão dos
 * painéis reais. A causa é de API, não de estilo: o `Panel` aceita `title` e `description`
 * como **string**, e o header dos painéis de referência tem avatar, `Chip` de status inline e
 * botões de ícone — nada disso cabe numa string. O `FloatingPanel` expõe exatamente isso:
 *
 * | o que o header precisa | prop |
 * |---|---|
 * | avatar + nome + código · status | `titleSlot` (JSX, substitui title/description) |
 * | 1–2 ações de ícone | `headerActions` (entram à esquerda do maximize/close) |
 * | expandir | `maximizable` — o botão é do componente, não se escreve |
 * | fechar | nativo (o X sempre está lá; `hideClose` remove) |
 *
 * **Bônus:** `bodyPadded={false}` resolveu, com uma prop, o `-mx-pad-3xl` que a versão em
 * `Panel` precisava pra fazer a divisória das seções chegar na borda. A prop existe justamente
 * pra este caso — seção de detalhe é edge-to-edge por desenho.
 *
 * ### E as outras duas cascas
 *
 * `Panel`, `FloatingPanel` e `Drawer` são todos superfície lateral; a diferença é
 * **comportamento** — o corpo é o mesmo nos três:
 *
 * | casca | comportamento | quando |
 * |---|---|---|
 * | **`FloatingPanel`** (esta) | non-modal, resizável, maximizável, sem backdrop | detalhe que coexiste com a lista atrás: o usuário compara, ou percorre linha por linha |
 * | `Panel` | modal, com backdrop | o detalhe é a tarefa e a lista pode esperar. ⚠️ header só com strings |
 * | `Drawer` | bottom-sheet (vaul) | mobile-first, ou gesto de arrastar |
 *
 * ## Regras do DS que este bloco carrega (e que copiar sem elas quebra)
 *
 * - **`bodyPadded={false}` é obrigatório com `FloatingPanelSection`.** É regra declarada no
 *   `USAGE.md` do componente: a seção traz o próprio padding de 18px e uma divisória de ponta
 *   a ponta; com o body padded o padding soma e a divisória para longe da borda.
 * - **Campo que não é `label: valor` sai do `FloatingPanelField`.** Três casos aqui, e cada um
 *   tem um motivo medido: a **conta bancária** é entidade (marca + nome + agência/conta) e
 *   comprimida na coluna da direita ela trunca — vai numa linha de largura cheia; os
 *   **métodos** são itens discretos e viram `Chip`, não texto com vírgula; **e-mail e
 *   telefone** são ações (`mailto:`/`tel:`) e por isso levam cor de link.
 * - **`Avatar` com `colorHex` escolhe a cor do texto por contraste WCAG** (L-027). `#820AD1`
 *   do Nubank dá branco (6.2 : 1); `#FAE128` do BB daria preto (16.3 : 1). Nunca escreva
 *   `text-white` na unha num avatar de marca — em marca clara isso vira texto ilegível.
 * - **Ação de ícone precisa de `aria-label`.** Botão `size="icon-sm"` não tem texto: sem o
 *   label o leitor de tela anuncia "button" e pronto.
 * - **Toda ação do header é `variant="soft"`, nunca `ghost`.** O maximize e o close que o
 *   `FloatingPanel` renderiza são `soft`+`secondary`; uma ação `ghost` no meio da fileira fica
 *   sem container e lê como desabilitada ao lado das outras. O que diferencia é a **cor**
 *   (`secondary` neutro, `success` contato, `critical` destrutivo), não a ausência de fundo.
 * - **Métrica em painel NÃO é o `Kpi` do DS** — ver o JSDoc do `MetricaCartoes`. O `Kpi` é card
 *   de dashboard: medido aqui, 172×144px por célula, três delas comendo a primeira dobra do
 *   painel antes de qualquer campo. No painel a métrica é contexto, não o assunto.
 * - ⚠️ Se ainda assim usar `KpiGroup`: **`columns` é responsivo ao VIEWPORT, não ao
 *   container** (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). Num painel de 560px em desktop,
 *   `columns={3}` continua dando 3 colunas — a estreiteza do painel é invisível pro grid.
 * - **A métrica também é seção colapsável.** Uma gramática só no corpo: métricas, campos e
 *   tudo mais entram como `FloatingPanelSection`. Faixa solta acima das seções criava uma
 *   segunda gramática visual no mesmo painel.
 * - **Número com `tabular-nums`** — sem isso os dígitos dançam de um campo pro outro.
 * - **Se um dia voltar a ter aba aqui: `fullWidth`, variante default (`segmented`).** Regra do
 *   `USAGE.md` do `Panel` e do `FloatingPanel` — em 560px o `line` vira um trilho curto que lê
 *   como fragmento. (Este bloco não tem aba; ver a nota acima.)
 *
 * ## Cuidado ao adaptar
 *
 * - **O botão daqui é do EXEMPLO.** No seu CRUD quem abre o painel é a linha selecionada da
 *   tabela: `open={!!linhaSelecionada}` e `onOpenChange={(o) => !o && limparSelecao()}`.
 * - **`resizableStorageKey` só se o painel for recorrente.** Ele persiste a largura no
 *   `localStorage` — ótimo num painel que o usuário abre 50× por dia, ruído num painel raro.
 *   Use chave namespaced (`clientes.detail-panel.width`), senão dois painéis diferentes
 *   dividem a mesma largura.
 * - **As seções são por ASSUNTO, e o assunto é do seu domínio.** Empresa / Conta bancária /
 *   Financeiro / Contato / Gestão é o recorte de um cliente de energia; num painel de pedido
 *   seria Itens / Entrega / Pagamento. Não herde estes títulos — herde o critério: cada seção
 *   responde uma pergunta, e campo que não responde a pergunta da seção está na seção errada.
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
  iniciais: "PE",
  codigo: "CLI-2478",
  status: "Ativo",
  documento: "12.345.678/0001-90",
};

const METRICAS = [
  { icone: PiggyBank, label: "Economia no ano", value: "R$ 3.180", tom: "brand" as const },
  { icone: Receipt, label: "Em aberto", value: "R$ 892", tom: "danger" as const },
];

const CONTA = {
  banco: "Nubank",
  iniciais: "NU",
  hex: "#820AD1",
  agencia: "3849",
  conta: "18701-9",
};

const METODOS = ["PIX", "Boleto"];

const CONTATO = {
  email: "contato@estreladosul.com.br",
  telefone: "+55 31 98901-2345",
  local: "Belo Horizonte, MG",
};

const GESTOR = { nome: "Aline Castro", iniciais: "AC", hex: "#CC092F" };

const CONSTRUCAO = {
  situacao: "Em construção",
  itens: [
    { label: "Clientes do mês (green/telecom/seguro)", feitos: 3, total: 5 },
    { label: "Conexão livre", feitos: 1, total: 1 },
    { label: "Placa", feitos: 0, total: 1 },
    { label: "Solar", feitos: 1, total: 1 },
    { label: "Licenciados cadastrados", feitos: 1, total: 2 },
    { label: "Club", feitos: 0, total: 1 },
  ],
};

type MetricaItem = {
  icone: LucideIcon;
  label: string;
  value: string;
  tom: "brand" | "danger" | "neutro";
};

/** Cor do valor por tom. Fora do componente porque o tom é decisão de leitura, não de sinal. */
const COR_DO_TOM: Record<MetricaItem["tom"], string> = {
  brand: "text-fg-brand",
  danger: "text-fg-danger",
  neutro: "text-fg-default",
};

/**
 * **Métrica de painel — cards compactos, um por métrica.**
 *
 * ## Por que não é o `Kpi` do DS
 *
 * Não é rejeição do componente: é escala errada pro lugar. O `Kpi` é card de **dashboard** —
 * `p-pad-3xl` (20px), label de 14px, slot pra sparkline, `hint` e `delta`. Num painel de
 * detalhe a métrica é **contexto**, não o assunto: quem abriu quer os dados do registro, e a
 * métrica só emoldura.
 *
 * Medido no browser, antes e depois:
 *
 * | | por item | conjunto |
 * |---|---|---|
 * | `Kpi size="sm"`, `columns={3}` | 172 × **144px** | 146px (3 métricas) |
 * | este | 257 × **68px** | 68px (2 métricas) |
 *
 * ## Card próprio, e não uma faixa dividida
 *
 * A alternativa testada foi uma superfície única com `divide-x` (mesma altura, coluna 3px mais
 * larga). A diferença entre as duas é **só o container**, e é isso que ela comunica: a faixa
 * afirma que as métricas formam um conjunto; os cards afirmam que cada uma é independente.
 * Economia e inadimplência são dois assuntos → cards. Total/pago/em aberto são três faces do
 * mesmo número → faixa.
 *
 * ## Duas travas de layout
 *
 * 1. **O número de colunas segue o número de métricas** (`grid-cols-2` com duas). Não é
 *    responsivo de propósito: num painel de 560px a decisão é fixa. Acima de 3 não cabe, e a
 *    resposta é cortar métrica, não encolher coluna — em 4 colunas cada uma fica com ~127px e
 *    o par ícone + valor quebra linha.
 * 2. **Ícone + valor na mesma linha depende do valor ser 18px.** Com `stat-sm` (20px) o par
 *    não cabia em 3 colunas e a 1ª versão saiu sem ícone; o ícone voltou junto com a redução.
 *    Se o valor crescer, **o ícone é a primeira coisa que quebra**.
 *
 * O 18px vem de `body-xl`, não de `stat-*`: o role `stat` começa em 20px (sm) e não tem tier
 * abaixo. Com `font-bold` + `tabular-nums` a leitura de valor se mantém. Se precisar disso em
 * mais lugares, o certo é um `stat-xs` no `typography.ts` via cascata — não repetir esta
 * combinação por aí.
 */
function MetricaCartoes({ itens }: { itens: MetricaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-gp-md">
      {itens.map(({ icone: Icone, ...m }) => (
        <div
          key={m.label}
          className="flex flex-col gap-gp-2xs rounded-radius-lg border border-border-default bg-bg-surface p-pad-2xl"
        >
          <div className={`flex items-center gap-gp-sm ${COR_DO_TOM[m.tom]}`}>
            <Icone className="size-icon-sm shrink-0" aria-hidden="true" />
            <span className="text-body-xl font-bold tabular-nums leading-none">{m.value}</span>
          </div>
          <span className="text-caption-sm text-fg-muted">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * **Checklist de progresso** — a lista de metas do registro, com o que já fechou.
 *
 * ## O que ela resolve, e por que não é `Progress`
 *
 * O dado aqui não é "quanto por cento" — é **quais itens faltam**. Uma barra de `Progress`
 * responde a primeira pergunta e apaga a segunda: 4 de 11 não diz que o que falta é Placa e
 * Club. A lista mantém as duas leituras (o contador por item e o quadro geral) e é ela que
 * permite agir.
 *
 * ## A faixa de situação é uma FAIXA, não um `Chip`
 *
 * `Chip` é rótulo inline — o que ele faz bem é caber ao lado de um texto. Aqui a situação é o
 * cabeçalho do bloco: largura cheia, centralizada, `rounded-radius-full`. Forçar um Chip a
 * `w-full` deforma um componente pra fazer o trabalho de outro. Tom em `warning` porque
 * "em construção" é estado transitório com prazo, não erro nem sucesso.
 *
 * ## Estado não fica só no ícone (WCAG 1.4.1)
 *
 * O ✔ verde e o círculo vazio são **redundantes** — quem lê a informação é o contador
 * `(1/1)` vs `(0/1)`, que é texto e é anunciado pelo leitor de tela. Por isso os ícones são
 * `aria-hidden`. Se um dia o contador sair, o estado passa a viver só em cor + forma, e aí
 * precisa de texto alternativo: **não remova o contador sem repor a informação.**
 *
 * ## Cuidado ao adaptar
 *
 * - `concluido` deriva de `feitos >= total`, não de um booleano à parte. Dois campos que podem
 *   discordar ("feito" true com 1 de 3) é bug esperando acontecer.
 * - Lista longa (15+) some dentro do painel — aí ela não é seção, é tela própria com filtro.
 */
function ListaDeProgresso({
  situacao,
  itens,
}: {
  situacao: string;
  itens: { label: string; feitos: number; total: number }[];
}) {
  return (
    <div className="flex flex-col gap-gp-lg">
      <div className="rounded-radius-full bg-bg-warning-muted py-pad-md text-center text-body-sm font-semibold text-fg-warning">
        {situacao}
      </div>

      <ul className="flex flex-col gap-gp-md">
        {itens.map((i) => {
          const concluido = i.feitos >= i.total;
          return (
            <li key={i.label} className="flex items-center gap-gp-md text-body-sm">
              {/* Concluído = disco CHEIO, e ele é um `<span>` com `bg-bg-success`, não o
                  `CircleCheck` do lucide.

                  ⚠️ A tentativa anterior foi `<CircleCheck className="fill-bg-success
                  text-fg-on-success" />`, e o disco saía **visivelmente menor** que o anel do
                  pendente: o lucide desenha o círculo com `stroke="currentColor"`, então o
                  traço (preto no dark, porque `fg-on-success` inverte) fica POR CIMA do
                  preenchimento e come ~2px de verde de cada lado. Não há classe que tire só
                  aquele stroke — círculo e check compartilham o `currentColor`.

                  Com `<span>` + `<Check>` dentro, o disco é os 16px inteiros e o traço existe
                  só no check. `fg-on-success` é o par validado do `bg-success` em
                  `color-light/dark.ts` (branco no light, preto no dark) — não use `text-white`
                  na unha, que não é dark-aware.

                  O pendente fica de anel vazio de propósito: é o contraste cheio-vs-vazio que
                  carrega o estado. Preencher os dois apagaria a distinção. */}
              {concluido ? (
                <span
                  className="grid size-icon-sm shrink-0 place-items-center rounded-radius-full bg-bg-success text-fg-on-success"
                  aria-hidden="true"
                >
                  <Check className="size-icon-2xs" strokeWidth={3} />
                </span>
              ) : (
                <Circle className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden="true" />
              )}
              <span
                className={
                  concluido ? "font-semibold text-fg-default" : "text-fg-muted"
                }
              >
                {i.label}{" "}
                <span className="tabular-nums">
                  ({i.feitos}/{i.total})
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Linha de seção que NÃO é `label: valor` — entidade com identidade própria.
 *
 * A conta bancária e o gestor não são um valor: são uma coisa com nome, marca e um dado
 * secundário. Forçá-los no `FloatingPanelField` deixaria "Nubank · Ag 3849 · 18701-9"
 * comprimido na coluna da direita e truncando. Aqui a linha usa a largura toda.
 */
function LinhaDeEntidade({
  hex,
  iniciais,
  nome,
  detalhe,
}: {
  hex: string;
  iniciais: string;
  nome: string;
  detalhe: string;
}) {
  return (
    <div className="flex items-center gap-gp-lg">
      <Avatar size="lg" colorHex={hex} className="shrink-0" aria-label={nome}>
        {iniciais}
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-body-sm font-semibold text-fg-default">{nome}</span>
        <span className="truncate text-body-xs tabular-nums text-fg-muted">{detalhe}</span>
      </div>
    </div>
  );
}

export function PainelDeDetalheDoRegistro() {
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* No CRUD real este botão não existe: quem abre o painel é a linha selecionada. */}
      <Button variant="outline" color="secondary" onClick={() => setAberto(true)}>
        Ver detalhe do cliente
      </Button>

      <FloatingPanel
        open={aberto}
        onOpenChange={setAberto}
        side="right"
        size="lg"
        resizable
        maximizable
        bodyPadded={false}
        resizableStorageKey="dsgreen-paneldetail-1.width"
        /* Header: avatar + nome + (código · status). É o `titleSlot` que permite isso — com
           `title`/`description` string não há como pôr avatar nem Chip. O `truncate` +
           `min-w-0` são obrigatórios: nome longo empurraria as ações fora do painel. */
        titleSlot={
          <div className="flex min-w-0 items-center gap-gp-md">
            <Avatar color="brand" size="lg" className="shrink-0" aria-label={REGISTRO.nome}>
              {REGISTRO.iniciais}
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-body-md font-semibold text-fg-default">
                {REGISTRO.nome}
              </span>
              <span className="mt-[2px] flex items-center gap-gp-sm text-body-xs text-fg-muted">
                <span className="tabular-nums">{REGISTRO.codigo}</span>
                <span className="opacity-50">·</span>
                <Chip color="success" variant="soft" size="sm">
                  {REGISTRO.status}
                </Chip>
              </span>
            </div>
          </div>
        }
        /* Ações de ícone frequentes. O maximize e o X vêm do componente — não se escreve.
           `aria-label` não é opcional aqui: botão de ícone não tem texto.

           ⚠️ **`variant="soft"` em TODAS, não `ghost`.** O maximize e o close que o
           `FloatingPanel` renderiza são `soft` + `secondary` — é o que dá a caixinha com fundo.
           Uma ação `ghost` no meio da fileira fica sem container e lê como se estivesse
           desabilitada ao lado das outras três. A cor é o que diferencia: `secondary` pro
           neutro, `success` pra ação de contato. (O JSDoc do próprio componente mostra
           `headerActions` com `soft`/`secondary` — foi de lá que a receita saiu.) */
        headerActions={
          <>
            <Button variant="soft" color="secondary" size="icon-sm" aria-label="Editar cliente">
              <Pencil />
            </Button>
            <Button variant="soft" color="success" size="icon-sm" aria-label="WhatsApp">
              <MessageCircle />
            </Button>
          </>
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
            <Button variant="filled" size="sm" iconLeft={<Receipt />}>
              Registrar pagamento
            </Button>
          </>
        }
      >
        {/* Métricas do REGISTRO. Ver o JSDoc do `MetricaCartoes` pro porquê de não ser `Kpi`
            e pra alternativa em faixa dividida que foi testada e descartada aqui. */}
        <FloatingPanelSection title="Métricas">
          <MetricaCartoes itens={METRICAS} />
        </FloatingPanelSection>

        {/* Metas do registro. Fica junto das métricas porque as duas respondem "como este
            registro está?" — os campos abaixo respondem "quais são os dados dele". */}
        <FloatingPanelSection title="Construção PRO (mês)">
          <ListaDeProgresso situacao={CONSTRUCAO.situacao} itens={CONSTRUCAO.itens} />
        </FloatingPanelSection>

        <FloatingPanelSection title="Empresa">
          <FloatingPanelField label="Razão Social" value="Estrela do Sul Alimentos S.A." />
          <FloatingPanelField
            label="CNPJ"
            value={<span className="tabular-nums">{REGISTRO.documento}</span>}
          />
        </FloatingPanelSection>

        {/* Entidade, não campo: banco tem marca, nome e agência/conta. Ver LinhaDeEntidade. */}
        <FloatingPanelSection title="Conta bancária">
          <LinhaDeEntidade
            hex={CONTA.hex}
            iniciais={CONTA.iniciais}
            nome={CONTA.banco}
            detalhe={`Ag ${CONTA.agencia} · ${CONTA.conta}`}
          />
        </FloatingPanelSection>

        <FloatingPanelSection title="Financeiro">
          <FloatingPanelField
            label="Volume mensal"
            value={<span className="tabular-nums">R$ 72.147,00</span>}
          />
          <FloatingPanelField
            label="Comissão"
            value={<span className="tabular-nums">8,9%</span>}
          />
          <FloatingPanelField label="Saque automático" value="Ativado" />
          {/* Vários valores num campo → Chips, não texto separado por vírgula: cada método é
              um item discreto, e a pílula é o que comunica isso. */}
          <FloatingPanelField
            label="Métodos"
            value={
              <span className="flex flex-wrap items-center justify-end gap-gp-sm">
                {METODOS.map((m) => (
                  <Chip key={m} color="neutral" variant="soft" size="sm">
                    {m}
                  </Chip>
                ))}
              </span>
            }
          />
        </FloatingPanelSection>

        {/* E-mail e telefone são AÇÕES, não texto: `mailto:`/`tel:` com cor de link.
            `break-all` no e-mail porque endereço longo não tem onde quebrar e estouraria
            a coluna da direita. */}
        <FloatingPanelSection title="Contato">
          <FloatingPanelField
            label="Email"
            value={
              <a
                href={`mailto:${CONTATO.email}`}
                className="break-all text-fg-brand hover:underline"
              >
                {CONTATO.email}
              </a>
            }
          />
          <FloatingPanelField
            label="Telefone"
            value={
              <a
                href={`tel:${CONTATO.telefone.replace(/\D/g, "")}`}
                className="tabular-nums text-fg-brand hover:underline"
              >
                {CONTATO.telefone}
              </a>
            }
          />
          <FloatingPanelField label="Localização" value={CONTATO.local} />
        </FloatingPanelSection>

        <FloatingPanelSection title="Gestão">
          {/* Pessoa dentro de um campo: avatar `xs` (20px) cabe na linha do valor sem esticar
              a altura — o `lg` da LinhaDeEntidade quebraria o ritmo dos campos. */}
          <FloatingPanelField
            label="Gestor da conta"
            value={
              <span className="flex items-center justify-end gap-gp-sm">
                <Avatar size="xs" colorHex={GESTOR.hex} aria-label={GESTOR.nome}>
                  {GESTOR.iniciais}
                </Avatar>
                {GESTOR.nome}
              </span>
            }
          />
          <FloatingPanelField label="Cliente desde" value="12 de março de 2024" />
          <FloatingPanelField label="Última movimentação" value="há 3 dias" />
        </FloatingPanelSection>
      </FloatingPanel>
    </>
  );
}
