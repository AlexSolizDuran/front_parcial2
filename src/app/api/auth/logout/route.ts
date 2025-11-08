import { NextResponse } from "next/server";

/**
 * Endpoint para cerrar sesión.
 * Su única función es decirle al navegador que elimine
 * la cookie de sesión HttpOnly.
 */
export async function POST() {
  try {
    // 1. Crear una respuesta de éxito
    const response = NextResponse.json(
      { message: "Cierre de sesión exitoso" },
      { status: 200 }
    );

    // 2. ¡El paso clave!
    // Establecer la cookie con el mismo nombre y ruta,
    // pero con maxAge: 0 para que expire inmediatamente.
    response.cookies.set("jwt-token", "", {
      httpOnly: true,
      secure: true,
      path: "/", // ¡Debe coincidir con la ruta de la cookie de login!
      sameSite: "lax",
      maxAge: 0, // <-- Esto le dice al navegador que la elimine
    });

    return response;

  } catch (error: any) {
    console.error("Error en /api/logout:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
