import Navbar from "@/components/tienda/NavBar";
import { CartProvider } from "@/context/CartContext"; // <-- 1. Importar
import React from "react";

export default function TiendaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 2. Envolver todo con el CartProvider
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">{children}</main>
        {/* <Footer /> */}
      </div>
    </CartProvider>
  );
}