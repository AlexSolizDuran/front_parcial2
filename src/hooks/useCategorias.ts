import useSWR, { mutate } from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { CategoriaGet } from "@/types/categorias/categoria";

export function useCategorias() {
  const { data, error, isLoading, mutate } = useSWR<CategoriaGet[]>("/api/producto/categoria", apiFetcher);
  return {
    categorias: data,
    isLoadingCategorias: isLoading,
    errorCategorias: error,
    revalidateCategories: mutate, // Renamed mutate function
  };
}
