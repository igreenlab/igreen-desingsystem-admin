---
titulo: Folha de decisão — o que foi feito, o que ficou e o que apareceu no caminho
status: ATUALIZADA 2026-11-04 (pós Grupo A + P12)
criado: 2026-11-04
---

# Folha de decisão

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

# 🔵 EM ABERTO — decisão de **design**, não de código (3)

Nenhum é "implementar". Os três pedem que alguém **escolha a forma** antes.

| # | o quê | o que precisa ser decidido |
|---|---|---|
| **4 tipos sem saída** (`select`, `boolean`, `badge`, `user`) | filtro posto **se troca mas não se esvazia** pelo funil. A única saída apaga todos | ⚠️ **O Radix proíbe opção vazia.** Item "Todos" sentinela? Botão de limpar na linha? Ícone no Select? |
| **P14** | `fg-brand` como **texto** no escuro mede 4,36:1 — reprova o AA por 0,14 | se vira **gate** para o DS inteiro, e aí o limiar e o que fazer com os casos existentes. ⚠️ **Virou mais urgente** — ver N1 abaixo |
| **P8** | linhas mantidas no `loadingMode="keep"` sem sinal visual | a rota **CSS** existe; a **React** não. Expor a flag no contexto é mudança de API pública |

---

# ⚪ EM ABERTO — recomendo deixar documentado (6)

Nenhum nasceu no lote. Todos nomeados com o mecanismo, para quando alguém tropeçar.

| # | o quê | por que deixar |
|---|---|---|
| **P15** | export com `fetchData` + `rows` entrega as rows locais | o contorno está em 4 superfícies |
| **P10** | o `DataList` não tem `loadingMode` | ele não tem `fetchData`; só morde quando ganhar |
| **P5** | não existe `defaultOpen` no `simpleFilter` | adição barata **quando alguém pedir** |
| **P6** | a transição controlado⇄não-controlado não é testada | a guarda existe e funciona (medido). Falta o **teste** |
| **P7** | deps do `useCallback` usam o valor | inofensivo — o drawer não é memoizado |
| **P4** | churn de UUID a cada toggle | nada indexa por id |

---

# 🆕 APARECERAM DURANTE A EXECUÇÃO (4)

| # | o quê | gravidade |
|---|---|---|
| **N1** | ⚠️ **`bg-bg-danger-muted` + `text-fg-danger` mede 3,14:1** — reprova o AA. É pareamento **estabelecido** do DS: Badge, Chip, Button, AlertModal | **pior que a P14** (4,36), que é o que a motivou. Se o gate de contraste nascer, o `danger` é o primeiro a reprovar |
| **N2** | o `setGroupValue` joga o grupo para o **fim** do array — o chip **pula de posição** ao editar | o `DataTable` já resolveu reconstruindo in-place, com o comentário *"visualmente confuso quando há 3+ chips"*. Receita existe |
| **N3** | `toolbarAppliedTagClass` é **export morto** — declarado, nunca usado | limpeza; mantido como alias para não mexer em escopo alheio |
| **N4** | `chip-multi-valor.test.tsx` é **flaky sob carga** — caiu uma vez e passou sozinho | dois testes dependem de `waitFor` sobre debounce de 250ms. Não caiu em ~8 runs depois |

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

Das que ficaram, a que eu levantaria primeiro é a **N1**: um pareamento de cor que o DS usa
em quatro componentes e que reprova o contraste mínimo é mais sério que qualquer item desta
lista, e foi achado por acaso, medindo outra coisa.
