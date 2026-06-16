import { NextResponse } from "next/server";
import { registry } from "../../registry-data";

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
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const token = process.env.IGREEN_TOKEN; // lido em runtime, não no build
  const auth = req.headers.get("authorization") ?? "";
  if (!token || auth !== `Bearer ${token}`) {
    return new NextResponse("Unauthorized", { status: 401, headers: NO_STORE });
  }
  const { name } = await params;
  const key = name.replace(/\.json$/, "");
  const item = (registry as Record<string, unknown>)[key];
  if (!item) {
    return new NextResponse("Not found", { status: 404, headers: NO_STORE });
  }
  return NextResponse.json(item, { headers: NO_STORE });
}
