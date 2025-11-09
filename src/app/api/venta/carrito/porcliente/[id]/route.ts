import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

// Proxy para GET /venta/carrito/porcliente/[id]
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return proxyById(req, ctx, "venta/carrito/porcliente");
}

export const GET = handler;