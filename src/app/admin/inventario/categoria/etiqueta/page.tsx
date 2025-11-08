"use client";
import { useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { EtiquetaGet } from "@/types/categorias/etiqueta";
import EtiquetaFormModal from "@/components/modals/EtiquetaFormModal";

export default function EtiquetaList() {
  const api_url = "/api/producto/etiqueta";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [etiquetaEnEdicion, setEtiquetaEnEdicion] =
    useState<EtiquetaGet | null>(null);

  const {
    data: etiquetas,
    error,
    isLoading,
    mutate,
  } = useSWR(api_url, (url) => apiFetcher<EtiquetaGet[]>(url));

  const handleAbrirModalEditar = (etiqueta: EtiquetaGet) => {
    setEtiquetaEnEdicion(etiqueta);
    setIsModalOpen(true);
  };

  const handleAbrirModalCrear = () => {
    setEtiquetaEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setEtiquetaEnEdicion(null);
  };

  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetcher(`/api/producto/etiqueta/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Cargando etiquetas...</div>;
  if (error) return <div>Error al cargar las etiquetas.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Etiquetas</h2>
        <button
          onClick={handleAbrirModalCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Etiqueta
        </button>
      </div>

      {(!etiquetas || etiquetas.length === 0) && !isLoading ? (
        <div>No hay etiquetas registradas.</div>
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
            {etiquetas?.map((etiqueta) => (
              <tr key={etiqueta.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">{etiqueta.nombre}</td>
                <td className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => handleAbrirModalEditar(etiqueta)}
                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(etiqueta.id)}
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

      <EtiquetaFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleSuccess}
        etiquetaParaEditar={etiquetaEnEdicion}
      />
    </div>
  );
}
