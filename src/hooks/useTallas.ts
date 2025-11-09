import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { TallaGet } from "@/types/categorias/talla";

export function useTallas() {
  const { data, error, isLoading, mutate } = useSWR<TallaGet[]>("/api/inventario/talla", apiFetcher);
  return {
    tallas: data,
    isLoadingTallas: isLoading,
    errorTallas: error,
    mutateTallas: mutate, // Return mutate function
  };
}
