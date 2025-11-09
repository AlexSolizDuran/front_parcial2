import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

// Proxy para GET /venta/iteamcarrito/porcarrito/[id]
async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  return proxyById(req, ctx, "venta/iteamcarrito/porcarrito");
}

export const GET = handler;