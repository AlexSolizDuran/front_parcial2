"use client";
import React, { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { apiFetcher } from "@/lib/apiFetcher";

import { Paginacion } from "@/types/paginacion";
import { UsuarioList } from "@/types/usuario/usuario";

export default function ClienteListPage() {
  const [page, setPage] = useState(0);
  const size = 10; // Puedes hacer esto un estado también si quieres un selector de "items por página"

  const api_url = `/api/usuario/usuario/paginado?rol=CLIENTE&page=${page}&size=${size}&sort=nombre,asc`;

  const { data, error, isLoading, mutate } = useSWR<Paginacion<UsuarioList>>(
    api_url,
    apiFetcher
  );

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await apiFetcher(`/api/usuario/usuario/${id}`, { method: "DELETE" });
        mutate();
      } catch (err) {
        console.error(err);
        alert("Error al eliminar el cliente.");
      }
    }
  };

  if (isLoading) return <div>Cargando clientes...</div>;
  if (error) return <div>Error al cargar los clientes.</div>;

  if (!data)
    return (
      <div className="text-center py-10 text-gray-500">
        No se encontraron datos.
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gestión de Clientes</h2>
      </div>

      {data.empty || data.content.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No hay clientes registrados.
        </div>
      ) : (
        <table className="w-full min-w-full table-auto border-collapse border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Username
              </th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Nombre
              </th>
              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Email
              </th>

              <th className="p-3 text-left font-semibold text-gray-700 border-b">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {data.content.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="p-3 border-b border-gray-200 font-medium">
                  {cliente.username}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {cliente.nombre}
                </td>
                <td className="p-3 border-b border-gray-200">
                  {cliente.email}
                </td>

                <td className="p-3 border-b border-gray-200 flex items-center gap-2">
                  <Link
                    href={`/admin/usuario/cliente/${cliente.id}`}
                    className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Ver
                  </Link>
                  <button
                    onClick={() => handleDelete(cliente.id)}
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

      <div className="flex justify-between items-center mt-6">
        <span className="text-sm text-gray-700">
          Mostrando {data.numberOfElements} de {data.totalElements} clientes
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage(page - 1)}
            disabled={data.first} // Deshabilitado si es la primera página
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-700">
            Página {data.number + 1} de {data.totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={data.last} // Deshabilitado si es la última página
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
