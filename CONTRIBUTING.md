# Contribuindo com o iGreen Design System

Este repositório é diferente do normal: ele tem um **pipeline de IA** que já
conhece as regras do DS. Se você trabalhar dentro dele, sai no padrão sem ter
que decorar nada. Se trabalhar por fora, o CI vai te apontar o que ficou fora —
e você faz duas viagens em vez de uma.

**Leia isto até o fim antes da primeira PR.** São 5 minutos e evita retrabalho.

---

## O caminho mais rápido (e o certo)

Abra o repositório no **Claude Code** e diga o que você precisa. O `CLAUDE.md`
e as regras do DS carregam sozinhos — você não precisa configurar nada.

Comece com uma frase assim:

```
Preciso [criar um componente X / corrigir o comportamento Y / ajustar o visual de Z].
Siga o pipeline do DS: confira o inventário antes de criar, não invente token,
e passe pelo DS Reviewer antes de abrir a PR.
```

O fluxo então cuida do resto: confere se o componente já existe, monta a spec,
pede sua aprovação, implementa e **revisa antes da PR**. Essa revisão é a parte
que mais economiza seu tempo — ela pega o que o CI pegaria depois, mas antes de
você abrir a PR.

Se você **não** programa, existe um roteiro em linguagem simples:
[`INICIO-DE-SESSAO.md`](INICIO-DE-SESSAO.md).

---

## O que o CI vai verificar (e pode te bloquear)

A `main` é protegida: PR obrigatória, aprovação do dono da área, e o job
**`check`** precisa passar. Ele roda:

| Verificação | O que reprova | Como resolver |
|---|---|---|
| **Lint de estilos** | classe Tailwind literal onde existe token do DS — `gap-4` em vez de `gap-gp-md`, `h-10` em vez de `min-h-form-lg`, `rounded-lg` em vez de `rounded-radius-lg`, `shadow-md` em vez de `shadow-sh-md` | trocar pelo token; rode `npm run lint:styles` antes de subir |
| Tipos + testes | `tsc` e `vitest` | `npx tsc --noEmit` e `npm test` |
| Consistência do registry | caminho declarado que não existe no disco | corrigir o `registry.json` |
| **Sync de foundationals** | você mexeu em `cn`, `tv` ou no tema, e a cópia que vai pro CLI ficou defasada | `npm run cli:rebake` |
| **Drift de exemplos** | você mexeu num showcase que tem exemplo distribuível espelhado | re-extrair o exemplo e rodar `node scripts/examples-drift-check.mjs --baseline` |

Os dois últimos pegam gente de surpresa: são arquivos "espelhados" em outro
lugar do repo, e mudar só um lado quebra o par.

**Duas coisas importantes sobre o lint:**

1. Ele só reprova violação em **linha que você adicionou**. Débito antigo no
   arquivo que você tocou não é problema seu.
2. Quando reprova, o erro aparece **marcado na linha exata**, na aba *Files
   changed*, já com o token que você deveria usar. Não precisa caçar no log.

⚠️ **Código movido conta como adicionado.** Se você só reposicionou uma linha
que já violava, o lint vai acusar. Corrija-a na passagem.

---

## Regras que não têm exceção

**Nunca invente token.** Cor, espaçamento, tamanho, sombra, raio — se faltar o
que você precisa, **pare** e sinalize. Criar token é outro fluxo (tem aprovação
própria). Valor cravado (`#fff`, `16px`, `0.875rem`) não passa.

**Confira o inventário antes de criar componente.** Em
[`.ai/context/components/inventory.md`](.ai/context/components/inventory.md).
Já aconteceu de recriarem coisa que existia.

**Visual muda só no `.styles.ts`.** Se você está escrevendo classe de estilo
dentro do `.tsx`, provavelmente está no arquivo errado.

**`tv` vem de `@/utils/tv`**, nunca de `tailwind-variants` direto — o wrapper do
DS carrega uma configuração sem a qual algumas classes são removidas **em
silêncio**.

**Nunca commite direto na `main`.** Branch própria sempre. (A `main` está
protegida, então isso já falha — mas evite a surpresa.)

---

## Componente novo: o que entra na sua PR e o que não entra

Um componente novo toca **8 superfícies** (L-042). **Na sua PR vão as 4 primeiras + o barrel:**

- [ ] Código em `src/components/ui/<Nome>/`
- [ ] `USAGE.md` ao lado dele
- [ ] Linha em `.ai/context/components/inventory.md`
- [ ] Showcase — os **3** registros, sem os quais a rota abre em branco (L-042):
      1. `src/preview/pages/<Nome>Doc.tsx` — a doc page
      2. `src/App.tsx` — **três** edições: `import { <Nome>Doc } from "./preview/pages/<Nome>Doc";`
         no topo, `"<id-kebab>",` no array `DOC_PAGES` **e**
         `{activePage === "<id-kebab>" && <<Nome>Doc />}` na cascata de render
      3. `src/preview/components/doc-nav-data.ts` — `{ label: "...", href: "<id-kebab>" }`
- [ ] **`export * from "./ui/<Nome>"` em `src/components/index.ts`** — é o barrel, e é o que
      define o canal npm. Sem ele, `import { X } from "@snksergio/design-system"` estoura
      "not exported" no consumidor. Reprovado por gate (`barrel-completeness`, no `npm test`)
- [ ] Toda dependência nova que o componente importa de fato declarada no `package.json` —
      **inclusive dep de TIPO**: se um `.d.ts` publicado faz `import … from "geojson"`, o
      `@types/geojson` vai em `dependencies`, não em `devDependencies` (senão o `tsc` do
      consumidor quebra). Reprovado por gate (`deps-declared`)

**As 3 restantes NÃO vão na sua PR:** registry, catálogo do CLI e changelog são
consolidados na release (`/ds-release`), não por PR de componente. Se o CI
apontar débito de distribuição, isso **não bloqueia** — só anote no corpo da PR
o que ficou pendente de registrar.

> **Por que esta lista mudou de 7 para 8 em 2026-08-08.** O barrel era a única superfície sem
> vigilância nenhuma, e por isso `Chart`, `DataList`, `List` e `Toast` passaram meses com 6 de
> 7 fechadas — a doc anunciando "os 42 componentes ui/" enquanto `import { ChartContainer }`
> estourava no consumidor npm. Este arquivo ficou uma revisão atrás e continuou dizendo 7 até
> 2026-08-15: quem o seguisse entregava o componente **sem o export**, o gate pegava, e a
> pessoa fazia duas viagens — exatamente o que a primeira frase deste documento promete evitar.

O checklist completo aparece preenchido quando você abre a PR.

---

## Onde procurar cada coisa

| Preciso de… | Está em |
|---|---|
| As regras do DS, resumidas | [`.claude/rules/ds-standards.md`](.claude/rules/ds-standards.md) |
| Lista de tokens por tipo | [`.ai/context/tokens/`](.ai/context/tokens/) |
| Como usar um componente | o `USAGE.md` ao lado dele |
| Erros já cometidos aqui (e a lição) | [`.ai/status/lessons.md`](.ai/status/lessons.md) |
| Como o pipeline funciona hoje | [`.ai/context/architecture.md`](.ai/context/architecture.md) |
| Histórico e filosofia do pipeline | [`README-PIPELINE-WORKFLOW.md`](README-PIPELINE-WORKFLOW.md) — ⚠️ **snapshot congelado**: as contagens (componentes, lições, regras) estão desatualizadas de propósito e o próprio arquivo pede pra não ser carregado por IA. Bom pra entender o *porquê*; não use nenhum número dali |
| Setup local | [`README.md`](README.md) |

Vale um olhar no `lessons.md` antes de discutir uma decisão de design: boa parte
das perguntas "por que é assim?" já tem resposta registrada, com o motivo.

---

## Publicação

Release, `npm publish` e bump de versão **não** saem de PR de feature — são
passo separado do mantenedor. Não rode nem peça pra IA rodar.
