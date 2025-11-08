import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "username y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const backendLoginUrl = `${process.env.API_URL}/auth/login`;

    const backendRes = await fetch(backendLoginUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {

      return NextResponse.json(
        { message: data.message || "Error de autenticación" },
        { status: backendRes.status }
      );
    }

    const jwtToken = data.token;
    console.log("este es el data ",data)
    if (!jwtToken) {
      console.error("Éxito de backend pero no se encontró 'token' en la respuesta", data);
      return NextResponse.json(
        { message: "Error del servidor: No se pudo procesar el token" },
        { status: 500 }
      );
    }

    const responseBody = data
    
    const response = NextResponse.json(responseBody, { status: 200 });

    
    const cookies = backendRes.headers.get("Set-cookie");
    if (cookies) {
      response.headers.set("Set-cookie", cookies);
    }

    return response;

  } catch (err: any) {
    console.error("Error en el endpoint /api/auth/login:", err);
    return NextResponse.json(
      { message: "Error interno del servidor", error: err.message },
      { status: 500 }
    );
  }
}