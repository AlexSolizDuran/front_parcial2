"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { VentaGet } from "@/types/venta/venta";
import { DetalleVentaGet } from "@/types/venta/detalleVenta";
import { ArrowLeft } from "lucide-react";
import { useMemo } from "react";

// Import custom hooks for related data
import { useClientes } from "@/hooks/useClientes";
import { useVendedores } from "@/hooks/useVendedores";
import { useProdVariantes } from "@/hooks/useProdVariantes";

export default function ClienteVentaDetallePage() {
  const params = useParams();
  const { id } = params;

  // --- Fetch main Venta data ---
  const { data: venta, error: errorVenta, isLoading: isLoadingVenta } = useSWR<VentaGet>(
    id ? `/api/venta/venta/${id}` : null,
    apiFetcher
  );

  // --- Fetch DetalleVenta items for this sale ---
  const { data: detalles, error: errorDetalles, isLoading: isLoadingDetalles } = useSWR<DetalleVentaGet[]>(
    id ? `/api/venta/detalleVenta?ventaId=${id}` : null,
    apiFetcher
  );

  // --- Fetch related data using custom hooks ---
  const { clientes, isLoadingClientes } = useClientes();
  const { vendedores, isLoadingVendedores } = useVendedores();
  const { prodVariantes, isLoadingProdVariantes } = useProdVariantes();

  // --- Memoized Maps for Display ---
  const clienteMap = useMemo(() => new Map(clientes?.map(c => [c.id, `${c.nombre} ${c.apellido}`])), [clientes]);
  const vendedorMap = useMemo(() => new Map(vendedores?.map(v => [v.id, `${v.nombre} ${v.apellido}`])), [vendedores]);
  const prodVarianteMap = useMemo(() => new Map(prodVariantes?.map(pv => [pv.id, pv])), [prodVariantes]);

  const isLoading = isLoadingVenta || isLoadingDetalles || isLoadingClientes || isLoadingVendedores || isLoadingProdVariantes;
  const error = errorVenta || errorDetalles;

  if (isLoading) return <div className="text-center py-10">Cargando detalles de la compra...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error al cargar la compra.</div>;
  if (!venta) return <div className="text-center py-10">Compra no encontrada.</div>;

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(parseFloat(value));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-BO', options);
  };

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || <span className="text-gray-400">No especificado</span>}</dd>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-6xl mx-auto">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <div>
          <Link href="/cliente/historial" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Historial de Compras
          </Link>
          <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles de la Compra #{venta.numeroVenta}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Información detallada de tu transacción.</p>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <dl>
          <DetailItem label="Cliente" value={clienteMap.get(venta.clienteId) || venta.clienteId} />
          <DetailItem label="Vendedor" value={vendedorMap.get(venta.vendedorId) || venta.vendedorId} />
          <DetailItem label="Fecha de Compra" value={formatDate(venta.fechaVenta)} />
          <DetailItem label="Método de Pago" value={venta.metodoPago} />
          <DetailItem label="Tipo de Venta" value={venta.tipoVendta} />
          <DetailItem label="Estado del Pedido" value={venta.estadoPedido} />
          <DetailItem label="Monto Total" value={formatCurrency(String(venta.montoTotal))} />
        </dl>
      </div>

      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Productos Comprados</h3>
        {(!detalles || detalles.length === 0) ? (
          <p className="text-sm text-gray-500">No hay productos en esta compra.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variante</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unit.</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {detalles?.map(detalle => {
                  const pv = prodVarianteMap.get(detalle.prodVarianteId);
                  return (
                    <tr key={detalle.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pv?.producto || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pv ? `${pv.color}, ${pv.talla}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{detalle.cantidad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(String(detalle.precio_unit))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(String(detalle.descuento))}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">{formatCurrency(String(detalle.subtotal))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
