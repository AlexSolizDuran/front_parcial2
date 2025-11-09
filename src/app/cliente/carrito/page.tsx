"use client";

import useSWR from "swr";
import { useCart } from "@/context/CartContext";
import { apiFetcher } from "@/lib/apiFetcher";
import { ItemCarritoGet } from "@/types/venta/itemCarrito";
import { ProdVarianteGet } from "@/types/inventario/prodVariante";
import { Loader2, Trash2 } from "lucide-react";
import Image from "next/image";

// Componente para un solo item en el carritoooooooo

function CartItemRow({ item }: { item: ItemCarritoGet }) {
  // Por cada item, necesitamos sus detalles (ProdVariante)
  const {
    data: variante,
    error,
    isLoading,
  } = useSWR<ProdVarianteGet>(
    // Usamos el endpoint que ya existe: /api/inventario/prod-variante/[id]
    // (Asumiendo que creaste la ruta proxy /api/inventario/prod-variante/[id]/route.ts)
    item ? `/api/inventario/prod-variante/${item.prodVariateId}` : null,
    apiFetcher
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(price);
  };

  if (isLoading) {
    return (
      <tr>
        <td colSpan={5} className="py-4 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </td>
      </tr>
    );
  }

  if (error || !variante) {
    return (
      <tr>
        <td colSpan={5} className="py-4 text-center text-red-500">
          Error al cargar item ID: {item.prodVariateId}
        </td>
      </tr>
    );
  }

  const subtotal = variante.precio * item.cantidad;

  return (
    <tr className="border-b">
      <td className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 rounded bg-gray-100">
            {variante.imagen ? (
              <Image
                src={variante.imagen}
                alt={variante.producto.nombre}
                fill
                className="object-cover"
              />
            ) : null}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {variante.producto.nombre}
            </p>
            <p className="text-sm text-gray-500">
              {variante.color.nombre} / Talla: {variante.talla.talla}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4 text-center">{formatPrice(variante.precio)}</td>
      <td className="p-4 text-center">{item.cantidad}</td>
      <td className="p-4 text-center font-medium">
        {formatPrice(subtotal)}
      </td>
      <td className="p-4 text-center">
        <button className="text-red-500 hover:text-red-700">
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}

// Página principal del carrito
export default function CarritoPage() {
  const { cartId, isLoading: isCartLoading } = useCart();

  const {
    data: items,
    error,
    isLoading: isItemsLoading,
  } = useSWR<ItemCarritoGet[]>(
    cartId ? `/api/venta/iteamcarrito/porcarrito/${cartId}` : null,
    apiFetcher
  );

  if (isCartLoading || isItemsLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        Cargando carrito...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-96 items-center justify-center text-red-600">
        Error al cargar tu carrito: {error.message}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex min-h-96 items-center justify-center text-gray-500">
        Tu carrito está vacío.
      </div>
    );
  }

  // Calcular total
  // (Nota: Esto es una aproximación, ya que SWR carga los precios individualmente)
  // (Una mejor solución es que el backend calcule el total)

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full table-auto text-left">
          <thead className="border-b bg-gray-50 text-sm font-semibold text-gray-600">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4 text-center">Precio Unit.</th>
              <th className="p-4 text-center">Cantidad</th>
              <th className="p-4 text-center">Subtotal</th>
              <th className="p-4 text-center">Quitar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="rounded-md bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700">
          Proceder al Pago
        </button>
      </div>
    </div>
  );
}