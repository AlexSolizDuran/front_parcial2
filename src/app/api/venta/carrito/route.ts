import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

// Proxy para POST /venta/carrito
async function handler(req: NextRequest): Promise<NextResponse> {
  return proxyToBackend(req, "venta/carrito");
}

export const POST = handler;