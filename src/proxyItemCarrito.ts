import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

/**
 * Proxy para /venta/iteamcarrito/[id]
 * Maneja PUT (actualizar cantidad) y DELETE (quitar item)
 */
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return proxyById(req, ctx, "venta/itemcarrito");
}

export const PUT = handler;
export const DELETE = handler;