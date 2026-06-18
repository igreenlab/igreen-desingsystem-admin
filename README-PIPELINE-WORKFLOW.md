# Multi-Agent Design System Pipeline
## Referência completa de arquitetura, agentes, memória, aprendizado e workflow

> ⚠️ **SNAPSHOT HISTÓRICO (era v0.x).** Contagens (lições, componentes) podem estar congeladas. Fontes vivas: lições atuais em `.ai/status/lessons.md` (L-001..L-037); regras em `.claude/rules/ds-standards.md` (os antigos `ds-lessons.md`/`ds-forbidden.md` foram consolidados nele); distribuição em `DISTRIBUICAO.md`.

> ⚠️ **Este arquivo é referência HUMANA** (~91KB). Para sessões com agentes da IA, **não carregar**.
> Use os arquivos curtos (≤ 4KB) carregados sob demanda:
> - `.claude/rules/ds-standards.md` — regras essenciais (auto-load)
> - `.claude/rules/ds-lessons.md` — 14 lições resumidas
> - `.claude/rules/ds-forbidden.md` — anti-patterns
> - `.claude/agents/<nome>.md` — identidade dos 6 agents
> - `.claude/skills/<agent>/<skill>.md` — sub-skills modulares
> - `.ai/context/<topic>.md` — context maps (architecture, orchestrator-routes, igreen-templates, etc)
>
> Este README continua sendo a **fonte humana** para entender filosofia, abstração, decisões e history.

---

> **Para quem é este documento**
> Para qualquer pessoa — humano ou IA — que precise entender completamente,
> operar com precisão ou adaptar este sistema para outro projeto.
> Leia do início ao fim uma vez. Depois use como referência por seção.
>
> **Projeto de referência:** `igreen-ds` — Design System de produção iGreen.
> **Ferramenta:** Claude Code (Anthropic) — CLI agente local, versão 2025/2026.
> **Estado:** 21 componentes em produção · 14 lições registradas · pipeline ativo.

---

## Índice

1. [O problema que este sistema resolve](#1-o-problema-que-este-sistema-resolve)
2. [Filosofia e princípios de design](#2-filosofia-e-princípios-de-design)
3. [Visão geral da arquitetura](#3-visão-geral-da-arquitetura)
4. [O sistema de memória — quatro camadas](#4-o-sistema-de-memória--quatro-camadas)
5. [O ciclo de auto-aprendizado — como o sistema fica mais inteligente](#5-o-ciclo-de-auto-aprendizado--como-o-sistema-fica-mais-inteligente)
6. [Estrutura de arquivos completa e anotada](#6-estrutura-de-arquivos-completa-e-anotada)
7. [Os agentes — identidade, responsabilidade e modo operante](#7-os-agentes--identidade-responsabilidade-e-modo-operante)
8. [O sistema de skills — contexto mínimo por tarefa](#8-o-sistema-de-skills--contexto-mínimo-por-tarefa)
9. [O pipeline completo — todos os fluxos](#9-o-pipeline-completo--todos-os-fluxos)
10. [O Gate de aprovação — decisões de design requerem humano](#10-o-gate-de-aprovação--decisões-de-design-requerem-humano)
11. [O campo Assumption — tornando decisões reversíveis](#11-o-campo-assumption--tornando-decisões-reversíveis)
12. [Protocolo de Cascata — dependência ausente](#12-protocolo-de-cascata--dependência-ausente)
13. [O audit log — pipeline-state.md em profundidade](#13-o-audit-log--pipeline-statemd-em-profundidade)
14. [O loop de lições — lessons.md em profundidade](#14-o-loop-de-lições--lessonsmd-em-profundidade)
15. [Ciclo de sessão — abertura, execução e encerramento](#15-ciclo-de-sessão--abertura-execução-e-encerramento)
16. [Commands — slash commands disponíveis](#16-commands--slash-commands-disponíveis)
17. [Contexto de referência — .ai/context/ em profundidade](#17-contexto-de-referência--aicontext-em-profundidade)
18. [Domínio App — estrutura pendente e protocolo de ativação](#18-domínio-app--estrutura-pendente-e-protocolo-de-ativação)
19. [Arquitetura de tokens do DS](#19-arquitetura-de-tokens-do-ds)
20. [Como adaptar para outro projeto](#20-como-adaptar-para-outro-projeto)

---

## 1. O problema que este sistema resolve

### Por que um agente genérico não funciona para um DS de produção

Um Design System é diferente de um projeto de código comum. Ele tem três características
que criam problemas específicos com agentes de IA não estruturados:

**Acúmulo de decisões interdependentes.** Cada token criado vai ser usado em dezenas de
componentes. Cada componente vai ser usado em centenas de telas. Uma decisão errada no
início — um valor de spacing incorreto, um token de cor mal nomeado — se propaga
silenciosamente por todo o sistema. Sem registro e rastreamento, você não descobre o
problema até ele aparecer em produção.

**Erros de padrão que se repetem.** Agentes de IA sem memória estruturada cometem os
mesmos erros em sessões diferentes. Sem um mecanismo de aprendizado explícito, cada
sessão começa do zero — incluindo os erros já identificados e corrigidos antes.

**Contexto inflado.** Um DS maduro tem dezenas de arquivos de tokens, centenas de
componentes, guias de uso, mapeamentos. Carregar tudo isso em cada sessão gasta tokens,
aumenta a latência e reduz a precisão das respostas.

### O que este sistema entrega em contraste

| Problema crônico | Solução implementada |
|-----------------|---------------------|
| Contexto inflado | Skills segregadas — agente carrega ~30% do projeto por tarefa |
| Decisões sem rastreamento | Campo Assumption no audit log — toda decisão é reversível |
| Erros repetidos | lessons.md — cada erro identificado vira regra permanente |
| Implementação sem validação | Gate obrigatório — humano aprova antes de qualquer código |
| Token criado inline sem processo | Protocolo de Cascata — pausa formal e pipeline completo |
| Sessão sem continuidade | 4 camadas de memória — sistema sabe o que aconteceu antes |
| Agente genérico fazendo tudo | Especialização por agente — escopo exato, responsabilidade única |

---

## 2. Filosofia e princípios de design

### Princípio 1 — Separação absoluta de responsabilidades

**Quem especifica nunca implementa. Quem implementa nunca define design. Quem revisa
nunca aprova sem evidência.**

Esta não é uma preferência estética — é a regra estrutural que previne a maior categoria
de erros em sistemas com IA: o agente que "ajuda um pouco além do escopo" e cria tokens
sem especificação, implementa com valores hardcoded ou aprova sem verificar o grep.

Cada agente tem uma fronteira explícita. O Orchestrator garante que essas fronteiras
não são cruzadas.

### Princípio 2 — Contexto mínimo, não contexto zero

O agente carrega apenas o que precisa para a tarefa atual. Não existe uma regra de
"carregar nada" — existe a regra de "carregar apenas o relevante". O SKILL.md router
de cada agente define com precisão qual sub-arquivo carregar por tipo de tarefa.

Isso tem dois efeitos práticos: (1) o agente pensa melhor quando o contexto é denso
no que importa, não diluído em informações irrelevantes; (2) o custo de tokens por
tarefa cai significativamente.

### Princípio 3 — Toda decisão de design requer aprovação humana

Tokens e componentes são decisões com vida longa. Um token criado hoje vai existir por
meses ou anos. O Gate não é burocracia — é o momento em que o humano verifica se a
decisão está correta antes que ela seja codificada e propagada pelo sistema.

### Princípio 4 — Erros são ativos do sistema

Quando o DS Reviewer encontra um padrão de erro que não estava nas regras, ele não
apenas corrige — ele registra em `lessons.md`. Na próxima sessão, o `ds-standards.md`
já carrega com a nova regra. O sistema fica mais inteligente a cada iteração sem
intervenção manual.

### Princípio 5 — Rastreabilidade sobre conveniência

É mais conveniente criar um token inline durante uma implementação. É mais conveniente
pular o Gate para uma decisão "óbvia". É mais conveniente não registrar no
`pipeline-state.md` uma tarefa simples.

Este sistema escolhe rastreabilidade sobre conveniência em todos esses casos. O custo
imediato é um processo um pouco mais lento. O benefício é que seis meses depois você
sabe exatamente por que cada decisão foi tomada e pode revertê-la com segurança.

---

## 3. Visão geral da arquitetura

### Os dois domínios

O sistema é dividido em dois domínios com pipelines independentes:

**Domínio DS (Design System)** — Operacional.
Cria e mantém tokens e componentes. Pipeline completo com 4 agentes.

**Domínio App** — Estruturado, pendente.
Implementa telas usando o DS como ferramenta. Aguarda primeira tela real para ativar.

### O fluxo de alto nível

```
Usuário faz uma solicitação
          ↓
    Orchestrator
    (classifica, verifica idempotência, delega)
          ↓
    ┌─────────────────────────────────────────┐
    │           Domínio DS                    │
    │                                         │
    │  DS Designer → GATE → DS Dev → Reviewer │
    │         ↑_____________↑                 │
    │         (Cascata se token ausente)       │
    └─────────────────────────────────────────┘
          ↓
    pipeline-state.md atualizado
          ↓
    Se erro novo → lessons.md atualizado
          ↓
    ds-standards.md atualizado (próxima sessão)
```

### Os quatro mecanismos centrais

**Gate** — Pausa obrigatória entre especificação e implementação. Aprovação humana
para toda decisão de design nova.

**Assumption** — Campo obrigatório em todo registro do audit log. "O que precisa ser
verdade para esta decisão estar certa." Torna decisões reversíveis no futuro.

**Cascata** — Protocolo para quando uma dependência está ausente durante implementação.
Pausa o trabalho atual, abre pipeline completo para criar a dependência, retoma.

**Lessons loop** — Erros identificados pelo Reviewer viram regras permanentes que
são carregadas automaticamente na próxima sessão.

---

## 4. O sistema de memória — quatro camadas

Este é um dos aspectos mais mal compreendidos do sistema. Não existe "uma memória" —
existem quatro mecanismos distintos que funcionam em conjunto.

### Camada 1 — Memória de regras (automática, toda sessão)

**Arquivo:** `.claude/rules/ds-standards.md`

O Claude Code carrega automaticamente todo arquivo dentro de `.claude/rules/` ao
iniciar qualquer sessão. Isso significa que `ds-standards.md` é lido pelo agente
antes de qualquer instrução do usuário.

**O que contém:** Resumo executivo de todas as regras de comportamento, mapa de
skills por agente, proibições absolutas de código, requisitos obrigatórios e resumo
das 14 lições registradas.

**Característica:** É a única camada que o agente não precisa solicitar. Ela simplesmente
está lá no início de toda sessão. É a "memória imutável" do sistema — o conjunto de
regras que sempre se aplicam independente do contexto.

**Atualização:** Quando uma nova lição é adicionada em `lessons.md`, o resumo em
`ds-standards.md` é atualizado pelo DS Reviewer para incluir a nova regra. Isso
fecha o ciclo de aprendizado.

```
Toda sessão → Claude Code carrega .claude/rules/*.md automaticamente
                                          ↓
                               Agente já sabe as 14 lições
                               sem precisar abrir lessons.md
```

### Camada 2 — Memória de agente (persistente entre sessões)

**Mecanismo:** campo `memory: user` no frontmatter dos agentes.

```yaml
---
name: ds-designer
model: claude-sonnet-4-6
memory: user     ← ativa memória persistente
---
```

Quando este campo está presente, o Claude Code cria e mantém um diretório de memória
privado para o agente. O agente pode escrever neste diretório durante uma sessão e
ler o que escreveu em sessões futuras.

**O que os agentes acumulam aqui:** padrões de codebase que descobriram, comportamentos
específicos do projeto que observaram, contextos recorrentes. É uma memória implícita
e orgânica — o agente a constrói naturalmente conforme trabalha.

**Diferença das outras camadas:** Esta memória é do agente, não do projeto. Se você
deletar e recriar o agente, a memória vai junto. As outras camadas vivem nos arquivos
do projeto e são versionadas pelo git.

### Camada 3 — Memória de decisões (explícita, append-only)

**Arquivo:** `.ai/status/pipeline-state.md`

Todo handoff, toda aprovação, todo token criado, todo componente aprovado gera uma
entrada neste arquivo. Cada entrada tem campos estruturados incluindo o campo
`Assumption` — o que precisava ser verdade para a decisão estar correta.

**Por que append-only:** Um log editável não é um log — é um rascunho. O
`pipeline-state.md` sendo somente de adição garante que nenhum agente pode reescrever
a história. Rollbacks e correções são novos registros, não edições de registros antigos.

**Como usar no debugging:** Quando algo parece errado no sistema, o processo é:
1. Localizar a decisão relevante no `pipeline-state.md` por data ou nome
2. Ler o campo `Assumption` daquela entrada
3. Verificar: essa assumption ainda é verdadeira?
4. Se não → você sabe exatamente o que revisar, sem reconstruir o raciocínio do zero

**O que está registrado hoje:**
- Setup inicial do pipeline (Abril 2026)
- 21 componentes aprovados com suas Assumptions
- 8 decisões arquiteturais com suas Assumptions (prefixos, clamp(), bg-white nos thumbs)

### Camada 4 — Memória de erros (aprendizado estruturado)

**Arquivo:** `.ai/status/lessons.md`

Esta é a camada de aprendizado explícito. Cada vez que o DS Reviewer identifica um
padrão de erro que não estava coberto pelas regras existentes, ele registra em
`lessons.md` no formato `L-NNN`.

**Formato de uma lição:**
```markdown
## [L-NNN] Título curto
**Erro cometido:** o que o agente fez de errado
**Regra derivada:** o que fazer corretamente
**Contexto:** onde se aplica
```

**O loop completo:** A lição é registrada em `lessons.md` → o resumo é atualizado em
`ds-standards.md` → na próxima sessão, `ds-standards.md` é carregado automaticamente
→ o agente já começa com a nova regra → o erro não se repete.

**Estado atual:** 14 lições registradas (L-001 a L-014), cobrindo focus rings, classes
Tailwind literais, dark mode, comportamento Radix e exceções de hardcode.

### Como as quatro camadas trabalham juntas

```
Sessão começa
    ↓
Camada 1 (rules/) carrega automaticamente
→ Agente sabe as regras e lições resumidas

    ↓
Camada 2 (memory: user) está disponível
→ Agente pode acessar conhecimento acumulado de sessões anteriores

    ↓
Agente lê pipeline-state.md (Camada 3)
→ Agente sabe o que foi decidido antes e o que está pendente

    ↓
Tarefa executada → erro identificado pelo Reviewer
    ↓
Camada 4 (lessons.md) atualizada
→ Camada 1 (ds-standards.md) atualizada
→ Próxima sessão começa já com a nova regra
```

---

## 5. O ciclo de auto-aprendizado — como o sistema fica mais inteligente

Este é o mecanismo mais sofisticado do sistema. Não requer intervenção manual — o
próprio processo de revisão alimenta o aprendizado.

### O ciclo completo passo a passo

```
1. DS Dev implementa um componente
            ↓
2. DS Reviewer executa grep de regressões
   → Encontra: 'ring-ring-primary/30' no arquivo.styles.ts
            ↓
3. DS Reviewer verifica: isso está coberto pelas lições L-001 a L-014?
   → Sim (L-001 cobre ring com modificador) → REPROVADO normal
   → Não → continuar para passo 4
            ↓
4. DS Reviewer identifica o padrão do erro:
   "Agente usou text-xs font-semibold em vez de preset text-label-xs"
   → Esse padrão não está em nenhuma lição existente
            ↓
5. DS Reviewer:
   a) Reprova o componente com o erro listado
   b) Adiciona em lessons.md:
      ## [L-007] text-xs font-semibold em vez de preset tipográfico
      Erro cometido: usar text-xs font-semibold, text-sm font-medium
      Regra derivada: text-xs font-semibold → text-label-xs
      Contexto: badge, tab, qualquer componente com texto de UI
   c) Atualiza o resumo em ds-standards.md:
      - **L-007** `text-xs font-semibold` → `text-label-xs`
            ↓
6. DS Dev corrige o componente
            ↓
7. Na PRÓXIMA sessão:
   → ds-standards.md é carregado automaticamente
   → Agente já vê a regra L-007 antes de escrever qualquer código
   → Erro não se repete
```

### Por que o sistema é mais confiável do que apenas "boas instruções"

Instruções estáticas degradam. Você escreve "nunca use text-xs font-semibold" no
CLAUDE.md e dois meses depois alguém modifica o arquivo e remove essa linha por
parecer desnecessária.

O sistema de lições é diferente: cada regra tem origem rastreável (qual erro gerou),
está numerada (L-007 é sempre L-007), e o DS Reviewer é treinado para verificar
explicitamente se um erro novo deve virar lição. As regras crescem organicamente a
partir de erros reais, não de suposições do que pode dar errado.

### As 14 lições registradas — em profundidade

**L-001 — Ring com modificador de opacidade**
O que aconteceu: agente usou `ring-ring-primary/30` assumindo que precisava de um
ring semitransparente. O problema: tokens `ring-ring-*` já têm alpha de 20% embutido
via OKLCH. Usar `/30` resulta em um ring com opacidade aplicada duas vezes.
Regra: nunca usar `/N` com tokens de ring.

**L-002 — Tailwind literal em vez de token DS**
O que aconteceu: agente usou `gap-4`, `rounded-lg`, `shadow-md` e `p-4` — classes
nativas do Tailwind que têm equivalentes DS com semântica correta. O problema vai
além da convenção: os tokens DS têm valores específicos do iGreen (gap.md = 8px,
não 16px como gap-4 do Tailwind). Usar Tailwind literal quebra a consistência visual.
Regra completa de mapeamento registrada em `ds-standards.md`.

**L-003 — ring-3 não existe**
O que aconteceu: agente usou `ring-3` como valor intermediário entre ring-2 e ring-4.
O Tailwind não tem ring-3. A classe simplesmente não aplica nada.
Regra: valores válidos são ring-0, ring-1, ring-2, ring-4, ring-8. Usar ring-4 para
focus rings DS.

**L-004 — outline-none sem focus-visible**
O que aconteceu: agente colocou `outline-none` na base do componente para remover o
outline padrão do browser. O problema: `outline-none` sem prefixo remove o outline
para TODOS os tipos de foco, incluindo foco por teclado — violação de acessibilidade.
Regra: sempre `focus-visible:outline-none` — remove apenas para foco por mouse/toque.

**L-005 — bg-input/50 de variável Shadcn**
O que aconteceu: ao adaptar componente Shadcn, agente manteve `bg-input/50` — uma
variável CSS do sistema Shadcn com opacidade. O problema: no iGreen DS, o sistema de
variáveis é diferente. `bg-input` não existe como token DS.
Regra: substituir por `bg-bg-surface` — token DS equivalente.

**L-006 — disabled antes dos compoundVariants de cor**
O que aconteceu: agente colocou o compound `{ disabled: true }` antes dos compostos
de cor no array `compoundVariants`. O problema: compostos são aplicados em ordem.
Se disabled vem antes de primary+filled, o estado disabled pode ser sobrescrito pelos
compostos de cor que vêm depois.
Regra: `{ disabled: true }` SEMPRE por último no array.

**L-007 — text-xs font-semibold em vez de preset tipográfico**
O que aconteceu: agente usou combinações avulsas `text-xs font-semibold` para texto
de label. O problema: o DS tem presets tipográficos compostos (`text-caption-sm font-semibold`,
`text-body-sm font-semibold`) que encapsulam tamanho, peso, line-height e letter-spacing corretos.
Usar classes avulsas gera inconsistência tipográfica.
Regra: sempre usar presets para texto de UI.

> **Nota histórica:** o typography rewrite 2026-05-19 consolidou 32→23 presets em 6 roles
> (display/heading/title/body/caption/code). Os presets antigos `label-*`, `paragraph-*` e
> `subheading-*` foram removidos. Substituições canônicas: `label-sm` → `body-sm font-semibold`,
> `label-xs` → `caption-sm font-semibold`, `paragraph-sm` → `body-sm`. Exemplos didáticos
> em outras seções deste documento podem ainda mencionar os nomes antigos — são snapshots
> históricos do processo, não recomendações atuais. Ver L-019 em lessons.md.

**L-008 — Dark mode bg hierarchy invertida**
O que aconteceu: ao criar tokens de background para dark mode, agente definiu
`bg.subtle` mais escuro que `bg.canvas`. O problema: a hierarquia visual do dark mode
precisa ser monotonicamente crescente em luminosidade para que a distinção entre
superfícies seja perceptível. Invertida, cards "desaparecem" no fundo.
Regra: canvas (8%) < surface (18%) < subtle (24%) < muted (32%) < moderate (40%).

**L-009 — Border invisível no dark**
O que aconteceu: `border-subtle` definido com o mesmo valor OKLCH que `bg-surface`.
O problema: uma borda com luminosidade idêntica à superfície sobre a qual está é
invisível. Especialmente problemático no dark mode onde os valores tendem a convergir.
Regra: bordas devem ter mínimo 6% de diferença de luminosidade sobre a superfície.

**L-010 — vars --input e --border Shadcn no dark**
O que aconteceu: no `.dark {}` do `globals.css`, as variáveis `--border` e `--input`
apontavam para os mesmos tokens do light mode. O problema: Shadcn usa essas variáveis
internamente em vários componentes. No dark mode, os componentes Shadcn ficavam com
valores de light, criando inconsistência visual.
Regra: no `.dark {}`, `--border` → `--color-bg-subtle` (24%) e
`--input` → `--color-bg-moderate` (32%).

**L-011 — Shadows e rings fracos no dark**
O que aconteceu: agente usou as mesmas opacidades de shadow e ring no dark e no light.
O problema: em dark mode, o contraste entre superfícies é menor, então shadows e rings
precisam ser mais fortes para ter a mesma percepção visual.
Regra: shadows dark ≥ 2× opacidade do light; rings dark ≥ 1.5× alpha do light.

**L-012 — Radix data-state vs :checked**
O que aconteceu: agente usou `has-[:checked]` para detectar estado de componente Radix.
O problema: componentes Radix não usam o atributo HTML nativo `:checked` — eles usam
`data-state="checked"` como atributo customizado.
Regra: `has-[[data-state=checked]]` com colchetes duplos (sintaxe Tailwind para
atributos customizados).

**L-013 — Slider com um único thumb hardcoded**
O que aconteceu: agente renderizou um único `<SliderPrimitive.Thumb>` hardcoded. O
problema: o componente Slider suporta range com dois valores (min e max selecionável).
Com um único thumb, o Slider range não funciona.
Regra: render dinâmico baseado no número de valores:
`Array.from({ length: values.length }, (_, i) => <Thumb key={i} />)`

**L-014 — bg-white fixo é OK para thumbs**
O que aconteceu: agente usou `bg-bg-surface-inverted` para o thumb do Switch e Slider,
assumindo que um token DS era a escolha correta. O problema: `bg-bg-surface-inverted`
é "branco sobre fundo escuro" no light mode, mas em dark mode esse token se inverte e
o thumb fica escuro sobre um track escuro — invisível.
Regra: `bg-white` é a exceção válida para thumbs. Hardcode justificado aqui porque
o thumb precisa ser sempre branco independente do modo.

---

## 6. Estrutura de arquivos completa e anotada

```
igreen-ds/
│
├── CLAUDE.md
│   PAPEL: Ponto de entrada de qualquer sessão. Lido por todo agente antes de
│   qualquer tarefa. Contém: 2 checklists (abertura/encerramento), 6 regras de
│   comportamento absolutas, arquitetura de tokens em 3 tiers, tabela completa
│   de tarefas → arquivo → skill, e regras críticas de código.
│   TAMANHO: ~5KB. Deliberadamente compacto — detalhe fica em arquivos de contexto.
│
├── CLAUDE.local.md
│   PAPEL: Overrides pessoais do desenvolvedor. Preferências de modelo, ports locais,
│   anotações de sessão em andamento. Gitignored — não vai para o repositório.
│
├── .ai/
│   │
│   ├── context/
│   │   PAPEL: Referências técnicas carregadas SOB DEMANDA. Nenhum desses arquivos é
│   │   carregado no startup. O agente carrega apenas o relevante à tarefa atual.
│   │   Separado em subpastas por tipo de conteúdo para facilitar descoberta.
│   │
│   │   ├── tokens/
│   │   │   PAPEL: Documentação de cada categoria de token do DS. Cada arquivo descreve
│   │   │   a arquitetura, os valores existentes, as regras de criação e os exemplos
│   │   │   de uso correto. O DS Designer lê o arquivo relevante antes de especificar.
│   │   │
│   │   │   ├── color.md
│   │   │   │   Conteúdo: arquitetura primitivo→semântico, roles (bg/fg/border/ring/overlay),
│   │   │   │   sufixos (*-inverted vs on-*), variantes obrigatórias por cor de status,
│   │   │   │   fluxo de criação, nomes proibidos.
│   │   │   │
│   │   │   ├── spacing.md
│   │   │   │   Conteúdo: três grupos semânticos (gap/space/pad), escala base 4px×n,
│   │   │   │   tabela completa de valores, tokens de componente (padCard/padPage),
│   │   │   │   guia de escolha do grupo correto por situação.
│   │   │   │
│   │   │   ├── sizing-shape-elevation.md
│   │   │   │   Conteúdo: form heights (3xs a xl), icon sizes, container widths,
│   │   │   │   radius (xs a full), shadow (sm a xl), z-index semântico.
│   │   │   │
│   │   │   ├── typography.md
│   │   │   │   Conteúdo: presets compostos (label/paragraph/heading/title/display),
│   │   │   │   escala de tipo, regra do clamp() (≥32px apenas), nunca px.
│   │   │   │
│   │   │   └── motion.md
│   │   │       Conteúdo: tokens de duração, easing, transições por tipo de componente.
│   │   │
│   │   ├── components/
│   │   │   PAPEL: Inventário e guias de implementação de componentes.
│   │   │
│   │   │   ├── inventory.md
│   │   │   │   CRÍTICO: Lista de TODOS os componentes existentes com status, pasta,
│   │   │   │   subcomponentes exportados e API (variantes, tamanhos, estados).
│   │   │   │   Deve ser verificado ANTES de criar qualquer componente novo.
│   │   │   │   Estado atual: 21 componentes (Button iGreen + 20 Shadcn).
│   │   │   │
│   │   │   ├── guide.md
│   │   │   │   Conteúdo: padrão tv() completo com template .styles.ts e .tsx,
│   │   │   │   estrutura obrigatória de 5 arquivos, regras invioláveis, prefixos
│   │   │   │   de classe obrigatórios, como o .tsx consome o .styles.ts.
│   │   │   │
│   │   │   └── shadcn-token-map.md
│   │   │       Conteúdo: mapeamento de variáveis CSS nativas do Shadcn para tokens DS.
│   │   │       Ex: --background → bg-bg-canvas, --border → border-border-main.
│   │   │
│   │   ├── architecture.md
│   │   │   PAPEL: Stack técnica, decisões arquiteturais do projeto, estrutura de pastas
│   │   │   do src/, relação entre DS e App.
│   │   │
│   │   ├── shared-app-context.md
│   │   │   PAPEL: Layout base do app desktop, convenções de rota, padrões de tela
│   │   │   recorrentes, regras para App Dev React. Status: provisório, a ser preenchido
│   │   │   após primeira tela real.
│   │   │
│   │   └── doc-guide.md
│   │       PAPEL: Como escrever o USAGE.md obrigatório de cada componente. Estrutura,
│   │       exemplos, o que incluir e o que omitir.
│   │
│   ├── rules/
│   │   PAPEL: Regras detalhadas de codificação. Diferente de .claude/rules/ (que é
│   │   auto-carregado), esta pasta contém referência completa para quando o resumo
│   │   em ds-standards.md não for suficiente.
│   │
│   │   └── coding-standards.md
│   │       Conteúdo: padrão tv() completo com todos os compoundVariants, padrão ring
│   │       animado para inputs, tabela completa de classes DS vs Tailwind literal
│   │       (spacing, heights, radius, shadow), naming conventions, estrutura de arquivo.
│   │
│   └── status/
│       PAPEL: Estado ativo e histórico do sistema. Três arquivos com propósitos
│       complementares — juntos formam a memória declarativa do sistema.
│
│       ├── pipeline-state.md
│       │   PAPEL: Audit log append-only. Todo handoff, toda aprovação, toda reprovação,
│       │   toda Cascata é registrada aqui. Campos obrigatórios por entrada incluem
│       │   sempre o campo Assumption. Ver seção 13 para detalhamento completo.
│       │
│       ├── lessons.md
│       │   PAPEL: Loop de auto-aprendizado. 14 lições registradas. Cada erro identificado
│       │   pelo Reviewer que não estava coberto pelas regras existentes vira uma lição
│       │   numerada. Ver seção 14 para detalhamento completo e todas as lições.
│       │
│       ├── BACKLOG.md
│       │   PAPEL: Roadmap do projeto em 4 categorias: implementado, próxima sessão
│       │   (alta prioridade), aguardando condição (domínio App), descartado com motivo.
│       │
│       └── archive/ (a ser criado quando necessário)
│           PAPEL: Entradas antigas do pipeline-state.md arquivadas quando o arquivo
│           principal crescer além de ~100 entradas ou ~50KB.
│
├── .claude/
│   PAPEL: Pasta reconhecida pelo Claude Code como configuração do projeto. Conteúdo
│   desta pasta é tratado com comportamento especial pela ferramenta.
│
│   ├── settings.json
│   │   PAPEL: Permissões de ferramentas e MCPs. Define quais comandos bash são
│   │   permitidos, quais ferramentas MCP podem ser usadas, quais domínios podem
│   │   ser acessados. Evita que agentes executem operações não autorizadas.
│   │
│   ├── rules/
│   │   PAPEL: Todo arquivo .md dentro desta pasta é carregado automaticamente pelo
│   │   Claude Code no início de TODA sessão, antes de qualquer instrução do usuário.
│   │   É o mecanismo de memória de regras (Camada 1).
│   │
│   │   └── ds-standards.md
│   │       Conteúdo: 6 regras de comportamento, mecanismos do pipeline (Gate,
│   │       critique genuína, Assumption), tabela de skills por agente, tabela de
│   │       contexto de referência, código proibido, código obrigatório, dark mode,
│   │       exceções de hardcode, comportamento Radix, resumo das 14 lições.
│   │       Tamanho: ~4KB. Deliberadamente denso — é o único arquivo que sempre
│   │       está no contexto.
│   │
│   ├── agents/
│   │   PAPEL: Definições de agentes reconhecidas pelo Claude Code. DEVE ser flat
│   │   (sem subpastas) — o Claude Code descobre agentes apenas em agents/*.md direto.
│   │   Cada arquivo define um agente com frontmatter YAML e corpo markdown.
│   │
│   │   ├── orchestrator.md     ← Ver seção 7 para detalhamento completo
│   │   ├── ds-designer.md      ← Ver seção 7
│   │   ├── ds-dev.md           ← Ver seção 7
│   │   ├── ds-reviewer.md      ← Ver seção 7
│   │   ├── app-designer.md     ← 🚧 Pendente
│   │   └── app-dev-react.md    ← 🚧 Pendente
│   │
│   ├── commands/
│   │   PAPEL: Slash commands invocáveis com /nome-do-arquivo no Claude Code.
│   │   Cada arquivo é um entry point fino — define verificações obrigatórias e
│   │   delega para a skill relevante. Prefixo ds- indica domínio DS.
│   │
│   │   ├── ds-add-token.md         ← /ds-add-token
│   │   ├── ds-create-component.md  ← /ds-create-component
│   │   ├── ds-add-shadcn.md        ← /ds-add-shadcn
│   │   ├── ds-create-composite.md  ← /ds-create-composite
│   │   ├── ds-extract-figma.md     ← /ds-extract-figma
│   │   ├── ds-update.md            ← /ds-update [tag]
│   │   ├── ds-release.md           ← /ds-release [tag]
│   │   └── ds-create-crud.md       ← /ds-create-crud [hint]
│   │
│   ├── skills/
│   │   PAPEL: Lógica técnica segregada por agente e por sub-tarefa. O mecanismo
│   │   central de "contexto mínimo por tarefa". Cada agente tem sua pasta com um
│   │   SKILL.md router e sub-arquivos especializados.
│   │
│   │   ├── ds-designer/        ← Ver seção 8 para detalhamento de skills
│   │   ├── ds-dev/             ← Ver seção 8
│   │   ├── ds-reviewer/        ← Ver seção 8
│   │   ├── app-designer/       ← 🚧 Pendente
│   │   ├── app-dev-react/      ← 🚧 Pendente
│   │   ├── frontend-design/    ← Skill de interface iGreen (CRM/admin)
│   │   ├── crud-builder/       ← Construtor de telas CRUD/tabela (/ds-create-crud)
│   │   ├── igreen-page/        ← 🚧 Pendente — padrões de página
│   │   └── _deprecated/        ← Skills substituídas. NÃO CARREGAR.
│   │       ├── igreen-component/    (substituída por ds-dev/impl-igreen.md)
│   │       ├── igreen-token/        (substituída por ds-designer/spec-token-*.md)
│   │       └── igreen-reviewer-guard/  (substituída por ds-reviewer/SKILL.md)
│   │
│   └── scripts/
│       └── sync-agents-to-cursor.js
│           PAPEL: Sincroniza .claude/agents/*.md → .cursor/rules/_agent-*.mdc.
│           Mantém mirrors dos agentes para uso no Cursor IDE.
│           Uso: npm run sync:agents (rodar após modificar qualquer agente).
```

---

## 7. Os agentes — identidade, responsabilidade e modo operante

### Como agentes funcionam no Claude Code

Cada agente é um arquivo `.md` em `.claude/agents/` com frontmatter YAML seguido de
corpo markdown. O Claude Code descobre e disponibiliza esses agentes automaticamente.

Quando um agente é ativado, ele recebe sua própria janela de contexto isolada —
não herda o histórico do agente pai ou da sessão principal. Ele recebe apenas:
- O conteúdo do seu próprio arquivo de definição
- Os arquivos em `.claude/rules/` (carregados automaticamente)
- O que o agente pai passar explicitamente

**Anatomia de um arquivo de agente:**
```yaml
---
name: ds-designer          ← identificador único, usado em descrições de handoff
description: >             ← usado pelo Orchestrator para decidir delegação
  Especifica tokens e componentes...
  NÃO implementa código — só especifica.
model: claude-sonnet-4-6   ← modelo base do agente
memory: user               ← ativa memória persistente entre sessões
---

# DS Designer — iGreen DS    ← corpo: instruções operacionais do agente
...
```

---

### Orchestrator

**Arquivo:** `.claude/agents/orchestrator.md`
**Modelo:** claude-sonnet-4-6
**Papel no sistema:** Porteiro e controlador de tráfego. Todo fluxo passa por aqui.

**Identidade operacional:** Classifica e delega. Nunca executa diretamente. Se o
Orchestrator começar a escrever código ou fazer especificações de design, algo está
errado — isso é um sinal de que ele não delegou corretamente.

**O que faz ao receber uma tarefa:**

1. Lê CLAUDE.md + ds-standards.md + pipeline-state.md
2. Verifica idempotência: "Esta tarefa já foi concluída antes?"
   - Sim (status CONCLUÍDO/APROVADO no log) → informa o usuário, pergunta se quer refazer
   - Não → continua
3. Verifica se há PAUSADO ou CASCATA aberta → priorizar retomada
4. Classifica o domínio (DS ou App)
5. Classifica o tipo de tarefa dentro do domínio
6. Delega para o agente correto
7. Registra a delegação no pipeline-state.md

**Tabela de roteamento completa:**

| Tipo de tarefa | Command | Agente | Fluxo |
|---------------|---------|--------|-------|
| Nova cor semântica | `/ds-add-token` | ds-designer | → GATE → ds-dev → ds-reviewer |
| Novo spacing/gap/pad | `/ds-add-token` | ds-designer | → GATE → ds-dev → ds-reviewer |
| Novo sizing/height/icon | `/ds-add-token` | ds-designer | → GATE → ds-dev → ds-reviewer |
| Nova shadow/radius | `/ds-add-token` | ds-designer | → GATE → ds-dev → ds-reviewer |
| Novo preset tipográfico | `/ds-add-token` | ds-designer | → GATE → ds-dev → ds-reviewer |
| Novo componente iGreen | `/ds-create-component` | ds-designer | → GATE → ds-dev → ds-reviewer |
| Componente Shadcn | `/ds-add-shadcn` | ds-dev | → ds-reviewer |
| Componente composto | `/ds-create-composite` | ds-dev | → ds-reviewer |
| Editar visual de existente | — | ds-dev | → ds-reviewer |
| Extração do Figma | `/ds-extract-figma` | ds-designer | → GATE → ds-dev |
| Tela CRUD/tabela (DataTable) | `/ds-create-crud` | crud-builder | entrevista → GATE blueprint → geração |
| Adapter / transform | — | ds-dev | (sem reviewer para tarefas técnicas simples) |
| Tarefa de App | — | — | ⛔ Domínio não operacional — informar usuário |

**Gerenciamento do Gate:**
Após DS Designer sinalizar `SPEC_PRONTA`, o Orchestrator formata a spec para aprovação
humana no formato estruturado (ver seção 10) e aguarda "sim" antes de acionar DS Dev.

**Gerenciamento de Rollback:**
Quando DS Reviewer sinaliza `REVIEW_FALHOU`, o Orchestrator:
1. Registra REPROVADO no pipeline-state.md
2. Retorna a lista de itens ao DS Dev com arquivo e linha exatos
3. DS Dev corrige APENAS os itens listados
4. DS Dev sinaliza IMPL_PRONTA novamente
5. DS Reviewer revalida com foco nos itens corrigidos

**Arquivamento do pipeline-state.md:**
O Orchestrator é responsável por acionar o arquivamento quando o arquivo crescer
além de ~100 entradas ou ~50KB. As entradas antigas são movidas para
`.ai/status/archive/YYYY-MM.md`, mantendo apenas as últimas 20 + todas as abertas.

---

### DS Designer

**Arquivo:** `.claude/agents/ds-designer.md`
**Modelo:** claude-sonnet-4-6
**Papel no sistema:** Decisor de design. Define O QUE existe no DS e com que valores.

**Identidade operacional:** Especifica. Nunca implementa. Nunca gera TypeScript.
A separação é absoluta — um DS Designer que começa a escrever código perdeu seu papel.

**O que faz ao receber uma tarefa:**

1. Lê `.claude/skills/ds-designer/SKILL.md` (router)
2. Identifica qual sub-skill carregar pela tabela do router
3. Carrega APENAS a sub-skill relevante
4. Verifica se token/componente já existe (Regra 1 e 2)
5. Especifica com base nas diretrizes da sub-skill
6. Inclui Perspectiva Strategist obrigatória
7. Sinaliza `SPEC_PRONTA` para o Orchestrator

**Verificações obrigatórias antes de especificar:**
```
Token de cor?
→ Abrir color-light.ts. Existe token com intenção similar? → usar existente.
→ Só especificar novo se NENHUM existente atender.

Componente?
→ Verificar .ai/context/components/inventory.md.
→ Existe em shadcn/ ou ui/? → usar existente.
→ Existe Shadcn com lógica equivalente? → /ds-add-shadcn em vez de criar do zero.
```

**Formato de output obrigatório — a Perspectiva Strategist:**
Toda spec deve incluir dois campos além da especificação técnica:
- `Alternativas descartadas` — o que foi considerado e por que não serve
- `Assumption central` — o que precisa ser verdade para esta decisão funcionar

Sem esses campos, o Orchestrator não pode apresentar o Gate adequadamente.

**Proibições absolutas:**
- Valores hardcoded na spec (hex direto, px solto, rem solto)
- Referência a `*.tokens.ts` (descontinuado no projeto)
- Enviar spec diretamente ao DS Dev (sempre via Orchestrator/Gate)

**Handoff:** `SPEC_PRONTA: [nome] — aguardando aprovação do usuário`

---

### DS Dev

**Arquivo:** `.claude/agents/ds-dev.md`
**Modelo:** claude-opus-4-6 (modelo mais capaz para implementação complexa)
**Papel no sistema:** Executor. Transforma specs aprovadas em código TypeScript correto.

**Identidade operacional:** Implementa specs aprovadas. Nunca define design. Nunca
cria tokens inline. A tentação de "criar um token rapidinho" deve ser resistida
absolutamente — ela viola o Gate e produz tokens não documentados no sistema.

**O que faz ao receber uma tarefa:**

1. Lê `.claude/skills/ds-dev/SKILL.md` (router)
2. Identifica qual sub-skill carregar
3. Carrega APENAS a sub-skill relevante
4. Verifica `component-inventory.md` (antes de qualquer criação)
5. Implementa exatamente o que a spec aprovada define
6. Se token ausente: PARA e sinaliza Cascata (ver seção 12)
7. Registra no pipeline-state.md com campo Assumption

**Proibições absolutas:**
- Criar token inline durante implementação
- Usar Tailwind literal quando existe token DS equivalente
- `import { tv } from "tailwind-variants"` (sempre `@/utils/tv`)
- `disabled` antes dos compostos de cor nos compoundVariants
- `h-*` fixo em controles (sempre `min-h-form-*`)

**Padrões obrigatórios de ring:**

Existem dois padrões de ring no DS, aplicáveis a tipos diferentes de componente:

*Padrão 1 — Estático (botões, selects, checkboxes):*
```typescript
base: ["focus-visible:outline-none"]  // apenas outline-none no base
color: {
  primary: "focus-visible:ring-4 focus-visible:ring-ring-primary"
  // ring fica em CADA color variant, nunca no base
}
```

*Padrão 2 — Animado (inputs, textareas):*
```typescript
base: [
  "ring-0 ring-ring-primary",  // ring invisível pré-carregado
  "transition-[color,box-shadow,background-color]",
  "focus-visible:outline-none"
]
// No focus: ring-4 cresce de 0 para 4 — animação suave
focus: "focus-visible:ring-4"
```

**Estrutura obrigatória de componente iGreen (5 arquivos):**
```
src/components/ui/NomeComponente/
├── index.ts                  ← barrel export
├── nome-componente.tsx       ← lógica e markup, ZERO hardcode
├── nome-componente.styles.ts ← tv(), fonte de verdade visual
├── nome-componente.types.ts  ← interfaces e VariantProps
└── USAGE.md                  ← documentação, OBRIGATÓRIO
```

**Handoff:** `IMPL_PRONTA: [nome] — pronto para DS Reviewer`

---

### DS Reviewer

**Arquivo:** `.claude/agents/ds-reviewer.md`
**Modelo:** claude-sonnet-4-6
**Papel no sistema:** Guardião da qualidade. Nenhum componente vai para produção sem passar aqui.

**Identidade operacional:** Valida. Nunca implementa. Nunca aprova sem spec verificada.
Nunca ignora resultado de grep. A função do Reviewer não é ser simpático —
é encontrar problemas reais antes que cheguem à produção.

**O que faz ao receber uma tarefa:**

**Passo 1 — Localizar spec**
Verificar entrada correspondente no `pipeline-state.md`. Se não estiver lá,
solicitar ao DS Dev que documente antes de continuar. Sem spec registrada,
a revisão não começa.

**Passo 2 — Varredura de regressões (grep)**
Executar em `.styles.ts` e `.tsx`:
```bash
# L-001: ring com modificador
grep -n "ring-ring-.*/" arquivo.styles.ts arquivo.tsx
# L-002a: Tailwind literal de spacing/radius/shadow
grep -n "gap-[0-9]\|rounded-[sml][mdg]\|shadow-[sml][mdg]\|px-[0-9]\|p-[0-9]" arquivo.styles.ts
# L-002b: height fixo proibido
grep -n "\bh-[7-9]\b\|h-1[0-2]\b\|h-\[" arquivo.styles.ts arquivo.tsx
# L-003: ring-3 inexistente
grep -n "ring-3\b" arquivo.styles.ts arquivo.tsx
# L-004: outline-none sem focus-visible
grep -n '"outline-none"' arquivo.tsx arquivo.styles.ts
# L-005: var Shadcn com opacidade
grep -n "bg-input\|bg-background\|bg-foreground" arquivo.tsx
# L-007: tipografia avulsa
grep -n '"text-xs\|"text-sm\|"text-base\b' arquivo.styles.ts
# TypeScript any
grep -rn "\bany\b" arquivo.tsx arquivo.types.ts arquivo.styles.ts
```
**Qualquer match** (exceto L-014 em thumbs de Switch/Slider) → REPROVADO com linha exata.

**Passo 3 — Checklist estrutural**
Verificar 5 arquivos, tv() da importação correta, disabled por último, type="button",
min-h-form-*, padrão de ring correto para o tipo, exports em dois lugares, etc.
Ver lista completa em `review-component.md`.

**Passo 4 — Critique genuína (obrigatório)**
Após checklist, aplicar o teste: *"Esta revisão encontrou algo que muda a direção —
ou apenas confirmou o que já se acreditava?"*

Se "apenas confirmou" → não aprovar ainda. Examinar especificamente:
- A Assumption do gate ainda é válida após ver a implementação?
- Existe componente DS existente que torna este desnecessário?
- A spec resolve o problema correto ou um problema adjacente?

Este passo existe porque um checklist que sempre passa não está procurando o suficiente.
A critique genuína força o Reviewer a ir além do mecânico.

**Passo 5 — Se padrão novo encontrado:**
1. Aprova ou reprova o componente
2. Adiciona lição em `lessons.md` (L-NNN)
3. Atualiza resumo em `ds-standards.md`

**Output:**
- `REVIEW_OK: [nome] ✅` — aprovado
- `REVIEW_FALHOU: [nome]` + lista numerada com arquivo e linha — reprovado

---

## 8. O sistema de skills — contexto mínimo por tarefa

### O que é uma skill

Uma skill é uma pasta em `.claude/skills/` contendo um `SKILL.md` obrigatório e
opcionalmente sub-arquivos especializados. O Claude Code descobre skills por esta
estrutura. O `SKILL.md` tem duas funções: (1) é o router que define qual sub-arquivo
carregar por tipo de tarefa; (2) contém conhecimento compartilhado que aplica a todas
as sub-tarefas do agente.

### Por que a segregação existe e qual o ganho real

Um agente que carrega tudo que existe sobre o projeto antes de começar uma tarefa
simples está num contexto inflado. O contexto inflado tem três efeitos negativos:

1. **Custo de tokens:** cada KB de contexto tem custo. Carregas 50KB de contexto
   para uma tarefa que precisa de 3KB é desperdício direto.

2. **Qualidade de resposta:** o modelo de linguagem dá mais atenção ao que está
   perto do início e do fim da janela de contexto. Informação enterrada no meio
   de um contexto grande é parcialmente ignorada.

3. **Latência:** contextos maiores levam mais tempo para processar.

Com skills segregadas, o DS Designer criando um token de spacing carrega:
- `ds-standards.md` (auto-carregado, ~4KB) — regras e lições
- `ds-designer/SKILL.md` (~2KB) — router + contexto compartilhado do agente
- `spec-token-spacing.md` (~2KB) — lógica específica de spacing

Total: ~8KB de contexto denso e relevante. Sem segregação, seriam ~50KB+ onde a
maioria é irrelevante para a tarefa.

### Convenção de nomes

```
SKILL.md           ← sempre presente, sempre o router e core do agente
spec-{tipo}.md     ← DS Designer especifica
impl-{tipo}.md     ← DS Dev implementa
review-{tipo}.md   ← DS Reviewer revisa
figma-{ação}.md    ← interação com Figma
```

O padrão `{verbo}-{domínio}` elimina ambiguidade. Um arquivo chamado `sizing.md`
poderia ser de qualquer agente e qualquer domínio. `spec-token-sizing.md` não tem
ambiguidade: é especificação, é de token, é de sizing.

### Skills do DS Designer

**`SKILL.md` — Router e core**
Contém a tabela de roteamento (qual sub-skill carregar por tipo de tarefa), os
templates de output obrigatórios para cada tipo (token novo, edição de token,
spec de componente, extração Figma) incluindo o formato da Perspectiva Strategist.

**`spec-token-color.md`**
Conteúdo operacional: verificação prévia obrigatória (abrir color-light.ts antes
de propor qualquer token), arquitetura completa (primitivo OKLCH → semântico),
roles e quando usar cada um, sufixos *-inverted vs on-*, variantes obrigatórias
por cor de status, fluxo de criação passo a passo, nomes proibidos.

**`spec-token-spacing.md`**
Conteúdo operacional: verificação prévia (abrir spacing.ts), três grupos semânticos
(gap/space/pad) com CSS vars, valores da escala base 4px×n, tokens de componente
(padCard/padPage), tabela de escolha do grupo correto por situação, regra de não
criar token com mesmo valor que já existe.

**`spec-token-sizing.md`**
Conteúdo operacional: form heights (3xs a xl com valores px), icon sizes, container
widths, radius (xs a full), shadows (sm a xl), z-index semântico.

**`spec-token-typography.md`**
Conteúdo operacional: presets compostos existentes, escala de tipo, regra do
clamp() (apenas ≥32px), nunca px, como criar preset novo.

**`spec-component.md`**
Conteúdo operacional: três cenários de componente (iGreen/Shadcn/Composto) e
quando usar cada um, como spec iGreen vs Shadcn vs composto, campos obrigatórios
da spec (variantes, tamanhos, estados, tokens, focus ring).

**`figma-extract.md`**
Conteúdo operacional: processo de mapeamento (elemento Figma → classe DS), como
identificar gaps (valores sem token DS equivalente), formato de tabela de mapeamento,
Perspectiva Strategist para extração.

### Skills do DS Dev

**`SKILL.md` — Router e core**
Tabela de roteamento, regra crítica de Cascata (parar ao encontrar token ausente),
formato exato de sinalização de Cascata, formato de registro no pipeline-state.md.

**`impl-token.md`**
Conteúdo operacional: arquivos semânticos por tipo (color-light.ts + color-dark.ts
para cor, spacing.ts para spacing, etc.), templates de implementação por tipo,
`npm run tokens:tw4` obrigatório ao final.

**`impl-shadcn.md`**
Conteúdo operacional: como instalar via CLI shadcn, como mover para shadcn/, como
substituir focus ring Shadcn pelo padrão iGreen, quais vars Shadcn substituir por
tokens DS, como preservar lógica Radix, barrel exports obrigatórios.

**`impl-igreen.md`**
Conteúdo operacional: verificações antes de escrever código, estrutura obrigatória
de 5 arquivos, template completo de `.styles.ts` com todos os compoundVariants,
template completo de `.tsx` com forwardRef, checklist antes de sinalizar.

**`impl-composite.md`**
Conteúdo operacional: quando é composto vs iGreen puro, estrutura de tv() com slots,
regras de API limpa (consumidor não importa bases), acessibilidade obrigatória
(htmlFor, aria-describedby, aria-invalid), checklist.

### Skills do DS Reviewer

**`SKILL.md` — Router + checklist de token**
Contém o router (token semântico → neste arquivo; componente → review-component.md),
checklist completo de revisão de token, critério de critique genuína para tokens.

**`review-component.md`**
Conteúdo operacional: 5 passos completos de revisão, todos os comandos grep com
padrões regex para cada lição (L-001 a L-014), checklist estrutural separado por
tipo (iGreen/Shadcn/composto), critério de critique genuína, formato obrigatório
de registro no pipeline-state.md.

### Usando skills quando o DS é subprojeto

O Claude Code só descobre `.claude/commands/` e `.claude/skills/` da pasta onde
a sessão foi aberta (+ `~/.claude/` do usuário). Se o DS está numa subpasta
(monorepo, `vendor/`, git submodule) e a sessão roda na raiz do projeto PAI, os
slash commands do DS **não aparecem**. Três formas de usar o pipeline mesmo assim:

**1. Abrir a sessão na subpasta do DS** — `cd packages/igreen-ds && claude`.
Tudo funciona nativo (commands, skills, hooks, rules).

**2. Copiar pro `.claude/` do projeto pai** — ex. pro CRUD builder:
`ds-create-crud.md` → `meu-app/.claude/commands/` e a pasta `crud-builder/` →
`meu-app/.claude/skills/`. O command vira nativo no pai; a skill detecta que
está num consumer (via `package.json.name`) e adapta imports/paths.

**3. Invocação por prompt (ler-e-seguir)** — sem copiar nada. Skills são
markdown: a IA da sessão pai lê os arquivos do subprojeto e os segue como
instruções autoritativas. O prompt precisa APONTAR a porta de entrada — um
pedido vago ("cria uma tabela usando o DS") deixa a IA improvisar. Template
copy-paste:

```
Tenho o iGreen Design System como subprojeto em <path>. Ele tem um pipeline
de skills pro Claude Code. Leia e siga
<path>/.claude/skills/crud-builder/SKILL.md (e os arquivos que ele encadeia)
pra criar uma página de tabela de <entidade> no meu app. Trate os .md como
instruções autoritativas — não improvise fora deles. Meus dados: <sample
JSON | endpoint | interface TS>.
```

A skill cobre esse caminho explicitamente (seção "Invocação por prompt" do
`crud-builder/SKILL.md`): mesma ordem de carga, mesmos guardrails, e o gate de
blueprint continua obrigatório. Vantagem do cenário subprojeto: os exemplos
canônicos (`src/preview/pages/Clients*`) existem no disco — a IA lê a fonte
real antes de gerar, sem depender de fallback.

---

## 9. O pipeline completo — todos os fluxos

### Fluxo A — Token ou componente iGreen novo (com Gate)

```
[Usuário] "Quero criar um componente Button"
              ↓
         Orchestrator
         ├── Lê CLAUDE.md + ds-standards.md + pipeline-state.md
         ├── Verifica: Button já existe? → SIM → informa usuário → encerra
         │                               → NÃO → continua
         └── Delega: ds-designer via /ds-create-component
              ↓
         DS Designer
         ├── Lê SKILL.md router → tarefa é "componente novo" → carrega spec-component.md
         ├── Verifica inventory.md → Button não existe → pode prosseguir
         ├── Verifica: tem Shadcn equivalente? → NÃO (Button tem lógica simples)
         ├── Especifica: variantes (filled/outline/soft/ghost), cores (5),
         │   tamanhos (4), estados (hover/focus/disabled)
         └── Inclui Perspectiva Strategist:
             - Alternativas: "Shadcn button não tem as variantes de cor semânticas iGreen"
             - Assumption: "Lógica é simples o suficiente para tv() sem Radix"
             ↓
         Sinaliza: SPEC_PRONTA: Button — aguardando aprovação
              ↓
         ⛔ GATE — Orchestrator apresenta spec ao usuário
         ┌─────────────────────────────────────────────────────┐
         │ ## Spec para aprovação: Button                      │
         │                                                     │
         │ O que está sendo proposto:                          │
         │ - color: primary/secondary/critical/success/warning │
         │ - variant: filled/outline/soft/ghost                │
         │ - size: xxs/xs/sm/md                                │
         │ - fullWidth: boolean · disabled: boolean            │
         │                                                     │
         │ Perspectiva Strategist:                             │
         │ - Alternativas descartadas: Shadcn button não tem   │
         │   variantes de cor semânticas iGreen                │
         │ - Assumption central: lógica é simples o suficiente │
         │   para tv() sem Radix                               │
         │                                                     │
         │ Posso acionar DS Dev para implementar?              │
         └─────────────────────────────────────────────────────┘
              ↓
         [Usuário] "sim"
              ↓
         Orchestrator registra PAUSADO(gate) no pipeline-state.md
         e aciona DS Dev
              ↓
         DS Dev
         ├── Lê SKILL.md router → tarefa é "componente iGreen" → carrega impl-igreen.md
         ├── Verifica inventory.md → confirma Button não existe
         ├── Verifica tokens: todos existem? → SIM → pode implementar
         ├── Cria 5 arquivos: button.tsx + button.styles.ts + button.types.ts
         │   + index.ts + USAGE.md
         ├── Implementa tv() com todos os compoundVariants
         ├── Atualiza exports e inventory.md
         └── Registra no pipeline-state.md com campo Assumption
             ↓
         Sinaliza: IMPL_PRONTA: Button — pronto para DS Reviewer
              ↓
         DS Reviewer
         ├── Localiza spec no pipeline-state.md
         ├── Executa grep de regressões em button.styles.ts e button.tsx
         │   → grep ring modificador: 0 matches ✓
         │   → grep Tailwind literal: 0 matches ✓
         │   → grep height fixo: 0 matches ✓
         │   ... (todos os padrões L-001 a L-014)
         ├── Checklist estrutural:
         │   → 5 arquivos: ✓
         │   → tv() de @/utils/tv: ✓
         │   → disabled por último: ✓
         │   → type="button": ✓
         │   → min-h-form-*: ✓
         │   → ring em color variants (não no base): ✓
         │   → exports em dois arquivos: ✓
         │   → pipeline-state.md atualizado: ✓
         ├── Critique genuína:
         │   → Assumption "lógica simples para tv()" ainda válida? SIM
         │   → Existe componente equivalente? NÃO (verificou inventory)
         │   → Spec foi seguida? SIM
         └── Registra no pipeline-state.md
             ↓
         REVIEW_OK: Button ✅
```

### Fluxo B — Componente Shadcn (sem Gate)

```
[Usuário] "Adicionar Input do Shadcn"
              ↓
         Orchestrator → DS Dev via /ds-add-shadcn
         (sem Gate — componente Shadcn não é decisão de design original)
              ↓
         DS Dev
         ├── SKILL.md → impl-shadcn.md
         ├── Verifica inventory.md → Input não existe
         ├── Instala via CLI: npx shadcn@latest add input
         ├── Move para src/components/shadcn/
         ├── Substitui focus ring Shadcn → ring-0 ring-ring-primary (Padrão 2)
         ├── Substitui vars Shadcn por tokens DS
         └── Atualiza exports e inventory.md
              ↓
         DS Reviewer → grep + checklist Shadcn → REVIEW_OK: Input ✅
```

### Fluxo C — Edição de componente existente (sem Gate)

```
[Usuário] "Ajustar o padding do Button size sm"
              ↓
         Orchestrator → DS Dev (sem Gate — edição de existente)
              ↓
         DS Dev
         ├── SKILL.md → impl-igreen.md
         ├── Edita APENAS button.styles.ts — nunca o .tsx
         └── Registra no pipeline-state.md
              ↓
         DS Reviewer → grep + checklist → REVIEW_OK ✅
```

### Fluxo D — Cascata detectada durante implementação

```
         DS Dev implementando componente X
              ↓
         Descobre: token bg.warning-subtle não existe
              ↓
         DS Dev PARA imediatamente
         Não cria o token inline
              ↓
         DS Dev registra no pipeline-state.md:
         ### [data] | DS DEV | ComponenteX | CASCATA
         - Token ausente: bg.warning-subtle
         - Tipo: cor
         - Uso esperado: fundo do estado warning do componente
         - Retomar: após REVIEW_OK do token → continuar com impl-igreen.md
              ↓
         Orchestrator pausa ComponenteX
         Abre pipeline de token:
         DS Designer → GATE → DS Dev → DS Reviewer
              ↓
         Após REVIEW_OK: bg.warning-subtle
              ↓
         Orchestrator retoma ComponenteX
         DS Dev continua de onde parou
```

### Fluxo E — Rollback após reprovação

```
         DS Reviewer reprova:
         REVIEW_FALHOU: ComponenteY
         1. button.styles.ts linha 23: gap-4 → gap-gp-md (L-002)
         2. button.styles.ts linha 31: ring-ring-primary/30 (L-001)
              ↓
         Orchestrator registra REPROVADO no pipeline-state.md
         Retorna lista ao DS Dev
              ↓
         DS Dev corrige APENAS os dois itens listados
         (não reescreve o que estava certo)
              ↓
         DS Dev sinaliza IMPL_PRONTA novamente
              ↓
         DS Reviewer revalida com foco nos dois itens
         → Verifica que gap-gp-md está correto
         → Verifica que ring sem modificador está correto
         → Critique genuína → tudo correto
         → REVIEW_OK: ComponenteY ✅
```

---

## 10. O Gate de aprovação — decisões de design requerem humano

### O que é e por que existe

O Gate é a pausa obrigatória entre a especificação de design e a implementação.
É o mecanismo que mantém o humano no controle das decisões que mais importam.

Tokens e componentes não são decisões técnicas — são decisões de design com vida
longa. Um token criado hoje vai existir por meses. Um componente aprovado hoje vai
ser usado em centenas de telas. O Gate garante que essas decisões passam pelo olho
humano antes de serem codificadas.

### Quando se aplica e quando não se aplica

**Aplica-se a (decisões de design originais):**
- Qualquer token novo (cor, spacing, sizing, tipografia, motion)
- Qualquer componente iGreen novo
- Extração do Figma que gera tokens ou componentes novos
- Edição de token existente que muda seu valor (não apenas nome)

**Não se aplica a (decisões técnicas ou iterações):**
- Adaptação de componente Shadcn (Shadcn define o design)
- Edição de componente existente (decisão já foi aprovada)
- Tarefas técnicas (adapter, transform, barrel export)
- Correções de bug que não mudam comportamento visual

### Formato obrigatório do Gate

```markdown
## Spec para aprovação: [Nome]

**O que está sendo proposto:**
- [lista de variantes]
- [lista de tamanhos ou valores]
- [tokens que serão utilizados]
- [estados: hover, focus, disabled, etc.]

**Perspectiva Strategist:**
- Alternativas descartadas: [o que foi considerado e por que não serve]
  (pode ser "nenhuma — único caminho viável" se for o caso)
- Assumption central: [o que precisa ser verdade para esta decisão funcionar]
  Ex: "gap.xl (16px) não cobre este caso porque é usado para Y"
  Ex: "Não existe componente Shadcn com lógica equivalente"

Posso acionar DS Dev para implementar?
```

### O que o usuário avalia no Gate

Ao ver uma spec no Gate, o usuário deve verificar:

1. **A spec está completa?** Todos os casos de uso cobertos?
2. **As alternativas foram consideradas?** O DS Designer descartou algo que deveria
   ter aproveitado?
3. **A assumption faz sentido?** O que precisa ser verdade para isso funcionar —
   isso é plausível no contexto do projeto?
4. **Existe algo parecido?** O usuário conhece o projeto e pode identificar
   duplicações que o agente não viu.

### O que acontece após o "sim"

O Orchestrator registra no `pipeline-state.md`:
```markdown
### [YYYY-MM-DD] | ORCHESTRATOR | [Nome] | PAUSADO (gate)
- Spec entregue por: ds-designer
- Alternativas descartadas: [copiado da spec]
- Assumption central: [copiado da spec]
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill impl-[tipo].md
```

E então aciona o DS Dev.

---

## 11. O campo Assumption — tornando decisões reversíveis

### O que é e por que é obrigatório

O campo `Assumption` está presente em todo registro do `pipeline-state.md`. Ele
responde a uma única pergunta: **"O que precisa ser verdade para esta decisão estar certa?"**

É uma forma de externalizar o raciocínio implícito de uma decisão. Toda decisão
técnica ou de design tem premissas que nem sempre estão explícitas. O campo Assumption
força o agente a declarar essas premissas no momento da decisão.

### Como usar em debugging futuro

Sem o campo Assumption, quando algo parece errado você precisa reconstruir o
raciocínio completo: "Por que esse token tem esse valor? Qual era o contexto? Quais
alternativas foram consideradas?"

Com o campo Assumption, o processo é direto:
1. Encontrar a decisão no `pipeline-state.md`
2. Ler a assumption: "prefixo gp é suficientemente distinto do Tailwind nativo"
3. Verificar: ainda é verdade? O Tailwind adicionou um `gap-gp-*` nativo?
4. Se sim → assumption quebrou → sabe exatamente o que revisar

### Exemplos reais de assumptions registradas

**Decisão técnica:**
```
Assumption: prefixos DS (gap-gp-*, rounded-radius-*, etc.) evitam colisão
com Tailwind nativo sem custo de runtime
```
→ Se o Tailwind adicionar `gap-gp-md` nativo em alguma versão, esta assumption
quebra e os prefixos precisam ser revisados.

**Decisão arquitetural:**
```
Assumption: clamp() apenas em tipografia ≥ 32px porque o ganho de responsividade
abaixo disso é insignificante vs complexidade adicionada
```
→ Se métricas de uso mostrarem problemas de legibilidade em displays específicos
para texto menor, esta assumption precisa ser revisitada.

**Decisão de componente:**
```
Assumption: bg-white fixo é correto para thumbs Switch/Slider porque
bg-bg-surface-inverted seria invisível em dark mode
```
→ Se o sistema de tokens de dark mode for revisado e surface-inverted passar a
funcionar corretamente em todos os contextos, esta exceção pode ser removida.

**Decisão de processo:**
```
Assumption: skills segregadas por agente melhoram precisão sem perda de informação
relevante porque a sub-skill carregada contém todo o contexto necessário para a tarefa
```
→ Se surgir um tipo de tarefa que sistematicamente precisa de duas sub-skills ao
mesmo tempo, esta assumption precisa ser reavaliada.

### Hierarquia de importância das assumptions

Nem toda assumption tem o mesmo peso. As mais críticas são as que afetam:
- A estrutura do sistema de tokens (difícil de reverter depois)
- O comportamento de dark mode (invisível para usuários até dar errado)
- Decisões de processo que afetam todos os agentes

As menos críticas são as de implementação pontual (qual token usar em qual componente).

---

## 12. Protocolo de Cascata — dependência ausente

### Regra absoluta

Quando o DS Dev encontra um token ausente durante implementação, ele **nunca cria
o token inline**. A regra não tem exceções. Isso pode parecer lento — e é, em
comparação com criar inline. Mas o custo de tokens criados sem processo se paga
em inconsistências que aparecem meses depois.

**Por que a regra é absoluta:**
- Token criado inline não tem spec semântica → pode ter valor errado
- Token criado inline não passou pelo Gate → não foi validado pelo humano
- Token criado inline não está no pipeline-state.md → decisão invisível
- Token criado inline pode conflitar com tokens existentes → o DS Designer não verificou

### O protocolo completo

**Passo 1 — Detectar e parar**
```
DS Dev encontra: "componente precisa de bg.info-subtle mas não existe"
DS Dev PARA imediatamente
Não tenta aproximar com token existente
Não cria placeholder
```

**Passo 2 — Sinalizar ao Orchestrator**
```
"CASCATA: Token bg.info-subtle necessário para AlertBanner — ausente no DS"
```

**Passo 3 — Registrar no pipeline-state.md**
```markdown
### [YYYY-MM-DD] | DS DEV | AlertBanner | CASCATA
- Token ausente: bg.info-subtle
- Tipo: cor
- Uso esperado: fundo do estado informativo do componente AlertBanner
- Pipeline aberto: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova
- Retomar: após REVIEW_OK do token → continuar AlertBanner com impl-composite.md
```

**Passo 4 — Orchestrator gerencia a resolução**
- Pausa AlertBanner
- Abre pipeline de token completo para bg.info-subtle
- DS Designer especifica → Gate → DS Dev implementa → DS Reviewer aprova

**Passo 5 — Retomada após resolução**
- Orchestrator lê o campo "Retomar" no registro de Cascata
- Aciona DS Dev para continuar AlertBanner com a skill correta
- DS Dev já tem o token disponível, continua implementação

### Cascata cross-domínio (App → DS)

Quando o domínio App estiver ativo e uma tela precisar de componente DS inexistente:

```
App Designer especifica tela Dashboard
    ↓
Identifica: precisa de DataTable mas não existe no DS
    ↓
App Designer sinaliza ao Orchestrator:
"CASCATA cross-domínio: DataTable ausente — necessário para Dashboard"
    ↓
Orchestrator:
1. Pausa Dashboard inteiro
2. Registra CASCATA cross-domínio no pipeline-state.md
3. Abre pipeline DS completo para DataTable
   (DS Designer → GATE → DS Dev → DS Reviewer)
    ↓
Após REVIEW_OK: DataTable
    ↓
Orchestrator retoma Dashboard
App Designer/Dev continuam com DataTable disponível
```

### Diferença entre Cascata e PAUSADO (gate)

| | PAUSADO (gate) | CASCATA |
|--|----------------|---------|
| **Quem registra** | Orchestrator | DS Dev |
| **Por que pausa** | Aguardando aprovação humana | Dependência ausente |
| **Resolução** | Usuário responde "sim" | Pipeline completo de token/componente |
| **Fluxo** | Normal do pipeline | Interrupção com sub-pipeline |

---

## 13. O audit log — pipeline-state.md em profundidade

### Filosofia do append-only

O `pipeline-state.md` é o registro permanente do sistema. Nunca se apaga entradas —
apenas se adicionam. Esta não é uma escolha arbitrária:

**Auditabilidade:** Qualquer entrada tem timestamp e agente. É possível reconstruir
exatamente o que aconteceu em qualquer ponto do tempo.

**Integridade:** Nenhum agente pode "consertar" sua própria entrada retroativamente.
Rollbacks e correções são novos registros, não edições de registros antigos.

**Rastreabilidade de decisões:** A Assumption de uma decisão tomada há três meses
ainda está lá, exatamente como foi registrada, para consulta quando algo quebrar.

### Estrutura de cada tipo de entrada

**CONCLUÍDO / APROVADO:**
```markdown
### [YYYY-MM-DD] | DS DEV | Button | CONCLUÍDO
- Input: spec recebida via gate aprovado em 2026-04-01
- Output: IMPL_PRONTA sinalizado — 5 arquivos criados
- Decisões: ring no color variant (não no base) para consistência com Padrão 1
- Assumption: "Lógica do Button é simples o suficiente para tv() sem Radix"
- Lições novas: nenhuma
```

**REPROVADO:**
```markdown
### [YYYY-MM-DD] | DS REVIEWER | Button | REPROVADO
- Spec verificada: sim — pipeline-state.md 2026-04-01
- Assumption verificada: ainda válida
- Critique genuína: verificou inventory — não existe componente equivalente
- Regressões: button.styles.ts:23 gap-4 (L-002) · button.styles.ts:31 ring/30 (L-001)
- Lições novas: nenhuma (padrões já cobertos por L-001 e L-002)
```

**PAUSADO (gate):**
```markdown
### [YYYY-MM-DD] | ORCHESTRATOR | TokenCorPrimaria | PAUSADO (gate)
- Spec entregue por: ds-designer
- Alternativas descartadas: "bg.brand já existe mas é API privada — não usar em componentes"
- Assumption central: "bg.primary precisa de variante subtle para uso em alerts"
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill impl-token.md
```

**CASCATA:**
```markdown
### [YYYY-MM-DD] | DS DEV | AlertBanner | CASCATA
- Token ausente: bg.info-subtle
- Tipo: cor
- Uso esperado: fundo do estado informativo do componente
- Pipeline aberto: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova
- Retomar: após REVIEW_OK do token bg.info-subtle → continuar com impl-composite.md
```

### Índices no pipeline-state.md

Além do log cronológico, o arquivo mantém dois índices:

**Índice de componentes** — tabela com data, nome, tipo (iGreen/Shadcn/composto) e
status de cada componente já processado pelo pipeline.

**Índice de decisões arquiteturais** — tabela com data, decisão e assumption das
decisões que afetam o sistema como um todo (prefixos, estratégias de dark mode,
escolhas de arquitetura).

### Quando arquivar

Quando o arquivo crescer além de ~100 entradas ou ~50KB:

```markdown
1. Criar .ai/status/archive/YYYY-MM.md
2. Mover todas as entradas CONCLUÍDO/APROVADO com mais de 30 dias
3. Manter no arquivo ativo:
   - Últimas 20 entradas (contexto recente)
   - Todas as entradas PAUSADO (gate) em aberto
   - Todas as entradas CASCATA em aberto
4. Registrar a operação de arquivamento como entrada CONCLUÍDO no arquivo ativo
```

---

## 14. O loop de lições — lessons.md em profundidade

### Por que lições em vez de regras no CLAUDE.md

O CLAUDE.md tem 6 regras de comportamento absolutas — regras que definem o que os
agentes podem e não podem fazer. Essas regras são estáveis e deliberadas.

As lições em `lessons.md` são diferentes: elas emergem da prática. São padrões de
erro que não foram antecipados quando o sistema foi construído. Elas crescem
organicamente a partir do trabalho real.

Manter as lições separadas das regras tem dois benefícios:
1. O CLAUDE.md fica pequeno e legível — apenas o que é absolutamente essencial
2. As lições têm rastreabilidade — cada uma tem origem clara (qual erro gerou)

### O formato e por que cada campo importa

```markdown
## [L-NNN] Título curto

**Erro cometido:** o que o agente fez de errado
← Específico o suficiente para reconhecer o padrão na próxima vez

**Regra derivada:** o que fazer corretamente
← Inclui exemplos de código quando relevante (✅ correto / ❌ errado)

**Contexto:** onde se aplica
← Limita o escopo — não toda regra aplica em todo lugar
```

O título curto (L-NNN + descrição) é o que aparece no resumo do `ds-standards.md`.
Deve ser reconhecível em 3-4 palavras.

### Como uma lição é adicionada — processo completo

```
1. DS Reviewer executa grep e checklist
2. Encontra: 'text-xs font-semibold' no badge.styles.ts
3. Verifica: isso está coberto pelas lições L-001 a L-014? → NÃO
4. DS Reviewer:
   a) Reprova o componente:
      REVIEW_FALHOU: Badge
      1. badge.styles.ts:12 text-xs font-semibold → usar text-label-xs (L-NNN)
   b) Adiciona ao final de lessons.md:
      ## [L-007] text-xs font-semibold em vez de preset tipográfico
      Erro cometido: usar text-xs font-semibold, text-sm font-medium
      Regra derivada: text-xs font-semibold → text-label-xs
      Contexto: badge, tab, qualquer componente com texto de UI
   c) Atualiza o resumo em ds-standards.md:
      Adiciona na seção "Lições — resumo":
      - **L-007** `text-xs font-semibold` → `text-label-xs`
5. Na próxima sessão:
   ds-standards.md é carregado automaticamente
   Agente já vê a regra L-007 antes de escrever qualquer código
   Erro não se repete
```

### Como atualizar lessons.md

```
1. Identificar o padrão do erro (diferente de um erro pontual)
   Um erro pontual: "agente escreveu uma variável com nome errado"
   Um padrão: "agente sempre usa Tailwind literal em vez de token DS"
   → Apenas padrões viram lições

2. Adicionar no formato [L-NNN] ao final do arquivo
   NNN = número sequencial (L-015 seria a próxima)

3. Verificar se o resumo em ds-standards.md precisa ser atualizado
   Se a lição é de código (como L-001 a L-014): adicionar no resumo
   Se é de processo (regra comportamental): adicionar na seção de regras
```

---

## 15. Ciclo de sessão — abertura, execução e encerramento

### Checklist de abertura (do CLAUDE.md)

```
1. Ler CLAUDE.md — regras e mapa de tarefas
2. Confirmar que ds-standards.md foi carregado automaticamente
3. Verificar .ai/status/pipeline-state.md — há tarefa PAUSADA ou CASCATA aberta?
4. Perguntar: "Qual o foco desta sessão?"
```

**Por que o passo 3 é crítico:** se houver uma Cascata ou Gate pendente de sessão
anterior, o agente deve retomar de onde parou antes de iniciar qualquer tarefa nova.
Iniciar uma nova tarefa ignorando uma Cascata aberta cria inconsistência no sistema.

**Por que perguntar o foco (passo 4):** evita que o agente assuma que sabe o que
o usuário quer. Um agente que começa a trabalhar sem confirmar o foco pode gastar
tokens na direção errada.

### Durante a execução

**Verificações antes de cada ação:**
- "Estou prestes a criar algo novo?" → verificar se já existe (Regra 6 — self-interrupt)
- "Preciso de um token que pode não existir?" → verificar antes de implementar
- "Esta tarefa cabe no meu escopo como agente?" → se não, sinalizar ao Orchestrator

**Sinais de que algo está errado:**
- Orquestrador está executando código → não está delegando
- DS Designer está escrevendo TypeScript → ultrapassou o escopo
- DS Dev está criando token de cor → deveria ter sinalizado Cascata
- DS Reviewer aprovou sem rodar grep → não aplicou o checklist

### Checklist de encerramento (do CLAUDE.md)

```
1. pipeline-state.md atualizado?
   Se criou/modificou token ou componente: registrar entrada com Assumption
2. Há tarefa incompleta?
   Marcar como PAUSADO em pipeline-state.md com contexto para retomada
3. Houve lição nova?
   Se um padrão de erro se repetiu: registrar em lessons.md
```

**Por que o encerramento importa:** sessões que terminam sem atualizar o
`pipeline-state.md` criam lacunas no audit log. A próxima sessão começa sem
saber o que foi feito, potencialmente refazendo trabalho ou perdendo contexto crítico.

---

## 16. Commands — slash commands disponíveis

Commands são arquivos em `.claude/commands/` invocados com `/nome-do-arquivo` no
Claude Code. Cada um é um entry point fino — define as verificações obrigatórias
de entrada e delega para a skill correta. Não contém a lógica completa.

### /ds-add-token

**Arquivo:** `ds-add-token.md`
**Quando usar:** criar qualquer token novo (cor, spacing, sizing, tipografia, motion)
**Fluxo:** DS Designer → GATE → DS Dev → DS Reviewer

Verificações de entrada:
1. Qual a intenção semântica? (não apenas o valor)
2. Abrir o arquivo semântico correspondente
3. Existe token com valor ou intenção similar? → usar existente se sim
4. Prosseguir com DS Designer se não existir

### /ds-create-component

**Arquivo:** `ds-create-component.md`
**Quando usar:** criar componente iGreen novo com tv()
**Fluxo:** DS Designer → GATE → DS Dev → DS Reviewer

Verificações de entrada:
1. Existe em component-inventory.md? → parar, usar existente
2. Tem lógica interativa complexa (modal, dropdown, portal)? → usar /ds-add-shadcn
3. Todos os tokens necessários existem? → se não, sinalizar cascata

### /ds-add-shadcn

**Arquivo:** `ds-add-shadcn.md`
**Quando usar:** adaptar componente Shadcn para tokens iGreen
**Fluxo:** DS Dev → DS Reviewer (sem Gate)

Verificações de entrada:
1. shadcn/[nome].tsx já existe em inventory.md? → editar existente, não reinstalar
2. Todos os tokens DS necessários existem? → cascata se não

### /ds-create-composite

**Arquivo:** `ds-create-composite.md`
**Quando usar:** criar componente que combina existentes (FormField, DatePicker, etc.)
**Fluxo:** DS Dev → DS Reviewer (sem Gate)

Verificações de entrada:
1. Existe em component-inventory.md? → usar existente
2. Todos os componentes-base existem em shadcn/ ou ui/? → criar bases primeiro
3. Tokens necessários existem? → cascata se não

### /ds-extract-figma

**Arquivo:** `ds-extract-figma.md`
**Quando usar:** mapear valores do Figma para tokens/componentes DS
**Fluxo:** DS Designer (figma-extract.md) → GATE → DS Dev

O output do DS Designer é uma tabela de mapeamento com Perspectiva Strategist,
identificando gaps (valores Figma sem token DS equivalente) que precisam ser criados
via /ds-add-token antes da implementação.

### /ds-update

**Arquivo:** `ds-update.md`
**Quando usar:** registrar mudanças acumuladas na timeline Updates (sem release)
**Fluxo:** DS Dev (update-changelog.md) → GATE preview → grava entry em updates-data.ts

Lê o git log desde a última entry, classifica por prefixo convencional e propõe
uma ReleaseEntry typed. Não faz bump nem commit — só a timeline.

### /ds-release

**Arquivo:** `ds-release.md`
**Quando usar:** fechar versão — TODO bump de `package.json.version` passa por aqui (L-020)
**Fluxo:** DS Dev (release.md) → pre-commit-check → GATE preview → bump + branch + commit + push + PR via gh

Engloba o /ds-update e adiciona os passos de publicação git. Releases de todos os
tamanhos (major/minor/patch/hotfix) usam este fluxo — direct push no main quebra a
convenção do projeto.

### /ds-create-crud

**Arquivo:** `ds-create-crud.md`
**Quando usar:** criar tela de tabela/CRUD consumindo o DataTable
**Fluxo:** crud-builder (entrevista 6 fases) → GATE blueprint → geração lendo exemplos canônicos

Entrevista híbrida (fases com defaults + drill-down por coluna; aceita sample
JSON/interface TS/descrição de endpoint quando os dados vêm de API), consolida
blueprint com pré-validações (operador×filterType, colisão de page id) e só gera
após aprovação — espelhando os exemplos `Clients*Preview`/showcases. Funciona
também com o DS como subprojeto via invocação por prompt (ver seção 8).

---

## 17. Contexto de referência — .ai/context/ em profundidade

### Princípio de carregamento sob demanda

Nenhum arquivo em `.ai/context/` é carregado no startup. O agente carrega apenas o
relevante à tarefa atual. Isso é intencional — o contexto total de referência do
projeto é ~30KB. Carregar tudo a cada sessão seria desperdício de tokens.

### tokens/

**color.md** (~6KB)
Lido pelo DS Designer ao especificar qualquer token de cor. Contém: arquitetura
completa do sistema de cor (primitivo OKLCH → semântico → CSS vars → classes),
os cinco roles (bg/fg/border/ring/overlay) e quando usar cada um, sufixos
(*-inverted vs on-*), variantes obrigatórias por cor de status, fluxo de criação
passo a passo, nomes proibidos com alternativas corretas.

**spacing.md** (~4KB)
Lido pelo DS Designer ao especificar spacing. Contém: os três grupos semânticos
(gap = entre filhos, space = margem/offset, pad = padding interno de componente),
a escala base 4px×n com valores completos, tokens de componente (padCard, padPage),
tabela de escolha do grupo correto por situação de uso.

**sizing-shape-elevation.md** (~8KB)
Lido pelo DS Designer ao especificar sizing. Contém: escala completa de form heights
(3xs a xl com valores px e equivalentes Tailwind proibidos), icon sizes, container
widths, escala de radius (xs a full), escala de shadow (sm a xl), z-index semântico.

**typography.md** (~7KB)
Lido pelo DS Designer ao especificar tipografia. Contém: presets compostos por tipo
(label, paragraph, heading, title, display), escala de tipo, regra do clamp() (apenas
para presets ≥32px porque abaixo disso o ganho é insignificante), proibição de px.

**motion.md** (~3KB)
Lido pelo DS Designer ao especificar tokens de animação. Contém: tokens de duração
por tipo de transição, tokens de easing, regras de uso (micro-interactions sim,
page-load dramático não).

### components/

**inventory.md** (~8KB)
**O arquivo mais crítico do sistema.** Deve ser verificado por qualquer agente antes
de criar qualquer componente. Contém: estrutura de pastas de componentes (shadcn/ vs
ui/), tabela completa de 21 componentes implementados (nome, arquivo, subcomponentes
exportados, status), API por componente (variantes, tamanhos, estados), lista de
componentes planejados com prioridade, regras de adição.

**guide.md** (~9KB)
Lido pelo DS Dev ao criar ou editar componente iGreen. Contém: como funciona o sistema
de estilos (color-light.ts → to-tailwind-v4.ts → Tailwind → .styles.ts → componente),
estrutura obrigatória de 5 arquivos, padrão tv() completo com template de .styles.ts,
template de .tsx com forwardRef, regras invioláveis, prefixos obrigatórios, como .tsx
consome .styles.ts.

**shadcn-token-map.md** (~4KB)
Lido pelo DS Dev ao adaptar componente Shadcn. Contém: mapeamento completo de variáveis
CSS nativas do Shadcn para tokens DS equivalentes (--background → bg-bg-canvas,
--foreground → fg.foreground, --border → border-border-main, etc.).

### Outros arquivos de contexto

**architecture.md** — Stack técnica (Vite + React + TypeScript + Tailwind v4),
estrutura de pastas do projeto, decisões arquiteturais gerais, relação DS ↔ App.

**shared-app-context.md** — Layout base provisório do app desktop, convenções de
rota planejadas, padrões de tela, regras para App Dev React. Status: a ser preenchido
após primeira tela real.

**doc-guide.md** — Como escrever o USAGE.md obrigatório de cada componente. Estrutura,
o que incluir, o que omitir, exemplos.

---

## 18. Domínio App — estrutura pendente e protocolo de ativação

### O que existe hoje

O domínio App está estruturado mas não operacional. Existe:

**Agentes definidos (sem skills operacionais):**
- `app-designer.md` — especifica telas e fluxos de produto
- `app-dev-react.md` — implementa telas usando o DS como ferramenta

**Skills com estrutura mas sem conteúdo:**
- `skills/app-designer/SKILL.md` — router placeholder com sub-skills a criar
- `skills/app-dev-react/SKILL.md` — placeholder

**Contexto provisório:**
- `context/shared-app-context.md` — layout base aguardando validação

### Por que está assim

As skills de App não podem ser preenchidas com suposições — elas precisam refletir
decisões reais tomadas durante o desenvolvimento das primeiras telas. Patterns de
layout, convenções de navegação, padrões de formulário — tudo isso emerge da prática,
não da antecipação.

Preencher as skills com suposições criaria um sistema que guia na direção errada.

### Protocolo de ativação

```
Passo 1 — Construir primeira tela manualmente
Sem pipeline, sem agente App. Simplesmente construir usando os componentes DS
disponíveis e tomando decisões de layout na prática.

Passo 2 — Documentar decisões em shared-app-context.md
Após a primeira tela: quais layouts foram usados, quais padrões emergiram,
quais convenções de rota foram adotadas.

Passo 3 — Extrair padrões para skills/app-designer/
Criar sub-skills baseadas em decisões reais:
- screen.md: como especificar uma tela (com exemplos reais da primeira tela)
- layout.md: estrutura de página confirmada
- flow.md: padrões de navegação

Passo 4 — Extrair padrões para skills/app-dev-react/
Criar sub-skills baseadas em implementação real:
- Como estruturar pages/ e features/
- Como usar componentes DS em contexto de produto
- Padrões de estado e dados

Passo 5 — Ativar agentes
Testar os agentes App com tarefas reais. Ajustar skills conforme necessário.
Registrar a ativação no pipeline-state.md com Assumption.
```

### Tratamento pelo Orchestrator durante período de espera

Quando qualquer tarefa de App chegar ao Orchestrator:

```
⛔ Domínio App não está operacional.
"O domínio App está estruturado mas ainda não tem skills preenchidas.
Para ativar: construir primeira tela real → documentar decisões →
preencher skills. Ver .ai/status/BACKLOG.md — alta prioridade."
```

---

## 19. Arquitetura de tokens do DS

### Os três tiers

O sistema de tokens do iGreen DS segue uma arquitetura em 3 camadas com separação
estrita de responsabilidades:

**Tier 1 — Primitivos (API privada)**
```
tokens/primitives/
├── color-palette.ts  ← escalas OKLCH: brand/neutral/success/warning/danger/info
├── scales.ts         ← valores numéricos base (4, 8, 12, 16...)
├── fonts.ts          ← definições de fonte
└── motion.ts         ← valores de duração e easing
```
Primitivos são a matéria-prima. Nunca são usados diretamente em componentes.
São a API privada do sistema de tokens.

**Tier 2 — Semânticos (API pública via CSS vars)**
```
tokens/semantic/
├── color-light.ts    ← bg.*, fg.*, border.*, ring.*, overlay.* para light mode
├── color-dark.ts     ← os mesmos tokens, valores para dark mode
├── spacing.ts        ← gap.*, space.*, pad.*
├── sizing.ts         ← layout.*, icon.*
├── shape.ts          ← radius.*
├── elevation.ts      ← shadow.*
└── typography.ts     ← presets compostos
```
Tokens semânticos têm significado — `bg.primary` não é "esta cor específica",
é "o fundo da cor primária da marca". O valor pode mudar (rebranding), a semântica
não muda. Esta é a API pública que componentes usam.

**Tier 2.5 — Tokens de componente**
```
tokens/components/
├── sizing.ts   ← form.* (heights por tamanho), layout.* (navbar, sidebar, containers)
│               ← icon.* (sizes de ícone)
└── spacing.ts  ← padCard.* (padding de card), padPage.* (padding de página)
```
Tokens específicos de padrões de UI recorrentes. Garantem que todo card usa o mesmo
padding, toda form input usa o mesmo height.

**O fluxo de transformação:**
```
color-light.ts
    ↓
to-tailwind-v4.ts (transform)
    ↓
src/styles/theme/tailwind-theme.css (gerado)
    ↓ (CSS variables: --color-bg-primary: oklch(...))
Tailwind v4 (classes: bg-bg-primary { background: var(--color-bg-primary) })
    ↓
button.styles.ts: "bg-bg-primary text-fg-on-primary"
    ↓
<Button> renderizado com cor correta
```

**Regra de ouro:**
Componente NUNCA importa primitivos ou tokens semânticos diretamente.
Componente SEMPRE usa classes CSS geradas (`bg-bg-primary`, `gap-gp-md`, etc.).

### Prefixos anti-colisão com Tailwind nativo

Os tokens DS usam prefixos específicos para evitar conflito com classes Tailwind:

| Tipo | Prefixo DS | Classes Tailwind proibidas |
|------|-----------|---------------------------|
| Gap | `gap-gp-*` | gap-4, gap-6, gap-8 |
| Spacing genérico | `p-sp-*` | p-4, p-6, p-8 |
| Padding componente | `px-pad-*` | px-3, px-4, px-6 |
| Border radius | `rounded-radius-*` | rounded-sm, rounded-md, rounded-lg |
| Shadow | `shadow-sh-*` | shadow-sm, shadow-md, shadow-lg |
| Form height | `min-h-form-*` | h-9, h-10, h-11 |
| Icon size | `size-icon-*` | size-5, w-5 h-5 |
| Container | `max-w-container-*` | max-w-sm, max-w-2xl |

A assumption por trás desses prefixos: o Tailwind nativo tem valores diferentes
dos tokens DS (gap-4 do Tailwind = 16px; gap.md do DS = 8px). Usar Tailwind literal
quebraria a consistência visual mesmo que parecesse "equivalente".

---

## 20. Como adaptar para outro projeto

### Princípios que se transferem (independente de DS)

1. **Separar quem especifica de quem implementa.** Qualquer projeto com decisões
   de produto + implementação técnica se beneficia desta separação. O Gate pode ser
   aplicado a qualquer decisão de alto impacto.

2. **Assumption em toda decisão importante.** Não é específico de DS. Qualquer
   projeto onde decisões têm vida longa e efeitos difusos (arquitetura, produto,
   processo) se beneficia de registrar o "o que precisa ser verdade" de cada decisão.

3. **Loop de lições.** Qualquer sistema que usa IA de forma repetitiva pode ter
   um `lessons.md`. O padrão de "erro → lição → regra carregada automaticamente"
   funciona para qualquer domínio.

4. **Contexto mínimo por tarefa.** Skills segregadas por sub-tarefa reduzem custo
   de tokens e melhoram precisão em qualquer projeto suficientemente complexo para
   ter mais de um "tipo" de trabalho (especificação vs implementação vs revisão).

### Passo a passo para adaptar

**Passo 1 — Definir os agentes para o seu domínio**

Faça as seguintes perguntas:
- Quem especifica o que vai ser construído?
- Quem implementa o que foi especificado?
- Quem valida que a implementação está correta?
- Quem orquestra o fluxo entre os outros?

Esses quatro papéis se traduzem em quatro agentes (Orchestrator + Specifier + Implementer + Reviewer). Em projetos menores, pode-se começar com três (sem Orchestrator separado).

**Passo 2 — Criar CLAUDE.md**

Estrutura mínima:
```markdown
# [Projeto]

## Checklist de abertura
1. Ler este arquivo
2. Verificar pipeline-state.md — há tarefa pendente?
3. Perguntar: qual o foco desta sessão?

## Checklist de encerramento
1. pipeline-state.md atualizado?
2. Tarefa incompleta? Marcar como PAUSADO.
3. Erro novo identificado? Registrar em lessons.md.

## Regras de comportamento
[4-6 regras absolutas específicas do projeto]

## Mapa de tarefas → skill
[tabela: tipo de tarefa | arquivo a editar | skill do agente]
```

**Passo 3 — Criar pipeline-state.md**

Campos obrigatórios em toda entrada:
- Input, Output, Decisões, **Assumption**

O Assumption é inegociável — é o que torna o sistema utilizável no longo prazo.

**Passo 4 — Criar ds-standards.md (ou equivalente) em .claude/rules/**

Conteúdo: resumo executivo de regras, mapa de skills, código proibido/obrigatório
para o domínio. Deve ser pequeno e denso — é o único arquivo sempre no contexto.

**Passo 5 — Segregar skills**

Estrutura por agente:
```
.claude/skills/
├── specifier/
│   ├── SKILL.md         ← router + core
│   ├── spec-tipo-a.md
│   └── spec-tipo-b.md
├── implementer/
│   ├── SKILL.md
│   ├── impl-tipo-a.md
│   └── impl-tipo-b.md
└── reviewer/
    ├── SKILL.md
    └── review-tipo-a.md
```

**Passo 6 — Criar lessons.md**

Começa vazio. Primeira lição = primeiro erro que o Reviewer encontra. O sistema
começa a acumular aprendizado imediatamente com o uso.

**Passo 7 — Definir o Gate**

Decida quais decisões requerem aprovação humana. Regra geral: decisões que:
- Têm vida longa (vão persistir por meses/anos)
- Têm efeito difuso (afetam muitas outras coisas)
- São difíceis de reverter

Para um produto: novas features, mudanças de fluxo principal.
Para um DS: tokens e componentes novos.
Para uma API: contratos de endpoint, schemas de banco de dados.

### Estrutura mínima para começar

```
projeto/
├── CLAUDE.md                          ← regras + mapa
├── .claude/
│   ├── rules/
│   │   └── standards.md               ← auto-carregado, resumo executivo
│   ├── agents/
│   │   ├── orchestrator.md
│   │   ├── specifier.md
│   │   ├── implementer.md
│   │   └── reviewer.md
│   └── skills/
│       ├── specifier/
│       │   └── SKILL.md
│       ├── implementer/
│       │   └── SKILL.md
│       └── reviewer/
│           └── SKILL.md
└── .ai/
    ├── status/
    │   ├── pipeline-state.md          ← audit log, começar vazio
    │   └── lessons.md                 ← começar vazio
    └── context/                       ← referências sob demanda
```

Tempo estimado para configurar: 2-4 horas. O sistema começa a se pagar
na primeira sessão em que o Reviewer encontra um padrão de erro e o converte em lição.

---

## Apêndice — Glossário de termos do sistema

| Termo | Definição |
|-------|-----------|
| **Gate** | Pausa obrigatória para aprovação humana antes da implementação |
| **Assumption** | Campo obrigatório em todo registro: "o que precisa ser verdade para esta decisão estar certa" |
| **Cascata** | Protocolo ativado quando dependência ausente é detectada durante implementação |
| **Cascata cross-domínio** | Cascata que cruza do domínio App para o domínio DS |
| **Idempotência** | Verificação se tarefa já foi concluída antes de iniciar |
| **Critique genuína** | Teste do Reviewer: "encontrei algo que muda a direção, ou apenas confirmei?" |
| **Perspectiva Strategist** | Campos obrigatórios na spec: alternativas descartadas + assumption central |
| **REVIEW_OK** | Sinal de aprovação emitido pelo DS Reviewer |
| **IMPL_PRONTA** | Sinal de handoff emitido pelo DS Dev para o DS Reviewer |
| **SPEC_PRONTA** | Sinal de handoff emitido pelo DS Designer para o Orchestrator/Gate |
| **Rollback** | Processo de retorno ao DS Dev após reprovação do DS Reviewer |
| **Skills segregadas** | Sistema de sub-arquivos de skill para contexto mínimo por tarefa |
| **Append-only** | Característica do pipeline-state.md: entradas nunca são deletadas |
| **Loop de lições** | Ciclo: erro → L-NNN em lessons.md → resumo em ds-standards.md → próxima sessão |
| **Thin pointer** | Arquivo de agente em agents/ com escopo mínimo que aponta para skills ricas |
| **Context mínimo** | Princípio de carregar apenas o contexto relevante à tarefa atual |
| **Domínio DS** | Pipeline de Design System — tokens e componentes |
| **Domínio App** | Pipeline de produto — telas e features (pendente) |

---

*Documento mantido em `igreen-ds/PIPELINE.md`*
*Atualizar quando houver mudanças estruturais no sistema de agentes ou no pipeline.*
*Última atualização: Abril 2026 — versão pós-reestruturação completa.*
