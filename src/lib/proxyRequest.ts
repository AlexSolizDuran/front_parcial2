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

    // Solo agregar body si no es GET
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      const incomingContentType = req.headers.get("Content-Type");

      if (incomingContentType?.includes("application/json")) {
        // Caso JSON: Parsear y stringify
        const body = await req.json();
        options.body = JSON.stringify(body);
        headers["Content-Type"] = "application/json";
      } else if (incomingContentType?.includes("multipart/form-data")) {
        // Caso FormData: Pasar el FormData directamente.
        // NO agregamos Content-Type a 'headers', fetch() lo hará por nosotros
        // con el 'boundary' correcto.
        options.body = await req.formData();
      } else {
        // Otro tipo de body (ej. text/plain), pasarlo como stream
        options.body = req.body;
        if (incomingContentType) {
          headers["Content-Type"] = incomingContentType;
        }
      }
    }

    const res = await fetch(backendUrl, options);
    if (res.status === 204) {
      // Devolver una respuesta vacía real con status 204
      return new NextResponse(null, { status: 204 });
    }

    const data = await res.json();
    // Reenviar la respuesta del backend (sea éxito o error) al cliente
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.log(err);
    console.error(`Error proxy a ${endpoint}:`, err);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
