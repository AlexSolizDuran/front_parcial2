import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ColorGet } from "@/types/categorias/color";

export function useColores() {
  const { data, error, isLoading, mutate } = useSWR<ColorGet[]>("/api/inventario/color", apiFetcher);
  return {
    colores: data,
    isLoadingColores: isLoading,
    errorColores: error,
    mutateColores: mutate, // Return mutate function
  };
}
