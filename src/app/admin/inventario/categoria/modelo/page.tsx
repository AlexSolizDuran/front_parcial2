"use client";
import { useMemo, useState } from "react";
import { apiFetcher } from "@/lib/apiFetcher";
import { ModeloGet } from "@/types/categorias/modelo";
import ModeloFormModal from "@/components/modals/ModeloFormModal";
import { useModelos } from "@/hooks/useModelos"; // Import the custom hook
import { useMarcas } from "@/hooks/useMarcas"; // Import the custom hook for marcas

export default function ModeloList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modeloEnEdicion, setModeloEnEdicion] = useState<ModeloGet | null>(
    null
  );

  // Use the custom hook for modelos
  const {
    modelos,
    errorModelos: error,
    isLoadingModelos: isLoadingModelos,
    mutateModelos: mutate,
  } = useModelos();

  // Use the custom hook for marcas
  const { marcas, isLoadingMarcas } = useMarcas();

  const marcaMap = useMemo(() => {
    const map = new Map<string, string>();
    if (marcas) {
      for (const marca of marcas) {
        map.set(marca.id, marca.nombre);
      }
    }
    return map;
  }, [marcas]);

  const handleAbrirModalEditar = (modelo: ModeloGet) => {
    setModeloEnEdicion(modelo);
    setIsModalOpen(true);
  };

  const handleAbrirModalCrear = () => {
    setModeloEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setModeloEnEdicion(null);
  };

  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetcher(`/api/producto/modelo/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  const isLoading = isLoadingModelos || isLoadingMarcas;

  if (isLoading) return <div>Cargando datos...</div>;
  if (error) return <div>Error al cargar los datos.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Modelos</h2>
        <button
          onClick={handleAbrirModalCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo Modelo
        </button>
      </div>

      {(!modelos || modelos.length === 0) && !isLoading ? (
        <div>No hay modelos registrados.</div>
      ) : (
        <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Nombre
              </th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Marca
              </th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {modelos?.map((modelo) => (
              <tr key={modelo.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">{modelo.nombre}</td>
                <td className="p-3 border-b border-gray-200 text-gray-600">
                  {marcaMap.get(modelo.marcaId) || "Marca no encontrada"}
                </td>
                <td className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => handleAbrirModalEditar(modelo)}
                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(modelo.id)}
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

      <ModeloFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleSuccess}
        modeloParaEditar={modeloEnEdicion}
        marcas={marcas || []}
      />
    </div>
  );
}
