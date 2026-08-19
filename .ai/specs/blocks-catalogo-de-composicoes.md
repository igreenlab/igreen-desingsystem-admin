# Blocos — catálogo de composições referenciáveis por ID

> **Status: PROPOSTA (2026-08-19) — aguardando avaliação do mantenedor.** Nada implementado.
> Este arquivo existe pra ser avaliado e para **não evaporar**: o desenho anterior desta mesma
> ideia (códigos `DSGREEN-B-###`, `blocks-catalog.json`, 5 fases) foi feito em plan mode, morava
> em `~/.claude/plans/` e **desapareceu** — sobraram 8 linhas de resumo num item de backlog.
> Ver [`README.md`](./README.md) pra convenção de status.

---

## 1. O problema, em uma frase

A IA conhece os componentes e os tokens. Ela **não** conhece composição.

Pedido real de vibe-coder: *"faz uma tela com gráficos e KPIs"*. O que sai: KPIs de um lado,
gráficos de outro, tudo dentro do padrão de tokens e espaçamento — **correto, e pior** do que os
34 cards do `#/chart-showcase`, onde o UX embutiu o KPI dentro do chart-card, escolheu o arranjo
que lê bem e resolveu a hierarquia visual. Esse conhecimento não está em lugar que a IA alcance,
e ela não o inventa.

Os blocos existem pra isso: **tornar a inteligência de composição endereçável.**

---

## 2. As três camadas, e por que blocos não substituem nada

| camada | pergunta que responde | instalado? | rigor |
|---|---|---|---|
| **componentes** | "com o que eu construo?" | sim (npm + registry) | máximo — 8 superfícies, USAGE, DocPage, 34 gates |
| **exemplos** (`chat`, `crud`, `finance`, …) | "como uma tela inteira fica?" | **sim, no scaffold** | médio — drift-check, extração 1:1 |
| **blocos** | "como o UX **combinou** essas peças?" | **não** — só por ID | mínimo |

**Os exemplos ficam como estão**, e a razão é do mantenedor: eles são **rede de segurança**. Se o
vibe-coder cortar o pipeline ou não passar link, o exemplo está no projeto dele e a IA o encontra
navegando; e quem instala não recebe projeto vazio. O bloco depende de ser citado — é opt-in por
natureza. Complementares, não concorrentes.

**`.ai/context/components/dashboard-patterns.md` fica como está por ora**, por decisão do
mantenedor: ele resolve bem hoje. Depois do primeiro bloco real, reavaliar se cabe como bloco,
como exemplo, ou ambos. ⚠️ Registrar aqui que há **sobreposição de conteúdo** (6 receitas
numeradas, 20 blocos de código, com nomes que são literalmente blocos) — se as duas coisas
coexistirem sem ponteiro de uma pra outra, divergem.

---

## 3. O que JÁ existe (medido em 2026-08-19, não estimado)

### 3.1 Os blocos já estão escritos — falta ID e endereço

`src/preview/pages/ChartShowcaseDoc.tsx`, 1846 linhas:

```
34 componentes de card:  SaaSRevenueCard · DbInstanceCard · FinanceCard · TotalRevenueCard · …
cada um com seus dados IMEDIATAMENTE acima:
      REV_DATA + revConfig  →  SaaSRevenueCard
      DB_DATA  + dbConfig   →  DbInstanceCard
      FIN_DATA + finConfig  →  FinanceCard
```

Cada card é praticamente **auto-contido**. Não é construir do zero — é destacar.

### 3.2 Os 5 helpers compartilhados são o único acoplamento

`C` (paleta local) · `Panel` · `CardHead` · `SectionLabel` · `KPI_LABEL`.

⚠️ **`CardHead` e `SectionLabel` não existem como componente do DS**, e o `Panel` local é um
`<section>` de 5 classes — nada a ver com o `Panel` do DS (que é drawer com header/body/footer).
Um bloco extraído sem esses helpers **não compila**. É a L-037 (o item declara todas as deps
reais) e a L-034 (extração reescreve imports) — foi assim que o `data-table` quebrou no consumidor
por 2 imports não declarados.

### 3.3 O `type` do registry é etiqueta, não comportamento

```
itens:    84 × registry:ui    7 × registry:file
arquivos: 429 × registry:ui   57 × registry:file
```

Mas **ninguém no repo lê `item.type`** (grep em `scripts/` e `registry-app/`: zero consumidores).
O caminho de instalação é decidido só pelo `target`:

```js
// cli/templates/default/scripts/igreen-add.mjs:56
const localPath = (target) => (target.startsWith("src/") ? target : "src/" + target);
```

**Consequência prática:** adicionar `registry:block` custa **zero** — nada quebra, nada muda na
instalação. O valor dele é permitir que os gates apliquem regra diferente (ver §6).

### 3.4 Os canais, e por que "não vem no npm" é o default

| canal | como alcança o bloco | pesa no bundle do consumidor? |
|---|---|---|
| **submódulo** (maioria hoje) | lê o arquivo no repo, direto | não |
| copy-in / registry | `igreen:add` só se pedir | não |
| npm | **nada** — bloco fora do barrel | **zero** |

`src/components/index.ts` é o que define o canal npm. Arquivo fora dele não viaja. O requisito
"não quero que venha ao instalar" é atendido por **não colocar no barrel** — não precisa de
mecanismo novo.

> Nota: os `example-*` de hoje **já** custam 1707 KB de tarball (`dist-lib/preview/*`), mas como
> são subpaths opt-in (`./preview/clientes`) e o barrel raiz não os importa, o custo no **bundle**
> de quem não usa é 0 KB. Blocos ficam ainda mais baratos: nem no tarball.

---

## 4. Decisão de arquitetura: inverter a fonte de verdade

O modelo dos `example-*` é: **o showcase define, o exemplo é cópia extraída à mão** — e por isso
precisa do `examples-drift-check` (hash da fonte) avisando quando divergem. Funciona, mas é
vigilância sobre duplicação.

Pra blocos, **inverter**:

> o arquivo do bloco é a **fonte**; a página da galeria **importa e renderiza** ele.

| | modelo `example-*` (cópia) | bloco como fonte |
|---|---|---|
| drift | possível → precisa de gate | **impossível** — há uma definição só |
| o que a IA busca | a cópia, que pode estar velha | o arquivo exato que a galeria renderiza |
| adicionar bloco novo | extrair + sincronizar + baseline | **1 arquivo + 1 linha de índice** |
| "print" da doc | envelhece em silêncio | é o render ao vivo, autoverificável |

Isso serve direto o requisito **"blocos crescem esporadicamente"**: viu um arranjo novo, cria o
arquivo, e ele aparece na galeria e no índice pelo mesmo ato.

---

## 5. Os dois fluxos

### 5.1 Autor (mantenedor + pipeline atual)

```
vê um arranjo novo que vale compartilhar
  → cria src/blocks/<categoria>/<nome>.tsx
  → declara ID + descrição de 1 linha + o que usa
  → a galeria do showcase renderiza automaticamente (importa do arquivo)
  → o índice é GERADO a partir das declarações
  → [opcional] item registry:block, SÓ se o bloco traz arquivo próprio (fixture/helper)
```

### 5.2 Consumidor (vibe-coder)

```
navega a galeria pública por categoria
  → acha a composição que quer
  → copia o ID (ou o botão "copiar prompt": «use a referência DSGREEN-B-0012 aqui»)
  → cita no chat
  → a IA resolve o ID pelo índice → lê o arquivo do bloco → adapta na tela dele
```

**A maioria dos blocos não tem arquivo pra puxar** — eles compõem componentes que já existem, e o
"conteúdo" é a estrutura. Só bloco que traz um dado ou helper próprio precisa de item no registry.
Isso mata a poluição na origem: o catálogo pode ir a 100+ blocos sem nenhum item novo.

---

## 6. Agentes e skills — quantos de verdade

**Zero agentes novos.** A L-036 já mediu isso pro consumidor: roteamento de intenção é **skill**
(nativo e barato pela `description`), agente só pra trabalho pesado. E bloco não tem o que um
agente gerencia: não há cascata de token, não há gate de aprovação (Regra 4 vale pra token e
componente novos, não pra composição de peças existentes), não há `tsc` sobre API pública.

O que precisa:

| peça | onde | por quê |
|---|---|---|
| **1 skill** `block-builder` | `.claude/skills/block-builder/` | criar bloco tem checklist: ID único, arquivo, deps declaradas, entrada de índice, render na galeria |
| **1 command** `/ds-create-block` | `.claude/commands/` | entry point |
| **linha no `orchestrator.md`** | `.claude/agents/` | senão a skill existe e não é roteada (L-047) |
| **~10 linhas no `ds-kit`** (consumidor) | `cli/templates/default/_claude/skills/ds-kit/SKILL.md` | um "Passo 0": *se o usuário citou um ID de bloco → resolva pelo índice antes de classificar intenção* |

⚠️ **Custo real, pela L-047:** skill builder nova toca **4 superfícies de roteamento**. As 4 estão
na tabela acima de propósito — é o que a DoD exige, e é o que faltou quando o `list-builder`
nasceu sem rota no orchestrator.

---

## 7. Gates — o que precisa e o que NÃO precisa

**Precisa (1 módulo pequeno):**

- **ID único e resolvível** — dois blocos com o mesmo ID, ou ID citado no índice sem arquivo
  correspondente, reprova
- **bloco compila sozinho** — deps declaradas de fato (o problema dos 5 helpers, §3.2)
- **índice gerado, nunca escrito à mão** — se for lista manual, divergirá. Esta sessão teve 3
  itens de backlog vencidos, um plano desaparecido e 2 versões inventadas na doc, todos por
  divergência que ninguém forçava a fechar

**NÃO precisa** — e é o que faz o pipeline ser "menos rigoroso" de forma mecânica, não por
convenção que alguém lembra:

- ❌ `USAGE.md` por bloco · ❌ DocPage por bloco · ❌ entrada no vocabulário do consumidor ·
  ❌ barrel · ❌ inventory · ❌ gate de aprovação

> É por isso que o `registry:block` importa mesmo custando zero em comportamento: hoje o
> `distribution-debt` cobra registry + vocabulário de tudo em `ui/`, e o hook `ds-inventory-check`
> cobra USAGE + inventory + registry + vocabulário + **DocPage com rota**. Se blocos entrassem
> como item normal, **os gates passariam a cobrar paperwork de componente de cada bloco**. Um
> `type` próprio é o que permite os gates dizerem "este é bloco, regra diferente".

---

## 8. Fases

| fase | o que | por que nesta ordem |
|---|---|---|
| **0** | decidir como o bloco declara o ID · criar `src/blocks/_shared/` com os 5 helpers · extrair **UM** bloco real (o mais complexo do chart-showcase) e provar o ciclo inteiro | provar o mecanismo num caso real antes de escalar — 34 extrações com o desenho errado é 34 retrabalhos |
| **1** | inverter a fonte: a galeria passa a importar dos arquivos, para os 34 | mecânico depois que a Fase 0 fecha o formato |
| **2** | índice gerado + o gate de §7 | só faz sentido com N blocos existindo |
| **3** | Passo 0 no `ds-kit` + payload do consumidor | é o que liga o vibe-coder ao catálogo |
| **4** | `registry:block` para os blocos que trazem arquivo | exceção, não regra |

A Fase 0 é a única que exige decisão de desenho. As outras são execução.

---

## 9. Decisões abertas — são do mantenedor

1. **Como o bloco declara o ID.** Recomendação: **no próprio arquivo**
   (`export const BLOCK = { id: "DSGREEN-B-0012", nome, descricao, usa: [...] }`), pra o índice ser
   **gerado**. A alternativa (lista à mão) exige sincronia humana, e esta sessão inteira foi sobre
   o que acontece quando ninguém força sincronia.
2. **Esquema do ID.** O desenho perdido tinha **dois** espaços (`-B-` e `-U-`) e **o que distinguia
   um do outro não sobreviveu**. Recomendação: começar com **um** espaço só; categoria vira campo,
   não prefixo.
3. **Onde a galeria mora.** Recomendação: **seção própria dentro do showcase**, com nav separada
   dos componentes, uma página por categoria. Razão mecânica: o showcase é o único lugar onde
   render e código vivem juntos e passam por `tsc`. Página separada teria que duplicar o render
   (drift) ou usar **print** — e print não tem gate, envelhece em silêncio.
4. **Descrição no índice.** Recomendação: **obrigatória, 1 linha.** `bloco-grafico-3` a IA resolve
   por índice; `DSGREEN-B-0012 — chart-card com KPI embutido e sparkline` ela resolve **e entende o
   que vai compor** antes de abrir o arquivo — e acerta mesmo quando o humano cita de memória e
   erra o número.
5. **`dashboard-patterns.md`** — adiado por decisão do mantenedor até o primeiro bloco real existir.

---

## 10. Riscos

- **Bloco que não compila sozinho é pior que bloco nenhum.** O consumidor pede a referência,
  recebe código que quebra, e conclui que o DS está errado. Mitigação: o gate de deps declaradas
  da Fase 2, e a Fase 0 provando com um caso real.
- **ID tem que ser estável pra sempre.** Renumerar quebra citação — inclusive citação que vive
  fora do repo (ticket, Figma, conversa antiga). Nunca reordenar; bloco removido deixa o ID vago.
- **Crescimento.** 34 hoje, 100+ depois. A galeria numa página só fica impraticável; a divisão por
  categoria da Fase 1 precisa já nascer pensando nisso.
- **O bloco herda os defeitos do exemplo que o originou.** Duas vezes em 2026-08-19 o exemplo
  canônico ensinou o contrário da regra escrita (`width` fixo na coluna de ações; footer do alert
  dialog sem largura cheia) e a IA copiou o hábito. **Um catálogo de blocos multiplica o alcance
  disso** — se o bloco estiver errado, ele estará errado com endereço fixo e citado por muita
  gente. É o argumento mais forte pra a receita nomear a **intenção** (qual token, por quê) e não
  só entregar o trecho: quando receita e código divergem, a divergência fica visível.

---

## 11. O que este plano NÃO resolve

Blocos atacam **composição**, não correção. O defeito que mais custou nesta sessão foi de
conteúdo, não de resolução: a IA achou o exemplo certo e copiou o hábito errado dele. Um ID
determinístico teria levado ao **mesmo** exemplo defeituoso, mais rápido. Blocos melhoram o teto
de qualidade da composição; não substituem os gates que garantem que o que se copia está certo.
