import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";

export function useProductos() {
  const { data, error, isLoading } = useSWR<ProductoGet[]>("/api/producto/producto", apiFetcher);
  return {
    productos: data,
    isLoadingProductos: isLoading,
    errorProductos: error,
  };
}
