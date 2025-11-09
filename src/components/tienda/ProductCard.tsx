"use client";

import Link from "next/link";
import { ProductoGet } from "@/types/catalogo/producto";
import { Package } from "lucide-react";

interface ProductCardProps {
  producto: ProductoGet;
}

export default function ProductCard({ producto }: ProductCardProps) {
  return (
    // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
    // Ahora apunta a la página de detalle del producto
    <Link
      href={`/producto/${producto.id}`} // <- ANTES: /producto/[id]?variante=[id]
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="flex aspect-square w-full items-center justify-center rounded-md bg-gray-100 text-gray-400">
        <Package className="h-20 w-20" />
      </div>

      <div className="flex-1 pt-4">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600">
          {producto.nombre}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {producto.descripcion || "Sin descripción."}
        </p>
      </div>

      <div className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700">
        Ver Opciones
      </div>
    </Link>
  );
}