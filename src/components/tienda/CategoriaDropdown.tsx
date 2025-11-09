"use client";

import Link from "next/link";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { CategoriaTree } from "@/types/categorias/categoria";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function CategoriaDropdown() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    data: categorias,
    error,
    isLoading,
  } = useSWR<CategoriaTree[]>("/api/producto/categoria/tree", apiFetcher);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dropdownClasses =
    "absolute left-0 top-full z-10 mt-2 w-56 origin-top-left scale-95 rounded-md bg-white shadow-lg opacity-0 ring-1 ring-black ring-opacity-5 transition-all duration-150 ease-in-out";

  return (
    <div className="group relative">
      <button className="flex items-center rounded-md px-3 py-2 font-medium text-gray-600 hover:text-gray-900 focus:outline-none">
        <span>Categorías</span>
        
        {/* Solución de icono: */}
        {isMounted && isLoading ? (
          <Loader2 className="ml-1 h-4 w-4 animate-spin" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
        )}
      </button>

      {/* Solución de Mismatch del Dropdown: */}
      <div
        className={`${dropdownClasses} group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100`}
      >
        <div className="py-1" role="menu" aria-orientation="vertical">
          {/* Renderizar contenido solo en el cliente */}
          {isMounted ? (
            <>
              {error && (
                <span className="block px-4 py-2 text-sm text-red-600">
                  Error al cargar
                </span>
              )}
              {isLoading && (
                <span className="block px-4 py-2 text-sm text-gray-500">
                  Cargando...
                </span>
              )}
              {categorias?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categoria/${cat.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  {cat.nombre}
                </Link>
              ))}
            </>
          ) : (
            // Placeholder para el renderizado del servidor
            <span className="block px-4 py-2 text-sm text-gray-500">
              ...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}