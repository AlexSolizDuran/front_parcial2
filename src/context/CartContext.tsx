"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioGet } from "@/types/usuario/usuario";
import { CarritoGet, CarritoSet } from "@/types/venta/carrito";
import { ItemCarritoSet, ItemCarritoGet } from "@/types/venta/itemCarrito";

interface CartContextType {
  cartId: number | null;
  itemCount: number;
  isLoading: boolean;
  error: Error | null;
  items: ItemCarritoGet[]; // <-- Exponemos los items para el contexto
  addItemToCart: (prodVarianteId: number, cantidad: number) => Promise<void>;
  updateItemQuantity: (itemId: number, newQuantity: number) => Promise<void>;
  removeItemFromCart: (itemId: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioGet | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 1. Cargar usuario desde localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      setUser(JSON.parse(storedUserData));
    }
  }, []);

  // 2. SWR para obtener el carrito del usuario
  const userId = user?.id;
  const {
    data: cartData,
    error: cartError,
    isLoading: isCartLoading,
  } = useSWR<CarritoGet[]>(
    userId ? `/api/venta/carrito/porcliente/${userId}` : null,
    apiFetcher
  );

  // 3. SWR para obtener los items del carrito
  const SWR_ITEMS_KEY = cartId
    ? `/api/venta/itemcarrito/porcarrito/${cartId}`
    : null;
  const { data: cartItems, isLoading: isItemsLoading } = useSWR<
    ItemCarritoGet[]
  >(SWR_ITEMS_KEY, apiFetcher);

  // 4. Actualizar el cartId cuando SWR lo encuentre
  useEffect(() => {
    if (cartData && cartData.length > 0) {
      setCartId(cartData[0].id);
    } else if (cartData) {
      setCartId(null);
    }
  }, [cartData]);

  // 5. La función principal: Obtener/Crear Carrito
  const getOrCreateCart = async (): Promise<number> => {
    if (!user) {
      throw new Error("Debes iniciar sesión para añadir productos al carrito.");
    }
    if (cartId) return cartId;

    if (cartData && cartData.length === 0) {
      setGlobalLoading(true);
      try {
        const newCart = await apiFetcher<CarritoGet>("/api/venta/carrito", {
          method: "POST",
          body: JSON.stringify({ clienteId: user.id }),
        });
        setCartId(newCart.id);
        return newCart.id;
      } catch (err) {
        throw new Error("No se pudo crear el carrito.");
      } finally {
        setGlobalLoading(false);
      }
    }
    throw new Error("Obteniendo información del carrito...");
  };

  // 6. La función para añadir items
  const addItemToCart = async (prodVarianteId: number, cantidad: number) => {
    setGlobalLoading(true);
    setError(null);
    console.log(prodVarianteId, cantidad)
    try {
      const currentCartId = await getOrCreateCart();
      const itemSet: ItemCarritoSet = {
        carritoId: currentCartId,
        prodVarianteId: prodVarianteId,
        cantidad: cantidad,
      };
      await apiFetcher("/api/venta/itemcarrito", {
        method: "POST",
        body: JSON.stringify(itemSet),
      });
      mutate(SWR_ITEMS_KEY); // Refresca la lista de items
      alert("¡Producto añadido al carrito!");
    } catch (err: any) {
      setError(err);
      alert(`Error del cartcontext: ${err.message}`);
    } finally {
      setGlobalLoading(false);
    }
  };

  // --- 7. NUEVA FUNCIÓN: Actualizar Cantidad ---
  const updateItemQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return; // No permitir cantidad 0 o negativa

    const itemToUpdate = cartItems?.find((item) => item.id === itemId);
    if (!itemToUpdate) return;

    // DTO para el backend
    const itemSet: ItemCarritoSet = {
      carritoId: itemToUpdate.carritoId,
      prodVarianteId: itemToUpdate.prodVariante.id,
      cantidad: newQuantity,
    };

    // Actualización Optimista (Opcional, pero mejora la UI)
    const newItems =
      cartItems?.map((item) =>
        item.id === itemId ? { ...item, cantidad: newQuantity } : item
      ) || [];
    mutate(SWR_ITEMS_KEY, newItems, false); // Actualiza la UI localmente sin re-validar

    try {
      await apiFetcher(`/api/venta/itemcarrito/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(itemSet),
      });
    } catch (err: any) {
      alert(`Error al actualizar: ${err.message}`);
      mutate(SWR_ITEMS_KEY); // Revertir si hay error
    }
    // Nota: Podríamos no re-validar al final si confiamos en la UI optimista,
    // pero es más seguro hacerlo:
    // finally { mutate(SWR_ITEMS_KEY); }
  };

  // --- 8. NUEVA FUNCIÓN: Quitar Item ---
  const removeItemFromCart = async (itemId: number) => {
    // Actualización Optimista
    const newItems = cartItems?.filter((item) => item.id !== itemId) || [];
    mutate(SWR_ITEMS_KEY, newItems, false); // Actualiza UI local

    try {
      await apiFetcher(`/api/venta/itemcarrito/${itemId}`, {
        method: "DELETE",
      });
      // La UI ya está actualizada, pero forzamos un re-fetch para asegurar consistencia
      mutate(SWR_ITEMS_KEY);
    } catch (err: any) {
      alert(`Error al quitar: ${err.message}`);
      mutate(SWR_ITEMS_KEY); // Revertir si hay error
    }
  };

  const value: CartContextType = {
    cartId,
    itemCount: cartItems?.length || 0,
    items: cartItems || [],
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    isLoading:
      globalLoading || isCartLoading || (!!userId && !cartData && !cartError),
    error: error || cartError,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}
