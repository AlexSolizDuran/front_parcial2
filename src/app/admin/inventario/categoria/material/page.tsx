"use client";
import { useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { MaterialGet } from "@/types/categorias/material";
import MaterialFormModal from "@/components/modals/MaterialFormModal";
import { useMateriales } from "@/hooks/useMateriales"; // Import the custom hook

export default function MaterialList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materialEnEdicion, setMaterialEnEdicion] =
    useState<MaterialGet | null>(null);

  // Use the custom hook
  const {
    materiales,
    errorMateriales: error,
    isLoadingMateriales: isLoading,
    mutateMateriales: mutate,
  } = useMateriales();

  const handleAbrirModalEditar = (material: MaterialGet) => {
    setMaterialEnEdicion(material);
    setIsModalOpen(true);
  };

  const handleAbrirModalCrear = () => {
    setMaterialEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setMaterialEnEdicion(null);
  };

  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetcher(`/api/producto/material/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Cargando materiales...</div>;
  if (error) return <div>Error al cargar los materiales.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Materiales</h2>
        <button
          onClick={handleAbrirModalCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo Material
        </button>
      </div>

      {(!materiales || materiales.length === 0) && !isLoading ? (
        <div>No hay materiales registrados.</div>
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
            {materiales?.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">{material.nombre}</td>
                <td className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => handleAbrirModalEditar(material)}
                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
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

      <MaterialFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleSuccess}
        materialParaEditar={materialEnEdicion}
      />
    </div>
  );
}
