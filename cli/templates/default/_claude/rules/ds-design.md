---
description: Regras de design do iGreen DS — aplicar ao gerar/editar qualquer UI (.tsx)
globs: ["**/*.tsx", "**/*.styles.ts"]
alwaysApply: true
---

# Regras de design iGreen (auto-carregadas)

Ao gerar ou editar QUALQUER UI neste projeto, aplique sem ser pedido. Detalhe e
contexto em `DESIGN.md` (raiz). API de cada componente em
`src/components/ui/<Nome>/USAGE.md`.

## Composição de tela
- Wrapper de página: `flex flex-col h-full min-h-0 gap-gp-2xl`.
- **24px (`gap-gp-2xl`) entre o `PageHeader` e o próximo bloco** — nunca grudado.
- Conteúdo que precisa preencher (tabela): `className="flex-1 min-h-0"` + pai com altura.
- Forms: `<FormField>` (nunca `<label>` cru) + `gap-form-gap` (20px) entre campos.
- Card: padding `p-pad-card-base` (24px); entre cards `gap-gp-md`/`gap-gp-lg`.

## Tokens (classe DS antes de Tailwind literal)
```
gap-4 → gap-gp-md      p-4 → p-sp-md/p-pad-2xl    rounded-lg → rounded-radius-lg
shadow-md → shadow-sh-md    h-9/h-10 → min-h-form-md/lg    size-5 → size-icon-md
```
- Foco: `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-{color}` (ring já tem alpha — nunca `/30`, nunca `ring-3`).
- Cor só por token semântico (`bg-bg-brand`, `text-fg-default`...). Zero hex em className. Destrutivo na API = `color="critical"`.

## Tipografia
- Default interativo: `text-body-sm` (13/500). Presets display/heading/title/body/caption/code.
- Override de peso via `font-bold/semibold/medium/normal`. Nunca `text-xs font-semibold` avulso → use preset.

## Antes de criar
- Existe exemplo/skill pra isso? (tabela→`/ds-create-crud`; ver `DESIGN.md` mapa de intenção). Puxe e adapte em vez de escrever do zero.
- Leu o `USAGE.md` do componente? Não invente prop/variante.
- `npx tsc --noEmit` limpo antes de entregar.
