# Memory index

> Índice das memórias de projeto. Uma linha por arquivo: título + gancho de por que ele
> ainda importa. O conteúdo mora no arquivo, nunca aqui.
>
> ⚠️ **Mantenha o gancho verdadeiro.** Até 2026-08-08 a única linha deste índice dizia que
> `.ai/context/tokens/color.md` e `CLAUDE.md` "estão V2 desatualizadas" — corrigido em
> 2026-07-30, três meses antes, e registrado como corrigido dentro da própria memória que
> a linha indexava. O `pre-commit-check.md:182` cobra este arquivo desde então e ele nunca
> foi tocado (`git log`: 1 commit, o inicial). Gancho errado é pior que ausente: quem lê o
> índice decide se abre o arquivo.

- [Nomenclatura V3 dos tokens](project_token_nomenclatura_v3.md) — o drift V2 na doc foi
  corrigido e **virou gate** (`dead-theme-classes` no `npm test`). A memória fica porque
  registra o custo medido de ter confiado na doc (25 classes mortas em `src/`, 9 delas
  `ring-ring-primary` em 4 componentes distribuídos) e a armadilha de regex que quase
  produziu 40 falsos-positivos. **Regra que sobrevive:** valide token de cor contra
  `src/styles/theme/tailwind-theme.css`, não contra doc.
