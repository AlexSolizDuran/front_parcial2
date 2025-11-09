import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest): Promise<NextResponse> {
  // The user specified the backend endpoint is 'inventario/prodVariante'
  return proxyToBackend(req, "inventario/prod-variante");
}

export const GET = handler;
export const POST = handler;
