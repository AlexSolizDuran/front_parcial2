import { ProductoGet } from "../catalogo/producto";
import { ColorGet } from "../categorias/color";
import { TallaGet } from "../categorias/talla";

interface ProdVarianteGet {
  id: String;
  producto: ProductoGet;
  color: ColorGet;
  talla: TallaGet;
  costo: String;
  ppp: String;
  precio: String;
  sku: String;
  stock: String;
}
interface ProdVarianteSet {
  productoId: string;
  colorId: string;
  tallaId: string;
  costo: String;
  ppp: String;
  precio: String;
  sku: String;
  stock: String;
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
