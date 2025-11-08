"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CategoriaTree } from "@/types/categorias/categoria";

interface CategoriaNodeProps {
  categoria: CategoriaTree;
}

export function CategoriaNode({ categoria }: CategoriaNodeProps) {
  // Estado para saber si el nodo está expandido o colapsado
  const [isOpen, setIsOpen] = useState(false);

  const hasChildren = categoria.hijos && categoria.hijos.length > 0;

  const toggleOpen = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="ml-4">
      {/* El contenedor de la categoría actual (ej. "Ropa") */}
      <div 
        onClick={toggleOpen}
        className="flex items-center cursor-pointer p-2 rounded-md hover:bg-gray-100"
      >
        {/* Icono de flecha (solo si tiene hijos) */}
        {hasChildren ? (
          <ChevronRight 
            className={`h-4 w-4 mr-1 transition-transform ${isOpen ? "rotate-90" : ""}`} 
          />
        ) : (
          // Espaciador para alinear
          <span className="w-5 mr-1"></span> 
        )}
        
        {/* Nombre de la categoría */}
        <span className="font-medium">{categoria.nombre}</span>
        
        {/* (Opcional) Botones de Editar/Eliminar */}
        <div className="ml-auto">
          {/* Aquí irían tus botones de acción */}
        </div>
      </div>

      {/* --- ¡LA RECURSIÓN! --- */}
      {/* Si tiene hijos y está abierto, renderiza la lista de hijos */}
      {hasChildren && isOpen && (
        <div className="pl-4 border-l-2 border-gray-200">
          {categoria.hijos.map((hijo) => (
            // Llama a este mismo componente para cada hijo
            <CategoriaNode key={hijo.id} categoria={hijo} />
          ))}
        </div>
      )}
    </div>
  );
}
