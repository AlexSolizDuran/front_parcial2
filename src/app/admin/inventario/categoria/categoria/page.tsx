"use client";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { CategoriaGet } from "@/types/categorias/categoria";
import CategoriaFormModal from "@/components/modals/CategoriaFormModal";

export default function CategoriaList() {
  const api_url = "/api/producto/categoria";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoriaEnEdicion, setCategoriaEnEdicion] =
    useState<CategoriaGet | null>(null);

  const {
    data: categorias,
    error,
    isLoading,
    mutate,
  } = useSWR(api_url, (url) => apiFetcher<CategoriaGet[]>(url));

  const categoriaMap = useMemo(() => {
    const map = new Map<string | null, string>();

    map.set(null, "— Categoría Raíz —");
    map.set("", "— Categoría Raíz —");

    if (categorias) {
      for (const cat of categorias) {
        map.set(cat.id, cat.nombre);
      }
    }
    return map;
  }, [categorias]);

  const handleAbrirModalEditar = (categoria: CategoriaGet) => {
    setCategoriaEnEdicion(categoria);
    setIsModalOpen(true);
  };

  const handleAbrirModalCrear = () => {
    setCategoriaEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setCategoriaEnEdicion(null);
  };

  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };
  const handleDelete = async (id: string) => {
    try {
      await apiFetcher(`/api/producto/categoria/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };
  if (isLoading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error al cargar las categorías.</div>;
  if (!categorias || categorias.length === 0) {
    return <div>No hay categorías registradas.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Categorías</h2>
        <button
          onClick={handleAbrirModalCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Categoría
        </button>
      </div>

      <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-semibold text-gray-700 border-b">
              Nombre
            </th>
            <th className="p-3 text-left font-semibold text-gray-700 border-b">
              Categoría Padre
            </th>
            <th className="p-3 text-left font-semibold text-gray-700 border-b">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat) => (
            <tr key={cat.id} className="hover:bg-gray-50">
              <td className="p-3 border-b border-gray-200">{cat.nombre}</td>
              <td className="p-3 border-b border-gray-200 text-gray-600">
                {categoriaMap.get(cat.padreId) || "— Categoría Raíz —"}
              </td>
              <td className="p-3 border-b border-gray-200">
                <button
                  onClick={() => {
                    handleAbrirModalEditar(cat);
                  }}
                  className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    handleDelete(cat.id);
                  }}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CategoriaFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        categorias={categorias || []} // Le pasamos las categorías para el dropdown
        onSuccess={handleSuccess}
        categoriaParaEditar={categoriaEnEdicion}
      />
    </div>
  );
}
