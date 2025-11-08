"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import ProductoForm from "@/components/producto/ProductoForm";

export default function EditarProductoPage() {
  const params = useParams();
  const { id } = params;

  const {
    data: producto,
    error,
    isLoading,
  } = useSWR<ProductoGet>(
    id ? `/api/producto/producto/${id}` : null,
    apiFetcher
  );

  if (isLoading) return <div>Cargando producto...</div>;
  if (error) return <div>Error al cargar el producto.</div>;
  if (!producto) return <div>Producto no encontrado.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Editar Producto: {producto.nombre}
      </h1>
      <ProductoForm productoParaEditar={producto} />
    </div>
  );
}
