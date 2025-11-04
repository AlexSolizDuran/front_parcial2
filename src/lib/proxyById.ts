// src/lib/proxyById.ts
import { NextRequest, NextResponse } from "next/server";

export async function proxyById(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
  endpoint: string
) {
  // Obtener id desde params
  const { id } = await params;

  if (!id)
    return NextResponse.json(
      { message: "ID no especificado" },
      { status: 400 }
    );

  const token = req.cookies.get("jwt-token")?.value;
  if (!token)
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const backendUrl = `${process.env.API_URL}/${endpoint}/${id}/`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: headers,
  };

  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.body) {
    const incomingContentType = req.headers.get("Content-Type");

    if (incomingContentType?.includes("application/json")) {
      // Caso JSON
      const body = await req.json();
      fetchOptions.body = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    } else if (incomingContentType?.includes("multipart/form-data")) {
      // Caso FormData
      fetchOptions.body = await req.formData();
      // NO establecer Content-Type
    } else {
      // Otro tipo de body
      fetchOptions.body = req.body;
      if (incomingContentType) {
        headers["Content-Type"] = incomingContentType;
      }
    }
  }

  try {
    const res = await fetch(backendUrl, fetchOptions);

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error(`Error proxy a ${endpoint}/${id}:`, err);
    return NextResponse.json({ message: `${err}` }, { status: 500 });
  }
}
