import { useState } from "react";
import { Check, MessageSquare, Pin, Search, Settings2, X } from "lucide-react";
import { Avatar } from "../../components/ui/avatar-ig";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { TabsNavigation } from "../../components/ui/TabsNavigation";
import { DropdownMenuItem } from "../../components/shadcn/dropdown-menu";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

/**
 * Doc do `TabsNavigation`. Nasceu como demo (`#/tabs-navigation-demo`) pra decidir a API antes de existir
 * componente; agora consome o componente real e a seção de decisões continua aqui, porque é
 * ela que explica por que a API é essa.
 */

type StatusAba = "success" | "warning" | "neutral";

interface Conversa {
  id: string;
  titulo: string;
  subtitulo: string;
  status: StatusAba;
  iniciais: string;
  cor: string;
  naoLidas?: number;
  pendente?: boolean;
}

const ROTULO: Record<StatusAba, string> = {
  success: "Aberto",
  warning: "Aguardando",
  neutral: "Resolvido",
};

const CONVERSAS: Conversa[] = [
  { id: "c1", titulo: "Maria Silva", subtitulo: "Fatura de julho", status: "success", iniciais: "MS", cor: "#2563EB", naoLidas: 3 },
  { id: "c2", titulo: "Comercial Andrade LTDA", subtitulo: "Troca de titularidade", status: "warning", iniciais: "CA", cor: "#CC092F" },
  { id: "c3", titulo: "João Pedro Costa", subtitulo: "Segunda via", status: "neutral", iniciais: "JC", cor: "#7C3AED" },
];

/** 8 conversas de propósito: com 3 a tira cabe e os controles de overflow não aparecem. */
const MUITAS: Conversa[] = [
  ...CONVERSAS,
  { id: "c4", titulo: "Padaria do Bairro ME", subtitulo: "Boleto em atraso", status: "success", iniciais: "PB", cor: "#EA580C", naoLidas: 1 },
  { id: "c5", titulo: "Ana Beatriz Ramos", subtitulo: "Alteração de plano", status: "warning", iniciais: "AR", cor: "#0891B2" },
  { id: "c6", titulo: "Transportes Vale Verde", subtitulo: "Contrato 2026", status: "success", iniciais: "TV", cor: "#16A34A", naoLidas: 7 },
  { id: "c7", titulo: "Carlos Eduardo Lima", subtitulo: "Cancelamento", status: "neutral", iniciais: "CL", cor: "#9333EA" },
  { id: "c8", titulo: "Mercado São Jorge", subtitulo: "Segunda via de fatura", status: "warning", iniciais: "MJ", cor: "#DC2626" },
];

const CHAMADOS: Conversa[] = [
  { id: "t1", titulo: "#4821 · Sem energia", subtitulo: "Aberto há 4 min", status: "success", iniciais: "48", cor: "#DC2626", pendente: true },
  { id: "t2", titulo: "#4822 · Fatura duplicada", subtitulo: "Aberto há 11 min", status: "success", iniciais: "48", cor: "#EA580C", pendente: true },
  { id: "t3", titulo: "#4815 · Troca de titular", subtitulo: "Em atendimento", status: "warning", iniciais: "48", cor: "#0891B2" },
  { id: "t4", titulo: "#4809 · Religação", subtitulo: "Em atendimento", status: "success", iniciais: "48", cor: "#16A34A", naoLidas: 2 },
];

function Conteudo({ item }: { item?: Conversa }) {
  if (!item) {
    return (
      <div className="flex min-h-[180px] flex-col items-center justify-center gap-gp-md text-fg-muted">
        <MessageSquare className="size-icon-xl" />
        <p className="text-body-sm">Nada aberto</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-gp-xl p-pad-3xl">
      <div className="flex items-center justify-between gap-gp-xl">
        <div className="flex items-center gap-gp-lg">
          <Avatar size="xl" colorHex={item.cor} aria-label={item.titulo}>
            {item.iniciais}
          </Avatar>
          <div>
            <p className="text-body-md font-semibold text-fg-default">{item.titulo}</p>
            <p className="text-body-sm text-fg-muted">{item.subtitulo}</p>
          </div>
        </div>
        {/* Aqui o Chip cabe: é UM status, o do que está aberto. Na aba são 8 competindo. */}
        <Chip size="md" color={item.status === "neutral" ? "neutral" : item.status} variant="soft">
          {ROTULO[item.status]}
        </Chip>
      </div>
      <div className="rounded-radius-lg bg-bg-subtle p-pad-2xl text-body-sm text-fg-muted">
        Conteúdo de <strong className="text-fg-default">{item.titulo}</strong>. Trocar de aba troca{" "}
        <em>tudo</em> daqui pra baixo — é o que distingue o `TabsNavigation` do `Tabs`, que troca só um
        miolo dentro da tela.
      </div>
    </div>
  );
}

/** Uma aba padrão a partir do nosso registro — a composição toda vive aqui, no consumidor. */
function abaDe(item: Conversa, aoFechar: (id: string) => void) {
  return (
    <TabsNavigation.Tab
      key={item.id}
      value={item.id}
      leading={
        <Avatar size="sm" colorHex={item.cor} aria-hidden>
          {item.iniciais}
        </Avatar>
      }
      status={item.status}
      badge={item.naoLidas}
      onClose={() => aoFechar(item.id)}
      menu={
        <DropdownMenuItem>
          <Pin className="size-icon-sm" /> Fixar aba
        </DropdownMenuItem>
      }
    >
      <TabsNavigation.Title>{item.titulo}</TabsNavigation.Title>
      <TabsNavigation.Subtitle>{item.subtitulo}</TabsNavigation.Subtitle>
    </TabsNavigation.Tab>
  );
}

const TOC = [
  { id: "modelos", label: "Os dois lugares" },
  { id: "ex-header", label: "A — no espaço do Header" },
  { id: "ex-card", label: "B — como header de card" },
  { id: "ex-compacta", label: "density=compact" },
  { id: "ex-chamados", label: "fill + ações fixas" },
  { id: "ex-fora", label: "Conteúdo fora do componente" },
  { id: "api", label: "API" },
  { id: "decisoes", label: "Decisões" },
];

const PROPS_ROOT = [
  { name: "value / onValueChange", type: "string / (v: string) => void — SEMPRE controlado", defaultVal: "—" },
  { name: "surface", type: '"surface" | "canvas" — a superfície do CONTEÚDO abaixo', defaultVal: '"surface"' },
  { name: "density", type: '"comfortable" (48px) | "compact" (40px, sem subtítulo)', defaultVal: '"comfortable"' },
  { name: "fill", type: "boolean — aba ocupa a faixa inteira (sem régua, une por cor)", defaultVal: "false" },
  { name: "actionsMode", type: '"hover" | "persistent"', defaultVal: '"hover"' },
  { name: "chrome", type: "boolean — pinta o fundo recuado (bg-subtle no claro, bg-canvas no escuro)", defaultVal: "true" },
  { name: "onNewTab", type: "() => void — rende o + fora do trilho", defaultVal: "—" },
  { name: "aria-label", type: "string — rótulo do conjunto", defaultVal: "—" },
];

const PROPS_TAB = [
  { name: "value", type: "string — volta em onValueChange", defaultVal: "—" },
  { name: "leading", type: "ReactNode — Avatar, Icon, imagem, o que for", defaultVal: "—" },
  { name: "status", type: '"success" | "warning" | "danger" | "info" | "neutral" | ReactNode', defaultVal: "—" },
  { name: "badge", type: "number | ReactNode — some na aba ativa", defaultVal: "—" },
  { name: "actions", type: "ReactNode — SUBSTITUI as ações padrão (0, 2 ou 5 botões)", defaultVal: "—" },
  { name: "onClose", type: "() => void — sem `actions`, liga as ações padrão (⋯ + ×)", defaultVal: "—" },
  { name: "menu", type: "ReactNode — itens extras do ⋯", defaultVal: "—" },
  { name: "panelId", type: "string — id do container externo; emite aria-controls", defaultVal: "—" },
  { name: "actionsAlwaysVisible", type: "boolean — ações fixas só nesta aba", defaultVal: "false" },
];

export function TabsNavigationDoc() {
  const [abasA, setAbasA] = useState(MUITAS);
  const [ativaA, setAtivaA] = useState("c1");
  const [abasB, setAbasB] = useState(CONVERSAS);
  const [ativaB, setAtivaB] = useState("c2");
  const [abasC, setAbasC] = useState(MUITAS.slice(0, 5));
  const [ativaC, setAtivaC] = useState("c3");
  const [abasD, setAbasD] = useState(CHAMADOS);
  const [ativaD, setAtivaD] = useState("t3");
  const [ativaE, setAtivaE] = useState("c1");
  const [novas, setNovas] = useState(0);

  /** Fechar a ATIVA seleciona a vizinha da ESQUERDA: quem fecha está no fluxo daquela posição. */
  const fechar = (
    id: string,
    lista: Conversa[],
    ativa: string,
    setLista: (l: Conversa[]) => void,
    setAtiva: (id: string) => void,
  ) => {
    const i = lista.findIndex((a) => a.id === id);
    const restantes = lista.filter((a) => a.id !== id);
    setLista(restantes);
    if (id === ativa && restantes.length) setAtiva(restantes[Math.max(0, i - 1)].id);
  };

  /** Aba nova abre JÁ ATIVA — é o que Ctrl+T faz. */
  const abrir = (
    lista: Conversa[],
    setLista: (l: Conversa[]) => void,
    setAtiva: (id: string) => void,
  ) => {
    const n = novas + 1;
    setNovas(n);
    const nova: Conversa = {
      id: `nova-${n}`,
      titulo: `Nova conversa ${n}`,
      subtitulo: "Sem assunto",
      status: "success",
      iniciais: "NC",
      cor: "#0891B2",
    };
    setLista([...lista, nova]);
    setAtiva(nova.id);
  };

  const achar = (l: Conversa[], id: string) => l.find((a) => a.id === id);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Navigation"
        title="TabsNavigation"
        description="Abas de navegação estilo navegador: cada aba é uma SESSÃO aberta — com identidade, status e ações próprias — que o usuário abre, troca e fecha. O componente é a tira; o conteúdo mora onde você quiser."
      />
      <DocSeparator />

      <SectionH2 id="modelos" title="Os dois lugares" />

      <ExampleSection
        id="ex-header"
        title="A — ocupando o espaço do Header"
        description="A tira toma a faixa do Header (60px) e as abas encostam na régua, como o chrome de um navegador. A aba ativa é bg-surface — a mesma superfície do conteúdo — então ela vira a página de baixo. Ações globais entram por <TabsNavigation.Actions> e ficam fixas, fora do trilho que rola."
        code={`<TabsNavigation value={id} onValueChange={setId} aria-label="Conversas abertas" onNewTab={abrir}>
  <TabsNavigation.Tab value="c1" leading={<Avatar size="sm" colorHex="#2563EB">MS</Avatar>}
               status="success" badge={3} onClose={() => fechar("c1")}>
    <TabsNavigation.Title>Maria Silva</TabsNavigation.Title>
    <TabsNavigation.Subtitle>Fatura de julho</TabsNavigation.Subtitle>
  </TabsNavigation.Tab>
  <TabsNavigation.Actions>
    <Button variant="ghost" color="secondary" size="icon-sm" aria-label="Buscar"><Search /></Button>
  </TabsNavigation.Actions>
</TabsNavigation>`}
      >
        <div className="w-full overflow-hidden rounded-radius-lg border border-border-default">
          <TabsNavigation
            value={ativaA}
            onValueChange={setAtivaA}
            aria-label="Conversas abertas"
            onNewTab={() => abrir(abasA, setAbasA, setAtivaA)}
          >
            {abasA.map((c) => abaDe(c, (id) => fechar(id, abasA, ativaA, setAbasA, setAtivaA)))}
            <TabsNavigation.Actions>
              <Button variant="ghost" color="secondary" size="icon-sm" aria-label="Buscar">
                <Search />
              </Button>
              <Button variant="ghost" color="secondary" size="icon-sm" aria-label="Preferências">
                <Settings2 />
              </Button>
            </TabsNavigation.Actions>
          </TabsNavigation>
          <div className="min-h-[220px] bg-bg-surface">
            <Conteudo item={achar(abasA, ativaA)} />
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-card"
        title="B — como header de qualquer card"
        description="Mesma peça, dentro de um card. O que importa é o PAR de fundos: a tira recua (bg-subtle no claro, bg-canvas no escuro — cada modo tem o seu token de recuo) e a ativa é a superfície do card. Errar o par é o que faz a aba parecer solta em cima do card em vez de fazer parte dele."
      >
        <div className="w-full overflow-hidden rounded-radius-lg border border-border-default bg-bg-surface shadow-sh-sm">
          <TabsNavigation value={ativaB} onValueChange={setAtivaB} aria-label="Abas do card">
            {abasB.map((c) => abaDe(c, (id) => fechar(id, abasB, ativaB, setAbasB, setAtivaB)))}
          </TabsNavigation>
          <Conteudo item={achar(abasB, ativaB)} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-compacta"
        title="density=compact — só avatar + título"
        description="Sem subtítulo a aba cai de 48px pra 40px e de 228px pra 196px. O <TabsNavigation.Subtitle> some sozinho — o consumidor não precisa condicionar nada. É escolha de CONTEÚDO: em conversa, duas do mesmo cliente ficam idênticas sem o subtítulo."
        code={`<TabsNavigation value={id} onValueChange={setId} density="compact">…</TabsNavigation>`}
      >
        <div className="w-full overflow-hidden rounded-radius-lg border border-border-default bg-bg-surface shadow-sh-sm">
          <TabsNavigation
            value={ativaC}
            onValueChange={setAtivaC}
            density="compact"
            aria-label="Abas compactas"
            onNewTab={() => abrir(abasC, setAbasC, setAtivaC)}
          >
            {abasC.map((c) => abaDe(c, (id) => fechar(id, abasC, ativaC, setAbasC, setAtivaC)))}
          </TabsNavigation>
          <Conteudo item={achar(abasC, ativaC)} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-chamados"
        title="fill + ações persistentes (fila de chamados)"
        description="Duas mudanças que andam juntas. fill faz a aba ocupar a faixa inteira: some o respiro de chrome no topo, a tira perde a régua e a união vira continuidade de cor — lê como segmento, não como aba de navegador. E as ações não escondem: os dois primeiros chamados usam `actions` próprio com ✓/✗, porque ação que exige decisão precisa ser vista pra ser feita."
        code={`<TabsNavigation value={id} onValueChange={setId} fill actionsMode="persistent">
  <TabsNavigation.Tab value="t1" actions={
    <>
      <TabsNavigation.Action tom="success" aria-label="Aceitar" onClick={aceitar}><Check /></TabsNavigation.Action>
      <TabsNavigation.Action tom="danger"  aria-label="Recusar" onClick={recusar}><X /></TabsNavigation.Action>
    </>
  }>…</TabsNavigation.Tab>
</TabsNavigation>`}
      >
        <div className="flex w-full flex-col gap-gp-xl">
          <div className="overflow-hidden rounded-radius-lg border border-border-default bg-bg-surface shadow-sh-sm">
            <div className="h-comp-4xl">
              <TabsNavigation
                value={ativaD}
                onValueChange={setAtivaD}
                fill
                actionsMode="persistent"
                aria-label="Chamados abertos"
                className="h-full"
                onNewTab={() => abrir(abasD, setAbasD, setAtivaD)}
              >
                {abasD.map((c) => (
                  <TabsNavigation.Tab
                    key={c.id}
                    value={c.id}
                    leading={
                      <Avatar size="sm" colorHex={c.cor} aria-hidden>
                        {c.iniciais}
                      </Avatar>
                    }
                    status={c.status}
                    badge={c.naoLidas}
                    actionsAlwaysVisible={c.pendente}
                    onClose={c.pendente ? undefined : () => fechar(c.id, abasD, ativaD, setAbasD, setAtivaD)}
                    actions={
                      c.pendente ? (
                        <>
                          <TabsNavigation.Action
                            tom="success"
                            aria-label={`Aceitar ${c.titulo}`}
                            onClick={() =>
                              setAbasD(abasD.map((x) => (x.id === c.id ? { ...x, pendente: false } : x)))
                            }
                          >
                            <Check className="size-icon-sm" />
                          </TabsNavigation.Action>
                          <TabsNavigation.Action
                            tom="danger"
                            aria-label={`Recusar ${c.titulo}`}
                            onClick={() => fechar(c.id, abasD, ativaD, setAbasD, setAtivaD)}
                          >
                            <X className="size-icon-sm" />
                          </TabsNavigation.Action>
                        </>
                      ) : undefined
                    }
                  >
                    <TabsNavigation.Title>{c.titulo}</TabsNavigation.Title>
                    <TabsNavigation.Subtitle>{c.subtitulo}</TabsNavigation.Subtitle>
                  </TabsNavigation.Tab>
                ))}
              </TabsNavigation>
            </div>
            <Conteudo item={achar(abasD, ativaD)} />
          </div>
          <p className="text-body-sm text-fg-muted">
            Aceitar tira o chamado de pendente (as ações voltam a ser{" "}
            <code className="text-code-sm">⋯</code> e <code className="text-code-sm">×</code>);
            recusar fecha e devolve o foco à vizinha da esquerda.{" "}
            <strong className="text-fg-default">
              <code className="text-code-sm">actionsAlwaysVisible</code> é por aba
            </strong>{" "}
            — decisão com custo alto (recusar por engano devolve o chamado à fila) não pode
            depender de o mouse passar por cima.
          </p>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-fora"
        title="Conteúdo FORA do componente"
        description="O caso que define a API: a tira fica aqui e o conteúdo mora em qualquer lugar — outra coluna, outra rota, outro componente. O componente é controlado e não hospeda nada; panelId fecha a acessibilidade emitindo aria-controls pro container externo. Quando o conteúdo está dentro, <TabsNavigation.Panel> faz o par role=tabpanel + aria-labelledby."
        code={`// tira aqui…
<TabsNavigation value={id} onValueChange={setId}>
  <TabsNavigation.Tab value="c1" panelId="painel-detalhe">…</TabsNavigation.Tab>
</TabsNavigation>

// …e o conteúdo onde você quiser
<section id="painel-detalhe">{conteudoDe(id)}</section>`}
      >
        <div className="flex w-full flex-col gap-gp-2xl">
          <div className="overflow-hidden rounded-radius-lg border border-border-default">
            <TabsNavigation value={ativaE} onValueChange={setAtivaE} aria-label="Seções">
              {CONVERSAS.map((c) => (
                <TabsNavigation.Tab
                  key={c.id}
                  value={c.id}
                  panelId="painel-externo"
                  leading={
                    <Avatar size="sm" colorHex={c.cor} aria-hidden>
                      {c.iniciais}
                    </Avatar>
                  }
                  status={c.status}
                >
                  <TabsNavigation.Title>{c.titulo}</TabsNavigation.Title>
                  <TabsNavigation.Subtitle>{c.subtitulo}</TabsNavigation.Subtitle>
                </TabsNavigation.Tab>
              ))}
            </TabsNavigation>
          </div>

          {/* Repare: este container é IRMÃO da tira, não filho. */}
          <section
            id="painel-externo"
            className="rounded-radius-lg border border-border-default bg-bg-surface"
          >
            <Conteudo item={achar(CONVERSAS, ativaE)} />
          </section>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API" />
      <PropsTable items={PROPS_ROOT} />
      <SectionH2 id="api-tab" title="TabsNavigation.Tab" />
      <PropsTable items={PROPS_TAB} />

      <SectionH2 id="decisoes" title="Decisões" />

      <ExampleSection
        id="ex-decisoes"
        title="Por que a peça é assim"
        description="Cada item aqui saiu de uma medição no browser durante a demo que virou este componente."
      >
        <ul className="flex w-full flex-col gap-gp-lg text-body-sm text-fg-muted">
          <li>
            <strong className="text-fg-default">Não é o `Tabs`.</strong> `segmented` e `line`
            trocam um miolo dentro da tela; este troca a sessão inteira. Os dois coexistem — uma
            aba de conversa pode conter um `Tabs` de Mensagens/Notas dentro.
          </li>
          <li>
            <strong className="text-fg-default">A união com o conteúdo É o componente.</strong> No
            modo pousado a aba ativa desce 1px e pinta a régua com a própria cor. Em{" "}
            <code className="text-code-sm">fill</code> isso não funciona — medido, a aba parava
            2px antes da régua (1px do padding do trilho + 1px da borda) — então ali a tira perde
            a régua e a união vira continuidade de cor.
          </li>
          <li>
            <strong className="text-fg-default">
              <code className="text-code-sm">surface</code> é prop porque a aba ativa precisa ser
              a cor do que está embaixo.
            </strong>{" "}
            É o mesmo erro clássico do anel do `AvatarGroup`.
          </li>
          <li>
            <strong className="text-fg-default">
              Só a aba ATIVA tem fundo próprio — e o respiro do topo é do componente.
            </strong>{" "}
            Enquanto o padding vinha de um wrapper por fora, a faixa acima das abas ficava com a
            cor do container enquanto a tira ficava com o recuo: duas cores na mesma banda, e a
            aba inativa lia como “um botão de outra cor pousado num fundo diferente”. Com o
            respiro dentro do componente, o recuo cobre a banda inteira, as inativas são
            transparentes (herdam a tira) e a única superfície própria é a da aba ativa — que é
            a do conteúdo. Resultado: a peça fica <strong>independente de onde é colocada</strong>.
          </li>
          <li>
            <strong className="text-fg-default">
              O fundo recuado usa dois tokens, um por modo — de propósito.
            </strong>{" "}
            <code className="text-code-sm">bg-subtle</code> no claro,{" "}
            <code className="text-code-sm">bg-canvas</code> no escuro. Medido: no claro{" "}
            <code className="text-code-sm">canvas</code> é branco <em>igual</em> à{" "}
            <code className="text-code-sm">surface</code> (recuo zero) e quem recua é o{" "}
            <code className="text-code-sm">subtle</code> (0.973); no escuro{" "}
            <code className="text-code-sm">subtle</code> é branco a 1% sobre o card (invisível) e
            quem recua é o <code className="text-code-sm">canvas</code> (0.205 contra 0.225). Cada
            modo tem o seu token de recuo, e a escala existente já cobre o papel.
          </li>
          <li>
            <strong className="text-fg-default">Utility nova: `scrollbar-none`.</strong> A barra
            ocupa 11px DENTRO do trilho e empurrava as abas pra cima da régua, matando a união. A
            navegação fica por conta das setas + lista, que é o substituto exigido antes de
            esconder qualquer barra.
          </li>
          <li>
            <strong className="text-fg-default">As ações crescem de 0fr a 1fr.</strong> Com{" "}
            <code className="text-code-sm">opacity-0</code> elas ocupavam 48px invisíveis e o
            título truncava por causa de espaço que ninguém usava.{" "}
            <code className="text-code-sm">interpolate-size</code>/
            <code className="text-code-sm">calc-size()</code> fariam isso direto, mas ainda não
            são Baseline.
          </li>
          <li>
            <strong className="text-fg-default">A aba ativa se destaca sem quebrar a união.</strong>{" "}
            Mudar a COR dela não era opção — ela precisa ser a superfície do conteúdo. Então o
            contraste vem do outro lado: no claro a tira recua pra{" "}
            <code className="text-code-sm">bg-emphasis</code> (0.94 contra a aba branca; o{" "}
            <code className="text-code-sm">subtle</code> anterior dava só 0.027 de delta), e nos
            dois modos a ativa ganha <code className="text-code-sm">shadow-sh-sm</code> — no
            escuro, onde a distância de cor é 0.02, é a sombra que faz a leitura. O título ativo
            usa <code className="text-code-sm">fg-strong</code>: branco puro no escuro, o tom
            mais escuro no claro.
          </li>
          <li>
            <strong className="text-fg-default">As setas somem, não desabilitam.</strong> Cada
            uma existe só enquanto há o que rolar naquele sentido — no começo da fila só a
            direita, no fim só a esquerda, e com tudo visível nenhuma. Botão apagado continua
            ocupando espaço e ainda lê como “tem algo aqui”; desabilitar cabe quando a ação
            volta a valer no mesmo lugar, e aqui o gatilho é a largura da tira.
          </li>
          <li>
            <strong className="text-fg-default">O “+” e a lista moram fora do trilho.</strong>{" "}
            Dentro, sumiam da tela justamente quando havia abas demais — que é quando servem.
          </li>
          <li>
            <strong className="text-fg-default">Teclado.</strong> ←/→/Home/End movem a seleção e o
            foco junto; só a aba ativa fica na ordem de tabulação (roving tabindex). Sem isso, 12
            abas viram 12 paradas de Tab antes do conteúdo.
          </li>
        </ul>
      </ExampleSection>
    </DocLayout>
  );
}
