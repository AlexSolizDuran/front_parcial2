"use client";
import UserForm from "@/components/usuario/UserForm";

export default function CrearVendedorPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Crear Nuevo Vendedor
      </h1>
      <UserForm rolFijoId="2" />
    </div>
  );
}
