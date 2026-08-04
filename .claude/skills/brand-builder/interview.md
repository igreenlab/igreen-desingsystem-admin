# Fase 1 — Entrevista

Objetivo: sair daqui sabendo **a cor**, **o quanto a marca tinge** e **quem consome**.
Máximo 4 perguntas por rodada. Se o usuário trouxe handoff, use-o pra pré-preencher e
só confirme o que ficou ambíguo.

## Pergunta 1 — a cor (obrigatória)

> "Qual a cor da marca? (hex, ou a rampa se você já tiver)"

Aceite: hex único, rampa de 11 shades, link de gerador (ex.: uicolors.app), ou
tokens.json. Com **hex único** você deriva a rampa na Fase 2.

Registre também o **nome de exibição** (`label` do `BRANDS` e do prompt do CLI) —
"iGreen Vibrant", "Azul", "Pay". Curto: aparece em dropdown.

## Pergunta 2 — escopo do tingimento (obrigatória, e a que mais muda o trabalho)

> "A marca muda **só a cor de marca** (botões, links, foco) ou também os **neutros**
> — fundo, superfícies, bordas, texto?"

| Resposta | Consequência |
|---|---|
| só a marca | overlay pequeno (~15-25 vars). `gray` da default. 1-2h. |
| marca + neutros | overlay grande (~60-120 vars). Rampa `gray` própria, e provavelmente uma `grayDark` separada. É o caso da `vibrant` e da `pay`. |

Não adivinhe: um overlay que muda `bg.canvas` sem o usuário esperar é a diferença
entre "tema novo" e "o app inteiro ficou diferente".

## Pergunta 3 — status colors

> "As cores de status (sucesso/aviso/erro/info) acompanham a marca ou ficam as
> padrão?"

Opções que aparecem na prática:
- **ficam padrão** → não entram no diff, overlay menor
- **harmonizadas** → mesma "energia" da marca, cada uma preservando sua identidade
  (o amarelo continua amarelo, mas mais vibrante). Foi o pedido da `vibrant`.
- **`success` = a marca** → comum quando a marca já é verde. Alias, não rampa nova.

## Pergunta 4 — canais

> "Essa marca vai pro pacote npm e pro CLI (projeto novo já nasce com ela), ou é
> interna do showcase?"

Default: **tudo** (é o que a Definição de Pronto cobre). Se for interna, ainda gere
o overlay e registre em `useBrand`, mas pule `exports`/`registry`/CLI — e **diga
isso no PR**, senão parece esquecimento.

## O que NÃO perguntar

- Valor de shade individual ("qual o 300?") — isso é derivação, Fase 2.
- Nome de token semântico — a nomenclatura é do DS, não escolha da marca.
- Dark mode sim/não — **sempre** os dois modos. Marca com um modo só é marca quebrada.

## Saída da fase

Um bloco assim, que alimenta a Fase 2:

```
id:        vibrant
label:     iGreen Vibrant
cor:       #0fff00 (rampa de 11 fornecida no handoff)
tinge:     marca + neutros (light já fechado; dark ancorado em #242424)
status:    harmonizadas; success = a marca
canais:    npm + CLI + registry + showcase
handoff:   D:\...\theme\ (BRIEF.md + tokens.json + THEME.md)
```
