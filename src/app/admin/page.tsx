"use client";
import useSWR from "swr";
import { apiFetcher } from "@/lib/apiFetcher";
import {
  Users,
  ShoppingBag,
  Package,
  TrendingUp,
  DollarSign,
} from "lucide-react";
// Importamos los componentes del gráfico
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  cards: {
    totalVentas: number;
    totalProductos: number;
    usuariosRegistrados: number;
  };
  chartData: { fecha: string; total: number }[];
  recentSales: {
    id: number;
    usuario: string;
    total: number;
    fecha: string;
    estado: string;
  }[];
}

export default function AdminDashboardPage() {
  const { data, error } = useSWR<DashboardData>(
    "/api/reportes/dashboard/resumen",
    apiFetcher
  );
  const isLoading = !data && !error;

  // Componente de Tarjeta
  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white overflow-hidden rounded-lg shadow-sm border border-gray-100 p-5 flex items-center">
      <div className={`flex-shrink-0 rounded-full p-3 ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
      </div>
      <div className="ml-5">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="text-2xl font-bold text-gray-900">
          {isLoading ? "..." : value}
        </dd>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>

      {/* 1. TARJETAS SUPERIORES */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Ventas Totales"
          value={data?.cards.totalVentas || 0}
          icon={TrendingUp}
          color="bg-green-500"
        />
        <StatCard
          title="Productos"
          value={data?.cards.totalProductos || 0}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Usuarios"
          value={data?.cards.usuariosRegistrados || 0}
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. GRÁFICO DE BARRAS (Ocupa 2 columnas) */}
        <div className="bg-white shadow-sm rounded-lg p-6 lg:col-span-2 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ingresos: Últimos 7 Días
          </h3>
          <div className="h-72 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                Cargando gráfico...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="fecha"
                    tickFormatter={(str) => str.substring(5)} // Mostrar solo MM-DD
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    // CORRECCIÓN: Usamos 'any' o 'number | undefined' para evitar el error de TS
                    formatter={(value: any) => [`$${value}`, "Ventas"]}
                    labelFormatter={(label) => `Fecha: ${label}`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar dataKey="total" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 3. LISTA DE ACTIVIDAD RECIENTE (Ocupa 1 columna) */}
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Ventas Recientes
          </h3>
          <div className="flow-root">
            <ul role="list" className="-my-5 divide-y divide-gray-200">
              {data?.recentSales.map((venta) => (
                <li key={venta.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        Cliente: {venta.usuario}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(venta.fecha).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="inline-flex items-center text-sm font-semibold text-gray-900">
                      ${venta.total}
                    </div>
                  </div>
                </li>
              ))}
              {!isLoading && data?.recentSales.length === 0 && (
                <p className="text-sm text-gray-500 py-4">
                  No hay ventas recientes.
                </p>
              )}
            </ul>
          </div>
          <div className="mt-6">
            <a
              href="/admin/venta/registro"
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Ver todas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
