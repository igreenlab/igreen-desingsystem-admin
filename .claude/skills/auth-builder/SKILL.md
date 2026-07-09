---
name: auth-builder
description: >
  Monta/edita tela de LOGIN / autenticação (sign in, entrar, acesso, "tela de
  login", esqueci a senha) com o iGreen DS. Use quando o usuário pedir login,
  tela de acesso, autenticação ou splash de entrada. Ancora no example-login.
---

# auth-builder — Tela de login / autenticação (repo DS)

Tela de login split (form + painel de marca por tokens). Skill focada, não
builder com entrevista — login é quase-fixo. Não gere de memória: leia e adapte
o exemplo canônico.

## Fluxo

1. **Leia** `src/examples/login/login-screen.tsx` (fonte única) + `src/components/ui/FormField/USAGE.md`.
2. Adapte ao caso: copy/marca do painel direito, campos do form, handler `entrar`.
   - Variação pequena do próprio exemplo → edite `src/examples/login/`.
   - Nova tela de login de um showcase/exemplo → novo `src/examples/<nome>/` +
     registro (ver abaixo).
3. `npx tsc --noEmit` limpo.

## Registro no showcase (login = fullscreen puro, sem AppShell)

Login não entra no `DOC_PAGES` nem no hash-router — segue o padrão dos apps
standalone (`finance`, `order-detail`): entry point é só o `?app=`.

1. `src/App.tsx` — import: `import LoginShowcase from "./preview/pages/LoginShowcase";`
   (wrapper fino que renderiza `<LoginScreen/>` do exemplo).
2. `src/App.tsx` — handler `?app=`: `if (standaloneApp === "<id>") return <LoginShowcase />;`
   junto aos outros `standaloneApp === ...`.
3. `src/preview/components/doc-nav-data.ts` — seção "Examples", item **com `url`**:
   `{ label: "Login", href: "<id>", url: "?app=<id>" }`.

Abre em `?app=<id>` (fullscreen). Distribuição (registry.json + catálogo CLI) →
consolida no `/ds-release`, não neste passo.

## Gotchas do tipo

- **Fullscreen SEM chrome de app** — nunca `AppShell`/`MenuSidebar`. Root
  `flex min-h-screen items-center justify-center bg-bg-canvas`.
- **Sempre `<FormField>`** (L-023) + `gap-form-gap` (L-024); inputs `min-h-form-xl`.
- **Painel de marca = 100% tokens** (`bg-bg-brand` + `var(--color-fg-on-brand)` +
  `text-fg-on-brand`), sem imagem externa. Se precisar de foto: `import.meta.env.BASE_URL`,
  nunca path absoluto (`/x.png` quebra sob `base` no deploy — foi o bug do VP).
- Botão Entrar `Button color="primary" variant="filled" size="lg" w-full`;
  toggle de senha no `endAddon`. Ring por token, nunca `outline-none` só.

Handoff: `LOGIN_PRONTO: <marca> — #/<id>` (ou `?app=<id>`). Registrar CONCLUÍDO
em `.ai/status/pipeline-state.md`.
