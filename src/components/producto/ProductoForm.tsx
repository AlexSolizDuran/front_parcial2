"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ProductoGet, ProductoSet } from "@/types/catalogo/producto";
import { apiFetcher } from "@/lib/apiFetcher";

import Link from "next/link";
import { FileText, Image as ImageIcon, Tag } from "lucide-react";
import FormField from "@/components/forms/FormField";
import Section from "@/components//forms/Section";
import { useModelos } from "@/hooks/useModelos";
import { useCategorias } from "@/hooks/useCategorias";
import { useMateriales } from "@/hooks/useMateriales";
import { useEtiquetas } from "@/hooks/useEtiquetas";

interface ProductoFormProps {
  productoParaEditar?: ProductoGet;
}

// State for fields that are part of the ProductoSet payload
type ProductoSetState = Omit<ProductoSet, "imagen">;

export default function ProductoForm({
  productoParaEditar,
}: ProductoFormProps) {
  const router = useRouter();

  // Separate state for 'nombre' as per user requirement
  const [nombre, setNombre] = useState("");

  const [data, setData] = useState<ProductoSetState>({
    descripcion: "",
    modelo: "",
    categoria: "",
    material: "",
    etiquetas: [],
  });

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { modelos } = useModelos();

  const { categorias } = useCategorias();

  const { materiales } = useMateriales();

  const { etiquetas } = useEtiquetas();

  const isEditMode = Boolean(productoParaEditar);

  useEffect(() => {
    if (isEditMode && productoParaEditar) {
      setNombre(productoParaEditar.nombre);
      setData({
        descripcion: productoParaEditar.descripcion,
        modelo: productoParaEditar.modelo,
        categoria: productoParaEditar.categoria,
        material: productoParaEditar.material,
        etiquetas: productoParaEditar.etiquetas,
      });
      setImagePreview(productoParaEditar.imagen || null);
    }
  }, [isEditMode, productoParaEditar]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // The validation for 'nombre' is kept for the UI, even if it's not sent.
    if (!nombre || !data.categoria || !data.modelo) {
      setError("Nombre, Modelo y Categoría son obligatorios.");
      setIsSaving(false);
      return;
    }

    const formData = new FormData();

    // Append all fields from the 'data' state, which matches ProductoSet (excluding imagen)
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "etiquetas") {
        // @ts-ignore
        formData.append(key, value);
      }
    });

    data.etiquetas.forEach((etiquetaId) => {
      formData.append("etiquetas", etiquetaId);
    });

    if (imagenFile) {
      formData.append("imagen", imagenFile);
    }

    // IMPORTANT: As per user instruction, 'nombre' is NOT appended to formData.

    try {
      const result: ProductoGet = await apiFetcher(
        isEditMode
          ? `/api/producto/producto/${productoParaEditar!.id}`
          : "/api/producto/producto",
        {
          method: isEditMode ? "PUT" : "POST",
          body: formData,
        }
      );
      router.push(`/admin/inventario/catalogo/${result.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      encType="multipart/form-data"
    >
      {error && (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section icon={<FileText size={20} />} title="Detalles del Producto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Categoría">
                <select
                  name="categoria"
                  value={data.categoria}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccione una categoría</option>
                  {categorias?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Modelo">
                <select
                  name="modelo"
                  value={data.modelo}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccione un modelo</option>
                  {modelos?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Material">
                <select
                  name="material"
                  value={data.material}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Seleccione un material</option>
                  {materiales?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="Descripción">
              <textarea
                name="descripcion"
                value={data.descripcion}
                onChange={handleChange}
                rows={5}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </FormField>
          </Section>
        </div>

        <div className="space-y-8">
          <Section icon={<ImageIcon size={20} />} title="Imagen de Muestra">
            <FormField label="Subir nueva imagen">
              <input
                type="file"
                name="imagen"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </FormField>
            <div className="mt-2 w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="h-full w-full object-contain rounded-md"
                />
              ) : (
                <span className="text-sm text-gray-500">Vista previa</span>
              )}
            </div>
          </Section>

          <Section icon={<Tag size={20} />} title="Etiquetas">
            <FormField label="Asignar etiquetas">
              <select
                name="etiquetas"
                value={data.etiquetas}
                onChange={handleChange}
                multiple
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-40"
              >
                {etiquetas?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Mantén presionado Ctrl (o Cmd) para seleccionar varias.
              </p>
            </FormField>
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Link
          href="/admin/inventario/catalogo"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
