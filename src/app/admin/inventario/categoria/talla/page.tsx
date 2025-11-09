"use client";
import { useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { TallaGet } from "@/types/categorias/talla";
import TallaFormModal from "@/components/modals/TallaFormModal";
import { useTallas } from "@/hooks/useTallas"; // Import the custom hook

export default function TallaList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tallaEnEdicion, setTallaEnEdicion] = useState<TallaGet | null>(null);

  // Use the custom hook
  const {
    tallas,
    errorTallas: error,
    isLoadingTallas: isLoading,
    mutateTallas: mutate,
  } = useTallas();

  const handleAbrirModalEditar = (talla: TallaGet) => {
    setTallaEnEdicion(talla);
    setIsModalOpen(true);
  };

  const handleAbrirModalCrear = () => {
    setTallaEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setTallaEnEdicion(null);
  };

  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetcher(`/api/inventario/talla/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Cargando tallas...</div>;
  if (error) return <div>Error al cargar las tallas.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Tallas</h2>
        <button
          onClick={handleAbrirModalCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Talla
        </button>
      </div>

      {(!tallas || tallas.length === 0) && !isLoading ? (
        <div>No hay tallas registradas.</div>
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
            {tallas?.map((talla) => (
              <tr key={talla.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">{talla.talla}</td>
                <td className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => handleAbrirModalEditar(talla)}
                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(talla.id)}
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

      <TallaFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleSuccess}
        tallaParaEditar={tallaEnEdicion}
      />
    </div>
  );
}
