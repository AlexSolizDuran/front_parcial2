"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProdVarianteGet } from "@/types/stock/prodVariante";
import ProdVarianteForm from "@/components/stock/ProdVarianteForm";

export default function EditarProdVariantePage() {
  const params = useParams();
  const { id } = params;

  const {
    data: variante,
    error,
    isLoading,
  } = useSWR<ProdVarianteGet>(
    id ? `/api/inventario/prodVariante/${id}` : null,
    apiFetcher
  );

  if (isLoading) return <div>Cargando variante...</div>;
  if (error) return <div>Error al cargar la variante.</div>;
  if (!variante) return <div>Variante no encontrada.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Editar Variante: {variante.producto.nombre} ({variante.color.nombre}, {variante.talla.nombre})
      </h1>
      <ProdVarianteForm varianteParaEditar={variante} />
    </div>
  );
}