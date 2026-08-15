import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { registry } from "../../registry-data";

// Compara hashes de tamanho FIXO (32 bytes), não as strings cruas. Comparar as
// strings exigiria um `if (a.length !== b.length) return false` antes (senão o
// timingSafeEqual dá throw), e esse early-return é ele mesmo um oráculo de
// timing pro TAMANHO do token — justo a classe de vazamento que esta função
// existe pra fechar. Com SHA-256 dos dois lados não há caminho curto nem throw.
function safeEqual(a: string, b: string): boolean {
  const digest = (s: string) => createHash("sha256").update(s, "utf8").digest();
  return timingSafeEqual(digest(a), digest(b));
}

// Força a rota a ser SEMPRE dinâmica e nunca cacheável no edge. Sem isso, o CDN
// da Vercel poderia cachear um 200 autorizado com Cache-Control public e servi-lo
// a requisições SEM token (cache-poisoning) → furo de auth. Toda resposta também
// carrega `Cache-Control: no-store` explicitamente.
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const NO_STORE = { "Cache-Control": "no-store, max-age=0, must-revalidate" };

/**
 * GET /r/<item>.json — serve o JSON do item do registry com auth Bearer.
 *
 * O JSON vem do embed `app/registry-data.ts` (NÃO de public/) — arquivos em
 * public/ são servidos pelo edge FORA do route handler e furariam a auth. Por
 * isso o registry-app não tem diretório public/.
 *
 * Sem IGREEN_TOKEN no ambiente ou header errado → 401. Item inexistente → 404.
 *
 * O lookup usa `Object.hasOwn` porque o embed é um object literal e HERDA
 * Object.prototype: `registry["__proto__"]` devolvia Object.prototype (200 com
 * `{}`) e `registry["constructor"]` devolvia a função Object, que o
 * NextResponse.json não serializa → exceção não tratada = 500 no endpoint.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const token = process.env.IGREEN_TOKEN; // lido em runtime, não no build
  const auth = req.headers.get("authorization") ?? "";
  if (!token || !safeEqual(auth, `Bearer ${token}`)) {
    return new NextResponse("Unauthorized", { status: 401, headers: NO_STORE });
  }
  const { name } = await params;
  const key = name.replace(/\.json$/, "");
  const items = registry as Record<string, unknown>;
  if (!Object.hasOwn(items, key)) {
    return new NextResponse("Not found", { status: 404, headers: NO_STORE });
  }
  const item = items[key];
  return NextResponse.json(item, { headers: NO_STORE });
}
