---
description: Monta uma tela de login/autenticação com o iGreen DS (example-login)
---

Carregue e siga a skill `.claude/skills/auth-builder/SKILL.md`.

$ARGUMENTS = contexto da tela de login (marca, campos, SSO…). Puxe o exemplo com
`npm run igreen:add -- example-login`, leia-o (`src/examples/login/login-screen.tsx`)
+ o `USAGE.md` do FormField, e adapte: copy/marca do painel direito, campos do
form e o handler de auth. Login é **fullscreen sem AppShell**; painel de marca
100% por tokens (sem imagem externa). Registre a rota onde o usuário indicar.
`npx tsc --noEmit` limpo antes de entregar. Aplique `DESIGN.md`.

> **Modo submódulo:** se existe `.claude/ds-config.json` com `"mode": "submodule"`, NÃO rode
> `igreen:add` — leia o exemplo direto em `<dsPath>/src/examples/login/` e importe via
> `importBase` do config.
