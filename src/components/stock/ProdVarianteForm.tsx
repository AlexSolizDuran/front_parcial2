"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { ProdVarianteGet, ProdVarianteSet } from "@/types/stock/prodVariante";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProductoGet } from "@/types/catalogo/producto";
import { ColorGet } from "@/types/categorias/color";
import { TallaGet } from "@/types/categorias/talla";
import Link from "next/link";
import { FileText, DollarSign, Hash, Package } from "lucide-react";

interface ProdVarianteFormProps {
  varianteParaEditar?: ProdVarianteGet;
}

export default function ProdVarianteForm({ varianteParaEditar }: ProdVarianteFormProps) {
  const router = useRouter();
  const [data, setData] = useState<ProdVarianteSet>({
    productoId: "",
    colorId: "",
    tallaId: "",
    costo: "",
    ppp: "",
    precio: "",
    sku: "",
    stock: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch related data for dropdowns ---
  const { data: productos } = useSWR<ProductoGet[]>("/api/producto/producto", apiFetcher);
  const { data: colores } = useSWR<ColorGet[]>("/api/inventario/color", apiFetcher);
  const { data: tallas } = useSWR<TallaGet[]>("/api/inventario/talla", apiFetcher);

  const isEditMode = Boolean(varianteParaEditar);

  useEffect(() => {
    if (isEditMode && varianteParaEditar) {
      setData({
        productoId: varianteParaEditar.producto.id,
        colorId: varianteParaEditar.color.id,
        tallaId: varianteParaEditar.talla.id,
        costo: String(varianteParaEditar.costo),
        ppp: String(varianteParaEditar.ppp),
        precio: String(varianteParaEditar.precio),
        sku: String(varianteParaEditar.sku),
        stock: String(varianteParaEditar.stock),
      });
    }
  }, [isEditMode, varianteParaEditar]);

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

    if (!data.productoId || !data.colorId || !data.tallaId || !data.stock) {
      setError("Producto, Color, Talla y Stock son obligatorios.");
      setIsSaving(false);
      return;
    }

    try {
      const result: ProdVarianteGet = await apiFetcher(
        isEditMode ? `/api/stock/prodVariante/${varianteParaEditar!.id}` : "/api/stock/prodVariante",
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

  const Section = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-4 border-b pb-3">
        {icon}
        <span className="ml-3">{title}</span>
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg shadow-sm">{error}</div>}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Section icon={<Package size={20} />} title="Detalles de la Variante">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Producto">
                <select name="productoId" value={data.productoId} onChange={handleChange} className="input-class" required>
                  <option value="">Seleccione un producto</option>
                  {productos?.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Color">
                <select name="colorId" value={data.colorId} onChange={handleChange} className="input-class" required>
                  <option value="">Seleccione un color</option>
                  {colores?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </FormField>
              <FormField label="Talla">
                <select name="tallaId" value={data.tallaId} onChange={handleChange} className="input-class" required>
                  <option value="">Seleccione una talla</option>
                  {tallas?.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </FormField>
            </div>
            <FormField label="SKU (Código de Variante)">
              <input type="text" name="sku" value={data.sku} onChange={handleChange} className="input-class" />
            </FormField>
          </Section>

          <Section icon={<DollarSign size={20} />} title="Precios y Costos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Costo">
                <input type="number" step="0.01" name="costo" value={data.costo} onChange={handleChange} className="input-class" />
              </FormField>
              <FormField label="PPP (Precio Promedio Ponderado)">
                <input type="number" step="0.01" name="ppp" value={data.ppp} onChange={handleChange} className="input-class" />
              </FormField>
              <FormField label="Precio de Venta">
                <input type="number" step="0.01" name="precio" value={data.precio} onChange={handleChange} className="input-class" />
              </FormField>
            </div>
          </Section>
        </div>

        <div className="space-y-8">
          <Section icon={<Hash size={20} />} title="Inventario">
            <FormField label="Cantidad en Stock">
              <input type="number" name="stock" value={data.stock} onChange={handleChange} className="input-class" required />
            </FormField>
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Link href="/admin/inventario/stock" className="btn-secondary">Cancelar</Link>
        <button type="submit" disabled={isSaving} className="btn-primary">{isSaving ? "Guardando..." : "Guardar Cambios"}</button>
      </div>
    </form>
  );
}
