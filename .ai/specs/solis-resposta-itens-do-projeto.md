---
titulo: Resposta ao Sólis — os 5 pedidos que são do projeto, com o caminho de cada um
status: PRONTO PARA ENVIO
criado: 2026-11-04
relacionado:
  - solis-pedidos-2-analise.md
  - solis-rodadas-plano.md
---

# Os 5 que são de vocês — e o caminho de cada um

Este documento responde aos itens **10, 11, 12, 31 e 29b** do SOLIS-238.

Eles não viraram PR no Design System, e a razão não é "não dá" nem "não queremos" — é que
**a peça já existe e a regra é de vocês**. Abaixo, o caminho de cada um, com o que mudou do
nosso lado para destravá-los.

---

## O que mudou: o `ownsMulti` estava quebrado, e três destes dependiam dele

Vocês pediram o `ownsMulti` na **v0.69.0**, exatamente para que comportamento de widget não
virasse PR no DS. O JSDoc dele diz isso com todas as letras.

**Ele nunca funcionou.** O flag desligava o modo multi por dentro e entregava ao seu widget
**o primeiro valor**, não a lista. Num grupo `["A","B","C"]`, o widget abria mostrando só
`"A"`; desmarcar `"A"` limpava o grupo inteiro; marcar `"D"` apagava `"B"` e `"C"`.

Isso é nosso, e está corrigido. Junto foi exportado o **`MultiSelectFieldDropdown`**, que era
função privada e é a peça que faltava para montar o widget sem reimplementar o campo.

> **Se vocês tentaram widget próprio antes e desistiram, era isto — não o código de vocês.**

E corrigimos também uma assimetria que a auditoria achou depois: o chip do **`DataList`**
ignorava o `ownsMulti` por completo. Abrir o funil entregava o widget de vocês; clicar no chip
que ele acabou de gerar entregava o nosso. Um clique de distância, dois widgets. Hoje os dois
caminhos são o mesmo.

---

## Itens 10, 11 e 12 — o escape hatch do multi

| # | pedido |
|---|---|
| **10** | clique substitui a seleção; Ctrl+clique soma |
| **11** | texto da busca do multi acessível |
| **12** | colar lista (`bulkPaste`) |

**Os três são a mesma peça**, e a razão de ficarem com vocês é a mesma: são **regra de
interação de uma tela**. Outro projeto pode querer o oposto — e se a regra de vocês virasse
default do DS, os outros herdariam uma interação que não pediram.

### O caminho

Registre um `columnType` próprio com **`ownsMulti: true`**. A partir daí o chip multi inteiro
é de vocês: clique-substitui, atalho de teclado, colar, o que for.

```tsx
columnTypeRegistry.register({
  ...tipoBase,
  type: "meuMulti",
  ownsMulti: true,
  renderFastFilterInput: (props) => <MeuWidget {...props} />,   // o chip
  renderFilterInput:     (props) => <MeuCampo  {...props} />,   // o builder avançado
});
```

**Três coisas que mordem, e estão documentadas:**

1. **O `value` chega SEMPRE como array**, inclusive com um valor só. O contrato do flag é "lê
   e escreve lista", sem exceção por tamanho.
2. **Widget de valor único não declara o flag.** `badge` e `user` declaram `isAnyOf` para
   funcionar no builder avançado, mas o chip deles é um `<Select>` único — por isso eles
   **não** declaram `ownsMulti`. Posse é declarada, nunca deduzida da lista de operadores.
3. **Preencha os DOIS slots.** `renderFastFilterInput` é o chip (já dentro de um popover) e
   `renderFilterInput` é o modal avançado (sem popover em volta). Só o primeiro deixa o widget
   sem par no avançado.

Peças públicas para embrulhar: `MultiSelectDropdown`, **`MultiSelectFieldDropdown`**,
`FastSingleSelectList`, `FILTER_FIELD_CLASS`.

### Sobre o item 12 especificamente

O `bulkPaste` tem **regra de negócio dentro**: conferir os códigos colados no servidor, contar
"6 de 10 selecionados", listar os não encontrados. O `resolveValues` que vocês descreveram é
chamada ao **backend de vocês** — não há como o DS fazer isso sem inventar um contrato de API.

---

## Item 31 — menu de visão do gráfico

Vocês mesmos marcaram "(Opcional)" e disseram que **já montam** com peças do DS.

O caminho é o que vocês já fazem: `Button` + `DropdownMenu`. Não há peça faltando.

---

## Item 29b — `ChartCard`

É **composição**, não componente: `Panel` + `CardHead` + `Chart`. A receita está em
`.ai/context/components/dashboard-patterns.md`, e o princípio por trás dela é deliberado —
tela que converge num padrão vira **receita com os primitivos**, não mega-componente de
página. Componentiza-se só o gap de átomo.

**O que entrou do DS foi o gap de átomo:** o `CardAction`, que era parte do shadcn oficial
nunca adaptada. É a peça que faltava para a ação à direita do título.

⚠️ `CardAction` é filho **direto** do `CardHeader`, que reserva a 2ª coluna sozinho. Não
combine com `className="flex …"` no header — com `flex` o grid some e o posicionamento do
slot deixa de valer.

---

## O que mais mudou e vocês vão sentir

Fora dos cinco acima, estas chegam na mesma entrega e mexem com o que vocês pediram:

- **O `valueFormatter` agora vale em `number` e `currency`**, não só em data. Se vocês têm
  `render` próprio em coluna numérica só para formatar, ele pode voltar a ser `valueFormatter`
  — e aí o formato vale também no export e no clipboard.
- **O filtro do funil preserva o operador.** Antes, editar o valor de um filtro
  `não é`/`entre` o rebaixava para o default, em silêncio.
- **O chip multi do `DataList` com 2+ valores esvaziava a lista.** Corrigido.
- **`enableHeaderFilter`** esconde só o funil da coluna. Vocês estavam desligando o
  `enableColumnMenu` inteiro para isso, o que levava **Fixar** e **Ocultar** junto.

---

## Uma coisa sobre a forma do pedido, para a próxima rodada

Três pontos que valem combinar, e nenhum é reclamação de processo — os três custaram tempo
dos dois lados:

1. **O diagnóstico do item 2 apontava para o lugar errado.** O `operator` **é** passado no
   modelo; o problema era o drawer recalculá-lo. Diagnóstico errado no pedido vira PR no
   arquivo errado — e nesse caso teria "consertado" algo que já funcionava.

2. **Itens interligados vieram soltos.** Os seis de gráfico são **uma** decisão; os cinco de
   filtro dependiam de um deles. Pedido fatiado em 45 linhas esconde que são 6 frentes, e o
   custo real fica invisível para os dois lados.

3. **"Hoje faz X, eu quero Y" não é pedido de Design System.** Quatro itens do lote tinham
   essa forma. O que o DS aceita é *"hoje não dá para fazer Y"* (adição) ou *"o DS promete Y e
   faz X"* (correção). A diferença não é formalidade: é o que impede um consumidor de mudar o
   produto dos outros sem que ninguém perceba.

> Os quatro da categoria C — que mudariam o pixel de todo projeto que consome o DS — foram
> avaliados e **aprovados** pelo mantenedor, e entram nesta mesma entrega. Eles saíram pela
> porta certa: decisão do sistema, não do consumidor.
