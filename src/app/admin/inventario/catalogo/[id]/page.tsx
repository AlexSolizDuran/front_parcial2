"use client";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import { ModeloGet } from "@/types/categorias/modelo";
import { CategoriaGet } from "@/types/categorias/categoria";
import { EtiquetaGet } from "@/types/categorias/etiqueta";
import { MaterialGet } from "@/types/categorias/material";
import { ArrowLeft, Edit } from "lucide-react";

export default function ProductoDetallePage() {
  const params = useParams();
  const { id } = params;

  // --- Data Fetching ---
  const { data: producto, error: errorProducto, isLoading: isLoadingProducto } = useSWR<ProductoGet>(id ? `/api/producto/producto/${id}` : null, apiFetcher);
  const { data: modelos, isLoading: isLoadingModelos } = useSWR<ModeloGet[]>("/api/producto/modelo", apiFetcher);
  const { data: categorias, isLoading: isLoadingCategorias } = useSWR<CategoriaGet[]>("/api/producto/categoria", apiFetcher);
  const { data: etiquetas, isLoading: isLoadingEtiquetas } = useSWR<EtiquetaGet[]>("/api/producto/etiqueta", apiFetcher);
  const { data: materiales, isLoading: isLoadingMateriales } = useSWR<MaterialGet[]>("/api/producto/material", apiFetcher);

  // --- Memoized Maps for Display ---
  const categoriaMap = useMemo(() => new Map(categorias?.map(c => [c.id, c.nombre])), [categorias]);
  const modeloMap = useMemo(() => new Map(modelos?.map(m => [m.id, m.nombre])), [modelos]);
  const materialMap = useMemo(() => new Map(materiales?.map(m => [m.id, m.nombre])), [materiales]);
  const etiquetaMap = useMemo(() => new Map(etiquetas?.map(e => [e.id, e.nombre])), [etiquetas]);

  const isLoading = isLoadingProducto || isLoadingModelos || isLoadingCategorias || isLoadingEtiquetas || isLoadingMateriales;

  if (isLoading) return <div className="text-center py-10">Cargando detalles del producto...</div>;
  if (errorProducto) return <div className="text-center py-10 text-red-500">Error al cargar el producto.</div>;
  if (!producto) return <div className="text-center py-10">Producto no encontrado.</div>;

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || <span className="text-gray-400">No especificado</span>}</dd>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1 p-6">
          {producto.imagen ? (
            <img src={producto.imagen} alt={`Imagen de ${producto.nombre}`} className="w-full h-auto object-cover rounded-lg shadow-md" />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <div className="p-6 flex justify-between items-start">
            <div>
              <Link href="/admin/inventario/catalogo" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Catálogo
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
            </div>
            <Link href={`/admin/inventario/catalogo/${id}/editar`} className="btn-primary flex items-center mt-10">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Link>
          </div>
          <div className="border-t border-gray-200 px-6">
            <dl className="divide-y divide-gray-200">
              <DetailItem label="Descripción" value={producto.descripcion} />
              <DetailItem label="Categoría" value={categoriaMap.get(producto.categoria)} />
              <DetailItem label="Modelo" value={modeloMap.get(producto.modelo)} />
              <DetailItem label="Material" value={materialMap.get(producto.material)} />
              <DetailItem 
                label="Etiquetas" 
                value={
                  <div className="flex flex-wrap gap-2">
                    {producto.etiquetas.length > 0 ? producto.etiquetas.map(tagId => (
                      <span key={tagId} className="bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium rounded-full">
                        {etiquetaMap.get(tagId) || "N/A"}
                      </span>
                    )) : <span className="text-gray-400">No tiene etiquetas</span>}
                  </div>
                } 
              />
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
