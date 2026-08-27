/**
 * Prompts prontos pra colar no Claude Code — FONTE ÚNICA.
 *
 * Moram aqui, e não na página, porque são citados em DUAS: a Início (`LandingDoc`) e a
 * Installation. Duplicar um texto de 50 linhas em dois arquivos é como as coisas divergem
 * neste repo — aconteceu com as skills (repo × payload) e com a doc que ensinava a CLI
 * `@0.1.0`. Editando aqui, as duas mudam juntas.
 */

/* ═════════════════════════════════════════════════════════════════════════════
   Prompts — o atalho de quem usa Claude Code

   Dois trabalhos diferentes, dois prompts: INSTALAR (uma vez) e CONSTRUIR (o
   primeiro pedido de verdade). O de construir é um PEDIDO-EXEMPLO — menu com 3
   categorias + um cadastro completo — escrito NA VOZ DE UM USUÁRIO, de
   propósito: zero nome de componente (nada de AppShell/DataTable/drawer) e
   zero seção "como fazer". As nuances que guiam a IA ficam em linguagem de
   gente ("sem recarregar a página" → renderLink; "dá pra filtrar por status"
   → filtro nativo; "painel lateral com o formulário" → drawer + FormField), e
   o COMO é papel do kit (ds:link / scaffold copiam .claude/) — a única menção
   técnica é o próprio ds:link, pra IA saber que os comandos e padrões vêm
   dele. Até 2026-08-21 este card carregava o dump técnico inteiro; o operador
   não-técnico colava e recebia perguntas sobre alias e tv() em vez de uma
   tela. Não reintroduza nomes de componente aqui: quem sabe o nome não
   precisa do prompt, e quem precisa do prompt não sabe o nome.
   ═════════════════════════════════════════════════════════════════════════════ */

export const PROMPT_INSTALAR = `Instale o iGreen Design System neste projeto como submódulo git e configure tudo. Não me pergunte nada que você possa verificar no repositório.

1. Adicione o submódulo:
   git submodule add https://github.com/igreenlab/igreen-desingsystem-admin design-system
   git submodule update --init --recursive
   ⛔ NÃO rode npm install dentro de design-system/. Você não builda o DS, e um segundo
   node_modules cria uma cópia extra de React — "Invalid hook call" em qualquer componente
   com hook, além de erros de tipo por dois @types/react no mesmo programa. As dependências
   vão na RAIZ (passo 2).

2. Instale na RAIZ as dependências de runtime — o submódulo entrega código-fonte, não pacote:
   npm i tailwind-variants tailwind-merge clsx lucide-react @radix-ui/react-dialog @radix-ui/react-slot
   Componente novo pede mais (@tanstack/react-virtual no DataTable, recharts no Chart,
   @dnd-kit no Kanban, cmdk no Combobox). O erro do bundler diz exatamente qual falta.

3. Configure DOIS aliases, não um — no tsconfig E no bundler:
     "@ds" → design-system/src   (o que EU uso nos imports)
     "@"   → design-system/src   (o que o DS usa INTERNAMENTE, em 700 imports)
   Sem o segundo, o build quebra no primeiro componente: Cannot find module '@/utils/tv'.
   No tsconfig, paths RELATIVOS e SEM baseUrl (removido no TypeScript 7):
     "paths": { "@ds/*": ["./design-system/src/*"], "@/*": ["./design-system/src/*"] }
   No vite, use import.meta.dirname (não __dirname, que não existe em ESM) e acrescente
   resolve.dedupe: ["react", "react-dom"].
   Se este projeto já usa "@/" pro código dele, renomeie o dele (ex.: "@app/*") e me avise.

4. Importe o tema UMA vez no CSS de entrada, DEPOIS do @import "tailwindcss":
   @import "../design-system/src/styles/theme/tailwind-theme.css";
   Não precisa de @source: o submódulo está dentro da raiz, então o scan do
   Tailwind já o alcança.

5. Copie as fontes Geist. Sem isso a falha é SILENCIOSA: o dev server devolve o index.html
   no lugar do .woff2 e os 27 presets caem em system-ui, sem erro no console.
   mkdir -p public/fonts && cp design-system/public/fonts/*.woff2 public/fonts/

6. Se eu for usar marca diferente da default, importe também o overlay
   design-system/src/styles/theme/brand-<id>.css DEPOIS do tema base, e aplique
   data-theme="<id>" no <html>. Importar o CSS sem o atributo é no-op silencioso.

7. Rode o ds-link, que é o que dá kit de IA pro projeto:
   npm --prefix design-system run ds:link
   Ele copia skills/commands/rules pro .claude/ daqui e escreve
   .claude/ds-config.json com mode:"submodule". Reinicie o Claude Code em seguida —
   slash command só é registrado no início da sessão, então /ds-create-crud,
   /ds-create-list e /ds-create-dashboard só aparecem depois do restart.

8. VALIDE com os QUATRO checks antes de dizer que acabou. O Button sozinho NÃO basta: ele
   não usa hook nenhum, então renderiza certo mesmo com React duplicado no bundle.
   a) Button: confirme cor E spacing/radius (só a cor = tema não importado).
   b) Um componente com hook/context — AppShell, FloatingPanel ou DataTable — renderizando
      sem "Invalid hook call". É este check que prova que não há React duplicado.
   c) document.fonts.check("16px Geist") === true. Status HTTP não serve: o dev server
      devolve 200 com o index.html para arquivo inexistente.
   d) npx tsc --noEmit limpo na raiz.

Regras: nunca edite arquivos dentro de design-system/ — é submódulo, e customização
acontece na composição, no meu projeto. Ao atualizar, use git submodule update --remote
--merge e commite o ponteiro — NÃO git pull --recurse-submodules, que só refaz o checkout
do commit que o pai já registra. Depois re-rode o ds:link.`;

export const PROMPT_CONSTRUIR = `Monte um sistema com o iGreen Design System: a estrutura de navegação e uma primeira tela funcionando de verdade.

O que eu quero ver:

1. Um menu lateral com 3 categorias, cada uma com 2 ou 3 itens:
   - Cadastros: Clientes · Fornecedores · Produtos
   - Operações: Pedidos · Faturas
   - Relatórios: Visão geral · Exportações
   (pode trocar os nomes pelo meu negócio se eu disser qual é)

2. Cada item do menu abre uma tela própria, sem recarregar a página.
   Só a tela de CLIENTES nasce pronta — as outras ficam com um aviso
   simples de "em construção", pra eu ir pedindo uma por vez depois.

3. Clientes é uma tela de cadastro completa:
   - uma tabela com as colunas nome, e-mail, cidade, status e criado em
   - dá pra filtrar por status, buscar e passar de página
   - um botão "Novo cliente" abre um painel lateral com o formulário
   - cada linha tem ações de editar e excluir
   - use dados de exemplo (uns 30 registros), que depois eu troco pelos reais

Observação: este projeto deve ter o kit de IA do design system instalado —
se ainda não tiver, rode o ds:link dele antes de começar. Com o kit, os
comandos e padrões do sistema já vêm prontos: siga o que ele manda e não
invente componente ou estilo por fora.

No final, me mostre o sistema rodando: o menu navegando nas 3 categorias e
o cadastro de Clientes criando, editando e excluindo.`;

/**
 * ATUALIZAR — o 3º prompt, e o que mais precisava existir.
 *
 * Atualizar é a operação que quebra projeto, não a de instalar: você troca código que já
 * está em uso. Então o prompt é escrito como AUDITORIA — mede antes, lê o changelog, mede
 * depois e compara. Sem a medição ANTES, qualquer erro que já existia no projeto vira
 * suspeita de ter vindo da atualização, e a pessoa reverte um update que estava correto.
 *
 * Duas regras que o prompt carrega de propósito, porque são as que a IA quebra sozinha:
 * (1) nunca editar arquivo dentro do DS pra fazer o app compilar — o conserto é na
 * composição, e no submódulo a edição some no próximo pull; (2) parar e relatar quando o
 * changelog diz BREAKING, em vez de adaptar por conta.
 */
export const PROMPT_ATUALIZAR = `Atualize o iGreen Design System neste projeto, com auditoria. Não me pergunte nada que você possa verificar no repositório, e não altere nada antes de terminar o passo 2.

1. DESCUBRA o canal (pode ser mais de um):
   - existe .igreen-ds/manifest.json na raiz?      -> copy-in
   - .gitmodules aponta pro igreen-desingsystem?   -> submódulo
   - @snksergio/design-system no package.json?     -> npm

2. MEÇA O ANTES e me mostre a tabela (isto é o passo mais importante — sem ele, erro que já
   existia vai parecer causado pela atualização):
   - versão/rev atual de cada canal:
       copy-in    -> npm run igreen:drift        (e npm run doctor)
       npm        -> npm ls @snksergio/design-system  +  npm view @snksergio/design-system version
       submódulo  -> git submodule status  +  git -C <dsPath> log --oneline -1
   - baseline de saúde: npx tsc --noEmit e npm run build. ANOTE os erros que JÁ existem.
     Se algo já está quebrado, diga isso agora — não conserte junto com a atualização.

3. LEIA O CHANGELOG antes de tocar em qualquer coisa, e me diga o que muda entre a minha
   versão e a última:
   - submódulo -> <dsPath>/src/preview/pages/updates-data.ts (está no disco, leia direto)
   - npm/copy-in -> https://igreen-desingsystem-admin.vercel.app/#/updates
   Liste só o que me afeta: componente que eu uso, token renomeado, prop removida, mudança
   de comportamento. Se houver BREAKING no caminho, PARE aqui e me mostre — eu decido.

4. ATUALIZE, um canal por vez, na ordem que você achou:
   copy-in:    npm run igreen:update -- --all        (pula o que EU editei; não use --force
               sem me perguntar) e depois npm run doctor; se o doctor acusar cn/tv defasado,
               npm run igreen:update -- utils tv --force
   npm:        npm i @snksergio/design-system@latest
   submódulo:  git submodule update --remote --merge, commitar o ponteiro, e depois
               npm --prefix <dsPath> run ds:link. NÃO use git pull --recurse-submodules:
               ele só refaz o checkout do commit que o pai já registra
               (o ds:link é obrigatório: sem ele o código novo entra e as skills continuam
                ensinando o padrão antigo)

5. VALIDE e COMPARE com o baseline do passo 2:
   - npx tsc --noEmit  -> me mostre só os erros NOVOS
   - npm run build
   - suba o dev server e confira no browser: um componente com hook (AppShell, DataTable ou
     FloatingPanel) renderizando sem Invalid hook call, e document.fonts.check("16px Geist")
     === true
   - se eu uso marca não-default, confirme que o data-theme continua no <html> e que o
     overlay entra DEPOIS do theme.css

REGRAS:
- NUNCA edite arquivo dentro do DS (submódulo ou node_modules) pra fazer o app compilar. O
  conserto é no MEU código; no submódulo a sua edição some no próximo pull.
- Se algo quebrar por mudança do DS, PARE e me mostre o que quebrou e o que o changelog diz.
  Não adapte por conta própria.
- Reinicie o Claude Code no fim se o kit de IA mudou: slash command só registra no início da
  sessão.

No fim, me dê uma linha por canal: versão antes -> versão depois, e o que mudou que me afeta.`;

export const PROMPTS = [
  {
    id: "instalar",
    label: "Instalar o DS",
    resumo: "Cole uma vez, no projeto vazio",
    texto: PROMPT_INSTALAR,
  },
  {
    id: "construir",
    label: "Construir telas",
    resumo: "Pedido-exemplo: shell + CRUD",
    texto: PROMPT_CONSTRUIR,
  },
  {
    id: "atualizar",
    label: "Atualizar o DS",
    resumo: "Auditoria: mede, lê o changelog, valida",
    texto: PROMPT_ATUALIZAR,
  },
] as const;
