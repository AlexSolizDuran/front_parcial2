"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProdVarianteGet, ProdVarianteSet } from "@/types/stock/prodVariante";
import { apiFetcher } from "@/lib/apiFetcher";
import Link from "next/link";
import { FileText, DollarSign, Hash, Package } from "lucide-react";

// Import custom hooks
import { useProductos } from "@/hooks/useProductos";
import { useColores } from "@/hooks/useColores";
import { useTallas } from "@/hooks/useTallas";

import FormField from "@/components/forms/FormField";
import Section from "@/components/forms/Section";

interface ProdVarianteFormProps {
  varianteParaEditar?: ProdVarianteGet;
}

export default function ProdVarianteForm({
  varianteParaEditar,
}: ProdVarianteFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ProdVarianteSet>({
    producto: 0,
    color: 0,
    talla: 0,
    costo: 0,
    precio: 0,
    sku: "",
    stock: 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Use custom hooks for fetching related data for dropdowns ---
  const { productos } = useProductos();
  const { colores } = useColores();
  const { tallas } = useTallas();

  const isEditMode = Boolean(varianteParaEditar);

  useEffect(() => {
    if (isEditMode && varianteParaEditar) {
      setData({
        producto: varianteParaEditar.producto.id,
        color: varianteParaEditar.color.id,
        talla: Number(varianteParaEditar.talla.id),
        costo: (varianteParaEditar.costo),
        precio: (varianteParaEditar.precio),
        sku: String(varianteParaEditar.sku),
        stock: (varianteParaEditar.stock),
      });
    }
  }, [isEditMode, varianteParaEditar]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Tu lógica de handleChange es perfectamente correcta
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!data.producto || !data.color || !data.talla || !data.stock) {
      setError("Producto, Color, Talla y Stock son obligatorios.");
      setIsSaving(false);
      return;
    }

    try {
      const result: ProdVarianteGet = await apiFetcher(
        isEditMode
          ? `/api/inventario/prodVariante/${varianteParaEditar!.id}`
          : "/api/inventario/prodVariante",
        {
          method: isEditMode ? "PUT" : "POST",
          body: JSON.stringify(data),
        }
      );
      router.push(`/admin/inventario/stock/${result.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar la variante.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="text-red-600 bg-red-100 p-4 rounded-lg shadow-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section icon={<Package size={20} />} title="Detalles de la Variante">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Producto">
                <select
                  name="producto"
                  value={data.producto}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {productos?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Color">
                <select
                  name="color"
                  value={data.color}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccione un color</option>
                  {colores?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Talla">
                <select
                  name="talla"
                  value={data.talla}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Seleccione una talla</option>
                  {tallas?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.talla}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="SKU (Código de Variante)">
              <input
                type="text"
                name="sku"
                value={data.sku}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </FormField>
          </Section>

          <Section icon={<DollarSign size={20} />} title="Precios y Costos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Costo">
                <input
                  type="number"
                  step="0.01"
                  name="costo"
                  value={data.costo}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </FormField>
              <FormField label="Precio de Venta">
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={data.precio}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </FormField>
            </div>
          </Section>
        </div>

        <div className="space-y-8">
          <Section icon={<Hash size={20} />} title="Inventario">
            <FormField label="Cantidad en Stock">
              <input
                type="number"
                name="stock"
                value={data.stock}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </FormField>
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Link
          href="/admin/inventario/stock"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
