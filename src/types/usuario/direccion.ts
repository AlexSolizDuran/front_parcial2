/**
 * Representa el DTO: DireccionResponseDTO
 */
export interface DireccionGet {
  id: number;
  departamento: string;
  zona: string;
  calle: string;
  numeroCasa: string;
  referencia: string;
  usuarioId: number;
}

/**
 * Representa el DTO: DireccionRequestDTO
 */
export interface DireccionSet {
  usuarioId: number;
  departamento: string;
  zona: string;
  calle: string;
  numeroCasa: string;
  referencia: string;
}