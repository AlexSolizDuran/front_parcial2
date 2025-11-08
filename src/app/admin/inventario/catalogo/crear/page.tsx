"use client";
import ProductoForm from "@/components/producto/ProductoForm";

export default function CrearProductoPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Crear Nuevo Producto
      </h1>
      <ProductoForm />
    </div>
  );
}
