# Audits — read-only snapshots

Esta pasta guarda auditorias pontuais do estado do projeto. Cada audit é
um snapshot **read-only** em uma data específica — não é uma "fonte de
verdade ativa", mas serve de referência para os agentes do pipeline
(`ds-designer`, `ds-dev`, `ds-reviewer`) ao especificar/implementar
mudanças que toquem nas áreas auditadas.

> ⚠️ **Congelado por natureza, não por abandono.** Nada aqui muda desde 2026-06-10, e
> isso é o comportamento correto: audit é medição datada. Ao ler qualquer arquivo desta
> pasta, **trate os números como históricos** — o inventário de tipografia de maio, por
> exemplo, precede a consolidação em 27 presets / 7 roles. Para o estado ATUAL, a fonte é
> sempre o artefato gerado (`src/styles/theme/tailwind-theme.css`), nunca um audit.
>
> Auditorias novas entram aqui. As que perderem qualquer referência viva vão pra
> `.ai/status/archive/`.

## Convenções

- **Nome**: `<tópico>-<data>.md` (ex: `typography-inventory-2026-05-18.md`)
- **Conteúdo**: catalogação de estado, sem recomendações implementacionais
- **Atualização**: snapshots não são editados depois — uma nova versão
  gera um arquivo novo com data diferente
- **Tamanho**: pode ser grande (10-50KB). Indexar via TOC.

## Quando criar um audit

- Antes de uma refatoração ampla (catalogar o que existe)
- Quando o pipeline AI precisa de contexto histórico (ex: "como tipografia
  está distribuída hoje?")
- Pós-incidente, pra documentar estado quando algo quebrou

## Audits ativos

- [typography-inventory-2026-05-18.md](typography-inventory-2026-05-18.md)
  — inventário completo de uso tipográfico
