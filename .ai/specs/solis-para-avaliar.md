---
titulo: As 9 — o que faz, o que custa, e o veredito do mantenedor
status: DECIDIDAS 2026-11-04 (as 9)
criado: 2026-11-04
---

# As 9, decididas

> **Este documento é só o que falta decidir.** O que já foi feito e o que você já decidiu
> está na [folha de decisão](./solis-folha-de-decisao.md) — aqui não repito nada disso.
>
> Cada item responde sempre as mesmas quatro perguntas, na mesma ordem:
> **o que acontece** · **a correção** · **por que é ruim** · **por que talvez não seja**.
>
> Elas estão ordenadas pela minha recomendação — a 1 é a que eu faria, a 9 é a que eu
> deixaria quieta. **Nenhuma delas bloqueia o release.**

> ## ✅ As 9 foram lidas e decididas em 2026-11-04
>
> O mantenedor leu uma a uma e **seguiu a recomendação em todas as nove**. Só a **1** vai
> ser feita agora; as outras oito estão preservadas como backlog, cada uma com o **gatilho
> que inverteria a decisão**, em
> [`.ai/status/BACKLOG.md`](../status/BACKLOG.md) §*Sobras do lote Sólis*.
>
> O texto abaixo fica como está: é o **porquê** de cada veredito, e é ele que evita a
> análise ser refeita do zero daqui a três meses.

```
        VEREDITO        o quê
  1  ✅ FAZER AGORA     o chip pula de posição quando você edita
  2  ⏸️  QUANDO PEDIREM  o filtro não consegue nascer aberto
  3  ⏸️  QUANDO SOBRAR   falta um teste numa proteção que funciona
  4  ❌ NÃO FAZER       exportar com servidor + rows dá as linhas erradas
  5  ❌ NÃO FAZER       a lista não segura linhas antigas enquanto carrega
  6  ❌ NÃO FAZER       um handler é recriado a cada clique
  7  ❌ NÃO FAZER       ids novos a cada clique
  8  ❌ NÃO FAZER       um nome exportado que ninguém usa
  9  ❌ NÃO FAZER       um teste que caiu uma vez e passou sozinho
```

> ⚠️ **Sobre a 5, que gerou dúvida:** *"a gente já está fazendo isso, não?"* — **o
> `DataTable` sim, o `DataList` não.** A tabela já tem `loadingMode` e **continua tendo**
> (a P8, aprovada, está justamente acrescentando o sinal visual nela). O que foi decidido
> é **não levar isso para a lista** — que, sem `fetchData`, não tem o cenário.

---

# 1 · O chip pula de posição quando você edita (N2)

### O que acontece

Você tem três chips de filtro na barra. Clica no **do meio** para trocar o valor. Ao
confirmar, ele **salta para o fim da fila** e os outros dois andam para a esquerda — a barra
se reorganiza embaixo do seu cursor.

Acontece no **`DataList`**. Não acontece no `DataTable`.

### A correção

Já está escrita — **no `DataTable`**, e com o comentário explicando o porquê:

> *"Preserva a POSIÇÃO ORIGINAL do grupo no array — sem isso, o chip era empurrado pro fim
> ao editar valor (visualmente confuso quando há 3+ chips)."*
> — [use-filter-popover-adapter.ts:428](src/components/ui/DataTable/hooks/use-filter-popover-adapter.ts#L428)

O `DataList` faz `[...rest, ...novos]` — tira o grupo de onde estava e acrescenta no fim
([data-list-toolbar.tsx:292](src/components/ui/DataList/parts/data-list-toolbar.tsx#L292)).
A correção é trocar essas duas linhas pela reconstrução in-place que o `DataTable` já usa.

**Não é desenho novo. É aplicar no lugar que ficou para trás uma receita que já existe,
testada, do outro lado.** É o mesmo tipo de trabalho da P12.

### Por que é ruim

É o único desta lista que **o usuário vê acontecer**. E vê no momento pior: enquanto está
interagindo, com o cursor parado onde o chip estava um instante atrás.

### Por que talvez não seja

Com **1 ou 2 chips** o efeito é imperceptível ou inexistente. Quem usa a lista com um filtro
só nunca vai notar — e, pela sua régua, é exatamente isso que torna a correção segura:
**quem não tem o defeito não sente a correção.** Com 1 item, a ordem é a mesma antes e
depois, byte por byte.

**Minha recomendação: fazer.**

---

# 2 · O filtro não consegue nascer aberto (P5)

### O que acontece

Hoje, se você quer que o painel de filtro **já apareça aberto** ao carregar a tela — um
deep-link, um link de e-mail que leva para "pedidos atrasados" com o filtro expandido —, a
única forma é o consumidor assumir o controle total do componente (passar `open` e cuidar
do `onOpenChange` dele para sempre).

Não existe o meio-termo: *"nasce aberto, depois se vira sozinho"*.

### A correção

Uma prop `defaultOpen`. O precedente existe no próprio DS: o `Scheduler` oferece
`defaultDate` e `defaultView` exatamente para isso.

### Por que é ruim

É o caso que **motivou a tarefa original** — deep-link. A resposta de hoje ("omita o
`open`") não resolve: omitir o `open` faz nascer fechado.

### Por que talvez não seja

É **adição pura e opt-in** — sem a prop, nada muda. Barata. Mas é uma prop a mais na API
pública para um caso que **ninguém reclamou ainda**; a Sólis pediu outra coisa e esta
apareceu de lado.

**Minha recomendação: fazer quando alguém pedir.** Não antes — a prop fica mais certa
quando se sabe o caso real de quem precisa dela.

---

# 3 · Falta um teste numa proteção que funciona (P6)

### O que acontece

Quem larga o controle do filtro no meio do uso (passa `open` e depois para de passar) cai
numa transição que o React avisa em `<input>` e que aqui é silenciosa.

**A proteção para esse caso existe, e eu medi: ela faz a coisa certa.** O que não existe é
um **teste** garantindo que ela continue fazendo.

### A correção

Escrever o teste. Nada de código de produção muda.

### Por que é ruim

Proteção sem teste é proteção que alguém apaga num refactor sem perceber que apagou. Ela
não grita quando some.

### Por que talvez não seja

**Não aparece na tela de ninguém hoje** e não muda um pixel. É dívida de rede de segurança,
não defeito.

> Considerei acrescentar também um **aviso em console** para esse caso, e descartei: seria o
> terceiro aviso do componente, para um cenário sem nenhuma evidência de acontecer. Aviso que
> ninguém precisa é aviso que todo mundo aprende a ignorar.

**Minha recomendação: fazer quando sobrar fôlego.** Fora de qualquer rodada com prazo.

---

# 4 · Exportar com servidor + `rows` dá as linhas erradas (P15)

### O que acontece

Quem usa a tabela em **modo servidor** (`fetchData`) **e ao mesmo tempo** também passa
`rows`, ao exportar recebe só as linhas que estão na memória local — com um rótulo que diz
*"Página atual"*.

### A correção

Mexe nos **dois caminhos de servidor** da tabela.

### Por que é ruim

O rótulo *"Página atual"* é honesto sobre o que entregou, mas quem passou `fetchData`
provavelmente esperava o conjunto completo.

### Por que talvez não seja

Para cair nisso é preciso fazer **as duas coisas ao mesmo tempo** — e a documentação
**já desaconselha isso em quatro lugares diferentes** (*"com `fetchData`, não passe
`rows`"*). É uma combinação que a própria doc chama de errada.

E o conserto é desproporcional: mexer nos dois caminhos de servidor arrisca o caminho que
funciona para todo mundo, para atender quem fez o que a doc pediu para não fazer.

**Minha recomendação: não fazer.** Deixar nomeado, que é o que este documento faz.

---

# 5 · A lista não segura linhas antigas enquanto carrega (P10)

### O que acontece

A **tabela** sabe manter as linhas da página anterior visíveis enquanto a próxima carrega
(`loadingMode="keep"`). A **lista** não — ela troca tudo por esqueletos.

### A correção

Dar `loadingMode` ao `DataList`.

### Por que é ruim

São dois componentes irmãos com capacidade diferente para a mesma situação. Quem migra de um
para o outro perde o recurso sem aviso.

### Por que talvez não seja

**O `DataList` não tem `fetchData`.** Ele carrega com `loading?: boolean`, que o consumidor
controla. Sem paginação por servidor, não existe "a página anterior" para segurar.

Ou seja: **é construir hoje a resposta para um cenário que ainda não existe.** No dia em que
o `DataList` ganhar busca por servidor, isso entra junto — e aí já se sabe qual a forma
certa, porque haverá um caso real na mão.

**Minha recomendação: não fazer agora.** Entra junto com `fetchData`, se ele vier.

---

# 6 · Um handler é recriado a cada clique (P7)

### O que acontece

No modo controlado, a função que responde ao clique do filtro é recriada a cada toggle, em
vez de permanecer a mesma. O `Scheduler` resolve isso guardando um booleano em vez do valor.

### A correção

Trocar a dependência de um hook — uma linha.

### Por que é ruim

Se alguém um dia memoizar o drawer para ganhar performance, **a memoização não vai
funcionar** e a pessoa vai perder tempo descobrindo por quê.

### Por que talvez não seja

**O drawer não é memoizado.** Hoje isso não custa absolutamente nada — nem um render a mais,
porque sem memoização o componente re-renderiza de qualquer jeito.

Otimizar antes de o caso existir é adivinhar qual vai ser o caso.

**Minha recomendação: não fazer.** Se alguém memoizar o drawer, conserta junto — e aí a
correção nasce com teste, porque haverá o que medir.

---

# 7 · Ids novos a cada clique (P4)

### O que acontece

Todo clique no chip regenera os identificadores internos do grupo inteiro — do ponto de
vista de quem olha os ids, os filtros antigos sumiram e nasceram outros iguais.

### A correção

Preservar os ids dos itens que não mudaram.

### Por que é ruim

Um consumidor em `mode="server"` que compare filtros **por id** para decidir o que mudou
veria "tudo trocou" a cada clique, e poderia refazer trabalho à toa.

### Por que talvez não seja

**Procurei, e nada aqui dentro indexa por id** — nem o motor, nem a persistência, nem o
payload de servidor. O consumidor que quiser comparar tem campo, operador e valor, que são
estáveis e são o que importa.

É um defeito **hipotético**, dirigido a um consumidor que faria uma escolha estranha.

**Minha recomendação: não fazer.**

---

# 8 · Um nome exportado que ninguém usa (N3)

### O que acontece

`toolbarAppliedTagClass` é exportado e **nada no código chama**. Virou apelido do nome novo
quando o chip foi unificado:

```
export const toolbarAppliedTagClass = toolbarAppliedChipValue;
```
— [toolbar-applied.tsx:12](src/components/ui/TableToolbar/parts/toolbar-applied.tsx#L12)

### A correção

Apagar a linha.

### Por que é ruim

Nome morto é uma pergunta a mais para quem lê o arquivo depois.

### Por que talvez não seja

**Foi deixado de propósito.** Alguém pode estar importando o nome antigo num projeto que eu
não enxergo daqui; apagar seria quebrar sem necessidade, para ganhar uma linha.

**Minha recomendação: não fazer agora.** Some sozinho na próxima limpeza, ou numa versão
maior, onde quebrar nome é esperado.

---

# 9 · Um teste que caiu uma vez e passou sozinho (N4)

### O que acontece

`chip-multi-valor.test.tsx` falhou **uma vez**, com a máquina sob carga, e passou nas ~8
execuções seguintes sem ninguém tocar em nada.

### A correção

Os dois testes esperam um atraso de 250ms para a tela reagir. Sob carga, a máquina demora
mais que isso. A correção é esperar o resultado em vez de esperar o relógio.

### Por que é ruim

Teste que falha sozinho um dia **envenena a confiança em todo o resto**: na vez seguinte que
a suíte ficar vermelha, a primeira reação é "deve ser o flaky de novo" — e às vezes não é.

### Por que talvez não seja

**Nada disso chega ao usuário.** É instrumento, não produto. E não voltou a cair.

**Minha recomendação: não fazer agora**, mas está anotado — se voltar a cair, já se sabe
exatamente onde olhar e por quê.

---

# O que você já decidiu (não precisa olhar de novo)

| | |
|---|---|
| **P8** | ✅ você aprovou — as linhas desatualizadas ganham sinal visual. **Em implementação agora** |
| **4 tipos sem saída** | ❌ não fazer — o consumidor usa `filterType: "multiSelect"`, que já tem "Limpar" |
| **P14** e **N1** | ❌ não fazer — as duas de contraste de cor |
| **P13** | 🟡 adiada — renomear `renderEmpty` é quebra; fica para uma versão maior |

E o que foi feito e mergeado está na [folha de decisão](./solis-folha-de-decisao.md).

---

# Se me perguntasse o que fazer com esta lista

**Publicar primeiro.** O time usa o `DataList` todos os dias; o feedback deles pode reordenar
tudo aqui, e o que me parece prioridade pode não ser a deles.

Das nove, a **1** é a única que eu levantaria por conta própria — é a única que alguém vê
acontecer, e a receita já está pronta do outro lado do repositório.
