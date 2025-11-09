"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { VentaGet, VentaSet } from "@/types/venta/venta";
import { DetalleVentaSet } from "@/types/venta/detalleVenta";
import { apiFetcher } from "@/lib/apiFetcher";
import Link from "next/link";

import Section from "../forms/Section";
import FormField from "../forms/FormField";
import {
  User,
  DollarSign,
  ShoppingCart,
  PlusCircle,
  Trash2,
  Package,
} from "lucide-react";

import { useClientes } from "@/hooks/useClientes";
import { useProdVariantes } from "@/hooks/useProdVariantes";
import { useAuthUser } from "@/hooks/useAuthUser"; // Import useAuthUser
import { ProdVarianteGet, ProdVarianteList } from "@/types/stock/prodVariante";

interface VentaFormProps {
  // No edit mode for now, as per "crear la venta"
}

interface DetalleVentaFormItem extends DetalleVentaSet {
  tempId: number; // For React list keys
  prodVariante?: ProdVarianteGet; // To store selected variant details
}

export default function VentaForm({}: VentaFormProps) {
  const router = useRouter();
  const authUser = useAuthUser(); // Get the authenticated user

  const [ventaData, setVentaData] = useState<VentaSet>({
    clienteID: "",
    vendedorID: "",
    metodoPago: "",
    tipoVenta: "Presencial",
  });
  const [detalleVentaItems, setDetalleVentaItems] = useState<
    DetalleVentaFormItem[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser && authUser.id) {
      setVentaData((prev) => ({ ...prev, vendedorID: authUser.id }));
    }
  }, [authUser]);

  const { clientes } = useClientes();
  const { prodVariantes } = useProdVariantes();
  // console.log(prodVariantes); // Debugging

  const prodVarianteMap = useMemo(() => {
    const map = new Map<string, ProdVarianteList>();
    prodVariantes?.forEach((pv) => map.set(String(pv.id), pv));
    return map;
  }, [prodVariantes]);

  // --- Calculate total ---
  const totalVenta = useMemo(() => {
    return detalleVentaItems.reduce(
      (sum, item) => sum + parseFloat(item.subtotal || "0"),
      0
    );
  }, [detalleVentaItems]);

  // --- Handlers for main ventaData ---
  const handleVentaDataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVentaData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handlers for detalleVentaItems ---
  const handleAddDetalle = () => {
    setDetalleVentaItems((prev) => [
      ...prev,
      {
        tempId: Date.now(), // Unique key for new item
        prodVarianteId: "",
        cantidad: "1",
        precio_unit: "0.00",
        descuento: "0.00",
        subtotal: "0.00",
        ventaId: "", // Will be filled on submit
      },
    ]);
  };

  const handleRemoveDetalle = (tempId: number) => {
    setDetalleVentaItems((prev) =>
      prev.filter((item) => item.tempId !== tempId)
    );
  };

  const handleDetalleChange = (
    tempId: number,
    field: keyof DetalleVentaSet | "prodVariante",
    value: string | ProdVarianteGet
  ) => {
    setDetalleVentaItems((prev) =>
      prev.map((item) => {
        if (item.tempId === tempId) {
          let updatedItem = { ...item };

          if (field === "prodVariante") {
            const selectedVariant = value as ProdVarianteGet;
            // console.log("handleDetalleChange: selectedVariant =", selectedVariant); // Debugging
            updatedItem.prodVarianteId = selectedVariant.id;
            updatedItem.prodVariante = selectedVariant;

            // --- FIX 1 ---
            // Asignación de precio más robusta. Si selectedVariant.precio es null o undefined, usa "0.00".
            updatedItem.precio_unit = String(selectedVariant.precio || "0.00");

            // console.log("handleDetalleChange: updatedItem.precio_unit after setting =", updatedItem.precio_unit); // Debugging
          } else {
            // @ts-ignore - TypeScript struggles with dynamic key assignment here
            updatedItem[field] = value;
          }

          // Recalculate subtotal
          const cantidad = parseFloat(updatedItem.cantidad || "0");
          const precioUnit = parseFloat(updatedItem.precio_unit || "0");
          const descuento = parseFloat(updatedItem.descuento || "0");
          updatedItem.subtotal = String(
            (cantidad * precioUnit - descuento).toFixed(2)
          );
          // console.log("handleDetalleChange: updatedItem.subtotal =", updatedItem.subtotal); // Debugging

          return updatedItem;
        }
        return item;
      })
    );
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Basic validation
    if (
      !ventaData.clienteID ||
      !ventaData.vendedorID ||
      !ventaData.metodoPago ||
      !ventaData.tipoVenta
    ) {
      setError("Por favor, complete los datos principales de la venta.");
      setIsSaving(false);
      return;
    }
    if (detalleVentaItems.length === 0) {
      setError("Debe añadir al menos un producto a la venta.");
      setIsSaving(false);
      return;
    }
    if (
      detalleVentaItems.some(
        (item) => !item.prodVarianteId || parseFloat(item.cantidad || "0") <= 0
      )
    ) {
      setError(
        "Asegúrese de seleccionar un producto y una cantidad válida para cada detalle."
      );
      setIsSaving(false);
      return;
    }

    try {
      // 1. Create the main Venta
      const ventaPayload: VentaSet = {
        ...ventaData,
        // Ensure IDs are strings, even if they come from select values
        clienteID: String(ventaData.clienteID),
        vendedorID: String(ventaData.vendedorID),
      };

      const createdVenta: VentaGet = await apiFetcher("/api/venta/venta", {
        method: "POST",
        body: JSON.stringify(ventaPayload),
      });

      // 2. Create DetalleVenta items
      const detalleVentaPayloads: DetalleVentaSet[] = detalleVentaItems.map(
        (item) => ({
          prodVarianteId: item.prodVarianteId,
          cantidad: item.cantidad,
          precio_unit: item.precio_unit,
          descuento: item.descuento,
          subtotal: item.subtotal,
          ventaId: createdVenta.id, // Link to the newly created Venta
        })
      );

      // Send each detalleVenta separately or as a batch if your API supports it
      // For simplicity, sending one by one. A batch endpoint would be better.
      for (const detalle of detalleVentaPayloads) {
        await apiFetcher("/api/venta/detalleVenta", {
          method: "POST",
          body: JSON.stringify(detalle),
        });
      }

      router.push(`/admin/venta/registro`); // Redirect to sales list
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al registrar la venta.");
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
        {/* Main Venta Data */}
        <div className="lg:col-span-1 space-y-8">
          <Section icon={<ShoppingCart size={20} />} title="Datos de la Venta">
            <FormField label="Cliente">
              <select
                name="clienteID"
                value={ventaData.clienteID}
                onChange={handleVentaDataChange}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Seleccione un cliente</option>
                {clientes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.apellido}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Vendedor">
              <select
                name="vendedorID"
                value={ventaData.vendedorID}
                onChange={handleVentaDataChange}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
                disabled
              >
                <option value="">
                  {authUser
                    ? `${authUser.nombre} ${authUser.apellido}`
                    : "Cargando vendedor..."}
                </option>
                {/* No need to map vendedores here as it's pre-filled */}
              </select>
            </FormField>
            <FormField label="Método de Pago">
              <select
                name="metodoPago"
                value={ventaData.metodoPago}
                onChange={handleVentaDataChange}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="">Seleccione método</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="QR">QR</option>
              </select>
            </FormField>
          </Section>
        </div>

        {/* Detalle Venta Items */}
        <div className="lg:col-span-2 space-y-8">
          <Section icon={<Package size={20} />} title="Productos de la Venta">
            <div className="space-y-4">
              {detalleVentaItems.map((item) => (
                <div
                  key={item.tempId}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end p-4 border rounded-lg bg-gray-50"
                >
                  <div className="md:col-span-2">
                    <FormField label="Producto">
                      <select
                        value={String(item.prodVarianteId || "")}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const selectedVariant =
                            prodVarianteMap.get(selectedId);

                          handleDetalleChange(
                            item.tempId,
                            "prodVariante",
                            selectedVariant ||
                              ({ id: "", precio: "0.00" } as any)
                          );
                        }}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      >
                        <option value="">Seleccione variante</option>
                        {prodVariantes?.map((pv) => (
                          <option key={pv.id} value={String(pv.id)}>
                            {pv.producto} ({pv.color}, {pv.talla}) - $
                            {pv.precio}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Cantidad">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) =>
                          handleDetalleChange(
                            item.tempId,
                            "cantidad",
                            e.target.value
                          )
                        }
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Precio Unit.">
                      <input
                        type="number"
                        step="0.01"
                        value={item.precio_unit}
                        onChange={(e) =>
                          handleDetalleChange(
                            item.tempId,
                            "precio_unit",
                            e.target.value
                          )
                        }
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        readOnly // Price comes from variant, can be made editable if needed
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Descuento">
                      <input
                        type="number"
                        step="0.01"
                        value={item.descuento}
                        onChange={(e) =>
                          handleDetalleChange(
                            item.tempId,
                            "descuento",
                            e.target.value
                          )
                        }
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </FormField>
                  </div>
                  <div>
                    <FormField label="Subtotal">
                      <input
                        type="text"
                        value={parseFloat(item.subtotal || "0").toFixed(2)}
                        readOnly
                        className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                      />
                    </FormField>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetalle(item.tempId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddDetalle}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <PlusCircle size={20} className="mr-2" /> Añadir Producto
            </button>
            <div className="text-right text-xl font-bold mt-4">
              Total: ${totalVenta.toFixed(2)}
            </div>
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Link
          href="/admin/venta/registro"
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSaving ? "Registrando Venta..." : "Registrar Venta"}
        </button>
      </div>
    </form>
  );
}
