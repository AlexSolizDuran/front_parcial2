"use client";

import useSWR from "swr";
import { useCart } from "@/context/CartContext";
import { apiFetcher } from "@/lib/apiFetcher";
import { ItemCarritoGet } from "@/types/venta/itemCarrito";
import { Loader2, Trash2, Plus, Minus } from "lucide-react"; // <-- Importar Plus/Minus
import Image from "next/image";
import { useState } from "react"; // <-- Importar useState

// Componente para un solo item en el carrito (Refactorizado)
function CartItemRow({ item }: { item: ItemCarritoGet }) {
  
  // 1. Obtener funciones del contexto
  const { updateItemQuantity, removeItemFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false); // Estado de carga por item
  
  const variante = item.prodVariante;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(price);
  };
  
  // 2. Funciones de handler
  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return; // No bajar de 1
    setIsUpdating(true);
    await updateItemQuantity(item.id, newQuantity);
    setIsUpdating(false);
  };
  
  const handleRemove = async () => {
    setIsUpdating(true);
    await removeItemFromCart(item.id);
    // No necesitamos setIsUpdating(false) porque el item desaparecerá
  };

  if (!variante) {
    return (
      <tr>
        <td colSpan={5} className="py-4 text-center text-red-500">
          Error: El item del carrito (ID: {item.id}) no incluyó una variante.
        </td>
      </tr>
    );
  }

  const subtotal = variante.precio * item.cantidad;

  return (
    <tr className={`border-b ${isUpdating ? "opacity-50" : ""}`}>
      {/* ... (Columna de Producto se mantiene igual) ... */}
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
      
      {/* --- 3. COLUMNA DE CANTIDAD (MODIFICADA) --- */}
      <td className="p-4 text-center">
        <div className="flex items-center justify-center rounded border border-gray-300">
          <button
            onClick={() => handleQuantityChange(item.cantidad - 1)}
            className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            disabled={isUpdating || item.cantidad <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 select-none px-2 text-center text-lg font-medium">
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mx-auto"/> : item.cantidad}
          </span>
          <button
            onClick={() => handleQuantityChange(item.cantidad + 1)}
            className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            disabled={isUpdating} // Opcional: || item.cantidad >= variante.stock
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </td>
      
      <td className="p-4 text-center font-medium">
        {formatPrice(subtotal)}
      </td>

      {/* --- 4. COLUMNA DE QUITAR (MODIFICADA) --- */}
      <td className="p-4 text-center">
        <button
          onClick={handleRemove}
          disabled={isUpdating}
          className="text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}

// Página principal del carrito (Completa)
export default function CarritoPage() {
  
  // 5. Obtenemos 'items' del contexto
  // Ya no usamos SWR aquí, useCart() nos da los items actualizados
  const { items, isLoading, error } = useCart();

  if (isLoading) {
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
  
  // 6. Calcular el total (ahora es más fiable)
  const totalGeneral = items.reduce((acc, item) => {
    return acc + (item.prodVariante.precio * item.cantidad);
  }, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
    }).format(price);
  };

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
      
      {/* 7. Sección de Total y Checkout */}
      <div className="mt-6 flex flex-col items-end">
        <div className="text-right">
          <p className="text-lg text-gray-600">
            Total:{" "}
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(totalGeneral)}
            </span>
          </p>
        </div>
        <button className="mt-4 w-full rounded-md bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 sm:w-auto">
          Proceder al Pago
        </button>
      </div>
    </div>
  );
}