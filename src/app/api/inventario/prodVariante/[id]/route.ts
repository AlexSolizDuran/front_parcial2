import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // The user specified the backend endpoint is 'inventario/prodVariante'
  return proxyById(req, ctx, "inventario/prod-variante");
}
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
