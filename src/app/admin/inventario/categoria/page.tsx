import {
  LayoutGrid,
  Bookmark,
  Puzzle,
  Tag,
  Layers,
  Palette,
  Ruler,
  Icon as LucideIcon, // Renamed to avoid conflict with React's Icon type
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface CardLink {
  nombre: string;
  href: string;
  Icon: React.ElementType;
  color: string;
}

export default function Page() {
  const items: CardLink[] = [
    {
      nombre: "Categorías",
      href: "/admin/inventario/categoria/categoria",
      Icon: LayoutGrid,
      color: "from-blue-500 to-blue-600",
    },
    {
      nombre: "Etiquetas",
      href: "/admin/inventario/categoria/etiqueta",
      Icon: Tag,
      color: "from-green-500 to-green-600",
    },
    {
      nombre: "Marcas",
      href: "/admin/inventario/categoria/marca",
      Icon: Bookmark,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      nombre: "Modelos",
      href: "/admin/inventario/categoria/modelo",
      Icon: Puzzle,
      color: "from-purple-500 to-purple-600",
    },
    {
      nombre: "Materiales",
      href: "/admin/inventario/categoria/material",
      Icon: Layers,
      color: "from-red-500 to-red-600",
    },
    {
      nombre: "Colores",
      href: "/admin/inventario/categoria/color",
      Icon: Palette,
      color: "from-pink-500 to-pink-600",
    },
    {
      nombre: "Tallas",
      href: "/admin/inventario/categoria/talla",
      Icon: Ruler,
      color: "from-indigo-500 to-indigo-600",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Gestión de Categorías y Atributos
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 ease-in-out bg-gradient-to-br ${item.color}`}
          >
            <div className="p-8 flex flex-col items-center justify-center text-center text-white h-full">
              <item.Icon className="w-16 h-16 mb-4" strokeWidth={1.5} />
              <h2 className="text-2xl font-bold">{item.nombre}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
