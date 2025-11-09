import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { EtiquetaGet } from "@/types/categorias/etiqueta";

export function useEtiquetas() {
  const { data, error, isLoading, mutate } = useSWR<EtiquetaGet[]>("/api/producto/etiqueta", apiFetcher);
  return {
    etiquetas: data,
    isLoadingEtiquetas: isLoading,
    errorEtiquetas: error,
    mutateEtiquetas: mutate, // Return mutate function
  };
}
