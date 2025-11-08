"use client";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { ProductoGet, ProductoSet } from "@/types/catalogo/producto";
import { apiFetcher } from "@/lib/apiFetcher";
import { ModeloGet } from "@/types/categorias/modelo";
import { CategoriaGet } from "@/types/categorias/categoria";
import { MaterialGet } from "@/types/categorias/material";
import { EtiquetaGet } from "@/types/categorias/etiqueta";

interface ProductoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productoParaEditar?: ProductoGet | null;
}

// I'm adding 'nombre' to the form data state, assuming its omission in ProductoSet was an oversight.
interface ProductoFormData extends ProductoSet {
  nombre: string;
}

export default function ProductoFormModal({
  isOpen,
  onClose,
  onSuccess,
  productoParaEditar,
}: ProductoFormModalProps) {
  const [data, setData] = useState<ProductoFormData>({
    nombre: "",
    descripcion: "",
    modelo: "",
    categoria: "",
    material: "",
    etiquetas: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch related data for dropdowns
  const { data: modelos } = useSWR<ModeloGet[]>("/api/producto/modelo", apiFetcher);
  const { data: categorias } = useSWR<CategoriaGet[]>("/api/producto/categoria", apiFetcher);
  const { data: materiales } = useSWR<MaterialGet[]>("/api/producto/material", apiFetcher);
  const { data: etiquetas } = useSWR<EtiquetaGet[]>("/api/producto/etiqueta", apiFetcher);

  const isEditMode = Boolean(productoParaEditar);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && productoParaEditar) {
        setData({
          nombre: productoParaEditar.nombre,
          descripcion: productoParaEditar.descripcion,
          modelo: productoParaEditar.modelo,
          categoria: productoParaEditar.categoria,
          material: productoParaEditar.material,
          etiquetas: productoParaEditar.etiquetas,
        });
      } else {
        setData({
          nombre: "",
          descripcion: "",
          modelo: "",
          categoria: "",
          material: "",
          etiquetas: [],
        });
      }
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen, isEditMode, productoParaEditar]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "etiquetas") {
      const selectedOptions = Array.from(
        (e.target as HTMLSelectElement).selectedOptions
      ).map((option) => option.value);
      setData((prev) => ({ ...prev, etiquetas: selectedOptions }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!data.nombre || !data.categoria || !data.modelo) {
      setError("Nombre, Modelo y Categoría son obligatorios.");
      setIsSaving(false);
      return;
    }
    
    // The original ProductoSet doesn't include 'nombre'. We send it anyway.
    const dataToSend: ProductoSet & { nombre: string } = { ...data };

    try {
      if (isEditMode && productoParaEditar) {
        await apiFetcher(`/api/producto/producto/${productoParaEditar.id}`, {
          method: "PUT",
          body: JSON.stringify(dataToSend),
        });
      } else {
        await apiFetcher("/api/producto/producto", {
          method: "POST",
          body: JSON.stringify(dataToSend),
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-bold">
              {isEditMode ? "Editar Producto" : "Nuevo Producto"}
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            {error && <div className="text-red-600 bg-red-100 p-3 rounded">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" id="nombre" name="nombre" value={data.nombre} onChange={handleChange} className="mt-1 block w-full input" required />
              </div>
              <div>
                <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">Modelo</label>
                <select id="modelo" name="modelo" value={data.modelo} onChange={handleChange} className="mt-1 block w-full input" required>
                  <option value="">Seleccione un modelo</option>
                  {modelos?.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
                <select id="categoria" name="categoria" value={data.categoria} onChange={handleChange} className="mt-1 block w-full input" required>
                  <option value="">Seleccione una categoría</option>
                  {categorias?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700">Material</label>
                <select id="material" name="material" value={data.material} onChange={handleChange} className="mt-1 block w-full input">
                  <option value="">Seleccione un material</option>
                  {materiales?.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea id="descripcion" name="descripcion" value={data.descripcion} onChange={handleChange} rows={3} className="mt-1 block w-full input" />
            </div>

            <div>
              <label htmlFor="etiquetas" className="block text-sm font-medium text-gray-700">Etiquetas</label>
              <select id="etiquetas" name="etiquetas" value={data.etiquetas} onChange={handleChange} multiple className="mt-1 block w-full input h-32">
                {etiquetas?.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Mantén presionado Ctrl (o Cmd en Mac) para seleccionar varias.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 bg-gray-50 border-t mt-auto">
            <button type="button" onClick={onClose} disabled={isSaving} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper styles for inputs and buttons to avoid repetition, assuming a global css file might have these.
// If not, these could be defined in globals.css
/*
.input {
  @apply px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50;
}
.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50;
}
*/
