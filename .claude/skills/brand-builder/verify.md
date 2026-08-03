# Fase 5 — Verificação no browser

Esta fase existe porque **toda** a cor desta área falha em silêncio. Na `vibrant`:
`tsc` 0, 159 testes verdes, `dead-theme-classes` ok, e a minha própria tabela de
contraste passando 10/10 — enquanto 13 tokens renderizavam o valor do modo **errado**
no dark. O mantenedor descobriu abrindo a tela (L-066).

O erro não foi falta de cuidado, foi **instrumento errado pra pergunta**: eu media os
valores nos arquivos `.ts` (que estavam certos) e concluía sobre o que a tela mostrava
(que estava errado). Só o cascade resolvido responde essa pergunta.

## O que medir

`npm run dev` → `localhost:3100`. Escolha uma tela **densa**, não uma página de doc —
`?app=finance` tem tabela, sidebar, KPI, badge, input e chip juntos.

Para **cada um dos 2 modos**, com a marca ativa:

```js
// via Chrome DevTools MCP (evaluate_script) ou console
const cs = getComputedStyle(document.documentElement);
[
  "--color-bg-canvas", "--color-bg-surface", "--color-bg-subtle", "--color-bg-muted",
  "--color-fg-default", "--color-fg-strong", "--color-fg-muted", "--color-fg-subtle",
  "--color-border-default", "--color-border-subtle", "--color-border-input",
  "--color-bg-brand", "--color-fg-on-brand", "--color-border-brand",
].map((v) => `${v} = ${cs.getPropertyValue(v).trim()}`).join("\n");
```

Troque de modo e **rode de novo**. Comparar com a marca `default` no mesmo modo é o
que revela vazamento.

## Os 4 sinais de defeito

| Sinal | Provável causa |
|---|---|
| Var do **light** aparecendo no **dark** (ou vice-versa) | vazamento de especificidade — ver abaixo |
| Var vazia / valor herdado da default onde a marca devia mudar | token ausente do diff (nome errado no semântico) |
| `bg.canvas` ≥ `bg.surface` em luminosidade no dark | hierarquia invertida (L-008) |
| Cor certa no `:root` mas errada no elemento | classe DS inexistente — ver `dead-theme-classes` |

### O vazamento de especificidade (o defeito que a Fase 5 existe pra pegar)

`[data-theme="x"]` e `.dark` têm a **mesma** especificidade (0,1,0). O overlay é
importado **depois** do tema-base, então o bloco light vencia o `.dark` por ordem de
fonte — e todo token que a marca muda no light mas cujo dark é **igual** ao da default
(logo ausente do diff dark) recebia o valor **claro** no dark.

Já está consertado no transform: `lightSel = ${scope}:not(.dark)`. Medido em 2026-08-03
— `vibrant` vazava 13 tokens, `blue` e `green` 1 cada (`fg-strong`, bug vivo em marca
já publicada), `pay` 0 (só porque diverge nos dois modos em todo token que toca).

**Ainda assim meça**, por dois motivos: a marca nova pode ter um padrão de diff que
expõe outro caminho, e um `@import` na ordem errada reintroduz a classe do problema.
Regra geral: se você mexeu no `to-brand-overlay.ts`, meça as **5** marcas, não só a nova.

## Depois dos números, os olhos

Duas coisas que **nenhuma** medição de var pega — o mantenedor pegou as duas na
`vibrant`:

1. **Hierarquia de texto achatada.** Título e subtítulo na mesma célula de tabela, cada
   um passando AA contra o fundo, e ainda assim "quase a mesma cor". Olhe uma tabela de
   verdade, não um swatch.
2. **Força de borda.** Divisor "agressivo", input "fraco" — L% dentro da L-009 e
   errado na tela. Levou 3 rodadas de ajuste.

Compare **lado a lado com a marca `default`** na mesma tela. Sozinha, qualquer marca
parece plausível.

## Registro

Anote em `pipeline-state.md` **o que foi medido**, não "verificado":

```
- Verificação: DevTools, ?app=finance, light+dark, 14 CSS vars por modo
- Vazamento light→dark: 0 tokens (comparado com a default no mesmo modo)
- Hierarquia fg.default↔fg.muted: 2.32:1 dark (referência default 2.50:1)
- Avaliação visual do mantenedor: aprovada em <data>
```

"Verificado" não é verificação — é o que eu escrevi antes de o mantenedor abrir a tela
e achar 13 tokens quebrados.
