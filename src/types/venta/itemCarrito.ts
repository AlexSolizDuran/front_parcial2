/**
 * Representa el DTO: ItemCarritoResponseDTO
 */
export interface ItemCarritoGet {
  id: number;
  carritoId: number;
  prodVariateId: number; // OJO: tu DTO dice 'prodVariateId'
  cantidad: number;
  fecha: string;
}

/**
 * Representa el DTO: ItemCarritoRequestDTO
 */
export interface ItemCarritoSet {
  carritoId: number;
  prodVariableId: number; // Tu DTO dice 'prodVariableId'
  cantidad: number;
}