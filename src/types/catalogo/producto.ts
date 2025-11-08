interface ProductoGet {
  id: string;
  nombre: string;
  descripcion: string;
  modelo: string;
  categoria: string;
  material: string;
  etiquetas: string[];
}
interface ProductoSet {
  descripcion: string;
  modelo: string;
  categoria: string;
  material: string;
  etiquetas: string[];
}
export type { ProductoGet, ProductoSet };
