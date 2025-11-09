// src/app/api/venta/iteamcarrito/[id]/route.ts
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
  // Asegúrate de que el endpoint sea "venta/iteamcarrito"
  return proxyById(req, ctx, "venta/itemcarrito");
}

export const PUT = handler;
export const DELETE = handler;