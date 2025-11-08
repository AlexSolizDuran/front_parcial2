import { proxyToBackend } from "@/lib/proxyRequest";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest): Promise<NextResponse> {
  // Assuming the backend endpoint is 'stock/prodVariante'
  return proxyToBackend(req, "stock/prodVariante");
}

export const GET = handler;
export const POST = handler;
