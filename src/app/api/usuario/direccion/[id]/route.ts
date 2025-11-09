import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

/**
 * Proxy para PUT /usuario/direccion/[id]
 */
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return proxyById(req, ctx, "usuario/direccion");
}

export const PUT = handler;