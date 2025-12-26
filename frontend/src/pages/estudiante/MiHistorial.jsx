import { useState, useEffect } from 'react';
import { estudiantesService } from '../../services/api';
import { BookMarked, TrendingUp, Award, AlertCircle } from 'lucide-react';

export default function MiHistorial() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const response = await estudiantesService.getMiHistorial();
      setData(response.data.data);
    } catch (err) {
      setError('Error al cargar historial');
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

  // Calculate statistics
  let totalCreditos = 0;
  let creditosAprobados = 0;
  let sumaNotas = 0;
  let countNotas = 0;

  data?.historial?.forEach(m => {
    m.detalles?.forEach(d => {
      if (d.creditos) totalCreditos += d.creditos;
      if (d.estado_nota === 'aprobado' && d.creditos) {
        creditosAprobados += d.creditos;
      }
      if (d.nota_final !== null && d.creditos) {
        sumaNotas += d.nota_final * d.creditos;
        countNotas += d.creditos;
      }
    });
  });

  const promedioGeneral = countNotas > 0 ? (sumaNotas / countNotas).toFixed(2) : '-';

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <BookMarked className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">Historial Académico</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="stat-value">{promedioGeneral}</div>
              <div className="stat-label">Promedio General</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-green-600">{creditosAprobados}</div>
          <div className="stat-label">Créditos Aprobados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalCreditos}</div>
          <div className="stat-label">Créditos Cursados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data?.historial?.length || 0}</div>
          <div className="stat-label">Periodos Cursados</div>
        </div>
      </div>

      {/* Historial */}
      {data?.historial?.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          No tiene historial académico registrado
        </div>
      ) : (
        <div className="space-y-6">
          {data?.historial?.map((matricula, i) => (
            <div key={i} className="card">
              <div className="card-header flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{matricula.periodo_nombre}</h3>
                  <p className="text-sm text-gray-500">Ciclo {matricula.ciclo} | {matricula.turno_nombre}</p>
                </div>
                <span className={`badge ${matricula.estado === 'activa' ? 'badge-success' : matricula.estado === 'finalizada' ? 'badge-info' : 'badge-gray'}`}>
                  {matricula.estado}
                </span>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Unidad Didáctica</th>
                      <th className="text-center">Créditos</th>
                      <th className="text-center">Nota Final</th>
                      <th className="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matricula.detalles?.map((d, j) => (
                      <tr key={j}>
                        <td className="font-mono text-sm">{d.unidad_codigo}</td>
                        <td>{d.unidad_nombre}</td>
                        <td className="text-center">{d.creditos}</td>
                        <td className="text-center">
                          {d.nota_final !== null ? (
                            <span className={`text-lg font-bold ${d.estado_nota === 'aprobado' ? 'text-green-600' : 'text-red-600'}`}>
                              {d.nota_final?.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-center">
                          {d.estado_nota ? (
                            <span className={d.estado_nota === 'aprobado' ? 'badge-success' : 'badge-danger'}>
                              {d.estado_nota === 'aprobado' ? 'Aprobado' : 'Desaprobado'}
                            </span>
                          ) : (
                            <span className="badge-gray">En curso</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
