import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

/**
 * Proxy para /producto/producto/categoria/[id]
 * Usado para obtener productos filtrados por ID de categoría.
 */
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // Usamos el helper que ya tienes.
  // El endpoint 'producto/producto/categoria' se combinará con el [id]
  // para formar 'producto/producto/categoria/123'
  return proxyById(req, ctx, "producto/producto/categoria");
}

export const GET = handler;