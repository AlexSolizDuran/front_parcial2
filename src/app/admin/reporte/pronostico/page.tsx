'use client';
import { useState } from 'react';
import { useProductos } from '@/hooks/useProductos';
import { getPronosticoProducto } from '@/lib/apiFetcher';
import Section from '@/components/forms/Section';

export default function PronosticoPage() {
  const { productos, isLoadingProductos } = useProductos();
  
  const [selectedProd, setSelectedProd] = useState<string>('');
  // Nuevo estado para la fecha (por defecto vacía)
  const [selectedDate, setSelectedDate] = useState<string>(''); 
  const [resultado, setResultado] = useState<any>(null);
  const [procesando, setProcesando] = useState(false);

  const consultarIA = async () => {
    if (!selectedProd) return;
    setProcesando(true);
    try {
      // Enviamos ID y Fecha
      const data = await getPronosticoProducto(Number(selectedProd), selectedDate);
      setResultado(data);
    } catch (e) {
      alert("Error al obtener el pronóstico");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
        <span>🔮</span> Centro de Pronósticos IA
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Section title="Configuración" icon={<span>⚙️</span>}>
            <div className="space-y-4">
              
              {/* Selector de Producto */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Producto</label>
                <select 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedProd}
                  onChange={(e) => setSelectedProd(e.target.value)}
                  disabled={isLoadingProductos}
                >
                  <option value="">Seleccione...</option>
                  {productos?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.descripcion}</option>
                  ))}
                </select>
              </div>

              {/* NUEVO: Selector de Fecha */}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Fecha Objetivo</label>
                <input 
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                />
                <p className="text-xs text-gray-400 mt-1">Si lo dejas vacío, se usará mañana.</p>
              </div>

              <button
                onClick={consultarIA}
                disabled={!selectedProd || procesando}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
                  procesando 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                }`}
              >
                {procesando ? 'Analizando...' : 'Generar Pronóstico'}
              </button>
            </div>
          </Section>
        </div>

        {/* ... (La sección de resultados queda igual) ... */}
        <div className="lg:col-span-2">
          <Section title="Resultados" icon={<span>📊</span>}>
            {resultado ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in fade-in zoom-in duration-300">
                <div className="text-8xl font-black text-blue-700">
                  {resultado.prediccion_ventas}
                </div>
                <div className="text-center">
                  <p className="text-gray-500 font-medium tracking-widest uppercase text-sm">
                    Ventas Estimadas
                  </p>
                  {/* Mostramos la fecha analizada si quieres */}
                  {selectedDate && (
                    <p className="text-sm text-blue-500 mt-1 font-semibold">
                      para el {new Date(selectedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="w-full bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-blue-900 font-medium">
                    🤖 {resultado.mensaje}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                <span className="text-4xl mb-2">📅</span>
                <p>Elige fecha y producto para comenzar</p>
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}