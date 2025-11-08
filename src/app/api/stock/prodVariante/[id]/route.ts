import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // Assuming the backend endpoint is 'stock/prodVariante'
  return proxyById(req, ctx, "stock/prodVariante");
}
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
