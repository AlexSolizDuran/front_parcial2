interface ProductoGet {
  id: string;
  nombre: string;
  descripcion: string;
  modelo: string;
  categoria: string;
  material: string;
  etiquetas: string[];
  imagen?: string | null;
}
interface ProductoSet {
  descripcion: string;
  modelo: string;
  categoria: string;
  material: string;
  etiquetas: string[];
  imagen?: string | null;
}
export type { ProductoGet, ProductoSet };
