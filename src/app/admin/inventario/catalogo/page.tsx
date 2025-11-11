"use client";
import { useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import { ModeloGet } from "@/types/categorias/modelo";
import { CategoriaGet } from "@/types/categorias/categoria";

export default function CatalogoList() {
  // --- Data Fetching ---
  const { data: productos, error: errorProductos, isLoading: isLoadingProductos, mutate } = useSWR<ProductoGet[]>("/api/producto/producto", apiFetcher);
  const { data: modelos, isLoading: isLoadingModelos } = useSWR<ModeloGet[]>("/api/producto/modelo", apiFetcher);
  const { data: categorias, isLoading: isLoadingCategorias } = useSWR<CategoriaGet[]>("/api/producto/categoria", apiFetcher);

  // --- Memoized Maps for Display ---
  const categoriaMap = useMemo(() => new Map(categorias?.map(c => [c.id, c.nombre])), [categorias]);
  const modeloMap = useMemo(() => new Map(modelos?.map(m => [m.id, m.nombre])), [modelos]);

  // --- CRUD Operations ---
  const handleDelete = async (id: number) => {
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

  const isLoading = isLoadingProductos || isLoadingModelos || isLoadingCategorias;

  if (isLoading) return <div>Cargando catálogo...</div>;
  if (errorProductos) return <div>Error al cargar el catálogo de productos.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Catálogo de Productos</h2>
        <Link href="/admin/inventario/catalogo/crear" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          + Nuevo Producto
        </Link>
      </div>

      {(!productos || productos.length === 0) && !isLoading ? (
        <div className="text-center py-10 text-gray-500">No hay productos registrados.</div>
      ) : (
        <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Imagen</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Nombre</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Categoría</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Modelo</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos?.map((prod) => (
              <tr key={prod.id} className="hover:bg-gray-50">
                <td className="p-2 border-b border-gray-200">
                  {prod.imagen ? (
                    <img src={prod.imagen} alt={prod.nombre} className="w-16 h-16 object-cover rounded-md" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">
                      Sin foto
                    </div>
                  )}
                </td>
                <td className="p-3 border-b border-gray-200 font-medium">{prod.nombre}</td>
                <td className="p-3 border-b border-gray-200">{categoriaMap.get(prod.categoria) || "N/A"}</td>
                <td className="p-3 border-b border-gray-200">{modeloMap.get(prod.modelo) || "N/A"}</td>
                <td className="p-3 border-b border-gray-200 flex items-center gap-2">
                  <Link href={`/admin/inventario/catalogo/${prod.id}`} className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                    Ver
                  </Link>
                  <Link href={`/admin/inventario/catalogo/${prod.id}/editar`} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(prod.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
