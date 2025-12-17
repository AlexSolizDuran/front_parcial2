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
  
  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const backendUrl = `${process.env.API_URL}/${endpoint}/${id}${queryString}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  const fetchOptions: RequestInit = {
    method: req.method,
    headers: headers,
  };

  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
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

    // 4. Mejorado: Manejo robusto de la respuesta
    // Si la respuesta es 204 (No Content), no hay cuerpo, devolvemos éxito vacío.
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // Leemos la respuesta como texto primero, para evitar errores de JSON
    const responseText = await res.text();

    // Si la respuesta es exitosa pero no hay texto (raro, pero posible)
    if (res.ok && !responseText) {
      return NextResponse.json({}, { status: res.status });
    }

    // Si no es exitosa (ej. 500 de Spring Boot) y no hay texto
    if (!res.ok && !responseText) {
      return NextResponse.json(
        { message: `Error ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    // Ahora SÍ intentamos parsear como JSON
    try {
      const data = JSON.parse(responseText);
      // Éxito: devolvemos el JSON de Spring Boot
      return NextResponse.json(data, { status: res.status });
    } catch (parseError) {
      // El backend (Spring) devolvió un error 500 con HTML, no JSON.
      // Devolvemos el texto HTML/plano como mensaje de error.
      return NextResponse.json(
        { message: responseText },
        { status: res.status }
      );
    }
  } catch (err: any) {
    // 5. Esto ahora capturará errores de red (ej. Spring Boot caído)
    console.error(`Error proxy a ${endpoint}/${id}:`, err.message);
    return NextResponse.json(
      { message: "Error al conectar con el backend", detail: err.message },
      { status: 502 } // 502 Bad Gateway es más apropiado
    );
  }
}
