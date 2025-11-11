"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { UsuarioGet, UsuarioSet } from "@/types/usuario/usuario";
import { apiFetcher } from "@/lib/apiFetcher";
import Link from "next/link";
import { User, Lock, Phone, Mail, Tag } from "lucide-react";
import  FormField from "@/components/forms/FormField";
import Section from "@/components/forms/Section";

interface UserFormProps {
  userParaEditar?: UsuarioGet;
  rolFijoId?: number; // New: if the role ID is fixed
}


export default function UserForm({ userParaEditar, rolFijoId }: UserFormProps) {
  const router = useRouter();
  const [data, setData] = useState<UsuarioSet>({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    username: "",
    telefono: 0,
    rolId: 3, 
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch roles for dropdown

  const isEditMode = Boolean(userParaEditar);

  useEffect(() => {
    if (isEditMode && userParaEditar) {
      setData({
        nombre: userParaEditar.nombre,
        apellido: userParaEditar.apellido,
        email: userParaEditar.email,
        password: "", // Password is not pre-filled for security
        username: userParaEditar.username,
        telefono: userParaEditar.telefono,
        rolId: 3// If rolFijoId is provided, use it
               
      });
    }
  }, [isEditMode, userParaEditar, rolFijoId]); // Add rolFijoId to dependencies

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!data.nombre || !data.apellido || !data.email || !data.username || (!isEditMode && !data.password)) {
      setError("Todos los campos obligatorios deben ser rellenados.");
      setIsSaving(false);
      return;
    }

    try {
      const payload = { ...data };
      
      console.log(payload)
      const result: UsuarioGet = await apiFetcher(
        isEditMode ? `/api/usuario/usuario/${userParaEditar!.id}` : "/api/usuario/usuario",
        {
          method: isEditMode ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      router.push(`/admin/usuario/vendedor/${result.id}`); // Redirect to details page
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el usuario.");
    } finally {
      setIsSaving(false);
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg shadow-sm">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section icon={<User size={20} />} title="Datos Personales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Nombre">
                <input type="text" name="nombre" value={data.nombre} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </FormField>
              <FormField label="Apellido">
                <input type="text" name="apellido" value={data.apellido} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </FormField>
              <FormField label="Email">
                <input type="email" name="email" value={data.email} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
              </FormField>
              <FormField label="Teléfono">
                <input type="tel" name="telefono" value={data.telefono} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </FormField>
            </div>
          </Section>
        </div>

        <div className="space-y-8">
          <Section icon={<Lock size={20} />} title="Credenciales ">
            <FormField label="Username">
              <input type="text" name="username" value={data.username} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
            </FormField>
            <FormField label="Contraseña">
              <input type="password" name="password" value={data.password} onChange={handleChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required={!isEditMode} />
              {isEditMode && <p className="text-xs text-gray-500 mt-1">Dejar en blanco para no cambiar la contraseña.</p>}
            </FormField>
            
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Link href="/admin/usuario/vendedor" className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">Cancelar</Link>
        <button type="submit" disabled={isSaving} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">{isSaving ? "Guardando..." : "Guardar Cambios"}</button>
      </div>
    </form>
  );
}