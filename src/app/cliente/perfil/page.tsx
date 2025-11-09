"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioGet } from "@/types/usuario/usuarioGet";
import { DireccionGet, DireccionSet } from "@/types/usuario/direccion";
import { Loader2, Save, Home, MapPin, Building } from "lucide-react";

type FormState = Omit<DireccionSet, "usuarioId">;

export default function PerfilPage() {
  const [user, setUser] = useState<UsuarioGet | null>(null);
  const [direccionId, setDireccionId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormState>({
    departamento: "",
    zona: "",
    calle: "",
    numeroCasa: "",
    referencia: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Obtener el ID del usuario desde localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        setUser(JSON.parse(storedUserData));
      } catch (e) {
        console.error("Error al parsear userData", e);
      }
    }
  }, []);

  // 2. Usar SWR para obtener la dirección existente del usuario
  const userId = user?.id;
  const {
    data: direccionData,
    error: swrError,
    mutate,
  } = useSWR<DireccionGet[]>(
    userId ? `/api/usuario/direccion/porcliente/${userId}` : null,
    apiFetcher
  );

  // 3. Cuando SWR carga los datos, rellenar el formulario
  useEffect(() => {
    if (direccionData && direccionData.length > 0) {
      const direccion = direccionData[0];
      setFormData({
        departamento: direccion.departamento,
        zona: direccion.zona,
        calle: direccion.calle,
        numeroCasa: direccion.numeroCasa,
        referencia: direccion.referencia,
      });
      setDireccionId(direccion.id); // Guardamos el ID de la dirección
    }
  }, [direccionData]);

  // 4. Manejador del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 5. Manejador de envío (Submit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // No debería pasar si está en esta página

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const dataSet: DireccionSet = {
      ...formData,
      usuarioId: parseInt(user.id), // Añadimos el usuarioId
    };

    try {
      let url = "/api/usuario/direccion";
      let method = "POST";

      // Si ya teníamos un ID de dirección, es una ACTUALIZACIÓN (PUT)
      if (direccionId) {
        url = `/api/usuario/direccion/${direccionId}`;
        method = "PUT";
      }

      const result: DireccionGet = await apiFetcher(url, {
        method: method,
        body: JSON.stringify(dataSet),
      });

      // Actualizar el estado local
      setDireccionId(result.id);
      mutate(); // Re-validar los datos con SWR
      setSuccess("¡Dirección guardada con éxito!");
    } catch (err: any) {
      setError(err.message || "Error al guardar la dirección.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    // Muestra un loader mientras se obtiene el usuario de localStorage
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:p-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">
          Mi Perfil
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Hola, {user.nombre}. Aquí puedes actualizar tu dirección de envío.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {renderInput(
              "departamento",
              "Departamento",
              formData.departamento,
              handleChange,
              MapPin
            )}
            {renderInput(
              "zona",
              "Zona / Barrio",
              formData.zona,
              handleChange,
              Building
            )}
          </div>

          {renderInput(
            "calle",
            "Calle / Avenida",
            formData.calle,
            handleChange,
            Home
          )}
          {renderInput(
            "numeroCasa",
            "N° de Casa / Depto.",
            formData.numeroCasa,
            handleChange,
            Home,
            false
          )}

          <div>
            <label
              htmlFor="referencia"
              className="block text-sm font-medium text-gray-700"
            >
              Referencia (Opcional)
            </label>
            <textarea
              id="referencia"
              name="referencia"
              rows={3}
              value={formData.referencia}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ej: Casa color verde, al lado de la tienda..."
            />
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {direccionId ? "Actualizar Dirección" : "Guardar Dirección"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente helper para no repetir código de inputs
const renderInput = (
  id: string,
  label: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  Icon: React.ElementType,
  required = true
) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative mt-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Icon className="h-5 w-5 text-gray-400" aria-hidden="true" />
      </div>
      <input
        type="text"
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      />
    </div>
  </div>
);