/**
 * Representa el DTO: CarritoResponseDTO
 */
export interface CarritoGet {
  id: number;
  clienteId: number;
  fecha: string; // LocalDateTime se convierte en string
  estado: string;
}

/**
 * Representa el DTO: CarritoRequestDTO
 */
export interface CarritoSet {
  clienteId: number;
}