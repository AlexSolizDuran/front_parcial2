// src/types/inventario/prodVariante.ts

import { ProductoGet } from "../catalogo/producto";
import { ColorGet } from "../categorias/color";
import { TallaGet } from "../categorias/talla";

export interface ProdVarianteGet {
  id: number;
  producto: ProductoGet;
  color: ColorGet;
  talla: TallaGet;
  costo: number;
  ppp: number;
  precio: number;
  sku: string;
  stock: number;
  imagen?: string; // (Añadido por si acaso, como en tu carrito/page.tsx)
}