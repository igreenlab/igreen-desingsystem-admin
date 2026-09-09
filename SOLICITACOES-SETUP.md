# Pedidos de componente — como o endpoint funciona e como reconstruí-lo

A página `#/solicitar-componente` do showcase grava e lê pedidos numa planilha do
Google, através de um **Apps Script publicado como Web App**. Não há banco, não há
backend nosso e não há custo.

> ⚠️ **Por que este arquivo existe.** O código do endpoint vive na conta Google do
> mantenedor, fora deste repositório e fora de qualquer backup do time. Sem esta cópia,
> perder o acesso àquela conta significaria não conseguir nem consertar nem recriar a
> funcionalidade. Este arquivo é a única fonte versionada do endpoint — **mantenha-o em
> sync se editar o script**.

---

## Arquitetura

```
página do showcase  ──POST──▶  Apps Script (Web App)  ──▶  planilha do Google
(SolicitarComponenteDoc)  ◀──GET───                    ◀──
```

| Peça | Onde vive | Dono |
|---|---|---|
| Página | `src/preview/pages/SolicitarComponenteDoc.tsx` | repositório |
| Endpoint (Apps Script) | conta Google do mantenedor | ⚠️ pessoal |
| Planilha | Drive do mantenedor | ⚠️ pessoal |
| URL do endpoint | constante `ENDPOINT` na página, sobreponível por `VITE_SOLICITACOES_URL` | repositório |

A URL do endpoint **é pública por construção** — qualquer valor na página acaba no
bundle, que é servido em texto puro. Não é segredo e não deve ser tratado como um. A
proteção contra abuso está no próprio script (§ Proteções).

---

## Colunas da planilha

O script cria a aba `solicitacoes` sozinho, com este cabeçalho:

| Coluna | Preenchida por | Sai no GET? |
|---|---|---|
| `data` | script | ✅ |
| `nome` `assunto` `descricao` `tipo` `projeto` `referencia` | quem faz o pedido | ✅ |
| `status` | **você, na mão** — vira o Badge do card | ✅ |
| `oculto` | **você, na mão** — qualquer conteúdo remove o item da lista **sem apagar a linha** | ❌ |
| `notas` | **você, na mão** — anotação privada | ❌ **nunca sai** |

> É por isso que usamos Apps Script em vez de publicar a planilha: publicar exporia a
> planilha **inteira**. Aqui o `doGet` monta a resposta coluna por coluna, então `notas`
> e `oculto` nunca deixam o servidor.

**Gerenciar pedidos = escrever na planilha.** Marcar como feito, recusar, esconder — tudo
sem tocar em código e sem deploy.

### A coluna `status` e as cores

Todo card mostra um badge, sempre. Com `status` vazio ele exibe **`Aberto`** — não existe
card sem marcador, porque a fila fica ilegível quando metade tem badge e metade não.

O texto é livre; a **cor** sai de um casamento por trecho, não por valor exato:

| Se o texto contiver | Cor |
|---|---|
| *(vazio)* → exibe `Aberto` | 🟠 âmbar |
| `análise` · `analis` · `avaliando` · `andamento` · `fazendo` | 🔵 azul |
| `feito` · `pronto` · `entregue` | 🟢 verde |
| `recusado` · `cancelado` | 🔴 vermelho |
| qualquer outra coisa | ⚪ neutro |

Ou seja: `Feito na v0.62` fica verde, `Em análise` fica azul, `Recusado — usar DataList`
fica vermelho.

**Por que `Aberto` é âmbar e não neutro:** é o único estado que pede ação **sua** — ninguém
triou o pedido ainda. Em neutro ele sumia no card, e a fila inteira ficava sem nenhum ponto
de atenção. Assim que você escreve qualquer coisa na coluna, o âmbar sai.

**Escrever algo que não bate em nada não quebra nada** — cai no neutro. É proposital: a
planilha é editável na mão, e um valor novo não pode nem derrubar a tela nem inventar uma
semântica de cor que ninguém pediu.

### E a coluna `tipo`

Vira um segundo chip, com ícone e **forma retangular** — o status é pílula. As duas formas
existem pra separar à vista o que **muda** (status) do que **descreve** (tipo); sem isso,
dois chips coloridos lado a lado viram uma faixa só. Cor: verde para `componente novo`,
azul para `ajuste`, neutro para o resto.

---

## Proteções

| Proteção | O que evita |
|---|---|
| **Injeção de fórmula** | texto começando com `=`, `+`, `-` ou `@` é prefixado com apóstrofo. Sem isso, `=IMPORTXML(...)` num campo executaria **quando você abrisse a planilha**, com a sua sessão, exfiltrando as outras células |
| **Campo-armadilha** (`website`) | bot que preenche tudo. O script responde `ok` e descarta em silêncio, pra não ensinar o bot a contornar |
| **Deduplicação** | mesmo nome + assunto em 5 minutos |
| **Freio de rajada** | mais de 10 envios em 60 segundos |
| **Limite de tamanho** | campos truncados; descrição em 4000 caracteres |
| **`LockService`** | dois envios simultâneos disputando a mesma linha |

---

## Recriar do zero

1. Criar uma planilha em branco (`sheets.new`) e copiar o **ID** da URL, entre `/d/` e `/edit`.
2. `script.google.com` → projeto novo → colar o código abaixo → preencher `PLANILHA_ID`.
3. **Implantar → Nova implantação → App da Web**, com *Executar como: **Eu*** e
   *Quem tem acesso: **Qualquer pessoa*** (não "com Conta do Google" — essa exige login e
   o showcase não conseguiria ler).
4. Autorizar. O aviso de "app não verificado" é esperado: o script é seu.
5. Copiar a URL `/exec` e pôr em `VITE_SOLICITACOES_URL` ou na constante `ENDPOINT` da página.

### ⚠️ Três armadilhas que custaram tempo na primeira instalação

**1. `getActiveSpreadsheet()` não funciona em Web App.** Acessado anonimamente não existe
planilha "ativa" — a chamada devolve `null`. Funciona quando você roda pelo editor e falha
publicado, que é o modo de falha mais confuso possível. Por isso o código usa
`openById(PLANILHA_ID)`.

**2. Salvar não publica.** Uma implantação publicada é **imutável**: serve para sempre a
versão carimbada nela. Depois de editar, é
**Implantar → Gerenciar implantações → ✏️ → Versão: *Nova versão* → Implantar**. Manter o
número da versão atual não republica nada, e o botão parece ter funcionado.
A URL `/dev` (Implantar → Testar implantações) sempre serve o último código **salvo** — use-a
para separar "meu código está errado" de "minha publicação não pegou".

**3. O POST tem que ir como `text/plain`.** Apps Script não responde a preflight `OPTIONS`.
Com `application/json` o navegador manda preflight, não recebe resposta e a requisição morre
antes de sair. `text/plain` é um Content-Type "safelisted" e não dispara preflight — o corpo
continua sendo JSON.

---

## Código do endpoint

Cole isto inteiro no editor do Apps Script.

```js
/**
 * Endpoint de solicitações de componente — iGreen Design System.
 * Cópia versionada. A fonte executável vive no Apps Script do mantenedor.
 */

/** ⚠️ PREENCHA: o ID da planilha, entre /d/ e /edit na URL dela. */
const PLANILHA_ID = "COLE_O_ID_DA_PLANILHA_AQUI";

const ABA = "solicitacoes";

const COLUNAS = [
  "data", "nome", "assunto", "descricao", "tipo",
  "projeto", "referencia", "status", "oculto", "notas",
];

/** O que o GET devolve. Não inclui `oculto` nem `notas`. */
const COLUNAS_PUBLICAS = [
  "data", "nome", "assunto", "descricao", "tipo",
  "projeto", "referencia", "status",
];

const OBRIGATORIOS = ["nome", "assunto", "descricao"];

const LIMITES = {
  nome: 80, assunto: 120, descricao: 4000,
  tipo: 40, projeto: 80, referencia: 500,
};

const JANELA_DUPLICADO_MS = 5 * 60 * 1000;
const MAX_POR_MINUTO = 10;

function doGet() {
  try {
    const aba = pegarAba();
    const valores = aba.getDataRange().getValues();
    if (valores.length < 2) return responder({ ok: true, itens: [] });

    const cabecalho = valores[0].map(String);
    const idx = {};
    cabecalho.forEach(function (nome, i) { idx[nome] = i; });

    const itens = [];
    for (let l = 1; l < valores.length; l++) {
      const linha = valores[l];
      if (String(linha[idx["oculto"]] || "").trim() !== "") continue;

      const item = {};
      COLUNAS_PUBLICAS.forEach(function (col) {
        const valor = linha[idx[col]];
        item[col] = valor instanceof Date
          ? valor.toISOString()
          : (valor === null || valor === undefined ? "" : String(valor));
      });
      itens.push(item);
    }

    itens.reverse();
    return responder({ ok: true, itens: itens });
  } catch (err) {
    return responder({ ok: false, erro: "falha_leitura", detalhe: motivo(err) });
  }
}

function doPost(e) {
  const trava = LockService.getScriptLock();
  try {
    if (!trava.tryLock(10000)) return responder({ ok: false, erro: "ocupado" });

    let corpo;
    try {
      corpo = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    } catch (_) {
      return responder({ ok: false, erro: "json_invalido" });
    }

    // Campo-armadilha: responde ok e NÃO grava.
    if (String(corpo.website || "").trim() !== "") return responder({ ok: true });

    const dados = {};
    Object.keys(LIMITES).forEach(function (campo) {
      dados[campo] = limpar(corpo[campo], LIMITES[campo]);
    });

    for (let i = 0; i < OBRIGATORIOS.length; i++) {
      const campo = OBRIGATORIOS[i];
      if (!dados[campo]) {
        return responder({ ok: false, erro: "campo_obrigatorio", campo: campo });
      }
    }

    const aba = pegarAba();
    const valores = aba.getDataRange().getValues();
    const agora = Date.now();

    if (valores.length > 1) {
      const cabecalho = valores[0].map(String);
      const cData = cabecalho.indexOf("data");
      const cNome = cabecalho.indexOf("nome");
      const cAssunto = cabecalho.indexOf("assunto");

      let noUltimoMinuto = 0;
      for (let l = valores.length - 1; l >= 1; l--) {
        const bruto = valores[l][cData];
        const t = bruto instanceof Date ? bruto.getTime() : 0;
        if (!t) continue;
        if (agora - t > 60 * 1000) break;
        noUltimoMinuto++;

        const mesmoNome =
          String(valores[l][cNome] || "").trim().toLowerCase() === dados.nome.toLowerCase();
        const mesmoAssunto =
          String(valores[l][cAssunto] || "").trim().toLowerCase() === dados.assunto.toLowerCase();
        if (mesmoNome && mesmoAssunto && agora - t < JANELA_DUPLICADO_MS) {
          return responder({ ok: false, erro: "duplicado" });
        }
      }

      if (noUltimoMinuto >= MAX_POR_MINUTO) {
        return responder({ ok: false, erro: "muitos_envios" });
      }
    }

    const linha = COLUNAS.map(function (col) {
      if (col === "data") return new Date();
      return neutralizarFormula(dados[col] || "");
    });

    aba.appendRow(linha);
    return responder({ ok: true });
  } catch (err) {
    return responder({ ok: false, erro: "falha_gravacao", detalhe: motivo(err) });
  } finally {
    try { trava.releaseLock(); } catch (_) {}
  }
}

function pegarAba() {
  // openById, NÃO getActiveSpreadsheet — ver armadilha 1 acima.
  const planilha = SpreadsheetApp.openById(PLANILHA_ID);
  let aba = planilha.getSheetByName(ABA);
  if (!aba) {
    aba = planilha.insertSheet(ABA);
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
  }
  return aba;
}

/** Preserva \t e \n: a descrição é multi-linha. */
function limpar(valor, max) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return texto
    .replace(/\r\n/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, max);
}

/** Injeção de fórmula — ver § Proteções. */
function neutralizarFormula(texto) {
  return /^[=+\-@\t\r]/.test(texto) ? "'" + texto : texto;
}

function motivo(err) {
  return String((err && err.message) || err).slice(0, 200);
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## Códigos de erro

| `erro` | Significa | A página mostra |
|---|---|---|
| `campo_obrigatorio` | falta nome, assunto ou descrição | "Preencha os campos obrigatórios." |
| `duplicado` | mesmo nome + assunto em 5 min | "Esse pedido já entrou há pouco" |
| `muitos_envios` | mais de 10 em 60s | "Tente de novo em um minuto" |
| `ocupado` | `LockService` não liberou | "servidor ocupado" |
| `json_invalido` | corpo malformado | genérica |
| `falha_leitura` / `falha_gravacao` | exceção no script — vem com `detalhe` | genérica |
