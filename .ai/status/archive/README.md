# Archive do pipeline-state — o que está em cada arquivo

Índice do que foi arquivado do `.ai/status/pipeline-state.md`. Nada aqui precisa ser lido
pra trabalhar; existe pra quando você precisar do **porquê** de uma decisão antiga.

⚠️ **Convenção de nome, explicitada em 2026-08-17.** Os dois primeiros arquivos abaixo
foram nomeados pela **data do arquivamento**; os novos são nomeados pelo **conteúdo**.
Isso confundia: quem procurasse junho em `2026-06.md` acharia maio. Os cabeçalhos sempre
disseram a verdade — o nome é que não. Não renomeei os antigos porque logs arquivados
referenciam o nome atual, e eles são append-only.

| Arquivo | Contém | Entradas | Arquivado em |
|---|---|---|---|
| [`2026-06.md`](2026-06.md) | trabalho concluído de **2026-05-12 a 2026-05-16** — DataTable (Fases A–G), Table primitivo, Saved Views, hooks, column-type system. **Note: entradas de MAIO**, apesar do nome | 62 | 2026-06-18 |
| [`log-de-sessoes-2026-05-a-08.md`](log-de-sessoes-2026-05-a-08.md) | a seção `Log de sessões` inteira — registro sessão por sessão, **2026-05-16 a 2026-08-03** | 39 | 2026-08-17 |
| [`auditoria-retroativa-v0.3.0.md`](auditoria-retroativa-v0.3.0.md) | a varredura retroativa da v0.3.0, que deu `Assumption` a decisões tomadas antes de o campo existir — **2026-05-19 a 2026-06-09** | 19 | 2026-08-17 |
| [`migracoes/`](migracoes/) | docs de migração encerrados (ex.: o `MIGRATION.md` que mandava usar um remote `mirror` inexistente) | — | 2026-08-08 |
| [`superpowers-2026-05/`](superpowers-2026-05/) · [`superpowers-2026-06/`](superpowers-2026-06/) | plans e specs implementados | — | — |

## O que continua no arquivo ativo, e por quê

- **`Índice de decisões arquiteturais`** — é o log **vivo**: recebe toda entrada nova.
- **`Formatos de entrada por status`** — referência de formato, não é histórico.
- **`Índice de componentes`** e **`Sessão 2026-04`** — pequenos e consultados.
- **As 3 entradas `PAUSADO`/`CASCATA` de 2026-05-16** (Avatar, Kanban, token de scrollbar).
  O trabalho aconteceu — `avatar-ig` e `Kanban` existem —, mas nenhuma tem entrada de
  fechamento, e a política manda preservar aberta. Mantidas por decisão deliberada, a
  mesma que o arquivamento de 2026-06-18 já havia tomado.

## Como arquivar a próxima vez

O `orchestrator.md` manda mover "entradas CONCLUÍDO/APROVADO com 30+ dias". ⚠️ **Isso
assume um log cronológico único, e o arquivo não é isso** — ele tem seções paralelas, cada
uma cronológica dentro de si, e as faixas de data se sobrepõem por completo (medido em
2026-08-17: agosto ia da linha 69 à 3315; maio, da 1264 à 1687). Fatiar por data
embaralharia seções diferentes.

**Arquive por SEÇÃO inteira**, quando ela estiver encerrada: nada é separado do próprio
contexto, e o corte é verificável (conte as entradas antes e depois — a soma tem que bater).
