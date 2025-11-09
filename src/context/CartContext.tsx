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
import { UsuarioGet } from "@/types/usuario/usuarioGet";
import { CarritoGet, CarritoSet } from "@/types/venta/carrito";
import { ItemCarritoSet, ItemCarritoGet } from "@/types/venta/itemCarrito";

interface CartContextType {
  cartId: number | null;
  itemCount: number;
  addItemToCart: (prodVarianteId: number, cantidad: number) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UsuarioGet | null>(null);
  const [cartId, setCartId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const { data: cartData, error: cartError } = useSWR<CarritoGet[]>(
    userId ? `/api/venta/carrito/porcliente/${userId}` : null,
    apiFetcher
  );

  // 3. SWR para obtener los items del carrito (y contarlos)
  const { data: cartItems } = useSWR<ItemCarritoGet[]>(
    cartId ? `/api/venta/iteamcarrito/porcarrito/${cartId}` : null,
    apiFetcher
  );

  // 4. Actualizar el cartId cuando SWR lo encuentre
  useEffect(() => {
    if (cartData && cartData.length > 0) {
      setCartId(cartData[0].id);
    } else if (cartData) {
      // Si cartData es un array vacío, no hay carrito
      setCartId(null);
    }
  }, [cartData]);

  // 5. La función principal: Obtener/Crear Carrito
  const getOrCreateCart = async (): Promise<number> => {
    if (!user) {
      throw new Error("Debes iniciar sesión para añadir productos al carrito.");
    }

    // Si ya tenemos el ID, lo devolvemos
    if (cartId) return cartId;

    // Si SWR ya nos dijo que no hay carrito (cartData es []), lo creamos.
    if (cartData && cartData.length === 0) {
      setIsLoading(true);
      try {
        const newCart = await apiFetcher<CarritoGet>("/api/venta/carrito", {
          method: "POST",
          body: JSON.stringify({ clienteId: parseInt(user.id) }),
        });
        setCartId(newCart.id);
        return newCart.id;
      } catch (err) {
        throw new Error("No se pudo crear el carrito.");
      } finally {
        setIsLoading(false);
      }
    }

    // Si SWR aún está cargando, esperamos
    throw new Error("Obteniendo información del carrito...");
  };

  // 6. La función para añadir items
  const addItemToCart = async (prodVarianteId: number, cantidad: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const currentCartId = await getOrCreateCart();

      const itemSet: ItemCarritoSet = {
        carritoId: currentCartId,
        prodVariableId: prodVarianteId, // Asegúrate que coincida con tu DTO Request
        cantidad: cantidad,
      };

      await apiFetcher("/api/venta/iteamcarrito", {
        method: "POST",
        body: JSON.stringify(itemSet),
      });

      // 7. Refrescar la lista de items del carrito
      mutate(`/api/venta/iteamcarrito/porcarrito/${currentCartId}`);
      
      // ¡Éxito! (Puedes reemplazar esto con un Toast)
      alert("¡Producto añadido al carrito!");

    } catch (err: any) {
      setError(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    cartId,
    itemCount: cartItems?.length || 0,
    addItemToCart,
    isLoading: isLoading || (userId && !cartData && !cartError),
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