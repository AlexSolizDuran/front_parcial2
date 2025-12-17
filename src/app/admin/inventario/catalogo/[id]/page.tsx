"use client";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import { ModeloGet } from "@/types/categorias/modelo";
import { CategoriaGet } from "@/types/categorias/categoria";
import { EtiquetaGet } from "@/types/categorias/etiqueta";
import { MaterialGet } from "@/types/categorias/material";
import { ArrowLeft, Edit, Package, AlertTriangle, CheckCircle } from "lucide-react";

// Definimos la interfaz basada en tu ProdVarianteResponseDTO.java
interface ProdVarianteGet {
  id: number;
  sku: string;
  precio: number;
  stock: number;
  color: { id: number; nombre: string; codigoHex?: string };
  talla: { id: number; nombre: string };
}

export default function ProductoDetallePage() {
  const params = useParams();
  const { id } = params;

  // --- Data Fetching del Producto ---
  const { data: producto, error: errorProducto, isLoading: isLoadingProducto } = useSWR<ProductoGet>(id ? `/api/producto/producto/${id}` : null, apiFetcher);
  
  // --- Data Fetching de las Variantes (¡NUEVO!) ---
  // Usamos el endpoint que ya tenías en ProdVarianteController
  const { data: variantes, isLoading: isLoadingVariantes } = useSWR<ProdVarianteGet[]>(id ? `/api/inventario/prod-variante/producto/${id}` : null, apiFetcher);

  // --- Data Fetching Auxiliar ---
  const { data: modelos, isLoading: isLoadingModelos } = useSWR<ModeloGet[]>("/api/producto/modelo", apiFetcher);
  const { data: categorias, isLoading: isLoadingCategorias } = useSWR<CategoriaGet[]>("/api/producto/categoria", apiFetcher);
  const { data: etiquetas, isLoading: isLoadingEtiquetas } = useSWR<EtiquetaGet[]>("/api/producto/etiqueta", apiFetcher);
  const { data: materiales, isLoading: isLoadingMateriales } = useSWR<MaterialGet[]>("/api/producto/material", apiFetcher);

  // --- Memos ---
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
    <div className="max-w-5xl mx-auto space-y-8">
      {/* TARJETA PRINCIPAL: DETALLES DEL PRODUCTO PADRE */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1 p-6">
            {producto.imagen ? (
              <img src={producto.imagen} alt={`Imagen de ${producto.nombre}`} className="w-full h-auto object-cover rounded-lg shadow-md" />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-400">
                <Package className="w-12 h-12 mb-2" />
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="p-6 flex justify-between items-start">
              <div>
                <Link href="/admin/inventario/catalogo" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Catálogo
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
              </div>
              <Link href={`/admin/inventario/catalogo/${id}/editar`} className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue-200 active:bg-blue-600 transition">
                <Edit className="w-4 h-4 mr-2" />
                Editar Info
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

      {/* SECCIÓN DE VARIANTES (INVENTARIO) */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Inventario y Variantes
            </h2>
            {/* Opcional: Botón para añadir variante si decides implementarlo aquí */}
            {/* <button className="text-sm text-blue-600 hover:underline">+ Añadir Variante</button> */}
        </div>
        
        <div className="overflow-x-auto">
            {isLoadingVariantes ? (
                <div className="p-10 text-center text-gray-500">Cargando variantes...</div>
            ) : variantes && variantes.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Talla</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {variantes.map((variante) => (
                            <tr key={variante.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {variante.sku}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        {/* Círculo de color si quisieras implementarlo con CSS backgroundColor: variante.color.codigoHex */}
                                        <span className="w-3 h-3 rounded-full bg-gray-400 mr-2 inline-block"></span>
                                        {variante.color?.nombre || "N/A"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200">
                                        {variante.talla?.nombre || "N/A"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                    ${variante.precio?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium">
                                    {variante.stock}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {variante.stock > 0 ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Disponible
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <AlertTriangle className="w-3 h-3 mr-1" /> Agotado
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="p-10 text-center flex flex-col items-center">
                    <Package className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Este producto aún no tiene variantes registradas.</p>
                    <p className="text-sm text-gray-400">Ve a "Inventario" para agregar stock.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}