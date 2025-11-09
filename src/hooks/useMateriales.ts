import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { MaterialGet } from "@/types/categorias/material";

export function useMateriales() {
  const { data, error, isLoading, mutate } = useSWR<MaterialGet[]>("/api/producto/material", apiFetcher);
  return {
    materiales: data,
    isLoadingMateriales: isLoading,
    errorMateriales: error,
    mutateMateriales: mutate, // Return mutate function
  };
}
