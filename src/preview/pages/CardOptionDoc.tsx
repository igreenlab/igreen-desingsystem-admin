import { useState } from "react";
import { Bluetooth, Truck, Wifi, Zap } from "lucide-react";
import { CardOption, CardOptionGroup } from "../../components/ui/CardOption";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

/* ═══════════════════════════════════════════════════════════════════════════
   CardOption — controle de formulário como card clicável
   ═══════════════════════════════════════════════════════════════════════════ */

const TOC = [
  { id: "quando", label: "Qual type, e lista ou cards" },
  { id: "examples", label: "Examples" },
  { id: "ex-checkbox", label: "Checkbox" },
  { id: "ex-radio", label: "Radio (grupo obrigatório)" },
  { id: "ex-switch", label: "Switch em lista" },
  { id: "ex-list-radio", label: "Lista serve pros três tipos" },
  { id: "ex-list-highlight", label: "Lista com destaque (opcional)" },
  { id: "ex-sizes", label: "Tamanhos" },
  { id: "ex-icon", label: "Com ícone" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "type", type: '"checkbox" | "radio" | "switch"', defaultVal: 'herda do grupo, ou "checkbox"' },
  { name: "value", type: "string — obrigatório com type=\"radio\"", defaultVal: "—" },
  { name: "size", type: '"sm" | "md" | "lg"', defaultVal: '"md"' },
  { name: "orientation", type: '"left" | "right" — omita, deriva do type', defaultVal: "left · switch: right" },
  { name: "highlightSelected", type: "boolean — fundo + cor de borda no selecionado", defaultVal: "deriva do type · em lista: false" },
  { name: "label", type: "ReactNode (obrigatório)", defaultVal: "—" },
  { name: "description", type: "ReactNode", defaultVal: "—" },
  { name: "icon", type: "ReactNode (decorativo, aria-hidden)", defaultVal: "—" },
  { name: "checked / onCheckedChange", type: "controlado (no radio, manda o grupo)", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "—" },
  { name: "CardOptionGroup.layout", type: '"spaced" | "list"', defaultVal: '"spaced"' },
  { name: "CardOptionGroup.highlightSelected", type: "boolean — liga/desliga em todos os filhos", defaultVal: "—" },
  { name: "CardOptionGroup (radio)", type: "value · defaultValue · onValueChange · name", defaultVal: "—" },
];

/**
 * Tabela de decisão — mesmo desenho da que o `AlertDialogDoc` usa pra separar
 * AlertModal/AlertDialog/Dialog. Fica local porque são duas na página e o markup repetido
 * três vezes já é a hora de nomear.
 */
function DecisionTable({
  titulo,
  coluna,
  linhas,
}: {
  titulo: string;
  coluna: string;
  linhas: string[][];
}) {
  return (
    <div className="flex flex-col gap-gp-lg">
      <p className="text-body-md font-medium text-fg-default">{titulo}</p>
      <div className="overflow-hidden rounded-radius-base border border-border-subtle">
        <div className="grid grid-cols-[180px_1fr] gap-0 border-b border-border-subtle bg-bg-subtle">
          <div className="px-pad-xl py-pad-md text-body-xs font-medium text-fg-default">
            {coluna}
          </div>
          <div className="px-pad-xl py-pad-md text-body-xs font-medium text-fg-default">Quando</div>
        </div>
        {linhas.map(([chave, quando]) => (
          <div
            key={chave}
            className="grid grid-cols-[180px_1fr] gap-0 border-t border-border-subtle"
          >
            <div className="px-pad-xl py-pad-md">
              <code className="font-mono text-code-sm text-fg-brand">{chave}</code>
            </div>
            <div className="px-pad-xl py-pad-md text-body-md text-fg-muted">{quando}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardOptionDoc() {
  const [salvar, setSalvar] = useState(true);
  const [notificar, setNotificar] = useState(false);
  const [frete, setFrete] = useState("express");
  const [wifi, setWifi] = useState(true);
  const [bt, setBt] = useState(false);
  const [airdrop, setAirdrop] = useState(true);
  const [tamanho, setTamanho] = useState(true);
  const [comIcone, setComIcone] = useState(true);
  const [plano, setPlano] = useState("pro");
  const [planoPintado, setPlanoPintado] = useState("anual");

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Form Controls"
        title="CardOption"
        description="Checkbox, radio ou switch apresentado como card clicável — área grande, label + descrição. Substitui os três padrões que antes divergiam: o CardCheckbox, o Card Selection do radio e o Card Toggle do switch."
      />

      <SectionH2 id="quando" title="Qual type, e lista ou cards" />
      <div className="mb-14 flex flex-col gap-gp-2xl">
        <p className="text-body-md text-fg-muted">
          O componente é um só, mas duas decisões vêm antes de escrevê-lo — e as duas são{" "}
          <strong className="text-fg-default">sobre a decisão do usuário</strong>, não sobre
          aparência.
        </p>

        <DecisionTable
          coluna="Qual type"
          titulo="1. O que o usuário está decidindo"
          linhas={[
            [
              'type="switch"',
              "Liga/desliga uma funcionalidade com efeito IMEDIATO — sem Salvar. A NN/g é literal: o switch “should take immediate effect and should not require the user to click Save or Submit”. Numa tela com botão Salvar o usuário não sabe se já valeu: ali o controle é checkbox.",
            ],
            [
              'type="radio"',
              "Uma entre várias mutuamente exclusivas, e o usuário precisa ver todas pra decidir: meio de pagamento, endereço, forma de entrega, plano.",
            ],
            [
              'type="checkbox"',
              "Combinação livre — zero, uma ou várias (permissões, o que incluir). E é o substituto do switch quando a tela tem submit.",
            ],
            [
              "nenhum dos três",
              "Acima de ~5 opções, CardOption vira parede de cards: use Select ou Combobox. E on/off de UMA coisa nunca são dois radios — é um switch (imediato) ou um checkbox (com submit).",
            ],
          ]}
        />

        <DecisionTable
          coluna="Qual layout"
          titulo="2. Quanta comparação a decisão pede"
          linhas={[
            [
              'layout="list"',
              "Itens do mesmo tipo, rótulo curto, decisão já conhecida: configurações (switch), permissões (checkbox), meio de pagamento / endereço / entrega (radio). Densidade vale mais que destaque. O switch vive AQUI — a Apple HIG manda usar o switch “only in a list row”, porque ele tem mais peso visual que um checkbox e isso só se justifica quando a linha inteira lhe dá contexto.",
            ],
            [
              "spaced (default)",
              "Cada opção precisa ser COMPARADA — preço, descrição longa, ícone, badge: plano, tier, onboarding. O gap é justamente o que separa as unidades de comparação.",
            ],
          ]}
        />

        <p className="text-body-sm text-fg-subtle">
          Fontes:{" "}
          <a
            className="underline hover:text-fg-default"
            href="https://www.nngroup.com/articles/toggle-switch-guidelines/"
            target="_blank"
            rel="noreferrer"
          >
            NN/g — Toggle-Switch Guidelines
          </a>
          {" · "}
          <a
            className="underline hover:text-fg-default"
            href="https://developers.apple.com/design/human-interface-guidelines/components/selection-and-input/toggles/"
            target="_blank"
            rel="noreferrer"
          >
            Apple HIG — Toggles
          </a>
          {" · "}
          <a
            className="underline hover:text-fg-default"
            href="https://baymard.com/blog/payment-method-selection"
            target="_blank"
            rel="noreferrer"
          >
            Baymard — Payment Method Selection
          </a>
          {" · "}
          <a
            className="underline hover:text-fg-default"
            href="https://soul.emplifi.io/latest/components/in-progress/radio-button-card-Pnx3WsEU"
            target="_blank"
            rel="noreferrer"
          >
            Soul DS — Radio button card
          </a>
        </p>
      </div>

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-checkbox"
        title="Checkbox"
        description="O default. Controle à esquerda e card destacado quando selecionado."
        code={`<CardOption
  label="Salvar essa conta pra usar depois"
  description="Aparece na lista de contas favoritas"
  checked={salvar}
  onCheckedChange={setSalvar}
/>`}
      >
        <div className="flex w-full max-w-md flex-col gap-gp-lg">
          <CardOption
            label="Salvar essa conta pra usar depois"
            description="Aparece na lista de contas favoritas"
            checked={salvar}
            onCheckedChange={setSalvar}
          />
          <CardOption
            label="Receber aviso por e-mail"
            description="Um resumo por dia, sem promoções"
            checked={notificar}
            onCheckedChange={setNotificar}
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-radio"
        title="Radio (grupo obrigatório)"
        description="type='radio' exige o CardOptionGroup em volta — é ele que vira o RadioGroup do Radix e dá navegação por seta + agrupamento por name. Checkbox e switch funcionam soltos."
        code={`<CardOptionGroup type="radio" value={frete} onValueChange={setFrete}>
  <CardOption value="standard" label="Standard" description="4 a 10 dias úteis" />
  <CardOption value="express" label="Express" description="2 a 3 dias úteis" />
  <CardOption value="overnight" label="Overnight" description="Próximo dia útil" />
</CardOptionGroup>`}
      >
        <div className="w-full max-w-md">
          <CardOptionGroup type="radio" value={frete} onValueChange={setFrete}>
            <CardOption value="standard" label="Standard" description="4 a 10 dias úteis" />
            <CardOption value="express" label="Express" description="2 a 3 dias úteis" />
            <CardOption value="overnight" label="Overnight" description="Próximo dia útil" />
          </CardOptionGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-switch"
        title="Switch em lista"
        description="Switch vai à DIREITA e SEM destaque de selecionado — os dois derivam do type. Switch é estado, não seleção: uma lista de settings toda pintada de verde é ruído. O ícone, quando existe, permanece à esquerda. E layout='list' vale pros três tipos, não só switch (ver o exemplo abaixo)."
        code={`<CardOptionGroup type="switch" layout="list">
  <CardOption label="Wi-Fi" description="Conectar a redes sem fio" checked={wifi} onCheckedChange={setWifi} />
  <CardOption label="Bluetooth" description="Permitir conexões Bluetooth" checked={bt} onCheckedChange={setBt} />
</CardOptionGroup>`}
      >
        <div className="w-full max-w-md">
          <CardOptionGroup type="switch" layout="list">
            <CardOption
              label="Wi-Fi"
              description="Conectar a redes sem fio"
              icon={<Wifi className="size-icon-sm text-fg-subtle" />}
              checked={wifi}
              onCheckedChange={setWifi}
            />
            <CardOption
              label="Bluetooth"
              description="Permitir conexões Bluetooth"
              icon={<Bluetooth className="size-icon-sm text-fg-subtle" />}
              checked={bt}
              onCheckedChange={setBt}
            />
            <CardOption
              label="AirDrop"
              description="Compartilhar com dispositivos próximos"
              icon={<Zap className="size-icon-sm text-fg-subtle" />}
              checked={airdrop}
              onCheckedChange={setAirdrop}
            />
          </CardOptionGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-list-radio"
        title="Lista serve pros três tipos"
        description="layout='list' não é exclusivo do switch: com radio vira um seletor de linha única; com checkbox, uma lista de permissões. O contorno é do grupo e a divisória é a borda de baixo de cada item, com a última suprimida. Em lista o destaque de selecionado vem DESLIGADO por default — quem mostra o estado é o controle (ver o exemplo seguinte pra ligar)."
        code={`<CardOptionGroup type="radio" layout="list" value={plano} onValueChange={setPlano}>
  <CardOption value="free" label="Gratuito" description="Até 3 projetos" />
  <CardOption value="pro" label="Pro" description="Projetos ilimitados" />
</CardOptionGroup>`}
      >
        <div className="flex w-full max-w-md flex-col gap-gp-2xl">
          <CardOptionGroup type="radio" layout="list" value={plano} onValueChange={setPlano}>
            <CardOption value="free" label="Gratuito" description="Até 3 projetos" />
            <CardOption value="pro" label="Pro" description="Projetos ilimitados" />
            <CardOption value="empresa" label="Empresa" description="SSO e auditoria" />
          </CardOptionGroup>
          <CardOptionGroup type="checkbox" layout="list">
            <CardOption label="Ler" description="Ver registros e relatórios" defaultChecked />
            <CardOption label="Escrever" description="Criar e editar registros" defaultChecked />
            <CardOption label="Excluir" description="Remover registros em definitivo" />
          </CardOptionGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-list-highlight"
        title="Lista com destaque (opcional)"
        description="highlightSelected liga o fundo + a cor de borda na linha selecionada. Em lista o default é desligado, porque a única borda do item é a de baixo — a divisória — então a cor não contorna o selecionado, pinta a linha que separa ele do vizinho. Compare com o exemplo acima e escolha: linha limpa (default) ou linha pintada."
        code={`{/* default em lista: sem pintura, o estado é do controle */}
<CardOptionGroup type="radio" layout="list">…</CardOptionGroup>

{/* pintado: liga no grupo (ou item por item) */}
<CardOptionGroup type="radio" layout="list" highlightSelected>…</CardOptionGroup>`}
      >
        <div className="w-full max-w-md">
          <CardOptionGroup
            type="radio"
            layout="list"
            highlightSelected
            value={planoPintado}
            onValueChange={setPlanoPintado}
          >
            <CardOption value="mensal" label="Mensal" description="Cobrado todo mês" />
            <CardOption value="anual" label="Anual" description="Dois meses de desconto" />
            <CardOption value="vitalicio" label="Vitalício" description="Pagamento único" />
          </CardOptionGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Tamanhos"
        description="sm 8px · md 12px (default, o calibrado) · lg 16px de padding. O label sobe um degrau no lg."
        code={`<CardOption size="sm" label="…" />
<CardOption label="…" />          {/* md */}
<CardOption size="lg" label="…" />`}
      >
        <div className="flex w-full max-w-md flex-col gap-gp-lg">
          {(["sm", "md", "lg"] as const).map((s) => (
            <CardOption
              key={s}
              size={s}
              label={`size="${s}"${s === "md" ? " (default)" : ""}`}
              description="Plano anual, cobrado uma vez por ano"
              checked={tamanho}
              onCheckedChange={setTamanho}
            />
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-icon"
        title="Com ícone"
        description="O ícone entra entre o controle e o texto, decorativo (aria-hidden)."
        code={`<CardOption
  icon={<Truck className="size-icon-sm text-fg-subtle" />}
  label="Entrega expressa"
  description="Chega em 2 dias úteis"
/>`}
      >
        <div className="w-full max-w-md">
          <CardOption
            icon={<Truck className="size-icon-sm text-fg-subtle" />}
            label="Entrega expressa"
            description="Chega em 2 dias úteis"
            checked={comIcone}
            onCheckedChange={setComIcone}
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="opacity-50 + pointer-events-none. O DS não tem token de cor para desabilitado — o padrão é opacidade."
        code={`<CardOption label="…" disabled />
<CardOptionGroup type="switch" layout="list" disabled>…</CardOptionGroup>`}
      >
        <div className="flex w-full max-w-md flex-col gap-gp-lg">
          <CardOption label="Opção indisponível" description="Requer plano superior" disabled />
          <CardOption label="Já selecionada e travada" description="Definida pelo administrador" checked disabled />
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default CardOptionDoc;
