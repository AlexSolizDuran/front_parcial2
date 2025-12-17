import { proxyById } from "@/lib/proxyById";
import { NextRequest } from "next/server";

async function handler(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  // The backend endpoint is 'api/pronostico'
  return proxyById(req, ctx, "api/pronostico");
}
export const GET = handler;
