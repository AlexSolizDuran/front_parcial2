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
  const sortedPaths = Object.keys(rolePermissions).sort(
    (a, b) => b.length - a.length
  );
  for (const pathPrefix of sortedPaths) {
    if (pathname.startsWith(pathPrefix)) {
      const typedPathPrefix = pathPrefix as keyof typeof rolePermissions;
      return rolePermissions[typedPathPrefix];
    }
  }
  return null;
}

export default async function proxy(request: NextRequest) {
  const token = request.cookies.get("jwt-token")?.value;
  const { pathname } = request.nextUrl;

  const secretString =
    process.env.JWT_SECRET ||
    "c2tWcWVGR0FxdGF4M0x6MldkOGh5YkI3Y2p4NG5MOUZpRTdNMkM4cU9IUDU0d0w=";
  const secret = Buffer.from(secretString, "base64");

  // 🔸 No hay token → redirigir o devolver 401
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const userRole = payload.role as string;

    if (!userRole) throw new Error("Token sin rol");

    const requiredRoles = getRequiredRole(pathname);
    if (requiredRoles && !requiredRoles.includes(userRole as UserRole)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { message: "Acceso denegado. Rol insuficiente." },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error de verificación de JWT:", error);

    if (pathname.startsWith("/api/")) {
      const response = NextResponse.json(
        { message: "Token inválido" },
        { status: 401 }
      );
      response.cookies.delete("jwt-token");
      return response;
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const response = NextResponse.redirect(url);
    response.cookies.delete("jwt-token");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/perfil/:path*"],
};
