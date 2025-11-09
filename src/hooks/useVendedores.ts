import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioList } from "@/types/usuario/usuario";

export function useVendedores() {
  const { data, error, isLoading } = useSWR<UsuarioList[]>("/api/usuario/usuario?rol=VENDEDOR", apiFetcher);
  return {
    vendedores: data,
    isLoadingVendedores: isLoading,
    errorVendedores: error,
  };
}
