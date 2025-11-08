"use client";
import { useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ColorGet } from "@/types/categorias/color";
import ColorFormModal from "@/components/modals/ColorFormModal";

export default function ColorList() {
  const api_url = "/api/inventario/color";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colorEnEdicion, setColorEnEdicion] = useState<ColorGet | null>(null);

  const {
    data: colores,
    error,
    isLoading,
    mutate,
  } = useSWR(api_url, (url) => apiFetcher<ColorGet[]>(url));

  const handleAbrirModalEditar = (color: ColorGet) => {
    setColorEnEdicion(color);
    setIsModalOpen(true);
  };

  const handleAbrirModalCrear = () => {
    setColorEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setColorEnEdicion(null);
  };

  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetcher(`/api/inventario/color/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Cargando colores...</div>;
  if (error) return <div>Error al cargar los colores.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Colores</h2>
        <button
          onClick={handleAbrirModalCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo Color
        </button>
      </div>

      {(!colores || colores.length === 0) && !isLoading ? (
        <div>No hay colores registrados.</div>
      ) : (
        <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Nombre
              </th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {colores?.map((color) => (
              <tr key={color.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">{color.nombre}</td>
                <td className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => handleAbrirModalEditar(color)}
                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(color.id)}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ColorFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleSuccess}
        colorParaEditar={colorEnEdicion}
      />
    </div>
  );
}
