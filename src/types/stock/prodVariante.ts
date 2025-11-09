import { ProductoGet } from "../catalogo/producto";
import { ColorGet } from "../categorias/color";
import { TallaGet } from "../categorias/talla";

interface ProdVarianteGet {
  id: string;
  producto: ProductoGet;
  color: ColorGet;
  talla: TallaGet;
  costo: string;
  ppp: string;
  precio: string;
  sku: string;
  stock: string;
}
interface ProdVarianteSet {
  producto: string;
  color: string;
  talla: string;
  costo: string;
  ppp: string;
  precio: string;
  sku: string;
  stock: string;
}
interface ProdVarianteList {
  id: string;
  producto: string;
  color: string;
  talla: string;
  costo: string;
  ppp: string;
  precio: string;
  sku: string;
  stock: string;
}
export type { ProdVarianteGet, ProdVarianteSet, ProdVarianteList };
