import { ProductoGet } from "../catalogo/producto";
import { ColorGet } from "../categorias/color";
import { TallaGet } from "../categorias/talla";

interface ProdVarianteGet {
  id: number;
  producto: ProductoGet;
  color: ColorGet;
  talla: TallaGet;
  costo: number;
  ppp: number;
  ppv:number;
  precio: number;
  sku: string;
  stock: number;
}
interface ProdVarianteSet {
  producto: number;
  color: number;
  talla: number;
  costo: number;
  precio: number;
  sku: string;
  stock: number;
}
interface ProdVarianteList {
  id: number;
  producto: string;
  color: string;
  talla: string;
  costo: number;
  precio: number;
  sku: string;
  stock: number;
}
export type { ProdVarianteGet, ProdVarianteSet, ProdVarianteList };
