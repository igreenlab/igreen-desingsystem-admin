import { useState } from "react";
import { Building2, Lock, User } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbSwitcher,
} from "../../components/ui/Breadcrumb";
import { Button } from "../../components/ui/Button";
import { Chip } from "../../components/ui/Chip";
import { Header } from "../../components/ui/Header";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const CLIENTES = [
  {
    value: "c1",
    label: "Maria Silva",
    description: "CPF 123.456.789-00 · 3 UCs",
    keywords: ["12345678900"],
    leading: <User className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden />,
    group: "Recentes",
  },
  {
    value: "c2",
    label: "Comercial Andrade LTDA",
    description: "CNPJ 12.345.678/0001-90 · 12 UCs",
    keywords: ["12345678000190"],
    leading: <Building2 className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden />,
    group: "Recentes",
  },
  {
    value: "c3",
    label: "João Pedro Costa",
    description: "CPF 987.654.321-00 · 1 UC",
    leading: <User className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden />,
    group: "Todos os clientes",
  },
  {
    value: "c4",
    label: "Padaria do Bairro ME",
    description: "CNPJ 98.765.432/0001-10 · 2 UCs",
    leading: <Building2 className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden />,
    group: "Todos os clientes",
  },
  {
    value: "c5",
    label: "Transportes Vale Verde",
    description: "CNPJ 45.678.912/0001-33 · 8 UCs",
    leading: <Lock className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden />,
    group: "Todos os clientes",
  },
];

const UCS = [
  { value: "uc-1", label: "UC 7001234567", description: "Rua das Palmeiras, 120 — SP" },
  { value: "uc-2", label: "UC 7009876543", description: "Av. Brasil, 3400 — SP" },
  { value: "uc-3", label: "UC 7005558888", description: "Rod. Anhanguera, km 32 — Jundiaí" },
];

const TOC = [
  { id: "ex-caminho", label: "O caminho (items)" },
  { id: "ex-composto", label: "Composição" },
  { id: "quando", label: "Quando o item vira seletor" },
  { id: "ex-basico", label: "No breadcrumb" },
  { id: "ex-header", label: "No Header do app" },
  { id: "ex-dois", label: "Dois níveis trocáveis" },
  { id: "api", label: "API" },
  { id: "decisoes", label: "Decisões" },
];

const PROPS = [
  { name: "value / onValueChange", type: "string / (v: string) => void — controlado; o componente NÃO navega", defaultVal: "—" },
  { name: "options", type: "BreadcrumbSwitcherOption[] — { value, label, leading?, description?, keywords?, group? }", defaultVal: "—" },
  { name: "placeholder", type: "ReactNode — quando o value não está na lista (carregando, registro removido)", defaultVal: "o próprio value" },
  { name: "title", type: "ReactNode — cabeçalho do dropdown", defaultVal: "—" },
  { name: "searchPlaceholder", type: "string", defaultVal: '"Buscar…"' },
  { name: "emptyMessage", type: "ReactNode", defaultVal: '"Nada encontrado."' },
  { name: "footer", type: "ReactNode — fica fora da área que rola", defaultVal: "—" },
  { name: "open / onOpenChange", type: "abertura controlada (atalho de teclado)", defaultVal: "—" },
  { name: "align", type: '"start" | "center" | "end"', defaultVal: '"start"' },
  { name: "aria-label", type: "string", defaultVal: '"Trocar registro aberto"' },
];

const PROPS_CAMINHO = [
  { name: "items", type: "BreadcrumbItemData[] — { label, href?, onClick?, switcher?, value?, onValueChange? }. SEM isto, renderiza children no primitivo", defaultVal: "—" },
  { name: "size", type: '"sm" (13px cadeia / 16px item único — o do Header) | "md" (14px — o do primitivo)', defaultVal: '"md"' },
  { name: "separator", type: "ReactNode — separador entre itens", defaultVal: "ChevronRight 14px" },
];

export function BreadcrumbDoc() {
  const [cliente, setCliente] = useState("c1");
  const [clienteHeader, setClienteHeader] = useState("c2");
  const [clienteDuplo, setClienteDuplo] = useState("c1");
  const [uc, setUc] = useState("uc-1");

  const achar = (v: string) => CLIENTES.find((c) => c.value === v);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Navigation"
        title="Breadcrumb"
        description="O caminho até onde o usuário está. Em página de detalhe, o item do registro aberto pode virar SELETOR (BreadcrumbSwitcher): o nome do que está aberto abre uma lista com busca pra pular direto pra outro — o padrão do seletor de repositório do GitHub."
      />
      <DocSeparator />

      <ExampleSection
        id="ex-caminho"
        title="O caminho — dados entram, cadeia sai"
        description="É o modo de 95% das telas: passe items e o componente resolve o resto — último item não vira link (é a página atual), separador entre itens, truncagem. size=sm é o do Header (13px na cadeia, 16px quando há um item só); md é o do primitivo."
        code={`<Breadcrumb
  items={[
    { label: "Início", href: "/" },
    { label: "Clientes", href: "/clientes" },
    { label: "Maria Silva" },   // sem href = página atual
  ]}
/>`}
      >
        <div className="flex w-full flex-col gap-gp-2xl">
          <Breadcrumb
            items={[
              { label: "Início", href: "#" },
              { label: "Clientes", href: "#" },
              { label: "Maria Silva" },
            ]}
          />
          <div className="flex flex-col gap-gp-md">
            <span className="text-caption-md text-fg-subtle">size="sm" (o do Header)</span>
            <Breadcrumb
              size="sm"
              items={[
                { label: "Início", href: "#" },
                { label: "Clientes", href: "#" },
                { label: "Maria Silva" },
              ]}
            />
            <span className="text-caption-md text-fg-subtle">
              um item só = título da página (16px)
            </span>
            <Breadcrumb size="sm" items={[{ label: "Dashboard" }]} />
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-composto"
        title="Composição — quando `items` não dá conta"
        description="Sem items, o componente renderiza children no primitivo. É a saída pra interpor algo no meio do caminho (um Chip de ambiente, um ícone) ou estilizar item a item. Os primitivos saem do MESMO import; quem quiser o cru, sem o wrapper, importa de shadcn/breadcrumb."
        code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="#">Clientes</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <Chip size="sm" color="warning" variant="soft">homologação</Chip>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>Maria Silva</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Clientes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <Chip size="sm" color="warning" variant="soft">
                homologação
              </Chip>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Maria Silva</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ExampleSection>

      <SectionH2 id="quando" title="Quando o item vira seletor" />

      <ExampleSection
        id="ex-quando"
        title="O problema que ele resolve"
        description="Numa página de detalhe, a próxima coisa que o usuário quer quase nunca é voltar à lista — é abrir OUTRO registro do mesmo tipo. Sem o seletor, isso custa: voltar, esperar a lista, procurar, clicar. Com ele, custa um clique e três letras."
      >
        <ul className="flex w-full flex-col gap-gp-md text-body-sm text-fg-muted">
          <li>
            <strong className="text-fg-default">Use</strong> quando a página mostra UM registro
            entre muitos parecidos: ficha de cliente, detalhe de UC, contrato, chamado.
          </li>
          <li>
            <strong className="text-fg-default">Não use</strong> pra navegar entre seções fixas
            (isso é o caminho normal do breadcrumb, com link), nem pra escolher um valor de
            formulário — aí é <code className="text-code-sm">combobox</code>, que tem cara de
            campo justamente porque coleta um valor.
          </li>
          <li>
            <strong className="text-fg-default">Acima de ~1.000 registros</strong>, a lista local
            deixa de servir: pagine antes de entregar as opções (a busca do componente filtra o
            que você passou, não o servidor).
          </li>
        </ul>
      </ExampleSection>

      <ExampleSection
        id="ex-basico"
        title="No breadcrumb"
        description="O gatilho tem a tipografia dos irmãos do caminho e nenhuma borda em repouso — só ganha superfície no hover e enquanto o dropdown está aberto. A seta dupla é o que o distingue de um link: link vai pra outro lugar, isto troca o que está aberto."
        code={`<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="#">Clientes</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbSwitcher
        value={cliente}
        onValueChange={setCliente}
        options={CLIENTES}
        title="Trocar cliente"
        searchPlaceholder="Buscar por nome ou documento…"
        footer={<Button variant="ghost" size="sm">Ver todos os clientes</Button>}
        aria-label="Trocar cliente"
      />
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}
      >
        <div className="flex w-full flex-col gap-gp-2xl">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Clientes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbSwitcher
                  value={cliente}
                  onValueChange={setCliente}
                  options={CLIENTES}
                  title="Trocar cliente"
                  searchPlaceholder="Buscar por nome ou documento…"
                  footer={
                    <Button variant="ghost" color="secondary" size="sm" className="w-full justify-start">
                      Ver todos os clientes
                    </Button>
                  }
                  aria-label="Trocar cliente"
                />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="rounded-radius-lg border border-border-default bg-bg-surface p-pad-3xl">
            <div className="flex items-center justify-between gap-gp-xl">
              <div>
                <p className="text-body-md font-semibold text-fg-default">
                  {achar(cliente)?.label}
                </p>
                <p className="text-body-sm text-fg-muted">{achar(cliente)?.description}</p>
              </div>
              <Chip size="md" color="success" variant="soft">
                Ativo
              </Chip>
            </div>
          </div>
          <p className="text-body-sm text-fg-muted">
            Busque por <code className="text-code-sm">12345678900</code>: o documento não aparece no
            rótulo, mas está em <code className="text-code-sm">keywords</code> — o campo pra tudo
            que o usuário sabe de cor e a tela não mostra. A busca é <strong>fuzzy</strong> (por
            subsequência, com score), então um CNPJ que compartilha dígitos pode vir junto, abaixo
            do resultado certo.
          </p>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-header"
        title="No Header do app"
        description="O item do breadcrumb do Header vira seletor quando recebe os TRÊS: switcher (a lista), value e onValueChange. Faltando um, ele continua texto — gatilho que abre lista vazia, ou que não sabe avisar a escolha, é pior que texto normal. No celular, onde a cadeia colapsa e sobra só o último item, o seletor continua ali: é justamente onde voltar à lista dói mais."
        code={`<Header
  breadcrumb={[
    { label: "Clientes", href: "/clientes" },
    {
      label: nomeDoCliente,
      switcher: CLIENTES,
      value: clienteId,
      onValueChange: abrirCliente,
      switcherTitle: "Trocar cliente",
    },
  ]}
/>`}
      >
        <div className="w-full overflow-hidden rounded-radius-lg border border-border-default">
          <Header
            breadcrumb={[
              { label: "Clientes", href: "#" },
              {
                label: achar(clienteHeader)?.label ?? "",
                switcher: CLIENTES,
                value: clienteHeader,
                onValueChange: setClienteHeader,
                switcherTitle: "Trocar cliente",
                switcherSearchPlaceholder: "Buscar por nome ou documento…",
              },
            ]}
            showSearch={false}
          />
          <div className="bg-bg-surface p-pad-3xl text-body-sm text-fg-muted">
            Conteúdo da ficha de <strong className="text-fg-default">{achar(clienteHeader)?.label}</strong>.
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-dois"
        title="Dois níveis trocáveis"
        description="Nada impede mais de um seletor na mesma cadeia — é o caso de cliente → UC, em que trocar o cliente troca a lista de UCs. O componente não sabe disso: quem cuida da dependência entre os dois é o consumidor, no onValueChange do primeiro."
      >
        <div className="flex w-full flex-col gap-gp-xl">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Clientes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbSwitcher
                  value={clienteDuplo}
                  onValueChange={(v) => {
                    setClienteDuplo(v);
                    setUc(UCS[0].value); // trocar o pai reseta o filho — decisão do consumidor
                  }}
                  options={CLIENTES}
                  title="Trocar cliente"
                  aria-label="Trocar cliente"
                />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbSwitcher
                  value={uc}
                  onValueChange={setUc}
                  options={UCS}
                  title="Trocar unidade consumidora"
                  searchPlaceholder="Buscar UC…"
                  aria-label="Trocar unidade consumidora"
                />
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <p className="text-body-sm text-fg-muted">
            Aberto: <strong className="text-fg-default">{achar(clienteDuplo)?.label}</strong> ·{" "}
            {UCS.find((u) => u.value === uc)?.label}
          </p>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API — BreadcrumbSwitcher" />
      <PropsTable items={PROPS} />
      <SectionH2 id="api-caminho" title="API — Breadcrumb" />
      <PropsTable items={PROPS_CAMINHO} />

      <SectionH2 id="decisoes" title="Decisões" />

      <ExampleSection id="ex-decisoes" title="Por que a peça é assim">
        <ul className="flex w-full flex-col gap-gp-lg text-body-sm text-fg-muted">
          <li>
            <strong className="text-fg-default">Por dentro é o mesmo `Command` do Combobox e do ⌘K.</strong>{" "}
            Busca, teclado e estado vazio não se reescrevem. O que muda é o gatilho.
          </li>
          <li>
            <strong className="text-fg-default">
              O gatilho é o caminho, não um campo.
            </strong>{" "}
            O <code className="text-code-sm">combobox</code> desenha borda e altura de input
            porque coleta um valor; aqui trocar o registro é <em>navegação</em>. Um campo de
            formulário no meio da trilha faria a página inteira parecer um formulário.
          </li>
          <li>
            <strong className="text-fg-default">Seta dupla, não `ChevronDown`.</strong> No
            caminho já existem itens clicáveis (os links); a seta de troca precisa se distinguir
            de “vai pra outro lugar”.
          </li>
          <li>
            <strong className="text-fg-default">Não navega.</strong>{" "}
            <code className="text-code-sm">onValueChange</code> devolve o valor e o consumidor
            decide — rota, fetch, estado. O mesmo componente serve pro app com router e pro
            painel que só troca um estado local.
          </li>
          <li>
            <strong className="text-fg-default">Grupos na ordem de `options`.</strong> “Recentes”
            antes de “Todos” é informação de quem montou a lista; ordenar alfabeticamente jogaria
            fora.
          </li>
          <li>
            <strong className="text-fg-default">O rodapé fica fora da área que rola.</strong>{" "}
            “Ver todos” que some junto com a lista não é saída.
          </li>
        </ul>
      </ExampleSection>
    </DocLayout>
  );
}
