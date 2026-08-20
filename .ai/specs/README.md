# `.ai/specs/` — specs de design, com status

> **O que este diretório é (corrigido em 2026-08-08).** O `CLAUDE.md` o descrevia como
> "SPECS **ativas**", e as 7 specs aqui estavam **todas implementadas** — algumas havia
> mais de um ano. Quem lesse a definição concluía que havia 7 frentes abertas.
>
> **Arquivar não é a saída.** Medi: essas specs têm **11 ponteiros vivos** — de
> `architecture.md`, `typography.md`, `registry-add-item.mjs`, `ds-lint-styles.sh`,
> `CODEOWNERS`, 3 skills e 2 páginas do showcase. Movê-las quebraria todos, pra ganhar
> organização. O que faltava era **status**, não endereço novo.

Cada spec abre com um bloco `> **Status:**`. Formato:

| Status | Significa |
|---|---|
| `IMPLEMENTADA (<data>)` | virou código. Fica aqui como **referência de decisão** — o "por quê" que a diff não conta |
| `ATIVA` | frente aberta; alguém está trabalhando nela |
| `PROPOSTA (<data>)` | desenho pronto pra avaliação, **nada implementado e ninguém trabalhando**. Existe pra o desenho sobreviver até a decisão — ver a nota abaixo |
| `DESCARTADA (<data>) — <motivo>` | decidiu-se não fazer. Fica pra não ser reproposta |

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

> `brand-vibrant-handoff/` tem um vínculo extra: o `.gitignore` (linhas 30-33) explica que
> o diretório `theme/` da raiz é cópia **byte-idêntica** dele. Mover quebraria essa
> explicação também.

## Onde estão as coisas parecidas

| Diretório | O que guarda |
|---|---|
| `.ai/specs/` | **por que** uma decisão de design foi tomada (este) |
| `.ai/plans/` | plano de execução de uma frente (passo a passo) |
| `.ai/status/archive/` | material que **não tem mais ponteiro vivo** — ex.: `superpowers-2026-05/`, `superpowers-2026-06/`, `migracoes/` |
| `.ai/audits/` | medições pontuais, congeladas por natureza |
