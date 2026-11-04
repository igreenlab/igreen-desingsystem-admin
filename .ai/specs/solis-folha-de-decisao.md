---
titulo: Folha de decisão — as 15 pendências, com recomendação e custo de não fazer
status: PARA DECISÃO
criado: 2026-11-04
---

# Folha de decisão — o que fazer com as 15

Tudo aqui é o **item 3** do documento das três listas: **nada foi feito**, e **nada bloqueia
o release**.

Organizado pela única pergunta que ajuda a decidir: **o que acontece se não fizer?**

---

## 🟢 GRUPO A — recomendo fazer (4 itens, 1 rodada)

São defeitos com usuário do outro lado, e os quatro se resolvem juntos porque são o **mesmo
motor**.

| # | o defeito | se não fizer |
|---|---|---|
| **P1+P2** | o `DataList` combina filtros escalares do mesmo campo por **AND**; o `DataTable` por **OR**. São a mesma pergunta vista de dois lados | dois filtros no mesmo campo: a tabela devolve quem bate em qualquer um, a lista **não devolve ninguém**. Silencioso |
| **P3** | desmarcar o último valor **desmonta o chip no meio da interação** e fecha o popover | o usuário perde o lugar no meio de uma ação. O `DataTable` já se protege disso de propósito; o `DataList` não |
| **P11** | o `error` do `useDataTableQuery` **não é lido por ninguém** | quando o fetch falha, o rodapé fica **permanentemente** otimista — diz página 2 com as linhas da 1, e nada avisa |

**Por que juntos:** o `DataTable` já respondeu "OR" para a P1/P2. Alinhar o `DataList` é
copiar a resposta que já existe, e isso destrava a P3 pelo mesmo caminho. A P11 é o mesmo
arquivo.

**Custo:** uma rodada, no padrão das anteriores.
**Decisão que você precisa tomar antes:** confirmar que o **OR** do `DataTable` é a resposta
certa — é ele que vira o padrão dos dois.

---

## 🟡 GRUPO B — decidir, mas tem janela (2 itens)

Não urgem por defeito. Urgem porque **a janela fecha**.

| # | o quê | a janela |
|---|---|---|
| **P13** | `renderEmpty` é o **terceiro** nome do slot de vazio (`emptyState` nos outros dois). Dos três, ele é o errado: **soa** render-prop e recebe `ReactNode` | renomear é **breaking** → só num major. Enquanto não houver major, fica |
| **P12** | `Gantt` e `Scheduler` **copiam** a gramática do chip em vez de importar | piora com o tempo: toda tela nova nasce com a pele antiga, e alinhar fica mais caro a cada uma |

⚠️ **A P12 diminuiu, mas não sumiu**, agora que o destaque do chip virou opt-in. Eles
continuam com a cópia; só não divergem mais na cor por default.

---

## 🔵 GRUPO C — decisão de **design**, não de código (3 itens)

Nenhum é "implementar". Os três pedem que alguém **escolha a forma** antes.

| # | o quê | por que não é código |
|---|---|---|
| **4 tipos sem saída** (`select`, `boolean`, `badge`, `user`) | filtro posto **se troca mas não se esvazia** pelo funil. A única saída é o "Limpar todos", que apaga tudo | ⚠️ **O Radix proíbe opção vazia.** Exige escolher: item "Todos" sentinela? botão de limpar na linha? ícone no próprio Select? |
| **P14** | `fg-brand` como **texto** no escuro mede 4,36:1 — reprova o AA por 0,14 | já resolvido **no chip**. A questão é se vira **gate** para o DS inteiro, e aí precisa decidir o limiar e o que fazer com os casos existentes |
| **P8** | linhas mantidas no `loadingMode="keep"` não têm sinal visual | a rota **CSS** existe hoje; a **React** não. Decidir se o contexto passa a expor a flag é mudança de API pública |

---

## ⚪ GRUPO D — deixar como está, documentado (6 itens)

Recomendo **não fazer**. Os seis estão nomeados com o mecanismo, para quando alguém tropeçar.

| # | o quê | por que deixar |
|---|---|---|
| **P15** | export com `fetchData` + `rows` entrega as rows locais | o contorno (*"com `fetchData`, não passe `rows`"*) está em 4 superfícies. Consertar toca os dois caminhos de server |
| **P10** | o `DataList` não tem `loadingMode` | ele não tem `fetchData`; a assimetria só morde quando ganhar |
| **P5** | não existe `defaultOpen` no `simpleFilter` | custa o deep-link nascendo aberto. Adição barata **quando alguém pedir** |
| **P6** | a transição controlado⇄não-controlado não é testada | a guarda existe e funciona (medido). Falta o **teste**, não o código |
| **P7** | deps do `useCallback` usam o valor, não um booleano | inofensivo hoje — o drawer não é memoizado |
| **P4** | churn de UUID a cada toggle do chip | nada indexa por id (procurado e confirmado) |

---

# O caminho que eu recomendo

```
1. RELEASE v0.71.0 agora          → o time avalia a feature
2. Feedback deles                  → pode reordenar tudo abaixo
3. Grupo A numa rodada             → é o que tem usuário do outro lado
4. Grupo B e C quando houver major ou necessidade
5. Grupo D fica documentado
```

**A razão de o release vir primeiro** não é pressa: é que o feedback do time pode mudar a
prioridade do Grupo A. Eles usam o `DataList` todo dia; se o AND/OR não incomoda ninguém, ele
desce na fila — e se incomoda, sobe acima do que eu imaginei.

---

## Se você quiser atacar algo antes do release

O **Grupo A** é o único que eu faria. E, dentro dele, a decisão que destrava tudo é uma
pergunta sua:

> **Dois filtros escalares no mesmo campo devem combinar por AND ou por OR?**

O `DataTable` já faz **OR** (quem bate em qualquer um dos dois entra). Se você confirmar que
é essa a resposta certa, o resto é alinhar o `DataList` a ela.
