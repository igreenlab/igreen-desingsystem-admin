# iGreen Design System — Como funciona a distribuição

> Documento de apresentação. Explica **como o Design System chega nos projetos**,
> **como funciona o versionamento** e **por que escolhemos esse caminho**.
> Escrito pra dev entender a fundo e pra pessoal de produto (com um pouco de dev)
> acompanhar. Sem enrolação técnica desnecessária.

---

## 1. Resumo em 30 segundos

O iGreen DS é uma **biblioteca de componentes e tokens** (botões, tabelas, cores,
espaçamentos…) que vários projetos vão consumir. Em vez de virar um "pacote" fechado,
ele entrega o **código-fonte de cada componente direto pro projeto** que consome — o
componente vira **código do próprio projeto**, editável. Isso é servido por um
**catálogo online (registry)** na Vercel, e um **CLI** cria projetos novos já conectados.
Há **uma versão única** pro sistema inteiro; cada projeto atualiza **quando quiser**.

Resultado: o time tem **liberdade pra customizar telas** sem brigar com a biblioteca, e
o mantenedor cuida de **um repositório só**, sem a burocracia de publicar pacote a cada
mudança.

---

## 2. O problema que estamos resolvendo

Vários produtos da iGreen precisam das **mesmas peças visuais** (a mesma cara: verde da
marca, mesma tabela, mesmos formulários). Sem um Design System, cada time recria tudo —
inconsistência, retrabalho, bug repetido.

Mas tem um detalhe: nossos produtos são **CRMs/operações com telas muito sob medida**.
Cada projeto precisa **ajustar** os componentes pro caso dele. Então a pergunta foi:

> Como compartilhar as peças **mantendo a consistência**, mas **sem engessar** quem consome?

---

## 3. A decisão: "copy-in" via registry (não pacote npm)

Existem dois jeitos clássicos de distribuir uma biblioteca de UI:

| | **Pacote npm** (jeito "fechado") | **Copy-in via registry** (nosso jeito) |
|---|---|---|
| Como chega | `npm install` — vem pronto, dentro de `node_modules` | o **código é copiado** pro projeto (`src/`) |
| Quem pode editar | ninguém (é "lacrado") | o time **edita à vontade** (é código dele) |
| Atualização | automática, mas **arriscada** (muda pra todo mundo de uma vez) | **opt-in** — cada projeto atualiza quando quiser |
| Manutenção pro mantenedor | pesada: build de pacote, semver rígido, coordenar quebras | leve: **um repositório**, publica no catálogo |

**Analogia:** não entregamos o **prato pronto** (pacote), entregamos a **receita** —
o time copia pra cozinha dele e adapta o tempero. A consistência vem da receita; a
liberdade vem de ser código deles.

**Por que copy-in venceu pro nosso caso:** telas sob medida exigem editar componentes;
e queremos que a **IA do consumidor copie e adapte** os exemplos. Com pacote npm, o
código fica trancado em `node_modules` — nada disso funcionaria. (O custo do copy-in é
que a atualização é manual/opt-in — e isso é justamente o que dá segurança.)

> Esse mecanismo é o mesmo do **shadcn/ui** (padrão de mercado pra isso). Não inventamos
> a roda — usamos um padrão consolidado.

---

## 4. Como funciona, na prática (o fluxo)

```
   FONTE (código real)          PUBLICAÇÃO              CONSUMO
   ──────────────────          ───────────             ───────
   src/  (componentes,    →    catálogo online    →    projeto do time
   tokens, exemplos)           (registry/Vercel)        (copia pro src/ dele)

   você edita aqui             servido com senha         npm run igreen:add
        │                                                       │
        └──── /ds-release ────► merge no Git ────► Vercel publica sozinha
```

Passo a passo:
1. **Fonte:** todo componente vive em `src/` no repositório do DS. **É a única fonte
   de verdade.**
2. **Lista (registry):** um arquivo (`registry.json`) diz quais itens existem e quais
   arquivos cada um usa.
3. **Build:** um comando lê essa lista, pega os arquivos reais e gera um "pacotinho
   JSON" por componente.
4. **Catálogo online:** esses JSON ficam num site na **Vercel** (com senha/token), que é
   de onde os projetos baixam.
5. **Consumo:** no projeto do time, `npm run igreen:add -- button` baixa e **copia o
   código** pro `src/` dele.
6. **Publicação:** quando damos **merge** no repositório, a **Vercel republica o catálogo
   sozinha**. Sem deploy manual.

---

## 5. As peças (o que é cada coisa)

| Peça | O que é | Em uma frase |
|---|---|---|
| **Registry** | site na Vercel que serve o código (com token) | "o balcão de entrega" — de onde o código é copiado |
| **Catálogo visual** | o preview público (este styleguide) | "a vitrine" — onde se **vê** os componentes rodando |
| **CLI** | um comando `npx …` que cria projeto novo | "o kit de montar a cozinha do cliente do zero" |
| **Kit do consumidor** | guias + automações que vão junto no projeto | "o manual + assistente" pra IA montar telas no padrão |

> Detalhe técnico (pode pular): há uma pasta `dist-lib` no repositório que é **sobra** de
> uma tentativa antiga de virar pacote npm. Ela **não participa** da distribuição atual —
> está depreciada. O registry lê **sempre a fonte real (`src/`)**, nunca essa sobra.

---

## 6. Versionamento (como as versões funcionam)

- **Existe uma versão única pro DS inteiro** (hoje, por exemplo, `0.10.0`). Não é uma
  versão por componente — é **uma só**, que vale pra todos.
- Quando lançamos, **cada componente recebe um "carimbo" com essa versão** — inclusive
  o tema e os tokens. Ou seja: **cores, espaçamentos e temas também são versionados.**

**Como sobe uma versão nova (lado do DS):**
```
edita componente/token → /ds-release → (sobe o número + changelog + republica) → merge → Vercel publica
```
Um comando só (`/ds-release`) cuida de: subir o número, registrar a mudança no histórico
("Updates"), reconstruir o catálogo e abrir o pedido de publicação.

**Como cada projeto "anda" de versão (lado do consumidor):**
- **Pra frente:** `npm run igreen:update` — pega o novo e **protege o que o time editou**.
- **Pra trás / componente a componente:** como o código é do projeto, o time usa o **Git
  dele** — pode voltar **um componente específico** (ex.: reverter só a pasta do botão)
  sem afetar os outros. Um "manifesto" anota, por componente, de qual versão veio.

> ⚠️ Importante (pra não criar expectativa errada): o catálogo serve **só a versão atual**.
> Não dá pra pedir "a versão antiga do botão" direto do catálogo — voltar é via Git do
> projeto. Versão histórica por-componente seria uma evolução futura.

---

## 7. Por que a IA do consumidor não bagunça o padrão

Como o código vira do time, em tese alguém (ou a IA dele) poderia mexer nos tokens e
quebrar o visual. Pra evitar isso **sem trabalho recorrente**, todo projeto novo já nasce
com 3 camadas de proteção:

1. **Orientação:** um guia (`DESIGN.md`) + regras que a IA lê automaticamente.
2. **Trava automática:** um "guarda" que **bloqueia** edição do tema/tokens/fundação
   (o que quebraria tudo) e **avisa** ao editar um componente.
3. **Detecção:** um comando que avisa se algo foi alterado fora do padrão.

A regra de ouro pro consumidor: **customize na composição da sua tela** (escolhendo
variantes e classes), **não** mexendo nos tokens do sistema.

E mais: o projeto nasce com um **assistente de telas** — o time pede em português
("monte uma tabela de produtos", "uma tela de edição") e a IA monta seguindo o padrão,
reaproveitando exemplos de produção.

---

## 8. Por que essas escolhas (o racional, resumido)

| Escolha | Por quê |
|---|---|
| **Copy-in, não npm** | telas sob medida precisam editar; IA precisa copiar/adaptar. npm trancaria o código. |
| **Registry (Vercel)** | servir o código de forma central e privada, atualizando sozinho no merge. |
| **Versão única (não por componente)** | simplicidade pra um mantenedor só; menos cerimônia. (Per-componente fica pra depois, se precisar.) |
| **CLI + kit no projeto** | quem instala já começa produtivo, com IA que entende o padrão — sem ler manual técnico. |
| **Proteção por "guarda" (hook)** | impossível trancar arquivo (é código do time); então a gente **orienta + avisa + detecta**, sem manutenção. |

---

## 9. Perguntas comuns (FAQ)

**É um pacote npm?** Não. O único `npx` é o CLI que cria o projeto. Os componentes são
copiados (copy-in), não instalados como dependência.

**Se eu editar um componente, perco na próxima atualização?** Não. A atualização
**protege edições locais** (pula o que você mexeu) — ou você decide sobrescrever.

**Tokens e tema são versionados?** Sim — junto com tudo, pelo carimbo da versão global.

**Consigo voltar a versão de um componente só?** Sim, **no seu projeto, via Git** (é seu
código). Do catálogo, não — ele só tem a versão atual.

**Quem aprova/publica?** O mantenedor: toda release passa por revisão e merge no Git;
a Vercel publica automaticamente depois.

---

## 10. Glossário rápido

- **Registry** — catálogo online que serve o código dos componentes.
- **Copy-in** — modelo onde o código é **copiado** pro projeto (vira código dele), em vez
  de instalado como pacote.
- **Token** — valor de design reutilizável (uma cor, um espaçamento, um tamanho).
- **Stamp (carimbo)** — a marca de versão em cada item do registry.
- **CLI** — comando que cria um projeto novo já conectado ao DS.
- **Drift** — quando o código local "descolou" do padrão (editado ou defasado).
- **`/ds-release`** — o comando único que fecha uma versão e publica.

---

*Fonte de verdade técnica: a página **Distribution** no catálogo do DS e o
`README-PIPELINE-WORKFLOW.md`. Este documento é a versão de apresentação.*
