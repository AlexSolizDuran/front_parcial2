"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetcher } from "@/lib/apiFetcher";
import {
  Loader2,
  Lock,
  Mail,
  User,
  Phone,
  LogInIcon,
} from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // 1. Validar contraseña
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setIsLoading(false);
      return;
    }

    // 2. Preparar datos para la API
    // (Omitimos confirmPassword, la API no lo necesita)
    const { confirmPassword, ...dataToSubmit } = formData;

    try {
      // 3. Llamar a nuestra *propia* API route
      await apiFetcher("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(dataToSubmit),
      });

      // 4. Éxito: Redirigir al login
      // Opcional: mostrar un mensaje de éxito antes de redirigir
      router.push("/login?status=success");
    } catch (err: any) {
      // 5. Mostrar error del backend
      setError(err.message || "Ocurrió un error inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (
    id: keyof typeof formData,
    label: string,
    type: string,
    Icon: React.ElementType,
    placeholder: string,
    required = true
  ) => (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Icon className="h-5 w-5 text-gray-400" />
        </span>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={id}
          required={required}
          disabled={isLoading}
          value={formData[id]}
          onChange={handleChange}
          className="block w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 shadow-sm 
                     focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500
                     disabled:opacity-50"
          placeholder={placeholder}
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Crea tu cuenta
          </h1>
          <p className="mt-2 text-slate-500">
            Regístrate para empezar a comprar.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {renderInput("nombre", "Nombre", "text", User, "Tu nombre")}
              {renderInput(
                "apellido",
                "Apellido",
                "text",
                User,
                "Tu apellido"
              )}
            </div>

            {renderInput(
              "username",
              "Username",
              "text",
              LogInIcon,
              "Tu nombre de usuario"
            )}
            {renderInput(
              "email",
              "Email",
              "email",
              Mail,
              "tu@correo.com"
            )}
            {renderInput(
              "telefono",
              "Teléfono (Opcional)",
              "tel",
              Phone,
              "Tu teléfono",
              false
            )}
            {renderInput(
              "password",
              "Contraseña",
              "password",
              Lock,
              "Tu contraseña"
            )}
            {renderInput(
              "confirmPassword",
              "Confirmar Contraseña",
              "password",
              Lock,
              "Repite tu contraseña"
            )}

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
                    Registrando...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-medium text-amber-600 hover:text-amber-500"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}