---
name: auth-builder
description: >
  Monta tela de LOGIN / autenticação (sign in, entrar, acesso, "tela de login",
  esqueci a senha) com o iGreen DS. Use quando o usuário pedir login, tela de
  acesso, autenticação ou splash de entrada. Ancora no example-login.
---

# auth-builder — Tela de login / autenticação

Tela de login split (form + painel de marca) usando o padrão do DS. Não gere de
memória — puxe e adapte o exemplo.

## Fluxo

1. `npm run igreen:add -- example-login` (traz a tela + `Button`, `FormField`).
2. **Leia** `src/examples/login/login-screen.tsx` + `src/components/ui/FormField/USAGE.md`.
3. Adapte ao caso: marca/copy do painel direito, campos do form (email/senha,
   ou telefone/código, SSO…), e o handler `entrar` (plugue a auth real).
4. Registre a rota onde o usuário indicar (login é fullscreen, sem AppShell).
   `npx tsc --noEmit` limpo.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> o DS é consumido como **submódulo** (não copy-in): componentes/exemplos JÁ estão no disco
> em `<dsPath>/src` e **não** há registry. Use `importBase` do config (ex.: `@ds/components/ui/FormField`)
> e leia o exemplo direto em `<dsPath>/src/examples/login/login-screen.tsx` — **NÃO** rode `igreen:add`.

## Gotchas do tipo

- **Login é fullscreen SEM chrome de app** — não embrulhe em `AppShell`/`MenuSidebar`.
  Root = `flex min-h-screen ... items-center justify-center bg-bg-canvas`.
- **Sempre `<FormField>`** (FormFieldInput/Checkbox) — nunca `<label>` cru (L-023).
  Spacing do form = `gap-form-gap` (L-024). Inputs `min-h-form-xl` (44px, WCAG mobile).
- **Painel de marca = 100% tokens, sem imagem externa** (evita "imagem quebrada"):
  `bg-bg-brand` + camadas decorativas via `var(--color-fg-on-brand)` + texto
  `text-fg-on-brand`. Some no mobile (`hidden lg:flex`). Se PRECISAR de foto, use
  caminho base-aware (`import.meta.env.BASE_URL`), nunca `/arquivo.png` absoluto.
- **Botão Entrar** = `<Button color="primary" variant="filled" size="lg" className="w-full">`.
  Toggle de senha = `<button type="button">` no `endAddon` do FormFieldInput.
- Ring/focus por token (`focus-visible:ring-4 focus-visible:ring-ring-brand`), nunca
  `outline-none` sozinho.

Aplique `DESIGN.md` + `.claude/rules/ds-design.md`. Handoff: `LOGIN_PRONTO: <marca>` + rota.
