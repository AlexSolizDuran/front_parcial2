"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { UsuarioGet } from "@/types/usuario/usuario";
import UserForm from "@/components/usuario/UserForm";

export default function EditarVendedorPage() {
  const params = useParams();
  const { id } = params;

  const {
    data: user,
    error,
    isLoading,
  } = useSWR<UsuarioGet>(
    id ? `/api/usuario/usuario/${id}` : null,
    apiFetcher
  );

  if (isLoading) return <div>Cargando usuario...</div>;
  if (error) return <div>Error al cargar el usuario.</div>;
  if (!user) return <div>Usuario no encontrado.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Editar Vendedor: {user.nombre} {user.apellido}
      </h1>
      <UserForm userParaEditar={user} />
    </div>
  );
}
