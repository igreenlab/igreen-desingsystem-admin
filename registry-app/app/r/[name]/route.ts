import { NextResponse } from "next/server";
import { registry } from "../../registry-data";

const TOKEN = process.env.IGREEN_TOKEN;

/**
 * GET /r/<item>.json — serve o JSON do item do registry com auth Bearer.
 * Sem IGREEN_TOKEN no ambiente ou header errado → 401. Item inexistente → 404.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const auth = req.headers.get("authorization") ?? "";
  if (!TOKEN || auth !== `Bearer ${TOKEN}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { name } = await params;
  const key = name.replace(/\.json$/, "");
  const item = (registry as Record<string, unknown>)[key];
  if (!item) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(item);
}
