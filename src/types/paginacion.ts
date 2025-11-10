interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/**
 * Interfaz para el objeto 'pageable' que describe
 * el estado de la paginación.
 */
interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

/**
 * Esta es la interfaz genérica principal para la respuesta de paginación
 * de Spring Boot. Puedes usarla para CUALQUIER tipo de contenido.
 *
 * <T> será el tipo de tu DTO (ej: UsuarioListDTO, ProductoListDTO, etc.)
 */
interface Paginacion<T> {
  content: T[]; // El array con tus datos (usuarios, productos, etc.)
  pageable: Pageable;
  last: boolean;          // true si es la última página
  totalPages: number;     // Total de páginas
  totalElements: number;  // Total de elementos en la BD
  size: number;           // Tamaño de la página
  number: number;         // Número de la página actual (base 0)
  sort: Sort;
  first: boolean;         // true si es la primera página
  numberOfElements: number; // Cuántos elementos hay en ESTA página
  empty: boolean;         // true si la página está vacía
}
export type { Paginacion };