import { useState, useEffect } from 'react';
import { reportesService, institucionService } from '../../services/api';
import { FileText, AlertCircle } from 'lucide-react';

export default function ReporteNotas() {
  const [periodos, setPeriodos] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [filters, setFilters] = useState({ periodo_id: '', programa_id: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [periodosRes, programasRes] = await Promise.all([
        institucionService.getPeriodos(),
        institucionService.getProgramas()
      ]);
      setPeriodos(periodosRes.data.data);
      setProgramas(programasRes.data.data);

      const activo = periodosRes.data.data.find(p => p.activo);
      if (activo) {
        setFilters(prev => ({ ...prev, periodo_id: activo.id }));
        loadReporte(activo.id, '');
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError('Error al cargar datos');
      setLoading(false);
    }
  };

  const loadReporte = async (periodoId, programaId) => {
    if (!periodoId) return;
    setLoading(true);
    try {
      const response = await reportesService.getReporteNotas(periodoId, programaId);
      setData(response.data.data);
    } catch (err) {
      setError('Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadReporte(filters.periodo_id, filters.programa_id);
  };

  const getNotaBadge = (nota, estado) => {
    if (nota === null || nota === undefined) return <span className="badge-gray">Pendiente</span>;
    if (estado === 'aprobado') return <span className="badge-success">{nota.toFixed(1)}</span>;
    return <span className="badge-danger">{nota.toFixed(1)}</span>;
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-primary-800" />
        <h1 className="text-2xl font-bold text-gray-800">Reporte de Notas por Periodo</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select value={filters.periodo_id} onChange={(e) => setFilters({ ...filters, periodo_id: e.target.value })} className="input">
              <option value="">Seleccionar periodo...</option>
              {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <select value={filters.programa_id} onChange={(e) => setFilters({ ...filters, programa_id: e.target.value })} className="input">
              <option value="">Todos los programas</option>
              {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            <button onClick={handleFilter} className="btn-primary">Generar Reporte</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="stat-card"><div className="stat-value">{data.estadisticas?.total_estudiantes || 0}</div><div className="stat-label">Estudiantes</div></div>
            <div className="stat-card"><div className="stat-value">{data.estadisticas?.total_matriculas_ud || 0}</div><div className="stat-label">Matrículas UD</div></div>
            <div className="stat-card"><div className="stat-value text-green-600">{data.estadisticas?.aprobados || 0}</div><div className="stat-label">Aprobados</div></div>
            <div className="stat-card"><div className="stat-value text-red-600">{data.estadisticas?.desaprobados || 0}</div><div className="stat-label">Desaprobados</div></div>
            <div className="stat-card"><div className="stat-value text-orange-600">{data.estadisticas?.pendientes || 0}</div><div className="stat-label">Pendientes</div></div>
            <div className="stat-card"><div className="stat-value text-primary-600">{data.estadisticas?.promedio_general || '-'}</div><div className="stat-label">Promedio General</div></div>
          </div>

          {/* Detalle */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold">Detalle de Notas</h3>
              <span className="text-sm text-gray-500">{data.notas?.length || 0} registros</span>
            </div>
            <div className="table-container max-h-[500px] overflow-y-auto">
              <table className="table">
                <thead className="sticky top-0">
                  <tr><th>Código</th><th>Estudiante</th><th>DNI</th><th>Programa</th><th>Unidad Didáctica</th><th>Ciclo</th><th>Docente</th><th>Nota Final</th></tr>
                </thead>
                <tbody>
                  {data.notas?.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-8 text-gray-500">No hay registros</td></tr>
                  ) : data.notas?.map((n, i) => (
                    <tr key={i}>
                      <td className="font-mono text-sm">{n.codigo_estudiante}</td>
                      <td>{`${n.apellido_paterno} ${n.apellido_materno || ''}, ${n.nombres}`}</td>
                      <td>{n.dni}</td>
                      <td className="text-sm">{n.programa}</td>
                      <td className="text-sm">{n.unidad_nombre}</td>
                      <td className="text-center">{n.ciclo}</td>
                      <td className="text-sm">{n.docente_nombres ? `${n.docente_apellido}, ${n.docente_nombres}` : '-'}</td>
                      <td>{getNotaBadge(n.nota_final, n.estado_nota)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-500">Seleccione un periodo para ver el reporte</div>
      )}
    </div>
  );
}
