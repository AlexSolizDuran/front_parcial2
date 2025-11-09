// src/lib/apiProxy.ts
import { NextRequest, NextResponse } from "next/server";

export async function proxyToBackend(
  req: NextRequest,
  endpoint: string
): Promise<NextResponse> {
  try {
    const token = req.cookies.get("jwt-token")?.value;
    if (!token) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    const backendUrl = `${process.env.API_URL}/${endpoint}${queryString}`;

    const headers: HeadersInit = {
      Authorization: `Bearer ${token}`,
    };
    const options: RequestInit = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      const incomingContentType = req.headers.get("Content-Type");

      if (incomingContentType?.includes("application/json")) {
        const body = await req.json();
        options.body = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      } else if (incomingContentType?.includes("multipart/form-data")) {
        options.body = await req.formData();
      } else {
        options.body = req.body;
        if (incomingContentType) {
          headers["Content-Type"] = incomingContentType;
        }
      }
    }

    const res = await fetch(backendUrl, options);

    // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---

    // 1. Manejar 204 (No Content) - Éxito sin cuerpo
    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    // 2. Intentar leer la respuesta como texto
    const responseText = await res.text();

    // 3. Si el texto está vacío, devolver un JSON de error genérico
    if (!responseText) {
      const errorMsg = `Error ${res.status}: La respuesta del backend vino vacía.`;
      console.error(`Error proxy a ${endpoint}:`, errorMsg);
      // Devolvemos el status original del backend (ej. 500)
      return NextResponse.json({ message: errorMsg }, { status: res.status });
    }

    // 4. Si el texto NO está vacío, intentar parsearlo como JSON
    try {
      const data = JSON.parse(responseText);
      // Éxito: devolver el JSON del backend
      return NextResponse.json(data, { status: res.status });
    } catch (parseError) {
      // 5. Fallo de parseo: El backend devolvió HTML/Texto (probablemente un error)
      console.error(`Error proxy a ${endpoint}: El backend no devolvió JSON. Contenido:`, responseText);
      return NextResponse.json(
        // Devuelve el texto del error del backend, es más útil
        { message: responseText },
        { status: res.status } 
      );
    }
    
  } catch (err: any) {
    console.log(err);
    console.error(`Error proxy a ${endpoint}:`, err);
    return NextResponse.json(
      { message: "Error interno del servidor", error: err.message },
      { status: 500 }
    );
  }
}