# Auditoria de Segurança — 2026-08-07

Design system iGreen: componentes React distribuídos via CLI (`igreen add`),
lib npm e um registry privado (Next.js na Vercel, `registry-app/`) protegido
por Bearer token. Autor: Dario C Oliveira.

## Histórico de correções

| Item | Auditoria | Status no `main` |
|---|---|---|
| Comparação non-constant-time do Bearer token no registry | 2026-08-07 | ⏳ Aguardando merge de `security` |
| `@playwright/mcp@latest` sem pin de versão em `.mcp.json` | 2026-08-07 | ⏳ Aguardando merge de `security` |
| Distribuição (npm CLI/lib, Vercel) sob conta pessoal `snksergio` | 2026-08-07 | 🟡 Decisão do time — ver Pendências |

## Corrigido nesta revisão

### Baixo

- **Comparação non-constant-time do Bearer token**
  (`registry-app/app/r/[name]/route.ts`): `auth !== \`Bearer ${token}\`` compara
  string por string, vazando timing por caractere. Já era um item conhecido
  em `.ai/status/BACKLOG.md` (que deprioriza a feature maior de
  multi-token/rotação — "não vale o custo hoje" — mas não trata
  especificamente do endurecimento da comparação). Trocado por
  `crypto.timingSafeEqual` com checagem de tamanho antes (evita o `throw`
  que `timingSafeEqual` dá em buffers de tamanho diferente).
- **`@playwright/mcp@latest` sem pin** (`.mcp.json`): fixado em `0.0.79`
  (versão publicada verificada no registry do npm), removendo a superfície
  de supply-chain de rodar `npx` contra o que estiver publicado no momento.

## Pendências antes de fechar

- [ ] **Médio — Distribuição sob conta pessoal `snksergio`** (npm CLI, npm
      lib, registro na Vercel): já existe um runbook de migração pronto em
      `MIGRATION.md`, mas não foi executado. **Não mexi nisso nesta
      auditoria** — a mesma classe de risco já apareceu no `design-system`
      (outro repo desta auditoria): trocar o apontador de distribuição sem
      confirmar que o destino novo tem o mesmo conteúdo/histórico/tags pode
      quebrar consumidores existentes silenciosamente. Migrar exige acesso
      real de admin ao npm/Vercel/GitHub da org e execução coordenada do
      runbook já escrito, não uma edição de arquivo.

Verificado com `pnpm install` + `npx tsc --noEmit` em `registry-app/`
(limpo, sem erros de tipo).
