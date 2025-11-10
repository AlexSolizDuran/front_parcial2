import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return proxyById(req, ctx, "venta/venta/porcliente");
}
export const GET = handler;

