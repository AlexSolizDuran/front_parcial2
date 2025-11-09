interface ProductoGet {
  id: number; // Era: string
  nombre: string;
  descripcion: string;
  modelo: number; // Era: string
  categoria: number; // Era: string
  material: number; // Era: string
  etiquetas: number[]; // Era: string[]
}
interface ProductoSet {
  descripcion: string;
  modelo: string; // Al enviar, el ID se convierte a string (JSON)
  categoria: string; // Al enviar, el ID se convierte a string
  material: string; // Al enviar, el ID se convierte a string
  etiquetas: string[]; // Al enviar, los IDs se convierten a string
}

export type { ProductoGet, ProductoSet };
