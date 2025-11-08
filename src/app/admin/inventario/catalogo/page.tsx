"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import ProductoFormModal from "@/components/modals/ProductoFormModal";
import { ModeloGet } from "@/types/categorias/modelo";
import { CategoriaGet } from "@/types/categorias/categoria";
import { EtiquetaGet } from "@/types/categorias/etiqueta";
import { MaterialGet } from "@/types/categorias/material";

export default function CatalogoList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState<ProductoGet | null>(null);

  // --- Data Fetching ---
  const { data: productos, error: errorProductos, isLoading: isLoadingProductos, mutate } = useSWR<ProductoGet[]>("/api/producto/producto", apiFetcher);
  const { data: modelos, isLoading: isLoadingModelos } = useSWR<ModeloGet[]>("/api/producto/modelo", apiFetcher);
  const { data: categorias, isLoading: isLoadingCategorias } = useSWR<CategoriaGet[]>("/api/producto/categoria", apiFetcher);
  const { data: etiquetas, isLoading: isLoadingEtiquetas } = useSWR<EtiquetaGet[]>("/api/producto/etiqueta", apiFetcher);
  const { data: materiales, isLoading: isLoadingMateriales } = useSWR<MaterialGet[]>("/api/producto/material", apiFetcher);

  // --- Memoized Maps for Display ---
  const categoriaMap = useMemo(() => new Map(categorias?.map(c => [c.id, c.nombre])), [categorias]);
  const modeloMap = useMemo(() => new Map(modelos?.map(m => [m.id, m.nombre])), [modelos]);
  const materialMap = useMemo(() => new Map(materiales?.map(m => [m.id, m.nombre])), [materiales]);
  const etiquetaMap = useMemo(() => new Map(etiquetas?.map(e => [e.id, e.nombre])), [etiquetas]);

  // --- Modal Handling ---
  const handleAbrirModalEditar = (producto: ProductoGet) => {
    setProductoEnEdicion(producto);
    setIsModalOpen(true);
  };
  const handleAbrirModalCrear = () => {
    setProductoEnEdicion(null);
    setIsModalOpen(true);
  };
  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setProductoEnEdicion(null);
  };
  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };

  // --- CRUD Operations ---
  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        await apiFetcher(`/api/producto/producto/${id}`, { method: "DELETE" });
        mutate();
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el producto.");
      }
    }
  };

  const isLoading = isLoadingProductos || isLoadingModelos || isLoadingCategorias || isLoadingEtiquetas || isLoadingMateriales;

  if (isLoading) return <div>Cargando catálogo...</div>;
  if (errorProductos) return <div>Error al cargar el catálogo de productos.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Catálogo de Productos</h2>
        <button onClick={handleAbrirModalCrear} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          + Nuevo Producto
        </button>
      </div>

      {(!productos || productos.length === 0) && !isLoading ? (
        <div className="text-center py-10 text-gray-500">No hay productos registrados.</div>
      ) : (
        <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Nombre</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Categoría</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Modelo</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Material</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Etiquetas</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos?.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200 font-medium">{prod.nombre}</td>
                <td className="p-3 border-b border-gray-200">{categoriaMap.get(prod.categoria) || "N/A"}</td>
                <td className="p-3 border-b border-gray-200">{modeloMap.get(prod.modelo) || "N/A"}</td>
                <td className="p-3 border-b border-gray-200">{materialMap.get(prod.material) || "N/A"}</td>
                <td className="p-3 border-b border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {prod.etiquetas.map(tagId => (
                      <span key={tagId} className="bg-gray-200 text-gray-700 px-2 py-1 text-xs rounded-full">
                        {etiquetaMap.get(tagId) || "N/A"}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-3 border-b border-gray-200">
                  <button onClick={() => handleAbrirModalEditar(prod)} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(prod.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ProductoFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleSuccess}
        productoParaEditar={productoEnEdicion}
      />
    </div>
  );
}
