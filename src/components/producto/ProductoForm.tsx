"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ProductoGet, ProductoSet } from "@/types/catalogo/producto";
import { apiFetcher } from "@/lib/apiFetcher";
import { ModeloGet } from "@/types/categorias/modelo";
import { CategoriaGet } from "@/types/categorias/categoria";
import { MaterialGet } from "@/types/categorias/material";
import { EtiquetaGet } from "@/types/categorias/etiqueta";
import Link from "next/link";
import { FileText, Image as ImageIcon, Tag } from "lucide-react";

interface ProductoFormProps {
  productoParaEditar?: ProductoGet;
}

// Remove 'imagen' from here as it will be handled as a File
interface ProductoFormData extends Omit<ProductoSet, 'imagen' | 'etiquetas'> {
  nombre: string;
  etiquetas: string[];
  modelo: string;
  categoria: string;
  material: string;
}

export default function ProductoForm({ productoParaEditar }: ProductoFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ProductoFormData>({
    nombre: "",
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

  const { data: modelos } = useSWR<ModeloGet[]>("/api/producto/modelo", apiFetcher);
  const { data: categorias } = useSWR<CategoriaGet[]>("/api/producto/categoria", apiFetcher);
  const { data: materiales } = useSWR<MaterialGet[]>("/api/producto/material", apiFetcher);
  const { data: etiquetasData } = useSWR<EtiquetaGet[]>("/api/producto/etiqueta", apiFetcher);

  const isEditMode = Boolean(productoParaEditar);

  useEffect(() => {
    if (isEditMode && productoParaEditar) {
      setData({
        nombre: productoParaEditar.nombre,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "etiquetas") {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
      setData(prev => ({ ...prev, etiquetas: selectedOptions }));
    } else {
      setData(prev => ({ ...prev, [name]: value }));
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

    if (!data.nombre || !data.categoria || !data.modelo) {
      setError("Nombre, Modelo y Categoría son obligatorios.");
      setIsSaving(false);
      return;
    }

    const formData = new FormData();
    // Append all simple fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'etiquetas') {
        formData.append(key, value);
      }
    });
    
    // Append each etiqueta separately
    data.etiquetas.forEach(etiquetaId => {
      formData.append('etiquetas', etiquetaId);
    });

    // Append the file if a new one was selected
    if (imagenFile) {
      formData.append("imagen", imagenFile);
    } else if (isEditMode && productoParaEditar?.imagen) {
      // If not uploading a new file in edit mode, we might need to send the existing URL
      // depending on backend logic. Here we assume if no new file, we don't change the image.
      // If your backend requires the old URL, you can append it:
      // formData.append("imagenUrl", productoParaEditar.imagen);
    }

    try {
      const result: ProductoGet = await apiFetcher(
        isEditMode ? `/api/producto/producto/${productoParaEditar!.id}` : "/api/producto/producto",
        {
          method: isEditMode ? "PUT" : "POST",
          body: formData, // apiFetcher is smart enough to handle FormData
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

  const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
        {icon}
        <span className="ml-3">{title}</span>
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8" encType="multipart/form-data">
      {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg shadow-sm">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section icon={<FileText size={20} />} title="Detalles del Producto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nombre del Producto">
                <input type="text" name="nombre" value={data.nombre} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </FormField>
              <FormField label="Categoría">
                <select name="categoria" value={data.categoria} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                  <option value="">Seleccione una categoría</option>
                  {categorias?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Modelo">
                <select name="modelo" value={data.modelo} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required>
                  <option value="">Seleccione un modelo</option>
                  {modelos?.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Material">
                <select name="material" value={data.material} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="">Seleccione un material</option>
                  {materiales?.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="Descripción">
              <textarea name="descripcion" value={data.descripcion} onChange={handleChange} rows={5} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </FormField>
          </Section>
        </div>

        <div className="space-y-8">
          <Section icon={<ImageIcon size={20} />} title="Imagen de Muestra">
            <FormField label="Subir nueva imagen">
              <input type="file" name="imagen" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </FormField>
            <div className="mt-2 w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed">
              {imagePreview ? (
                <img src={imagePreview} alt="Vista previa" className="h-full w-full object-contain rounded-md" />
              ) : (
                <span className="text-sm text-gray-500">Vista previa</span>
              )}
            </div>
          </Section>

          <Section icon={<Tag size={20} />} title="Etiquetas">
            <FormField label="Asignar etiquetas">
              <select name="etiquetas" value={data.etiquetas} onChange={handleChange} multiple className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-40">
                {etiquetasData?.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Mantén presionado Ctrl (o Cmd) para seleccionar varias.</p>
            </FormField>
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Link href="/admin/inventario/catalogo" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">Cancelar</Link>
        <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">{isSaving ? "Guardando..." : "Guardar Cambios"}</button>
      </div>
    </form>
  );
}

