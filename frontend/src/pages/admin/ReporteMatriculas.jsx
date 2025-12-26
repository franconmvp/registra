import { useState, useEffect } from 'react';
import { reportesService, institucionService } from '../../services/api';
import { BarChart3, Download, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1e3a5f', '#d4a84b', '#2d508a', '#c49a3e', '#3f6ea7'];

export default function ReporteMatriculas() {
  const [periodos, setPeriodos] = useState([]);
  const [selectedPeriodo, setSelectedPeriodo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadPeriodos(); }, []);

  const loadPeriodos = async () => {
    try {
      const response = await institucionService.getPeriodos();
      setPeriodos(response.data.data);
      const activo = response.data.data.find(p => p.activo);
      if (activo) {
        setSelectedPeriodo(activo.id);
        loadReporte(activo.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError('Error al cargar periodos');
      setLoading(false);
    }
  };

  const loadReporte = async (periodoId) => {
    if (!periodoId) return;
    setLoading(true);
    try {
      const response = await reportesService.getReporteMatricula(periodoId);
      setData(response.data.data);
    } catch (err) {
      setError('Error al cargar reporte');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodoChange = (e) => {
    setSelectedPeriodo(e.target.value);
    loadReporte(e.target.value);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary-800" />
          <h1 className="text-2xl font-bold text-gray-800">Reporte de Matrícula Semestral</h1>
        </div>
        <select value={selectedPeriodo} onChange={handlePeriodoChange} className="input w-auto">
          <option value="">Seleccionar periodo...</option>
          {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="stat-card"><div className="stat-value">{data.resumen?.total_matriculas || 0}</div><div className="stat-label">Total Matrículas</div></div>
            <div className="stat-card"><div className="stat-value text-green-600">{data.resumen?.activas || 0}</div><div className="stat-label">Activas</div></div>
            <div className="stat-card"><div className="stat-value text-red-600">{data.resumen?.anuladas || 0}</div><div className="stat-label">Anuladas</div></div>
            <div className="stat-card"><div className="stat-value text-blue-600">{data.resumen?.regulares || 0}</div><div className="stat-label">Regulares</div></div>
            <div className="stat-card"><div className="stat-value text-orange-600">{data.resumen?.irregulares || 0}</div><div className="stat-label">Irregulares</div></div>
            <div className="stat-card"><div className="stat-value text-purple-600">{data.resumen?.repitentes || 0}</div><div className="stat-label">Repitentes</div></div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header"><h3 className="font-semibold">Por Programa</h3></div>
              <div className="card-body">
                {data.porPrograma?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.porPrograma}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="programa" tick={{ fontSize: 10 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-gray-500 py-8">Sin datos</p>}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 className="font-semibold">Por Género</h3></div>
              <div className="card-body">
                {data.porGenero?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={data.porGenero} cx="50%" cy="50%" labelLine={false}
                        label={({ genero, total }) => `${genero || 'N/E'}: ${total}`}
                        outerRadius={100} dataKey="total">
                        {data.porGenero.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-gray-500 py-8">Sin datos</p>}
              </div>
            </div>
          </div>

          {/* Detalle */}
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <h3 className="font-semibold">Listado Detallado</h3>
              <span className="text-sm text-gray-500">{data.detalle?.length || 0} registros</span>
            </div>
            <div className="table-container max-h-96 overflow-y-auto">
              <table className="table">
                <thead className="sticky top-0">
                  <tr><th>Código Mat.</th><th>Estudiante</th><th>DNI</th><th>Programa</th><th>Ciclo</th><th>Turno</th><th>Condición</th></tr>
                </thead>
                <tbody>
                  {data.detalle?.map((d, i) => (
                    <tr key={i}>
                      <td className="font-mono text-sm">{d.codigo_matricula}</td>
                      <td>{`${d.apellido_paterno} ${d.apellido_materno || ''}, ${d.nombres}`}</td>
                      <td>{d.dni}</td>
                      <td className="text-sm">{d.programa}</td>
                      <td className="text-center">{d.ciclo}</td>
                      <td>{d.turno}</td>
                      <td><span className={`badge ${d.condicion === 'regular' ? 'badge-success' : d.condicion === 'repitente' ? 'badge-danger' : 'badge-warning'}`}>{d.condicion}</span></td>
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
