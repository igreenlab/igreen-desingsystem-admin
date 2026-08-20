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

### 3.1 O material de referência existe — mas NÃO será migrado

`src/preview/pages/ChartShowcaseDoc.tsx`, 1846 linhas:

```
34 componentes de card:  SaaSRevenueCard · DbInstanceCard · FinanceCard · TotalRevenueCard · …
cada um com seus dados IMEDIATAMENTE acima:
      REV_DATA + revConfig  →  SaaSRevenueCard
      DB_DATA  + dbConfig   →  DbInstanceCard
      FIN_DATA + finConfig  →  FinanceCard
```

⛔ **A primeira versão desta spec propunha extrair os 34. Foi descartado pelo mantenedor, e a razão
é melhor que a minha proposta** (ver §4). Isto aqui fica registrado como **inventário de
referência visual** — o que já foi provado que funciona e vale reproduzir — não como fila de
migração. O `#/chart-showcase` **não é tocado**.

### 3.2 Os 5 helpers locais — e por que eles fundamentam a regra da §4.1

Os cards do showcase dependem de `C` (paleta local) · `Panel` · `CardHead` · `KPI_LABEL`.

⚠️ **`CardHead` não existe como componente do DS**, e o `Panel` local é um `<section>` de 5
classes — nada a ver com o `Panel` do DS (que é drawer com header/body/footer).

> **Correção de 2026-08-20:** este parágrafo listava `SectionLabel` como 5ª dependência **dos
> cards**, e não é. Medido no `ChartShowcaseDoc.tsx`: `CardHead` tem **20** usos, dentro dos cards;
> `SectionLabel` tem **5**, todos no nível da PÁGINA (linhas 1806–1840), separando as categorias da
> galeria — nenhum card o usa. Eu inventariei o **arquivo** e chamei de dependência do **card**, que
> é a mesma classe de erro que a spec inteira existe pra evitar: herdar decisão por acidente porque
> o código velho tinha aquilo perto. Não muda a conclusão da §4.1 — muda quem a fundamenta, e é
> `CardHead` sozinho.

**Este é o achado que justifica não migrar.** Extraindo, eu teria acabado promovendo o `CardHead` a
componente do DS ou fazendo ele viajar junto com cada bloco — e essa decisão teria sido tomada
**por acidente**, porque o código velho usava, não porque alguém achou que `CardHead` merece ser
componente. Construindo do zero, a pergunta é feita de propósito, e a resposta virou regra
(§4.1).

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

## 4. Decisão de arquitetura: linha nova, sem viés, e sem tocar no que funciona

> **Esta seção foi reescrita em 2026-08-19.** A primeira versão propunha extrair os 34 cards e
> reescrever o `ChartShowcaseDoc.tsx` (1846 linhas) pra importar dos arquivos de bloco. O
> mantenedor descartou, e por três razões que derrubam a minha proposta:
>
> 1. **Extração deixaria o formato legado definir o formato novo.** O desenho do bloco viraria "o
>    que a extração precisou", não "o que um bloco deve ser". O caso concreto está na §3.2.
> 2. **Bloco herda os defeitos do exemplo que o originou.** Migrar 34 cards migra 34 conjuntos de
>    hábitos, incluindo os errados — e em 2026-08-19 isso aconteceu **duas vezes** (o `width` fixo
>    na coluna de ações e o footer do alert dialog sem largura cheia, os dois copiados por IA a
>    partir do exemplo canônico). Escrevendo cada bloco, cada hábito é decisão.
> 3. **Refactor de risco numa página que funciona, por zero ganho visível.** O `#/chart-showcase`
>    resolve bem hoje.

**A decisão:** os blocos são uma **linha nova**, construída do zero, um por vez. O
`#/chart-showcase` **não é tocado**. O material dele é referência visual (§3.1), não fila de
migração.

⚠️ **"Replicar" significa reescrever chegando no mesmo resultado visual — NÃO copiar e colar.** Se
for copiar, o viés que a decisão evita volta pela porta dos fundos.

### 4.1 A regra que só o começo-do-zero permite impor

> **Bloco usa exclusivamente a API pública do DS** — componentes exportados e classes de token.
> Nada de helper local de página.

Bloco que depende de helper do showcase **não pode ser entregue a ninguém**: o consumidor pede a
referência e recebe código que não compila. É a L-037 (o item declara todas as deps reais) e a
L-034 (extração reescreve imports) — foi assim que o `data-table` quebrou no consumidor por 2
imports não declarados.

Consequência prática, e é bom que apareça no primeiro bloco: se um arranjo precisar de algo como
`CardHead`, a saída é **compor com `Panel` + presets de tipografia**, ou promover a peça a
componente do DS pelo pipeline normal (com gate). O que não pode é o bloco carregar um helper
próprio invisível.

### 4.2 Dentro da linha nova, a fonte é o arquivo do bloco

O modelo dos `example-*` é: **o showcase define, o exemplo é cópia extraída à mão** — e por isso
precisa do `examples-drift-check` (hash da fonte) avisando quando divergem. Funciona, mas é
vigilância sobre duplicação.

Na galeria de blocos, **inverter**:

> o arquivo do bloco é a **fonte**; a página da galeria **importa e renderiza** ele.

| | modelo `example-*` (cópia) | bloco como fonte |
|---|---|---|
| drift | possível → precisa de gate | **impossível** — há uma definição só |
| o que a IA busca | a cópia, que pode estar velha | o arquivo exato que a galeria renderiza |
| adicionar bloco novo | extrair + sincronizar + baseline | **1 arquivo + 1 linha de índice** |
| "print" da doc | envelhece em silêncio | é o render ao vivo, autoverificável |

Isso serve direto o requisito **"blocos crescem esporadicamente"**: viu um arranjo novo, cria o
arquivo, e ele aparece na galeria e no índice pelo mesmo ato.

### 4.3 A duplicação que a decisão cria — e o gatilho pra resolvê-la

Enquanto os blocos de chart crescem e o `#/chart-showcase` fica intacto, existem **duas galerias
de chart**. Isso é aceitável durante o teste, e é o preço consciente de não migrar.

Mas duas coisas paralelas sem ponto de decisão marcado **divergem em silêncio** — foi o que
aconteceu, nesta mesma sessão, com 3 itens de backlog vencidos, com o plano dos Blocos que
desapareceu e com duas versões inventadas na doc. Então o gatilho fica registrado agora, sem
número fechado:

> **Quando os blocos de chart cobrirem o que o `#/chart-showcase` demonstra, decidir o destino
> dele: some · vira ponteiro pra galeria de blocos · ou fica como página de exemplo com papel
> próprio declarado.**

Não é dívida a pagar cedo — é decisão a não esquecer.

---

## 5. Os dois fluxos

### 5.1 Autor (mantenedor + pipeline atual)

```
vê um arranjo novo que vale compartilhar
  → ESCREVE do zero em src/blocks/<categoria>/<nome>.tsx   (§4: não copia, não migra)
  → só API pública do DS                                    (§4.1)
  → declara id (dsgreen-<categoria>-<n>) + descrição de 1 linha + usa: [...]
  → a galeria renderiza automaticamente (importa do arquivo — §4.2)
  → o índice é GERADO a partir das declarações
  → [opcional] item registry:block, SÓ se o bloco traz arquivo próprio (fixture/helper)
```

### 5.2 Consumidor (vibe-coder)

```
navega a galeria pública por categoria
  → acha a composição que quer
  → copia o ID (ou o botão "copiar prompt": «use a referência dsgreen-chart-1 aqui»)
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

- **ID único, no formato, e resolvível** — dois blocos com o mesmo ID, ID fora do padrão da §9.2,
  ou ID citado no índice sem arquivo correspondente: reprova
- **bloco usa só a API pública do DS** (§4.1) — import de helper de página do showcase reprova. É
  o que garante que o bloco compila no projeto de quem o pedir
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

> **Reescrito em 2026-08-19 junto com a §4.** As fases não são mais "extrair os 34" — são
> **construir um, testar, e ir populando aos poucos**, avaliando a cada passo se está dando certo.
> A diferença não é de ritmo: é que cada bloco passa a ser decisão em vez de herança.

| fase | o que | por que nesta ordem |
|---|---|---|
| **0** | menu/seção nova de Blocos, vazia · **UM** bloco escrito do zero, reproduzindo visualmente um card de chart · o ID declarado no próprio arquivo · a galeria renderizando ele | provar o ciclo inteiro num caso real antes de existir o segundo. É a disciplina da L-064: ver o mecanismo funcionar antes de confiar nele |
| **1** | mais blocos de chart, **aos poucos**, avaliando a cada um: o formato aguenta? a regra da §4.1 se sustenta? a IA resolve pelo ID e monta certo? | é aqui que o desenho se prova ou se corrige — com 3 blocos o custo de mudar o formato é baixo; com 30 não |
| **2** | índice gerado + o gate de §7 | só faz sentido com N blocos existindo, e antes de o índice virar grande demais pra manter à mão |
| **3** | Passo 0 no `ds-kit` + payload do consumidor | é o que liga o vibe-coder ao catálogo |
| **4** | `registry:block` para os blocos que trazem arquivo | exceção, não regra |
| **∞** | novas categorias além de chart (KPI, listas, o que aparecer) | "crescem esporadicamente" é o modo normal de operação, não uma fase final |

**Só a Fase 0 exige decisão de desenho. A Fase 1 é onde se descobre se a decisão foi boa** — e o
critério de avaliação dela é o §5.2 funcionando de ponta a ponta: citar o ID e receber a
composição certa, sem o humano corrigir depois.

---

## 9. Esquema do ID — DECIDIDO em 2026-08-19

**Formato:** `dsgreen-<categoria>[-<qualificador>]-<n>`

```
dsgreen-chart-1
dsgreen-chart-lines-1        ← qualificador opcional, quando ajuda a distinguir
```

**Substitui** os `DSGREEN-B-###` / `DSGREEN-U-###` do desenho perdido, que tinham dois espaços de
numeração cuja distinção não sobreviveu.

**Por que este é melhor pra quem consome — inclusive pra mim.** Com um código opaco eu **tenho** que
resolver o índice pra saber do que se trata. Com `dsgreen-chart-1` eu já sei a família antes de abrir
nada; e se o humano citar de memória e errar o número, eu erro **dentro da categoria certa**.

**Alinhado ao que o repo já faz:** medido, **91 de 91** itens do registry estão em kebab minúsculo,
zero fora do padrão, e 13 já usam segmento de família (`example-*`, `theme-*`). Todas as rotas do
showcase também. O esquema não inventa vocabulário.

### 9.1 As quatro regras que vêm com o esquema

1. **O segmento nomeia a CATEGORIA da galeria, não os componentes usados.** É a única ambiguidade
   real do formato: um chart-card com KPI dentro é `chart` ou `kpi`? Se o segmento fosse "o que
   usa", todo bloco composto ficaria ambíguo — e composto é justamente o que é bloco. Sendo **onde
   ele mora na galeria**, a resposta é sempre única e curatorial. Os componentes de fato usados vão
   no campo `usa: [...]`, que é o que a IA lê pra montar.
2. **Nunca re-segmentar depois de publicado.** O qualificador do meio tenta: ao criar o segundo tipo
   de chart, dá vontade de renomear `dsgreen-chart-1` → `dsgreen-chart-bars-1` "pra ficar
   simétrico". Isso quebra citação que vive **fora do repo** (ticket, Figma, conversa antiga).
   Regra: especificidade nova = **ID novo**; o antigo fica, mesmo assimétrico.
3. **A descrição continua obrigatória, 1 linha.** O nome carrega a **família**, não a composição —
   `dsgreen-chart-1` não diz que tem KPI embutido e sparkline. O nome poupa a IA de resolver a
   categoria, não de entender o arranjo.
4. **O número não tem significado.** `chart-7` não é melhor nem mais novo que `chart-1` — é
   identificador. A escolha acontece olhando a galeria, que é o fluxo pretendido. Não ordenar por
   relevância depois.

### 9.2 Validação — cabe no mesmo gate da §7

```
^dsgreen-[a-z0-9]+(-[a-z0-9]+)*-\d+$      + unicidade
```

Custo zero (é o módulo que já valida ID único) e evita a falha silenciosa de `DSGREEN-Chart-1` e
`dsgreen-chart-1` sendo citados como se fossem o mesmo bloco.

---

### 9.3 O que ainda é decisão aberta

1. **Como o bloco declara o ID no arquivo.** Recomendação: **no próprio arquivo**
   (`export const BLOCK = { id: "dsgreen-chart-1", nome, descricao, usa: [...] }`), pra o índice ser
   **gerado**. A alternativa (lista à mão) exige sincronia humana, e esta sessão inteira foi sobre
   o que acontece quando ninguém força sincronia.
2. **Onde a galeria mora.** Recomendação: **seção própria dentro do showcase**, com nav separada
   dos componentes, uma página por categoria. Razão mecânica: o showcase é o único lugar onde
   render e código vivem juntos e passam por `tsc`. Página separada teria que duplicar o render
   (drift) ou usar **print** — e print não tem gate, envelhece em silêncio.
3. **`dashboard-patterns.md`** — adiado por decisão do mantenedor até o primeiro bloco real existir;
   aí ele avalia se cabe como bloco, exemplo ou ambos.
4. **Qual card de chart vira o bloco 1.** Sugestão: um que exercite a regra da §4.1 de verdade —
   ou seja, um que hoje dependa de `CardHead`, pra a primeira resposta a "compor ou promover?" ser
   dada logo, e não adiada. (Dizia `CardHead`/`SectionLabel` — ver a correção na §3.2: card nenhum
   depende de `SectionLabel`.)

---

## 10. Riscos

- **Bloco que não compila sozinho é pior que bloco nenhum.** O consumidor pede a referência,
  recebe código que quebra, e conclui que o DS está errado. Mitigação: a regra da §4.1 + o gate que
  a checa, e a Fase 0 provando o ciclo num caso real.
- **ID tem que ser estável pra sempre.** Renumerar quebra citação — inclusive citação que vive
  fora do repo (ticket, Figma, conversa antiga). Nunca reordenar; nunca re-segmentar (§9.1 regra 2);
  bloco removido deixa o ID vago.
- **Crescimento.** A galeria numa página só fica impraticável rápido; a divisão por categoria
  precisa já nascer na Fase 0, com um bloco só, e não ser retrofitada depois.
- **~~O bloco herda os defeitos do exemplo que o originou.~~ MITIGADO pela decisão da §4.** Este era
  o risco mais grave da primeira versão da spec: duas vezes em 2026-08-19 o exemplo canônico ensinou
  o contrário da regra escrita (`width` fixo na coluna de ações; footer do alert dialog sem largura
  cheia) e a IA copiou o hábito — e um catálogo multiplicaria o alcance disso, com endereço fixo e
  citado por muita gente. **Escrever cada bloco do zero desarma isso na raiz**, porque cada hábito
  passa a ser decisão em vez de herança. Fica registrado porque volta pela porta dos fundos se
  alguém "adiantar" um bloco por copiar e colar (§4).
- **O que sobra do risco anterior:** bloco pode nascer errado por conta própria. Aí o que protege é
  a receita nomear a **intenção** (qual token, por quê) e não só entregar o trecho — quando receita
  e código divergem, a divergência fica visível.

  ⚠️ **Correção de uma afirmação errada desta spec (2026-08-19).** Aqui estava escrito que "bloco
  não escapa do `ds-lint-styles` nem do `dead-theme-classes`, que valem para qualquer `.tsx` em
  `src/`". **Metade é falsa, e foi medida** — ver §12.2. O `dead-theme-classes` varre `"src/"` e
  pega bloco; o `ds-lint-styles` tem `GLOB = ["src/components/**/*styles.ts",
  "src/components/**/*.tsx"]` e **não pega**. Um `gap-4` em vez de `gap-gp-md` dentro de um bloco
  passaria limpo hoje. Escrever "vale para qualquer `.tsx` em `src/`" sem conferir o glob é
  exatamente a L-060 (afirmar garantia sem verificar a garantia) — e num arquivo que existe pra
  orientar decisão, é o tipo de frase que faz alguém parar de investigar.

---

## 11. O que este plano NÃO resolve

Blocos atacam **composição**, não correção. O defeito que mais custou nesta sessão foi de
conteúdo, não de resolução: a IA achou o exemplo certo e copiou o hábito errado dele. Um ID
determinístico teria levado ao **mesmo** exemplo defeituoso, mais rápido. Blocos melhoram o teto
de qualidade da composição; não substituem os gates que garantem que o que se copia está certo.

---

## 12. Pré-voo — medido em 2026-08-19, antes de escrever a primeira linha

> Levantamento pedido pelo mantenedor com 4 requisitos: **não impactar o que funciona · não inchar
> · escalar suave e organizado · e não reagir quando o que mudou NÃO é bloco.** As três subseções
> abaixo respondem cada um com medição, não com intenção.

### 12.1 O requisito "não reage quando não é bloco" já está satisfeito — por construção

Se os blocos morarem em **`src/blocks/`**, nada do pipeline de componente os vê. Medido arquivo por
arquivo:

| superfície | reage a `src/blocks/**`? | por quê |
|---|---|---|
| **5 hooks** (rodam em todo Edit/Write) | **nenhum** | `ds-lint-styles` casa `*src/components/*` · `ds-inventory-check` casa `src/components/ui/<Nome>/` · `ds-tokens-check` casa `tokens/**` · `block-rm-rf` e `block-sensitive-edit` são genéricos de segurança |
| **19 gates com raiz declarada** | **1 só** — `dead-theme-classes`, que varre `"src/"` | os outros declaram `src/components`, `src/preview`, `src/examples`, `src/styles/theme`, `src/hooks`, `src/lib`, `src/utils` |
| `new-component-folders` | **não** | varre `src/components` — não vai cobrar DocPage de bloco |
| `distribution-debt` · `showcase-registration` · `barrel-completeness` · `registry-imports` | **não** | idem |
| registry · barrel · npm | **não** | `src/components/index.ts` é o que define o canal npm; arquivo fora dele não viaja |

**Consequência: não há exclusão a configurar.** A pasta nasce invisível pro rigor de componente —
é o "pipeline menos rigoroso" saindo de graça, sem lista de exceção pra manter.

⚠️ **As raízes de varredura moram nos arquivos `.test.mjs`, não nos módulos** (convenção do repo:
módulo puro, teste lê disco). Quem for conferir isso de novo tem que olhar o teste — eu olhei o
módulo primeiro e o levantamento saiu incompleto.

### 12.2 O que NÃO cobre bloco, e é decisão pra tomar

```
dead-theme-classes  →  varre "src/"                                        ✅ pega bloco
ds-lint-styles      →  GLOB ["src/components/**/*styles.ts",
                              "src/components/**/*.tsx"]                    ❌ NÃO pega
dead-ds-classes     →  "src/components"                                     ❌ NÃO pega
```

Ou seja: classe de cor morta em bloco reprova; **`gap-4` em vez de `gap-gp-md` passa limpo.**

E `src/preview/**` / `src/examples/**` estão fora do lint **de propósito** — o comentário do
`lint-styles.mjs` diz *"são cópias/demos, não a fonte do DS"*.

**Recomendação: incluir `src/blocks/**/*.tsx` no GLOB.** Bloco não é demo — é **a fonte de um
padrão** que vai ser copiado por quem confia nele. Bloco ensinando `gap-4` é literalmente o defeito
que custou duas vezes em 2026-08-19 (§4, razão 2). Custo: **uma linha**, e zero enquanto não houver
bloco.

### 12.3 O custo de contexto — onde o risco está, e onde não está

O custo por sessão hoje, já pago em toda sessão independentemente de blocos:

```
CLAUDE.md                       407 linhas ·  22 KB
.claude/rules/ds-standards.md   591 linhas ·  53 KB
                                ──────────────────
                                ≈ 18.800 tokens em 100% das sessões
```

⚠️ **Isto NÃO é risco dos blocos — é o piso de hoje.** Se os blocos nunca existirem, o custo é o
mesmo. O que os blocos podem causar é o **incremento**, e é só ele que esta spec precisa tratar.

**Composição do `ds-standards`, pra saber onde o peso está:**

```
24 KB · 47%  →  resumo das 69 lições      ← o único com vetor de crescimento
 6 KB · 12%  →  anti-patterns
 6 KB · 12%  →  tabela de skills
```

**E já existe freio pro crescimento**, que não é boa intenção: o **Auto-update protocol** (as 4
perguntas) reprova achado que dá gate, que já está no ponto de uso, que é erro de método, ou que não
muda decisão. Criado em 2026-08-17 porque o mandato anterior era incondicional e **triplicou o
arquivo em 4 meses**. Funcionou duas vezes no mesmo dia: reprovou "não cite versão antes do bump"
(virou gate) e a linha do ESC no vocabulário do consumidor (não mudava decisão).

**A regra pros blocos, então:**

- ✅ o "como fazer bloco" vive na **skill** — carrega só quando invocada, como as outras 14
- ✅ **1 linha** na tabela "Onde cada tarefa começa" do `CLAUDE.md` — é onde alguém procura, e é o
  mínimo pra ser encontrável
- ⛔ **nada de seção nova** no `ds-standards.md`. O cabeçalho dele já manda: *"ao acrescentar seção,
  prefira 1 linha + ponteiro pro `.ai/` a 30 linhas de detalhe"*
- ✅ o gate custa **zero contexto** — é código no `npm test`, não doc

### 12.4 Ordem sugerida pra a Fase 0

1. `src/blocks/chart/` com **um** arquivo, e a galeria renderizando ele. Nada mais.
2. **`npx tsc --noEmit` + `npm test` e confirmar que NADA reagiu.** É a validação de que a §12.1
   está certa na prática e não só na leitura — e se algum gate reclamar, se descobre agora, com 1
   arquivo, não com 10.
3. Só então: skill + command + a linha no `CLAUDE.md` + a linha no GLOB do lint (§12.2).
4. O gate de ID/formato **depois do segundo bloco** — com um só não há unicidade a validar, e
   escrever gate antes de existir o caso é o que a L-064 diz pra não fazer.

O passo 2 é o que eu não deixaria de fora: custa dois comandos e é a única forma de saber que este
pré-voo está correto.
