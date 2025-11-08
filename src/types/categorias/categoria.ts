interface CategoriaGet {
  id: string;
  nombre: string;
  padreId:string
}
interface CategoriaSet {
  nombre: string;
  padreId: string;
}
interface CategoriaTree {
  id: string;
  nombre: string;
  hijos: CategoriaTree[];
}
export type { CategoriaGet, CategoriaSet, CategoriaTree };
