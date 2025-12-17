"use client";

import Link from "next/link";
import { ProductoGet } from "@/types/catalogo/producto";
import { Package } from "lucide-react";
import Image from "next/image";

interface ProductCardProps {
  producto: ProductoGet;
}

export default function ProductCard({ producto }: ProductCardProps) {
  return (
    <Link
      href={`/producto/${producto.id}`}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      {/* SOLUCIÓN: Agregamos "relative" a este div. 
         Esto hace que el <Image fill /> se limite a este cuadro y no a toda la tarjeta.
      */}
      <div className="relative flex aspect-square w-full items-center justify-center rounded-md bg-gray-100 text-gray-400 overflow-hidden">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill // Ocupa todo el espacio del padre "relative"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // Limpié la lógica repetida que tenías aquí
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            <Package className="h-20 w-20" />
          </div>
        )}
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