import Navbar from "@/components/tienda/NavBar";
import { CartProvider } from "@/context/CartContext"; // <-- 1. Importar
import React from "react";

/**
 * Layout para las páginas privadas del cliente (perfil, mis pedidos, etc.).
 * Reutiliza el Navbar principal de la tienda.
 */
export default function ClienteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Envolver todo con el CartProvider
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          {/* Contenedor centrado para el contenido del perfil */}
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </CartProvider>
  );
}