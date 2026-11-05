# `.ai/specs/` — specs de design, com status

> **O que este diretório é (corrigido em 2026-08-08).** O `CLAUDE.md` o descrevia como
> "SPECS **ativas**", e as 7 specs aqui estavam **todas implementadas** — algumas havia
> mais de um ano. Quem lesse a definição concluía que havia 7 frentes abertas.
>
> **Arquivar não é a saída.** Medi: essas specs têm **11 ponteiros vivos** — de
> `architecture.md`, `typography.md`, `registry-add-item.mjs`, `ds-lint-styles.sh`,
> `CODEOWNERS`, 3 skills e 2 páginas do showcase. Movê-las quebraria todos, pra ganhar
> organização. O que faltava era **status**, não endereço novo.

Cada spec **declara status**, em um de dois lugares — os dois valem, e qual usar é
o que o arquivo já usa:

- **Frontmatter YAML** `status:` (`---` … `---` no topo, junto de `titulo`/`criado`/
  `relacionado`) — a forma dos arquivos criados a partir de 2026-11.
- **Bloco `> **Status:**`** logo abaixo do `#` — a forma dos mais antigos.

> **Por que duas, e por que isto não virou retrofit (2026-11-04).** A regra dizia
> *"cada spec abre com um bloco `> **Status:**`"* e **8 arquivos** não cumpriam: os 7
> do lote Sólis, que nascem com frontmatter, e o `solis-rodadas-plano.md`, que não
> tinha status nenhum. Reescrever 7 frontmatters — que carregam `titulo`, `criado` e
> `relacionado`, são parseáveis e já são a convenção de fato — pra satisfazer uma frase
> seria estragar o maior lado pelo menor. Nenhum gate lê o status: o custo é só de quem
> lê. Então a regra passou a descrever as duas formas, e o **único** arquivo realmente
> sem status ganhou um.

Vocabulário, pra spec de design (a que vira ou não vira código):

| Status | Significa |
|---|---|
| `IMPLEMENTADA (<data>)` | virou código. Fica aqui como **referência de decisão** — o "por quê" que a diff não conta |
| `ATIVA` | frente aberta; alguém está trabalhando nela |
| `PROPOSTA (<data>)` | desenho pronto pra avaliação, **nada implementado e ninguém trabalhando**. Existe pra o desenho sobreviver até a decisão — ver a nota abaixo |
| `DESCARTADA (<data>) — <motivo>` | decidiu-se não fazer. Fica pra não ser reproposta |

**Documento de registro** (triagem, fechamento, backlog, folha de decisão) não é spec de
design e não cabe nesses quatro: ele declara o próprio estado — `ANÁLISE`, `ABERTO`,
`ATIVO`, `PARA DECISÃO`, `DECIDIDAS`, `PRONTO PARA ENVIO`. A tabela "Estado hoje" abaixo
já imprimia dois desses antes de a regra admiti-los.

> **Por que `PROPOSTA` foi criado em 2026-08-19.** Faltava o status de "desenhado, não decidido":
> `ATIVA` afirmaria que alguém está trabalhando, e sem status a spec parece frente aberta. O
> gatilho foi concreto — o desenho anterior dos Blocos (códigos de referência,
> `blocks-catalog.json`, 5 fases) foi feito em **plan mode**, morava em `~/.claude/plans/` e
> **desapareceu**. Sobraram 8 linhas de resumo num item de backlog, que ainda mandavam "revisitar
> esse plano". Desenho de arquitetura fora do repo não sobrevive: ou entra aqui, ou não existe.

## Estado hoje

| Spec | Status | Onde virou código |
|---|---|---|
| `table-replica-from-sandbox.md` | **IMPLEMENTADA** (2026-05-18) | `src/components/ui/DataTable/` |
| `typography-rewrite-2026-05-19.md` | **IMPLEMENTADA** (2026-05-19) | `tokens/.../typography.ts` — 27 presets em 7 roles |
| `kpi-pack.md` | **IMPLEMENTADA** (2026-06-23) | `src/components/ui/Kpi/` |
| `registry-distribution.md` | **IMPLEMENTADA** (2026-07-08) | `registry.json`, `registry-app/`, `npm run registry:build` |
| `pipeline-governance-ci.md` | **IMPLEMENTADA** (2026-07-29) | `.github/workflows/ci.yml`, `CODEOWNERS`, `pull_request_template.md` |
| `pipeline-conformance-showcase.md` | **IMPLEMENTADA** (2026-07-29) | `scripts/lib/showcase-registration.mjs`, `ds-exceptions.mjs` |
| `brand-vibrant-handoff/` | **IMPLEMENTADA** (2026-08-03) | `tokens/brands/vibrant/` — 5ª marca |
| `blocks-catalogo-de-composicoes.md` | **IMPLEMENTADA** (2026-08-20) | `src/blocks/`, `scripts/blocks-build.mjs`, `BlocksChartsDoc.tsx`, Passo 0 do `ds-kit` |
| `datatable-feedback-solis.md` | **IMPLEMENTADA** (2026-10-22) | `src/components/ui/DataTable/`, `TableToolbar/`, `FooterTable/`, `#/filter-chips-lab` — PR #343 |
| `scheduler-componente-de-calendario.md` | **IMPLEMENTADA** (2026-09-01) | `src/components/ui/Scheduler/` |
| `gantt-componente-de-cronograma.md` | **IMPLEMENTADA** (2026-10-23) | `src/components/ui/Gantt/` |

> `brand-vibrant-handoff/` tem um vínculo extra: o `.gitignore` (linhas 30-33) explica que
> o diretório `theme/` da raiz é cópia **byte-idêntica** dele. Mover quebraria essa
> explicação também.

### Lote Sólis (SOLIS-238) — 9 documentos

Nenhum destes é spec de design: são o registro do lote. **A visão inteira está no
`solis-fechamento.md`** — os outros são detalhe, e dois deles dizem isso de si mesmos
no topo.

| Documento | Status | O que é |
|---|---|---|
| `solis-fechamento.md` | **ATIVO** (2026-11-04) | **o documento único** — tudo que foi pedido contra tudo que aconteceu, depois de uma auditoria independente. Comece por ele |
| `solis-pedidos-2-analise.md` | **ANÁLISE** (2026-11-03) | triagem dos ~45 pedidos do SOLIS-238 em A/B/C/D. Não vira código: decide o que vira |
| `solis-rodadas-plano.md` | **IMPLEMENTADA** (2026-11-04) | o plano de execução: 18 tarefas em 5 rodadas, **todas fechadas** (PRs #355, #356, #358, #360, #361). ⚠️ Os 103 checkboxes nunca foram marcados — o estado real é o do fechamento, não o deste arquivo |
| `solis-pendencias-para-validar.md` | **ABERTO** (2026-11-03) | o que ficou de fora do lote e precisa de decisão do mantenedor |
| `backlog-solis.md` | **ATIVO** (2026-11-04) | as 23 linhas do que não foi feito, cada uma com motivo, recomendação e custo. Separado do `BACKLOG.md` do projeto de propósito |
| `solis-folha-de-decisao.md` | **ATUALIZADA** (2026-11-04) | ⚠️ **incompleta** — cobre só os P-itens; o próprio arquivo manda usar o fechamento |
| `solis-o-que-sai-e-o-que-fica.md` | **PARA DECISÃO** (2026-11-04) | ⚠️ **incompleta** pelo mesmo motivo — o lote em três listas, sem os seis pedidos adiados |
| `solis-para-avaliar.md` | **DECIDIDAS** (2026-11-04) | as 9 que faltavam decidir, com o veredito do mantenedor em cada |
| `solis-resposta-itens-do-projeto.md` | **PRONTO PARA ENVIO** (2026-11-04) | os 5 pedidos que são do projeto do Sólis, não do DS, com o caminho de cada um |

## Onde estão as coisas parecidas

| Diretório | O que guarda |
|---|---|
| `.ai/specs/` | **por que** uma decisão de design foi tomada (este) |
| `.ai/plans/` | plano de execução de uma frente (passo a passo) |
| `.ai/status/archive/` | material que **não tem mais ponteiro vivo** — ex.: `superpowers-2026-05/`, `superpowers-2026-06/`, `migracoes/` |
| `.ai/audits/` | medições pontuais, congeladas por natureza |
