"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProdVarianteGet } from "@/types/inventario/prodVariante";
import { Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Componente para una sola variante (color, talla, precio)
function VarianteItem({ variante }: { variante: ProdVarianteGet }) {
  const { addItemToCart, isLoading } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(price);
  };

  const handleAddToCart = () => {
    addItemToCart(variante.id, 1); // Añade 1 unidad por defecto
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center space-x-4">
        <span
          className="h-8 w-8 rounded-full border border-gray-300"
          style={{ backgroundColor: variante.color.codHexa }}
          title={variante.color.nombre}
        />
        <div>
          <span className="font-medium text-gray-800">
            {variante.color.nombre}
          </span>
          <span className="mx-2 text-gray-400">|</span>
          <span className="text-sm text-gray-600">
            Talla: {variante.talla.talla}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-lg font-bold text-gray-900">
          {formatPrice(variante.precio)}
        </span>
        <button
          onClick={handleAddToCart}
          disabled={isLoading || variante.stock <= 0}
          className="flex w-36 items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Añadir
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Página principal
export default function ProductoDetallePage() {
  const params = useParams();
  const id = params.id as string; // ID del Producto

  const {
    data: variantes,
    error,
    isLoading,
  } = useSWR<ProdVarianteGet[]>(
    id ? `/api/inventario/prod-variante/producto/${id}` : null,
    apiFetcher
  );

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Cargando opciones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-96 items-center justify-center text-red-600">
        Error al cargar variantes: {error.message}
      </div>
    );
  }

  if (!variantes || variantes.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center text-gray-500">
        No hay opciones disponibles para este producto.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {variantes[0].producto.nombre}
      </h1>
      <p className="mt-2 text-gray-600">
        {variantes[0].producto.descripcion}
      </p>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Elige tu variante:</h2>
        {variantes.map((variante) => (
          <VarianteItem key={variante.id} variante={variante} />
        ))}
      </div>
    </div>
  );
}