"use client";
import useSWR from "swr";
import Link from "next/link";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProdVarianteList } from "@/types/stock/prodVariante";

export default function StockList() {
  const { data: variantes, error, isLoading, mutate } = useSWR<ProdVarianteList[]>("/api/stock/prodVariante", apiFetcher);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta variante de stock?")) {
      try {
        await apiFetcher(`/api/stock/prodVariante/${id}`, { method: "DELETE" });
        mutate();
      } catch (err) {
        console.error(err);
        alert("Error al eliminar la variante.");
      }
    }
  };

  if (isLoading) return <div>Cargando stock...</div>;
  if (error) return <div>Error al cargar el stock.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Stock</h2>
        <Link href="/admin/inventario/stock/crear" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          + Nueva Variante
        </Link>
      </div>

      {(!variantes || variantes.length === 0) && !isLoading ? (
        <div className="text-center py-10 text-gray-500">No hay variantes de stock registradas.</div>
      ) : (
        <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Producto</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Color</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Talla</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">SKU</th>
              <th className="p-3 text-right font-semibold text-gray-700 border-b">Stock</th>
              <th className="p-3 text-right font-semibold text-gray-700 border-b">Precio</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {variantes?.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200 font-medium">{v.producto}</td>
                <td className="p-3 border-b border-gray-200">{v.color}</td>
                <td className="p-3 border-b border-gray-200">{v.talla}</td>
                <td className="p-3 border-b border-gray-200 font-mono text-sm">{v.sku}</td>
                <td className="p-3 border-b border-gray-200 text-right font-semibold">{v.stock}</td>
                <td className="p-3 border-b border-gray-200 text-right">${parseFloat(v.precio).toFixed(2)}</td>
                <td className="p-3 border-b border-gray-200 flex items-center gap-2">
                  <Link href={`/admin/inventario/stock/${v.id}`} className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                    Ver
                  </Link>
                  <Link href={`/admin/inventario/stock/${v.id}/editar`} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(v.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
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
