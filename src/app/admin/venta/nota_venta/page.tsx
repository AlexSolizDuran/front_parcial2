"use client";
import VentaForm from "@/components/venta/VentaForm";

export default function NotaVentaPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Registrar Nueva Venta
      </h1>
      <VentaForm />
    </div>
  );
}
