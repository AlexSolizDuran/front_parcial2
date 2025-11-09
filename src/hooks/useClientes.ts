import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioList } from "@/types/usuario/usuario";

export function useClientes() {
  const { data, error, isLoading } = useSWR<UsuarioList[]>("/api/usuario/usuario?rol=CLIENTE", apiFetcher);
  return {
    clientes: data,
    isLoadingClientes: isLoading,
    errorClientes: error,
  };
}
