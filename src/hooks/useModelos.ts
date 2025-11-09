import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ModeloGet } from "@/types/categorias/modelo";

export function useModelos() {
  const { data, error, isLoading, mutate } = useSWR<ModeloGet[]>("/api/producto/modelo", apiFetcher);
  return {
    modelos: data,
    isLoadingModelos: isLoading,
    errorModelos: error,
    mutateModelos: mutate, // Return mutate function
  };
}
