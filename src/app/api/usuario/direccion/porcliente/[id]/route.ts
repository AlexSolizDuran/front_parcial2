import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

/**
 * Proxy para /usuario/direccion/porcliente/[id]
 */
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return proxyById(req, ctx, "usuario/direccion/porcliente");
}

export const GET = handler;