import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

// Proxy para POST /venta/iteamcarrito
// (Tu backend dice 'iteamcarrito', lo ideal sería 'itemcarrito')
async function handler(req: NextRequest): Promise<NextResponse> {
  return proxyToBackend(req, "venta/iteamcarrito");
}

export const POST = handler;