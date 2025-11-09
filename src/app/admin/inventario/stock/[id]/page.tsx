"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProdVarianteGet } from "@/types/stock/prodVariante";
import { ArrowLeft, Edit } from "lucide-react";

export default function ProdVarianteDetallePage() {
  const params = useParams();
  const { id } = params;

  const { data: variante, error, isLoading } = useSWR<ProdVarianteGet>(
    id ? `/api/inventario/prodVariante/${id}` : null,
    apiFetcher
  );

  if (isLoading) return <div className="text-center py-10">Cargando detalles de la variante...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error al cargar la variante.</div>;
  if (!variante) return <div className="text-center py-10">Variante no encontrada.</div>;

  const DetailItem = ({ label, value, isCurrency = false }: { label: string; value: React.ReactNode, isCurrency?: boolean }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
        {isCurrency && typeof value === 'string' ? `$${parseFloat(value).toFixed(2)}` : (value || <span className="text-gray-400">No especificado</span>)}
      </dd>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 flex justify-between items-center">
        <div>
          <Link href="/admin/inventario/stock" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Stock
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {variante.producto.nombre}
            <span className="text-lg font-normal text-gray-600 ml-2">({variante.color.nombre}, {variante.talla.nombre})</span>
          </h1>
        </div>
        <Link href={`/admin/inventario/stock/${id}/editar`} className="btn-primary flex items-center">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Link>
      </div>
      <div className="border-t border-gray-200 px-6">
        <dl className="divide-y divide-gray-200">
          <DetailItem label="Producto Principal" value={variante.producto.nombre} />
          <DetailItem label="SKU" value={variante.sku} />
          <DetailItem label="Stock Disponible" value={`${variante.stock} unidades`} />
          <DetailItem label="Costo" value={variante.costo} isCurrency />
          <DetailItem label="PPP" value={variante.ppp} isCurrency />
          <DetailItem label="Precio de Venta" value={variante.precio} isCurrency />
          <DetailItem label="Color" value={variante.color.nombre} />
          <DetailItem label="Talla" value={variante.talla.nombre} />
        </dl>
      </div>
    </div>
  );
}