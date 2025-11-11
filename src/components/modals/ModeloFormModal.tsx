"use client";
import React, { useState, useEffect } from "react";
import { ModeloGet, ModeloSet } from "@/types/categorias/modelo";
import { MarcaGet } from "@/types/categorias/marca";
import { apiFetcher } from "@/lib/apiFetcher";
import { useModelos } from "@/hooks/useModelos"; // Import the custom hook for modelos
import { useMarcas } from "@/hooks/useMarcas"; // Import the custom hook for marcas

interface ModeloFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcas: MarcaGet[]; // This prop is no longer needed as we fetch it inside
  onSuccess: () => void;
  modeloParaEditar?: ModeloGet | null;
}

export default function ModeloFormModal({
  isOpen,
  onClose,
  // marcas, // Removed as we fetch it inside
  onSuccess,
  modeloParaEditar,
}: ModeloFormModalProps) {
  const [data, setData] = useState<ModeloSet>({
    nombre: "",
    marcaId: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use custom hooks to get mutate function and marcas data
  const { mutateModelos: mutate } = useModelos();
  const { marcas } = useMarcas(); // Fetch marcas inside the modal

  const isEditMode = Boolean(modeloParaEditar);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && modeloParaEditar) {
        setData({
          nombre: modeloParaEditar.nombre,
          marcaId: modeloParaEditar.marcaId,
        });
      } else {
        setData({ nombre: "", marcaId: 0 });
      }
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, isEditMode, modeloParaEditar]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!data.nombre.trim() || !data.marcaId) {
      setError("El nombre y la marca son obligatorios.");
      setIsSaving(false);
      return;
    }

    try {
      if (isEditMode && modeloParaEditar) {
        await apiFetcher(`/api/producto/modelo/${modeloParaEditar.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetcher("/api/producto/modelo", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
      mutate(); // Revalidate data after successful operation
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold">
              {isEditMode ? "Editar Modelo" : "Nuevo Modelo"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </div>

          <div className="p-4 space-y-4">
            {error && (
              <div className="text-red-600 bg-red-100 p-3 rounded">{error}</div>
            )}

            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={data.nombre}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="marcaId"
                className="block text-sm font-medium text-gray-700"
              >
                Marca
              </label>
              <select
                id="marcaId"
                name="marcaId"
                value={data.marcaId}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">— Seleccione una Marca —</option>
                {marcas?.map((marca) => (
                  <option key={marca.id} value={marca.id}>
                    {marca.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
