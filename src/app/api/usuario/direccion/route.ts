import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para POST /usuario/direccion
 */
async function handler(req: NextRequest): Promise<NextResponse> {
  return proxyToBackend(req, "usuario/direccion");
}

export const POST = handler;