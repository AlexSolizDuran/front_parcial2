import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { Buffer } from "buffer";

enum UserRole {
  ADMIN = "ROLE_ADMIN",
  VENDEDOR = "ROLE_VENDEDOR",
  CLIENTE = "ROLE_CLIENTE",
}

const rolePermissions = {
  "/admin": [UserRole.ADMIN, UserRole.VENDEDOR],
  "/perfil": [UserRole.ADMIN, UserRole.VENDEDOR, UserRole.CLIENTE],
};

function getRequiredRole(pathname: string): UserRole[] | null {
  // Ordenar las rutas de más específica a más general
  const sortedPaths = Object.keys(rolePermissions).sort(
    (a, b) => b.length - a.length
  );
  for (const pathPrefix of sortedPaths) {
    if (pathname.startsWith(pathPrefix)) {
      const typedPathPrefix = pathPrefix as keyof typeof rolePermissions;
      return rolePermissions[typedPathPrefix];
    }
  }
  return null; // No se requiere rol específico (solo autenticación)
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("jwt-token")?.value;
  const { pathname } = request.nextUrl;

  const secretString =
    process.env.JWT_SECRET ||
    "c2tWcWVGR0FxdGF4M0x6MldkOGh5YkI3Y2p4NG5MOUZpRTdNMkM4cU9IUDU0d0w=";
  const secret = Buffer.from(secretString, "base64");

  // Si no hay token, redirigir a login
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 3. Si hay un token, verificamos que sea válido.
  try {
    // Usamos la clave 'secret' decodificada
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role as string;

    if (!userRole) {
      throw new Error("Token no contiene 'role'");
    }

    const requiredRoles = getRequiredRole(pathname);
    if (requiredRoles) {
      if (!requiredRoles.includes(userRole as UserRole)) {
        // ¡NO AUTORIZADO!
        // Redirigimos al usuario a una página "segura" (ej. el dashboard o /)
        // NUNCA redirigir a /login, porque el usuario SÍ está logueado.

        // Si es una API, devolvemos 403 (Forbidden)
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { message: "Acceso denegado. Rol insuficiente." },
            { status: 403 }
          );
        }

        // Si es una página, redirigir a una página de "Acceso Denegado" o al home.
        // Aquí redirigimos al home del admin (que asumimos es seguro).
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return NextResponse.next();
  } catch (error) {
    // 4. Si el token es inválido
    console.error("Error de verificación de JWT:", error);

    // Si es una llamada de API, devolvemos 401
    if (request.nextUrl.pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { message: "Token inválido" },
        { status: 401 }
      );
      response.cookies.delete("jwt-token");
      return response;
    }

    // Si es una página, redirigimos al login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.cookies.delete("jwt-token"); // Limpiamos la cookie corrupta

    return response;
  }
}

// 5. Configuración del "Matcher"
export const config = {
  matcher: ["/admin/:path*", "/perfil/:path*"],
};
