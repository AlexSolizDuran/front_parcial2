interface CategoriaGet {
  id: number;
  nombre: string;
  padreId:number
}
interface CategoriaSet {
  nombre: string;
  padreId: number;
}
interface CategoriaTree {
  id: number;
  nombre: string;
  hijos: CategoriaTree[];
}
export type { CategoriaGet, CategoriaSet, CategoriaTree };
