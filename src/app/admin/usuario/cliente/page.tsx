"use client";
import useSWR from "swr";
import Link from "next/link";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioList } from "@/types/usuario/usuario";

export default function ClienteListPage() {
  const api_url = "/api/usuario/usuario?rol=CLIENTE";
  const { data: clientes, error, isLoading, mutate } = useSWR<UsuarioList[]>(api_url, apiFetcher);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await apiFetcher(`/api/usuario/usuario/${id}`, { method: "DELETE" });
        mutate(); // Re-fetch data to update the list
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el cliente.");
      }
    }
  };

  if (isLoading) return <div>Cargando clientes...</div>;
  if (error) return <div>Error al cargar los clientes.</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Clientes</h2>
      </div>

      {(!clientes || clientes.length === 0) && !isLoading ? (
        <div className="text-center py-10 text-gray-500">No hay clientes registrados.</div>
      ) : (
        <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Username</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Nombre</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Email</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Rol</th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes?.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200 font-medium">{cliente.username}</td>
                <td className="p-3 border-b border-gray-200">{cliente.nombre}</td>
                <td className="p-3 border-b border-gray-200">{cliente.email}</td>
                <td className="p-3 border-b border-gray-200">{cliente.rolNombre}</td>
                <td className="p-3 border-b border-gray-200 flex items-center gap-2">
                  <Link href={`/admin/usuario/cliente/${cliente.id}`} className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                    Ver
                  </Link>
                  <button onClick={() => handleDelete(cliente.id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
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
