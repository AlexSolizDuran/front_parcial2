"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioGet } from "@/types/usuario/usuario";
import { ArrowLeft, Edit } from "lucide-react";

export default function VendedorDetallePage() {
  const params = useParams();
  const { id } = params;

  const { data: vendedor, error, isLoading } = useSWR<UsuarioGet>(
    id ? `/api/usuario/usuario/${id}` : null,
    apiFetcher
  );

  if (isLoading) return <div className="text-center py-10">Cargando detalles del vendedor...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error al cargar el vendedor.</div>;
  if (!vendedor) return <div className="text-center py-10">Vendedor no encontrado.</div>;

  const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || <span className="text-gray-400">No especificado</span>}</dd>
    </div>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 flex justify-between items-center">
        <div>
          <Link href="/admin/usuario/vendedor" className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Vendedores
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{vendedor.nombre} {vendedor.apellido}</h1>
          <p className="text-gray-600 text-lg">{vendedor.rolNombre}</p>
        </div>
        <Link href={`/admin/usuario/vendedor/${id}/editar`} className="btn-primary flex items-center">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Link>
      </div>
      <div className="border-t border-gray-200 px-6">
        <dl className="divide-y divide-gray-200">
          <DetailItem label="Username" value={vendedor.username} />
          <DetailItem label="Email" value={vendedor.email} />
          <DetailItem label="Teléfono" value={vendedor.telefono} />
          <DetailItem label="ID" value={vendedor.id} />
        </dl>
      </div>
    </div>
  );
}
