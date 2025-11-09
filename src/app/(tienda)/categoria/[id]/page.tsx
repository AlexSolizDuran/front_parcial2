"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import ProductCard from "@/components/tienda/ProductCard";
import { Loader2 } from "lucide-react";

export default function CategoriaPage() {
  const params = useParams();
  const id = params.id as string; // Obtiene el ID de la URL

  // 1. Llama a la API route del frontend
  const {
    data: productos,
    error,
    isLoading,
  } = useSWR<ProductoGet[]>(
    id ? `/api/producto/producto/categoria/${id}` : null, // Solo busca si hay ID
    apiFetcher
  );

  // 2. Manejar estados de carga y error
  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Cargando productos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-96 items-center justify-center text-red-600">
        Error al cargar los productos: {error.message}
      </div>
    );
  }

  if (!productos || productos.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center text-gray-500">
        No se encontraron productos en esta categoría.
      </div>
    );
  }

  // 3. Renderizar la lista de productos
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Categoría
        {/* Opcional: Podrías hacer otro SWR fetch para obtener el nombre de la categoría */}
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}