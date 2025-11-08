"use client";
import React, { useState, useEffect } from "react";
import { TallaGet, TallaSet } from "@/types/categorias/talla";
import { apiFetcher } from "@/lib/apiFetcher";

interface TallaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tallaParaEditar?: TallaGet | null;
}

export default function TallaFormModal({
  isOpen,
  onClose,
  onSuccess,
  tallaParaEditar,
}: TallaFormModalProps) {
  const [data, setData] = useState<TallaSet>({
    talla: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(tallaParaEditar);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && tallaParaEditar) {
        setData({ talla: tallaParaEditar.talla });
      } else {
        setData({ talla: "" });
      }
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, isEditMode, tallaParaEditar]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!data.talla.trim()) {
      setError("El talla es obligatorio.");
      setIsSaving(false);
      return;
    }

    try {
      if (isEditMode && tallaParaEditar) {
        await apiFetcher(`/api/inventario/talla/${tallaParaEditar.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
      } else {
        await apiFetcher("/api/inventario/talla", {
          method: "POST",
          body: JSON.stringify(data),
        });
      }
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
              {isEditMode ? "Editar Talla" : "Nueva Talla"}
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
                htmlFor="talla"
                className="block text-sm font-medium text-gray-700"
              >
                talla
              </label>
              <input
                type="text"
                id="talla"
                name="talla"
                value={data.talla}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
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
