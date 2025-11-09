import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

// Proxy para GET /inventario/prod-variante/producto/[id]
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return proxyById(req, ctx, "inventario/prod-variante/producto");
}

export const GET = handler;