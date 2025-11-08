"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetcher } from "@/lib/apiFetcher"; // Asegúrate que la ruta sea correcta
import { Loader2, Lock, LogInIcon, Mail } from "lucide-react";

import { AuthResponse } from "@/types/auth/authResponse";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiFetcher<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (data && data.usuario) {
        const usuario = data.usuario;
        localStorage.setItem("userData", JSON.stringify(usuario));
      }
      // Si apiFetcher tiene éxito (no lanza error), redirigimos.
      if (data.usuario.rolNombre === "ROLE_CLIENTE") {
        router.push("/");
      } else {
        router.push("/admin");
      }
      // Redirige al panel principal
    } catch (err: any) {
      // Gracias a nuestro apiFetcher, err.message ya es el error del backend
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {/*  - Aquí iría el logo de tu boutique */}
          <h1 className="text-3xl font-extrabold text-slate-900">
            Boutique Admin
          </h1>
          <p className="mt-2 text-slate-500">
            Bienvenido, ingresa a tu cuenta.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo de username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700"
              >
                Username
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LogInIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="username"
                  name="username"
                  type="username"
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 shadow-sm 
                           focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500
                           disabled:opacity-50"
                  placeholder="username"
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Contraseña
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 shadow-sm 
                           focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500
                           disabled:opacity-50"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Botón de Submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-lg bg-slate-900 px-4 py-3 
                           font-semibold text-white shadow-lg transition-all duration-300 
                           hover:bg-slate-800 
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
                           disabled:cursor-not-allowed disabled:bg-slate-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar al Panel"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
