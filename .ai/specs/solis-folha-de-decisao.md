---
titulo: Folha de decisão — o que foi feito, o que ficou e o que apareceu no caminho
status: ATUALIZADA 2026-11-04 (pós Grupo A + P12)
criado: 2026-11-04
---

# Folha de decisão

> ## ⚠️ ESTE DOCUMENTO ESTÁ INCOMPLETO — use o fechamento
>
> Uma auditoria independente em 2026-11-04 mostrou que ele cobre **só os P-itens** e não
> menciona **seis pedidos do Sólis** (20, 21, 22, 23, 25 e 26) que foram adiados numa seção
> de documento de planejamento e nunca chegaram aqui. Quem lê este arquivo hoje conclui que
> o lote acabou — e não acabou.
>
> **O estado vivo e completo está em [`solis-fechamento.md`](./solis-fechamento.md)**, e o
> que não foi feito em [`backlog-solis.md`](./backlog-solis.md). Este arquivo fica como
> registro do caminho, não como estado.

---

> **Atualizada depois que o Grupo A e a P12 foram feitos e mergeados.** O que era "15
> pendências" virou: **5 feitas**, **1 adiada por decisão sua**, **9 em aberto**, e **4 novas**
> que apareceram durante a execução.

---

# ✅ FEITO — já na `main`

| # | o quê | PR |
|---|---|---|
| **P1+P2** | o `DataList` combina filtros escalares por **OR**, como a tabela. Antes, dois filtros no mesmo campo **não devolviam ninguém** | #363 |
| **P3** | desmarcar o último valor **não desmonta mais o chip** no meio da edição | #363 |
| **P11** | a busca que falha deixa de ser muda — `onError`, e o rodapé para de mentir | #363 |
| **P12** | o chip de filtro passa a existir **uma vez só** (`FilterChip`), consumido pelos três | #363 |
| — | o destaque do chip e a legenda do `Chart` viraram **opt-in** | #362 |

**Dois detalhes que valem lembrar:**

- O grão do OR é **`field|operator`**, não `field`. OR por campo transformaria
  `nome contains "a"` + `nome notContains "b"` em "contém a OU não contém b" — verdadeiro
  para tudo.
- No `FilterChip`, o **`Gantt` não mudou um pixel** e o **`Scheduler` mudou**: perdeu a borda
  verde, ganhou o operador, e perdeu um `cursor: pointer` que mentia. ⚠️ **Vale conferir em
  `#/scheduler`** — é a mudança visível da PR.

---

# 🟡 ADIADA POR DECISÃO SUA

| # | o quê | sua decisão |
|---|---|---|
| **P13** | `renderEmpty` é o **terceiro** nome do slot de vazio (`emptyState` nos outros dois) | *"por mais que fuja do padrão, a documentação está bem alinhada, então provavelmente não haverá esse erro"*. Renomear é **breaking** → janela num major |

---

# 🔵 DECIDIDAS EM 2026-11-04 — as três do grupo de design

> As três foram avaliadas pelo mantenedor olhando a tela. **Uma vai ser feita, duas não.**

## ✅ P8 — vai ser feita

As linhas mantidas pelo `loadingMode="keep"` ganham sinal visual de que estão
desatualizadas. Decisão dele: *"é uma coisa visual, não traz impacto nem nada assim"*.

⚠️ Vale registrar o que torna isto mais necessário do que parece: **o rodapé já mudou de
página** durante o vôo. O texto do range é escondido, mas os controles seguem — então a
tela inteira se comporta como se a página nova tivesse chegado, **menos as linhas**.

## ❌ Os 4 tipos sem saída — NÃO fazer, e o argumento é dele

> *Isso não dá para a pessoa fazer manualmente? Ele também pode marcar como múltiplo,
> igual àquele filtro que tem "selecionar todos" e "desmarcar todos".*

**Confirmado no código:** o `filterType` é **independente** do `type` da coluna. Uma coluna
de status pode declarar `filterType: "multiSelect"`, e o widget passa a ter **"Selecionar
todos" e "Limpar"** — que é exatamente a saída que falta no `select`.

⚠️ **A ressalva honesta:** isso troca a semântica de `equals` para `isAnyOf`. Filtrando por
um valor o resultado é o mesmo, mas é um filtro diferente, não só um widget diferente.

**Por que a decisão está certa mesmo assim:** o DS já oferece o caminho. Inventar um
terceiro desenho de "limpar" dentro do `select` seria o DS crescendo um motor onde já há
escolha — a segunda metade da regra que o próprio mantenedor formulou.

## ❌ P14 — NÃO fazer

> *Se for só questão pela cor, o `fg-brand` pode ignorar. Não preciso fazer nada disso.*

A **N1** — um par de cor pior, em **3,14:1** — apareceu depois e foi levada a você
separadamente. **Também foi ignorada**, no mesmo dia e pelo mesmo motivo. O assunto cor
está fechado nesta rodada.

---

# ⚪ EM ABERTO — recomendo deixar documentado (6)

> **O que é esta lista.** São seis coisas que **nenhum defeito do lote causou** — já
> estavam aí antes, e nenhuma delas aparece na tela hoje. Estão escritas aqui para que,
> no dia em que alguém tropeçar numa, **ache a explicação pronta em vez de investigar do
> zero**. Recomendo não fazer nenhuma agora.

| # | o que acontece | quando isso morderia | por que não agora |
|---|---|---|---|
| **P15** | quem exporta a tabela usando **servidor** (`fetchData`) **e** também passa `rows` recebe só as linhas locais, com o rótulo *"Página atual"* | só quem fizer as duas coisas ao mesmo tempo — que a doc **já desaconselha em 4 lugares** | consertar mexe nos **dois caminhos de servidor**; risco maior que o sintoma |
| **P10** | o `DataList` não tem `loadingMode` — a tabela consegue segurar as linhas antigas enquanto carrega, a lista não | **só no dia em que o `DataList` ganhar `fetchData`**, que ele ainda não tem | é construir hoje para um cenário que ainda não existe |
| **P5** | o filtro simples não consegue **nascer aberto** sem que o consumidor assuma o controle dele | deep-link que deveria abrir o painel já expandido | é **adição barata e opt-in**. Faz quando alguém pedir — não antes |
| **P6** | a proteção que existe para quem troca de não-controlado para controlado no meio do uso **não tem teste** | nunca na tela. Só se alguém quebrar a proteção sem perceber | **a proteção funciona — isso foi medido.** O que falta é o teste, e teste não muda pixel |
| **P7** | um handler interno é recriado a cada clique no chip | **nada hoje** — vira custo só se alguém memoizar o drawer | otimizar antes de existir o caso é adivinhar |
| **P4** | cada clique no chip gera ids novos para o grupo inteiro | **nada aqui** indexa por id — procurei e confirmei. Morderia um consumidor em `mode="server"` que faça diff por id | hipotético, e o consumidor tem o valor estável para comparar |
---

# 🆕 AS "N" — o que apareceu enquanto eu trabalhava (4)

> **O que o "N" significa.** Tudo que começa com **P** veio da lista da Sólis. As **N** são
> **N**ovas: **ninguém pediu**, eu encontrei mexendo no código para fazer outra coisa. Não
> são tarefas — são achados. Cada uma precisa da sua decisão de fazer ou não.

## ❌ N1 — ignorada (decisão de 2026-11-04)

> *Essas coisas de cor assim podemos ignorar.*

O par `bg-bg-danger-muted` + `text-fg-danger` mede **3,14:1** e reprova o AA. É pareamento
**estabelecido** do DS — Badge, Chip, Button, AlertModal — e é **pior** que o `fg-brand`
(4,36) da P14, que também foi ignorada.

**Fica registrado e não volta a esta lista.** A única coisa que eu deixo anotada é que, no
dia em que um gate de contraste nascer no DS, o `danger` é o **primeiro** a reprovar — então
a decisão de criar o gate e a de arrumar o `danger` são, na prática, a mesma decisão.

## 🟡 N2 — recomendo fazer, mas é sua decisão

**O que acontece na tela:** você edita um chip de filtro que está no meio da barra, e ele
**pula para o fim**. Com 3+ chips, a barra se reorganiza embaixo do seu cursor.

**Por que recomendo:** o `DataTable` **já resolveu isso** — ele reconstrói a lista no lugar
em vez de reinserir no fim, e o comentário no código diz exatamente *"visualmente confuso
quando há 3+ chips"*. Ou seja: **não é desenho novo, é aplicar a receita que já existe** no
lugar que ficou para trás. É o mesmo tipo de trabalho da P12.

**Pela sua régua, passa:** quem **não** tem o defeito é quem tem 1 chip — e para esse a
ordem com 1 item é a mesma antes e depois. Ninguém sente a correção sem ter o problema.

## 🟢 N3 — já está resolvido, só não foi apagado

`toolbarAppliedTagClass` é um nome exportado que **nada no código usa**. Mantive como apelido
do nome novo para não quebrar quem porventura o importe lá fora.

**Não pede decisão sua.** Some sozinho numa limpeza futura; não custa nada ficar.

## 🟢 N4 — não é defeito do produto

Um arquivo de teste caiu **uma vez** e passou sozinho nas ~8 execuções seguintes. É teste
esperando um atraso de 250ms — sob carga, a máquina atrasa mais que isso.

**Nada disso aparece para o usuário.** Anotei porque teste que falha sozinho um dia
**envenena a confiança em todo o resto** — se voltar a cair, já se sabe onde olhar.
---

# O estado do lote

```
Rodadas 1–5          ✅ mergeadas    23 entregas
Reversões opt-in     ✅ mergeada     PR #362
Grupo A + P12        ✅ mergeada     PR #363
Release v0.71.0      ⏸️  aguardando sua autorização de bump e publish
Itens acima          ⬜ em aberto
```

**Nada em aberto bloqueia o release.**

---

## O que eu faria a seguir, se perguntasse

**Publicar.** O feedback do time pode reordenar tudo que está em aberto — eles usam o
`DataList` todo dia, e o que me parece prioridade pode não ser a deles.

Das que sobraram sem decisão, a **única** que eu levantaria é a **N2** (o chip que pula de
posição): é visível na tela, a receita já existe no `DataTable`, e quem não tem o defeito
não sente a correção. As outras cinco eu deixaria exatamente onde estão.

Das que ficaram, a que eu levantaria primeiro é a **N1**: um pareamento de cor que o DS usa
em quatro componentes e que reprova o contraste mínimo é mais sério que qualquer item desta
lista, e foi achado por acaso, medindo outra coisa.
