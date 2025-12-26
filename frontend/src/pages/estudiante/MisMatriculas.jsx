import { useState, useEffect } from 'react';
import { estudiantesService } from '../../services/api';
import { FileCheck, Eye, X, AlertCircle, Printer } from 'lucide-react';

export default function MisMatriculas() {
  const [matriculas, setMatriculas] = useState([]);
  const [selectedMatricula, setSelectedMatricula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await estudiantesService.getMisMatriculas();
      setMatriculas(response.data.data);
    } catch (err) {
      setError('Error al cargar matrículas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
    </div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
      <AlertCircle className="w-5 h-5" /> {error}
    </div>;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <FileCheck className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">Fichas de Matrícula</h1>
      </div>

      {/* Detail Modal */}
      {selectedMatricula && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
            <div className="p-6 border-b flex items-center justify-between bg-primary-800 text-white">
              <div>
                <h2 className="text-xl font-semibold">Ficha de Matrícula</h2>
                <p className="text-primary-200">{selectedMatricula.codigo_matricula}</p>
              </div>
              <button onClick={() => setSelectedMatricula(null)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-gray-500 text-sm">Periodo</span>
                  <p className="font-medium">{selectedMatricula.periodo_nombre}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Ciclo</span>
                  <p className="font-medium">{selectedMatricula.ciclo}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Turno</span>
                  <p className="font-medium">{selectedMatricula.turno_nombre}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Condición</span>
                  <p className="font-medium capitalize">{selectedMatricula.condicion}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Fecha Matrícula</span>
                  <p className="font-medium">{selectedMatricula.fecha_matricula?.split('T')[0]}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Estado</span>
                  <span className={`badge ${selectedMatricula.estado === 'activa' ? 'badge-success' : 'badge-gray'}`}>
                    {selectedMatricula.estado}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold mb-3">Unidades Didácticas Matriculadas</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Unidad Didáctica</th>
                    <th className="text-center">Créditos</th>
                    <th className="text-center">H. Teoría</th>
                    <th className="text-center">H. Práctica</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMatricula.detalles?.map((d, i) => (
                    <tr key={i}>
                      <td className="font-mono text-sm">{d.unidad_codigo}</td>
                      <td>{d.unidad_nombre}</td>
                      <td className="text-center">{d.creditos}</td>
                      <td className="text-center">{d.horas_teoria}</td>
                      <td className="text-center">{d.horas_practica}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan="2" className="text-right">Total:</td>
                    <td className="text-center">{selectedMatricula.detalles?.reduce((s, d) => s + (d.creditos || 0), 0)}</td>
                    <td className="text-center">{selectedMatricula.detalles?.reduce((s, d) => s + (d.horas_teoria || 0), 0)}</td>
                    <td className="text-center">{selectedMatricula.detalles?.reduce((s, d) => s + (d.horas_practica || 0), 0)}</td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-6 flex justify-end">
                <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Matriculas List */}
      {matriculas.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          No tiene matrículas registradas
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matriculas.map((m, i) => (
            <div key={i} className="card hover:shadow-md transition-shadow">
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm text-gray-500">{m.codigo_matricula}</span>
                  <span className={`badge ${m.estado === 'activa' ? 'badge-success' : m.estado === 'finalizada' ? 'badge-info' : 'badge-gray'}`}>
                    {m.estado}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{m.periodo_nombre}</h3>
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  <p><strong>Ciclo:</strong> {m.ciclo}</p>
                  <p><strong>Turno:</strong> {m.turno_nombre}</p>
                  <p><strong>Unidades:</strong> {m.detalles?.length || 0}</p>
                  <p><strong>Créditos:</strong> {m.detalles?.reduce((s, d) => s + (d.creditos || 0), 0)}</p>
                </div>
                <button 
                  onClick={() => setSelectedMatricula(m)}
                  className="w-full btn-outline flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Ver Ficha
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
