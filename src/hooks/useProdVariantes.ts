import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import { ProdVarianteGet, ProdVarianteList } from "@/types/stock/prodVariante";
import { useMemo } from "react";

// Import other hooks for related data
import { useProductos } from "./useProductos";
import { useColores } from "./useColores";
import { useTallas } from "./useTallas";

export function useProdVariantes() { // Original function name
  // Fetch raw product variant data (which contains IDs for related entities)
  const { data: rawProdVariantes, error, isLoading, mutate } = useSWR<ProdVarianteList[]>("/api/inventario/prodVariante", apiFetcher);

  // Fetch related data using other hooks
  const { productos } = useProductos();
  const { colores } = useColores();
  const { tallas } = useTallas();

  // Create maps for quick lookup of names
  const productoMap = useMemo(() => new Map(productos?.map(p => [p.id, p.nombre])), [productos]);
  const colorMap = useMemo(() => new Map(colores?.map(c => [c.id, c.nombre])), [colores]);
  const tallaMap = useMemo(() => new Map(tallas?.map(t => [t.id, t.talla])), [tallas]);

  // Transform raw data into ProdVarianteList format
  const prodVariantesList = useMemo(() => {
    if (!rawProdVariantes || !productos || !colores || !tallas) return undefined;

    return rawProdVariantes.map(pv => ({
      id: pv.id,
      producto: productoMap.get(Number(pv.producto)) || "N/A",
      color: colorMap.get(Number(pv.color)) || "N/A",
      talla: tallaMap.get(Number(pv.talla)) || "N/A",
      costo: pv.costo,
      precio: pv.precio,
      sku: pv.sku,
      stock: pv.stock,
    })) as ProdVarianteList[];
  }, [rawProdVariantes, productos, colores, tallas, productoMap, colorMap, tallaMap]);

  return {
    prodVariantes: prodVariantesList, // Return the transformed list
    isLoadingProdVariantes: isLoading,
    errorProdVariantes: error,
    mutateProdVariantes: mutate,
  };
}
