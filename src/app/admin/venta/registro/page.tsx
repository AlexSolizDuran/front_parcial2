"use client";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { VentaGet } from "@/types/venta/venta";
import Link from "next/link"; // Use Next.js Link component
import { useMemo } from "react";

// Import custom hooks for related data
import { useClientes } from "@/hooks/useClientes";
import { useVendedores } from "@/hooks/useVendedores";

export default function RegistroVentasPage() {
  const api_url = "/api/venta/venta";
  const {
    data: ventas,
    error: errorVentas,
    isLoading: isLoadingVentas,
    mutate,
  } = useSWR<VentaGet[]>(api_url, apiFetcher);

  // Fetch related data for mapping
  const { clientes, isLoadingClientes } = useClientes();
  const { vendedores, isLoadingVendedores } = useVendedores();

  // Memoized Maps for Display
  const clienteMap = useMemo(() => new Map(clientes?.map(c => [c.id, `${c.nombre} ${c.apellido}`])), [clientes]);
  const vendedorMap = useMemo(() => new Map(vendedores?.map(v => [v.id, `${v.nombre} ${v.apellido}`])), [vendedores]);

  const isLoading = isLoadingVentas || isLoadingClientes || isLoadingVendedores;
  const error = errorVentas; // Assuming errorVentas is the primary error

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("es-BO", options);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta venta?")) return;

    try {
      await apiFetcher(`/api/venta/venta/${id}`, {
        method: "DELETE",
      });
      alert("✅ Venta eliminada correctamente");
      mutate(); // Actualiza la lista sin recargar
    } catch (err) {
      console.error(err);
      alert("❌ No se pudo eliminar la venta");
    }
  };

  if (isLoading) return <div className="text-center py-10 text-blue-600 text-lg font-semibold">Cargando registro de ventas...</div>;
  if (error) return <div className="text-center py-10 text-red-600 text-lg font-semibold">Error al cargar el registro de ventas.</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registro de Ventas</h2>
      </div>

      {(!ventas || ventas.length === 0) && !isLoading ? (
        <div className="text-center py-12 text-gray-600 text-lg">
          No hay ventas registradas.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Nº Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Método Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fecha Venta
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventas?.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {venta.numeroVenta}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {clienteMap.get(venta.clienteId) || venta.clienteId}
                  </td>
                 
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {venta.metodoPago}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                    {formatCurrency(venta.montoTotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      venta.estadoPedido === 'COMPLETADO' ? 'bg-green-100 text-green-800' :
                      venta.estadoPedido === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {venta.estadoPedido}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(venta.fechaVenta)}
                  </td>

                  {/* 🔧 Acciones */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/venta/registro/${venta.id}`}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDelete(venta.id)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
