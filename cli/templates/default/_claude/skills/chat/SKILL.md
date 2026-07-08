---
name: chat
description: >
  Monta telas de chat/inbox/atendimento (lista de conversas + thread + composer)
  com o iGreen DS. Use quando o usuário pedir "chat", "inbox", "conversas",
  "atendimento", "mensagens", "caixa de entrada". Ancora no example-chat.
---

# chat — Inbox / conversas

Tela de chat: coluna de conversas + thread de mensagens + composer.

## Fluxo
1. `npm run igreen:add -- example-chat` (traz a tela + componentes).
2. **Leia** `src/examples/chat/chat-screen.tsx` + os sub-componentes (ConversationColumn, etc) + USAGE dos componentes DS usados.
3. Adapte canais, conversas e mensagens aos dados do usuário.
4. Registre a rota. `npx tsc --noEmit` limpo.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> o DS é consumido como **submódulo** (não copy-in): os componentes/exemplos JÁ estão no disco
> em `<dsPath>/src` e **não** há registry. Use `importBase` do config (ex.: `@ds/components/ui/Avatar`)
> e leia o exemplo direto em `<dsPath>/src/examples/chat/chat-screen.tsx` —
> **NÃO** rode `igreen:add`.

## Gotchas do tipo
- Chat ocupa 100% da altura disponível: wrapper `flex flex-col h-full min-h-0` (sem o gap-2xl de página comum — a tela é edge-to-edge).
- Layout em colunas: lista de conversas (largura fixa) + thread (flex-1) + opcional painel de detalhe.
- Avatares de pessoa via `Avatar` (cor por `colorHex` quando custom — contraste WCAG automático).
- Status de canal/online via dot/`Chip`.
- Scroll independente por coluna; composer fixo no rodapé da thread.

Aplique `DESIGN.md` + regras. Handoff: `CHAT_PRONTO` + rota.
