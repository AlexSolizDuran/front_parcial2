"use client";
import { useState } from "react";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { MarcaGet } from "@/types/categorias/marca";
import MarcaFormModal from "@/components/modals/MarcaFormModal";

export default function MarcaList() {
  const api_url = "/api/producto/marca";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [marcaEnEdicion, setMarcaEnEdicion] = useState<MarcaGet | null>(null);

  const {
    data: marcas,
    error,
    isLoading,
    mutate,
  } = useSWR(api_url, (url) => apiFetcher<MarcaGet[]>(url));

  const handleAbrirModalEditar = (marca: MarcaGet) => {
    setMarcaEnEdicion(marca);
    setIsModalOpen(true);
  };

  const handleAbrirModalCrear = () => {
    setMarcaEnEdicion(null);
    setIsModalOpen(true);
  };

  const handleCerrarModal = () => {
    setIsModalOpen(false);
    setMarcaEnEdicion(null);
  };

  const handleSuccess = () => {
    mutate();
    handleCerrarModal();
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetcher(`/api/producto/marca/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <div>Cargando marcas...</div>;
  if (error) return <div>Error al cargar las marcas.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Marcas</h2>
        <button
          onClick={handleAbrirModalCrear}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Marca
        </button>
      </div>

      {(!marcas || marcas.length === 0) && !isLoading ? (
        <div>No hay marcas registradas.</div>
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
            {marcas?.map((marca) => (
              <tr key={marca.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200">{marca.nombre}</td>
                <td className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => handleAbrirModalEditar(marca)}
                    className="text-sm bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(marca.id)}
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

      <MarcaFormModal
        isOpen={isModalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleSuccess}
        marcaParaEditar={marcaEnEdicion}
      />
    </div>
  );
}
