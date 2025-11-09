import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { MarcaGet } from "@/types/categorias/marca";

export function useMarcas() {
  const { data, error, isLoading, mutate } = useSWR<MarcaGet[]>("/api/producto/marca", apiFetcher);
  return {
    marcas: data,
    isLoadingMarcas: isLoading,
    errorMarcas: error,
    mutateMarcas: mutate, // Return mutate function
  };
}
