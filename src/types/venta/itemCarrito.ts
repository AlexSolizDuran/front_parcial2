// src/types/venta/itemCarrito.ts
import { ProdVarianteGet } from "@/types/stock/prodVariante"; // <-- AÑADIR IMPORT

/**
 * Representa el DTO: ItemCarritoResponseDTO
 */
export interface ItemCarritoGet {
  id: number;
  carritoId: number;
  prodVariante: ProdVarianteGet; // <-- ¡CAMBIO!
  cantidad: number;
  fecha: string;
}

/**
 * Representa el DTO: ItemCarritoRequestDTO
 */
export interface ItemCarritoSet {
  carritoId: number;
  prodVarianteId: number; 
  cantidad: number;
}