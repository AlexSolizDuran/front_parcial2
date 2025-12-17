"use client";

import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import ProductCard from "@/components/tienda/ProductCard"; // Asegúrate de tener este componente
import { Loader2, SearchX, ShoppingBag } from "lucide-react";

export default function CatalogoPage() {
  const searchParams = useSearchParams();
  const busqueda = searchParams.get("buscar"); // Lee ?buscar=camisa de la URL

  // 1. Construir la URL del endpoint
  // Si hay búsqueda: /api/producto/producto?buscar=camisa
  // Si no hay búsqueda: /api/producto/producto (Trae todo)
  const endpoint = busqueda 
    ? `/api/producto/producto?buscar=${encodeURIComponent(busqueda)}`
    : "/api/producto/producto";

  // 2. Fetch de datos
  const { data: productos, error, isLoading } = useSWR<ProductoGet[]>(endpoint, apiFetcher);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* --- CABECERA DE LA PÁGINA --- */}
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {busqueda ? `Resultados para: "${busqueda}"` : "Catálogo de Productos"}
        </h1>
        {busqueda ? (
           <p className="text-sm text-gray-500 mt-2">
             Mostrando coincidencias con tu búsqueda.
           </p>
        ) : (
           <p className="text-sm text-gray-500 mt-2">
             Explora nuestra colección completa de productos exclusivos.
           </p>
        )}
      </div>

      {/* --- ESTADO DE CARGA --- */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-500">Cargando catálogo...</p>
        </div>
      )}

      {/* --- ESTADO DE ERROR --- */}
      {error && (
        <div className="text-center py-10 bg-red-50 rounded-xl border border-red-100">
          <p className="text-red-600 font-medium">Ocurrió un error al cargar los productos.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 text-sm text-red-700 underline hover:text-red-800"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* --- LISTADO DE PRODUCTOS --- */}
      {!isLoading && !error && (
        <>
          {productos && productos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          ) : (
            // --- ESTADO VACÍO (NO SE ENCONTRÓ NADA) ---
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <div className="flex justify-center mb-4">
                {busqueda ? (
                    <SearchX className="h-16 w-16 text-gray-300" />
                ) : (
                    <ShoppingBag className="h-16 w-16 text-gray-300" />
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {busqueda ? "No encontramos coincidencias" : "El catálogo está vacío"}
              </h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                {busqueda 
                  ? `No hay productos que coincidan con "${busqueda}". Intenta con palabras más generales.` 
                  : "Aún no hay productos registrados en el sistema."}
              </p>
              {busqueda && (
                  <a href="/producto" className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                      Ver todos los productos &rarr;
                  </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}