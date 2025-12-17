"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Store,
  Loader2,
  ClipboardList,
  Search,
} from "lucide-react";
import { UsuarioGet } from "@/types/usuario/usuario";
import { CategoriaTree } from "@/types/categorias/categoria";
import { apiFetcher } from "@/lib/apiFetcher";
import CategoriaDropdown from "./CategoriaDropdown";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UsuarioGet | null>(null);
  const [isMounted, setIsMounted] = useState(false); // <-- ESTADO CLAVE
  const router = useRouter();
  const { itemCount } = useCart(); // <-- 2. Obtener itemCount

  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: categorias,
    error: errorCategorias,
    isLoading: isLoadingCategorias,
  } = useSWR<CategoriaTree[]>("/api/producto/categoria/tree", apiFetcher);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsMobileMenuOpen(false);
      // Redirige a la página de productos con el query param
      router.push(`/producto?buscar=${encodeURIComponent(searchTerm)}`);
    }
  };
  useEffect(() => {
    setIsMounted(true); // Se ejecuta solo en el cliente
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        setUser(JSON.parse(storedUserData));
      } catch (e) {
        console.error("Error al parsear userData", e);
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetcher("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      localStorage.removeItem("userData");
      setUser(null);
      setIsMobileMenuOpen(false);
      router.push("/");
    }
  };

  // Componente para botones de Auth
  const AuthLinks = ({ isMobile = false }) => (
    <>
      {user ? (
        <div
          className={
            isMobile ? "flex flex-col space-y-2" : "flex items-center space-x-4"
          }
        >
          <Link
            href="/cliente/perfil"
            onClick={() => setIsMobileMenuOpen(false)}
            className={
              isMobile
                ? "flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                : "flex items-center text-gray-600 hover:text-blue-600"
            }
            title="Mi Perfil"
          >
            <User className="h-5 w-5" />
            <span className={isMobile ? "ml-2" : "sr-only"}>Mi Perfil</span>
          </Link>
          <Link
            href="/cliente/historial" // <-- ¡NUEVO! (Puedes cambiar la URL)
            onClick={() => setIsMobileMenuOpen(false)}
            className={
              isMobile
                ? "flex items-center rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                : "flex items-center text-gray-600 hover:text-blue-600"
            }
            title="Historial de Compras"
          >
            <ClipboardList className="h-5 w-5" />
            <span className={isMobile ? "ml-2" : "sr-only"}>
              Historial de Compras
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className={
              isMobile
                ? "flex w-full items-center rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                : "flex items-center text-gray-600 hover:text-red-600"
            }
            title="Cerrar Sesión"
          >
            <LogOut className="h-5 w-5" />
            <span className={isMobile ? "ml-2" : "sr-only"}>Cerrar Sesión</span>
          </button>
        </div>
      ) : (
        <div
          className={
            isMobile
              ? "flex flex-col space-y-2 pt-2"
              : "flex items-center space-x-2"
          }
        >
          <Link
            href="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className={
              isMobile
                ? "block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                : "rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            }
          >
            Login
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            className={
              isMobile
                ? "block rounded-md bg-blue-600 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                : "rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            }
          >
            Register
          </Link>
        </div>
      )}
    </>
  );

  // Placeholder para evitar Hydration Mismatch
  const AuthPlaceholder = ({ isMobile = false }) => (
    <div
      className={
        isMobile
          ? "flex flex-col space-y-2 pt-2"
          : "flex items-center space-x-2"
      }
    >
      <div
        className={
          isMobile
            ? "h-[40px] w-full"
            : "h-[36px] w-[60px] rounded-md bg-gray-100"
        }
      />
      <div
        className={
          isMobile
            ? "h-[40px] w-full"
            : "h-[36px] w-[80px] rounded-md bg-gray-100"
        }
      />
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="flex items-center text-2xl font-bold text-gray-900">
                <Store className="mr-2 h-7 w-7 text-blue-600" />
                Trendora
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex items-center md:space-x-8">
              <CategoriaDropdown />
            </div>
          </div>

          {/* --- BARRA DE BÚSQUEDA CENTRAL --- */}
          <div className="flex-1 max-w-lg hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-gray-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
          <div className="hidden items-center space-x-4 md:flex">
            {/* --- 3. MODIFICAR EL ICONO DEL CARRITO --- */}
            <Link
              href="/cliente/carrito" // Apuntar a la nueva página
              className="relative rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              title="Carrito de Compras"
            >
              <ShoppingCart className="h-6 w-6" />
              {isMounted && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

            {/* --- SOLUCIÓN AUTH DESKTOP --- */}
            {isMounted ? (
              <AuthLinks isMobile={false} />
            ) : (
              <AuthPlaceholder isMobile={false} />
            )}
          </div>

          {/* Botón de Menú Móvil */}
          <div className="-mr-2 flex items-center md:hidden">
            <Link
              href="/cliente/carrito" // Apuntar a la nueva página
              className="relative rounded-full bg-white p-2 text-gray-600 hover:bg-gray-100"
              title="Carrito de Compras"
            >
              <ShoppingCart className="h-6 w-6" />
              {isMounted && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menú</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Menú Móvil */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 md:hidden" id="mobile-menu">
          <div className="space-y-1 px-2 pb-3 pt-2">
            <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-400">
              Categorías
            </p>

            {/* --- SOLUCIÓN CATEGORÍAS MÓVIL --- */}
            {isMounted ? (
              <>
                {isLoadingCategorias && (
                  <div className="flex items-center px-3 py-2 text-sm text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando...
                  </div>
                )}
                {errorCategorias && (
                  <div className="px-3 py-2 text-sm text-red-500">
                    Error al cargar
                  </div>
                )}
                {categorias?.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categoria/${cat.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    {cat.nombre}
                  </Link>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">...</div>
            )}
          </div>
          <div className="border-t border-gray-200 px-2 pb-3 pt-2">
            {/* --- SOLUCIÓN AUTH MÓVIL --- */}
            {isMounted ? (
              <AuthLinks isMobile={true} />
            ) : (
              <AuthPlaceholder isMobile={true} />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
