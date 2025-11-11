interface ProductoGet {
  id: number; // Era: string
  nombre: string;
  descripcion: string;
  imagen:string;
  modelo: number; // Era: string
  categoria: number; // Era: string
  material: number; // Era: string
  etiquetas: number[]; // Era: string[]
}
interface ProductoSet {
  descripcion: string;
  modelo: number; // Al enviar, el ID se convierte a string (JSON)
  categoria: number; // Al enviar, el ID se convierte a string
  imagen:string;
  material: number; // Al enviar, el ID se convierte a string
  etiquetas: number[]; // Al enviar, los IDs se convierten a string
}

export type { ProductoGet, ProductoSet };
