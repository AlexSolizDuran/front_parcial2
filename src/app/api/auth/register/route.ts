import { Router } from "lucide-react";
import { routeModule } from "next/dist/build/templates/pages";
import { NextRequest, NextResponse } from "next/server";

// por defecto 2 xq siempre se reg cliente
const ROL_CLIENTE_ID = 2;

export async function POST(req: NextRequest) {
  try {
    // 1. Obtener los datos del formulario de registro
    const body = await req.json();
    const { nombre, apellido, email, username, password, telefono } = body;

    // 2. Validar que los campos básicos estén
    if (!nombre || !apellido || !email || !username || !password) {
      return NextResponse.json(
        { message: "Todos los campos obligatorios son requeridos" },
        { status: 400 }
      );
    }

    // 3. Definir la URL del backend
    const backendRegisterUrl = `${process.env.API_URL}/auth/register`;

    //Construir el DTO que espera el backend (UsuarioRequestDTO)
    const backendBody = {
      ...body,
      rolId: ROL_CLIENTE_ID,
    };

    // 5. Llamar al backend (Spring Boot)
    const backendRes = await fetch(backendRegisterUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendBody),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      // Si el backend da un error (ej: "username ya existe"), pasarlo al cliente
      return NextResponse.json(
        { message: data.message || "Error en el registro" },
        { status: backendRes.status }
      );
    }

    // 7. Éxito: Devolver la respuesta del backend (el usuario creado)
    return NextResponse.json(data, { status: 201 }); // 201 Created
  } catch (err: any) {
    console.error("Error en el endpoint /api/auth/register:", err);
    return NextResponse.json(
      { message: "Error interno del servidor", error: err.message },
      { status: 500 }
    );
  }
}