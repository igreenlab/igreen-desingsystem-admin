# Handoff da marca `vibrant` — procedência dos valores (ARQUIVADO)

> Status: **implementado e publicado** (lib v0.32.1 / CLI v0.21.1). Este diretório é
> **procedência**, não spec ativa — a fonte de verdade dos valores é
> `tokens/brands/vibrant/`, e o guia de uso é a página `#/themes` do showcase.

## Por que está versionado

Os 11 valores OKLCH da marca e a escala neutra acromática vieram deste handoff externo,
gerado em `uicolors.app/generate/0fff00`. Sem ele, ninguém consegue responder *"de onde veio
`oklch(0.866993 0.294055 142.3546)`?"* nem re-verificar a escala se aparecer dúvida.

A pasta original (`theme/` na raiz) era material solto do mantenedor, fora do git. Foi
arquivada aqui depois que os comentários dos tokens deixaram de citá-la por caminho — citação
para arquivo não-versionado faz o leitor parar de investigar num lugar inalcançável (L-060).

## O que veio, e o que ficou de fora

| arquivo | por que está aqui |
|---|---|
| `BRIEF.md` | **normativo.** Invariantes de contraste, teto de gamut, e as 3 decisões que o handoff manda não tomar sozinho (§4). É o §4.1 dele que evita a regressão do canvas um degrau escuro |
| `tokens.json` | **fonte de verdade** dos valores: escala brand (§1.2) e neutra acromática ancorada em `#242424` (§1.1) |
| `THEME.md` | procedência detalhada — explica de onde cada número saiu e o método de conversão sRGB → OKLCH com round-trip |

Ficaram **fora** de propósito: `index.html` (46 KB de demo visual — o próprio brief diz "não é
spec"), `theme.css` e `tailwind.config.js` (exemplos de formato, superados pela nossa
implementação em `tokens/brands/vibrant/` + `to-brand-overlay.ts`).

## ⚠️ O que NÃO seguir daqui

O handoff descreve a UI de origem, não a nossa. Três pontos onde a implementação divergiu
**com medição na mão**, e o motivo está nos comentários dos arquivos de token:

1. **`semanticExample`** — mapeia papel→shade pra um showcase de *cards*. Aplicado à nossa
   tabela densa, comprimiu a separação título↔subtítulo pra 1.34:1 (contra 2.49:1 da default).
   O §4.1 do próprio brief avisa: "o mapeamento do DS manda".
2. **`fg.on-brand`** — o brief fixa `brand-950`; usamos `black` no dark (15.32:1 contra
   10.27:1), porque sobre o neon o texto escuro sofre irradiação e aparenta menos peso. O
   requisito real do §3.1 é "não pode ser branco", e `black` satisfaz com folga.
3. **Rampa de chart monocromática** — 5 tons do mesmo verde não se separam em linha/barra.
   Só `chart-1` seguiu a marca; 2–5 mantêm as harmônicas da default.

Histórico completo das decisões e das 4 levas de calibração: `.ai/status/pipeline-state.md`,
entradas de 2026-08-03.
