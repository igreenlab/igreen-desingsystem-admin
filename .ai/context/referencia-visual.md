# Referência visual como input — print, Figma, tela existente

> **Contexto sob demanda.** Carregue quando a tarefa tiver uma referência visual anexada.
> O invariante de 4 linhas vive em `.claude/rules/ds-standards.md` (auto-carregado); o
> detalhe, a evidência e os casos de borda ficam aqui — que ninguém paga sem precisar.

Input visual é provavelmente o caso mais comum no consumo real do DS, e as skills de
entrevista assumiam conversa em **texto**. Sem regra escrita, cada agente decide sozinho o
que copiar da imagem e o que não — e a decisão sai diferente a cada sessão.

## A divisão é por CAMADA, não por elemento

| A referência decide | O DS decide, sempre |
| --- | --- |
| copy, labels, nomenclatura, jargão do domínio | fonte e família |
| ordem e agrupamento dos campos | tamanho, peso, tracking |
| quais colunas/seções existem | cor, espaçamento, radius, sombra, foco |
| densidade percebida do domínio (o que é "muito" pra este negócio) | **comportamento de componente** |

### Conteúdo é do domínio — copie

Você não tem como adivinhar que `prod/hml/dev` é o jargão da casa, nem que a coluna se
chama "Marcas" e não "Tipo". Copie e **não "melhore" sem pedir**. Se você achar que o nome
é ruim, diga isso **depois** de entregar fiel — não troque no meio do caminho.

### Pele e comportamento não são seus pra adaptar

Preset existe → use o preset. O papel `code` (`text-code-sm`/`text-code-md`) cobre chave de
env, ID, hash, slug, token e path — compor `font-mono text-body-sm` + `tracking-widest` na
unha porque "ficou parecido com o print" é drift, e é exatamente o que o DS existe pra
impedir.

O mesmo vale pra comportamento: filtro é o motor nativo do `DataTable` (chip), não um
`select` acima da grade, mesmo que o print mostre um select acima da grade.

### Cor: a referência escolhe o CONJUNTO, nunca o valor

- print escuro → `dark`
- print de outra marca → `data-theme="<id>"` (são 5)
- **nunca** derive hex do pixel do print

Entregar light quando a referência é dark é erro — mas a correção é trocar de modo, não
amostrar a cor da imagem.

### Chrome na referência = shell no escopo

Print de app inteiro (rail, header, tema) + pedido de "uma tela" **é `shell + tela`**, não
`tela`. Antes de gerar:

1. existe `AppShell` no projeto? (grep em `src/`)
2. a referência mostra rail/menu/header?

Chrome na referência e sem shell no projeto → **pare e ofereça `/ds-create-app` junto**.
Se o usuário recusar, escreva no blueprint, em **linha destacada**, o que do print **não**
vai ser entregue. O que não vale é entregar sem o chrome e deixar o usuário descobrir na
tela.

## A evidência: dogfood de 2026-08-20

Consumidor real por submódulo, tela de tabela gerada a partir de um print. O agente seguiu
o processo (entrevista → gate → exemplo canônico → validação) e ainda assim escorregou em
**6 pontos**, todos da mesma família: fidelidade ao print vencendo a regra.

O que **não** aconteceu, e é o que torna o achado interessante: nenhum componente errado,
nenhum token inexistente, nenhuma violação de estrutura. O processo segurou o grosso. O que
vazou foi julgamento — e o mantenedor resumiu melhor que qualquer spec:

> *conteúdo do print, pele e comportamento do DS.*

Dois dos seis merecem nota, porque são armadilhas de método:

- **o recorte veio antes do desvio.** O print era de um app; o pedido dizia "uma tela". Ao
  classificar como "tela CRUD", o shell saiu de escopo — e daí em diante tudo que parecia
  desvio de tipografia era, na verdade, ausência do chrome mudando a percepção da fonte.
- **a prop inventada veio de escrever de memória.** `error` não existe no `FormFieldInput`
  (é `state="error"` + `errorMessage`). O `tsc` pegou; a causa foi pular o `USAGE.md`.

## O que virou mecanismo (para não depender de lembrar disto)

- **Fase 0** de `crud-builder` e `dashboard-builder`: verificação do envelope (as 2 perguntas
  acima), não pergunta aberta.
- **Gate** dos 3 builders: seção `⚠️ Decisões inferidas — vete se discordar`, com `nenhuma`
  explícito quando não houve inferência.
- **Padrões de célula** do `generate.md`: linha do `text-code-sm` ao lado da do `stat`.

Ver `.ai/status/pipeline-state.md`, entrada de 2026-08-20 ("O dogfood virou regra").
